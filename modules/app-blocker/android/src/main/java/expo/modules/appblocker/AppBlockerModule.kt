package expo.modules.appblocker

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.Drawable
import android.os.Build
import android.provider.Settings
import android.util.Base64
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import java.io.ByteArrayOutputStream

class InstalledAppRecord(
    @Field val packageName: String = "",
    @Field val label: String = "",
    @Field val icon: String = "",
) : Record

class AppBlockerModule : Module() {

    private val context: Context
        get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

    private val prefs
        get() = Prefs.get(context)

    override fun definition() = ModuleDefinition {
        AsyncFunction("isPermissionGranted") {
            isServiceEnabled()
        }

        AsyncFunction("requestPermission") {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        }

        AsyncFunction("getInstalledApps") {
            getInstalledApps()
        }

        // Local key-value store (shared with BlockerService)
        AsyncFunction("storageGetItem") { key: String ->
            prefs.getString(key, null)
        }

        AsyncFunction("storageSetItem") { key: String, value: String ->
            // commit() = written to disk before we return.
            prefs.edit().putString(key, value).commit()
            Unit
        }

        AsyncFunction("storageRemoveItem") { key: String ->
            prefs.edit().remove(key).commit()
            Unit
        }

        // Blocking (enforced by BlockerService)
        AsyncFunction("startBlocking") { packageNames: List<String>, durationMs: Double, commitmentId: Double ->
            BlockState.start(context, packageNames.toSet(), durationMs.toLong(), commitmentId.toLong())
        }

        AsyncFunction("stopBlocking") {
            BlockState.stop(context)
        }

        // Remaining time on the monotonic clock; -1 if native has no timing for this commitment.
        AsyncFunction("getRemainingMs") { commitmentId: Double ->
            BlockState.remainingMs(context, commitmentId.toLong())
        }

        AsyncFunction("getLapseSummary") { commitmentId: Double ->
            val summary = BlockState.lapseSummary(context, commitmentId.toLong())
            mapOf("count" to summary.count.toLong(), "totalMs" to summary.totalMs)
        }
    }

    
    /*
        Function to determine whether the FreeUrBrain's accessibility service
        is enabled or not.
    */
    private fun isServiceEnabled(): Boolean {
        /* 
            Get the list of accessibility-enabled services. If Accessibility setting isn't available
            then we return FALSE 
        */
        val enabled = Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false

        // our BlockerService's component name
        val expected = ComponentName(context, BlockerService::class.java)

        // Check if any of these services is the BlockerService. This returns TRUE or FALSE
        return enabled
            .split(':')
            .mapNotNull { ComponentName.unflattenFromString(it) }
            .any { it == expected }
    }


    /*
        Function to return a list of launchable apps that FreeUrBrain can display
        in its selection screen. Both "settings" & "FreeUrBrain" are excluded from the list.
    */
    private fun getInstalledApps(): List<InstalledAppRecord> {
        // PackageManager provides info about installed packages
        val pm = context.packageManager

        // Common way to discover apps on user's device
        val launcherIntent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
        val homeIntent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)

        // Never offer: ourselves, Settings, or any home launcher.
        val excluded = buildSet {
            add(context.packageName)
            add("com.android.settings") // Hard-coded, this may vary across Android versions & device manufacturers
            pm.queryActivities(homeIntent).forEach { add(it.activityInfo.packageName) }
        }

        return pm.queryActivities(launcherIntent) // This asks Android's package manager for activities that match the launcher intent.
            .filter { it.activityInfo.packageName !in excluded } // exclude unwanted packages e.g: Settings
            .distinctBy { it.activityInfo.packageName } // deduplication because an app can expose more than one launcher activity
            .map { info ->
                InstalledAppRecord(
                    packageName = info.activityInfo.packageName,
                    label = info.loadLabel(pm).toString(),
                    icon = info.loadIcon(pm).toBase64Png(ICON_SIZE_PX),
                )
            }
            .sortedBy { it.label.lowercase() } // sort the apps alphabetically
    }


    /*
        Call the appropriate version of queryIntentActivities API
    */
    private fun PackageManager.queryActivities(intent: Intent): List<ResolveInfo> =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            queryIntentActivities(intent, PackageManager.ResolveInfoFlags.of(0))
        } else {
            @Suppress("DEPRECATION")
            queryIntentActivities(intent, 0)
        }

        
    private fun Drawable.toBase64Png(size: Int): String {
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        setBounds(0, 0, size, size)
        draw(canvas)

        val out = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        bitmap.recycle()

        return "data:image/png;base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
    }

    
    private companion object {
        const val ICON_SIZE_PX = 96
    }
}
