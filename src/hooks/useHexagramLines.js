import { useMemo } from "react";
import { generateLineData } from "../data/lines";
import {
  getLucThanName,
  isLucThanSinh,
  isLucThanKhac
} from "../data/lucThuInfo";

/**
 * Chuẩn hoá logic tính vị trí các hào trong quẻ.
 *
 * - Dữ liệu gốc:
 *   - `hexagram.lines`: mảng 6 phần tử, lưu từ dưới lên (hào 1 → hào 6)
 *   - `generateLineData(id, dayCanChi)`: trả về LineData với `hao` = 1..6 (từ dưới lên)
 *
 * - Dữ liệu trả về của hook:
 *   - Mảng 6 phần tử, **đã sắp xếp từ trên xuống** (hào 6 → hào 1)
 *   - Mỗi phần tử: { index, hao, lineType, lineData, isMoving, isDungThan, isNguyenThan, isKyThan, isCuuThan, isTietThan }
 * 
 * @param hexagram - Quẻ cần xử lý
 * @param movingLine - Hào động (1-6) hoặc null
 * @param dungThan - Hào Dụng Thần (1-6) hoặc null
 * @param dayCanChi - Can Chi của ngày gieo quẻ (ví dụ: "Giáp Tý") để tính Lục Thú
 */
export function useHexagramLines(hexagram, movingLine = null, dungThan = null, dayCanChi = null) {
  return useMemo(() => {
    if (!hexagram) return [];

    // Line data chuẩn (hào 1 → 6, từ dưới lên)
    // dayCanChi dùng để tính Lục Thú dựa trên Thiên Can ngày
    const baseLineData = generateLineData(hexagram.id, dayCanChi);

    // Đổi sang map theo số hào cho dễ tra cứu
    const lineDataByHao = {};
    baseLineData.forEach((ld) => {
      lineDataByHao[ld.hao] = ld;
    });

    // dungThan: hao number (1-6) or null
    // Chỉ có 1 hào được chọn làm Dụng Thần
    const dungThanHao = dungThan ? Number(dungThan) : null;
    const dungThanHaos = dungThanHao ? [dungThanHao] : [];
    
    // Lấy Lục Thân của hào Dụng Thần (nếu có) để tính Nguyên/Kỵ/Cừu/Tiết Thần
    const dungThanLineData = dungThanHao ? lineDataByHao[dungThanHao] : null;
    const selectedDungThanName = dungThanLineData && dungThanLineData.lucThan
      ? getLucThanName(dungThanLineData.lucThan)
      : null;

    // Chuẩn hoá thành mảng từ trên xuống: index 0 = hào 6, index 5 = hào 1
    const result = [];
    for (let index = 0; index < 6; index++) {
      const hao = 6 - index; // 6,5,...,1

      // hexagram.lines lưu từ dưới lên: lines[0] = hào 1
      const lineType = hexagram.lines[hao - 1];
      const lineData = lineDataByHao[hao] || null;

      const isMoving = movingLine === hao;
      const isDungThan = dungThanHaos.includes(hao);
      const isNguyenThan =
        !!selectedDungThanName &&
        !!lineData &&
        !!lineData.lucThan &&
        !isDungThan &&
        isLucThanSinh(lineData.lucThan, selectedDungThanName);
      const isKyThan =
        !!selectedDungThanName &&
        !!lineData &&
        !!lineData.lucThan &&
        !isDungThan &&
        isLucThanKhac(lineData.lucThan, selectedDungThanName);
      const isCuuThan =
        !!selectedDungThanName &&
        !!lineData &&
        !!lineData.lucThan &&
        !isDungThan &&
        isLucThanKhac(selectedDungThanName, lineData.lucThan);
      const isTietThan =
        !!selectedDungThanName &&
        !!lineData &&
        !!lineData.lucThan &&
        !isDungThan &&
        isLucThanSinh(selectedDungThanName, lineData.lucThan);

      result.push({
        index,
        hao,
        lineType,
        lineData,
        isMoving,
        isDungThan,
        isNguyenThan,
        isKyThan,
        isCuuThan,
        isTietThan
      });
    }

    return result;
  }, [hexagram, movingLine, dungThan, dayCanChi]);
}
