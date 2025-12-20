// Thông tin Nhị Hợp / Nhị Xung / Tam Hợp của 12 Địa Chi và các hàm tiện ích tra cứu

export type DiaChi =
  | "Tý"
  | "Sửu"
  | "Dần"
  | "Mão"
  | "Thìn"
  | "Tỵ"
  | "Ngọ"
  | "Mùi"
  | "Thân"
  | "Dậu"
  | "Tuất"
  | "Hợi";

// Danh sách cặp Nhị Hợp
export const NHI_HOP_DIA_CHI_PAIRS: [DiaChi, DiaChi][] = [
  ["Tý", "Sửu"],
  ["Ngọ", "Mùi"],
  ["Thân", "Tỵ"],
  ["Thìn", "Dậu"],
  ["Mão", "Tuất"],
  ["Dần", "Hợi"],
];

// Map nhanh để tra cứu đối cung Nhị Hợp
export const NHI_HOP_DIA_CHI_MAP: Record<DiaChi, DiaChi> = {
  Tý: "Sửu",
  Sửu: "Tý",
  Ngọ: "Mùi",
  Mùi: "Ngọ",
  Thân: "Tỵ",
  Tỵ: "Thân",
  Thìn: "Dậu",
  Dậu: "Thìn",
  Mão: "Tuất",
  Tuất: "Mão",
  Dần: "Hợi",
  Hợi: "Dần",
};

/**
 * Kiểm tra 2 địa chi có Nhị Hợp với nhau hay không
 * - Không phân biệt thứ tự (Tý–Sửu hay Sửu–Tý đều đúng)
 */
export function isNhiHopDiaChi(chi1: DiaChi, chi2: DiaChi): boolean {
  if (!chi1 || !chi2) return false;
  if (chi1 === chi2) return false;
  return NHI_HOP_DIA_CHI_MAP[chi1] === chi2;
}

/**
 * Lấy địa chi Nhị Hợp với một địa chi cho trước
 * - Nếu không thuộc 12 địa chi tiêu chuẩn thì trả về null
 */
export function getNhiHopOf(chi: DiaChi): DiaChi | null {
  return NHI_HOP_DIA_CHI_MAP[chi] ?? null;
}

// Danh sách cặp Nhị Xung
export const NHI_XUNG_DIA_CHI_PAIRS: [DiaChi, DiaChi][] = [
  ["Tý", "Ngọ"],
  ["Sửu", "Mùi"],
  ["Thân", "Dần"],
  ["Thìn", "Tuất"],
  ["Mão", "Dậu"],
  ["Tỵ", "Hợi"],
];

// Map nhanh để tra cứu đối cung Nhị Xung
export const NHI_XUNG_DIA_CHI_MAP: Record<DiaChi, DiaChi> = {
  Tý: "Ngọ",
  Ngọ: "Tý",
  Sửu: "Mùi",
  Mùi: "Sửu",
  Thân: "Dần",
  Dần: "Thân",
  Thìn: "Tuất",
  Tuất: "Thìn",
  Mão: "Dậu",
  Dậu: "Mão",
  Tỵ: "Hợi",
  Hợi: "Tỵ",
};

/**
 * Kiểm tra 2 địa chi có Nhị Xung với nhau hay không
 * - Không phân biệt thứ tự (Tý–Ngọ hay Ngọ–Tý đều đúng)
 */
export function isNhiXungDiaChi(chi1: DiaChi, chi2: DiaChi): boolean {
  if (!chi1 || !chi2) return false;
  if (chi1 === chi2) return false;
  return NHI_XUNG_DIA_CHI_MAP[chi1] === chi2;
}

/**
 * Lấy địa chi Nhị Xung với một địa chi cho trước
 */
export function getNhiXungOf(chi: DiaChi): DiaChi | null {
  return NHI_XUNG_DIA_CHI_MAP[chi] ?? null;
}

// Danh sách các nhóm Tam Hợp (mỗi nhóm gồm 3 địa chi)
export const TAM_HOP_DIA_CHI_GROUPS: [DiaChi, DiaChi, DiaChi][] = [
  ["Hợi", "Mão", "Mùi"],
  ["Dần", "Ngọ", "Tuất"],
  ["Tỵ", "Dậu", "Sửu"],
  ["Thân", "Tý", "Thìn"],
];

// Map để tra cứu nhanh nhóm Tam Hợp của mỗi địa chi
export const TAM_HOP_DIA_CHI_MAP: Record<DiaChi, [DiaChi, DiaChi, DiaChi]> = {
  Hợi: ["Hợi", "Mão", "Mùi"],
  Mão: ["Hợi", "Mão", "Mùi"],
  Mùi: ["Hợi", "Mão", "Mùi"],
  Dần: ["Dần", "Ngọ", "Tuất"],
  Ngọ: ["Dần", "Ngọ", "Tuất"],
  Tuất: ["Dần", "Ngọ", "Tuất"],
  Tỵ: ["Tỵ", "Dậu", "Sửu"],
  Dậu: ["Tỵ", "Dậu", "Sửu"],
  Sửu: ["Tỵ", "Dậu", "Sửu"],
  Thân: ["Thân", "Tý", "Thìn"],
  Tý: ["Thân", "Tý", "Thìn"],
  Thìn: ["Thân", "Tý", "Thìn"],
};

/**
 * Kiểm tra 2 địa chi có cùng trong một nhóm Tam Hợp hay không
 * - Không phân biệt thứ tự
 * - Trả về true nếu cả 2 địa chi cùng nằm trong một nhóm Tam Hợp
 */
export function isTamHopDiaChi(chi1: DiaChi, chi2: DiaChi): boolean {
  if (!chi1 || !chi2) return false;
  if (chi1 === chi2) return false;
  
  const group1 = TAM_HOP_DIA_CHI_MAP[chi1];
  const group2 = TAM_HOP_DIA_CHI_MAP[chi2];
  
  if (!group1 || !group2) return false;
  
  // Kiểm tra xem 2 nhóm có giống nhau không (cùng nhóm Tam Hợp)
  return (
    group1[0] === group2[0] &&
    group1[1] === group2[1] &&
    group1[2] === group2[2]
  );
}

/**
 * Lấy nhóm Tam Hợp của một địa chi cho trước
 * - Trả về mảng 3 địa chi trong cùng nhóm Tam Hợp
 * - Nếu không thuộc 12 địa chi tiêu chuẩn thì trả về null
 */
export function getTamHopGroupOf(chi: DiaChi): [DiaChi, DiaChi, DiaChi] | null {
  return TAM_HOP_DIA_CHI_MAP[chi] ?? null;
}

/**
 * Lấy 2 địa chi còn lại trong nhóm Tam Hợp của một địa chi cho trước
 * - Trả về mảng 2 địa chi còn lại (không bao gồm địa chi đầu vào)
 * - Nếu không thuộc 12 địa chi tiêu chuẩn thì trả về null
 */
export function getTamHopPartnersOf(chi: DiaChi): [DiaChi, DiaChi] | null {
  const group = TAM_HOP_DIA_CHI_MAP[chi];
  if (!group) return null;
  
  // Lọc ra 2 địa chi còn lại (không bao gồm chi hiện tại)
  const partners = group.filter((c) => c !== chi) as [DiaChi, DiaChi];
  return partners.length === 2 ? partners : null;
}

// =========================
// Nhập Mộ (Entering Tomb) - mối quan hệ một chiều
// =========================

// Map địa chi -> địa chi mà nó nhập mộ
// Lưu ý: Thìn, Tuất, Sửu, Mùi không nhập mộ
export const NHAP_MO_DIA_CHI_MAP: Partial<Record<DiaChi, DiaChi>> = {
  Tý: "Thìn",
  Dần: "Mùi",
  Mão: "Mùi",
  Tỵ: "Tuất",
  Ngọ: "Tuất",
  Thân: "Sửu",
  Dậu: "Sửu",
  Hợi: "Thìn",
  // Thìn, Tuất, Sửu, Mùi không nhập mộ (không có trong map này)
};

/**
 * Lấy địa chi mà một địa chi nhập mộ
 * - Trả về địa chi mộ nếu có, null nếu không nhập mộ
 * - Thìn, Tuất, Sửu, Mùi không nhập mộ nên trả về null
 */
export function getNhapMoOf(chi: DiaChi): DiaChi | null {
  return NHAP_MO_DIA_CHI_MAP[chi] ?? null;
}

/**
 * Kiểm tra một địa chi có nhập mộ hay không
 * - Trả về true nếu địa chi có nhập mộ
 * - Thìn, Tuất, Sửu, Mùi trả về false
 */
export function hasNhapMo(chi: DiaChi): boolean {
  return NHAP_MO_DIA_CHI_MAP[chi] !== undefined;
}

/**
 * Kiểm tra một địa chi có phải là mộ của địa chi khác hay không
 * - Trả về true nếu chi là mộ của ít nhất một địa chi khác
 */
export function isMoOf(chi: DiaChi): boolean {
  return Object.values(NHAP_MO_DIA_CHI_MAP).includes(chi);
}

/**
 * Lấy danh sách các địa chi nhập mộ tại một địa chi cho trước
 * - Trả về mảng các địa chi nhập mộ tại chi đó
 * - Nếu không có địa chi nào nhập mộ tại đó, trả về mảng rỗng
 */
export function getDiaChiNhapMoTai(chi: DiaChi): DiaChi[] {
  return Object.entries(NHAP_MO_DIA_CHI_MAP)
    .filter(([_, mo]) => mo === chi)
    .map(([diaChi, _]) => diaChi as DiaChi);
}


