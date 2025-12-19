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
 *   - `generateLineData(id)`: trả về LineData với `hao` = 1..6 (từ dưới lên)
 *
 * - Dữ liệu trả về của hook:
 *   - Mảng 6 phần tử, **đã sắp xếp từ trên xuống** (hào 6 → hào 1)
 *   - Mỗi phần tử: { index, hao, lineType, lineData, isMoving, isDungThan, isNguyenThan, isKyThan, isCuuThan, isTietThan }
 */
export function useHexagramLines(hexagram, movingLine = null, dungThan = null) {
  return useMemo(() => {
    if (!hexagram) return [];

    // Line data chuẩn (hào 1 → 6, từ dưới lên)
    const baseLineData = generateLineData(hexagram.id);

    // Đổi sang map theo số hào cho dễ tra cứu
    const lineDataByHao = {};
    baseLineData.forEach((ld) => {
      lineDataByHao[ld.hao] = ld;
    });

    const selectedDungThanName = dungThan ? getLucThanName(dungThan) : null;

    // Xác định các hào được coi là Dụng thần:
    // - Nếu Lục Thân của hào động trùng Dụng thần → chỉ lấy hào động
    // - Ngược lại, tất cả các hào có Lục Thân trùng Dụng thần đều là Dụng thần
    let dungThanHaos = [];
    if (selectedDungThanName) {
      const matchingHaos = baseLineData
        .filter((ld) => getLucThanName(ld.lucThan) === selectedDungThanName)
        .map((ld) => ld.hao);

      if (movingLine && matchingHaos.includes(movingLine)) {
        dungThanHaos = [movingLine];
      } else {
        dungThanHaos = matchingHaos;
      }
    }

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
  }, [hexagram, movingLine, dungThan]);
}
