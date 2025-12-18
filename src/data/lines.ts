/**
 * Line (Hào) interpretation data
 * Contains information for each line in the hexagram
 */

import { HEXAGRAMS, HEXAGRAM_KEY_BY_NAME } from "./hexagrams";

export interface LineData {
  hao: number; // 1-6
  theUng: string; // Thế ứng
  lucThan: string; // Lục Thân (Six Relations)
  canChi: string; // Can Chi
  lucTu: string; // Lục Tú (Six Animals)
  phucThan: string; // Phục thần
  tuanKhong: string; // Tuần không
}

/**
 * Generate line data for a hexagram
 * This is a simplified version - in real practice, this would be more complex
 */
export function generateLineData(hexagramId: number): LineData[] {
  const lines: LineData[] = [];

  // Phục thần và Tuần không - cần logic phức tạp hơn, tạm thời để placeholder
  const phucThanOptions = ["", "", "", "", "", ""];
  const tuanKhongOptions = ["", "", "", "", "", ""];

  // Dữ liệu cụ thể cho từng quẻ (key: "upper-lower")
  // Nếu có dữ liệu cụ thể, sẽ override dữ liệu mặc định
  const hexagramSpecificData: Record<
    string,
    {
      lucThan?: string[];
      canChi?: string[];
      phucThan?: string[];
      tuanKhong?: string[];
      lucTu?: string[];
    }
  > = {
    "0-0": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "0-1": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "0-2": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "0-3": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "0-4": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "0-5": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "0-6": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "0-7": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "1-0": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "1-1": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "1-2": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "1-3": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "1-4": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "1-5": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "1-6": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "1-7": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "2-0": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "2-1": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "2-2": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "2-3": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "2-4": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "2-5": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "2-6": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "2-7": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "3-0": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "3-1": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "3-2": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "3-3": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "3-4": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "3-5": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "3-6": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "3-7": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "4-0": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "4-1": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "4-2": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "4-3": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "4-4": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "4-5": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "4-6": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "4-7": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "5-0": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "5-1": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "5-2": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "5-3": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "5-4": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "5-5": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "5-6": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "5-7": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "6-0": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "6-1": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "6-2": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "6-3": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "6-4": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "6-5": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "6-6": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "6-7": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "7-0": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "7-1": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "7-2": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "7-3": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "7-4": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "7-5": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "7-6": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
    "7-7": {
      lucThan: ["PM", "HD", "QQ", "PM", "TTi", "TT"],
      canChi: [
        "Nhâm Tuất",
        "Nhâm Thân",
        "Nhâm Ngọ",
        "Giáp Thìn",
        "Giáp Dần",
        "Giáp Tý",
      ],
      phucThan: ["", "", "", "", "", ""],
      tuanKhong: ["", "", "", "", "", "K"],
      lucTu: ["BH", "DX", "CTr", "CT", "TL", "HV"],
    },
  };

  // Vị trí Thế / Ứng cho từng quẻ (key: "upper-lower")
  const hexagramTheUngByKey: Record<
    string,
    {
      the: number;
      ung: number;
    }
  > = {
    // Bát Thuần Quẻ (8 pure hexagrams)
    "1-1": { the: 6, ung: 3 }, // BÁT THUẦN CÀN
    "2-2": { the: 6, ung: 3 }, // BÁT THUẦN ĐOÀI
    "3-3": { the: 6, ung: 3 }, // BÁT THUẦN LY
    "4-4": { the: 6, ung: 3 }, // BÁT THUẦN CHẤN
    "5-5": { the: 6, ung: 5 }, // BÁT THUẦN TỐN
    "6-6": { the: 6, ung: 3 }, // BÁT THUẦN KHẢM
    "7-7": { the: 6, ung: 3 }, // BÁT THUẦN CẤN
    "0-0": { the: 6, ung: 3 }, // BÁT THUẦN KHÔN

    // Hỏa Thượng
    "3-7": { the: 6, ung: 3 }, // HỎA SƠN LỮ
    "3-5": { the: 6, ung: 5 }, // HỎA PHONG ĐỈNH
    "3-6": { the: 4, ung: 3 }, // HỎA THỦY VỊ TẾ
    "3-0": { the: 4, ung: 1 }, // HỎA ĐỊA TẤN
    "3-1": { the: 3, ung: 6 }, // HỎA THIÊN ĐẠI HỮU
    "3-4": { the: 5, ung: 2 }, // HỎA LÔI PHỆ HẠP
    "3-2": { the: 4, ung: 1 }, // HỎA TRẠCH KHUÊ

    // Sơn Thượng
    "7-6": { the: 4, ung: 2 }, // SƠN THỦY MÔNG
    "7-0": { the: 5, ung: 2 }, // SƠN ĐỊA BÁC
    "7-4": { the: 4, ung: 1 }, // SƠN LÔI DI
    "7-5": { the: 3, ung: 6 }, // SƠN PHONG CỔ
    "7-3": { the: 2, ung: 5 }, // SƠN HỎA BÍ
    "7-1": { the: 1, ung: 4 }, // SƠN THIÊN ĐẠI SÚC
    "7-2": { the: 3, ung: 6 }, // SƠN TRẠCH TỔN

    // Phong Thượng
    "5-6": { the: 5, ung: 1 }, // PHONG THỦY HOÁN
    "5-0": { the: 4, ung: 1 }, // PHONG ĐỊA QUAN
    "5-3": { the: 2, ung: 5 }, // PHONG HỎA GIA NHÂN
    "5-4": { the: 3, ung: 6 }, // PHONG LÔI ÍCH
    "5-2": { the: 4, ung: 1 }, // PHONG TRẠCH TRUNG PHU
    "5-7": { the: 3, ung: 6 }, // PHONG SƠN TIỆM
    "5-1": { the: 1, ung: 4 }, // PHONG THIÊN TIỂU SÚC

    // Thiên Thượng
    "1-6": { the: 2, ung: 5 }, // THIÊN THỦY TỤNG
    "1-3": { the: 3, ung: 6 }, // THIÊN HỎA ĐỒNG NHÂN
    "1-5": { the: 1, ung: 4 }, // THIÊN PHONG CẤU
    "1-7": { the: 2, ung: 5 }, // THIÊN SƠN ĐỘN
    "1-0": { the: 3, ung: 6 }, // THIÊN ĐỊA BỈ
    "1-4": { the: 4, ung: 1 }, // THIÊN LÔI VÔ VỌNG
    "1-2": { the: 5, ung: 2 }, // THIÊN TRẠCH LÝ

    // Địa Thượng
    "0-4": { the: 1, ung: 4 }, // ĐỊA LÔI PHỤC
    "0-2": { the: 1, ung: 4 }, // ĐỊA TRẠCH LÂM
    "0-1": { the: 4, ung: 6 }, // ĐỊA THIÊN THÁI
    "0-5": { the: 4, ung: 1 }, // ĐỊA PHONG THĂNG
    "0-7": { the: 5, ung: 2 }, // ĐỊA SƠN KHIÊM
    "0-3": { the: 4, ung: 1 }, // ĐỊA HỎA MINH DI
    "0-6": { the: 3, ung: 6 }, // ĐỊA THỦY SƯ

    // Lôi Thượng
    "4-1": { the: 4, ung: 2 }, // LÔI THIÊN ĐẠI TRÁNG
    "4-7": { the: 4, ung: 1 }, // LÔI SƠN TIỂU QUÁ
    "4-2": { the: 3, ung: 6 }, // LÔI TRẠCH QUY MUỘI
    "4-0": { the: 1, ung: 4 }, // LÔI ĐỊA DỰ
    "4-6": { the: 2, ung: 5 }, // LÔI THỦY GIẢI
    "4-5": { the: 3, ung: 6 }, // LÔI PHONG HẰNG
    "4-3": { the: 5, ung: 2 }, // LÔI HỎA PHONG

    // Trạch Thượng
    "2-1": { the: 5, ung: 1 }, // TRẠCH THIÊN QUẢI
    "2-6": { the: 1, ung: 4 }, // TRẠCH THỦY KHỐN
    "2-0": { the: 2, ung: 5 }, // TRẠCH ĐỊA TUỴ
    "2-7": { the: 3, ung: 6 }, // TRẠCH SƠN HÀM
    "2-5": { the: 4, ung: 1 }, // TRẠCH PHONG ĐẠI QUÁ
    "2-4": { the: 3, ung: 6 }, // TRẠCH LÔI TÙY
    "2-3": { the: 4, ung: 1 }, // TRẠCH HỎA CÁCH

    // Thủy Thượng
    "6-1": { the: 4, ung: 1 }, // THỦY THIÊN NHU
    "6-0": { the: 3, ung: 6 }, // THỦY ĐỊA TỶ
    "6-7": { the: 4, ung: 1 }, // THỦY SƠN KIỂN
    "6-5": { the: 5, ung: 2 }, // THỦY PHONG TỈNH
    "6-2": { the: 1, ung: 4 }, // THỦY TRẠCH TIẾT
    "6-4": { the: 2, ung: 5 }, // THỦY LÔI TRUÂN
    "6-3": { the: 3, ung: 6 }, // THỦY HỎA KÝ TẾ
  };

  // Tìm quẻ theo id để áp dụng vị trí Thế / Ứng
  const hexagram =
    Object.values(HEXAGRAMS).find((h) => h.id === hexagramId) || null;

  const defaultThe = 6;
  const defaultUng = 3;

  const key =
    hexagram != null
      ? `${hexagram.upperTrigram}-${hexagram.lowerTrigram}`
      : null;

  const config = (key && hexagramTheUngByKey[key]) || null;

  const theHaoFromTop = config?.the || defaultThe;
  const ungHaoFromTop = config?.ung || defaultUng;

  // Chuyển đổi từ số hào đếm từ trên xuống sang số hào đếm từ dưới lên
  // Công thức: hào_từ_dưới_lên = 7 - hào_từ_trên_xuống
  const theHao = 7 - theHaoFromTop;
  const ungHao = 7 - ungHaoFromTop;

  const theUngMapForHexagram: Record<number, number> = {};
  if (theHao) theUngMapForHexagram[theHao] = 1;
  if (ungHao) theUngMapForHexagram[ungHao] = 2;

  // Kiểm tra xem có dữ liệu cụ thể cho quẻ này không
  const specificData = key ? hexagramSpecificData[key] : null;

  for (let i = 1; i <= 6; i++) {
    const index = (hexagramId + i - 1) % 6;

    // Sử dụng dữ liệu cụ thể nếu có, nếu không thì dùng dữ liệu mặc định
    const lucThan = specificData?.lucThan ? specificData.lucThan[i - 1] : [];
    const canChi = specificData?.canChi ? specificData.canChi[i - 1] : [];
    const phucThan = specificData?.phucThan
      ? specificData.phucThan[i - 1] || ""
      : phucThanOptions[index] || "";
    const tuanKhong = specificData?.tuanKhong
      ? specificData.tuanKhong[i - 1] || ""
      : tuanKhongOptions[index] || "";
    const lucTu = specificData?.lucTu ? specificData.lucTu[i - 1] : [];

    lines.push({
      hao: i,
      theUng: theUngMapForHexagram[i]?.toString() || "",
      lucThan: Array.isArray(lucThan) ? lucThan.join(" ") : lucThan,
      canChi: Array.isArray(canChi) ? canChi.join(" ") : canChi,
      lucTu: Array.isArray(lucTu) ? lucTu.join(" ") : lucTu,
      phucThan,
      tuanKhong,
    });
  }

  return lines;
}
