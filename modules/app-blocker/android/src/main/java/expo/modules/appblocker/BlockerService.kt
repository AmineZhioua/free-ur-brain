package expo.modules.appblocker

import android.accessibilityservice.AccessibilityService
import android.util.Log
import android.view.accessibility.AccessibilityEvent

class BlockerService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val pkg = event.packageName?.toString() ?: return

        // Never block ourselves.
        if (pkg == packageName) return

        if (pkg in BLOCKED_PACKAGES) {
            Log.d(TAG, "Blocked $pkg")
            performGlobalAction(GLOBAL_ACTION_HOME)
        }
    }

    override fun onInterrupt() {
        // Nothing to clean up in the MVP.
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "Service connected")
    }

    private companion object {
        const val TAG = "FreeUrBrain"

        // MILESTONE 2 ONLY: hard-coded for testing.
        // Replaced by persisted state in Milestone 6.
        val BLOCKED_PACKAGES = setOf("com.google.android.youtube")
    }
}