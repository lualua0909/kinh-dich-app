import nguHanhRelations from "../data/nguHanhRelations.json";

export const nguHanhFromDiaChi = {
  DN: { name: "Mộc", color: "text-green-600 bg-green-50" },
  MA: { name: "Mộc", color: "text-green-600 bg-green-50" },
  TI: { name: "Hỏa", color: "text-red-600 bg-red-50" },
  NG: { name: "Hỏa", color: "text-red-600 bg-red-50" },
  TH: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
  TU: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
  SU: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
  MU: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
  TN: { name: "Kim", color: "text-yellow-600 bg-yellow-50" },
  DA: { name: "Kim", color: "text-yellow-600 bg-yellow-50" },
  HO: { name: "Thủy", color: "text-blue-600 bg-blue-50" },
  TY: { name: "Thủy", color: "text-blue-600 bg-blue-50" }
};

// Map with both codes and Vietnamese names as keys for maximum compatibility
export const NGU_HANH_MAP = {
  "Dần": nguHanhFromDiaChi.DN,
  "Mão": nguHanhFromDiaChi.MA,
  "Tỵ": nguHanhFromDiaChi.TI,
  "Ngọ": nguHanhFromDiaChi.NG,
  "Thìn": nguHanhFromDiaChi.TH,
  "Tuất": nguHanhFromDiaChi.TU,
  "Sửu": nguHanhFromDiaChi.SU,
  "Mùi": nguHanhFromDiaChi.MU,
  "Thân": nguHanhFromDiaChi.TN,
  "Dậu": nguHanhFromDiaChi.DA,
  "Hợi": nguHanhFromDiaChi.HO,
  "Tý": nguHanhFromDiaChi.TY,
};

export const getNguHanhFromDiaChi = (diaChi) => {
  console.log(diaChi);
  if (!diaChi) return null;
  return NGU_HANH_MAP[diaChi] || null;
};

export const getNguHanhRelation = (h1, h2) => {
  if (!h1 || !h2) return null;
  if (h1 === h2) return "trung";
  const rel = nguHanhRelations[h1];
  if (!rel) return null;
  if (rel.sinh === h2) return "sinh";
  if (rel.duocSinh === h2) return "duocSinh";
  if (rel.khac === h2) return "khac";
  if (rel.biKhac === h2) return "biKhac";
  return null;
};
