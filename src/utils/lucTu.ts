/**
 * Tính Lục Thú (Lục Thần) cho quẻ Dịch dựa trên Thiên Can của ngày gieo quẻ
 * 
 * Quy tắc:
 * - Lục Thú chỉ phụ thuộc Thiên Can ngày, không phụ thuộc Địa Chi, Dụng Thần, Quẻ chủ/quẻ biến
 * - Lục Thú được an từ Sơ hào (hào 1) lên Hào 6
 */

export type LucTu = "TL" | "CT" | "CTr" | "DX" | "BH" | "HV";

export type ThienCan =
  | "Giáp"
  | "Ất"
  | "Bính"
  | "Đinh"
  | "Mậu"
  | "Kỷ"
  | "Canh"
  | "Tân"
  | "Nhâm"
  | "Quý";

/**
 * Map Lục Thú code sang tên đầy đủ
 */
export const LUC_TU_NAMES: Record<LucTu, string> = {
  TL: "Thanh Long",
  CT: "Chu Tước",
  CTr: "Câu Trần",
  DX: "Đằng Xà",
  BH: "Bạch Hổ",
  HV: "Huyền Vũ",
};

/**
 * Xác định nhóm Thiên Can
 * Gộp Thiên Can theo 5 nhóm:
 * - Giáp / Ất
 * - Bính / Đinh
 * - Mậu
 * - Kỷ
 * - Canh / Tân
 * - Nhâm / Quý
 */
function getThienCanGroup(can: ThienCan): string {
  if (can === "Giáp" || can === "Ất") return "GIAP_AT";
  if (can === "Bính" || can === "Đinh") return "BINH_DINH";
  if (can === "Mậu") return "MU";
  if (can === "Kỷ") return "KY";
  if (can === "Canh" || can === "Tân") return "CANH_TAN";
  if (can === "Nhâm" || can === "Quý") return "NHAM_QUY";
  throw new Error(`Thiên Can không hợp lệ: ${can}`);
}

/**
 * Tính Lục Thú cho 6 hào dựa trên Thiên Can ngày
 * 
 * @param dayHeavenlyStem - Thiên Can của ngày gieo quẻ (ví dụ: "Giáp", "Ất", "Bính", ...)
 * @returns Mảng 6 phần tử tương ứng 6 hào (từ Sơ hào → Hào 6)
 */
export function calculateLucTu(dayHeavenlyStem: ThienCan): LucTu[] {
  const group = getThienCanGroup(dayHeavenlyStem);

  // Bảng an Lục Thú theo nhóm Thiên Can
  const lucTuMap: Record<string, LucTu[]> = {
    // Nhóm Giáp / Ất
    GIAP_AT: ["TL", "CT", "CTr", "DX", "BH", "HV"],

    // Nhóm Bính / Đinh
    BINH_DINH: ["CT", "CTr", "DX", "BH", "HV", "TL"],

    // Nhóm Mậu
    MU: ["CTr", "DX", "BH", "HV", "TL", "CT"],

    // Nhóm Kỷ
    KY: ["DX", "BH", "HV", "TL", "CT", "CTr"],

    // Nhóm Canh / Tân
    CANH_TAN: ["BH", "HV", "TL", "CT", "CTr", "DX"],

    // Nhóm Nhâm / Quý
    NHAM_QUY: ["HV", "TL", "CT", "CTr", "DX", "BH"],
  };

  const result = lucTuMap[group];
  if (!result) {
    throw new Error(`Không tìm thấy Lục Thú cho nhóm Thiên Can: ${group}`);
  }

  return result;
}

/**
 * Trích xuất Thiên Can từ chuỗi Can Chi
 * Ví dụ: "Giáp Tý" -> "Giáp", "Nhâm Tuất" -> "Nhâm"
 * 
 * @param canChi - Chuỗi Can Chi (ví dụ: "Giáp Tý", "Nhâm Tuất")
 * @returns Thiên Can hoặc null nếu không hợp lệ
 */
export function extractThienCan(canChi: string): ThienCan | null {
  if (!canChi) return null;

  // Tách chuỗi theo khoảng trắng hoặc dấu gạch ngang
  const parts = canChi.split(/[\s-]/);
  if (parts.length === 0) return null;

  const thienCan = parts[0].trim();
  
  // Kiểm tra xem có phải Thiên Can hợp lệ không
  const validCans: ThienCan[] = [
    "Giáp",
    "Ất",
    "Bính",
    "Đinh",
    "Mậu",
    "Kỷ",
    "Canh",
    "Tân",
    "Nhâm",
    "Quý",
  ];

  if (validCans.includes(thienCan as ThienCan)) {
    return thienCan as ThienCan;
  }

  return null;
}

