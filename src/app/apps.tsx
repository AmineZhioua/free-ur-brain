import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { InstalledApp } from '@/core/models/InstalledApp';
import { AppBlocker } from '@/native/AppBlocker';
import { loadSelectedPackages, saveSelectedPackages } from '@/core/selection/selection';
import { AppListItem } from '@/components/AppListItem';
import { loadCommitment } from '@/core/commitment/CommitmentManager';
import { Button } from '@/components/Button';
import { colors } from '@/theme';
import { Screen } from '@/components/Screen';


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
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Select apps to block</Text>
        {selected.size > 0 && (
          <Pressable onPress={clearAll} hitSlop={8} accessibilityRole="button">
            <Text style={styles.clear}>Clear all</Text>
          </Pressable>
        )}
      </View>

      {error && <Text style={styles.error}>Something went wrong: {error}</Text>}
      {!apps && !error && <ActivityIndicator style={styles.loading} />}

      {apps && (
        <FlatList
          data={apps}
          keyExtractor={(a) => a.packageName}
          extraData={selected}
          renderItem={({ item }) => (
            <AppListItem
              app={item}
              selected={selected.has(item.packageName)}
              onToggle={toggle}
            />
          )}
          style={styles.list}
        />
      )}

      <Button
        label={selected.size > 0 ? `Continue (${selected.size} selected)` : 'Continue with no apps'}
        disabled={saving || !apps}
        onPress={onContinue}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, flexShrink: 1 },
  clear: { fontSize: 16, color: colors.danger, fontWeight: '600' },
  list: { flex: 1 },
  loading: { marginTop: 32 },
  error: { color: colors.danger },
});