import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { reconcileBlocking } from '@/core/commitment/CommitmentManager';
import { colors } from '@/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  // Keep native blocking state consistent with the persisted commitment,
  // on launch and whenever the app returns to the foreground.
  useEffect(() => {
    const run = () => {
      reconcileBlocking().catch((e) => {
        if (__DEV__) console.warn('[reconcile] failed', e);
      });
    };

    run();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });
    return () => sub.remove();
  }, []);

  // Fonts are bundled with the app, so this is a very short blank frame.
  if (!fontsLoaded) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 200,
        contentStyle: { backgroundColor: colors.white },
      }}
    />
  );
}
