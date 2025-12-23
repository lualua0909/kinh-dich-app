import { useMemo } from "react";
import { generateLineData } from "../data/lines";
import {
  getLucThanName,
  isLucThanSinh,
  isLucThanKhac
} from "../data/lucThuInfo";
import { extractDiaChi, isNhiXungDiaChi } from "../utils/diaChi";
import { getNguHanhFromDiaChi, getNguHanhRelation } from "../utils/nguHanh";

/**
 * Chuẩn hoá logic tính vị trí các hào trong quẻ.
 *
 * - Dữ liệu gốc:
 *   - `hexagram.lines`: mảng 6 phần tử, lưu từ dưới lên (hào 1 → hào 6)
 *   - `generateLineData(id, dayCanChi)`: trả về LineData với `hao` = 1..6 (từ dưới lên)
 *
 * - Dữ liệu trả về của hook:
 *   - Mảng 6 phần tử, **đã sắp xếp từ trên xuống** (hào 6 → hào 1)
 *   - Mỗi phần tử: { index, hao, lineType, lineData, isMoving, isDungThan, isNguyenThan, isKyThan, isCuuThan, isTietThan, isAmDong }
 * 
 * @param hexagram - Quẻ cần xử lý
 * @param movingLines - Danh sách hào động (1-6) hoặc null
 * @param dungThan - Hào Dụng Thần (1-6) hoặc null
 * @param dayCanChi - Can Chi của ngày gieo quẻ (ví dụ: "Giáp Tý")
 * @param monthCanChi - Can Chi của tháng gieo quẻ
 * @param checkAmDong - Có tính hào ám động không (mặc định true)
 */
export function useHexagramLines(hexagram, movingLines = [], dungThan = null, dayCanChi = null, monthCanChi = null, checkAmDong = true) {
  return useMemo(() => {
    if (!hexagram) return [];

    // Đảm bảo movingLines luôn là mảng
    const movingLinesArr = Array.isArray(movingLines) ? movingLines : (movingLines ? [movingLines] : []);

    // Line data chuẩn (hào 1 → 6, từ dưới lên)
    const baseLineData = generateLineData(hexagram.id, dayCanChi);

    // Đổi sang map theo số hào cho dễ tra cứu
    const lineDataByHao = {};
    baseLineData.forEach((ld) => {
      lineDataByHao[ld.hao] = ld;
    });

    // dungThan: hao number (1-6) or null
    const dungThanHao = dungThan ? Number(dungThan) : null;
    const dungThanHaos = dungThanHao ? [dungThanHao] : [];
    
    // Lấy Lục Thân của hào Dụng Thần
    const dungThanLineData = dungThanHao ? lineDataByHao[dungThanHao] : null;
    const selectedDungThanName = dungThanLineData && dungThanLineData.lucThan
      ? getLucThanName(dungThanLineData.lucThan)
      : null;

    // Chuẩn bị thông tin ngày/tháng để tính Ám Động
    const dayChi = dayCanChi ? extractDiaChi(dayCanChi) : null;
    const monthChi = monthCanChi ? extractDiaChi(monthCanChi) : null;
    const monthElement = monthChi ? getNguHanhFromDiaChi(monthChi)?.name : null;

    // Hào động (nếu có) để tính Rule 1 Ám Động
    // Lấy tất cả các hào động để check quan hệ sinh khắc
    const movingHaoElements = movingLinesArr.map(ml => {
      const record = lineDataByHao[ml];
      const chi = record ? extractDiaChi(record.canChi) : null;
      return chi ? getNguHanhFromDiaChi(chi)?.name : null;
    }).filter(Boolean);

    // Chuẩn hoá thành mảng từ trên xuống: index 0 = hào 6, index 5 = hào 1
    const result = [];
    for (let index = 0; index < 6; index++) {
      const hao = 6 - index; // 6,5,...,1

      const lineType = hexagram.lines[hao - 1];
      const lineData = lineDataByHao[hao] || null;
      const lineChi = lineData ? extractDiaChi(lineData.canChi) : null;
      const lineElement = lineChi ? getNguHanhFromDiaChi(lineChi)?.name : null;

      const isMoving = movingLinesArr.includes(hao);
      const isDungThan = dungThanHaos.includes(hao);
      
      // Ám Động Logic
      let isAmDong = false;
      if (checkAmDong && !isMoving && lineChi) {
        // Quy tắc 1
        const isSupportedByMoving = movingHaoElements.some(me => getNguHanhRelation(me, lineElement) === "sinh");
        
        const rule1 = 
          dayChi && isNhiXungDiaChi(lineChi, dayChi) &&
          isSupportedByMoving &&
          (lineChi === monthChi || (monthElement && getNguHanhRelation(monthElement, lineElement) === "sinh"));

        // Quy tắc 2
        const rule2 = (lineChi === monthChi) || (lineChi === dayChi);

        isAmDong = rule1 || rule2;
      }

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
        isAmDong,
        isDungThan,
        isNguyenThan,
        isKyThan,
        isCuuThan,
        isTietThan
      });
    }

    return result;
  }, [hexagram, movingLines, dungThan, dayCanChi, monthCanChi, checkAmDong]);
}
