package expo.modules.appblocker

import android.content.Context
import android.content.SharedPreferences

data class LapseSummary(val count: Int, val totalMs: Long)

/**
 * The native source of truth for "what is blocked and until when",
 * plus a record of times blocking was interrupted during a commitment.
 * Written by the Expo module and BlockerService, never by JS directly.
 */
object BlockState {
    private const val KEY_PACKAGES = "block_packages"
    private const val KEY_ENDS_AT = "block_ends_at"

    // Lapse data is tagged with the endsAt of the commitment it belongs to.
    private const val KEY_LAPSE_ENDS_AT = "lapse_ends_at"
    private const val KEY_LAPSE_OPEN_SINCE = "lapse_open_since"
    private const val KEY_LAPSE_TOTAL_MS = "lapse_total_ms"
    private const val KEY_LAPSE_COUNT = "lapse_count"

    private data class Lapse(val openSince: Long, val totalMs: Long, val count: Int)

    /* ---------------- blocking state ---------------- */

    fun start(context: Context, packages: Set<String>, endsAt: Long) {
        require(packages.isNotEmpty()) { "No packages to block." }
        require(endsAt > System.currentTimeMillis()) { "endsAt must be in the future." }

        // Both values go to disk in a single commit.
        val saved = Prefs.get(context).edit()
            .putStringSet(KEY_PACKAGES, HashSet(packages))
            .putLong(KEY_ENDS_AT, endsAt)
            .commit()

        check(saved) { "Could not persist the blocking state." }
    }

    fun stop(context: Context) {
        val saved = Prefs.get(context).edit()
            .remove(KEY_PACKAGES)
            .remove(KEY_ENDS_AT)
            .commit()

        check(saved) { "Could not clear the blocking state." }
    }

    fun shouldBlock(
        context: Context,
        packageName: String,
        now: Long = System.currentTimeMillis(),
    ): Boolean {
        val prefs = Prefs.get(context)

        val endsAt = prefs.getLong(KEY_ENDS_AT, 0L)
        if (now >= endsAt) return false // expired, or nothing stored

        val packages = prefs.getStringSet(KEY_PACKAGES, null) ?: return false
        return packageName in packages
    }

    /* ---------------- lapse tracking ---------------- */

    /** The service was disconnected (e.g. Accessibility turned off) during a commitment. */
    fun noteBlockingStopped(context: Context, now: Long = System.currentTimeMillis()) {
        val prefs = Prefs.get(context)
        val endsAt = prefs.getLong(KEY_ENDS_AT, 0L)
        if (now >= endsAt) return // no active commitment

        val lapse = readLapse(prefs, endsAt)
        if (lapse.openSince != 0L) return // already recorded

        writeLapse(prefs, endsAt, Lapse(openSince = now, totalMs = lapse.totalMs, count = lapse.count + 1))
    }

    /** The service connected again: close the open lapse, if there is one. */
    fun noteBlockingResumed(context: Context, now: Long = System.currentTimeMillis()) {
        val prefs = Prefs.get(context)
        val endsAt = prefs.getLong(KEY_ENDS_AT, 0L)
        if (endsAt == 0L) return

        val lapse = readLapse(prefs, endsAt)
        if (lapse.openSince == 0L) return

        val interrupted = (minOf(now, endsAt) - lapse.openSince).coerceAtLeast(0L)
        writeLapse(prefs, endsAt, Lapse(openSince = 0L, totalMs = lapse.totalMs + interrupted, count = lapse.count))
    }

    /** Lapses for the commitment that ends at [commitmentEndsAt]. */
    fun lapseSummary(
        context: Context,
        commitmentEndsAt: Long,
        now: Long = System.currentTimeMillis(),
    ): LapseSummary {
        val lapse = readLapse(Prefs.get(context), commitmentEndsAt)

        val openMs = if (lapse.openSince != 0L) {
            (minOf(now, commitmentEndsAt) - lapse.openSince).coerceAtLeast(0L)
        } else {
            0L
        }

        return LapseSummary(count = lapse.count, totalMs = lapse.totalMs + openMs)
    }

    private fun readLapse(prefs: SharedPreferences, endsAt: Long): Lapse {
        // Data that belongs to another commitment does not count.
        if (prefs.getLong(KEY_LAPSE_ENDS_AT, 0L) != endsAt) return Lapse(0L, 0L, 0)

        return Lapse(
            openSince = prefs.getLong(KEY_LAPSE_OPEN_SINCE, 0L),
            totalMs = prefs.getLong(KEY_LAPSE_TOTAL_MS, 0L),
            count = prefs.getInt(KEY_LAPSE_COUNT, 0),
        )
    }

    private fun writeLapse(prefs: SharedPreferences, endsAt: Long, lapse: Lapse) {
        prefs.edit()
            .putLong(KEY_LAPSE_ENDS_AT, endsAt)
            .putLong(KEY_LAPSE_OPEN_SINCE, lapse.openSince)
            .putLong(KEY_LAPSE_TOTAL_MS, lapse.totalMs)
            .putInt(KEY_LAPSE_COUNT, lapse.count)
            .commit()
    }
}