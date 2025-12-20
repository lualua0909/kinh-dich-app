/**
 * Hook to load hexagram meanings from IndexedDB and cache in memory
 * Provides synchronous access to cached data
 */

import { useEffect, useState } from "react";
import { getAllValues, STORES } from "../utils/indexedDB";
import hexagramMeaningsData from "../data/hexagramMeanings.json";
import { getHexagramMeaningSync } from "../data/hexagramMeanings";

let globalCache: Record<string, string> | null = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

/**
 * Load all hexagram meanings from IndexedDB into memory cache
 */
async function loadMeaningsIntoCache(): Promise<void> {
  if (globalCache) {
    return; // Already loaded
  }

  if (isLoading && loadPromise) {
    return loadPromise; // Already loading
  }

  isLoading = true;
  loadPromise = (async () => {
    try {
      const meanings = await getAllValues<string>(STORES.HEXAGRAM_MEANINGS);
      if (Object.keys(meanings).length > 0) {
        globalCache = meanings;
      } else {
        // Fallback to memory if IndexedDB is empty
        globalCache = hexagramMeaningsData as Record<string, string>;
      }
    } catch (error) {
      console.warn(
        "Failed to load from IndexedDB, using memory fallback:",
        error
      );
      globalCache = hexagramMeaningsData as Record<string, string>;
    } finally {
      isLoading = false;
    }
  })();

  return loadPromise;
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

    loadMeaningsIntoCache().then(() => {
      setIsReady(true);
    });
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
