import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBlocker } from '../native/AppBlocker';
import type { InstalledApp } from '../core/models/InstalledApp';
import { AppListItem } from '../components/AppListItem';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { loadSelectedPackages, saveSelectedPackages } from '../core/selection/selection';
import { loadCommitment } from '../core/commitment/CommitmentManager';
import { colors, type } from '../theme';

export default function AppsScreen() {
  const router = useRouter();
  const [apps, setApps] = useState<InstalledApp[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [installed, saved, commitment] = await Promise.all([
          AppBlocker.getInstalledApps(),
          loadSelectedPackages(),
          loadCommitment(),
        ]);
        if (cancelled) return;

        // The app list cannot be edited while a commitment exists.
        if (commitment) {
          router.replace('/commitment');
          return;
        }

        const installedSet = new Set(installed.map((a) => a.packageName));
        setApps(installed);
        setSelected(new Set(saved.filter((p) => installedSet.has(p))));
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message ?? e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const toggle = useCallback((packageName: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(packageName)) next.delete(packageName);
      else next.add(packageName);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setSelected(new Set()), []);

  const onContinue = async () => {
    setSaving(true);
    try {
      await saveSelectedPackages(Array.from(selected));
      router.back();
    } catch (e: any) {
      setError(String(e?.message ?? e));
      setSaving(false);
    }
  };

  return (
    <Screen
      footer={
        <Button
          label={selected.size > 0 ? `Continue (${selected.size} selected)` : 'Continue with no apps'}
          icon="arrowRight"
          disabled={saving || !apps}
          onPress={onContinue}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Select apps to block</Text>
          <Text style={styles.sub}>
            {selected.size === 0 ? 'Tap the apps that pull you away.' : `${selected.size} selected`}
          </Text>
        </View>
        {selected.size > 0 && (
          <Pressable onPress={clearAll} hitSlop={12} accessibilityRole="button">
            {({ pressed }) => <Text style={[styles.clear, pressed && styles.clearPressed]}>Clear all</Text>}
          </Pressable>
        )}
      </View>

      {error && <Text style={styles.error}>Something went wrong: {error}</Text>}
      {!apps && !error && <ActivityIndicator style={styles.loading} color={colors.blue} />}

      {apps && (
        <FlatList
          data={apps}
          keyExtractor={(a) => a.packageName}
          extraData={selected}
          renderItem={({ item }) => (
            <AppListItem app={item} selected={selected.has(item.packageName)} onToggle={toggle} />
          )}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  headerText: { flex: 1, gap: 4 },
  title: { ...type.title, color: colors.ink },
  sub: { ...type.small, color: colors.inkMuted },
  clear: { ...type.bodyStrong, color: colors.danger, paddingTop: 6 },
  clearPressed: { opacity: 0.6 },
  list: { flex: 1 },
  loading: { marginTop: 32 },
  error: { ...type.small, color: colors.danger },
});
