package expo.modules.appblocker

import android.accessibilityservice.AccessibilityService
import android.util.Log
import android.view.accessibility.AccessibilityEvent


/*
    Inherit from AccessibilityService to deliver accessibility events through this API
*/
class BlockerService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val pkg = event.packageName?.toString() ?: return

        // Never interfere with ourselves or the system UI.
        if (pkg == packageName || pkg in NEVER_BLOCK) return

        if (BlockState.shouldBlock(this, pkg)) {
            Log.d(TAG, "Blocked $pkg") // for debugging
            /*
                if the package is blocked then we redirect user to 
                HOME SCREEN, making it difficult to access it (basic app interruption, not undefeatable blocking)
            */
            performGlobalAction(GLOBAL_ACTION_HOME) // an API provided by AccessibilityService
        }
    }

    override fun onInterrupt() {
        // Nothing to clean up in the MVP.
    }


    /* 
        This is called when the accessibility service is connected
    */
    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "Service connected")
    }

    private companion object {
        const val TAG = "FreeUrBrain"
        val NEVER_BLOCK = setOf("com.android.settings", "com.android.systemui")
    }
}