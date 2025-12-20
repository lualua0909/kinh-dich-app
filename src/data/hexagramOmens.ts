/**
 * Hexagram Omens data
 * Contains the omen (điềm) for each hexagram
 * 
 * Data được lưu trong file JSON riêng để tách biệt với source code
 */

import hexagramOmensData from "./hexagramOmens.json";

// Import data from JSON file
const HEXAGRAM_OMENS: Record<string, string> = hexagramOmensData as Record<string, string>;

export function getHexagramOmen(key: string): string | null {
  return HEXAGRAM_OMENS[key] || null;
}
