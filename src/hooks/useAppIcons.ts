import { useEffect, useState } from 'react';
import { AppBlocker } from '../native/AppBlocker';

type IconMap = ReadonlyMap<string, string>;

const EMPTY: IconMap = new Map();
let cache: Promise<IconMap> | null = null;

function loadIcons(): Promise<IconMap> {
  if (!cache) {
    cache = AppBlocker.getInstalledApps()
      .then((apps) => new Map(apps.map((a) => [a.packageName, a.icon])) as IconMap)
      .catch((e) => {
        cache = null; // try again next time
        throw e;
      });
  }
  return cache;
}

/**
 * Package name -> PNG data URI for the real app icons. Read-only, display only.
 * Empty until loaded; callers fall back to a letter tile for missing icons.
 */
export function useAppIcons(): IconMap {
  const [icons, setIcons] = useState<IconMap>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    loadIcons()
      .then((m) => {
        if (!cancelled) setIcons(m);
      })
      .catch(() => {
        // Icons are decoration. Failing to load them must never affect the screen.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return icons;
}
