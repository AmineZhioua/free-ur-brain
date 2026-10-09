import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { InstalledApp } from '@/core/models/InstalledApp';
import { AppBlocker } from '@/native/AppBlocker';
import { loadSelectedPackages, saveSelectedPackages } from '@/core/selection/selection';
import { AppListItem } from '@/components/AppListItem';


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
        const [installed, saved] = await Promise.all([
          AppBlocker.getInstalledApps(),
          loadSelectedPackages(),
        ]);
        if (cancelled) return;

        // Drop saved packages that are no longer installed.
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
  }, []);

  const toggle = useCallback((packageName: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(packageName)) next.delete(packageName);
      else next.add(packageName);
      return next;
    });
  }, []);

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

  const canContinue = selected.size > 0 && !saving;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select apps to block</Text>

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

      <Pressable
        style={[styles.button, !canContinue && styles.buttonDisabled]}
        disabled={!canContinue}
        onPress={onContinue}
      >
        <Text style={styles.buttonText}>
          {selected.size > 0 ? `Continue (${selected.size} selected)` : 'Select at least one app'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
  list: { flex: 1 },
  loading: { marginTop: 32 },
  error: { color: '#B00020' },
  button: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#BDBDBD' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});