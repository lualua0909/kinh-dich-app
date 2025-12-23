import nguHanhRelations from "../data/nguHanhRelations.json";

export const NGU_HANH_MAP = {
  Dần: { name: "Mộc", color: "text-green-600 bg-green-50" },
  Mão: { name: "Mộc", color: "text-green-600 bg-green-50" },
  Tỵ: { name: "Hỏa", color: "text-red-600 bg-red-50" },
  Ngọ: { name: "Hỏa", color: "text-red-600 bg-red-50" },
  Thìn: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
  Tuất: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
  Sửu: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
  Mùi: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
  Thân: { name: "Kim", color: "text-yellow-600 bg-yellow-50" },
  Dậu: { name: "Kim", color: "text-yellow-600 bg-yellow-50" },
  Hợi: { name: "Thủy", color: "text-blue-600 bg-blue-50" },
  Tý: { name: "Thủy", color: "text-blue-600 bg-blue-50" },
};

export const getNguHanhFromDiaChi = (diaChi) => {
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
