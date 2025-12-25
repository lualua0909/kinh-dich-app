// Thông tin Nhị Hợp / Nhị Xung / Tam Hợp của 12 Địa Chi và các hàm tiện ích tra cứu

export type DiaChi =
  | "TY"
  | "SU"
  | "DN"
  | "MA"
  | "TH"
  | "TI"
  | "NG"
  | "MU"
  | "TN"
  | "DA"
  | "TU"
  | "HO";

export const DIA_CHI_NAMES: Record<DiaChi, string> = {
  TY: "Tý",
  SU: "Sửu",
  DN: "Dần",
  MA: "Mão",
  TH: "Thìn",
  TI: "Tỵ",
  NG: "Ngọ",
  MU: "Mùi",
  TN: "Thân",
  DA: "Dậu",
  TU: "Tuất",
  HO: "Hợi"
};

export const DIA_CHI_CODES: Record<string, DiaChi> = {
  "Tý": "TY",
  "Sửu": "SU",
  "Dần": "DN",
  "Mão": "MA",
  "Thìn": "TH",
  "Tỵ": "TI",
  "Ngọ": "NG",
  "Mùi": "MU",
  "Thân": "TN",
  "Dậu": "DA",
  "Tuất": "TU",
  "Hợi": "HO"
};

export const DIA_CHI_ICONS: Record<DiaChi, string> = {
  "TY": "🐭",
  "SU": "🐮",
  "DN": "🐯",
  "MA": "🐱",
  "TH": "🐲",
  "TI": "🐍",
  "NG": "🐴",
  "MU": "🐐",
  "TN": "🐒",
  "DA": "🐔",
  "TU": "🐶",
  "HO": "🐷"
}

// Danh sách cặp Nhị Hợp
// Danh sách cặp Nhị Hợp
export const NHI_HOP_DIA_CHI_PAIRS: [DiaChi, DiaChi][] = [
  ["TY", "SU"],
  ["NG", "MU"],
  ["TN", "TI"],
  ["TH", "DA"],
  ["MA", "TU"],
  ["DN", "HO"]
];

// Map nhanh để tra cứu đối cung Nhị Hợp
export const NHI_HOP_DIA_CHI_MAP: Record<DiaChi, DiaChi> = {
  TY: "SU",
  SU: "TY",
  NG: "MU",
  MU: "NG",
  TN: "TI",
  TI: "TN",
  TH: "DA",
  DA: "TH",
  MA: "TU",
  TU: "MA",
  DN: "HO",
  HO: "DN"
};

// Helper: Chuyển đổi input (Tên hoặc Code) sang Code chuẩn
/**
 * Chuyển đổi input (Tên hoặc Code) sang Code chuẩn
 */
export function toDiaChiCode(val: string | DiaChi): DiaChi | null {

  if (!val) return null;
  // Nếu là name ("Tý") -> trả về code ("TY")
  if (DIA_CHI_CODES[val]) return DIA_CHI_CODES[val];
  // Nếu là code ("TY") -> trả về code ("TY")
  if (DIA_CHI_NAMES[val as DiaChi]) return val as DiaChi;
  return null;
}

/**
 * Kiểm tra 2 địa chi có Nhị Hợp với nhau hay không
 * - Không phân biệt thứ tự (Tý–Sửu hay Sửu–Tý đều đúng)
 */
export function isNhiHopDiaChi(chi1: DiaChi | string, chi2: DiaChi | string): boolean {
  const c1 = toDiaChiCode(chi1);
  const c2 = toDiaChiCode(chi2);
  if (!c1 || !c2) return false;
  if (c1 === c2) return false;
  return NHI_HOP_DIA_CHI_MAP[c1] === c2;
}

/**
 * Lấy địa chi Nhị Hợp với một địa chi cho trước
 * - Nếu không thuộc 12 địa chi tiêu chuẩn thì trả về null
 */
export function getNhiHopOf(chi: DiaChi | string): DiaChi | null {
  const c = toDiaChiCode(chi);
  return c ? NHI_HOP_DIA_CHI_MAP[c] ?? null : null;
}

// Danh sách cặp Nhị Xung
// Danh sách cặp Nhị Xung
export const NHI_XUNG_DIA_CHI_PAIRS: [DiaChi, DiaChi][] = [
  ["TY", "NG"],
  ["SU", "MU"],
  ["TN", "DN"],
  ["TH", "TU"],
  ["MA", "DA"],
  ["TI", "HO"]
];

// Map nhanh để tra cứu đối cung Nhị Xung
export const NHI_XUNG_DIA_CHI_MAP: Record<DiaChi, DiaChi> = {
  TY: "NG",
  NG: "TY",
  SU: "MU",
  MU: "SU",
  TN: "DN",
  DN: "TN",
  TH: "TU",
  TU: "TH",
  MA: "DA",
  DA: "MA",
  TI: "HO",
  HO: "TI"
};

/**
 * Kiểm tra 2 địa chi có Nhị Xung với nhau hay không
 * - Không phân biệt thứ tự (Tý–Ngọ hay Ngọ–Tý đều đúng)
 */
export function isNhiXungDiaChi(chi1: DiaChi | string, chi2: DiaChi | string): boolean {
  const c1 = toDiaChiCode(chi1);
  const c2 = toDiaChiCode(chi2);
  if (!c1 || !c2) return false;
  if (c1 === c2) return false;
  return NHI_XUNG_DIA_CHI_MAP[c1] === c2;
}

/**
 * Lấy địa chi Nhị Xung với một địa chi cho trước
 */
export function getNhiXungOf(chi: DiaChi | string): DiaChi | null {
  const c = toDiaChiCode(chi);
  return c ? NHI_XUNG_DIA_CHI_MAP[c] ?? null : null;
}

// Danh sách các nhóm Tam Hợp (mỗi nhóm gồm 3 địa chi)
// Danh sách các nhóm Tam Hợp (mỗi nhóm gồm 3 địa chi)
export const TAM_HOP_DIA_CHI_GROUPS: [DiaChi, DiaChi, DiaChi][] = [
  ["HO", "MA", "MU"],
  ["DN", "NG", "TU"],
  ["TI", "DA", "SU"],
  ["TN", "TY", "TH"]
];

// Map để tra cứu nhanh nhóm Tam Hợp của mỗi địa chi
export const TAM_HOP_DIA_CHI_MAP: Record<DiaChi, [DiaChi, DiaChi, DiaChi]> = {
  HO: ["HO", "MA", "MU"],
  MA: ["HO", "MA", "MU"],
  MU: ["HO", "MA", "MU"],
  DN: ["DN", "NG", "TU"],
  NG: ["DN", "NG", "TU"],
  TU: ["DN", "NG", "TU"],
  TI: ["TI", "DA", "SU"],
  DA: ["TI", "DA", "SU"],
  SU: ["TI", "DA", "SU"],
  TN: ["TN", "TY", "TH"],
  TY: ["TN", "TY", "TH"],
  TH: ["TN", "TY", "TH"]
};

/**
 * Kiểm tra 2 địa chi có cùng trong một nhóm Tam Hợp hay không
 * - Không phân biệt thứ tự
 * - Trả về true nếu cả 2 địa chi cùng nằm trong một nhóm Tam Hợp
 */
export function isTamHopDiaChi(chi1: DiaChi | string, chi2: DiaChi | string): boolean {
  const c1 = toDiaChiCode(chi1);
  const c2 = toDiaChiCode(chi2);
  if (!c1 || !c2) return false;
  if (c1 === c2) return false;

  const group1 = TAM_HOP_DIA_CHI_MAP[c1];
  const group2 = TAM_HOP_DIA_CHI_MAP[c2];

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
export function getTamHopGroupOf(chi: DiaChi | string): [DiaChi, DiaChi, DiaChi] | null {
  const c = toDiaChiCode(chi);
  return c ? TAM_HOP_DIA_CHI_MAP[c] ?? null : null;
}

/**
 * Lấy 2 địa chi còn lại trong nhóm Tam Hợp của một địa chi cho trước
 * - Trả về mảng 2 địa chi còn lại (không bao gồm địa chi đầu vào)
 * - Nếu không thuộc 12 địa chi tiêu chuẩn thì trả về null
 */
export function getTamHopPartnersOf(chi: DiaChi | string): [DiaChi, DiaChi] | null {
  const c = toDiaChiCode(chi);
  if (!c) return null;
  const group = TAM_HOP_DIA_CHI_MAP[c];
  if (!group) return null;

  // Lọc ra 2 địa chi còn lại (không bao gồm chi hiện tại)
  const partners = group.filter((x) => x !== c) as [DiaChi, DiaChi];
  return partners.length === 2 ? partners : null;
}

// =========================
// Nhập Mộ (Entering Tomb) - mối quan hệ một chiều
// =========================

// Map địa chi -> địa chi mà nó nhập mộ
// Lưu ý: Thìn, Tuất, Sửu, Mùi không nhập mộ
export const NHAP_MO_DIA_CHI_MAP: Partial<Record<DiaChi, DiaChi>> = {
  TY: "TH",
  DN: "MU",
  MA: "MU",
  TI: "TU",
  NG: "TU",
  TN: "SU",
  DA: "SU",
  HO: "TH"
  // Thìn, Tuất, Sửu, Mùi không nhập mộ (không có trong map này)
};

/**
 * Lấy địa chi mà một địa chi nhập mộ
 * - Trả về địa chi mộ nếu có, null nếu không nhập mộ
 * - Thìn, Tuất, Sửu, Mùi không nhập mộ nên trả về null
 */
export function getNhapMoOf(chi: DiaChi | string): DiaChi | null {
  const c = toDiaChiCode(chi);
  return c ? NHAP_MO_DIA_CHI_MAP[c] ?? null : null;
}

/**
 * Kiểm tra một địa chi có nhập mộ hay không
 * - Trả về true nếu địa chi có nhập mộ
 * - Thìn, Tuất, Sửu, Mùi trả về false
 */
export function hasNhapMo(chi: DiaChi | string): boolean {
  const c = toDiaChiCode(chi);
  return c ? NHAP_MO_DIA_CHI_MAP[c] !== undefined : false;
}

/**
 * Kiểm tra một địa chi có phải là mộ của địa chi khác hay không
 * - Trả về true nếu chi là mộ của ít nhất một địa chi khác
 */
export function isMoOf(chi: DiaChi | string): boolean {
  const c = toDiaChiCode(chi);
  return c ? Object.values(NHAP_MO_DIA_CHI_MAP).includes(c) : false;
}

/**
 * Lấy danh sách các địa chi nhập mộ tại một địa chi cho trước
 * - Trả về mảng các địa chi nhập mộ tại chi đó
 * - Nếu không có địa chi nào nhập mộ tại đó, trả về mảng rỗng
 */
export function getDiaChiNhapMoTai(chi: DiaChi | string): DiaChi[] {
  const c = toDiaChiCode(chi);
  if (!c) return [];
  return Object.entries(NHAP_MO_DIA_CHI_MAP)
    .filter(([_, mo]) => mo === c)
    .map(([diaChi, _]) => diaChi as DiaChi);
}

// =========================
// Tam Hình (Three Punishments) - mối quan hệ một chiều
// =========================

// Các nhóm Tam Hình
export type TamHinhGroupType =
  | "Vô lễ chi hình"
  | "Vô ân hình"
  | "Thị thế hình"
  | "Tự hình";

// Map địa chi -> địa chi mà nó hình (một chiều)
export const TAM_HINH_DIA_CHI_MAP: Partial<
  Record<DiaChi, { target: DiaChi; group: TamHinhGroupType }>
> = {
  // Vô lễ chi hình (2 địa chi hình lẫn nhau)
  TY: { target: "MA", group: "Vô lễ chi hình" },
  MA: { target: "TY", group: "Vô lễ chi hình" },

  // Vô ân hình (3 địa chi hình theo vòng tròn)
  DN: { target: "TI", group: "Vô ân hình" },
  TI: { target: "TN", group: "Vô ân hình" },
  TN: { target: "DN", group: "Vô ân hình" },

  // Thị thế hình (3 địa chi hình theo vòng tròn)
  SU: { target: "TU", group: "Thị thế hình" },
  TU: { target: "MU", group: "Thị thế hình" },
  MU: { target: "SU", group: "Thị thế hình" },

  // Tự hình (hình chính mình)
  TH: { target: "TH", group: "Tự hình" },
  NG: { target: "NG", group: "Tự hình" },
  DA: { target: "DA", group: "Tự hình" },
  HO: { target: "HO", group: "Tự hình" }
};

// Các nhóm Tam Hình đầy đủ
export const TAM_HINH_GROUPS: Record<TamHinhGroupType, DiaChi[]> = {
  "Vô lễ chi hình": ["TY", "MA"],
  "Vô ân hình": ["DN", "TI", "TN"],
  "Thị thế hình": ["SU", "TU", "MU"],
  "Tự hình": ["TH", "NG", "DA", "HO"]
};

/**
 * Kiểm tra địa chi 1 có hình địa chi 2 hay không (một chiều)
 * - Trả về true nếu chi1 hình chi2
 * - Trả về false nếu không có mối quan hệ hình hoặc chi2 hình chi1
 */
export function isTamHinhDiaChi(chi1: DiaChi | string, chi2: DiaChi | string): boolean {
  const c1 = toDiaChiCode(chi1);
  const c2 = toDiaChiCode(chi2);
  if (!c1 || !c2) return false;
  const relation = TAM_HINH_DIA_CHI_MAP[c1];
  return relation?.target === c2;
}

/**
 * Lấy địa chi mà một địa chi hình (một chiều)
 * - Trả về địa chi bị hình nếu có, null nếu không có
 */
export function getTamHinhTargetOf(chi: DiaChi | string): DiaChi | null {
  const c = toDiaChiCode(chi);
  return c ? TAM_HINH_DIA_CHI_MAP[c]?.target ?? null : null;
}

/**
 * Lấy nhóm Tam Hình của một địa chi
 * - Trả về tên nhóm Tam Hình nếu có, null nếu không có
 */
export function getTamHinhGroupOf(chi: DiaChi | string): TamHinhGroupType | null {
  const c = toDiaChiCode(chi);
  return c ? TAM_HINH_DIA_CHI_MAP[c]?.group ?? null : null;
}

/**
 * Kiểm tra một array địa chi có chứa đầy đủ một nhóm Tam Hình không
 * - Input: array chứa các địa chi (Code or Name)
 * - Trả về object chứa:
 *   - hasFullGroup: true nếu có đầy đủ một nhóm Tam Hình
 *   - groupType: tên nhóm Tam Hình nếu có đầy đủ, null nếu không
 *   - groupMembers: các địa chi trong nhóm nếu có đầy đủ, null nếu không
 */
export function hasFullTamHinhGroup(diaChiArray: (DiaChi | string)[]): {
  hasFullGroup: boolean;
  groupType: TamHinhGroupType | null;
  groupMembers: DiaChi[] | null;
} {
  if (!diaChiArray || diaChiArray.length === 0) {
    return {
      hasFullGroup: false,
      groupType: null,
      groupMembers: null
    };
  }

  // Chuyển hết sang Code
  const codes = diaChiArray.map(toDiaChiCode).filter((c): c is DiaChi => c !== null);
  // Tạo Set để kiểm tra nhanh
  const diaChiSet = new Set(codes);

  // Kiểm tra từng nhóm Tam Hình
  for (const [groupType, groupMembers] of Object.entries(TAM_HINH_GROUPS)) {
    // Kiểm tra xem tất cả địa chi trong nhóm có xuất hiện trong array không
    const allMembersPresent = groupMembers.every((chi) => diaChiSet.has(chi));

    if (allMembersPresent) {
      return {
        hasFullGroup: true,
        groupType: groupType as TamHinhGroupType,
        groupMembers: groupMembers
      };
    }
  }

  return {
    hasFullGroup: false,
    groupType: null,
    groupMembers: null
  };
}

/**
 * Trích xuất Địa Chi từ chuỗi Can Chi
 * Ví dụ: "Giáp-Tý" -> "Tý", "Nhâm Thân" -> "Thân"
 */
export const extractDiaChi = (canChi: string | null): string | null => {
  if (!canChi) return null;
  if (canChi.includes("-")) {
    const parts = canChi.split("-");
    return parts[parts.length - 1].trim();
  } else {
    const parts = canChi.split(" ");
    return parts[parts.length - 1].trim();
  }
};
