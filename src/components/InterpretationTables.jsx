import React, { useState } from "react";
import { Table, Card, Tooltip, Drawer, Modal } from "antd";
import ReactMarkdown from "react-markdown";
import { getDungThanInfo } from "../data/dungThan";
import {
  thanhLongLucThanInfo,
  bachHoLucThanInfo,
  cauTranLucThanInfo,
  chuTuocLucThanInfo,
  dangXaLucThanInfo,
  huyenVuLucThanInfo,
  thanhLongDiaChiInfo,
  bachHoDiaChiInfo,
  huyenVuDiaChiInfo,
  dangXaDiaChiInfo,
  chuTuocDiaChiInfo,
  cauTranDiaChiInfo,
  LUC_TU_CODES,
  LUC_THAN_CODES,
  getLucTuName,
  getLucThanName,
  isLucThanSinh,
  isLucThanKhac
} from "../data/lucThuInfo";
import { getHexagramOmen } from "../data/hexagramOmens";
import { getHexagramMeaning } from "../data/hexagramMeanings";
import { UserOutlined } from "@ant-design/icons";
import { useHexagramLines } from "../hooks/useHexagramLines";
import {
  getNhiHopOf,
  getNhiXungOf,
  getTamHopGroupOf,
  getNhapMoOf,
  getDiaChiNhapMoTai,
  isTamHopDiaChi,
  isNhiHopDiaChi,
  isNhiXungDiaChi
} from "../utils/diaChi";
/**
 * InterpretationTables component - displays TỨC ĐIỀU PHÁN SÀO and NHÂN ĐOÁN TÁO CAO tables
 * TỨC ĐIỀU PHÁN SÀO: uses original hexagram
 * NHÂN ĐOÁN TÁO CAO: uses changed hexagram
 */
export default function InterpretationTables({
  originalHexagram,
  changedHexagram,
  movingLine,
  dungThan = null,
  metadata = null
}) {
  if (!originalHexagram) {
    return null;
  }

  // Chuẩn hoá dữ liệu hào cho quẻ gốc & quẻ biến (từ trên xuống: hào 6 → hào 1)
  const normalizedLines1 = useHexagramLines(
    originalHexagram,
    movingLine,
    dungThan
  );
  const lineData1 = normalizedLines1.map((l) => l.lineData);
  const lines1 = normalizedLines1.map((l) => l.lineType);
  const dungThanHaos1 = new Set(
    normalizedLines1.filter((l) => l.isDungThan).map((l) => l.hao)
  );
  const nguyenThanHaos1 = new Set(
    normalizedLines1.filter((l) => l.isNguyenThan).map((l) => l.hao)
  );
  const kyThanHaos1 = new Set(
    normalizedLines1.filter((l) => l.isKyThan).map((l) => l.hao)
  );
  const cuuThanHaos1 = new Set(
    normalizedLines1.filter((l) => l.isCuuThan).map((l) => l.hao)
  );
  const tietThanHaos1 = new Set(
    normalizedLines1.filter((l) => l.isTietThan).map((l) => l.hao)
  );

  const normalizedLines2 = useHexagramLines(changedHexagram, null, dungThan);
  const lineData2 = normalizedLines2.map((l) => l.lineData);
  const lines2 = normalizedLines2.map((l) => l.lineType);
  const dungThanHaos2 = new Set(
    normalizedLines2.filter((l) => l.isDungThan).map((l) => l.hao)
  );

  // Component to render hào line
  const renderHaoLine = (
    hao,
    lineType,
    isMoving,
    isDungThan = false,
    isNguyenThan = false,
    isKyThan = false,
    isCuuThan = false,
    isTietThan = false
  ) => {
    const isYang = lineType === 1;
    const lineColor = isMoving ? "bg-red-600" : "bg-gray-800";

    return (
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="flex items-center justify-center">
          {isYang ? (
            // Yang line (solid)
            <div className={`h-2 w-12 ${lineColor} rounded-full`} />
          ) : (
            // Yin line (broken)
            <div className="flex gap-1 items-center">
              <div className={`h-2 w-5 ${lineColor} rounded-full`} />
              <div className="h-2 w-1 bg-transparent" />
              <div className={`h-2 w-5 ${lineColor} rounded-full`} />
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {isDungThan && (
            <span className="text-[10px] leading-none text-green-700 font-semibold">
              Dụng
            </span>
          )}
          {isNguyenThan && (
            <span className="text-[10px] leading-none text-blue-700 font-semibold">
              Nguyên
            </span>
          )}
          {isKyThan && (
            <span className="text-[10px] leading-none text-red-700 font-semibold">
              Kỵ
            </span>
          )}
          {isCuuThan && (
            <span className="text-[10px] leading-none text-orange-700 font-semibold">
              Cừu
            </span>
          )}
          {isTietThan && (
            <span className="text-[10px] leading-none text-emerald-700 font-semibold">
              Tiết
            </span>
          )}
        </div>
      </div>
    );
  };

  // Ngũ hành tương sinh / tương khắc data (dùng cho tooltip)
  const nguHanhRelations = {
    Mộc: {
      sinh: "Hỏa",
      duocSinh: "Thủy",
      khac: "Thổ",
      biKhac: "Kim"
    },
    Hỏa: {
      sinh: "Thổ",
      duocSinh: "Mộc",
      khac: "Kim",
      biKhac: "Thủy"
    },
    Thổ: {
      sinh: "Kim",
      duocSinh: "Hỏa",
      khac: "Thủy",
      biKhac: "Mộc"
    },
    Kim: {
      sinh: "Thủy",
      duocSinh: "Thổ",
      khac: "Mộc",
      biKhac: "Hỏa"
    },
    Thủy: {
      sinh: "Mộc",
      duocSinh: "Kim",
      khac: "Hỏa",
      biKhac: "Thổ"
    }
  };
  // Function to get Ngũ Hành from Địa Chi
  const getNguHanhFromDiaChi = (diaChi) => {
    const nguHanhMap = {
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
      Tý: { name: "Thủy", color: "text-blue-600 bg-blue-50" }
    };
    return nguHanhMap[diaChi] || null;
  };

  // Helper: Extract địa chi từ canChi
  const extractDiaChi = (canChi) => {
    if (!canChi) return null;
    if (canChi.includes("-")) {
      const parts = canChi.split("-");
      return parts[0];
    } else {
      const parts = canChi.split(" ");
      return parts[parts.length - 1];
    }
  };

  // Helper: Xác định quan hệ tương sinh/tương khắc giữa 2 địa chi
  const getDiaChiRelation = (chi1, chi2) => {
    if (!chi1 || !chi2) return null;
    if (chi1 === chi2) return "bằng";

    const nguHanh1 = getNguHanhFromDiaChi(chi1);
    const nguHanh2 = getNguHanhFromDiaChi(chi2);
    if (!nguHanh1 || !nguHanh2) return null;

    const nguHanhRelations = {
      Mộc: { sinh: "Hỏa", duocSinh: "Thủy", khac: "Thổ", biKhac: "Kim" },
      Hỏa: { sinh: "Thổ", duocSinh: "Mộc", khac: "Kim", biKhac: "Thủy" },
      Thổ: { sinh: "Kim", duocSinh: "Hỏa", khac: "Thủy", biKhac: "Mộc" },
      Kim: { sinh: "Thủy", duocSinh: "Thổ", khac: "Mộc", biKhac: "Hỏa" },
      Thủy: { sinh: "Mộc", duocSinh: "Kim", khac: "Hỏa", biKhac: "Thổ" }
    };

    const rel1 = nguHanhRelations[nguHanh1.name];
    if (rel1.sinh === nguHanh2.name) return "sinh"; // chi1 sinh chi2
    if (rel1.duocSinh === nguHanh2.name) return "duocSinh"; // chi2 sinh chi1
    if (rel1.khac === nguHanh2.name) return "khac"; // chi1 khắc chi2
    if (rel1.biKhac === nguHanh2.name) return "biKhac"; // chi2 khắc chi1

    return null;
  };

  // Helper: Lấy địa chi của năm từ metadata
  const getYearDiaChi = () => {
    if (!metadata || !metadata.yearCanChi) return null;
    const parts = metadata.yearCanChi.split(" ");
    return parts[parts.length - 1];
  };

  // Helper: Lấy địa chi của tháng từ metadata
  const getMonthDiaChi = () => {
    if (!metadata || !metadata.monthCanChi) return null;
    const parts = metadata.monthCanChi.split(" ");
    return parts[parts.length - 1];
  };

  // Helper: Lấy địa chi của ngày từ metadata
  const getDayDiaChi = () => {
    if (!metadata || !metadata.dayCanChi) return null;
    const parts = metadata.dayCanChi.split(" ");
    return parts[parts.length - 1];
  };

  // Helper: Xác định quan hệ ngũ hành giữa 2 ngũ hành
  const getNguHanhRelation = (nguHanh1, nguHanh2) => {
    if (!nguHanh1 || !nguHanh2) return null;
    if (nguHanh1 === nguHanh2) return "trung"; // Trùng nhau

    const nguHanhRelations = {
      Mộc: { sinh: "Hỏa", duocSinh: "Thủy", khac: "Thổ", biKhac: "Kim" },
      Hỏa: { sinh: "Thổ", duocSinh: "Mộc", khac: "Kim", biKhac: "Thủy" },
      Thổ: { sinh: "Kim", duocSinh: "Hỏa", khac: "Thủy", biKhac: "Mộc" },
      Kim: { sinh: "Thủy", duocSinh: "Thổ", khac: "Mộc", biKhac: "Hỏa" },
      Thủy: { sinh: "Mộc", duocSinh: "Kim", khac: "Hỏa", biKhac: "Thổ" }
    };

    const rel1 = nguHanhRelations[nguHanh1];
    if (!rel1) return null;

    if (rel1.sinh === nguHanh2) return "sinh"; // nguHanh1 sinh nguHanh2
    if (rel1.duocSinh === nguHanh2) return "duocSinh"; // nguHanh2 sinh nguHanh1
    if (rel1.khac === nguHanh2) return "khac"; // nguHanh1 khắc nguHanh2
    if (rel1.biKhac === nguHanh2) return "biKhac"; // nguHanh2 khắc nguHanh1

    return null;
  };

  const renderNguHanhTooltip = (nguHanhName) => {
    const rel = nguHanhRelations[nguHanhName];
    if (!rel) return nguHanhName;

    return (
      <div className="max-w-xs text-xs space-y-2">
        <div className="font-bold mb-1 text-sm">{nguHanhName}</div>
        <div>
          <span className="font-semibold text-green-600">Tương sinh:</span>
          <div className="ml-2 mt-1">
            <div>
              → Sinh ra: <span className="font-bold">{rel.sinh}</span>
            </div>
            <div>
              ← Được sinh bởi: <span className="font-bold">{rel.duocSinh}</span>
            </div>
          </div>
        </div>
        <div className="pt-2 border-t border-gray-300">
          <span className="font-semibold text-red-600">Tương khắc:</span>
          <div className="ml-2 mt-1">
            <div>
              → Khắc: <span className="font-bold">{rel.khac}</span>
            </div>
            <div>
              ← Bị khắc bởi: <span className="font-bold">{rel.biKhac}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mã Địa Chi (Tý, Sửu, Dần...) dùng cho phân loại Lục Tú lâm Địa Chi
  const diaChiCodeMap = {
    Tý: "TY",
    Sửu: "SU",
    Dần: "DN",
    Mão: "MA",
    Thìn: "TH",
    Tỵ: "TI",
    Ngọ: "NG",
    Mùi: "MU",
    Thân: "TN",
    Dậu: "DA",
    Tuất: "TU",
    Hợi: "HO"
  };

  // (thanhLongDiaChiInfo được định nghĩa phía dưới, sau phần lucTuInfo)

  // State for fullscreen Lục Thú drawer
  const [lucTuDrawerData, setLucTuDrawerData] = React.useState(null);

  // State for hexagram meaning modal
  const [hexagramModalData, setHexagramModalData] = useState(null);

  const openLucTuDrawer = (lucTu, record) => {
    if (!lucTu) return;
    const lucTuName = getLucTuName(lucTu);
    setLucTuDrawerData({ lucTu: lucTuName, record });
  };

  const closeLucTuDrawer = () => {
    setLucTuDrawerData(null);
  };

  const openHexagramModal = (hexagramKey, hexagramName, omen) => {
    setHexagramModalData({ hexagramKey, hexagramName, omen });
  };

  const closeHexagramModal = () => {
    setHexagramModalData(null);
  };

  const getClassification = (lucTu, lucThan) => {
    if (!lucTu || !lucThan) return null;
    const tuName = getLucTuName(lucTu);
    const thanName = getLucThanName(lucThan);

    const tuCode = LUC_TU_CODES[tuName] || lucTu || "--";
    const thanCode = LUC_THAN_CODES[thanName] || lucThan || "--";

    const code = `${tuCode}-${thanCode}`;
    return {
      label: `${tuName} lâm ${thanName}`,
      code
    };
  };

  const getClassificationDiaChi = (lucTu, canChi) => {
    if (!lucTu || !canChi) return null;

    const parts = canChi.split(" ");
    const diaChi = parts[parts.length - 1];

    const tuName = getLucTuName(lucTu);
    const tuCode = LUC_TU_CODES[tuName] || lucTu || "--";
    const chiCode = diaChiCodeMap[diaChi] || "--";
    const code = `${tuCode}-${chiCode}`;

    return {
      label: `${tuName} lâm ${diaChi}`,
      code
    };
  };

  // Function to render tooltip for Địa Chi showing Tam Hợp, Nhị Hợp, Nhị Xung
  const renderDiaChiTooltip = (diaChi) => {
    if (!diaChi) return null;

    const nhiHop = getNhiHopOf(diaChi);
    const nhiXung = getNhiXungOf(diaChi);
    const tamHopGroup = getTamHopGroupOf(diaChi);
    const tamHopPartners = tamHopGroup
      ? tamHopGroup.filter((c) => c !== diaChi)
      : [];
    const nhapMo = getNhapMoOf(diaChi);
    const diaChiNhapMoTai = getDiaChiNhapMoTai(diaChi);

    return (
      <div className="max-w-xs text-xs space-y-2">
        <div className="font-bold mb-2 text-sm">{diaChi}</div>

        {nhiHop && (
          <div>
            <span className="font-semibold text-green-600">Nhị Hợp:</span>{" "}
            <span className="font-bold">{nhiHop}</span>
          </div>
        )}

        {nhiXung && (
          <div>
            <span className="font-semibold text-red-600">Nhị Xung:</span>{" "}
            <span className="font-bold">{nhiXung}</span>
          </div>
        )}

        {tamHopPartners.length === 2 && (
          <div>
            <span className="font-semibold text-blue-600">Tam Hợp:</span>{" "}
            <span className="font-bold">
              {tamHopPartners.join(", ")} (cùng với {diaChi})
            </span>
          </div>
        )}

        {nhapMo && (
          <div>
            <span className="font-semibold text-purple-600">Nhập Mộ tại:</span>{" "}
            <span className="font-bold">{nhapMo}</span>
          </div>
        )}

        {diaChiNhapMoTai.length > 0 && (
          <div>
            <span className="font-semibold text-purple-600">Là mộ của:</span>{" "}
            <span className="font-bold">{diaChiNhapMoTai.join(", ")}</span>
          </div>
        )}
      </div>
    );
  };

  // Function to render Can Chi with Ngũ Hành
  const renderCanChi = (canChi) => {
    if (!canChi) return "-";

    // Extract Địa Chi
    // Support both formats: "Giáp Tý" (Địa Chi is last part) and "Tuất-Thổ" (Địa Chi is first part)
    let diaChi;
    if (canChi.includes("-")) {
      // Format "Tuất-Thổ": Địa Chi is the first part
      const parts = canChi.split("-");
      diaChi = parts[0];
    } else {
      // Format "Giáp Tý": Địa Chi is the last part
      const parts = canChi.split(" ");
      diaChi = parts[parts.length - 1];
    }
    const nguHanh = getNguHanhFromDiaChi(diaChi);

    return (
      <div className="flex flex-col items-center gap-1">
        <Tooltip
          title={renderDiaChiTooltip(diaChi)}
          placement="top"
          overlayClassName="tooltip-custom"
        >
          <span className="cursor-help">{canChi}</span>
        </Tooltip>
        {nguHanh && (
          <Tooltip title={renderNguHanhTooltip(nguHanh.name)} placement="top">
            <span
              className={`text-xs px-2 py-0.5 rounded ${nguHanh.color} font-semibold cursor-help`}
            >
              {nguHanh.name}
            </span>
          </Tooltip>
        )}
      </div>
    );
  };

  const renderLucThanTooltip = (lucThan) => {
    const fullLucThan = getLucThanName(lucThan);
    const info = getDungThanInfo(fullLucThan);
    if (!info) return fullLucThan;

    return (
      <div className="max-w-xs text-xs space-y-2">
        <div className="font-bold mb-1 text-sm">{info.label}</div>
        <div>
          <span className="font-semibold">Mô tả:</span>{" "}
          <span>{info.description}</span>
        </div>
        <div>
          <span className="font-semibold">Vai vế / quan hệ:</span>{" "}
          <span>{info.vaiVe}</span>
        </div>
        <div>
          <span className="font-semibold">Mang tính chất:</span>{" "}
          <span>{info.mangTinhChat}</span>
        </div>
      </div>
    );
  };

  // Lục Thú meanings (simplified; có thể mở rộng thêm sau)
  const lucTuInfo = {
    TL: {
      content:
        "**Thanh Long** thuộc Mộc, tính Dương, là vị thần phò tá rất chung thủy, cao quý, có liêm sỉ, công minh, chính trực. Ứng về hôn nhân, lễ tiệc vui mừng, mai mối, thai sản, các việc vui tốt. Đắc địa thì phú quý cao sang; khắc hào Thế thì do ăn uống, rượu thịt, hoặc giao hợp quá độ mà hao tài, sinh bệnh. **Về người** là hạng người quý phái, quan văn, người học thức, thanh lịch, chàng rể. **Về bệnh** là bệnh tim, hoa mắt chóng mặt, đau lưng, nhức đầu, tay chân tê mỏi, bại liệt."
    },
    CT: {
      content:
        "**Chu Tước** bản vị tại Bính Ngọ, thuộc Dương Hỏa, hướng chính Nam, cung Ly, là nơi tột bậc của khí Dương và là nơi bắt đầu sinh khởi khí Âm; được vượng khí trong mùa Hạ. Chu Tước chuyên ứng về các việc văn thư, biện thuyết, lời nói, tin tức, khẩu thiệt. Đắc địa thì ứng về văn chương, ấn tín, sắc lệnh, đến công phủ nhận sắc lệnh, các việc thi cử, văn sách, nộp đơn xin việc làm, trao đổi hồ sơ, công văn giấy tờ.\n\nThất địa thì ứng điều hung như khẩu thiệt, cãi vã, sự nóng giận như điên như dại, việc kiện tụng, lạc mất văn thư, tổn thất tiền tài cùng vật dụng. Có sự tranh cãi rất ầm ĩ, huyên náo, tranh đấu nhau bằng lời lẽ, miệng lưỡi rất hung hăng, dữ tợn. Chu Tước khắc hào Thế thì gặp khẩu thiệt, tranh cãi, lòng dạ bất an không yên ổn, dễ bị quan trên khiển trách, trách mắng.\n\n**Về người:** Chu Tước là hạng chạy giấy tờ, công chức làm việc giấy tờ, thư ký, nhân viên văn phòng, người đưa công văn, thư tín; cũng là người đàn bà kinh cuồng khổ sở, kẻ nóng ác sân hận. **Về bệnh:** bệnh tim, bệnh bụng, nôn mửa, nghẹt mũi, lùng bùng lỗ tai, bệnh huyết áp. Luận thực vật là hột của ngũ cốc; luận về thú là loại có cánh bay; luận về sắc là màu đỏ có lẫn đen; về số là số 9. **Về vật loại:** thuộc lông cánh, tin tức, văn chương, thư tín (thời xưa dùng lông chim làm bút, dùng chim đưa thư)."
    },
    DX: {
      content:
        "**Đằng Xà** bản vị tại Tỵ, thuộc âm Hỏa, phương Đông Nam, được vượng khí trong mùa Hạ. Đằng Xà chuyên ứng việc ưu tư lo lắng, quan tụng, khẩu thiệt, các việc gây tranh cãi, nghi ngờ, kinh hãi, bất an, hao tán, bất thành; sự việc thường có mờ ám, khuất tất, giấu diếm, che đậy, tin đồn nhảm, thị phi gian trá, điều kinh sợ vu vơ, mộng mị quỷ quái, danh dự không thật.\n\nGặp Đằng Xà là điềm nằm mộng thấy ma quỷ, tâm lo sợ không yên, bệnh thần kinh, có tranh đấu, khẩu thiệt, quan tụng, dễ mắc bệnh tật quái lạ. Đằng Xà khắc hào Thế là bị kẻ tiểu nhân đố kỵ ganh ghét, kẻ tâm địa hẹp hòi nhỏ mọn gây khó dễ, có phao tin đồn nhảm, thị phi gian trá, hoặc bị bệnh tinh thần.\n\n**Về người:** Đằng Xà là kẻ tiểu nhân, người có tâm địa độc ác, nhỏ mọn, hiềm thù, hạng đàn bà điên cuồng rồ dại, thần kinh hoảng hốt, làm lụng vất vả nhọc nhằn, hạng tiểu nhân ti tiện. **Về bệnh:** chứng bệnh thần kinh, nhức đầu, tay chân sưng, chảy máu. **Về ngũ cốc** là loại đậu; **về thú** là loại rắn; **về vật thực** là món ăn có mùi rất khó ăn. **Về sắc** là đỏ hồng, **về số** là số 4, **về vật** là kim hỏa sáng tốt, khi biến dị là loại kim hỏa thành tinh."
    },
    CTr: {
      content:
        "**Câu Trần** bản vị tại Mậu Thìn, thuộc Dương Thổ, là Thổ trung ương, được vượng khí trong Tứ quý, chứa đầy sát khí và giữ chức tướng quân. Đắc địa thì được bề trên ban quyền lệnh, thụ ấn tước, bội tinh, huân chương của vua hay chính phủ tùy cấp bậc; thất địa thì ứng về hạng binh lính giữ cửa, kẻ bất kham, tranh đấu nhau.\n\nCâu Trần chuyên ứng các sự việc lưu trì, chậm trễ, dây dưa kéo dài; việc tranh chấp nhà cửa, ruộng vườn, động đất cát, ra đi lâu về, tai nạn dây dưa tổn thất tiền bạc; các việc binh trận, quan tụng, tranh chấp kéo dài, lâu năm, cũ; việc tụ tập đông người, huyên náo, rối loạn. Đối với dân thường là tranh chấp đất đai, kiện tụng về cầm cố tài sản. Câu Trần khắc hào Thế thì khó biện bạch lý phải trái, lý chính đáng của mình, là điềm tai họa vấn vương, việc công hay việc tư đều kéo dài lâu ngày chẳng lúc nào tạm an nhàn.\n\n**Về người:** Câu Trần ứng là người quen cũ, người làm nghề nhà binh, bộ đội, công an, người đàn bà xấu xí, kẻ hai mặt, hay chất chứa hai lòng, ưa tranh cãi kiện tụng. **Luận về bệnh:** chứng đau tim, đau bụng, nóng lạnh, ung thũng có máu. **Luận về ngũ cốc** là trái cây; **luận về thú** là động vật dưới nước; **luận về sự biến dị** là những thứ cũ nát, hư tổn, xưa cũ, đồ cổ; **luận về sắc** là màu đen; **luận về số** là số 5."
    },
    BH: {
      content:
        "**Bạch Hổ** bản vị tại Thân Dậu, thuộc Dương Kim, phương Tây, là Bạch Đế Kim tinh chuyên quyền sát phạt, được vượng khí trong mùa Thu. Bạch Hổ chuyên ứng việc bệnh tật, tang chế, tổn hại cốt nhục, chôn cất, khóc kể, việc hung ác, chém giết, khẩu thiệt, tù ngục, cầm cố, ẩu đả, tranh đấu, huyên náo, ám muội, oán thù, kinh sợ, hình phạt, máu lửa. Cũng ứng tin tức, đi đường, quan tụng, binh lính, việc đông người, việc ở dọc đường.\n\n**Đối với quan quyền:** Bạch Hổ ứng mất chức, đổi quan, kinh sợ, có khi bị lưu huyết, thanh toán. **Đối với thường dân:** dễ bị thương tổn, thân thể sa sút, thời vận suy vi, điên đảo. Bạch Hổ đắc địa thì có oai quyền, làm việc mau chóng thành tựu, có khả năng điều khiển đại sự. Bạch Hổ khắc hào Thế là bị kẻ hung bạo gây khó dễ, có thù oán tranh cạnh, hoặc bệnh tật mệt mỏi, đau ốm đột ngột.\n\n**Về người:** hạng có uy quyền, có đao gươm, mang súng; người khỏe mạnh, cương cường, hung dữ, lỗ mãng, thích sát phạt; hoặc người có bệnh, người đang có tang. **Về bệnh:** bệnh về máu, xương cốt. **Về ngũ cốc:** lúa mạch, mè. **Về thú:** vượn, đười ươi, hổ, báo. **Về sắc:** màu trắng. **Về số:** số 7. **Về vật:** kiếm, thương, đao."
    },
    HV: {
      content:
        "**Huyền Vũ** bản vị tại Hợi, thuộc âm Thủy, phương Tây Bắc, được vượng khí trong mùa Đông. Trên trời sao Huyền Vũ làm chức Hậu quân, vị thần làm khổ vũ (mưa trái thời tiết hoặc mưa quá nhiều sinh khổ hại). Huyền Vũ là tột bậc của Âm, chứa đầy tà khí, làm cho vạn vật tổn hại đến mức cuối cùng.\n\nHuyền Vũ chuyên ứng việc mờ ám, bất thường, thất lạc, hao tài, sai hẹn, trốn mất, cầu cạnh, việc chẳng minh bạch. Cũng ứng việc mưu tính âm thầm, việc tư riêng, cầu hoạch tài, các điều gian trá, thất ước, tật bệnh, trốn tránh, quỷ ám, mộng tưởng, những việc hao thoát, gian trá không thiết thực.\n\n**Đối với quân tử, quan nhân,** Huyền Vũ thường ứng mất xe ngựa, tôi tớ trốn đi; **đối với thường dân** thì dễ bị phá nhà cửa hoặc xảy ra chuyện dâm đãng lôi thôi. Huyền Vũ khắc hào Thế là gặp kẻ mua bán hoặc gian đạo đang mưu tính hại mình, là điềm hao phá tiền bạc, dính líu quan tụng, vụ trốn tránh, thiếu sót.\n\n**Về người:** bọn giặc cướp, trộm cắp, người gian tà tiểu tâm, hạng thông minh mà gian trá, lanh lợi mà mưu trí, có tài văn chương, hay cầu ước tài vật, thích giao du với quý nhân, người giàu. Cũng chủ tiểu nhân, đàn bà, con gái. **Về bệnh:** bệnh thủng ruột, sưng ruột. **Về thú:** heo, thủy trùng, loài có vẩy; cũng ứng các vật loại văn chương. **Về sắc:** màu đen. **Về số:** số 4. **Về hình chất:** vật hư rỗng, âm hộ của phụ nữ."
    }
  };

  const renderLucTu = (lucTu, record) => {
    if (!lucTu) return "-";
    const fullLucTu = getLucTuName(lucTu);
    const code = LUC_TU_CODES[fullLucTu] || lucTu;
    const info = lucTuInfo[code];

    return (
      <span
        className={`cursor-pointer underline decoration-dotted ${
          info ? "text-blue-700" : ""
        }`}
        onClick={() => openLucTuDrawer(lucTu, record)}
      >
        {fullLucTu}
      </span>
    );
  };

  // Columns for TỨC ĐIỀU PHÁN SÀO: Hào / Thế ứng / Lục thân / Can chi / Phục thần / Tuần không
  const columns1 = [
    {
      title: "Hào",
      dataIndex: "hao",
      key: "hao",
      width: 80,
      align: "center",
      render: (hao, record, index) => {
        const info = normalizedLines1[index];
        const realHao = info ? info.hao : hao;
        const lineType = info ? info.lineType : lines1[index];
        const isMoving = info ? info.isMoving : movingLine === realHao;
        const isDungThanHao = dungThanHaos1.has(realHao);
        const isNguyenThanHao = nguyenThanHaos1.has(realHao);
        const isKyThanHao = kyThanHaos1.has(realHao);
        const isCuuThanHao = cuuThanHaos1.has(realHao);
        const isTietThanHao = tietThanHaos1.has(realHao);
        return renderHaoLine(
          realHao,
          lineType,
          isMoving,
          isDungThanHao,
          isNguyenThanHao,
          isKyThanHao,
          isCuuThanHao,
          isTietThanHao
        );
      }
    },
    {
      title: "Thế ứng",
      dataIndex: "theUng",
      key: "theUng",
      width: 80,
      align: "center",
      render: (theUng) => {
        const value = Number(theUng);
        let label = "";
        if (value === 1) label = "Thế";
        else if (value === 2) label = "Ứng";

        return (
          <span className="font-semibold">
            {value === 1 && <UserOutlined />}
            {label}
          </span>
        );
      }
    },
    {
      title: "Lục Thân",
      dataIndex: "lucThan",
      key: "lucThan",
      width: 100,
      align: "center",
      render: (lucThan, record) => {
        const fullLucThan = getLucThanName(lucThan);
        const isDungThanHao = dungThanHaos1.has(record.hao);
        return (
          <Tooltip
            title={renderLucThanTooltip(lucThan)}
            placement="top"
            overlayClassName="tooltip-custom"
          >
            <span
              className={
                dungThan && isDungThanHao ? "text-green-600 font-bold" : ""
              }
            >
              {fullLucThan}
            </span>
          </Tooltip>
        );
      }
    },
    {
      title: "Can Chi",
      dataIndex: "canChi",
      key: "canChi",
      width: 120,
      align: "center",
      render: (canChi) => renderCanChi(canChi)
    },
    {
      title: "Phục thần",
      dataIndex: "phucThan",
      key: "phucThan",
      width: 120,
      align: "center",
      render: (phucThan, record) => {
        if (!phucThan || phucThan === "") return "-";

        // Parse format "PM-Tý" -> { lucThanCode: "PM", diaChi: "Tý" }
        const parts = phucThan.split("-");
        if (parts.length !== 2) {
          // Nếu không đúng format, hiển thị như cũ
          return <span>{phucThan}</span>;
        }

        const [lucThanCode, diaChi] = parts;
        const fullLucThan = getLucThanName(lucThanCode);
        const nguHanh = getNguHanhFromDiaChi(diaChi);

        // Tính toán các trạng thái Dụng/Kỵ/Cừu/Tiết/Nguyên cho Phục Thần
        const selectedDungThanName = dungThan ? getLucThanName(dungThan) : null;
        const isDungThan =
          !!selectedDungThanName && fullLucThan === selectedDungThanName;
        const isNguyenThan =
          !!selectedDungThanName &&
          !!fullLucThan &&
          !isDungThan &&
          isLucThanSinh(fullLucThan, selectedDungThanName);
        const isKyThan =
          !!selectedDungThanName &&
          !!fullLucThan &&
          !isDungThan &&
          isLucThanKhac(fullLucThan, selectedDungThanName);
        const isCuuThan =
          !!selectedDungThanName &&
          !!fullLucThan &&
          !isDungThan &&
          isLucThanKhac(selectedDungThanName, fullLucThan);
        const isTietThan =
          !!selectedDungThanName &&
          !!fullLucThan &&
          !isDungThan &&
          isLucThanSinh(selectedDungThanName, fullLucThan);

        return (
          <div className="flex flex-col items-center gap-1">
            <Tooltip
              title={renderLucThanTooltip(lucThanCode)}
              placement="top"
              overlayClassName="tooltip-custom"
            >
              <span className={isDungThan ? "text-green-600 font-bold" : ""}>
                {fullLucThan}
              </span>
            </Tooltip>
            <div className="flex items-center gap-1">
              <Tooltip
                title={renderDiaChiTooltip(diaChi)}
                placement="top"
                overlayClassName="tooltip-custom"
              >
                <span className="text-xs cursor-help">{diaChi}</span>
              </Tooltip>
              {nguHanh && (
                <Tooltip
                  title={renderNguHanhTooltip(nguHanh.name)}
                  placement="top"
                >
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${nguHanh.color} font-semibold cursor-help`}
                  >
                    {nguHanh.name}
                  </span>
                </Tooltip>
              )}
            </div>
            <div className="flex gap-1">
              {isDungThan && (
                <span className="text-[10px] leading-none text-green-700 font-semibold">
                  Dụng
                </span>
              )}
              {isNguyenThan && (
                <span className="text-[10px] leading-none text-blue-700 font-semibold">
                  Nguyên
                </span>
              )}
              {isKyThan && (
                <span className="text-[10px] leading-none text-red-700 font-semibold">
                  Kỵ
                </span>
              )}
              {isCuuThan && (
                <span className="text-[10px] leading-none text-orange-700 font-semibold">
                  Cừu
                </span>
              )}
              {isTietThan && (
                <span className="text-[10px] leading-none text-emerald-700 font-semibold">
                  Tiết
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      title: "Tuần không",
      dataIndex: "tuanKhong",
      key: "tuanKhong",
      width: 100,
      align: "center",
      render: (tuanKhong) => <span>{tuanKhong || ""}</span>
    }
  ];

  // Columns for NHÂN ĐOÁN TÁO CAO: Hào / Lục thân / Can chi / Lục tú / Tuần không
  const columns2 = [
    {
      title: "Hào",
      dataIndex: "hao",
      key: "hao",
      width: 80,
      align: "center",
      render: (hao, record, index) => {
        const info = normalizedLines2[index];
        const realHao = info ? info.hao : hao;
        const lineType = info ? info.lineType : lines2[index];
        const isMoving = info ? info.isMoving : false; // Quẻ biến không có hào động
        return renderHaoLine(realHao, lineType, isMoving);
      }
    },
    {
      title: "Lục Thân",
      dataIndex: "lucThan",
      key: "lucThan",
      width: 100,
      align: "center",
      render: (lucThan, record) => {
        const fullLucThan = getLucThanName(lucThan);
        const isDungThanHao = dungThanHaos2.has(record.hao);
        return (
          <Tooltip
            title={renderLucThanTooltip(lucThan)}
            placement="top"
            overlayClassName="tooltip-custom"
          >
            <span
              className={
                dungThan && isDungThanHao ? "text-green-600 font-bold" : ""
              }
            >
              {fullLucThan}
            </span>
          </Tooltip>
        );
      }
    },
    {
      title: "Can Chi",
      dataIndex: "canChi",
      key: "canChi",
      width: 120,
      align: "center",
      render: (canChi) => renderCanChi(canChi)
    },
    {
      title: "Lục Thú",
      dataIndex: "lucTu",
      key: "lucTu",
      width: 120,
      align: "center",
      render: (lucTu, record) => renderLucTu(lucTu, record)
    },
    {
      title: "Tuần không",
      dataIndex: "tuanKhong",
      key: "tuanKhong",
      width: 100,
      align: "center",
      render: (tuanKhong) => <span>{tuanKhong || ""}</span>
    }
  ];

  // Render content for Lục Thú fullscreen drawer
  const renderLucTuDrawerContent = () => {
    if (!lucTuDrawerData) return null;
    const { lucTu, record } = lucTuDrawerData;
    const lucTuName = getLucTuName(lucTu);
    const code = LUC_TU_CODES[lucTuName] || lucTu;
    const info = lucTuInfo[code];
    const lucThan = record?.lucThan;
    const lucThanName = getLucThanName(lucThan);

    const clsThan = getClassification(lucTu, lucThan);
    const clsDiaChi = getClassificationDiaChi(lucTu, record?.canChi);

    let diaChiExtraText = null;
    if (record?.canChi) {
      const parts = record.canChi.split(" ");
      const diaChi = parts[parts.length - 1];
      if (lucTuName === "Thanh Long") {
        diaChiExtraText = thanhLongDiaChiInfo[diaChi] || null;
      } else if (lucTuName === "Bạch Hổ") {
        diaChiExtraText = bachHoDiaChiInfo[diaChi] || null;
      } else if (lucTuName === "Câu Trần") {
        diaChiExtraText = cauTranDiaChiInfo[diaChi] || null;
      } else if (lucTuName === "Chu Tước") {
        diaChiExtraText = chuTuocDiaChiInfo[diaChi] || null;
      } else if (lucTuName === "Đằng Xà") {
        diaChiExtraText = dangXaDiaChiInfo[diaChi] || null;
      } else if (lucTuName === "Huyền Vũ") {
        diaChiExtraText = huyenVuDiaChiInfo[diaChi] || null;
      }
    }

    return (
      <div className="space-y-4 text-sm">
        {info && (
          <>
            <div className="leading-relaxed text-gray-800 prose prose-sm max-w-none">
              <ReactMarkdown>{info.content}</ReactMarkdown>
            </div>
          </>
        )}

        {(clsThan || clsDiaChi) && (
          <div className="pt-4 border-t border-gray-300 space-y-3">
            {clsThan && (
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span>{clsThan.label}</span>
                </div>
                {lucThanName &&
                  lucTuName === "Thanh Long" &&
                  thanhLongLucThanInfo[lucThanName] && (
                    <div className="mt-2 text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {thanhLongLucThanInfo[lucThanName]}
                      </ReactMarkdown>
                    </div>
                  )}
                {lucThanName &&
                  lucTuName === "Bạch Hổ" &&
                  bachHoLucThanInfo[lucThanName] && (
                    <div className="mt-2 text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {bachHoLucThanInfo[lucThanName]}
                      </ReactMarkdown>
                    </div>
                  )}
                {lucThanName &&
                  lucTuName === "Câu Trần" &&
                  cauTranLucThanInfo[lucThanName] && (
                    <div className="mt-2 text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {cauTranLucThanInfo[lucThanName]}
                      </ReactMarkdown>
                    </div>
                  )}
                {lucThanName &&
                  lucTuName === "Chu Tước" &&
                  chuTuocLucThanInfo[lucThanName] && (
                    <div className="mt-2 text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {chuTuocLucThanInfo[lucThanName]}
                      </ReactMarkdown>
                    </div>
                  )}
                {lucThanName &&
                  lucTuName === "Đằng Xà" &&
                  dangXaLucThanInfo[lucThanName] && (
                    <div className="mt-2 text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {dangXaLucThanInfo[lucThanName]}
                      </ReactMarkdown>
                    </div>
                  )}
                {lucThanName &&
                  lucTuName === "Huyền Vũ" &&
                  huyenVuLucThanInfo[lucThanName] && (
                    <div className="mt-2 text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {huyenVuLucThanInfo[lucThanName]}
                      </ReactMarkdown>
                    </div>
                  )}
              </div>
            )}

            {clsDiaChi && (
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span>{clsDiaChi.label}</span>
                </div>
                {diaChiExtraText && (
                  <div className="mt-2 text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none">
                    <ReactMarkdown>{diaChiExtraText}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Drawer
        open={!!lucTuDrawerData}
        onClose={closeLucTuDrawer}
        placement="left"
        height="100%"
        width={window.innerWidth < 640 ? "100%" : "70%"}
        title={getLucTuName(lucTuDrawerData?.lucTu) || "Lục Thú"}
        destroyOnClose
        bodyStyle={{ padding: 16 }}
      >
        {renderLucTuDrawerContent()}
      </Drawer>

      {/* Modal hiển thị thông tin quẻ */}
      <Modal
        title={
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 m-0">
              {hexagramModalData?.hexagramName}
            </h2>
            {hexagramModalData?.omen && (
              <p className="text-sm text-amber-700 mt-2 italic">
                Điềm: {hexagramModalData.omen}
              </p>
            )}
          </div>
        }
        open={!!hexagramModalData}
        onCancel={closeHexagramModal}
        footer={null}
        width={window.innerWidth < 640 ? "90%" : "70%"}
        className="hexagram-modal"
      >
        <div className="prose prose-sm max-w-none text-gray-700">
          {hexagramModalData?.hexagramKey
            ? (() => {
                const meaning = getHexagramMeaning(
                  hexagramModalData.hexagramKey
                );
                return meaning ? (
                  <ReactMarkdown>{meaning}</ReactMarkdown>
                ) : (
                  <p className="text-gray-500 italic">
                    Ý nghĩa quẻ này đang được cập nhật...
                  </p>
                );
              })()
            : null}
        </div>
      </Modal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
        {/* TỨC ĐIỀU PHÁN SÀO */}
        <Card
          title={
            <p
              className="text-center font-bold text-lg text-gray-800 m-0 cursor-pointer hover:text-blue-600 transition-colors"
              style={{ textTransform: "uppercase" }}
              onClick={() => {
                const key = `${originalHexagram.upperTrigram}-${originalHexagram.lowerTrigram}`;
                openHexagramModal(
                  key,
                  originalHexagram.vietnameseName,
                  getHexagramOmen(key)
                );
              }}
            >
              {getHexagramOmen(
                `${originalHexagram.upperTrigram}-${originalHexagram.lowerTrigram}`
              )}
            </p>
          }
          className="bg-parchment-50 border-2 border-parchment-300"
        >
          <Table
            dataSource={lineData1}
            columns={columns1}
            pagination={false}
            size="small"
            rowKey="hao"
            className="bg-white"
            rowClassName={(record) => {
              if (dungThan && dungThanHaos1.has(record.hao)) {
                return "bg-green-50 hover:bg-green-100";
              }
              return "";
            }}
          />
        </Card>

        {/* NHÂN ĐOÁN TÁO CAO */}
        <Card
          title={
            <p
              className="text-center font-bold text-lg text-gray-800 m-0 cursor-pointer hover:text-blue-600 transition-colors"
              style={{ textTransform: "uppercase" }}
              onClick={() => {
                if (changedHexagram) {
                  const key = `${changedHexagram.upperTrigram}-${changedHexagram.lowerTrigram}`;
                  openHexagramModal(
                    key,
                    changedHexagram.vietnameseName,
                    getHexagramOmen(key)
                  );
                }
              }}
            >
              {changedHexagram &&
                getHexagramOmen(
                  `${changedHexagram.upperTrigram}-${changedHexagram.lowerTrigram}`
                )}
            </p>
          }
          className="bg-parchment-50 border-2 border-parchment-300"
        >
          <Table
            dataSource={lineData2}
            columns={columns2}
            pagination={false}
            size="small"
            rowKey="hao"
            className="bg-white"
            rowClassName={(record) => {
              if (dungThan && dungThanHaos2.has(record.hao)) {
                return "bg-green-50 hover:bg-green-100";
              }
              return "";
            }}
          />
        </Card>
      </div>

      {/* PHÂN TÍCH QUẺ */}
      {(() => {
        // Tìm hào Thế (theUng = 1)
        const theHao = lineData1.find((line) => Number(line.theUng) === 1);
        const theDiaChi = theHao ? extractDiaChi(theHao.canChi) : null;

        // Tìm hào Dụng Thần
        const dungThanHao = lineData1.find((line) => {
          if (!dungThan) return false;
          const dungThanName = getLucThanName(dungThan);
          return getLucThanName(line.lucThan) === dungThanName;
        });
        const dungThanDiaChi = dungThanHao
          ? extractDiaChi(dungThanHao.canChi)
          : null;
        const dungThanInfo = dungThan
          ? getDungThanInfo(getLucThanName(dungThan))
          : null;

        // Phân tích quan hệ giữa hào Thế và Dụng Thần
        let buoc2KetLuan = null;
        if (theDiaChi && dungThanDiaChi) {
          const relation = getDiaChiRelation(theDiaChi, dungThanDiaChi);
          if (relation === "bằng") {
            buoc2KetLuan = {
              relation: "Bằng nhau",
              text: "Tốt",
              color: "text-green-600"
            };
          } else if (relation === "duocSinh") {
            // Thế được sinh bởi Dụng
            buoc2KetLuan = {
              relation: "Thế được sinh bởi Dụng",
              text: "Tốt",
              color: "text-green-600"
            };
          } else if (relation === "sinh") {
            // Thế sinh Dụng
            buoc2KetLuan = {
              relation: "Thế sinh Dụng",
              text: "Tốt nhưng cần phải có sự cố gắng thì việc mới thành",
              color: "text-yellow-600"
            };
          } else if (relation === "khac") {
            // Thế khắc Dụng
            buoc2KetLuan = {
              relation: "Thế khắc Dụng",
              text: "Rất xấu",
              color: "text-red-600"
            };
          } else if (relation === "biKhac") {
            // Dụng khắc Thế
            buoc2KetLuan = {
              relation: "Dụng khắc Thế",
              text: "Tương đối xấu",
              color: "text-orange-600"
            };
          }
        }

        // Kiểm tra Thái Tuế và Tuế Phá
        const yearDiaChi = getYearDiaChi();
        let thaiTue = false;
        let tuePha = false;
        if (dungThanDiaChi && yearDiaChi) {
          thaiTue = dungThanDiaChi === yearDiaChi;
          tuePha = getNhiXungOf(dungThanDiaChi) === yearDiaChi;
        }

        // Bước 3: Xét mối tương quan Dụng Thần và Tháng
        const monthDiaChi = getMonthDiaChi();
        let buoc3Results = [];
        let buoc3Diem = 0;
        let buoc3Dung = false; // Dừng xét bước 3
        let buoc3DungTai = null; // Bước dừng

        if (dungThanDiaChi && monthDiaChi) {
          // 3.1: Nguyệt kiến (trùng tháng)
          buoc3Results.push({
            step: "3.1",
            name: "Nguyệt Kiến",
            description: `Địa chi Dụng Thần (${dungThanDiaChi}) trùng với địa chi tháng (${monthDiaChi})`,
            checked: true
          });
          if (dungThanDiaChi === monthDiaChi) {
            buoc3Diem += 1.75;
            buoc3Results[buoc3Results.length - 1].diem = 1.75;
            buoc3Results[buoc3Results.length - 1].color = "text-green-600";
            buoc3Results[buoc3Results.length - 1].matched = true;
            buoc3Dung = true;
            buoc3DungTai = "3.1";
          } else {
            buoc3Results[buoc3Results.length - 1].matched = false;
            buoc3Results[buoc3Results.length - 1].color = "text-gray-500";
            // 3.2: Tam hợp
            buoc3Results.push({
              step: "3.2",
              name: "Tam Hợp",
              description: `Địa chi Dụng Thần (${dungThanDiaChi}) tam hợp với địa chi tháng (${monthDiaChi})`,
              checked: true
            });
            if (isTamHopDiaChi(dungThanDiaChi, monthDiaChi)) {
              buoc3Diem += 1;
              buoc3Results[buoc3Results.length - 1].diem = 1;
              buoc3Results[buoc3Results.length - 1].color = "text-green-600";
              buoc3Results[buoc3Results.length - 1].matched = true;
              buoc3Dung = true;
              buoc3DungTai = "3.2";
            } else {
              buoc3Results[buoc3Results.length - 1].matched = false;
              buoc3Results[buoc3Results.length - 1].color = "text-gray-500";
              // 3.3: Nhị hợp
              buoc3Results.push({
                step: "3.3",
                name: "Nhị Hợp",
                description: `Địa chi Dụng Thần (${dungThanDiaChi}) nhị hợp với địa chi tháng (${monthDiaChi})`,
                checked: true
              });
              if (isNhiHopDiaChi(dungThanDiaChi, monthDiaChi)) {
                buoc3Diem += 1;
                buoc3Results[buoc3Results.length - 1].diem = 1;
                buoc3Results[buoc3Results.length - 1].color = "text-green-600";
                buoc3Results[buoc3Results.length - 1].matched = true;
                buoc3Dung = true;
                buoc3DungTai = "3.3";
              } else {
                buoc3Results[buoc3Results.length - 1].matched = false;
                buoc3Results[buoc3Results.length - 1].color = "text-gray-500";
                // 3.4: Nhị xung (Nguyệt Phá)
                buoc3Results.push({
                  step: "3.4",
                  name: "Nguyệt Phá",
                  description: `Địa chi Dụng Thần (${dungThanDiaChi}) nhị xung với địa chi tháng (${monthDiaChi})`,
                  checked: true
                });
                if (isNhiXungDiaChi(dungThanDiaChi, monthDiaChi)) {
                  buoc3Diem -= 1;
                  buoc3Results[buoc3Results.length - 1].diem = -1;
                  buoc3Results[buoc3Results.length - 1].color = "text-red-600";
                  buoc3Results[buoc3Results.length - 1].matched = true;
                  buoc3Dung = true;
                  buoc3DungTai = "3.4";
                } else {
                  buoc3Results[buoc3Results.length - 1].matched = false;
                  buoc3Results[buoc3Results.length - 1].color = "text-gray-500";
                  // 3.5: Nhập mộ
                  const nhapMo = getNhapMoOf(dungThanDiaChi);
                  buoc3Results.push({
                    step: "3.5",
                    name: "Nhập Mộ",
                    description: `Địa chi Dụng Thần (${dungThanDiaChi}) nhập mộ tại địa chi tháng (${monthDiaChi})`,
                    checked: true
                  });
                  if (nhapMo === monthDiaChi) {
                    buoc3Diem -= 0.5;
                    buoc3Results[buoc3Results.length - 1].diem = -0.5;
                    buoc3Results[buoc3Results.length - 1].color = "text-orange-600";
                    buoc3Results[buoc3Results.length - 1].matched = true;
                    buoc3Dung = true;
                    buoc3DungTai = "3.5";
                  } else {
                    buoc3Results[buoc3Results.length - 1].matched = false;
                    buoc3Results[buoc3Results.length - 1].color = "text-gray-500";
                    // 3.6: Xét ngũ hành
                    const dungThanNguHanh = getNguHanhFromDiaChi(dungThanDiaChi);
                    const monthNguHanh = getNguHanhFromDiaChi(monthDiaChi);
                    if (dungThanNguHanh && monthNguHanh) {
                      const nguHanhRel = getNguHanhRelation(dungThanNguHanh.name, monthNguHanh.name);
                      buoc3Results.push({
                        step: "3.6",
                        name: "Ngũ Hành",
                        description: `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) với ngũ hành tháng (${monthNguHanh.name})`,
                        checked: true
                      });
                      if (nguHanhRel === "duocSinh") {
                        // Dụng được tháng sinh
                        buoc3Diem += 1;
                        buoc3Results[buoc3Results.length - 1].diem = 1;
                        buoc3Results[buoc3Results.length - 1].color = "text-green-600";
                        buoc3Results[buoc3Results.length - 1].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) được ngũ hành tháng (${monthNguHanh.name}) tương sinh`;
                        buoc3Results[buoc3Results.length - 1].matched = true;
                        buoc3DungTai = "3.6";
                      } else if (nguHanhRel === "trung") {
                        // Trùng ngũ hành
                        buoc3Diem += 1;
                        buoc3Results[buoc3Results.length - 1].diem = 1;
                        buoc3Results[buoc3Results.length - 1].color = "text-green-600";
                        buoc3Results[buoc3Results.length - 1].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) trùng với ngũ hành tháng (${monthNguHanh.name})`;
                        buoc3Results[buoc3Results.length - 1].matched = true;
                        buoc3DungTai = "3.6";
                      } else if (nguHanhRel === "sinh") {
                        // Dụng sinh tháng
                        buoc3Diem -= 1;
                        buoc3Results[buoc3Results.length - 1].diem = -1;
                        buoc3Results[buoc3Results.length - 1].color = "text-red-600";
                        buoc3Results[buoc3Results.length - 1].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) tương sinh ngũ hành tháng (${monthNguHanh.name})`;
                        buoc3Results[buoc3Results.length - 1].matched = true;
                        buoc3DungTai = "3.6";
                      } else if (nguHanhRel === "khac") {
                        // Dụng khắc tháng
                        buoc3Diem -= 0.5;
                        buoc3Results[buoc3Results.length - 1].diem = -0.5;
                        buoc3Results[buoc3Results.length - 1].color = "text-orange-600";
                        buoc3Results[buoc3Results.length - 1].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) tương khắc ngũ hành tháng (${monthNguHanh.name})`;
                        buoc3Results[buoc3Results.length - 1].matched = true;
                        buoc3DungTai = "3.6";
                      } else if (nguHanhRel === "biKhac") {
                        // Tháng khắc Dụng
                        buoc3Diem -= 1;
                        buoc3Results[buoc3Results.length - 1].diem = -1;
                        buoc3Results[buoc3Results.length - 1].color = "text-red-600";
                        buoc3Results[buoc3Results.length - 1].description = `Ngũ hành tháng (${monthNguHanh.name}) tương khắc ngũ hành Dụng Thần (${dungThanNguHanh.name})`;
                        buoc3Results[buoc3Results.length - 1].matched = true;
                        buoc3DungTai = "3.6";
                      } else {
                        buoc3Results[buoc3Results.length - 1].matched = false;
                        buoc3Results[buoc3Results.length - 1].color = "text-gray-500";
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // Bước 4: Xét mối tương quan Dụng Thần và Ngày
        const dayDiaChi = getDayDiaChi();
        let buoc4Results = [];
        let buoc4Diem = 0;
        let buoc4Dung = false; // Dừng xét bước 4
        let buoc4DungTai = null; // Bước dừng

        if (dungThanDiaChi && dayDiaChi) {
          // 4.1: Nhật kiến (trùng ngày)
          buoc4Results.push({
            step: "4.1",
            name: "Nhật Kiến",
            description: `Địa chi Dụng Thần (${dungThanDiaChi}) trùng với địa chi ngày (${dayDiaChi})`,
            checked: true
          });
          if (dungThanDiaChi === dayDiaChi) {
            buoc4Diem += 1.75;
            buoc4Results[buoc4Results.length - 1].diem = 1.75;
            buoc4Results[buoc4Results.length - 1].color = "text-green-600";
            buoc4Results[buoc4Results.length - 1].matched = true;
            buoc4Dung = true;
            buoc4DungTai = "4.1";
          } else {
            buoc4Results[buoc4Results.length - 1].matched = false;
            buoc4Results[buoc4Results.length - 1].color = "text-gray-500";
            // 4.2: Tam hợp
            buoc4Results.push({
              step: "4.2",
              name: "Tam Hợp",
              description: `Địa chi Dụng Thần (${dungThanDiaChi}) tam hợp với địa chi ngày (${dayDiaChi})`,
              checked: true
            });
            if (isTamHopDiaChi(dungThanDiaChi, dayDiaChi)) {
              buoc4Diem += 1;
              buoc4Results[buoc4Results.length - 1].diem = 1;
              buoc4Results[buoc4Results.length - 1].color = "text-green-600";
              buoc4Results[buoc4Results.length - 1].matched = true;
              buoc4Dung = true;
              buoc4DungTai = "4.2";
            } else {
              buoc4Results[buoc4Results.length - 1].matched = false;
              buoc4Results[buoc4Results.length - 1].color = "text-gray-500";
              // 4.3: Nhị hợp
              buoc4Results.push({
                step: "4.3",
                name: "Nhị Hợp",
                description: `Địa chi Dụng Thần (${dungThanDiaChi}) nhị hợp với địa chi ngày (${dayDiaChi})`,
                checked: true
              });
              if (isNhiHopDiaChi(dungThanDiaChi, dayDiaChi)) {
                buoc4Diem += 1;
                buoc4Results[buoc4Results.length - 1].diem = 1;
                buoc4Results[buoc4Results.length - 1].color = "text-green-600";
                buoc4Results[buoc4Results.length - 1].matched = true;
                buoc4Dung = true;
                buoc4DungTai = "4.3";
              } else {
                buoc4Results[buoc4Results.length - 1].matched = false;
                buoc4Results[buoc4Results.length - 1].color = "text-gray-500";
                // 4.4: Nhị xung (Nhật Phá)
                buoc4Results.push({
                  step: "4.4",
                  name: "Nhật Phá",
                  description: `Địa chi Dụng Thần (${dungThanDiaChi}) nhị xung với địa chi ngày (${dayDiaChi})`,
                  checked: true
                });
                if (isNhiXungDiaChi(dungThanDiaChi, dayDiaChi)) {
                  buoc4Diem -= 1;
                  buoc4Results[buoc4Results.length - 1].diem = -1;
                  buoc4Results[buoc4Results.length - 1].color = "text-red-600";
                  buoc4Results[buoc4Results.length - 1].matched = true;
                  buoc4Dung = true;
                  buoc4DungTai = "4.4";
                } else {
                  buoc4Results[buoc4Results.length - 1].matched = false;
                  buoc4Results[buoc4Results.length - 1].color = "text-gray-500";
                  // 4.5: Nhập mộ
                  const nhapMo = getNhapMoOf(dungThanDiaChi);
                  buoc4Results.push({
                    step: "4.5",
                    name: "Nhập Mộ",
                    description: `Địa chi Dụng Thần (${dungThanDiaChi}) nhập mộ tại địa chi ngày (${dayDiaChi})`,
                    checked: true
                  });
                  if (nhapMo === dayDiaChi) {
                    buoc4Diem -= 0.5;
                    buoc4Results[buoc4Results.length - 1].diem = -0.5;
                    buoc4Results[buoc4Results.length - 1].color = "text-orange-600";
                    buoc4Results[buoc4Results.length - 1].matched = true;
                    buoc4Dung = true;
                    buoc4DungTai = "4.5";
                  } else {
                    buoc4Results[buoc4Results.length - 1].matched = false;
                    buoc4Results[buoc4Results.length - 1].color = "text-gray-500";
                    // 4.6: Xét ngũ hành
                    const dungThanNguHanh = getNguHanhFromDiaChi(dungThanDiaChi);
                    const dayNguHanh = getNguHanhFromDiaChi(dayDiaChi);
                    if (dungThanNguHanh && dayNguHanh) {
                      const nguHanhRel = getNguHanhRelation(dungThanNguHanh.name, dayNguHanh.name);
                      buoc4Results.push({
                        step: "4.6",
                        name: "Ngũ Hành",
                        description: `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) với ngũ hành ngày (${dayNguHanh.name})`,
                        checked: true
                      });
                      if (nguHanhRel === "duocSinh") {
                        // Dụng được ngày sinh
                        buoc4Diem += 1;
                        buoc4Results[buoc4Results.length - 1].diem = 1;
                        buoc4Results[buoc4Results.length - 1].color = "text-green-600";
                        buoc4Results[buoc4Results.length - 1].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) được ngũ hành ngày (${dayNguHanh.name}) tương sinh`;
                        buoc4Results[buoc4Results.length - 1].matched = true;
                        buoc4DungTai = "4.6";
                      } else if (nguHanhRel === "trung") {
                        // Trùng ngũ hành
                        buoc4Diem += 1;
                        buoc4Results[buoc4Results.length - 1].diem = 1;
                        buoc4Results[buoc4Results.length - 1].color = "text-green-600";
                        buoc4Results[buoc4Results.length - 1].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) trùng với ngũ hành ngày (${dayNguHanh.name})`;
                        buoc4Results[buoc4Results.length - 1].matched = true;
                        buoc4DungTai = "4.6";
                      } else if (nguHanhRel === "sinh") {
                        // Dụng sinh ngày
                        buoc4Diem -= 1;
                        buoc4Results[buoc4Results.length - 1].diem = -1;
                        buoc4Results[buoc4Results.length - 1].color = "text-red-600";
                        buoc4Results[buoc4Results.length - 1].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) tương sinh ngũ hành ngày (${dayNguHanh.name})`;
                        buoc4Results[buoc4Results.length - 1].matched = true;
                        buoc4DungTai = "4.6";
                      } else if (nguHanhRel === "khac") {
                        // Dụng khắc ngày
                        buoc4Diem -= 0.5;
                        buoc4Results[buoc4Results.length - 1].diem = -0.5;
                        buoc4Results[buoc4Results.length - 1].color = "text-orange-600";
                        buoc4Results[buoc4Results.length - 1].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) tương khắc ngũ hành ngày (${dayNguHanh.name})`;
                        buoc4Results[buoc4Results.length - 1].matched = true;
                        buoc4DungTai = "4.6";
                      } else if (nguHanhRel === "biKhac") {
                        // Ngày khắc Dụng
                        buoc4Diem -= 1;
                        buoc4Results[buoc4Results.length - 1].diem = -1;
                        buoc4Results[buoc4Results.length - 1].color = "text-red-600";
                        buoc4Results[buoc4Results.length - 1].description = `Ngũ hành ngày (${dayNguHanh.name}) tương khắc ngũ hành Dụng Thần (${dungThanNguHanh.name})`;
                        buoc4Results[buoc4Results.length - 1].matched = true;
                        buoc4DungTai = "4.6";
                      } else {
                        buoc4Results[buoc4Results.length - 1].matched = false;
                        buoc4Results[buoc4Results.length - 1].color = "text-gray-500";
                      }
                    }
                  }
                }
              }
            }
          }
        }

        return (
          <div className="mt-8">
            <Card
              title={
                <p
                  className="text-center font-bold text-xl text-gray-800 m-0"
                  style={{ textTransform: "uppercase" }}
                >
                  Phân Tích Quẻ
                </p>
              }
              className="bg-parchment-50 border-2 border-parchment-300"
            >
              <div className="space-y-6">
                {/* Công thức giải quẻ */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-parchment-300 pb-2">
                    Công Thức Giải Quẻ
                  </h3>
                  <div className="bg-white p-4 rounded-lg border border-parchment-200">
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {/* Nội dung công thức sẽ được thêm vào đây */}
                      <p className="text-gray-500 italic">
                        Công thức giải quẻ sẽ được hiển thị tại đây...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Các bước giải quẻ */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-parchment-300 pb-2">
                    Các Bước Giải Quẻ
                  </h3>
                  <div className="space-y-4">
                    {/* Bước 1: Xác định Dụng Thần */}
                    <div className="bg-white p-4 rounded-lg border border-parchment-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-parchment-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          1
                        </div>
                        <div className="flex-1 prose prose-sm max-w-none text-gray-700">
                          <p className="font-semibold mb-2">
                            Xác định Dụng Thần
                          </p>
                          {dungThan && dungThanInfo ? (
                            <div className="space-y-2">
                              <p>
                                <strong>Dụng Thần đã chọn:</strong>{" "}
                                {dungThanInfo.label}
                              </p>
                              <p>
                                <strong>Vai vế:</strong> {dungThanInfo.vaiVe}
                              </p>
                              <p>
                                <strong>Đồ dùng:</strong> {dungThanInfo.doDung}
                              </p>
                              <p>
                                <strong>Mang tính chất:</strong>{" "}
                                {dungThanInfo.mangTinhChat}
                              </p>
                              {dungThanHao && (
                                <p>
                                  <strong>Hào Dụng Thần:</strong> Hào{" "}
                                  {dungThanHao.hao} ({dungThanHao.canChi})
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">
                              Chưa chọn Dụng Thần
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bước 2: Phân tích mối tương quan giữa hào Thế và Dụng Thần */}
                    <div className="bg-white p-4 rounded-lg border border-parchment-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-parchment-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          2
                        </div>
                        <div className="flex-1 prose prose-sm max-w-none text-gray-700">
                          <p className="font-semibold mb-2">
                            Phân tích mối tương quan giữa hào Thế và Dụng Thần
                          </p>
                          {theHao &&
                          dungThanHao &&
                          theDiaChi &&
                          dungThanDiaChi ? (
                            <div className="space-y-2">
                              <p>
                                <strong>Hào Thế:</strong> Hào {theHao.hao} (
                                {theHao.canChi}) - Địa Chi:{" "}
                                <strong>{theDiaChi}</strong>
                              </p>
                              <p>
                                <strong>Hào Dụng Thần:</strong> Hào{" "}
                                {dungThanHao.hao} ({dungThanHao.canChi}) - Địa
                                Chi: <strong>{dungThanDiaChi}</strong>
                              </p>
                              {buoc2KetLuan && (
                                <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-parchment-400">
                                  <p className="font-semibold mb-1">
                                    Kết luận:
                                  </p>
                                  <p className="mb-2 text-gray-700">
                                    <strong>{buoc2KetLuan.relation}</strong> →{" "}
                                    <span
                                      className={`font-bold ${buoc2KetLuan.color}`}
                                    >
                                      {buoc2KetLuan.text}
                                    </span>
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">
                              Không đủ thông tin để phân tích
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bước 3: Xác định Thái Tuế và Tuế Phá */}
                    <div className="bg-white p-4 rounded-lg border border-parchment-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-parchment-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          3
                        </div>
                        <div className="flex-1 prose prose-sm max-w-none text-gray-700">
                          <p className="font-semibold mb-2">
                            Xác định Dụng Thần có Thái Tuế hay Tuế Phá
                          </p>
                          {dungThanDiaChi && yearDiaChi ? (
                            <div className="space-y-2">
                              <p>
                                <strong>Địa Chi của Dụng Thần:</strong>{" "}
                                {dungThanDiaChi}
                              </p>
                              <p>
                                <strong>Địa Chi của năm:</strong> {yearDiaChi}
                              </p>
                              <div className="mt-3 space-y-2">
                                {thaiTue && (
                                  <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                                    <p className="font-semibold text-green-700">
                                      ✓ Có Thái Tuế
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Địa chi của Dụng Thần trùng với địa chi
                                      của năm
                                    </p>
                                  </div>
                                )}
                                {tuePha && (
                                  <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                                    <p className="font-semibold text-red-700">
                                      ✗ Có Tuế Phá
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Địa chi của Dụng Thần xung với địa chi của
                                      năm
                                    </p>
                                  </div>
                                )}
                                {!thaiTue && !tuePha && (
                                  <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-400">
                                    <p className="font-semibold text-gray-700">
                                      Không có Thái Tuế hay Tuế Phá
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">
                              Không đủ thông tin để xác định
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bước 3: Xét mối tương quan Dụng Thần và Tháng */}
                    {dungThanDiaChi && monthDiaChi && (
                      <div className="bg-white p-4 rounded-lg border border-parchment-200">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-parchment-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            3
                          </div>
                          <div className="flex-1 prose prose-sm max-w-none text-gray-700">
                            <p className="font-semibold mb-2">
                              Xét mối tương quan Dụng Thần và Tháng
                            </p>
                            <div className="space-y-2">
                              <p>
                                <strong>Địa Chi của Dụng Thần:</strong>{" "}
                                {dungThanDiaChi}
                              </p>
                              <p>
                                <strong>Địa Chi của tháng:</strong> {monthDiaChi}
                              </p>
                              {buoc3Results.length > 0 ? (
                                <div className="mt-3 space-y-3">
                                  {buoc3Results.map((result, index) => (
                                    <div
                                      key={index}
                                      className={`p-3 rounded border-l-4 ${
                                        result.matched
                                          ? result.diem > 0
                                            ? "bg-green-50 border-green-500"
                                            : result.diem < 0
                                            ? "bg-red-50 border-red-500"
                                            : "bg-orange-50 border-orange-500"
                                          : "bg-gray-50 border-gray-300"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <p
                                              className={`font-semibold ${result.color}`}
                                            >
                                              {result.step}: {result.name}
                                            </p>
                                            {result.matched && (
                                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                                ✓ Thỏa mãn
                                              </span>
                                            )}
                                            {!result.matched && (
                                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                                                ✗ Không thỏa mãn
                                              </span>
                                            )}
                                            {buoc3DungTai === result.step && (
                                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                Dừng tại đây
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm text-gray-600 mt-1">
                                            {result.description}
                                          </p>
                                        </div>
                                        {result.matched && result.diem !== undefined && (
                                          <div
                                            className={`ml-3 font-bold text-lg ${result.color}`}
                                          >
                                            {result.diem > 0 ? "+" : ""}
                                            {result.diem}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                                    <p className="font-semibold text-blue-700">
                                      Tổng điểm Bước 3:{" "}
                                      <span className="text-xl">
                                        {buoc3Diem > 0 ? "+" : ""}
                                        {buoc3Diem.toFixed(2)} điểm
                                      </span>
                                    </p>
                                    {buoc3Dung && buoc3DungTai && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        <strong>Đã dừng xét tại:</strong> Bước {buoc3DungTai}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500 italic mt-3">
                                  Không có mối tương quan nào được xác định
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bước 4: Xét mối tương quan Dụng Thần và Ngày */}
                    {dungThanDiaChi && dayDiaChi && (
                      <div className="bg-white p-4 rounded-lg border border-parchment-200">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-parchment-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            4
                          </div>
                          <div className="flex-1 prose prose-sm max-w-none text-gray-700">
                            <p className="font-semibold mb-2">
                              Xét mối tương quan Dụng Thần và Ngày
                            </p>
                            <div className="space-y-2">
                              <p>
                                <strong>Địa Chi của Dụng Thần:</strong>{" "}
                                {dungThanDiaChi}
                              </p>
                              <p>
                                <strong>Địa Chi của ngày:</strong> {dayDiaChi}
                              </p>
                              {buoc4Results.length > 0 ? (
                                <div className="mt-3 space-y-3">
                                  {buoc4Results.map((result, index) => (
                                    <div
                                      key={index}
                                      className={`p-3 rounded border-l-4 ${
                                        result.matched
                                          ? result.diem > 0
                                            ? "bg-green-50 border-green-500"
                                            : result.diem < 0
                                            ? "bg-red-50 border-red-500"
                                            : "bg-orange-50 border-orange-500"
                                          : "bg-gray-50 border-gray-300"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <p
                                              className={`font-semibold ${result.color}`}
                                            >
                                              {result.step}: {result.name}
                                            </p>
                                            {result.matched && (
                                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                                ✓ Thỏa mãn
                                              </span>
                                            )}
                                            {!result.matched && (
                                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                                                ✗ Không thỏa mãn
                                              </span>
                                            )}
                                            {buoc4DungTai === result.step && (
                                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                Dừng tại đây
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm text-gray-600 mt-1">
                                            {result.description}
                                          </p>
                                        </div>
                                        {result.matched && result.diem !== undefined && (
                                          <div
                                            className={`ml-3 font-bold text-lg ${result.color}`}
                                          >
                                            {result.diem > 0 ? "+" : ""}
                                            {result.diem}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                  <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                                    <p className="font-semibold text-blue-700">
                                      Tổng điểm Bước 4:{" "}
                                      <span className="text-xl">
                                        {buoc4Diem > 0 ? "+" : ""}
                                        {buoc4Diem.toFixed(2)} điểm
                                      </span>
                                    </p>
                                    {buoc4Dung && buoc4DungTai && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        <strong>Đã dừng xét tại:</strong> Bước {buoc4DungTai}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500 italic mt-3">
                                  Không có mối tương quan nào được xác định
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      })()}
    </>
  );
}
