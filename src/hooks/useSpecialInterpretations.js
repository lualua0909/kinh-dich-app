import { useMemo } from "react";
import { getLucThanName, getLucTuName, LUC_TU_CODES } from "../data/lucThuInfo";
import { extractDiaChi, isNhiXungDiaChi, hasFullTamHinhGroup, toDiaChiCode, DIA_CHI_NAMES } from "../utils/diaChi";
import { getNguHanhFromDiaChi } from "../utils/nguHanh";
import { getNguHanhRelation } from "../utils/divinationScoring";

export const useSpecialInterpretations = ({ 
  lineData1, 
  lineData2, 
  movingLines, 
  originalHexagram, 
  changedHexagram, 
  metadata,
  dayDiaChi,
  monthDiaChi 
}) => {

  // Logic: Luận Sảy Bỏ Con
  const sayBoCon = useMemo(() => {
    const tuTonHao1 = lineData1.find(l => getLucThanName(l.lucThan) === "Tử Tôn");
    const tuTonHao2 = lineData2.find(l => getLucThanName(l.lucThan) === "Tử Tôn");
    const tuTonHao = tuTonHao1 || tuTonHao2;

    if (!tuTonHao) return null;

    const tuTonDiaChi = extractDiaChi(tuTonHao.canChi);
    if (!tuTonDiaChi) return null;

    const allDiaChi = [
      dayDiaChi,
      monthDiaChi,
      ...lineData1.map(l => extractDiaChi(l.canChi)),
      ...lineData2.map(l => extractDiaChi(l.canChi))
    ].filter(Boolean);

    const tamHinhCheck = hasFullTamHinhGroup(allDiaChi);
    const normalizedTuTon = toDiaChiCode(tuTonDiaChi);
    const isPartOfTamHinh = tamHinhCheck.hasFullGroup && tamHinhCheck.groupMembers.includes(normalizedTuTon);

    return {
      tuTonHao,
      tuTonDiaChi,
      isPartOfTamHinh,
      tamHinhGroup: tamHinhCheck.groupMembers?.map(code => DIA_CHI_NAMES[code] || code) || []
    };
  }, [lineData1, lineData2, dayDiaChi, monthDiaChi]);

  // Logic: Vợ/Chồng Đã Từng Kết Hôn
  const { voDaTungKetHon, chongDaTungKetHon } = useMemo(() => {
    const checkPreviousMarriage = (targetLucThan) => {
      const targetLines = lineData1.filter(l => getLucThanName(l.lucThan) === targetLucThan);
      for (const tLine of targetLines) {
        const isUpper = tLine.hao >= 4;
        const phuMauLines = lineData1.filter(l => {
          const isLUpper = l.hao >= 4;
          return getLucThanName(l.lucThan) === "Phụ Mẫu" && isLUpper === isUpper;
        });

        for (const pmLine of phuMauLines) {
          const pmIndex = lineData1.findIndex(l => l.hao === pmLine.hao);
          const pmChangedLine = lineData2[pmIndex];

          if (pmChangedLine && pmChangedLine.tuanKhong !== "K") {
            const tIndex = lineData1.findIndex(l => l.hao === tLine.hao);
            const tChangedLine = lineData2[tIndex];
            const lucTuName = getLucTuName(tChangedLine.lucTu);
            const lucTuCode = LUC_TU_CODES[lucTuName] || tChangedLine.lucTu;

            if (lucTuCode === "CT") {
              return {
                matched: true,
                type: targetLucThan,
                description: `Hào Phụ Mẫu cùng quái với ${targetLucThan} biến không Tuần Không, và ${targetLucThan} biến lâm Chu Tước. Cho thấy có khả năng người này đã từng kết hôn hoặc có mối tình sâu đậm trước đây.`,
                targetHao: tLine.hao,
                phuMauHao: pmLine.hao
              };
            }
          }
        }
      }
      return null;
    };

    return {
      voDaTungKetHon: checkPreviousMarriage("Thê Tài"),
      chongDaTungKetHon: checkPreviousMarriage("Quan Quỷ")
    };
  }, [lineData1, lineData2]);

  // Logic: Phong Thủy Nhà
  const phongThuyNha = useMemo(() => {
    const hao2 = lineData1.find(l => l.hao === 2);
    const hao5 = lineData1.find(l => l.hao === 5);
    if (hao2 && hao5) {
      const dc2 = extractDiaChi(hao2.canChi);
      const dc5 = extractDiaChi(hao5.canChi);
      const nh2 = getNguHanhFromDiaChi(dc2)?.name;
      const nh5 = getNguHanhFromDiaChi(dc5)?.name;
      if (nh2 && nh5) {
        const rel = getNguHanhRelation(nh2, nh5);
        if (rel === "khac" || rel === "biKhac") {
          return {
            matched: true,
            nh2, nh5,
            content: `Hào 2 (Trạch/Nhà) mang hành ${nh2} và Hào 5 (Nhân/Người) mang hành ${nh5} có mối quan hệ tương khắc.`
          };
        }
      }
    }
    return null;
  }, [lineData1]);

  // Logic: Khác
  const khacResults = useMemo(() => {
    const results = [];
    const names = [originalHexagram?.name, changedHexagram?.name].filter(Boolean);
    names.forEach(name => {
      const upperName = name.toUpperCase();
      if (upperName === "HỎA SƠN LỮ") results.push({ title: "Quẻ Hỏa Sơn Lữ", content: "Cần kiểm tra phong thuỷ của phòng khách, nhà kho hoặc nơi cất tạm bợ." });
      if (upperName.includes("BÍ")) results.push({ title: `Quẻ ${name}`, content: "Cần kiểm tra bóng đèn trong nhà, trên bàn thờ hoặc di ảnh." });
      if (upperName.includes("TỶ")) results.push({ title: `Quẻ ${name}`, content: "Người con lớn, người có trách nhiệm, tiếng nói trong gia đình, người lãnh đạo công ty" });
      if (upperName === "THIÊN LÔI VÔ VỌNG") results.push({ title: "Quẻ Thiên Lôi Vô Vọng", content: "Nhà có vong, vong bị đói khát không được cúng kiếng." });
      if (upperName === "QUY MUỘI") results.push({ title: "Quẻ Quy Muội", content: "Nhà có vong, nhà có đồ chất đống, nhà có người làm chuyện mờ ám" });
    });

    // Hào 6 Phụ Mẫu nhị xung hào động
    movingLines.forEach(ml => {
      const hao6 = lineData1[0];
      const movingHao = lineData1.find(l => l.hao === ml);
      if (hao6 && movingHao && getLucThanName(hao6.lucThan) === "Phụ Mẫu") {
        const dc6 = extractDiaChi(hao6.canChi);
        const dcM = extractDiaChi(movingHao.canChi);
        if (isNhiXungDiaChi(dc6, dcM)) {
          results.push({ title: `Hào 6 Phụ Mẫu nhị xung Hào Động (${ml})`, content: "Có khả năng là mộ phần nứt nẻ hoặc bệnh đau đầu." });
        }
      }
    });

    return results;
  }, [originalHexagram, changedHexagram, movingLines, lineData1]);

  // Logic: Luận Cây Trước Nhà
  const cayTruocNha = useMemo(() => {
    const results = [];
    lineData1.forEach((l1, idx) => {
      const diaChi = extractDiaChi(l1.canChi);
      if (["Dần", "Mão"].includes(diaChi)) {
        const l2 = lineData2[idx];
        if (l2) {
          const lucTuName = getLucTuName(l2.lucTu);
          if (["Thanh Long", "Bạch Hổ", "Chu Tước"].includes(lucTuName)) {
            // Determine position
            let viTri = "";
            if (lucTuName === "Thanh Long") viTri = "Bên trái";
            else if (lucTuName === "Bạch Hổ") viTri = "Bên phải";
            else if (lucTuName === "Chu Tước") viTri = "Phía trước";

            // Determine tree type
            let loaiCay = "";
            let caySize = "medium";
            let cayColor = "#22c55e";
            if (diaChi === "Dần") {
              loaiCay = "Cây to thân gỗ";
              caySize = "large";
              cayColor = "#166534";
            } else if (diaChi === "Mão") {
              loaiCay = "Cây cỏ hoặc thân leo hoặc bụi cây";
              caySize = "small";
              cayColor = "#86efac";
            }

            results.push({
              hao: l1.hao,
              diaChi,
              canChi: l1.canChi,
              lucTu: lucTuName,
              viTri,
              loaiCay,
              caySize,
              cayColor
            });
          }
        }
      }
    });
    return results;
  }, [lineData1, lineData2]);

  return {
    sayBoCon,
    voDaTungKetHon,
    chongDaTungKetHon,
    phongThuyNha,
    khacResults,
    cayTruocNha
  };
};
