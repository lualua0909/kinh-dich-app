/**
 * Hexagram Omens data
 * Contains the omen (điềm) for each hexagram
 * 
 * Data được lưu trong file JSON chung với hexagramMeanings để tách biệt với source code
 */

import { HEXAGRAM_DATA } from "./hexagramMeanings";

export function getHexagramOmen(key: string): string | null {
  return HEXAGRAM_DATA[key]?.omen || null;
}
