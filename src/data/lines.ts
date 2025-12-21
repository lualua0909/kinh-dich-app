/**
 * Line (Hào) interpretation data
 * Contains information for each line in the hexagram
 */

import { HEXAGRAMS, HEXAGRAM_KEY_BY_NAME } from "./hexagrams";
import hexagramSpecificDataJson from "./hexagramSpecificData.json";
import { calculateLucTu, extractThienCan, LucTu } from "../utils/lucTu";
import { calculateTuanKhongForAllLines } from "../utils/tuanKhong";

export interface LineData {
  hao: number; // 1-6
  theUng: string; // Thế ứng
  lucThan: string; // Lục Thân (Six Relations)
  canChi: string; // Can Chi
  lucTu: string; // Lục Tú (Six Animals) - tính từ Thiên Can ngày
  phucThan: string; // Phục thần
  tuanKhong: string; // Tuần không - tính toán theo quy tắc riêng
}

/**
 * Generate line data for a hexagram
 *
 * @param hexagramId - ID của quẻ (0-63)
 * @param dayCanChi - Can Chi của ngày xem quẻ (ví dụ: "Giáp Tý", "Nhâm Tuất")
 *                    Dùng để tính Lục Thú (dựa trên Thiên Can) và Tuần Không (dựa trên Can Chi)
 */
export function generateLineData(
  hexagramId: number,
  dayCanChi?: string
): LineData[] {
  const lines: LineData[] = [];

  // Phục thần - cần logic phức tạp hơn, tạm thời để placeholder
  const phucThanOptions = ["", "", "", "", "", ""];

  // Tính Lục Thú dựa trên Thiên Can ngày
  let lucTuArray: LucTu[] = [];
  if (dayCanChi) {
    const thienCan = extractThienCan(dayCanChi);
    if (thienCan) {
      lucTuArray = calculateLucTu(thienCan);
    }
  }

  // Dữ liệu cụ thể cho từng quẻ (key: "upper-lower")
  // Nếu có dữ liệu cụ thể, sẽ override dữ liệu mặc định
  // Data được lưu trong file JSON riêng để tách biệt với source code
  // Lưu ý: tuanKhong và lucTu đã được xóa khỏi JSON, sẽ tính toán động
  const hexagramSpecificData: Record<
    string,
    {
      lucThan?: string[];
      canChi?: string[];
      phucThan?: string[];
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

  // Thu thập Can Chi của 6 hào trước để tính Tuần Không
  const lineCanChiList: (string | null)[] = [];
  for (let i = 1; i <= 6; i++) {
    const index = (hexagramId + i - 1) % 6;
    const specificIndex = 6 - i; // 0..5
    const canChi = specificData?.canChi
      ? specificData.canChi[specificIndex]
      : [];
    const canChiStr = Array.isArray(canChi) ? canChi.join(" ") : canChi;
    lineCanChiList.push(canChiStr || null);
  }

  // Tính Tuần Không cho tất cả 6 hào dựa trên dayCanChi (ngày xem quẻ)
  const tuanKhongArray = dayCanChi
    ? calculateTuanKhongForAllLines(lineCanChiList, dayCanChi)
    : ["", "", "", "", "", ""];

  // Tạo dữ liệu cho từng hào
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

    // Tuần không - tính từ ngày Can Chi (ngày xem quẻ)
    // tuanKhongArray có 6 phần tử tương ứng hào 1-6, index 0-5
    const tuanKhong = tuanKhongArray[i - 1] || "";

    // Lục Thú - tính từ Thiên Can ngày (hào 1-6 tương ứng index 0-5)
    // lucTuArray có 6 phần tử tương ứng hào 1-6, index 0-5
    const lucTu =
      lucTuArray.length === 6 && i >= 1 && i <= 6 ? lucTuArray[i - 1] : "";

    lines.push({
      hao: i,
      theUng: theUngMapForHexagram[i]?.toString() || "",
      lucThan: Array.isArray(lucThan) ? lucThan.join(" ") : lucThan,
      canChi: Array.isArray(canChi) ? canChi.join(" ") : canChi,
      lucTu: lucTu || "",
      phucThan,
      tuanKhong
    });
  }

  return lines;
}
