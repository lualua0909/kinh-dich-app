import { useMemo } from "react";
import { useHexagramLines } from "./useHexagramLines";
import { anVongTruongSinhByCan } from "../utils/truongSinh";
import { extractDiaChi, DIA_CHI_CODES } from "../utils/diaChi";
import { getNguHanhFromDiaChi } from "../utils/nguHanh";

export const useDivinationData = (originalHexagram, changedHexagram, movingLines, dungThan, metadata) => {
  const dayCanChi = metadata?.dayCanChi;
  const monthCanChi = metadata?.monthCanChi;

  const normalizedLines1 = useHexagramLines(
    originalHexagram,
    movingLines,
    dungThan,
    dayCanChi,
    monthCanChi
  );
  const lineData1 = normalizedLines1.map((l) => l.lineData);

  const normalizedLines2 = useHexagramLines(
    changedHexagram,
    null,
    dungThan,
    dayCanChi,
    monthCanChi,
    false
  );
  const lineData2 = normalizedLines2.map((l) => l.lineData);

  // Calculate Trường Sinh cho cột Ngày
  const truongSinhNgay1 = useMemo(() => {
    if (!dayCanChi || lineData1.length !== 6) return [];
    const haoList = lineData1.map(l => ({
      viTri: l.hao,
      diaChi: DIA_CHI_CODES[extractDiaChi(l.canChi)] || extractDiaChi(l.canChi),
      nguHanh: getNguHanhFromDiaChi(extractDiaChi(l.canChi))?.name || ""
    })).filter(h => h.diaChi);
    return anVongTruongSinhByCan(dayCanChi, haoList);
  }, [dayCanChi, lineData1]);

  const truongSinhNgay2 = useMemo(() => {
    if (!dayCanChi || !changedHexagram || lineData2.length !== 6) return [];
    const haoList = lineData2.map(l => ({
      viTri: l.hao,
      diaChi: DIA_CHI_CODES[extractDiaChi(l.canChi)] || extractDiaChi(l.canChi),
      nguHanh: getNguHanhFromDiaChi(extractDiaChi(l.canChi))?.name || ""
    })).filter(h => h.diaChi);
    return anVongTruongSinhByCan(dayCanChi, haoList);
  }, [dayCanChi, changedHexagram, lineData2]);

  // Calculate Trường Sinh cho cột Tháng
  const truongSinhThang1 = useMemo(() => {
    if (!monthCanChi || lineData1.length !== 6) return [];
    const haoList = lineData1.map(l => ({
      viTri: l.hao,
      diaChi: DIA_CHI_CODES[extractDiaChi(l.canChi)] || extractDiaChi(l.canChi),
      nguHanh: getNguHanhFromDiaChi(extractDiaChi(l.canChi))?.name || ""
    })).filter(h => h.diaChi);
    return anVongTruongSinhByCan(monthCanChi, haoList);
  }, [monthCanChi, lineData1]);

  const truongSinhThang2 = useMemo(() => {
    if (!monthCanChi || !changedHexagram || lineData2.length !== 6) return [];
    const haoList = lineData2.map(l => ({
      viTri: l.hao,
      diaChi: DIA_CHI_CODES[extractDiaChi(l.canChi)] || extractDiaChi(l.canChi),
      nguHanh: getNguHanhFromDiaChi(extractDiaChi(l.canChi))?.name || ""
    })).filter(h => h.diaChi);
    return anVongTruongSinhByCan(monthCanChi, haoList);
  }, [monthCanChi, changedHexagram, lineData2]);

  const truongSinhNgayMap1 = useMemo(() => new Map(truongSinhNgay1.map(r => [r.viTri, r.trangThai])), [truongSinhNgay1]);
  const truongSinhThangMap1 = useMemo(() => new Map(truongSinhThang1.map(r => [r.viTri, r.trangThai])), [truongSinhThang1]);
  const truongSinhNgayMap2 = useMemo(() => new Map(truongSinhNgay2.map(r => [r.viTri, r.trangThai])), [truongSinhNgay2]);
  const truongSinhThangMap2 = useMemo(() => new Map(truongSinhThang2.map(r => [r.viTri, r.trangThai])), [truongSinhThang2]);

  return {
    lineData1,
    lineData2,
    normalizedLines1,
    normalizedLines2,
    truongSinhNgayMap1,
    truongSinhThangMap1,
    truongSinhNgayMap2,
    truongSinhThangMap2,
    dayCanChi,
    monthCanChi
  };
};
