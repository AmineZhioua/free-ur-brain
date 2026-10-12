package expo.modules.appblocker

import android.content.Context
import android.content.SharedPreferences
import android.os.SystemClock
import android.provider.Settings

data class LapseSummary(val count: Int, val totalMs: Long)

/**
 * Native source of truth for what is blocked and how much time is left.
 * Time is measured with the monotonic SystemClock.elapsedRealtime(), so changing the
 * device's date/time cannot shorten a commitment.
 */
object BlockState {

    /**
     * After a reboot: how much wall-clock time (between the last checkpoint and the new boot)
     * may be credited. 0 = strict: the wall clock is never trusted, and time while the phone
     * is off does not count. Raise it (e.g. 5 * 60_000L) to forgive short reboots.
     */
    private const val OFF_TIME_CREDIT_CAP_MS = 0L

    private const val NONE = -1L

    private const val KEY_PACKAGES = "block_packages"
    private const val KEY_ID = "block_commitment_id"
    private const val KEY_REMAINING = "block_remaining_ms"
    private const val KEY_CP_ELAPSED = "block_cp_elapsed"
    private const val KEY_CP_WALL = "block_cp_wall"
    private const val KEY_CP_BOOT = "block_cp_boot"

    private const val KEY_LAPSE_ID = "lapse_commitment_id"
    private const val KEY_LAPSE_OPEN_REMAINING = "lapse_open_remaining_ms"
    private const val KEY_LAPSE_TOTAL_MS = "lapse_total_ms"
    private const val KEY_LAPSE_COUNT = "lapse_count"

    // Wall-clock keys from earlier versions; removed on stop().
    private val LEGACY_KEYS = listOf("block_ends_at", "lapse_ends_at", "lapse_open_since")

    /** Set by the shutdown broadcast so that going down is not recorded as an interruption. */
    @Volatile
    var shuttingDown = false
        private set

    fun markShuttingDown() {
        shuttingDown = true
    }

    private data class Timing(
        val commitmentId: Long,
        val remainingMs: Long, // remaining at the checkpoint
        val cpElapsed: Long,
        val cpWall: Long,
        val cpBoot: Int,
    )

    private data class Lapse(val openRemainingMs: Long, val totalMs: Long, val count: Int)

    /* ---------------- clock ---------------- */

    private var cachedBootCount: Int? = null

    /** Constant for the lifetime of a process, because a reboot kills the process. */
    private fun bootCount(context: Context): Int {
        cachedBootCount?.let { return it }
        val value = try {
            Settings.Global.getInt(context.contentResolver, Settings.Global.BOOT_COUNT, -1)
        } catch (e: Exception) {
            -1
        }
        cachedBootCount = value
        return value
    }

    private fun remainingOf(context: Context, t: Timing): Long {
        val nowElapsed = SystemClock.elapsedRealtime()
        val nowBoot = bootCount(context)

        val sameBoot = if (t.cpBoot >= 0 && nowBoot >= 0) {
            t.cpBoot == nowBoot
        } else {
            nowElapsed >= t.cpElapsed // fallback: elapsed time only goes backwards across a reboot
        }

        val remaining = if (sameBoot) {
            t.remainingMs - (nowElapsed - t.cpElapsed)
        } else {
            // Rebooted since the checkpoint. We only know the phone has run for nowElapsed
            // since the new boot; the off time counts only up to the (default 0) cap.
            val offGap = (System.currentTimeMillis() - nowElapsed - t.cpWall)
                .coerceIn(0L, OFF_TIME_CREDIT_CAP_MS)
            t.remainingMs - offGap - nowElapsed
        }

        return remaining.coerceIn(0L, t.remainingMs)
    }

    private fun SharedPreferences.Editor.putCheckpoint(
        context: Context,
        remainingMs: Long,
    ): SharedPreferences.Editor =
        putLong(KEY_REMAINING, remainingMs)
            .putLong(KEY_CP_ELAPSED, SystemClock.elapsedRealtime())
            .putLong(KEY_CP_WALL, System.currentTimeMillis())
            .putInt(KEY_CP_BOOT, bootCount(context))

    private fun readTiming(prefs: SharedPreferences): Timing? {
        if (!prefs.contains(KEY_ID)) return null
        return Timing(
            commitmentId = prefs.getLong(KEY_ID, 0L),
            remainingMs = prefs.getLong(KEY_REMAINING, 0L),
            cpElapsed = prefs.getLong(KEY_CP_ELAPSED, 0L),
            cpWall = prefs.getLong(KEY_CP_WALL, 0L),
            cpBoot = prefs.getInt(KEY_CP_BOOT, -1),
        )
    }

    /* ---------------- blocking state ---------------- */

    /**
     * Idempotent per commitment: calling it again with the same id only refreshes the
     * packages and the checkpoint; it never restarts the clock.
     */
    fun start(context: Context, packages: Set<String>, durationMs: Long, commitmentId: Long) {
        require(packages.isNotEmpty()) { "No packages to block." }
        require(durationMs > 0) { "Duration must be positive." }

        val prefs = Prefs.get(context)
        val existing = readTiming(prefs)
        val editor = prefs.edit().putStringSet(KEY_PACKAGES, HashSet(packages))

        if (existing != null && existing.commitmentId == commitmentId) {
            editor.putCheckpoint(context, remainingOf(context, existing))
        } else {
            // A new commitment: the clock starts now.
            editor.putLong(KEY_ID, commitmentId).putCheckpoint(context, durationMs)
            clearLapse(editor)
        }

        check(editor.commit()) { "Could not persist the blocking state." }
    }

    fun stop(context: Context) {
        val editor = Prefs.get(context).edit()
            .remove(KEY_PACKAGES)
            .remove(KEY_ID)
            .remove(KEY_REMAINING)
            .remove(KEY_CP_ELAPSED)
            .remove(KEY_CP_WALL)
            .remove(KEY_CP_BOOT)
        clearLapse(editor)
        LEGACY_KEYS.forEach { editor.remove(it) }

        check(editor.commit()) { "Could not clear the blocking state." }
    }

    /** Remaining time of this commitment, or -1 if native has no timing for it. */
    fun remainingMs(context: Context, commitmentId: Long): Long {
        val t = readTiming(Prefs.get(context)) ?: return -1L
        if (t.commitmentId != commitmentId) return -1L
        return remainingOf(context, t)
    }

    fun shouldBlock(context: Context, packageName: String): Boolean {
        val prefs = Prefs.get(context)

        val t = readTiming(prefs) ?: return false
        if (remainingOf(context, t) <= 0L) return false // finished

        val packages = prefs.getStringSet(KEY_PACKAGES, null) ?: return false
        return packageName in packages
    }

    /** Re-anchors the clock. Cheap, and bounds how much time a reboot can lose. */
    fun checkpoint(context: Context, sync: Boolean = false) {
        val prefs = Prefs.get(context)
        val t = readTiming(prefs) ?: return
        if (t.remainingMs == 0L) return // already finished

        val editor = prefs.edit().putCheckpoint(context, remainingOf(context, t))
        if (sync) editor.commit() else editor.apply()
    }

    /* ---------------- lapse tracking ---------------- */

    /** The service was disconnected during a commitment (e.g. Accessibility turned off). */
    fun noteBlockingStopped(context: Context) {
        if (shuttingDown) return // the phone is going down, not a user-made interruption

        val prefs = Prefs.get(context)
        val t = readTiming(prefs) ?: return

        val remaining = remainingOf(context, t)
        if (remaining <= 0L) return // commitment is over

        val lapse = readLapse(prefs, t.commitmentId)
        if (lapse.openRemainingMs != NONE) return // already recorded

        writeLapse(
            prefs,
            t.commitmentId,
            Lapse(openRemainingMs = remaining, totalMs = lapse.totalMs, count = lapse.count + 1),
        )
    }

    /** The service connected again: close the open lapse, if any. */
    fun noteBlockingResumed(context: Context) {
        val prefs = Prefs.get(context)
        val t = readTiming(prefs) ?: return

        val lapse = readLapse(prefs, t.commitmentId)
        if (lapse.openRemainingMs == NONE) return

        // Measured on the commitment's own clock, so the wall clock never matters.
        val interrupted = (lapse.openRemainingMs - remainingOf(context, t)).coerceAtLeast(0L)
        writeLapse(
            prefs,
            t.commitmentId,
            Lapse(openRemainingMs = NONE, totalMs = lapse.totalMs + interrupted, count = lapse.count),
        )
    }

    fun lapseSummary(context: Context, commitmentId: Long): LapseSummary {
        val prefs = Prefs.get(context)
        val t = readTiming(prefs)
        if (t == null || t.commitmentId != commitmentId) return LapseSummary(0, 0L)

        val lapse = readLapse(prefs, commitmentId)
        val openMs = if (lapse.openRemainingMs != NONE) {
            (lapse.openRemainingMs - remainingOf(context, t)).coerceAtLeast(0L)
        } else {
            0L
        }

        return LapseSummary(count = lapse.count, totalMs = lapse.totalMs + openMs)
    }

    private fun readLapse(prefs: SharedPreferences, commitmentId: Long): Lapse {
        if (prefs.getLong(KEY_LAPSE_ID, 0L) != commitmentId) return Lapse(NONE, 0L, 0)

        return Lapse(
            openRemainingMs = prefs.getLong(KEY_LAPSE_OPEN_REMAINING, NONE),
            totalMs = prefs.getLong(KEY_LAPSE_TOTAL_MS, 0L),
            count = prefs.getInt(KEY_LAPSE_COUNT, 0),
        )
    }

    private fun writeLapse(prefs: SharedPreferences, commitmentId: Long, lapse: Lapse) {
        prefs.edit()
            .putLong(KEY_LAPSE_ID, commitmentId)
            .putLong(KEY_LAPSE_OPEN_REMAINING, lapse.openRemainingMs)
            .putLong(KEY_LAPSE_TOTAL_MS, lapse.totalMs)
            .putInt(KEY_LAPSE_COUNT, lapse.count)
            .commit()
    }

    private fun clearLapse(editor: SharedPreferences.Editor) {
        editor.remove(KEY_LAPSE_ID)
            .remove(KEY_LAPSE_OPEN_REMAINING)
            .remove(KEY_LAPSE_TOTAL_MS)
            .remove(KEY_LAPSE_COUNT)
    }
}