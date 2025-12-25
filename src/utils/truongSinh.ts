/**
 * Logic "An Vòng Trường Sinh" cho quẻ Dịch theo cổ pháp
 * 
 * Trường Sinh là một trong những khái niệm quan trọng trong Lục Hào Dịch học,
 * dùng để đánh giá sức mạnh và trạng thái của từng hào trong quẻ.
 * 
 * Quy tắc:
 * - Mỗi Ngũ hành có một Địa Chi khởi điểm Trường Sinh
 * - An vòng 12 trạng Trường Sinh theo thứ tự Địa Chi (thuận chiều kim đồng hồ)
 * - Mỗi hào sẽ có một trạng thái Trường Sinh tương ứng với Địa Chi của nó
 */

import { DiaChi, DIA_CHI_CODES, DIA_CHI_NAMES } from "./diaChi";
import { extractThienCan, ThienCan } from "./lucTu";

/**
 * Ngũ hành của quẻ
 */
export type NguHanh = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";

/**
 * Thứ tự 12 Địa Chi (thuận chiều kim đồng hồ)
 */
const DIA_CHI_ORDER: DiaChi[] = [
  "TY", // Tý
  "SU", // Sửu
  "DN", // Dần
  "MA", // Mão
  "TH", // Thìn
  "TI", // Tỵ
  "NG", // Ngọ
  "MU", // Mùi
  "TN", // Thân
  "DA", // Dậu
  "TU", // Tuất
  "HO", // Hợi
];

/**
 * Thứ tự 12 trạng thái Trường Sinh
 */
const TRUONG_SINH_ORDER = [
  "Trường Sinh",
  "Mộc Dục",
  "Quan Đới",
  "Lâm Quan",
  "Đế Vượng",
  "Suy",
  "Bệnh",
  "Tử",
  "Mộ",
  "Tuyệt",
  "Thai",
  "Dưỡng",
];

/**
 * Bảng Trường Sinh khởi điểm theo Ngũ Hành
 * Mỗi Ngũ hành có một Địa Chi khởi điểm Trường Sinh
 */
const TRUONG_SINH_START: Record<NguHanh, DiaChi> = {
  Mộc: "HO", // Mộc: Trường Sinh tại Hợi
  Hỏa: "DN", // Hỏa: Trường Sinh tại Dần
  Thổ: "TN", // Thổ: Trường Sinh tại Thân
  Kim: "TI", // Kim: Trường Sinh tại Tỵ
  Thủy: "TN", // Thủy: Trường Sinh tại Thân
};

/**
 * Thông tin hào trong quẻ
 */
export interface HaoInfo {
  /** Vị trí hào (1-6, từ dưới lên) */
  viTri: number;
  /** Địa Chi của hào */
  diaChi: DiaChi | string;
  /** Ngũ hành của hào */
  nguHanh: NguHanh | string;
}

/**
 * Kết quả an vòng Trường Sinh cho một hào
 */
export interface TruongSinhResult {
  /** Vị trí hào (1-6) */
  viTri: number;
  /** Địa Chi của hào */
  diaChi: string;
  /** Ngũ hành của hào */
  nguHanh: string;
  /** Trạng thái Trường Sinh */
  trangThai: string;
}

/**
 * Tính khoảng cách giữa hai Địa Chi (theo thứ tự vòng tròn)
 * 
 * @param startChi - Địa Chi bắt đầu
 * @param endChi - Địa Chi kết thúc
 * @returns Khoảng cách (0-11)
 */
function calculateChiDistance(startChi: DiaChi, endChi: DiaChi): number {
  const startIndex = DIA_CHI_ORDER.indexOf(startChi);
  const endIndex = DIA_CHI_ORDER.indexOf(endChi);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Invalid Địa Chi: ${startChi} or ${endChi}`);
  }

  // Tính khoảng cách thuận chiều kim đồng hồ
  if (endIndex >= startIndex) {
    return endIndex - startIndex;
  } else {
    // Vượt qua vòng tròn
    return 12 - startIndex + endIndex;
  }
}

/**
 * Xác định trạng thái Trường Sinh cho một Địa Chi
 * 
 * @param diaChi - Địa Chi của hào
 * @param nguHanhQue - Ngũ hành của quẻ
 * @returns Trạng thái Trường Sinh
 */
function getTruongSinhTrangThai(
  diaChi: DiaChi,
  nguHanhQue: NguHanh
) {
  // Lấy Địa Chi khởi điểm Trường Sinh theo Ngũ hành quẻ
  const startChi = TRUONG_SINH_START[nguHanhQue];

  // Tính khoảng cách từ Chi Trường Sinh đến Chi của hào
  const distance = calculateChiDistance(startChi, diaChi);

  // Lấy trạng thái tương ứng (distance là index trong TRUONG_SINH_ORDER)
  return TRUONG_SINH_ORDER[distance];
}

/**
 * Chuyển đổi Địa Chi từ string sang DiaChi code
 * 
 * @param diaChi - Địa Chi (string hoặc DiaChi code)
 * @returns DiaChi code hoặc null nếu không hợp lệ
 */
function normalizeDiaChi(diaChi: DiaChi | string): DiaChi | null {
  if (!diaChi) return null;

  // Nếu đã là DiaChi code
  if (DIA_CHI_ORDER.includes(diaChi as DiaChi)) {
    return diaChi as DiaChi;
  }

  // Nếu là tên Địa Chi (ví dụ: "Tý", "Sửu")
  const code = DIA_CHI_CODES[diaChi];
  if (code && DIA_CHI_ORDER.includes(code)) {
    return code;
  }

  return null;
}

/**
 * Chuyển đổi Ngũ hành từ string sang NguHanh type
 * 
 * @param nguHanh - Ngũ hành (string)
 * @returns NguHanh hoặc null nếu không hợp lệ
 */
function normalizeNguHanh(nguHanh: NguHanh | string): NguHanh | null {
  const validNguHanh: NguHanh[] = ["Kim", "Mộc", "Thủy", "Hỏa", "Thổ"];
  if (validNguHanh.includes(nguHanh as NguHanh)) {
    return nguHanh as NguHanh;
  }
  return null;
}

/**
 * An vòng Trường Sinh cho một quẻ Dịch
 * 
 * @param nguHanhQue - Ngũ hành của quẻ
 * @param haoList - Danh sách 6 hào của quẻ
 * @returns Mảng 6 phần tử chứa kết quả Trường Sinh cho từng hào
 */
/**
 * Lấy Ngũ hành từ Thiên Can
 * Bảng Ngũ hành của Thiên Can:
 * - Giáp, Ất: Mộc
 * - Bính, Đinh: Hỏa
 * - Mậu, Kỷ: Thổ
 * - Canh, Tân: Kim
 * - Nhâm, Quý: Thủy
 */
function getNguHanhFromThienCan(thienCan: ThienCan): NguHanh {
  if (thienCan === "Giáp" || thienCan === "Ất") return "Mộc";
  if (thienCan === "Bính" || thienCan === "Đinh") return "Hỏa";
  if (thienCan === "Mậu" || thienCan === "Kỷ") return "Thổ";
  if (thienCan === "Canh" || thienCan === "Tân") return "Kim";
  if (thienCan === "Nhâm" || thienCan === "Quý") return "Thủy";
  throw new Error(`Thiên Can không hợp lệ: ${thienCan}`);
}

/**
 * An vòng Trường Sinh cho quẻ dựa trên Ngũ hành của quẻ
 * (Function gốc, giữ lại để tương thích)
 */
export function anVongTruongSinh(
  nguHanhQue: NguHanh | string,
  haoList: HaoInfo[]
): TruongSinhResult[] {
  // Validate Ngũ hành quẻ
  const normalizedNguHanh = normalizeNguHanh(nguHanhQue);
  if (!normalizedNguHanh) {
    throw new Error(`Ngũ hành quẻ không hợp lệ: ${nguHanhQue}`);
  }

  // Validate số lượng hào
  if (!haoList || haoList.length !== 6) {
    throw new Error("Quẻ phải có đúng 6 hào");
  }

  // An vòng Trường Sinh cho từng hào
  const results: TruongSinhResult[] = [];

  for (const hao of haoList) {
    // Validate và normalize Địa Chi
    const normalizedDiaChi = normalizeDiaChi(hao.diaChi);
    if (!normalizedDiaChi) {
      throw new Error(
        `Địa Chi không hợp lệ cho hào ${hao.viTri}: ${hao.diaChi}`
      );
    }

    // Xác định trạng thái Trường Sinh
    const trangThai = getTruongSinhTrangThai(
      normalizedDiaChi,
      normalizedNguHanh
    );

    // Lấy tên Địa Chi để hiển thị
    const diaChiName = DIA_CHI_NAMES[normalizedDiaChi] || hao.diaChi;

    results.push({
      viTri: hao.viTri,
      diaChi: diaChiName,
      nguHanh: hao.nguHanh,
      trangThai,
    });
  }

  return results;
}

/**
 * An vòng Trường Sinh cho quẻ dựa trên Ngũ hành của Thiên Can (ngày hoặc tháng)
 * 
 * @param ganzhi - Can Chi của ngày hoặc tháng (ví dụ: "Giáp Tý", "Nhâm Tuất")
 * @param haoList - Danh sách 6 hào của quẻ, mỗi hào có element (Ngũ hành) và earthlyBranch (Địa Chi)
 * @returns Mảng 6 phần tử chứa kết quả Trường Sinh cho từng hào
 */
export function anVongTruongSinhByCan(
  ganzhi: string,
  haoList: HaoInfo[]
): TruongSinhResult[] {
  // Validate Can Chi
  if (!ganzhi) {
    throw new Error("Can Chi không được để trống");
  }

  // Trích xuất Thiên Can từ Can Chi
  const thienCan = extractThienCan(ganzhi);
  if (!thienCan) {
    throw new Error(`Không thể trích xuất Thiên Can từ: ${ganzhi}`);
  }

  // Lấy Ngũ hành của Thiên Can
  const nguHanhCan = getNguHanhFromThienCan(thienCan);

  // Validate số lượng hào
  if (!haoList || haoList.length !== 6) {
    throw new Error("Quẻ phải có đúng 6 hào");
  }

  // An vòng Trường Sinh cho từng hào
  const results: TruongSinhResult[] = [];

  for (const hao of haoList) {
    // Validate và normalize Địa Chi
    const normalizedDiaChi = normalizeDiaChi(hao.diaChi);
    if (!normalizedDiaChi) {
      throw new Error(
        `Địa Chi không hợp lệ cho hào ${hao.viTri}: ${hao.diaChi}`
      );
    }

    // Xác định trạng thái Trường Sinh dựa trên Ngũ hành của Thiên Can
    // (Điểm khởi Trường Sinh được xác định bởi Ngũ hành của Thiên Can)
    const trangThai = getTruongSinhTrangThai(
      normalizedDiaChi,
      nguHanhCan
    );

    // Lấy tên Địa Chi để hiển thị
    const diaChiName = DIA_CHI_NAMES[normalizedDiaChi] || hao.diaChi;

    results.push({
      viTri: hao.viTri,
      diaChi: diaChiName,
      nguHanh: hao.nguHanh,
      trangThai,
    });
  }

  return results;
}

/**
 * Lấy Địa Chi khởi điểm Trường Sinh theo Ngũ hành
 * 
 * @param nguHanh - Ngũ hành
 * @returns Địa Chi khởi điểm Trường Sinh
 */
export function getTruongSinhStartChi(nguHanh: NguHanh): DiaChi {
  return TRUONG_SINH_START[nguHanh];
}

/**
 * Lấy tên Địa Chi khởi điểm Trường Sinh theo Ngũ hành
 * 
 * @param nguHanh - Ngũ hành
 * @returns Tên Địa Chi khởi điểm Trường Sinh
 */
export function getTruongSinhStartChiName(nguHanh: NguHanh): string {
  const chi = TRUONG_SINH_START[nguHanh];
  return DIA_CHI_NAMES[chi];
}

