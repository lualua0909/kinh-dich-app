/**
 * Data migration utility
 * Migrates large data from memory to IndexedDB
 */

import {
  setMultipleValues,
  hasData,
  STORES,
} from "./indexedDB";
import hexagramMeaningsData from "../data/hexagramMeanings.json";
import { HexagramData } from "../data/hexagramMeanings";

/**
 * Migrate hexagram meanings to IndexedDB
 */
export async function migrateHexagramMeanings(): Promise<void> {
  try {
    // Check if data already exists
    const exists = await hasData(STORES.HEXAGRAM_MEANINGS);
    if (exists) {
      console.log("Hexagram meanings already migrated to IndexedDB");
      return;
    }

    // Convert hexagramMeaningsData to array of entries
    // Extract only meaning for backward compatibility with IndexedDB structure
    const data = hexagramMeaningsData as Record<string, HexagramData>;
    const entries = Object.entries(data).map(([key, value]) => ({
      key,
      value: value.meaning || "",
    }));

    // Store in IndexedDB
    await setMultipleValues(STORES.HEXAGRAM_MEANINGS, entries);
    console.log(`Migrated ${entries.length} hexagram meanings to IndexedDB`);
  } catch (error) {
    console.error("Error migrating hexagram meanings:", error);
    throw error;
  }
}

/**
 * Initialize all data migrations
 */
export async function initializeDataMigrations(): Promise<void> {
  try {
    await migrateHexagramMeanings();
    // Add more migrations here for future long content
  } catch (error) {
    console.error("Error initializing data migrations:", error);
    // Don't throw - allow app to continue with fallback to memory
  }
}

