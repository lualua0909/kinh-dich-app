/**
 * Dụng Thần (Useful God) data
 * Contains detailed information about each dụng thần
 * 
 * Data được lưu trong file JSON riêng để tách biệt với source code
 */

import dungThanData from "./dungThan.json";

export interface DungThanInfo {
  value: string;
  label: string;
  description: string;
  vaiVe: string;
  doDung: string;
  mangTinhChat: string;
  thoiTiet: string;
  coThe: string;
  suVat: string;
  triTheCat: string;
  triTheKhongCat: string;
}

// Import data from JSON file
export const DUNG_THAN_DATA: Record<string, DungThanInfo> = dungThanData as Record<string, DungThanInfo>;

export function getDungThanInfo(value: string): DungThanInfo | null {
  return DUNG_THAN_DATA[value] || null;
}

