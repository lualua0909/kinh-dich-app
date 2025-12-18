/**
 * 64 Hexagrams (Lục Thập Tứ Quẻ) data
 * Each hexagram is composed of upper and lower trigrams
 */

import { TRIGRAMS } from "./trigrams";

export interface Hexagram {
  id: number;
  name: string;
  vietnameseName: string;
  upperTrigram: number;
  lowerTrigram: number;
  lines: [number, number, number, number, number, number]; // bottom to top (hào 1 to hào 6)
  family: string; // Họ quẻ
}

// Common hexagram names in Vietnamese, keyed by "upper-lower"
export const HEXAGRAM_NAME_BY_KEY: Record<string, string> = {
  // BÁT THUẦN
  "1-1": "BÁT THUẦN CÀN",
  "2-2": "BÁT THUẦN ĐOÀI",
  "3-3": "BÁT THUẦN LY",
  "4-4": "BÁT THUẦN CHẤN",
  "5-5": "BÁT THUẦN TỐN",
  "6-6": "BÁT THUẦN KHẢM",
  "7-7": "BÁT THUẦN CẤN",
  "0-0": "BÁT THUẦN KHÔN",

  // THƯỢNG CÀN
  "1-2": "THIÊN TRẠCH LÝ",
  "1-3": "THIÊN HỎA ĐỒNG NHÂN",
  "1-4": "THIÊN LÔI VÔ VỌNG",
  "1-5": "THIÊN PHONG CẤU",
  "1-6": "THIÊN THỦY TỤNG",
  "1-7": "THIÊN SƠN ĐỘN",
  "1-0": "THIÊN ĐỊA BỈ",

  // THƯỢNG ĐOÀI
  "2-1": "TRẠCH THIÊN QUẢI",
  "2-3": "TRẠCH HỎA CÁCH",
  "2-4": "TRẠCH LÔI TÙY",
  "2-5": "TRẠCH PHONG ĐẠI QUÁ",
  "2-6": "TRẠCH THỦY KHỐN",
  "2-7": "TRẠCH SƠN HÀM",
  "2-0": "TRẠCH ĐỊA TUỴ",

  // THƯỢNG LY
  "3-1": "HỎA THIÊN ĐẠI HỮU",
  "3-2": "HỎA TRẠCH KHUÊ",
  "3-4": "HỎA LÔI PHỆ HẠP",
  "3-5": "HỎA PHONG ĐỈNH",
  "3-6": "HỎA THỦY VỊ TẾ",
  "3-7": "HỎA SƠN LỮ",
  "3-0": "HỎA ĐỊA TẤN",

  // THƯỢNG CHẤN
  "4-1": "LÔI THIÊN ĐẠI TRÁNG",
  "4-2": "LÔI TRẠCH QUY MUỘI",
  "4-3": "LÔI HỎA PHONG",
  "4-5": "LÔI PHONG HẰNG",
  "4-6": "LÔI THỦY GIẢI",
  "4-7": "LÔI SƠN TIỂU QUÁ",
  "4-0": "LÔI ĐỊA DỰ",

  // THƯỢNG TỐN
  "5-1": "PHONG THIÊN TIỂU SÚC",
  "5-2": "PHONG TRẠCH TRUNG PHU",
  "5-3": "PHONG HỎA GIA NHÂN",
  "5-4": "PHONG LÔI ÍCH",
  "5-6": "PHONG THỦY HOÁN",
  "5-7": "PHONG SƠN TIỆM",
  "5-0": "PHONG ĐỊA QUAN",

  // THƯỢNG KHẢM
  "6-1": "THỦY THIÊN NHU",
  "6-2": "THỦY TRẠCH TIẾT",
  "6-3": "THỦY HỎA KÝ TẾ",
  "6-4": "THỦY LÔI TRUÂN",
  "6-5": "THỦY PHONG TỈNH",
  "6-7": "THỦY SƠN KIỂN",
  "6-0": "THỦY ĐỊA TỶ",

  // THƯỢNG CẤN
  "7-1": "SƠN THIÊN ĐẠI SÚC",
  "7-2": "SƠN TRẠCH TỔN",
  "7-3": "SƠN HỎA BÍ",
  "7-4": "SƠN LÔI DI",
  "7-5": "SƠN PHONG CỔ",
  "7-6": "SƠN THỦY MÔNG",
  "7-0": "SƠN ĐỊA BÁC",

  // THƯỢNG KHÔN
  "0-1": "ĐỊA THIÊN THÁI",
  "0-2": "ĐỊA TRẠCH LÂM",
  "0-3": "ĐỊA HỎA MINH DI",
  "0-4": "ĐỊA LÔI PHỤC",
  "0-5": "ĐỊA PHONG THĂNG",
  "0-6": "ĐỊA THỦY SƯ",
  "0-7": "ĐỊA SƠN KHIÊM"
};

// Reverse lookup: từ tên quẻ → key "upper-lower"
export const HEXAGRAM_KEY_BY_NAME: Record<string, string> = Object.keys(
  HEXAGRAM_NAME_BY_KEY
).reduce((acc, key) => {
  const name = HEXAGRAM_NAME_BY_KEY[key];
  acc[name] = key;
  return acc;
}, {} as Record<string, string>);

/**
 * Generate all 64 hexagrams
 * Upper trigram (1-8) × Lower trigram (1-8) = 64 combinations
 */
function generateHexagrams(): Record<string, Hexagram> {
  const hexagrams: Record<string, Hexagram> = {};
  let id = 1;

  // Generate all combinations
  for (let upper = 0; upper <= 7; upper++) {
    const upperKey = upper === 0 ? 0 : upper;
    for (let lower = 0; lower <= 7; lower++) {
      const lowerKey = lower === 0 ? 0 : lower;
      const key = `${upperKey}-${lowerKey}`;
      const upperTrigram = TRIGRAMS[upperKey];
      const lowerTrigram = TRIGRAMS[lowerKey];

      // Combine lines: lower first (hào 1-3), then upper (hào 4-6)
      const lines: [number, number, number, number, number, number] = [
        lowerTrigram.lines[0], // hào 1
        lowerTrigram.lines[1], // hào 2
        lowerTrigram.lines[2], // hào 3
        upperTrigram.lines[0], // hào 4
        upperTrigram.lines[1], // hào 5
        upperTrigram.lines[2] // hào 6
      ];

      // Determine family (Họ quẻ) based on upper trigram
      const familyMap: Record<number, string> = {
        1: "HỌ CÀN",
        2: "HỌ ĐOÀI",
        3: "HỌ LY",
        4: "HỌ CHẤN",
        5: "HỌ TỐN",
        6: "HỌ KHẢM",
        7: "HỌ CẤN",
        0: "HỌ KHÔN"
      };

      // Generate name: if not in predefined list, use trigram combination
      const defaultName = `${upperTrigram.vietnameseName} ${lowerTrigram.vietnameseName}`;
      const hexagramName = HEXAGRAM_NAME_BY_KEY[key] || defaultName;

      hexagrams[key] = {
        id: id++,
        name: hexagramName,
        vietnameseName: hexagramName,
        upperTrigram: upperKey,
        lowerTrigram: lowerKey,
        lines,
        family: familyMap[upperKey] || "HỌ CÀN"
      };
    }
  }

  return hexagrams;
}

export const HEXAGRAMS = generateHexagrams();

/**
 * Get hexagram by upper and lower trigram IDs
 */
export function getHexagram(
  upperTrigram: number,
  lowerTrigram: number
): Hexagram | null {
  const key = `${upperTrigram}-${lowerTrigram}`;
  return HEXAGRAMS[key] || null;
}
