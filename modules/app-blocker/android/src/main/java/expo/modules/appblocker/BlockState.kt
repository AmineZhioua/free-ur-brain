package expo.modules.appblocker

import android.content.Context

/**
 * The native source of truth for "what is blocked and until when".
 * Written by the Expo module, read by BlockerService, never by JS directly.
 */
object BlockState {
    private const val KEY_PACKAGES = "block_packages"
    private const val KEY_ENDS_AT = "block_ends_at"

    fun start(context: Context, packages: Set<String>, endsAt: Long) {
        require(packages.isNotEmpty()) { "No apps to block." }
        require(endsAt > System.currentTimeMillis()) { "End time must be in the future." }

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
}