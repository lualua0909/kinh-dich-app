/**
 * Lục Thú (Six Animals) và Lục Thân (Six Relations) data
 *
 * Data được lưu trong các file JSON riêng để tách biệt với source code
 */

import thanhLongLucThanInfoData from "./lucThuInfo/thanhLongLucThanInfo.json";
import bachHoLucThanInfoData from "./lucThuInfo/bachHoLucThanInfo.json";
import cauTranLucThanInfoData from "./lucThuInfo/cauTranLucThanInfo.json";
import chuTuocLucThanInfoData from "./lucThuInfo/chuTuocLucThanInfo.json";
import dangXaLucThanInfoData from "./lucThuInfo/dangXaLucThanInfo.json";
import huyenVuLucThanInfoData from "./lucThuInfo/huyenVuLucThanInfo.json";
import thanhLongDiaChiInfoData from "./lucThuInfo/thanhLongDiaChiInfo.json";
import bachHoDiaChiInfoData from "./lucThuInfo/bachHoDiaChiInfo.json";
import huyenVuDiaChiInfoData from "./lucThuInfo/huyenVuDiaChiInfo.json";
import dangXaDiaChiInfoData from "./lucThuInfo/dangXaDiaChiInfo.json";
import chuTuocDiaChiInfoData from "./lucThuInfo/chuTuocDiaChiInfo.json";
import cauTranDiaChiInfoData from "./lucThuInfo/cauTranDiaChiInfo.json";
import mappingsData from "./lucThuInfo/mappings.json";

// Import data from JSON files
export const thanhLongLucThanInfo = thanhLongLucThanInfoData as Record<
  string,
  string
>;

export const bachHoLucThanInfo = bachHoLucThanInfoData as Record<
  string,
  string
>;

export const cauTranLucThanInfo = cauTranLucThanInfoData as Record<
  string,
  string
>;

export const chuTuocLucThanInfo = chuTuocLucThanInfoData as Record<
  string,
  string
>;

export const dangXaLucThanInfo = dangXaLucThanInfoData as Record<
  string,
  string
>;

export const huyenVuLucThanInfo = huyenVuLucThanInfoData as Record<
  string,
  string
>;

export const thanhLongDiaChiInfo = thanhLongDiaChiInfoData as Record<
  string,
  string
>;

export const bachHoDiaChiInfo = bachHoDiaChiInfoData as Record<string, string>;

export const huyenVuDiaChiInfo = huyenVuDiaChiInfoData as Record<
  string,
  string
>;

export const dangXaDiaChiInfo = dangXaDiaChiInfoData as Record<string, string>;

export const chuTuocDiaChiInfo = chuTuocDiaChiInfoData as Record<
  string,
  string
>;
export const cauTranDiaChiInfo = cauTranDiaChiInfoData as Record<
  string,
  string
>;

// Import mappings from JSON
export const LUC_TU_CODES = mappingsData.LUC_TU_CODES as Record<string, string>;
export const LUC_TU_NAMES = mappingsData.LUC_TU_NAMES as Record<string, string>;
export const LUC_THAN_CODES = mappingsData.LUC_THAN_CODES as Record<
  string,
  string
>;
export const LUC_THAN_NAMES = mappingsData.LUC_THAN_NAMES as Record<
  string,
  string
>;

export const getLucTuName = (codeOrName: string): string => {
  if (!codeOrName) return "";
  return LUC_TU_NAMES[codeOrName] || codeOrName;
};

export const getLucThanName = (codeOrName: string): string => {
  if (!codeOrName) return "";
  return LUC_THAN_NAMES[codeOrName] || codeOrName;
};

// Import relationship maps from JSON
export const LUC_THAN_SINH_MAP = mappingsData.LUC_THAN_SINH_MAP as Record<
  string,
  string
>;
export const LUC_THAN_KHAC_MAP = mappingsData.LUC_THAN_KHAC_MAP as Record<
  string,
  string
>;

// Helper: chuẩn hoá input (code hoặc tên) về tên Lục Thân đầy đủ
const normalizeLucThan = (value: string): string => {
  if (!value) return "";
  return getLucThanName(value);
};

// Kiểm tra A sinh B? (chỉ xét 1 chiều, không xét sinh ngược lại)
export const isLucThanSinh = (from: string, to: string): boolean => {
  const a = normalizeLucThan(from);
  const b = normalizeLucThan(to);
  if (!a || !b) return false;
  return LUC_THAN_SINH_MAP[a] === b;
};

// Kiểm tra A khắc B? (chỉ xét 1 chiều, không xét khắc ngược lại)
export const isLucThanKhac = (from: string, to: string): boolean => {
  const a = normalizeLucThan(from);
  const b = normalizeLucThan(to);
  if (!a || !b) return false;
  return LUC_THAN_KHAC_MAP[a] === b;
};
