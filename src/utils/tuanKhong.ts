/**
 * Tính Tuần Không (Không Vong) cho quẻ Dịch dựa trên ngày xem quẻ theo Can Chi
 *
 * Quy tắc:
 * - Tuần Không chỉ phụ thuộc ngày Can Chi, không phụ thuộc Dụng Thần, Lục Thú, Quẻ chủ/quẻ biến
 * - Mỗi cột Tuần Không có danh sách ngày Can Chi và 2 Địa Chi bị Không Vong
 * - Nếu Địa Chi của hào nằm trong danh sách Không Vong → tuanKhong = "K"
 */

import { DiaChi, DIA_CHI_CODES } from "./diaChi";

/**
 * Định nghĩa cột Tuần Không
 */
export interface TuanKhongColumn {
  /** Danh sách các ngày Can Chi thuộc cột này */
  dayGanzhiList: string[];
  /** Danh sách 2 Địa Chi bị Không Vong */
  emptyBranches: DiaChi[];
}

/**
 * Bảng Tuần Không - 6 cột
 */
const TUAN_KHONG_TABLE: TuanKhongColumn[] = [
  {
    // Cột 1
    dayGanzhiList: [
      "Giáp Tý",
      "Ất Sửu",
      "Bính Dần",
      "Đinh Mão",
      "Mậu Thìn",
      "Kỷ Tỵ",
      "Canh Ngọ",
      "Tân Mùi",
      "Nhâm Thân",
      "Quý Dậu"
    ],
    emptyBranches: ["TU", "HO"] // Tuất, Hợi
  },
  {
    // Cột 2
    dayGanzhiList: [
      "Giáp Tuất",
      "Ất Hợi",
      "Bính Tý",
      "Đinh Sửu",
      "Mậu Dần",
      "Kỷ Mão",
      "Canh Thìn",
      "Tân Tỵ",
      "Nhâm Ngọ",
      "Quý Mùi"
    ],
    emptyBranches: ["TN", "DA"] // Thân, Dậu
  },
  {
    // Cột 3
    dayGanzhiList: [
      "Giáp Thân",
      "Ất Dậu",
      "Bính Tuất",
      "Đinh Hợi",
      "Mậu Tý",
      "Kỷ Sửu",
      "Canh Dần",
      "Tân Mão",
      "Nhâm Thìn",
      "Quý Tỵ"
    ],
    emptyBranches: ["NG", "MU"] // Ngọ, Mùi
  },
  {
    // Cột 4
    dayGanzhiList: [
      "Giáp Ngọ",
      "Ất Mùi",
      "Bính Thân",
      "Đinh Dậu",
      "Mậu Tuất",
      "Kỷ Hợi",
      "Canh Tý",
      "Tân Sửu",
      "Nhâm Dần",
      "Quý Mão"
    ],
    emptyBranches: ["TH", "TI"] // Thìn, Tỵ
  },
  {
    // Cột 5
    dayGanzhiList: [
      "Giáp Thìn",
      "Ất Tỵ",
      "Bính Ngọ",
      "Đinh Mùi",
      "Mậu Thân",
      "Kỷ Dậu",
      "Canh Tuất",
      "Tân Hợi",
      "Nhâm Tý",
      "Quý Sửu"
    ],
    emptyBranches: ["DN", "MA"] // Dần, Mão
  },
  {
    // Cột 6
    dayGanzhiList: [
      "Giáp Dần",
      "Ất Mão",
      "Bính Thìn",
      "Đinh Tỵ",
      "Mậu Ngọ",
      "Kỷ Mùi",
      "Canh Thân",
      "Tân Dậu",
      "Nhâm Tuất",
      "Quý Hợi"
    ],
    emptyBranches: ["TY", "SU"] // Tý, Sửu
  }
];


/**
 * Helper: Chuẩn hóa chuỗi Can Chi để so sánh
 */
function normalizeCanChi(text: string): string {
  if (!text) return "";
  let normalized = text.trim().replace(/\s+/g, " ");
  // Chuyển về Tý (thay vì Tí)
  normalized = normalized.replace(/\bTí\b/g, "Tý");
  // Chuyển về Kỷ (thay vì Kỉ)
  normalized = normalized.replace(/\bKỉ\b/g, "Kỷ");
  return normalized.toLowerCase();
}

/**
 * Tìm cột Tuần Không dựa trên ngày Can Chi
 *
 * @param dayGanzhi - Ngày xem quẻ theo Can Chi (ví dụ: "Giáp Tý", "Nhâm Thân")
 * @returns Cột Tuần Không tương ứng hoặc null nếu không tìm thấy
 */
function findTuanKhongColumn(dayGanzhi: string): TuanKhongColumn | null {
  if (!dayGanzhi) return null;

  const normalizedInput = normalizeCanChi(dayGanzhi);

  // Tìm cột chứa dayGanzhi (so sánh không phân biệt hoa thường và khoảng trắng)
  for (const column of TUAN_KHONG_TABLE) {
    for (const ganzhi of column.dayGanzhiList) {
      // So sánh sau khi chuẩn hóa cả 2 bên (đề phòng dữ liệu cứng cũng có thể lệch chuẩn nếu sửa đổi sau này)
      if (normalizedInput === normalizeCanChi(ganzhi)) {
        return column;
      }
    }
  }

  return null; // Explicitly return null if not found
}

/**
 * Trích xuất Địa Chi từ chuỗi Can Chi
 * Ví dụ: "Giáp Tý" -> "Tý", "Nhâm Tuất" -> "Tuất"
 *
 * @param canChi - Chuỗi Can Chi (ví dụ: "Giáp Tý", "Nhâm Tuất")
 * @returns Địa Chi code hoặc null nếu không hợp lệ
 */
function extractDiaChiFromCanChi(canChi: string): DiaChi | null {
  if (!canChi) return null;

  // Tách chuỗi theo khoảng trắng hoặc dấu gạch ngang
  const parts = canChi.split(/[\s-]/);
  
  // Địa Chi là phần cuối cùng
  let diaChiName = parts[parts.length - 1].trim();
  
  // Normalization for robust lookup
  if (diaChiName === "Tí") diaChiName = "Tý";
  if (diaChiName === "Kỉ") diaChiName = "Kỷ";

  // Chuyển đổi tên Địa Chi sang code
  // Try exact match first
  if (DIA_CHI_CODES[diaChiName]) return DIA_CHI_CODES[diaChiName];

  // Try capitalized match if input is lowercase
  const capitalized = diaChiName.charAt(0).toUpperCase() + diaChiName.slice(1).toLowerCase();
  if (DIA_CHI_CODES[capitalized]) return DIA_CHI_CODES[capitalized];

  return null;
}

/**
 * Tính Tuần Không cho một Địa Chi dựa trên ngày Can Chi
 *
 * @param earthlyBranch - Địa Chi của hào (code: "TY", "SU", "DN", ...)
 * @param dayGanzhi - Ngày xem quẻ theo Can Chi (ví dụ: "Giáp Tý")
 * @returns "K" nếu hào bị Tuần Không, "" nếu không
 */
export function calculateTuanKhong(
  earthlyBranch: DiaChi | string | null,
  dayGanzhi: string
): string {
  if (!earthlyBranch || !dayGanzhi) return "";

  // Tìm cột Tuần Không
  const column = findTuanKhongColumn(dayGanzhi);
  if (!column) return "";

  // Chuyển đổi earthlyBranch sang DiaChi code nếu cần
  let diaChiCode: DiaChi | null = null;
  if (typeof earthlyBranch === "string") {
    // Nếu là tên Địa Chi (ví dụ: "Tý", "Sửu"), chuyển sang code
    diaChiCode = DIA_CHI_CODES[earthlyBranch] || (earthlyBranch as DiaChi);
  } else {
    diaChiCode = earthlyBranch;
  }

  if (!diaChiCode) return "";

  // Kiểm tra xem Địa Chi có nằm trong danh sách Không Vong không
  if (column.emptyBranches.includes(diaChiCode)) {
    return "K";
  }

  return "";
}

/**
 * Tính Tuần Không cho tất cả 6 hào của quẻ
 *
 * @param lineCanChiList - Mảng 6 phần tử chứa Can Chi của 6 hào (từ hào 1 → hào 6)
 * @param dayGanzhi - Ngày xem quẻ theo Can Chi (ví dụ: "Giáp Tý")
 * @returns Mảng 6 phần tử tương ứng Tuần Không của 6 hào ("K" hoặc "")
 */
export function calculateTuanKhongForAllLines(
  lineCanChiList: (string | null)[],
  dayGanzhi: string
): string[] {
  if (!lineCanChiList || lineCanChiList.length !== 6) {
    return ["", "", "", "", "", ""];
  }

  return lineCanChiList.map((canChi) => {
    if (!canChi) return "";

    // Trích xuất Địa Chi từ Can Chi của hào
    const diaChi = extractDiaChiFromCanChi(canChi);
    if (!diaChi) return "";

    // Tính Tuần Không
    return calculateTuanKhong(diaChi, dayGanzhi);
  });
}
