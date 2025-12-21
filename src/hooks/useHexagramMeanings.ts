/**
 * Hook to load hexagram meanings from memory and cache
 * Provides synchronous access to cached data
 */

import { useEffect, useState } from "react";
import hexagramMeaningsData from "../data/hexagramMeanings.json";
import { getHexagramMeaningSync, HexagramData } from "../data/hexagramMeanings";

let globalCache: Record<string, string> | null = null;

/**
 * Load all hexagram meanings from memory into cache
 */
function loadMeaningsIntoCache(): void {
  if (globalCache) {
    return; // Already loaded
  }

  // Convert new structure to old format for backward compatibility
  const data = hexagramMeaningsData as Record<string, HexagramData>;
  globalCache = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value.meaning || ""])
  ) as Record<string, string>;
}

/**
 * Hook to ensure hexagram meanings are loaded
 * Returns true when data is ready
 */
export function useHexagramMeanings(): boolean {
  const [isReady, setIsReady] = useState(!!globalCache);

  useEffect(() => {
    if (globalCache) {
      setIsReady(true);
      return;
    }

    // Load synchronously from memory
    loadMeaningsIntoCache();
    setIsReady(true);
  }, []);

  return isReady;
}

/**
 * Get hexagram meaning synchronously from cache
 * Use this after useHexagramMeanings() returns true
 */
export function getHexagramMeaningCached(key: string): string | null {
  if (!globalCache) {
    // Fallback to sync version from memory
    return getHexagramMeaningSync(key);
  }
  return globalCache[key] || null;
}
