/**
 * Ý nghĩa 64 quẻ Kinh Dịch theo Dịch Lý, Việt Dịch, Mai Hoa
 * Nguồn: https://kinhdichluchao.vn/y-nghia-64-que-kinh-dich-theo-dịch-ly-viet-dich-mai-hoa/
 * Key: chuỗi "upper-lower" giống như trong HEXAGRAM_NAME_BY_KEY (ví dụ: "1-1")
 *
 * Data được lưu trong file JSON riêng để tách biệt với source code
 * Bao gồm cả ý nghĩa (meaning) và điềm (omen)
 */

import hexagramMeaningsData from "./hexagramMeanings.json";

export interface HexagramData {
  meaning: string | null;
  omen: string | null;
}

// Import data from JSON file
export const HEXAGRAM_DATA: Record<string, HexagramData> =
  hexagramMeaningsData as Record<string, HexagramData>;

// Backward compatibility: export HEXAGRAM_MEANINGS for existing code
export const HEXAGRAM_MEANINGS: Record<string, string> = Object.fromEntries(
  Object.entries(HEXAGRAM_DATA).map(([key, data]) => [
    key,
    data.meaning || "",
  ])
) as Record<string, string>;

import { getValue, STORES } from "../utils/indexedDB";

/**
 * Get hexagram meaning by hexagram key ("upper-lower")
 * First tries IndexedDB, falls back to memory if IndexedDB is not available
 * This is the async version - use getHexagramMeaningSync for synchronous access
 */
export async function getHexagramMeaning(key: string): Promise<string | null> {
  try {
    // Try IndexedDB first
    const value = await getValue<string>(STORES.HEXAGRAM_MEANINGS, key);
    if (value) {
      return value;
    }
  } catch (error) {
    console.warn(
      "Failed to get from IndexedDB, falling back to memory:",
      error
    );
  }

  // Fallback to memory
  return HEXAGRAM_MEANINGS[key] || null;
}

/**
 * Synchronous version for backward compatibility
 * Uses memory data directly
 * Note: For better performance, use the hook useHexagramMeanings() and getHexagramMeaningCached()
 */
export function getHexagramMeaningSync(key: string): string | null {
  return HEXAGRAM_MEANINGS[key] || null;
}
