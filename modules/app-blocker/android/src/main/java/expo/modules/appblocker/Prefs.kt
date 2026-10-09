package expo.modules.appblocker

import android.content.Context
import android.content.SharedPreferences

/**
 * Single place that knows the name of the local store, shared by the
 * Expo module (JS side) and BlockerService.
 */
object Prefs {
    const val FILE = "freeurbrain_prefs"

    fun get(context: Context): SharedPreferences =
        context.getSharedPreferences(FILE, Context.MODE_PRIVATE)
}