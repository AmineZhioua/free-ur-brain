package expo.modules.appblocker

import android.content.ComponentName
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

/**
 * Removes notifications posted by blocked apps while a commitment is running.
 *
 * Like BlockerService, it asks BlockState (the native source of truth) and does not depend on
 * React Native. It only looks at which app posted a notification and at its key; it never reads,
 * stores or forwards the notification's content.
 */
class NotificationBlockerService : NotificationListenerService() {

    override fun onListenerConnected() {
        super.onListenerConnected()
        instance = this
        sweep() // hide what is already in the shade
        Log.d(TAG, "Notification listener connected")
    }

    override fun onListenerDisconnected() {
        if (instance === this) instance = null
        Log.d(TAG, "Notification listener disconnected")
        // Ask the system to bind us again (a no-op if the user revoked the access).
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            try {
                requestRebind(ComponentName(this, NotificationBlockerService::class.java))
            } catch (e: Exception) {
                Log.w(TAG, "requestRebind failed", e)
            }
        }
        super.onListenerDisconnected()
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn != null) dismissIfBlocked(sbn)
    }

    private fun dismissIfBlocked(sbn: StatusBarNotification) {
        val pkg = sbn.packageName ?: return

        // Never interfere with ourselves or the system.
        if (pkg == packageName || pkg in NEVER_BLOCK) return
        if (!BlockState.shouldBlock(this, pkg)) return

        try {
            cancelNotification(sbn.key)
            Log.d(TAG, "Dismissed a notification from $pkg")
        } catch (e: SecurityException) {
            // Access was revoked while we were working.
            Log.w(TAG, "Could not dismiss a notification", e)
        }
    }

    /** Dismisses every currently shown notification that belongs to a blocked app. */
    private fun sweep() {
        val active = try {
            activeNotifications
        } catch (e: SecurityException) {
            null
        } ?: return

        active.forEach { dismissIfBlocked(it) }
    }

    companion object {
        private const val TAG = "FreeUrBrain"
        private val NEVER_BLOCK = setOf("com.android.settings", "com.android.systemui")

        @Volatile
        private var instance: NotificationBlockerService? = null

        /** Called when a commitment starts. Does nothing if the listener is not connected yet. */
        fun sweepNow() {
            instance?.sweep()
        }
    }
}
