/**
 * Line (Hào) interpretation data
 * Contains information for each line in the hexagram
 */

import { HEXAGRAMS, HEXAGRAM_KEY_BY_NAME } from "./hexagrams";
import hexagramSpecificDataJson from "./hexagramSpecificData.json";

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
  // Data được lưu trong file JSON riêng để tách biệt với source code
  const hexagramSpecificData: Record<
    string,
    {
      lucThan?: string[];
      canChi?: string[];
      phucThan?: string[];
      tuanKhong?: string[];
      lucTu?: string[];
      theUng?: {
        the: number;
        ung: number;
      };
    }
  > = hexagramSpecificDataJson as Record<
    string,
    {
      lucThan?: string[];
      canChi?: string[];
      phucThan?: string[];
      tuanKhong?: string[];
      lucTu?: string[];
      theUng?: {
        the: number;
        ung: number;
      };
    }
  >;

  // Tìm quẻ theo id để áp dụng vị trí Thế / Ứng
  const hexagram =
    Object.values(HEXAGRAMS).find((h) => h.id === hexagramId) || null;

  // Mặc định: Thế tại hào 6, Ứng tại hào 3 (tính TỪ DƯỚI LÊN: hào 1 → 6)
  const defaultThe = 6;
  const defaultUng = 3;

  const key =
    hexagram != null
      ? `${hexagram.upperTrigram}-${hexagram.lowerTrigram}`
      : null;

  // Lưu ý: các giá trị `the` / `ung` trong `hexagramSpecificData`
  // được khai báo THEO THỨ TỰ TỪ DƯỚI LÊN (hào 1 → 6),
  // nên có thể dùng trực tiếp, không cần đảo lại.
  const specificData = key ? hexagramSpecificData[key] : null;
  const config = specificData?.theUng || null;

  const theHao = config?.the || defaultThe;
  const ungHao = config?.ung || defaultUng;

  const theUngMapForHexagram: Record<number, number> = {};
  if (theHao) theUngMapForHexagram[theHao] = 1;
  if (ungHao) theUngMapForHexagram[ungHao] = 2;

  for (let i = 1; i <= 6; i++) {
    const index = (hexagramId + i - 1) % 6;

    // Sử dụng dữ liệu cụ thể nếu có, nếu không thì dùng dữ liệu mặc định
    // Lưu ý: các mảng trong hexagramSpecificData được khai báo THEO THỨ TỰ
    // TỪ TRÊN XUỐNG (hào 6 → 1). Trong khi ở đây i chạy từ DƯỚI LÊN (hào 1 → 6),
    // nên cần đảo lại: indexTrongMang = 6 - i.
    const specificIndex = 6 - i; // 0..5

    const lucThan = specificData?.lucThan
      ? specificData.lucThan[specificIndex]
      : [];
    const canChi = specificData?.canChi
      ? specificData.canChi[specificIndex]
      : [];
    const phucThan = specificData?.phucThan
      ? specificData.phucThan[specificIndex] || ""
      : phucThanOptions[index] || "";
    const tuanKhong = specificData?.tuanKhong
      ? specificData.tuanKhong[specificIndex] || ""
      : tuanKhongOptions[index] || "";
    const lucTu = specificData?.lucTu ? specificData.lucTu[specificIndex] : [];

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
