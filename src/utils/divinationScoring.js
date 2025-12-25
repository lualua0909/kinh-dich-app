import { getNguHanhFromDiaChi } from "./nguHanh";
import { 
  getNhiXungOf, 
  isTamHopDiaChi, 
  isNhiHopDiaChi, 
  isNhiXungDiaChi, 
  getNhapMoOf 
} from "./diaChi";
import nguHanhRelations from "../data/nguHanhRelations.json";

/**
 * Xác định quan hệ ngũ hành giữa 2 ngũ hành
 */
export const getNguHanhRelation = (nguHanh1, nguHanh2) => {
  if (!nguHanh1 || !nguHanh2) return null;
  if (nguHanh1 === nguHanh2) return "trung";

  const rel1 = nguHanhRelations[nguHanh1];
  if (!rel1) return null;

  if (rel1.sinh === nguHanh2) return "sinh"; // nguHanh1 sinh nguHanh2
  if (rel1.duocSinh === nguHanh2) return "duocSinh"; // nguHanh2 sinh nguHanh1
  if (rel1.khac === nguHanh2) return "khac"; // nguHanh1 khắc nguHanh2
  if (rel1.biKhac === nguHanh2) return "biKhac"; // nguHanh2 khắc nguHanh1

  return null;
};

/**
 * Xác định quan hệ tương sinh/tương khắc giữa 2 địa chi
 */
export const getDiaChiRelation = (chi1, chi2) => {
  if (!chi1 || !chi2) return null;
  if (chi1 === chi2) return "bằng";

  const nguHanh1 = getNguHanhFromDiaChi(chi1);
  const nguHanh2 = getNguHanhFromDiaChi(chi2);
  if (!nguHanh1 || !nguHanh2) return null;

  return getNguHanhRelation(nguHanh1.name, nguHanh2.name);
};

/**
 * Tính điểm cho địa chi dựa trên Thái Tuế, Nguyệt Kiến, Nhật Kiến
 */
export const calculateDiaChiForce = (diaChi, yearDiaChi, monthDiaChi, dayDiaChi) => {
  let score = 0;
  const details = [];

  // 1. Năm (Thái Tuế / Tuế Phá)
  if (yearDiaChi) {
    if (diaChi === yearDiaChi) {
      details.push({
        step: "1",
        name: "Thái Tuế",
        matched: true,
        diem: 0,
        description: "Trùng Thái Tuế",
        color: "text-green-600",
      });
    } else if (getNhiXungOf(diaChi) === yearDiaChi) {
      score -= 0.25;
      details.push({
        step: "1",
        name: "Tuế Phá",
        matched: true,
        diem: -0.25,
        description: "Bị Thái Tuế xung (Tuế Phá)",
        color: "text-red-600",
      });
    }
  }

  // 2. Tháng
  if (monthDiaChi) {
    if (diaChi === monthDiaChi) {
      score += 1.75;
      details.push({
        step: "2.1",
        name: "Nguyệt Kiến",
        matched: true,
        diem: 1.75,
        description: "Trùng Nguyệt Kiến",
        color: "text-green-600",
      });
    } else if (isTamHopDiaChi(diaChi, monthDiaChi)) {
      score += 1;
      details.push({
        step: "2.2",
        name: "Tam Hợp Tháng",
        matched: true,
        diem: 1,
        description: "Tam hợp với Tháng",
        color: "text-green-600",
      });
    } else if (isNhiHopDiaChi(diaChi, monthDiaChi)) {
      score += 1;
      details.push({
        step: "2.3",
        name: "Nhị Hợp Tháng",
        matched: true,
        diem: 1,
        description: "Nhị hợp với Tháng",
        color: "text-green-600",
      });
    } else if (isNhiXungDiaChi(diaChi, monthDiaChi)) {
      score -= 1;
      details.push({
        step: "2.4",
        name: "Nguyệt Phá",
        matched: true,
        diem: -1,
        description: "Bị Tháng xung (Nguyệt Phá)",
        color: "text-red-600",
      });
    } else if (getNhapMoOf(diaChi) === monthDiaChi) {
      score -= 0.25;
      details.push({
        step: "2.5",
        name: "Nhập Mộ Tháng",
        matched: true,
        diem: -0.25,
        description: "Nhập mộ tại Tháng",
        color: "text-orange-600",
      });
    } else {
      const nh1 = getNguHanhFromDiaChi(diaChi)?.name;
      const nh2 = getNguHanhFromDiaChi(monthDiaChi)?.name;
      const rel = getNguHanhRelation(nh1, nh2);
      if (rel === "duocSinh" || rel === "trung") {
        score += 0.75;
        details.push({
          step: "2.6",
          name: "Ngũ Hành Tháng",
          matched: true,
          diem: 0.75,
          description: "Được Tháng sinh hoặc tỷ hòa",
          color: "text-green-600",
        });
      } else if (rel === "sinh" || rel === "khac") {
        score -= 0.25;
        details.push({
          step: "2.6",
          name: "Ngũ Hành Tháng",
          matched: true,
          diem: -0.25,
          description: "Sinh Tháng hoặc khắc Tháng",
          color: "text-orange-600",
        });
      } else if (rel === "biKhac") {
        score -= 0.75;
        details.push({
          step: "2.6",
          name: "Ngũ Hành Tháng",
          matched: true,
          diem: -0.75,
          description: "Bị Tháng khắc",
          color: "text-red-600",
        });
      }
    }
  }

  // 3. Ngày
  if (dayDiaChi) {
    if (diaChi === dayDiaChi) {
      score += 1.75;
      details.push({
        step: "3.1",
        name: "Nhật Kiến",
        matched: true,
        diem: 1.75,
        description: "Trùng Nhật Kiến",
        color: "text-green-600",
      });
    } else if (isTamHopDiaChi(diaChi, dayDiaChi)) {
      score += 1;
      details.push({
        step: "3.2",
        name: "Tam Hợp Ngày",
        matched: true,
        diem: 1,
        description: "Tam hợp với Ngày",
        color: "text-green-600",
      });
    } else if (isNhiHopDiaChi(diaChi, dayDiaChi)) {
      score += 1;
      details.push({
        step: "3.3",
        name: "Nhị Hợp Ngày",
        matched: true,
        diem: 1,
        description: "Nhị hợp với Ngày",
        color: "text-green-600",
      });
    } else if (isNhiXungDiaChi(diaChi, dayDiaChi)) {
      score -= 1;
      details.push({
        step: "3.4",
        name: "Nhật Phá",
        matched: true,
        diem: -1,
        description: "Bị Ngày xung (Nhật Phá)",
        color: "text-red-600",
      });
    } else if (getNhapMoOf(diaChi) === dayDiaChi) {
      score -= 0.25;
      details.push({
        step: "3.5",
        name: "Nhập Mộ Ngày",
        matched: true,
        diem: -0.25,
        description: "Nhập mộ tại Ngày",
        color: "text-orange-600",
      });
    } else {
      const nh1 = getNguHanhFromDiaChi(diaChi)?.name;
      const nh2 = getNguHanhFromDiaChi(dayDiaChi)?.name;
      const rel = getNguHanhRelation(nh1, nh2);
      if (rel === "duocSinh" || rel === "trung") {
        score += 1;
        details.push({
          step: "3.6",
          name: "Ngũ Hành Ngày",
          matched: true,
          diem: 1,
          description: "Được Ngày sinh hoặc tỷ hòa",
          color: "text-green-600",
        });
      } else if (rel === "khac") {
        score -= 0.5;
        details.push({
          step: "3.6",
          name: "Ngũ Hành Ngày",
          matched: true,
          diem: -0.5,
          description: "Khắc Ngày",
          color: "text-orange-600",
        });
      } else if (rel === "sinh" || rel === "biKhac") {
        score -= 1;
        details.push({
          step: "3.6",
          name: "Ngũ Hành Ngày",
          matched: true,
          diem: -1,
          description: "Sinh Ngày hoặc bị Ngày khắc",
          color: "text-red-600",
        });
      }
    }
  }

  return { totalScore: score, details };
};
