package expo.modules.appblocker

import android.accessibilityservice.AccessibilityService
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.accessibility.AccessibilityEvent
/*
    Inherit from AccessibilityService to deliver accessibility events through this API
*/
class BlockerService : AccessibilityService() {

    private val handler = Handler(Looper.getMainLooper())
    private var receiverRegistered = false

    // Re-anchors the clock every minute (only while a commitment is running).
    private val checkpointTask = object : Runnable {
        override fun run() {
            BlockState.checkpoint(this@BlockerService)
            handler.postDelayed(this, CHECKPOINT_INTERVAL_MS)
        }
    }

    private val shutdownReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            BlockState.markShuttingDown()
            BlockState.checkpoint(context, sync = true)
            Log.d(TAG, "Shutdown checkpoint saved")
        }
    }
    
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
        // Nothing to clean up for now.
    }


    /* 
        This is called when the accessibility service is connected
    */
    override fun onServiceConnected() {
        super.onServiceConnected()
        BlockState.noteBlockingResumed(this)
        BlockState.checkpoint(this, sync = true) // after a reboot, this rebases the clock
        startBackgroundWork()
        Log.d(TAG, "Service connected")
    }


    /* 
        Android calls this when the user turns the service off. 
    */
    override fun onUnbind(intent: Intent?): Boolean {
        stopBackgroundWork()
        BlockState.noteBlockingStopped(this)
        Log.d(TAG, "Service unbound")
        return super.onUnbind(intent)
    }

    
    override fun onDestroy() {
        stopBackgroundWork()
        BlockState.noteBlockingStopped(this) // idempotent
        super.onDestroy()
    }

    private fun startBackgroundWork() {
        handler.removeCallbacks(checkpointTask)
        handler.postDelayed(checkpointTask, CHECKPOINT_INTERVAL_MS)

        if (!receiverRegistered) {
            val filter = IntentFilter(Intent.ACTION_SHUTDOWN)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                registerReceiver(shutdownReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
            } else {
                registerReceiver(shutdownReceiver, filter)
            }
            receiverRegistered = true
        }
    }

    private fun stopBackgroundWork() {
        handler.removeCallbacks(checkpointTask)
        if (receiverRegistered) {
            try {
                unregisterReceiver(shutdownReceiver)
            } catch (e: IllegalArgumentException) {
                // Already unregistered.
            }
            receiverRegistered = false
        }
    }

    private companion object {
        const val TAG = "FreeUrBrain"
        const val CHECKPOINT_INTERVAL_MS = 60_000L
        val NEVER_BLOCK = setOf("com.android.settings", "com.android.systemui")
    }
}