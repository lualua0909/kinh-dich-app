import React, { useState } from "react";
import { Table, Card, Tooltip, Drawer, Modal, Collapse, Button } from "antd";
import ReactMarkdown from "react-markdown";
import nguHanhRelations from "../data/nguHanhRelations.json";
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
  LUC_TU_ICONS,
  LUC_THAN_CODES,
  getLucTuName,
  getLucThanName,
  isLucThanSinh,
  isLucThanKhac,
} from "../data/lucThuInfo";
import { getHexagramOmen } from "../data/hexagramOmens";
import {
  getHexagramMeaningCached,
  useHexagramMeanings,
} from "../hooks/useHexagramMeanings";
import { UserOutlined } from "@ant-design/icons";
import lucTuInfo from "../data/lucTuInfo.json";
import { useHexagramLines } from "../hooks/useHexagramLines";
import {
  getNhiHopOf,
  getNhiXungOf,
  getTamHopGroupOf,
  getNhapMoOf,
  getDiaChiNhapMoTai,
  isTamHopDiaChi,
  isNhiHopDiaChi,
  DIA_CHI_CODES,
  DIA_CHI_NAMES,
  DIA_CHI_ICONS,
  isNhiXungDiaChi,
  hasFullTamHinhGroup,
} from "../utils/diaChi";

// Helper: Extract địa chi từ canChi
export const extractDiaChi = (canChi) => {
  if (!canChi) return null;
  if (canChi.includes("-")) {
    const parts = canChi.split("-");
    return parts[0];
  } else {
    const parts = canChi.split(" ");
    return parts[parts.length - 1];
  }
};

export default function InterpretationTables({
  originalHexagram,
  changedHexagram,
  movingLine,
  dungThan = null,
  metadata = null,
}) {
  if (!originalHexagram) {
    return null;
  }

  // Load hexagram meanings
  const meaningsReady = useHexagramMeanings();

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
  // Ngũ hành tương sinh / tương khắc data import from json
  // const nguHanhRelations = { ... } (removed)
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
      Tý: { name: "Thủy", color: "text-blue-600 bg-blue-50" },
    };
    return nguHanhMap[diaChi] || null;
  };


  // Helper: Xác định quan hệ tương sinh/tương khắc giữa 2 địa chi
  const getDiaChiRelation = (chi1, chi2) => {
    if (!chi1 || !chi2) return null;
    if (chi1 === chi2) return "bằng";

    const nguHanh1 = getNguHanhFromDiaChi(chi1);
    const nguHanh2 = getNguHanhFromDiaChi(chi2);
    if (!nguHanh1 || !nguHanh2) return null;

    // nguHanhRelations imported globally

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

    // nguHanhRelations imported globally

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
        <div className="font-bold mb-1 text-sm flex items-center gap-1">
          <span>{rel.icon}</span>
          <span>{nguHanhName}</span>
        </div>
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

  // (thanhLongDiaChiInfo được định nghĩa phía dưới, sau phần lucTuInfo)

  // State for fullscreen Lục Thú drawer
  const [lucTuDrawerData, setLucTuDrawerData] = React.useState(null);

  // State for hexagram meaning modal
  const [hexagramModalData, setHexagramModalData] = useState(null);

  // State for Lục Thân detail modal
  const [lucThanModalData, setLucThanModalData] = useState(null);

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

    const tuCode = LUC_TU_CODES[tuName] || lucTu;
    const thanCode = LUC_THAN_CODES[thanName] || lucThan;

    if (!tuCode || !thanCode) return null;

    const code = `${tuCode}-${thanCode}`;
    const tuIcon = LUC_TU_ICONS[tuCode] || "";
    return {
      label: `${tuIcon}${tuName} lâm ${thanName}`,
      code,
    };
  };

  const getClassificationDiaChi = (lucTu, canChi) => {
    if (!lucTu || !canChi) return null;

    const diaChi = extractDiaChi(canChi);
    if (!diaChi) return null;

    const tuName = getLucTuName(lucTu);

    // Đảm bảo có code
    const tuCode = LUC_TU_CODES[tuName] || lucTu;
    const chiCode = DIA_CHI_CODES[diaChi];

    if (!tuCode || !chiCode) return null;

    const code = `${tuCode}-${chiCode}`;

    const tuIcon = LUC_TU_ICONS[tuCode] || "";
    const chiIcon = DIA_CHI_ICONS[chiCode] || "";
    return {
      label: `${tuIcon}${tuName} lâm ${chiIcon}${diaChi}`,
      code,
    };
  };

  // Function to render tooltip for Địa Chi showing Tam Hợp, Nhị Hợp, Nhị Xung
  const renderDiaChiTooltip = (diaChi) => {
    if (!diaChi) return null;

    // Helper để lấy tên hiển thị từ code
    const getName = (code) => {
      const name = DIA_CHI_NAMES[code] || code;
      const icon = DIA_CHI_ICONS[code] || "";
      return icon ? `${icon}${name}` : name;
    };

    const nhiHopCode = getNhiHopOf(diaChi);
    const nhiXungCode = getNhiXungOf(diaChi);

    // getTamHopGroupOf trả về mảng codes (VD: ["HO", "MA", "MU"])
    const tamHopGroupCodes = getTamHopGroupOf(diaChi);

    // Khi lọc partner, cần lưu ý diaChi đầu vào có thể là Tên (Tý) hoặc Code (TY).
    // getTamHopGroupOf đã tự xử lý input là Tên/Code và trả về Code chuẩn.
    // Nên ta cần convert input `diaChi` sang Code để so sánh loại trừ chính nó.
    const currentDiaChiCode = DIA_CHI_CODES[diaChi] || diaChi;

    const tamHopPartners = tamHopGroupCodes
      ? tamHopGroupCodes
        .filter((code) => code !== currentDiaChiCode)
        .map(getName)
      : [];

    const nhapMoCode = getNhapMoOf(diaChi);
    const diaChiNhapMoTaiCodes = getDiaChiNhapMoTai(diaChi);

    const currentCode = DIA_CHI_CODES[diaChi] || diaChi;
    const icon = DIA_CHI_ICONS[currentCode] || "";

    return (
      <div className="max-w-xs text-xs space-y-2">
        <div className="font-bold mb-2 text-sm">{icon}{diaChi}</div>

        {nhiHopCode && (
          <div>
            <span className="font-semibold text-green-600">Nhị Hợp:</span>{" "}
            <span className="font-bold">{getName(nhiHopCode)}</span>
          </div>
        )}

        {nhiXungCode && (
          <div>
            <span className="font-semibold text-red-600">Nhị Xung:</span>{" "}
            <span className="font-bold">{getName(nhiXungCode)}</span>
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

        {nhapMoCode && (
          <div>
            <span className="font-semibold text-purple-600">Nhập Mộ tại:</span>{" "}
            <span className="font-bold">{getName(nhapMoCode)}</span>
          </div>
        )}

        {diaChiNhapMoTaiCodes.length > 0 && (
          <div>
            <span className="font-semibold text-purple-600">Là mộ của:</span>{" "}
            <span className="font-bold">
              {diaChiNhapMoTaiCodes.map(getName).join(", ")}
            </span>
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
          <span className="cursor-help text-center flex flex-col items-center">
            {DIA_CHI_ICONS[DIA_CHI_CODES[diaChi]] && (
              <span className="text-lg leading-none mb-0.5" style={{ display: 'block', height: '1.2em' }}>
                {DIA_CHI_ICONS[DIA_CHI_CODES[diaChi]]}
              </span>
            )}
            <span className="leading-tight">{canChi}</span>
          </span>
        </Tooltip>
        {nguHanh && (
          <Tooltip title={renderNguHanhTooltip(nguHanh.name)} placement="top">
            <span
              className={`text-xs px-2 py-0.5 rounded ${nguHanh.color} font-semibold cursor-help flex items-center gap-1`}
            >
              <span>{nguHanhRelations[nguHanh.name]?.icon}</span>
              <span>{nguHanh.name}</span>
            </span>
          </Tooltip>
        )}
      </div>
    );
  };

  const renderLucThan = (lucThan, record) => {
    const fullLucThan = getLucThanName(lucThan);
    const info = getDungThanInfo(fullLucThan);

    if (!info) return <span className="font-semibold">{fullLucThan}</span>;

    let childOrderInfo = null;
    if (fullLucThan === "Tử Tôn" && record?.canChi) {
      const diaChi = extractDiaChi(record.canChi);
      const normalizedCode = DIA_CHI_CODES[diaChi] || diaChi;
      const mapCodeToOrder = {
        TY: 1, SU: 2, DN: 3, MA: 4, TH: 5, TI: 6,
        NG: 7, MU: 8, TN: 9, DA: 10, TU: 11, HO: 12
      };

      const order = mapCodeToOrder[normalizedCode];

      if (order) {
        childOrderInfo = (
          <div className="pt-2 border-t border-gray-300 mt-2">
            <span className="font-semibold text-purple-600">
              Luận đoán thứ bậc con:
            </span>
            <div className="ml-2 mt-1">
              <span>
                Là con thứ <strong>{order}</strong>
              </span>
            </div>
          </div>
        );
      }
    }

    const handleClick = () => {
      setLucThanModalData({
        title: info.label,
        content: info.content,
        extra: childOrderInfo
      });
    };

    return (
      <span
        className={`font-semibold text-blue-700 cursor-pointer underline decoration-dotted ${record?.extraClassName || ""}`}
        onClick={handleClick}
      >
        {fullLucThan}
      </span>
    );
  };

  // Lục Thú meanings (moved to lucTuInfo.json)

  const renderLucTu = (lucTu, record) => {
    if (!lucTu) return "-";
    const fullLucTu = getLucTuName(lucTu);
    const code = LUC_TU_CODES[fullLucTu] || lucTu;
    const icon = LUC_TU_ICONS[code] || "";
    const info = lucTuInfo[code];

    return (
      <span
        className={`cursor-pointer underline decoration-dotted flex items-center justify-center gap-1 ${info ? "text-blue-700" : ""
          }`}
        onClick={() => openLucTuDrawer(lucTu, record)}
      >
        {icon && <span>{icon}</span>}
        <span>{fullLucTu}</span>
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
      },
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
      },
    },
    {
      title: "Lục Thân",
      dataIndex: "lucThan",
      key: "lucThan",
      width: 100,
      align: "center",
      render: (lucThan, record) => {
        const isDungThanHao = dungThanHaos1.has(record.hao);
        const extraClassName = dungThan && isDungThanHao ? "text-green-600 font-bold" : "";
        return renderLucThan(lucThan, { ...record, extraClassName });
      },
    },
    {
      title: "Can Chi",
      dataIndex: "canChi",
      key: "canChi",
      width: 120,
      align: "center",
      render: (canChi) => renderCanChi(canChi),
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
            {renderLucThan(lucThanCode, { canChi: diaChi, extraClassName: isDungThan ? "text-green-600 font-bold" : "" })}
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
      },
    },
    {
      title: "Tuần không",
      dataIndex: "tuanKhong",
      key: "tuanKhong",
      width: 100,
      align: "center",
      render: (tuanKhong) => <span>{tuanKhong || ""}</span>,
    },
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
      },
    },
    {
      title: "Lục Thân",
      dataIndex: "lucThan",
      key: "lucThan",
      width: 100,
      align: "center",
      render: (lucThan, record) => {
        const isDungThanHao = dungThanHaos2.has(record.hao);
        const extraClassName = dungThan && isDungThanHao ? "text-green-600 font-bold" : "";
        return renderLucThan(lucThan, { ...record, extraClassName });
      },
    },
    {
      title: "Can Chi",
      dataIndex: "canChi",
      key: "canChi",
      width: 120,
      align: "center",
      render: (canChi) => renderCanChi(canChi),
    },
    {
      title: "Lục Thú",
      dataIndex: "lucTu",
      key: "lucTu",
      width: 120,
      align: "center",
      render: (lucTu, record) => renderLucTu(lucTu, record),
    },
    {
      title: "Tuần không",
      dataIndex: "tuanKhong",
      key: "tuanKhong",
      width: 100,
      align: "center",
      render: (tuanKhong) => <span>{tuanKhong || ""}</span>,
    },
  ];

  // Render content for Lục Thú fullscreen drawer
  const renderLucTuDrawerContent = () => {
    if (!lucTuDrawerData) return null;
    const { lucTu, record } = lucTuDrawerData;

    // lucTu passed here is likely the Name (e.g. "Đằng Xà") from openLucTuDrawer logic
    const lucTuName = getLucTuName(lucTu);
    const lucTuCode = LUC_TU_CODES[lucTuName] || lucTu; // Normalize to Code (e.g. "DX")

    const info = lucTuInfo[lucTuCode];
    const lucThan = record?.lucThan;
    const lucThanName = getLucThanName(lucThan);
    // Chuyển đổi tên đầy đủ sang code rút gọn để truy cập JSON
    const lucThanCode = LUC_THAN_CODES[lucThanName] || lucThan || "";

    const clsThan = getClassification(lucTu, lucThan);
    const clsDiaChi = getClassificationDiaChi(lucTu, record?.canChi);

    let diaChiExtraText = null;
    if (record?.canChi) {
      const diaChi = extractDiaChi(record.canChi);
      const diaChiCode = DIA_CHI_CODES[diaChi] || diaChi || "";

      if (lucTuCode === "TL") {
        diaChiExtraText = thanhLongDiaChiInfo[diaChiCode] || null;
      } else if (lucTuCode === "BH") {
        diaChiExtraText = bachHoDiaChiInfo[diaChiCode] || null;
      } else if (lucTuCode === "CTr") {
        diaChiExtraText = cauTranDiaChiInfo[diaChiCode] || null;
      } else if (lucTuCode === "CT") {
        diaChiExtraText = chuTuocDiaChiInfo[diaChiCode] || null;
      } else if (lucTuCode === "DX") {
        diaChiExtraText = dangXaDiaChiInfo[diaChiCode] || null;
      } else if (lucTuCode === "HV") {
        diaChiExtraText = huyenVuDiaChiInfo[diaChiCode] || null;
      }
    }

    return (
      <div className="space-y-4 text-sm">
        {info && (
          <>
            {(clsThan || clsDiaChi) && (
              <div className="pt-4 border-t border-gray-300 space-y-3">
                {clsThan && (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{clsThan.label}</span>
                    </div>
                    {lucThanCode &&
                      lucTuCode === "TL" &&
                      thanhLongLucThanInfo[lucThanCode] && (
                        <div className="mt-2 text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {thanhLongLucThanInfo[lucThanCode]}
                          </ReactMarkdown>
                        </div>
                      )}
                    {lucThanCode &&
                      lucTuCode === "BH" &&
                      bachHoLucThanInfo[lucThanCode] && (
                        <div className="mt-2 text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {bachHoLucThanInfo[lucThanCode]}
                          </ReactMarkdown>
                        </div>
                      )}
                    {lucThanCode &&
                      lucTuCode === "CTr" &&
                      cauTranLucThanInfo[lucThanCode] && (
                        <div className="mt-2 text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {cauTranLucThanInfo[lucThanCode]}
                          </ReactMarkdown>
                        </div>
                      )}
                    {lucThanCode &&
                      lucTuCode === "CT" &&
                      chuTuocLucThanInfo[lucThanCode] && (
                        <div className="mt-2 text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {chuTuocLucThanInfo[lucThanCode]}
                          </ReactMarkdown>
                        </div>
                      )}
                    {lucThanCode &&
                      lucTuCode === "DX" &&
                      dangXaLucThanInfo[lucThanCode] && (
                        <div className="mt-2 text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {dangXaLucThanInfo[lucThanCode]}
                          </ReactMarkdown>
                        </div>
                      )}
                    {lucThanCode &&
                      lucTuCode === "HV" &&
                      huyenVuLucThanInfo[lucThanCode] && (
                        <div className="mt-2 text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {huyenVuLucThanInfo[lucThanCode]}
                          </ReactMarkdown>
                        </div>
                      )}
                  </div>
                )}

                {clsDiaChi && (
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{clsDiaChi.label}</span>
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
            <div className="leading-relaxed text-gray-800 prose prose-sm max-w-none">
              <ReactMarkdown>{info.content}</ReactMarkdown>
            </div>
          </>
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
        title={
          <div className="flex items-center gap-2">
            <span>{LUC_TU_ICONS[LUC_TU_CODES[getLucTuName(lucTuDrawerData?.lucTu)] || lucTuDrawerData?.lucTu]}</span>
            <span>{getLucTuName(lucTuDrawerData?.lucTu) || "Lục Thú"}</span>
          </div>
        }
        destroyOnClose
        bodyStyle={{ padding: 16 }}
      >
        {renderLucTuDrawerContent()}
      </Drawer>

      {/* Modal hiển thị chi tiết Lục Thân */}
      <Modal
        title={lucThanModalData?.title || "Chi tiết Lục Thân"}
        open={!!lucThanModalData}
        onCancel={() => setLucThanModalData(null)}
        footer={[
          <Button key="close" onClick={() => setLucThanModalData(null)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        <div className="prose prose-sm prose-amber max-w-none">
          <ReactMarkdown>{lucThanModalData?.content || ""}</ReactMarkdown>
          {lucThanModalData?.extra}
        </div>
      </Modal>

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
              const meaning = meaningsReady
                ? getHexagramMeaningCached(hexagramModalData.hexagramKey)
                : null;
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
                  originalHexagram.name,
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
                    changedHexagram.name,
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
      {dungThan &&
        (() => {
          // Tìm hào Thế (theUng = 1)
          const theHao = lineData1.find((line) => Number(line.theUng) === 1);
          const theDiaChi = theHao ? extractDiaChi(theHao.canChi) : null;

          // Tìm tất cả các hào Dụng Thần
          const dungThanName = getLucThanName(dungThan);
          const allDungThanHaos = lineData1.filter((line) => {
            return getLucThanName(line.lucThan) === dungThanName;
          });

          // Hàm helper để tính điểm cho một hào Dụng Thần
          const calculateDungThanDiem = (hao) => {
            const diaChi = extractDiaChi(hao.canChi);
            if (!diaChi) return -Infinity;

            const yearDiaChi = getYearDiaChi();
            const monthDiaChi = getMonthDiaChi();
            const dayDiaChi = getDayDiaChi();

            let totalDiem = 0;

            // Tính điểm Thái Tuế/Tuế Phá
            if (yearDiaChi) {
              if (diaChi === yearDiaChi) {
                totalDiem += 0; // Thái Tuế
              } else if (getNhiXungOf(diaChi) === yearDiaChi) {
                totalDiem -= 0.25; // Tuế Phá
              }
            }

            // Tính điểm với Tháng
            if (monthDiaChi) {
              if (diaChi === monthDiaChi) {
                totalDiem += 1.75; // Nguyệt Kiến
              } else if (isTamHopDiaChi(diaChi, monthDiaChi)) {
                totalDiem += 1; // Tam Hợp
              } else if (isNhiHopDiaChi(diaChi, monthDiaChi)) {
                totalDiem += 1; // Nhị Hợp
              } else if (isNhiXungDiaChi(diaChi, monthDiaChi)) {
                totalDiem -= 1; // Nguyệt Phá
              } else if (getNhapMoOf(diaChi) === monthDiaChi) {
                totalDiem -= 0.25; // Nhập Mộ
              } else {
                // Xét ngũ hành
                const nguHanh = getNguHanhFromDiaChi(diaChi);
                const monthNguHanh = getNguHanhFromDiaChi(monthDiaChi);
                if (nguHanh && monthNguHanh) {
                  const nguHanhRel = getNguHanhRelation(
                    nguHanh.name,
                    monthNguHanh.name
                  );
                  if (nguHanhRel === "duocSinh" || nguHanhRel === "trung") {
                    totalDiem += 1;
                  } else if (nguHanhRel === "sinh" || nguHanhRel === "biKhac") {
                    totalDiem -= 1;
                  } else if (nguHanhRel === "khac") {
                    totalDiem -= 0.5;
                  }
                }
              }
            }

            // Tính điểm với Ngày
            if (dayDiaChi) {
              if (diaChi === dayDiaChi) {
                totalDiem += 1.75; // Nhật Kiến
              } else if (isTamHopDiaChi(diaChi, dayDiaChi)) {
                totalDiem += 1; // Tam Hợp
              } else if (isNhiHopDiaChi(diaChi, dayDiaChi)) {
                totalDiem += 1; // Nhị Hợp
              } else if (isNhiXungDiaChi(diaChi, dayDiaChi)) {
                totalDiem -= 1; // Nhật Phá
              } else if (getNhapMoOf(diaChi) === dayDiaChi) {
                totalDiem -= 0.25; // Nhập Mộ
              } else {
                // Xét ngũ hành
                const nguHanh = getNguHanhFromDiaChi(diaChi);
                const dayNguHanh = getNguHanhFromDiaChi(dayDiaChi);
                if (nguHanh && dayNguHanh) {
                  const nguHanhRel = getNguHanhRelation(
                    nguHanh.name,
                    dayNguHanh.name
                  );
                  if (nguHanhRel === "duocSinh" || nguHanhRel === "trung") {
                    totalDiem += 1;
                  } else if (nguHanhRel === "sinh" || nguHanhRel === "biKhac") {
                    totalDiem -= 1;
                  } else if (nguHanhRel === "khac") {
                    totalDiem -= 0.5;
                  }
                }
              }
            }

            return totalDiem;
          };

          // Tính điểm cho tất cả các hào Dụng Thần và chọn hào có điểm cao nhất
          let dungThanHao = null;
          if (allDungThanHaos.length > 0) {
            if (allDungThanHaos.length === 1) {
              dungThanHao = allDungThanHaos[0];
            } else {
              // Có nhiều hơn 1 hào Dụng Thần, chọn hào có điểm cao nhất
              let maxDiem = -Infinity;
              for (const hao of allDungThanHaos) {
                const diem = calculateDungThanDiem(hao);
                if (diem > maxDiem) {
                  maxDiem = diem;
                  dungThanHao = hao;
                }
              }
            }
          }

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
                color: "text-green-600",
              };
            } else if (relation === "duocSinh") {
              // Thế được sinh bởi Dụng
              buoc2KetLuan = {
                relation: "Thế được sinh bởi Dụng",
                text: "Tốt",
                color: "text-green-600",
              };
            } else if (relation === "sinh") {
              // Thế sinh Dụng
              buoc2KetLuan = {
                relation: "Thế sinh Dụng",
                text: "Tốt nhưng cần phải có sự cố gắng thì việc mới thành",
                color: "text-yellow-600",
              };
            } else if (relation === "khac") {
              // Thế khắc Dụng
              buoc2KetLuan = {
                relation: "Thế khắc Dụng",
                text: "Rất xấu",
                color: "text-red-600",
              };
            } else if (relation === "biKhac") {
              // Dụng khắc Thế
              buoc2KetLuan = {
                relation: "Dụng khắc Thế",
                text: "Tương đối xấu",
                color: "text-orange-600",
              };
            }
          }

          // Kiểm tra Thái Tuế và Tuế Phá
          const yearDiaChi = getYearDiaChi();
          let thaiTue = false;
          let tuePha = false;
          let buoc3ThaiTueDiem = 0; // Điểm cho bước 3 (Thái Tuế/Tuế Phá)
          if (dungThanDiaChi && yearDiaChi) {
            thaiTue = dungThanDiaChi === yearDiaChi;
            tuePha = getNhiXungOf(dungThanDiaChi) === yearDiaChi;

            // Tính điểm: Thái Tuế = +0 điểm, Tuế Phá = -0.25 điểm
            if (thaiTue) {
              buoc3ThaiTueDiem = 0;
            } else if (tuePha) {
              buoc3ThaiTueDiem = -0.25;
            }
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
              checked: true,
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
                checked: true,
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
                  checked: true,
                });
                if (isNhiHopDiaChi(dungThanDiaChi, monthDiaChi)) {
                  buoc3Diem += 1;
                  buoc3Results[buoc3Results.length - 1].diem = 1;
                  buoc3Results[buoc3Results.length - 1].color =
                    "text-green-600";
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
                    checked: true,
                  });
                  if (isNhiXungDiaChi(dungThanDiaChi, monthDiaChi)) {
                    buoc3Diem -= 1;
                    buoc3Results[buoc3Results.length - 1].diem = -1;
                    buoc3Results[buoc3Results.length - 1].color =
                      "text-red-600";
                    buoc3Results[buoc3Results.length - 1].matched = true;
                    buoc3Dung = true;
                    buoc3DungTai = "3.4";
                  } else {
                    buoc3Results[buoc3Results.length - 1].matched = false;
                    buoc3Results[buoc3Results.length - 1].color =
                      "text-gray-500";
                    // 3.5: Nhập mộ
                    const nhapMo = getNhapMoOf(dungThanDiaChi);
                    buoc3Results.push({
                      step: "3.5",
                      name: "Nhập Mộ",
                      description: `Địa chi Dụng Thần (${dungThanDiaChi}) nhập mộ tại địa chi tháng (${monthDiaChi})`,
                      checked: true,
                    });
                    if (nhapMo === monthDiaChi) {
                      buoc3Diem -= 0.25;
                      buoc3Results[buoc3Results.length - 1].diem = -0.25;
                      buoc3Results[buoc3Results.length - 1].color =
                        "text-orange-600";
                      buoc3Results[buoc3Results.length - 1].matched = true;
                      buoc3Dung = true;
                      buoc3DungTai = "3.5";
                    } else {
                      buoc3Results[buoc3Results.length - 1].matched = false;
                      buoc3Results[buoc3Results.length - 1].color =
                        "text-gray-500";
                      // 3.6: Xét ngũ hành
                      const dungThanNguHanh =
                        getNguHanhFromDiaChi(dungThanDiaChi);
                      const monthNguHanh = getNguHanhFromDiaChi(monthDiaChi);
                      if (dungThanNguHanh && monthNguHanh) {
                        const nguHanhRel = getNguHanhRelation(
                          dungThanNguHanh.name,
                          monthNguHanh.name
                        );
                        buoc3Results.push({
                          step: "3.6",
                          name: "Ngũ Hành",
                          description: `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) với ngũ hành tháng (${monthNguHanh.name})`,
                          checked: true,
                        });
                        if (nguHanhRel === "duocSinh") {
                          // Dụng được tháng sinh
                          buoc3Diem += 1;
                          buoc3Results[buoc3Results.length - 1].diem = 1;
                          buoc3Results[buoc3Results.length - 1].color =
                            "text-green-600";
                          buoc3Results[
                            buoc3Results.length - 1
                          ].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) được ngũ hành tháng (${monthNguHanh.name}) tương sinh`;
                          buoc3Results[buoc3Results.length - 1].matched = true;
                          buoc3DungTai = "3.6";
                        } else if (nguHanhRel === "trung") {
                          // Trùng ngũ hành
                          buoc3Diem += 1;
                          buoc3Results[buoc3Results.length - 1].diem = 1;
                          buoc3Results[buoc3Results.length - 1].color =
                            "text-green-600";
                          buoc3Results[
                            buoc3Results.length - 1
                          ].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) trùng với ngũ hành tháng (${monthNguHanh.name})`;
                          buoc3Results[buoc3Results.length - 1].matched = true;
                          buoc3DungTai = "3.6";
                        } else if (nguHanhRel === "sinh") {
                          // Dụng sinh tháng
                          buoc3Diem -= 1;
                          buoc3Results[buoc3Results.length - 1].diem = -1;
                          buoc3Results[buoc3Results.length - 1].color =
                            "text-red-600";
                          buoc3Results[
                            buoc3Results.length - 1
                          ].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) tương sinh ngũ hành tháng (${monthNguHanh.name})`;
                          buoc3Results[buoc3Results.length - 1].matched = true;
                          buoc3DungTai = "3.6";
                        } else if (nguHanhRel === "khac") {
                          // Dụng khắc tháng
                          buoc3Diem -= 0.5;
                          buoc3Results[buoc3Results.length - 1].diem = -0.5;
                          buoc3Results[buoc3Results.length - 1].color =
                            "text-orange-600";
                          buoc3Results[
                            buoc3Results.length - 1
                          ].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) tương khắc ngũ hành tháng (${monthNguHanh.name})`;
                          buoc3Results[buoc3Results.length - 1].matched = true;
                          buoc3DungTai = "3.6";
                        } else if (nguHanhRel === "biKhac") {
                          // Tháng khắc Dụng
                          buoc3Diem -= 1;
                          buoc3Results[buoc3Results.length - 1].diem = -1;
                          buoc3Results[buoc3Results.length - 1].color =
                            "text-red-600";
                          buoc3Results[
                            buoc3Results.length - 1
                          ].description = `Ngũ hành tháng (${monthNguHanh.name}) tương khắc ngũ hành Dụng Thần (${dungThanNguHanh.name})`;
                          buoc3Results[buoc3Results.length - 1].matched = true;
                          buoc3DungTai = "3.6";
                        } else {
                          buoc3Results[buoc3Results.length - 1].matched = false;
                          buoc3Results[buoc3Results.length - 1].color =
                            "text-gray-500";
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
              checked: true,
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
                checked: true,
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
                  checked: true,
                });
                if (isNhiHopDiaChi(dungThanDiaChi, dayDiaChi)) {
                  buoc4Diem += 1;
                  buoc4Results[buoc4Results.length - 1].diem = 1;
                  buoc4Results[buoc4Results.length - 1].color =
                    "text-green-600";
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
                    checked: true,
                  });
                  if (isNhiXungDiaChi(dungThanDiaChi, dayDiaChi)) {
                    buoc4Diem -= 1;
                    buoc4Results[buoc4Results.length - 1].diem = -1;
                    buoc4Results[buoc4Results.length - 1].color =
                      "text-red-600";
                    buoc4Results[buoc4Results.length - 1].matched = true;
                    buoc4Dung = true;
                    buoc4DungTai = "4.4";
                  } else {
                    buoc4Results[buoc4Results.length - 1].matched = false;
                    buoc4Results[buoc4Results.length - 1].color =
                      "text-gray-500";
                    // 4.5: Nhập mộ
                    const nhapMo = getNhapMoOf(dungThanDiaChi);
                    buoc4Results.push({
                      step: "4.5",
                      name: "Nhập Mộ",
                      description: `Địa chi Dụng Thần (${dungThanDiaChi}) nhập mộ tại địa chi ngày (${dayDiaChi})`,
                      checked: true,
                    });
                    if (nhapMo === dayDiaChi) {
                      buoc4Diem -= 0.25;
                      buoc4Results[buoc4Results.length - 1].diem = -0.25;
                      buoc4Results[buoc4Results.length - 1].color =
                        "text-orange-600";
                      buoc4Results[buoc4Results.length - 1].matched = true;
                      buoc4Dung = true;
                      buoc4DungTai = "4.5";
                    } else {
                      buoc4Results[buoc4Results.length - 1].matched = false;
                      buoc4Results[buoc4Results.length - 1].color =
                        "text-gray-500";
                      // 4.6: Xét ngũ hành
                      const dungThanNguHanh =
                        getNguHanhFromDiaChi(dungThanDiaChi);
                      const dayNguHanh = getNguHanhFromDiaChi(dayDiaChi);
                      if (dungThanNguHanh && dayNguHanh) {
                        const nguHanhRel = getNguHanhRelation(
                          dungThanNguHanh.name,
                          dayNguHanh.name
                        );
                        buoc4Results.push({
                          step: "4.6",
                          name: "Ngũ Hành",
                          description: `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) với ngũ hành ngày (${dayNguHanh.name})`,
                          checked: true,
                        });
                        if (nguHanhRel === "duocSinh") {
                          // Dụng được ngày sinh
                          buoc4Diem += 1;
                          buoc4Results[buoc4Results.length - 1].diem = 1;
                          buoc4Results[buoc4Results.length - 1].color =
                            "text-green-600";
                          buoc4Results[
                            buoc4Results.length - 1
                          ].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) được ngũ hành ngày (${dayNguHanh.name}) tương sinh`;
                          buoc4Results[buoc4Results.length - 1].matched = true;
                          buoc4DungTai = "4.6";
                        } else if (nguHanhRel === "trung") {
                          // Trùng ngũ hành
                          buoc4Diem += 1;
                          buoc4Results[buoc4Results.length - 1].diem = 1;
                          buoc4Results[buoc4Results.length - 1].color =
                            "text-green-600";
                          buoc4Results[
                            buoc4Results.length - 1
                          ].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) trùng với ngũ hành ngày (${dayNguHanh.name})`;
                          buoc4Results[buoc4Results.length - 1].matched = true;
                          buoc4DungTai = "4.6";
                        } else if (nguHanhRel === "sinh") {
                          // Dụng sinh ngày
                          buoc4Diem -= 1;
                          buoc4Results[buoc4Results.length - 1].diem = -1;
                          buoc4Results[buoc4Results.length - 1].color =
                            "text-red-600";
                          buoc4Results[
                            buoc4Results.length - 1
                          ].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) tương sinh ngũ hành ngày (${dayNguHanh.name})`;
                          buoc4Results[buoc4Results.length - 1].matched = true;
                          buoc4DungTai = "4.6";
                        } else if (nguHanhRel === "khac") {
                          // Dụng khắc ngày
                          buoc4Diem -= 0.5;
                          buoc4Results[buoc4Results.length - 1].diem = -0.5;
                          buoc4Results[buoc4Results.length - 1].color =
                            "text-orange-600";
                          buoc4Results[
                            buoc4Results.length - 1
                          ].description = `Ngũ hành Dụng Thần (${dungThanNguHanh.name}) tương khắc ngũ hành ngày (${dayNguHanh.name})`;
                          buoc4Results[buoc4Results.length - 1].matched = true;
                          buoc4DungTai = "4.6";
                        } else if (nguHanhRel === "biKhac") {
                          // Ngày khắc Dụng
                          buoc4Diem -= 1;
                          buoc4Results[buoc4Results.length - 1].diem = -1;
                          buoc4Results[buoc4Results.length - 1].color =
                            "text-red-600";
                          buoc4Results[
                            buoc4Results.length - 1
                          ].description = `Ngũ hành ngày (${dayNguHanh.name}) tương khắc ngũ hành Dụng Thần (${dungThanNguHanh.name})`;
                          buoc4Results[buoc4Results.length - 1].matched = true;
                          buoc4DungTai = "4.6";
                        } else {
                          buoc4Results[buoc4Results.length - 1].matched = false;
                          buoc4Results[buoc4Results.length - 1].color =
                            "text-gray-500";
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          // Bước 5: Kiểm tra Thái Tuế và Tuế Phá cho Hào Thế
          let thaiTueThe = false;
          let tuePhaThe = false;
          let buoc5ThaiTueDiem = 0; // Điểm cho bước 5 (Thái Tuế/Tuế Phá của Hào Thế)
          if (theDiaChi && yearDiaChi) {
            thaiTueThe = theDiaChi === yearDiaChi;
            tuePhaThe = getNhiXungOf(theDiaChi) === yearDiaChi;

            // Tính điểm: Thái Tuế = +0 điểm, Tuế Phá = -0.25 điểm
            if (thaiTueThe) {
              buoc5ThaiTueDiem = 0;
            } else if (tuePhaThe) {
              buoc5ThaiTueDiem = -0.25;
            }
          }

          // Bước 5: Xét mối tương quan Hào Thế và Tháng
          let buoc5Results = [];
          let buoc5Diem = 0;
          let buoc5Dung = false; // Dừng xét bước 5
          let buoc5DungTai = null; // Bước dừng

          if (theDiaChi && monthDiaChi) {
            // 5.1: Nguyệt kiến (trùng tháng)
            buoc5Results.push({
              step: "5.1",
              name: "Nguyệt Kiến",
              description: `Địa chi Hào Thế (${theDiaChi}) trùng với địa chi tháng (${monthDiaChi})`,
              checked: true,
            });
            if (theDiaChi === monthDiaChi) {
              buoc5Diem += 1.75;
              buoc5Results[buoc5Results.length - 1].diem = 1.75;
              buoc5Results[buoc5Results.length - 1].color = "text-green-600";
              buoc5Results[buoc5Results.length - 1].matched = true;
              buoc5Dung = true;
              buoc5DungTai = "5.1";
            } else {
              buoc5Results[buoc5Results.length - 1].matched = false;
              buoc5Results[buoc5Results.length - 1].color = "text-gray-500";
              // 5.2: Tam hợp
              buoc5Results.push({
                step: "5.2",
                name: "Tam Hợp",
                description: `Địa chi Hào Thế (${theDiaChi}) tam hợp với địa chi tháng (${monthDiaChi})`,
                checked: true,
              });
              if (isTamHopDiaChi(theDiaChi, monthDiaChi)) {
                buoc5Diem += 1;
                buoc5Results[buoc5Results.length - 1].diem = 1;
                buoc5Results[buoc5Results.length - 1].color = "text-green-600";
                buoc5Results[buoc5Results.length - 1].matched = true;
                buoc5Dung = true;
                buoc5DungTai = "5.2";
              } else {
                buoc5Results[buoc5Results.length - 1].matched = false;
                buoc5Results[buoc5Results.length - 1].color = "text-gray-500";
                // 5.3: Nhị hợp
                buoc5Results.push({
                  step: "5.3",
                  name: "Nhị Hợp",
                  description: `Địa chi Hào Thế (${theDiaChi}) nhị hợp với địa chi tháng (${monthDiaChi})`,
                  checked: true,
                });
                if (isNhiHopDiaChi(theDiaChi, monthDiaChi)) {
                  buoc5Diem += 1;
                  buoc5Results[buoc5Results.length - 1].diem = 1;
                  buoc5Results[buoc5Results.length - 1].color =
                    "text-green-600";
                  buoc5Results[buoc5Results.length - 1].matched = true;
                  buoc5Dung = true;
                  buoc5DungTai = "5.3";
                } else {
                  buoc5Results[buoc5Results.length - 1].matched = false;
                  buoc5Results[buoc5Results.length - 1].color = "text-gray-500";
                  // 5.4: Nhị xung (Nguyệt Phá)
                  buoc5Results.push({
                    step: "5.4",
                    name: "Nguyệt Phá",
                    description: `Địa chi Hào Thế (${theDiaChi}) nhị xung với địa chi tháng (${monthDiaChi})`,
                    checked: true,
                  });
                  if (isNhiXungDiaChi(theDiaChi, monthDiaChi)) {
                    buoc5Diem -= 1;
                    buoc5Results[buoc5Results.length - 1].diem = -1;
                    buoc5Results[buoc5Results.length - 1].color =
                      "text-red-600";
                    buoc5Results[buoc5Results.length - 1].matched = true;
                    buoc5Dung = true;
                    buoc5DungTai = "5.4";
                  } else {
                    buoc5Results[buoc5Results.length - 1].matched = false;
                    buoc5Results[buoc5Results.length - 1].color =
                      "text-gray-500";
                    // 5.5: Nhập mộ
                    const nhapMoThe = getNhapMoOf(theDiaChi);
                    buoc5Results.push({
                      step: "5.5",
                      name: "Nhập Mộ",
                      description: `Địa chi Hào Thế (${theDiaChi}) nhập mộ tại địa chi tháng (${monthDiaChi})`,
                      checked: true,
                    });
                    if (nhapMoThe === monthDiaChi) {
                      buoc5Diem -= 0.25;
                      buoc5Results[buoc5Results.length - 1].diem = -0.25;
                      buoc5Results[buoc5Results.length - 1].color =
                        "text-orange-600";
                      buoc5Results[buoc5Results.length - 1].matched = true;
                      buoc5Dung = true;
                      buoc5DungTai = "5.5";
                    } else {
                      buoc5Results[buoc5Results.length - 1].matched = false;
                      buoc5Results[buoc5Results.length - 1].color =
                        "text-gray-500";
                      // 5.6: Xét ngũ hành
                      const theNguHanh = getNguHanhFromDiaChi(theDiaChi);
                      const monthNguHanhThe = getNguHanhFromDiaChi(monthDiaChi);
                      if (theNguHanh && monthNguHanhThe) {
                        const nguHanhRelThe = getNguHanhRelation(
                          theNguHanh.name,
                          monthNguHanhThe.name
                        );
                        buoc5Results.push({
                          step: "5.6",
                          name: "Ngũ Hành",
                          description: `Ngũ hành Hào Thế (${theNguHanh.name}) với ngũ hành tháng (${monthNguHanhThe.name})`,
                          checked: true,
                        });
                        if (nguHanhRelThe === "duocSinh") {
                          buoc5Diem += 1;
                          buoc5Results[buoc5Results.length - 1].diem = 1;
                          buoc5Results[buoc5Results.length - 1].color =
                            "text-green-600";
                          buoc5Results[
                            buoc5Results.length - 1
                          ].description = `Ngũ hành Hào Thế (${theNguHanh.name}) được ngũ hành tháng (${monthNguHanhThe.name}) tương sinh`;
                          buoc5Results[buoc5Results.length - 1].matched = true;
                          buoc5DungTai = "5.6";
                        } else if (nguHanhRelThe === "trung") {
                          buoc5Diem += 1;
                          buoc5Results[buoc5Results.length - 1].diem = 1;
                          buoc5Results[buoc5Results.length - 1].color =
                            "text-green-600";
                          buoc5Results[
                            buoc5Results.length - 1
                          ].description = `Ngũ hành Hào Thế (${theNguHanh.name}) trùng với ngũ hành tháng (${monthNguHanhThe.name})`;
                          buoc5Results[buoc5Results.length - 1].matched = true;
                          buoc5DungTai = "5.6";
                        } else if (nguHanhRelThe === "sinh") {
                          buoc5Diem -= 1;
                          buoc5Results[buoc5Results.length - 1].diem = -1;
                          buoc5Results[buoc5Results.length - 1].color =
                            "text-red-600";
                          buoc5Results[
                            buoc5Results.length - 1
                          ].description = `Ngũ hành Hào Thế (${theNguHanh.name}) tương sinh ngũ hành tháng (${monthNguHanhThe.name})`;
                          buoc5Results[buoc5Results.length - 1].matched = true;
                          buoc5DungTai = "5.6";
                        } else if (nguHanhRelThe === "khac") {
                          buoc5Diem -= 0.5;
                          buoc5Results[buoc5Results.length - 1].diem = -0.5;
                          buoc5Results[buoc5Results.length - 1].color =
                            "text-orange-600";
                          buoc5Results[
                            buoc5Results.length - 1
                          ].description = `Ngũ hành Hào Thế (${theNguHanh.name}) tương khắc ngũ hành tháng (${monthNguHanhThe.name})`;
                          buoc5Results[buoc5Results.length - 1].matched = true;
                          buoc5DungTai = "5.6";
                        } else if (nguHanhRelThe === "biKhac") {
                          buoc5Diem -= 1;
                          buoc5Results[buoc5Results.length - 1].diem = -1;
                          buoc5Results[buoc5Results.length - 1].color =
                            "text-red-600";
                          buoc5Results[
                            buoc5Results.length - 1
                          ].description = `Ngũ hành tháng (${monthNguHanhThe.name}) tương khắc ngũ hành Hào Thế (${theNguHanh.name})`;
                          buoc5Results[buoc5Results.length - 1].matched = true;
                          buoc5DungTai = "5.6";
                        } else {
                          buoc5Results[buoc5Results.length - 1].matched = false;
                          buoc5Results[buoc5Results.length - 1].color =
                            "text-gray-500";
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          // Bước 6: Xét mối tương quan Hào Thế và Ngày
          let buoc6Results = [];
          let buoc6Diem = 0;
          let buoc6Dung = false; // Dừng xét bước 6
          let buoc6DungTai = null; // Bước dừng

          if (theDiaChi && dayDiaChi) {
            // 6.1: Nhật kiến (trùng ngày)
            buoc6Results.push({
              step: "6.1",
              name: "Nhật Kiến",
              description: `Địa chi Hào Thế (${theDiaChi}) trùng với địa chi ngày (${dayDiaChi})`,
              checked: true,
            });
            if (theDiaChi === dayDiaChi) {
              buoc6Diem += 1.75;
              buoc6Results[buoc6Results.length - 1].diem = 1.75;
              buoc6Results[buoc6Results.length - 1].color = "text-green-600";
              buoc6Results[buoc6Results.length - 1].matched = true;
              buoc6Dung = true;
              buoc6DungTai = "6.1";
            } else {
              buoc6Results[buoc6Results.length - 1].matched = false;
              buoc6Results[buoc6Results.length - 1].color = "text-gray-500";
              // 6.2: Tam hợp
              buoc6Results.push({
                step: "6.2",
                name: "Tam Hợp",
                description: `Địa chi Hào Thế (${theDiaChi}) tam hợp với địa chi ngày (${dayDiaChi})`,
                checked: true,
              });
              if (isTamHopDiaChi(theDiaChi, dayDiaChi)) {
                buoc6Diem += 1;
                buoc6Results[buoc6Results.length - 1].diem = 1;
                buoc6Results[buoc6Results.length - 1].color = "text-green-600";
                buoc6Results[buoc6Results.length - 1].matched = true;
                buoc6Dung = true;
                buoc6DungTai = "6.2";
              } else {
                buoc6Results[buoc6Results.length - 1].matched = false;
                buoc6Results[buoc6Results.length - 1].color = "text-gray-500";
                // 6.3: Nhị hợp
                buoc6Results.push({
                  step: "6.3",
                  name: "Nhị Hợp",
                  description: `Địa chi Hào Thế (${theDiaChi}) nhị hợp với địa chi ngày (${dayDiaChi})`,
                  checked: true,
                });
                if (isNhiHopDiaChi(theDiaChi, dayDiaChi)) {
                  buoc6Diem += 1;
                  buoc6Results[buoc6Results.length - 1].diem = 1;
                  buoc6Results[buoc6Results.length - 1].color =
                    "text-green-600";
                  buoc6Results[buoc6Results.length - 1].matched = true;
                  buoc6Dung = true;
                  buoc6DungTai = "6.3";
                } else {
                  buoc6Results[buoc6Results.length - 1].matched = false;
                  buoc6Results[buoc6Results.length - 1].color = "text-gray-500";
                  // 6.4: Nhị xung (Nhật Phá)
                  buoc6Results.push({
                    step: "6.4",
                    name: "Nhật Phá",
                    description: `Địa chi Hào Thế (${theDiaChi}) nhị xung với địa chi ngày (${dayDiaChi})`,
                    checked: true,
                  });
                  if (isNhiXungDiaChi(theDiaChi, dayDiaChi)) {
                    buoc6Diem -= 1;
                    buoc6Results[buoc6Results.length - 1].diem = -1;
                    buoc6Results[buoc6Results.length - 1].color =
                      "text-red-600";
                    buoc6Results[buoc6Results.length - 1].matched = true;
                    buoc6Dung = true;
                    buoc6DungTai = "6.4";
                  } else {
                    buoc6Results[buoc6Results.length - 1].matched = false;
                    buoc6Results[buoc6Results.length - 1].color =
                      "text-gray-500";
                    // 6.5: Nhập mộ
                    const nhapMoTheDay = getNhapMoOf(theDiaChi);
                    buoc6Results.push({
                      step: "6.5",
                      name: "Nhập Mộ",
                      description: `Địa chi Hào Thế (${theDiaChi}) nhập mộ tại địa chi ngày (${dayDiaChi})`,
                      checked: true,
                    });
                    if (nhapMoTheDay === dayDiaChi) {
                      buoc6Diem -= 0.25;
                      buoc6Results[buoc6Results.length - 1].diem = -0.25;
                      buoc6Results[buoc6Results.length - 1].color =
                        "text-orange-600";
                      buoc6Results[buoc6Results.length - 1].matched = true;
                      buoc6Dung = true;
                      buoc6DungTai = "6.5";
                    } else {
                      buoc6Results[buoc6Results.length - 1].matched = false;
                      buoc6Results[buoc6Results.length - 1].color =
                        "text-gray-500";
                      // 6.6: Xét ngũ hành
                      const theNguHanhDay = getNguHanhFromDiaChi(theDiaChi);
                      const dayNguHanhThe = getNguHanhFromDiaChi(dayDiaChi);
                      if (theNguHanhDay && dayNguHanhThe) {
                        const nguHanhRelTheDay = getNguHanhRelation(
                          theNguHanhDay.name,
                          dayNguHanhThe.name
                        );
                        buoc6Results.push({
                          step: "6.6",
                          name: "Ngũ Hành",
                          description: `Ngũ hành Hào Thế (${theNguHanhDay.name}) với ngũ hành ngày (${dayNguHanhThe.name})`,
                          checked: true,
                        });
                        if (nguHanhRelTheDay === "duocSinh") {
                          buoc6Diem += 1;
                          buoc6Results[buoc6Results.length - 1].diem = 1;
                          buoc6Results[buoc6Results.length - 1].color =
                            "text-green-600";
                          buoc6Results[
                            buoc6Results.length - 1
                          ].description = `Ngũ hành Hào Thế (${theNguHanhDay.name}) được ngũ hành ngày (${dayNguHanhThe.name}) tương sinh`;
                          buoc6Results[buoc6Results.length - 1].matched = true;
                          buoc6DungTai = "6.6";
                        } else if (nguHanhRelTheDay === "trung") {
                          buoc6Diem += 1;
                          buoc6Results[buoc6Results.length - 1].diem = 1;
                          buoc6Results[buoc6Results.length - 1].color =
                            "text-green-600";
                          buoc6Results[
                            buoc6Results.length - 1
                          ].description = `Ngũ hành Hào Thế (${theNguHanhDay.name}) trùng với ngũ hành ngày (${dayNguHanhThe.name})`;
                          buoc6Results[buoc6Results.length - 1].matched = true;
                          buoc6DungTai = "6.6";
                        } else if (nguHanhRelTheDay === "sinh") {
                          buoc6Diem -= 1;
                          buoc6Results[buoc6Results.length - 1].diem = -1;
                          buoc6Results[buoc6Results.length - 1].color =
                            "text-red-600";
                          buoc6Results[
                            buoc6Results.length - 1
                          ].description = `Ngũ hành Hào Thế (${theNguHanhDay.name}) tương sinh ngũ hành ngày (${dayNguHanhThe.name})`;
                          buoc6Results[buoc6Results.length - 1].matched = true;
                          buoc6DungTai = "6.6";
                        } else if (nguHanhRelTheDay === "khac") {
                          buoc6Diem -= 0.5;
                          buoc6Results[buoc6Results.length - 1].diem = -0.5;
                          buoc6Results[buoc6Results.length - 1].color =
                            "text-orange-600";
                          buoc6Results[
                            buoc6Results.length - 1
                          ].description = `Ngũ hành Hào Thế (${theNguHanhDay.name}) tương khắc ngũ hành ngày (${dayNguHanhThe.name})`;
                          buoc6Results[buoc6Results.length - 1].matched = true;
                          buoc6DungTai = "6.6";
                        } else if (nguHanhRelTheDay === "biKhac") {
                          buoc6Diem -= 1;
                          buoc6Results[buoc6Results.length - 1].diem = -1;
                          buoc6Results[buoc6Results.length - 1].color =
                            "text-red-600";
                          buoc6Results[
                            buoc6Results.length - 1
                          ].description = `Ngũ hành ngày (${dayNguHanhThe.name}) tương khắc ngũ hành Hào Thế (${theNguHanhDay.name})`;
                          buoc6Results[buoc6Results.length - 1].matched = true;
                          buoc6DungTai = "6.6";
                        } else {
                          buoc6Results[buoc6Results.length - 1].matched = false;
                          buoc6Results[buoc6Results.length - 1].color =
                            "text-gray-500";
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
                  {/* Các bước giải quẻ */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-parchment-300 pb-2">
                      Các Bước Giải Quẻ
                    </h3>
                    {(() => {
                      // Logic: Luận Vợ Đã Từng Kết Hôn
                      let voDaTungKetHonResult = null;
                      // 1. Tìm hào Thê Tài trong quẻ chính
                      const theTaiLines = lineData1.filter(l => getLucThanName(l.lucThan) === "Thê Tài");

                      for (const ttLine of theTaiLines) {
                        const isUpper = ttLine.hao >= 4; // Hào 4, 5, 6 là thượng quái
                        // 2. Tìm hào Phụ Mẫu cùng quái với hào Thê Tài
                        const phuMauLines = lineData1.filter(l => {
                          const isLUpper = l.hao >= 4;
                          return getLucThanName(l.lucThan) === "Phụ Mẫu" && isLUpper === isUpper;
                        });

                        for (const pmLine of phuMauLines) {
                          // 3. Kiểm tra hào tương ứng vị trí với hào Phụ Mẫu trong quẻ biến
                          const pmIndex = lineData1.findIndex(l => l.hao === pmLine.hao);
                          const pmChangedLine = lineData2[pmIndex];

                          // Tuần không KHÔNG ĐƯỢC bằng "K" (theo yêu cầu: must not be "K")
                          if (pmChangedLine && pmChangedLine.tuanKhong !== "K") {

                            // 4. Kiểm tra hào tương ứng vị trí với hào Thê Tài trong quẻ biến
                            const ttIndex = lineData1.findIndex(l => l.hao === ttLine.hao);
                            const ttChangedLine = lineData2[ttIndex];

                            // Lục thú bằng Chu Tước
                            const lucTuVal = ttChangedLine.lucTu;
                            const lucTuName = getLucTuName(lucTuVal);
                            const lucTuCode = LUC_TU_CODES[lucTuName] || lucTuVal;

                            if (lucTuCode === "CT") {
                              voDaTungKetHonResult = {
                                matched: true,
                                description: "Thỏa mãn các điều kiện: Hào Phụ Mẫu cùng quái với Thê Tài biến không Tuần Không, và Thê Tài biến lâm Chu Tước.",
                                theTaiHao: ttLine.hao,
                                phuMauHao: pmLine.hao
                              };
                              break;
                            }
                          }
                        }
                        if (voDaTungKetHonResult) break;
                      }

                      const collapseItems = [
                        {
                          key: "1",
                          label: "Bước 1: Xác định Dụng Thần",
                          children: (
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
                                    <div className="space-y-4">
                                      <div className="p-4 bg-white rounded-lg border border-parchment-200 shadow-sm leading-relaxed">
                                        <ReactMarkdown>{dungThanInfo.content}</ReactMarkdown>
                                      </div>
                                      {dungThanHao && (
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-2">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <p className="m-0 text-sm">
                                            <strong>Hào Dụng Thần:</strong> Hào {dungThanHao.hao} ({dungThanHao.canChi})
                                          </p>
                                        </div>
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
                          ),
                        },
                        {
                          key: "2",
                          label:
                            "Bước 2: Phân tích mối tương quan giữa hào Thế và Dụng Thần",
                          children: (
                            <div className="bg-white p-4 rounded-lg border border-parchment-200">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-parchment-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                  2
                                </div>
                                <div className="flex-1 prose prose-sm max-w-none text-gray-700">
                                  <p className="font-semibold mb-2">
                                    Phân tích mối tương quan giữa hào Thế và
                                    Dụng Thần
                                  </p>
                                  {theHao &&
                                    dungThanHao &&
                                    theDiaChi &&
                                    dungThanDiaChi ? (
                                    <div className="space-y-2">
                                      <p>
                                        <strong>Hào Thế:</strong> Hào{" "}
                                        {theHao.hao} ({theHao.canChi}) - Địa
                                        Chi: <strong>{theDiaChi}</strong>
                                      </p>
                                      <p>
                                        <strong>Hào Dụng Thần:</strong> Hào{" "}
                                        {dungThanHao.hao} ({dungThanHao.canChi})
                                        - Địa Chi:{" "}
                                        <strong>{dungThanDiaChi}</strong>
                                      </p>
                                      {buoc2KetLuan && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-parchment-400">
                                          <p className="font-semibold mb-1">
                                            Kết luận:
                                          </p>
                                          <p className="mb-2 text-gray-700">
                                            <strong>
                                              {buoc2KetLuan.relation}
                                            </strong>{" "}
                                            →{" "}
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
                          ),
                        },
                        {
                          key: "3",
                          label: `Bước 3: Xác định Dụng Thần có Thái Tuế hay Tuế Phá${(thaiTue || tuePha) && dungThanDiaChi && yearDiaChi
                            ? ` (${buoc3ThaiTueDiem > 0 ? "+" : ""
                            }${buoc3ThaiTueDiem.toFixed(2)} điểm)`
                            : ""
                            }`,
                          children: (
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
                                        <strong>Địa Chi của năm:</strong>{" "}
                                        {yearDiaChi}
                                      </p>
                                      <div className="mt-3 space-y-2">
                                        {thaiTue && (
                                          <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                                            <p className="font-semibold text-green-700">
                                              ✓ Có Thái Tuế (+0 điểm)
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              Địa chi của Dụng Thần trùng với
                                              địa chi của năm
                                            </p>
                                          </div>
                                        )}
                                        {tuePha && (
                                          <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                                            <p className="font-semibold text-red-700">
                                              ✗ Có Tuế Phá (-0.25 điểm)
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              Địa chi của Dụng Thần xung với địa
                                              chi của năm
                                            </p>
                                          </div>
                                        )}
                                        {!thaiTue && !tuePha && (
                                          <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-400">
                                            <p className="font-semibold text-gray-700">
                                              Không có Thái Tuế hay Tuế Phá (0
                                              điểm)
                                            </p>
                                          </div>
                                        )}
                                        {(thaiTue || tuePha) && (
                                          <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                                            <p className="font-semibold text-blue-700">
                                              Điểm Bước 3:{" "}
                                              <span className="text-xl">
                                                {buoc3ThaiTueDiem > 0
                                                  ? "+"
                                                  : ""}
                                                {buoc3ThaiTueDiem.toFixed(2)}{" "}
                                                điểm
                                              </span>
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
                          ),
                        },
                      ];

                      // Thêm các bước có điều kiện
                      if (dungThanDiaChi && monthDiaChi) {
                        collapseItems.push({
                          key: "3b",
                          label: `Bước 3: Xét mối tương quan Dụng Thần và Tháng${buoc3Diem !== undefined && buoc3Diem !== null
                            ? ` (${buoc3Diem > 0 ? "+" : ""
                            }${buoc3Diem.toFixed(2)} điểm)`
                            : ""
                            }`,
                          children: (
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
                                      <strong>Địa Chi của tháng:</strong>{" "}
                                      {monthDiaChi}
                                    </p>
                                    {buoc3Results.length > 0 ? (
                                      <div className="mt-3 space-y-3">
                                        {buoc3Results.map((result, index) => (
                                          <div
                                            key={index}
                                            className={`p-3 rounded border-l-4 ${result.matched
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
                                                  {buoc3DungTai ===
                                                    result.step && (
                                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                        Dừng tại đây
                                                      </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                  {result.description}
                                                </p>
                                              </div>
                                              {result.matched &&
                                                result.diem !== undefined && (
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
                                              <strong>Đã dừng xét tại:</strong>{" "}
                                              Bước {buoc3DungTai}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-gray-500 italic mt-3">
                                        Không có mối tương quan nào được xác
                                        định
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ),
                        });
                      }

                      if (dungThanDiaChi && dayDiaChi) {
                        collapseItems.push({
                          key: "4",
                          label: `Bước 4: Xét mối tương quan Dụng Thần và Ngày${buoc4Diem !== undefined && buoc4Diem !== null
                            ? ` (${buoc4Diem > 0 ? "+" : ""
                            }${buoc4Diem.toFixed(2)} điểm)`
                            : ""
                            }`,
                          children: (
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
                                      <strong>Địa Chi của ngày:</strong>{" "}
                                      {dayDiaChi}
                                    </p>
                                    {buoc4Results.length > 0 ? (
                                      <div className="mt-3 space-y-3">
                                        {buoc4Results.map((result, index) => (
                                          <div
                                            key={index}
                                            className={`p-3 rounded border-l-4 ${result.matched
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
                                                  {buoc4DungTai ===
                                                    result.step && (
                                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                        Dừng tại đây
                                                      </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                  {result.description}
                                                </p>
                                              </div>
                                              {result.matched &&
                                                result.diem !== undefined && (
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
                                              <strong>Đã dừng xét tại:</strong>{" "}
                                              Bước {buoc4DungTai}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-gray-500 italic mt-3">
                                        Không có mối tương quan nào được xác
                                        định
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ),
                        });
                      }

                      if (theDiaChi && yearDiaChi) {
                        collapseItems.push({
                          key: "5",
                          label: `Bước 5: Xác định Hào Thế có Thái Tuế hay Tuế Phá${(thaiTueThe || tuePhaThe) && theDiaChi && yearDiaChi
                            ? ` (${buoc5ThaiTueDiem > 0 ? "+" : ""
                            }${buoc5ThaiTueDiem.toFixed(2)} điểm)`
                            : ""
                            }`,
                          children: (
                            <div className="bg-white p-4 rounded-lg border border-parchment-200">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-parchment-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                  5
                                </div>
                                <div className="flex-1 prose prose-sm max-w-none text-gray-700">
                                  <p className="font-semibold mb-2">
                                    Xác định Hào Thế có Thái Tuế hay Tuế Phá
                                  </p>
                                  <div className="space-y-2">
                                    <p>
                                      <strong>Địa Chi của Hào Thế:</strong>{" "}
                                      {theDiaChi}
                                    </p>
                                    <p>
                                      <strong>Địa Chi của năm:</strong>{" "}
                                      {yearDiaChi}
                                    </p>
                                    <div className="mt-3 space-y-2">
                                      {thaiTueThe && (
                                        <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                                          <p className="font-semibold text-green-700">
                                            ✓ Có Thái Tuế (+0 điểm)
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            Địa chi của Hào Thế trùng với địa
                                            chi của năm
                                          </p>
                                        </div>
                                      )}
                                      {tuePhaThe && (
                                        <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                                          <p className="font-semibold text-red-700">
                                            ✗ Có Tuế Phá (-0.25 điểm)
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            Địa chi của Hào Thế xung với địa chi
                                            của năm
                                          </p>
                                        </div>
                                      )}
                                      {!thaiTueThe && !tuePhaThe && (
                                        <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-400">
                                          <p className="font-semibold text-gray-700">
                                            Không có Thái Tuế hay Tuế Phá (0
                                            điểm)
                                          </p>
                                        </div>
                                      )}
                                      {(thaiTueThe || tuePhaThe) && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                                          <p className="font-semibold text-blue-700">
                                            Điểm Bước 5:{" "}
                                            <span className="text-xl">
                                              {buoc5ThaiTueDiem > 0 ? "+" : ""}
                                              {buoc5ThaiTueDiem.toFixed(2)} điểm
                                            </span>
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ),
                        });
                      }

                      if (theDiaChi && monthDiaChi) {
                        collapseItems.push({
                          key: "5b",
                          label: `Bước 5: Xét mối tương quan Hào Thế và Tháng${buoc5Diem !== undefined && buoc5Diem !== null
                            ? ` (${buoc5Diem > 0 ? "+" : ""
                            }${buoc5Diem.toFixed(2)} điểm)`
                            : ""
                            }`,
                          children: (
                            <div className="bg-white p-4 rounded-lg border border-parchment-200">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-parchment-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                  5
                                </div>
                                <div className="flex-1 prose prose-sm max-w-none text-gray-700">
                                  <p className="font-semibold mb-2">
                                    Xét mối tương quan Hào Thế và Tháng
                                  </p>
                                  <div className="space-y-2">
                                    <p>
                                      <strong>Địa Chi của Hào Thế:</strong>{" "}
                                      {theDiaChi}
                                    </p>
                                    <p>
                                      <strong>Địa Chi của tháng:</strong>{" "}
                                      {monthDiaChi}
                                    </p>
                                    {buoc5Results.length > 0 ? (
                                      <div className="mt-3 space-y-3">
                                        {buoc5Results.map((result, index) => (
                                          <div
                                            key={index}
                                            className={`p-3 rounded border-l-4 ${result.matched
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
                                                  {buoc5DungTai ===
                                                    result.step && (
                                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                        Dừng tại đây
                                                      </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                  {result.description}
                                                </p>
                                              </div>
                                              {result.matched &&
                                                result.diem !== undefined && (
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
                                            Tổng điểm Bước 5:{" "}
                                            <span className="text-xl">
                                              {buoc5Diem > 0 ? "+" : ""}
                                              {buoc5Diem.toFixed(2)} điểm
                                            </span>
                                          </p>
                                          {buoc5Dung && buoc5DungTai && (
                                            <p className="text-sm text-gray-600 mt-1">
                                              <strong>Đã dừng xét tại:</strong>{" "}
                                              Bước {buoc5DungTai}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-gray-500 italic mt-3">
                                        Không có mối tương quan nào được xác
                                        định
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ),
                        });
                      }

                      if (theDiaChi && dayDiaChi) {
                        collapseItems.push({
                          key: "6",
                          label: `Bước 6: Xét mối tương quan Hào Thế và Ngày${buoc6Diem !== undefined && buoc6Diem !== null
                            ? ` (${buoc6Diem > 0 ? "+" : ""
                            }${buoc6Diem.toFixed(2)} điểm)`
                            : ""
                            }`,
                          children: (
                            <div className="bg-white p-4 rounded-lg border border-parchment-200">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-parchment-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                  6
                                </div>
                                <div className="flex-1 prose prose-sm max-w-none text-gray-700">
                                  <p className="font-semibold mb-2">
                                    Xét mối tương quan Hào Thế và Ngày
                                  </p>
                                  <div className="space-y-2">
                                    <p>
                                      <strong>Địa Chi của Hào Thế:</strong>{" "}
                                      {theDiaChi}
                                    </p>
                                    <p>
                                      <strong>Địa Chi của ngày:</strong>{" "}
                                      {dayDiaChi}
                                    </p>
                                    {buoc6Results.length > 0 ? (
                                      <div className="mt-3 space-y-3">
                                        {buoc6Results.map((result, index) => (
                                          <div
                                            key={index}
                                            className={`p-3 rounded border-l-4 ${result.matched
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
                                                  {buoc6DungTai ===
                                                    result.step && (
                                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                        Dừng tại đây
                                                      </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                  {result.description}
                                                </p>
                                              </div>
                                              {result.matched &&
                                                result.diem !== undefined && (
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
                                            Tổng điểm Bước 6:{" "}
                                            <span className="text-xl">
                                              {buoc6Diem > 0 ? "+" : ""}
                                              {buoc6Diem.toFixed(2)} điểm
                                            </span>
                                          </p>
                                          {buoc6Dung && buoc6DungTai && (
                                            <p className="text-sm text-gray-600 mt-1">
                                              <strong>Đã dừng xét tại:</strong>{" "}
                                              Bước {buoc6DungTai}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-gray-500 italic mt-3">
                                        Không có mối tương quan nào được xác
                                        định
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ),
                        });
                      }

                      if (voDaTungKetHonResult) {
                        collapseItems.push({
                          key: "7",
                          label: "Bước 7: Luận Vợ Đã Từng Kết Hôn",
                          children: (
                            <div className="bg-white p-4 rounded-lg border border-parchment-200">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-parchment-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                  7
                                </div>
                                <div className="flex-1 prose prose-sm max-w-none text-gray-700">
                                  <p className="font-semibold mb-2">Luận đoán Thê Tài biến Chu Tước</p>
                                  <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                                    <p className="font-semibold text-blue-700 mb-1">
                                      Kết luận: Khả năng cao vợ đã từng kết hôn hoặc có người yêu sâu đậm trước đó
                                    </p>
                                    <p className="text-sm text-gray-600">{voDaTungKetHonResult.description}</p>
                                    <p className="text-xs text-gray-500 mt-2 italic">
                                      (Hào Thê Tài {voDaTungKetHonResult.theTaiHao} và Phụ Mẫu {voDaTungKetHonResult.phuMauHao} cùng quái, Phụ Mẫu biến không Tuần Không, Thê Tài biến lâm Chu Tước)
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        });
                      }

                      return <Collapse items={collapseItems} />;
                    })()}
                  </div>

                  {/* Tổng điểm và Kết luận cho Dụng Thần */}
                  {dungThanDiaChi && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-300 shadow-lg">
                      <div className="text-center">
                        <p className="font-bold text-lg text-gray-800 mb-4">
                          Tổng Điểm Giải Quẻ - Dụng Thần
                        </p>
                        {(() => {
                          // Tính tổng điểm cho Dụng Thần (bước 3 + 4)
                          const tongDiemDungThan =
                            buoc3ThaiTueDiem +
                            (buoc3Diem || 0) +
                            (buoc4Diem || 0);

                          // Xác định kết luận cho Dụng Thần
                          let ketLuanDungThan = "";
                          let ketLuanColorDungThan = "";
                          if (tongDiemDungThan > 0) {
                            ketLuanDungThan = "Vượng";
                            ketLuanColorDungThan =
                              "text-green-700 bg-green-100";
                          } else if (tongDiemDungThan === 0) {
                            ketLuanDungThan = "Trung Hoà";
                            ketLuanColorDungThan = "text-blue-700 bg-blue-100";
                          } else {
                            ketLuanDungThan = "Suy";
                            ketLuanColorDungThan = "text-red-700 bg-red-100";
                          }

                          return (
                            <div className="space-y-3">
                              <div className="flex justify-center items-baseline gap-2">
                                <span className="text-sm text-gray-600">
                                  Tổng điểm:
                                </span>
                                <span className="text-3xl font-bold text-gray-800">
                                  {tongDiemDungThan > 0 ? "+" : ""}
                                  {tongDiemDungThan.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-600">
                                  điểm
                                </span>
                              </div>
                              <div className="mt-4">
                                <span
                                  className={`px-6 py-3 rounded-full font-bold text-lg ${ketLuanColorDungThan} border-2 ${tongDiemDungThan > 0
                                    ? "border-green-500"
                                    : tongDiemDungThan === 0
                                      ? "border-blue-500"
                                      : "border-red-500"
                                    }`}
                                >
                                  {ketLuanDungThan}
                                </span>
                              </div>
                              <div className="mt-4 text-sm text-gray-600 space-y-1">
                                <p>
                                  <strong>Chi tiết:</strong>
                                </p>
                                <div className="flex justify-center gap-4 text-xs">
                                  <span>
                                    Thái Tuế/Tuế Phá:{" "}
                                    {buoc3ThaiTueDiem > 0 ? "+" : ""}
                                    {buoc3ThaiTueDiem.toFixed(2)}
                                  </span>
                                  <span>
                                    Với Tháng: {buoc3Diem > 0 ? "+" : ""}
                                    {buoc3Diem.toFixed(2)}
                                  </span>
                                  <span>
                                    Với Ngày: {buoc4Diem > 0 ? "+" : ""}
                                    {buoc4Diem.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Tổng điểm và Kết luận cho Hào Thế */}
                  {theDiaChi && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-300 shadow-lg">
                      <div className="text-center">
                        <p className="font-bold text-lg text-gray-800 mb-4">
                          Tổng Điểm Giải Quẻ - Hào Thế
                        </p>
                        {(() => {
                          // Tính tổng điểm cho Hào Thế (bước 5 + 6)
                          const tongDiemHaoThe =
                            buoc5ThaiTueDiem +
                            (buoc5Diem || 0) +
                            (buoc6Diem || 0);

                          // Xác định kết luận cho Hào Thế
                          let ketLuanHaoThe = "";
                          let ketLuanColorHaoThe = "";
                          if (tongDiemHaoThe > 0) {
                            ketLuanHaoThe = "Vượng";
                            ketLuanColorHaoThe = "text-green-700 bg-green-100";
                          } else if (tongDiemHaoThe === 0) {
                            ketLuanHaoThe = "Trung Hoà";
                            ketLuanColorHaoThe = "text-blue-700 bg-blue-100";
                          } else {
                            ketLuanHaoThe = "Suy";
                            ketLuanColorHaoThe = "text-red-700 bg-red-100";
                          }

                          return (
                            <div className="space-y-3">
                              <div className="flex justify-center items-baseline gap-2">
                                <span className="text-sm text-gray-600">
                                  Tổng điểm:
                                </span>
                                <span className="text-3xl font-bold text-gray-800">
                                  {tongDiemHaoThe > 0 ? "+" : ""}
                                  {tongDiemHaoThe.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-600">
                                  điểm
                                </span>
                              </div>
                              <div className="mt-4">
                                <span
                                  className={`px-6 py-3 rounded-full font-bold text-lg ${ketLuanColorHaoThe} border-2 ${tongDiemHaoThe > 0
                                    ? "border-green-500"
                                    : tongDiemHaoThe === 0
                                      ? "border-blue-500"
                                      : "border-red-500"
                                    }`}
                                >
                                  {ketLuanHaoThe}
                                </span>
                              </div>
                              <div className="mt-4 text-sm text-gray-600 space-y-1">
                                <p>
                                  <strong>Chi tiết:</strong>
                                </p>
                                <div className="flex justify-center gap-4 text-xs">
                                  <span>
                                    Thái Tuế/Tuế Phá:{" "}
                                    {buoc5ThaiTueDiem > 0 ? "+" : ""}
                                    {buoc5ThaiTueDiem.toFixed(2)}
                                  </span>
                                  <span>
                                    Với Tháng: {buoc5Diem > 0 ? "+" : ""}
                                    {buoc5Diem.toFixed(2)}
                                  </span>
                                  <span>
                                    Với Ngày: {buoc6Diem > 0 ? "+" : ""}
                                    {buoc6Diem.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Thông tin ngoài lề */}
                  <div className="mt-8">
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                      <p className="text-center font-bold text-lg text-gray-800 m-0 mb-4">
                        Thông Tin Ngoài Lề
                      </p>
                      <Collapse
                        items={[
                          {
                            key: "1",
                            label: "Luận Sảy Bỏ Con",
                            children: (
                              <div className="bg-white p-4 rounded-lg border border-amber-200">
                                {(() => {
                                  // Tìm hào Tử Tôn trong quẻ chính và quẻ biến
                                  const tuTonHao1 = lineData1.find(
                                    (line) =>
                                      getLucThanName(line.lucThan) === "Tử Tôn"
                                  );
                                  const tuTonHao2 = lineData2.find(
                                    (line) =>
                                      getLucThanName(line.lucThan) === "Tử Tôn"
                                  );
                                  const tuTonHao = tuTonHao1 || tuTonHao2;

                                  if (!tuTonHao) {
                                    return (
                                      <p className="text-gray-500 italic">
                                        Không tìm thấy hào Tử Tôn trong quẻ
                                      </p>
                                    );
                                  }

                                  const tuTonDiaChi = extractDiaChi(
                                    tuTonHao.canChi
                                  );
                                  if (!tuTonDiaChi) {
                                    return (
                                      <p className="text-gray-500 italic">
                                        Không thể xác định địa chi của hào Tử
                                        Tôn
                                      </p>
                                    );
                                  }

                                  // Thu thập tất cả địa chi từ ngày, tháng và các hào
                                  const allDiaChi = [];

                                  // Thêm địa chi từ ngày, tháng
                                  const dayDiaChi = getDayDiaChi();
                                  const monthDiaChi = getMonthDiaChi();
                                  if (dayDiaChi) allDiaChi.push(dayDiaChi);
                                  if (monthDiaChi) allDiaChi.push(monthDiaChi);

                                  // Thêm địa chi từ các hào trong quẻ chính
                                  lineData1.forEach((line) => {
                                    const diaChi = extractDiaChi(line.canChi);
                                    if (diaChi) allDiaChi.push(diaChi);
                                  });

                                  // Thêm địa chi từ các hào trong quẻ biến
                                  lineData2.forEach((line) => {
                                    const diaChi = extractDiaChi(line.canChi);
                                    if (diaChi) allDiaChi.push(diaChi);
                                  });

                                  // Thêm địa chi của hào Tử Tôn vào để kiểm tra
                                  const diaChiArrayWithTuTon = [
                                    ...allDiaChi,
                                    tuTonDiaChi,
                                  ];

                                  // Điều kiện 1: Kiểm tra có tạo thành nhóm tam hình không
                                  const tamHinhCheck =
                                    hasFullTamHinhGroup(diaChiArrayWithTuTon);

                                  // Điều kiện 2: Kiểm tra không vong hoặc suy/nhập mộ
                                  const isKhongVong =
                                    tuTonHao.tuanKhong === "K";

                                  // Kiểm tra suy/nhập mộ với ngày và tháng
                                  let isSuyNhapMo = false;
                                  let suyNhapMoDetails = [];

                                  if (dayDiaChi) {
                                    const nhapMoDay = getNhapMoOf(tuTonDiaChi);
                                    if (nhapMoDay === dayDiaChi) {
                                      isSuyNhapMo = true;
                                      suyNhapMoDetails.push(
                                        `Nhập mộ với ngày (${dayDiaChi})`
                                      );
                                    }
                                  }

                                  if (monthDiaChi) {
                                    const nhapMoMonth =
                                      getNhapMoOf(tuTonDiaChi);
                                    if (nhapMoMonth === monthDiaChi) {
                                      isSuyNhapMo = true;
                                      suyNhapMoDetails.push(
                                        `Nhập mộ với tháng (${monthDiaChi})`
                                      );
                                    }
                                  }

                                  // Kiểm tra suy (ngũ hành bị khắc)
                                  if (dayDiaChi) {
                                    const tuTonNguHanh =
                                      getNguHanhFromDiaChi(tuTonDiaChi);
                                    const dayNguHanh =
                                      getNguHanhFromDiaChi(dayDiaChi);
                                    if (tuTonNguHanh && dayNguHanh) {
                                      const relation = getDiaChiRelation(
                                        tuTonDiaChi,
                                        dayDiaChi
                                      );
                                      if (relation === "biKhac") {
                                        isSuyNhapMo = true;
                                        suyNhapMoDetails.push(
                                          `Bị ngày khắc (${dayDiaChi})`
                                        );
                                      }
                                    }
                                  }

                                  if (monthDiaChi) {
                                    const tuTonNguHanh =
                                      getNguHanhFromDiaChi(tuTonDiaChi);
                                    const monthNguHanh =
                                      getNguHanhFromDiaChi(monthDiaChi);
                                    if (tuTonNguHanh && monthNguHanh) {
                                      const relation = getDiaChiRelation(
                                        tuTonDiaChi,
                                        monthDiaChi
                                      );
                                      if (relation === "biKhac") {
                                        isSuyNhapMo = true;
                                        suyNhapMoDetails.push(
                                          `Bị tháng khắc (${monthDiaChi})`
                                        );
                                      }
                                    }
                                  }

                                  const dieuKien2 = isKhongVong || isSuyNhapMo;

                                  // Kết luận: Cần cả 2 điều kiện đều thỏa mãn
                                  const coNguyCo =
                                    tamHinhCheck.hasFullGroup && dieuKien2;

                                  // Kiểm tra xem có phải con của người hỏi không
                                  // Người hỏi tương ứng với hào Thế
                                  const theHao = lineData1.find(
                                    (line) => Number(line.theUng) === 1
                                  );

                                  let khongPhaiConCuaNguoiHoi = false;
                                  let thongTinKiemTraCon = null;

                                  if (coNguyCo && theHao) {
                                    // Xác định quái của hào Thế: hào 1-3 thuộc hạ quái, hào 4-6 thuộc thượng quái
                                    const theTrigram =
                                      theHao.hao <= 3 ? "lower" : "upper";

                                    // Xác định quái của hào Tử Tôn
                                    const tuTonTrigram =
                                      tuTonHao.hao <= 3 ? "lower" : "upper";

                                    // Kiểm tra: nếu hào Tử tôn có tuanKhong = "K" và không cùng quái với hào Thế
                                    if (
                                      tuTonHao.tuanKhong === "K" &&
                                      theTrigram !== tuTonTrigram
                                    ) {
                                      khongPhaiConCuaNguoiHoi = true;
                                      thongTinKiemTraCon = {
                                        theHao: theHao.hao,
                                        theTrigram:
                                          theTrigram === "lower"
                                            ? "Hạ quái"
                                            : "Thượng quái",
                                        tuTonHao: tuTonHao.hao,
                                        tuTonTrigram:
                                          tuTonTrigram === "lower"
                                            ? "Hạ quái"
                                            : "Thượng quái",
                                      };
                                    }
                                  }

                                  return (
                                    <div className="space-y-3">
                                      <div>
                                        <p className="font-semibold mb-2">
                                          Hào Tử Tôn: Hào {tuTonHao.hao} (
                                          {tuTonHao.canChi}) - Địa Chi:{" "}
                                          <strong>{tuTonDiaChi}</strong>
                                        </p>
                                      </div>

                                      <div className="space-y-2">
                                        <div
                                          className={`p-3 rounded border-l-4 ${tamHinhCheck.hasFullGroup
                                            ? "bg-red-50 border-red-500"
                                            : "bg-green-50 border-green-500"
                                            }`}
                                        >
                                          <p className="font-semibold mb-1">
                                            Điều kiện 1: Kiểm tra Tam Hình
                                          </p>
                                          {tamHinhCheck.hasFullGroup ? (
                                            <div>
                                              <p className="text-red-700 font-bold">
                                                ⚠ Có nguy cơ: Tìm thấy nhóm Tam
                                                Hình đầy đủ
                                              </p>
                                              <p className="text-sm text-gray-600 mt-1">
                                                Nhóm: {tamHinhCheck.groupType}
                                              </p>
                                              <p className="text-sm text-gray-600">
                                                Các địa chi:{" "}
                                                {tamHinhCheck.groupMembers?.join(
                                                  ", "
                                                )}
                                              </p>
                                            </div>
                                          ) : (
                                            <p className="text-green-700">
                                              ✓ Không tìm thấy nhóm Tam Hình đầy
                                              đủ
                                            </p>
                                          )}
                                        </div>

                                        <div
                                          className={`p-3 rounded border-l-4 ${dieuKien2
                                            ? "bg-red-50 border-red-500"
                                            : "bg-green-50 border-green-500"
                                            }`}
                                        >
                                          <p className="font-semibold mb-1">
                                            Điều kiện 2: Kiểm tra Không Vong /
                                            Suy / Nhập Mộ
                                          </p>
                                          {dieuKien2 ? (
                                            <div>
                                              <p className="text-red-700 font-bold">
                                                ⚠ Có nguy cơ
                                              </p>
                                              <div className="text-sm text-gray-600 mt-1 space-y-1">
                                                {isKhongVong && (
                                                  <p>
                                                    • Có Không Vong (Tuần không
                                                    = K)
                                                  </p>
                                                )}
                                                {isSuyNhapMo &&
                                                  suyNhapMoDetails.length >
                                                  0 && (
                                                    <div>
                                                      <p>• Suy/Nhập Mộ:</p>
                                                      <ul className="list-disc list-inside ml-2">
                                                        {suyNhapMoDetails.map(
                                                          (detail, idx) => (
                                                            <li key={idx}>
                                                              {detail}
                                                            </li>
                                                          )
                                                        )}
                                                      </ul>
                                                    </div>
                                                  )}
                                              </div>
                                            </div>
                                          ) : (
                                            <p className="text-green-700">
                                              ✓ Không có Không Vong, không bị
                                              Suy hoặc Nhập Mộ
                                            </p>
                                          )}
                                        </div>

                                        {coNguyCo && (
                                          <div className="p-4 rounded-lg border-2 bg-red-100 border-red-400">
                                            <p className="font-bold text-lg mb-2">
                                              Kết luận:
                                            </p>
                                            <p className="text-red-800 font-bold text-lg">
                                              ⚠ CÓ NGUY CƠ SẢY BỎ CON
                                            </p>

                                            {/* Kiểm tra xem có phải con của người hỏi không */}
                                            {khongPhaiConCuaNguoiHoi &&
                                              thongTinKiemTraCon && (
                                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
                                                  <p className="font-semibold text-yellow-800 mb-2">
                                                    ⚠ Lưu ý về quan hệ:
                                                  </p>
                                                  <div className="text-sm text-yellow-700 space-y-1">
                                                    <p>
                                                      • Hào Thế (Hào{" "}
                                                      {
                                                        thongTinKiemTraCon.theHao
                                                      }
                                                      ) - đại diện cho người hỏi
                                                      - thuộc{" "}
                                                      {
                                                        thongTinKiemTraCon.theTrigram
                                                      }
                                                    </p>
                                                    <p>
                                                      • Hào Tử Tôn (Hào{" "}
                                                      {
                                                        thongTinKiemTraCon.tuTonHao
                                                      }
                                                      ) có Tuần không = "K" và
                                                      thuộc{" "}
                                                      {
                                                        thongTinKiemTraCon.tuTonTrigram
                                                      }
                                                    </p>
                                                    <p className="font-semibold mt-2">
                                                      → Có thể suy luận: Đây có
                                                      thể không phải là con của
                                                      người hỏi (hào Thế) vì hào
                                                      Tử Tôn có Tuần không = "K"
                                                      và không nằm cùng quái với
                                                      hào Thế.
                                                    </p>
                                                  </div>
                                                </div>
                                              )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            ),
                          },
                          {
                            key: "2",
                            label: "Luận Vợ Đã Từng Kết Hôn",
                            children: (
                              <div className="bg-white p-4 rounded-lg border border-amber-200">
                                {(() => {
                                  // Bước 1: Tìm hào Thê Tài trong quẻ chính
                                  const theTaiHao = lineData1.find(
                                    (line) =>
                                      getLucThanName(line.lucThan) === "Thê Tài"
                                  );

                                  if (!theTaiHao) {
                                    return (
                                      <p className="text-gray-500 italic">
                                        Không tìm thấy hào Thê Tài trong quẻ
                                        chính
                                      </p>
                                    );
                                  }

                                  // Xác định quái của hào Thê Tài
                                  const theTaiTrigram =
                                    theTaiHao.hao <= 3 ? "lower" : "upper";

                                  // Tìm các hào Phụ Mẫu trong quẻ chính
                                  const phuMauHaos = lineData1.filter(
                                    (line) =>
                                      getLucThanName(line.lucThan) === "Phụ Mẫu"
                                  );

                                  if (phuMauHaos.length === 0) {
                                    return (
                                      <p className="text-gray-500 italic">
                                        Không tìm thấy hào Phụ Mẫu trong quẻ
                                        chính
                                      </p>
                                    );
                                  }

                                  // Kiểm tra xem có hào Phụ Mẫu nào cùng quái với hào Thê Tài không
                                  const phuMauCungQuai = phuMauHaos.find(
                                    (line) => {
                                      const phuMauTrigram =
                                        line.hao <= 3 ? "lower" : "upper";
                                      return phuMauTrigram === theTaiTrigram;
                                    }
                                  );

                                  if (!phuMauCungQuai) {
                                    return (
                                      <div className="space-y-2">
                                        <p className="text-gray-500 italic">
                                          Không tìm thấy hào Phụ Mẫu cùng quái
                                          với hào Thê Tài
                                        </p>
                                        <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                                          <p className="font-semibold mb-2">
                                            Bước 1: Kiểm tra hào Thê Tài và Phụ
                                            Mẫu cùng quái
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            • Hào Thê Tài: Hào {theTaiHao.hao} (
                                            {theTaiHao.canChi}) - Thuộc{" "}
                                            {theTaiTrigram === "lower"
                                              ? "Hạ quái"
                                              : "Thượng quái"}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            • Các hào Phụ Mẫu tìm thấy:{" "}
                                            {phuMauHaos
                                              .map(
                                                (pm) =>
                                                  `Hào ${pm.hao} (${pm.canChi})`
                                              )
                                              .join(", ")}
                                          </p>
                                          <p className="text-sm text-red-600 mt-2">
                                            → Không có hào Phụ Mẫu nào cùng quái
                                            với hào Thê Tài
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // Bước 2: Tìm hào tương ứng trong quẻ biến
                                  const phuMauIndex = lineData1.findIndex(
                                    (line) => line.hao === phuMauCungQuai.hao
                                  );
                                  const phuMauBienHao =
                                    phuMauIndex >= 0 &&
                                      phuMauIndex < lineData2.length
                                      ? lineData2[phuMauIndex]
                                      : null;

                                  if (!phuMauBienHao) {
                                    return (
                                      <p className="text-gray-500 italic">
                                        Không tìm thấy hào tương ứng trong quẻ
                                        biến
                                      </p>
                                    );
                                  }

                                  // Kiểm tra Lục Thú có phải Chu Tước không
                                  const lucTuName = getLucTuName(
                                    phuMauBienHao.lucTu
                                  );
                                  const laChuTuoc = lucTuName === "Chu Tước";

                                  // Kiểm tra tuanKhong = "K"
                                  const coTuanKhong =
                                    phuMauBienHao.tuanKhong === "K";

                                  // Kết luận
                                  const coKhaNangTungKetHon =
                                    laChuTuoc && coTuanKhong;

                                  return (
                                    <div className="space-y-3">
                                      <div>
                                        <p className="font-semibold mb-2">
                                          Hào Thê Tài: Hào {theTaiHao.hao} (
                                          {theTaiHao.canChi}) - Thuộc{" "}
                                          {theTaiTrigram === "lower"
                                            ? "Hạ quái"
                                            : "Thượng quái"}
                                        </p>
                                      </div>

                                      <div className="space-y-2">
                                        <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                                          <p className="font-semibold mb-2">
                                            Bước 1: Kiểm tra hào Thê Tài và Phụ
                                            Mẫu cùng quái
                                          </p>
                                          <p className="text-green-700 mb-1">
                                            ✓ Tìm thấy hào Phụ Mẫu cùng quái với
                                            hào Thê Tài
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            • Hào Phụ Mẫu: Hào{" "}
                                            {phuMauCungQuai.hao} (
                                            {phuMauCungQuai.canChi}) - Thuộc{" "}
                                            {phuMauCungQuai.hao <= 3
                                              ? "Hạ quái"
                                              : "Thượng quái"}
                                          </p>
                                        </div>

                                        <div
                                          className={`p-3 rounded border-l-4 ${laChuTuoc && coTuanKhong
                                            ? "bg-green-50 border-green-500"
                                            : "bg-gray-50 border-gray-300"
                                            }`}
                                        >
                                          <p className="font-semibold mb-2">
                                            Bước 2: Kiểm tra hào Phụ Mẫu trong
                                            quẻ biến
                                          </p>
                                          <p className="text-sm text-gray-600 mb-1">
                                            Hào Phụ Mẫu trong quẻ biến: Hào{" "}
                                            {phuMauBienHao.hao} (
                                            {phuMauBienHao.canChi})
                                          </p>
                                          <div className="space-y-1 mt-2">
                                            <p
                                              className={
                                                laChuTuoc
                                                  ? "text-green-700"
                                                  : "text-red-700"
                                              }
                                            >
                                              {laChuTuoc ? "✓" : "✗"} Lục Thú:{" "}
                                              {lucTuName}
                                              {laChuTuoc
                                                ? " (Chu Tước)"
                                                : ""}
                                            </p>
                                            <p
                                              className={
                                                coTuanKhong
                                                  ? "text-green-700"
                                                  : "text-red-700"
                                              }
                                            >
                                              {coTuanKhong ? "✓" : "✗"} Tuần
                                              không:{" "}
                                              {phuMauBienHao.tuanKhong ||
                                                "Không có"}
                                              {coTuanKhong ? ' (= "K")' : ""}
                                            </p>
                                          </div>
                                        </div>

                                        {coKhaNangTungKetHon && (
                                          <div className="p-4 rounded-lg border-2 bg-blue-100 border-blue-400">
                                            <p className="font-bold text-lg mb-2">
                                              Kết luận:
                                            </p>
                                            <p className="text-blue-800 font-bold text-lg">
                                              ⚠ CÓ KHẢ NĂNG ĐÃ TỪNG KẾT HÔN
                                              TRƯỚC ĐÂY
                                            </p>
                                            <p className="text-sm text-blue-700 mt-2">
                                              Hào Phụ Mẫu cùng quái với hào Thê
                                              Tài có Lục Thú là Chu Tước và có Tuần không = "K",
                                              cho thấy có khả năng vợ/chồng đã
                                              từng kết hôn trước đây.
                                            </p>
                                          </div>
                                        )}

                                        {!coKhaNangTungKetHon && (
                                          <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                                            <p className="font-semibold mb-2">
                                              Kết luận:
                                            </p>
                                            <p className="text-gray-700">
                                              Không đủ điều kiện để kết luận đã
                                              từng kết hôn trước đây.
                                            </p>
                                            {!laChuTuoc && (
                                              <p className="text-sm text-red-600 mt-1">
                                                • Lục Thú không phải Chu Tước
                                              </p>
                                            )}
                                            {!coTuanKhong && (
                                              <p className="text-sm text-red-600 mt-1">
                                                • Không có Tuần không = "K"
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            ),
                          },
                          {
                            key: "3",
                            label: "Luận Chồng Đã Từng Kết Hôn",
                            children: (
                              <div className="bg-white p-4 rounded-lg border border-amber-200">
                                {(() => {
                                  // Bước 1: Tìm hào Quan Quỷ trong quẻ chính
                                  const quanQuyHao = lineData1.find(
                                    (line) =>
                                      getLucThanName(line.lucThan) ===
                                      "Quan Quỷ"
                                  );

                                  if (!quanQuyHao) {
                                    return (
                                      <p className="text-gray-500 italic">
                                        Không tìm thấy hào Quan Quỷ trong quẻ
                                        chính
                                      </p>
                                    );
                                  }

                                  // Xác định quái của hào Quan Quỷ
                                  const quanQuyTrigram =
                                    quanQuyHao.hao <= 3 ? "lower" : "upper";

                                  // Tìm các hào Phụ Mẫu trong quẻ chính
                                  const phuMauHaos = lineData1.filter(
                                    (line) =>
                                      getLucThanName(line.lucThan) === "Phụ Mẫu"
                                  );

                                  if (phuMauHaos.length === 0) {
                                    return (
                                      <p className="text-gray-500 italic">
                                        Không tìm thấy hào Phụ Mẫu trong quẻ
                                        chính
                                      </p>
                                    );
                                  }

                                  // Kiểm tra xem có hào Phụ Mẫu nào cùng quái với hào Quan Quỷ không
                                  const phuMauCungQuai = phuMauHaos.find(
                                    (line) => {
                                      const phuMauTrigram =
                                        line.hao <= 3 ? "lower" : "upper";
                                      return phuMauTrigram === quanQuyTrigram;
                                    }
                                  );

                                  if (!phuMauCungQuai) {
                                    return (
                                      <div className="space-y-2">
                                        <p className="text-gray-500 italic">
                                          Không tìm thấy hào Phụ Mẫu cùng quái
                                          với hào Quan Quỷ
                                        </p>
                                        <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                                          <p className="font-semibold mb-2">
                                            Bước 1: Kiểm tra hào Quan Quỷ và Phụ
                                            Mẫu cùng quái
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            • Hào Quan Quỷ: Hào {quanQuyHao.hao}{" "}
                                            ({quanQuyHao.canChi}) - Thuộc{" "}
                                            {quanQuyTrigram === "lower"
                                              ? "Hạ quái"
                                              : "Thượng quái"}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            • Các hào Phụ Mẫu tìm thấy:{" "}
                                            {phuMauHaos
                                              .map(
                                                (pm) =>
                                                  `Hào ${pm.hao} (${pm.canChi})`
                                              )
                                              .join(", ")}
                                          </p>
                                          <p className="text-sm text-red-600 mt-2">
                                            → Không có hào Phụ Mẫu nào cùng quái
                                            với hào Quan Quỷ
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // Bước 2: Tìm hào tương ứng trong quẻ biến
                                  const phuMauIndex = lineData1.findIndex(
                                    (line) => line.hao === phuMauCungQuai.hao
                                  );
                                  const phuMauBienHao =
                                    phuMauIndex >= 0 &&
                                      phuMauIndex < lineData2.length
                                      ? lineData2[phuMauIndex]
                                      : null;

                                  if (!phuMauBienHao) {
                                    return (
                                      <p className="text-gray-500 italic">
                                        Không tìm thấy hào tương ứng trong quẻ
                                        biến
                                      </p>
                                    );
                                  }

                                  // Kiểm tra Lục Thú có phải Chu Tước không
                                  const lucTuName = getLucTuName(
                                    phuMauBienHao.lucTu
                                  );
                                  const laChuTuoc = lucTuName === "Chu Tước";

                                  // Kiểm tra tuanKhong = "K"
                                  const coTuanKhong =
                                    phuMauBienHao.tuanKhong === "K";

                                  // Kết luận
                                  const coKhaNangTungKetHon =
                                    laChuTuoc && coTuanKhong;

                                  return (
                                    <div className="space-y-3">
                                      <div>
                                        <p className="font-semibold mb-2">
                                          Hào Quan Quỷ: Hào {quanQuyHao.hao} (
                                          {quanQuyHao.canChi}) - Thuộc{" "}
                                          {quanQuyTrigram === "lower"
                                            ? "Hạ quái"
                                            : "Thượng quái"}
                                        </p>
                                      </div>

                                      <div className="space-y-2">
                                        <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                                          <p className="font-semibold mb-2">
                                            Bước 1: Kiểm tra hào Quan Quỷ và Phụ
                                            Mẫu cùng quái
                                          </p>
                                          <p className="text-green-700 mb-1">
                                            ✓ Tìm thấy hào Phụ Mẫu cùng quái với
                                            hào Quan Quỷ
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            • Hào Phụ Mẫu: Hào{" "}
                                            {phuMauCungQuai.hao} (
                                            {phuMauCungQuai.canChi}) - Thuộc{" "}
                                            {phuMauCungQuai.hao <= 3
                                              ? "Hạ quái"
                                              : "Thượng quái"}
                                          </p>
                                        </div>

                                        <div
                                          className={`p-3 rounded border-l-4 ${laChuTuoc && coTuanKhong
                                            ? "bg-green-50 border-green-500"
                                            : "bg-gray-50 border-gray-300"
                                            }`}
                                        >
                                          <p className="font-semibold mb-2">
                                            Bước 2: Kiểm tra hào Phụ Mẫu trong
                                            quẻ biến
                                          </p>
                                          <p className="text-sm text-gray-600 mb-1">
                                            Hào Phụ Mẫu trong quẻ biến: Hào{" "}
                                            {phuMauBienHao.hao} (
                                            {phuMauBienHao.canChi})
                                          </p>
                                          <div className="space-y-1 mt-2">
                                            <p
                                              className={
                                                laChuTuoc
                                                  ? "text-green-700"
                                                  : "text-red-700"
                                              }
                                            >
                                              {laChuTuoc ? "✓" : "✗"} Lục Thú:{" "}
                                              {lucTuName}
                                              {laChuTuoc
                                                ? " (Chu Tước)"
                                                : ""}
                                            </p>
                                            <p
                                              className={
                                                coTuanKhong
                                                  ? "text-green-700"
                                                  : "text-red-700"
                                              }
                                            >
                                              {coTuanKhong ? "✓" : "✗"} Tuần
                                              không:{" "}
                                              {phuMauBienHao.tuanKhong ||
                                                "Không có"}
                                              {coTuanKhong ? ' (= "K")' : ""}
                                            </p>
                                          </div>
                                        </div>

                                        {coKhaNangTungKetHon && (
                                          <div className="p-4 rounded-lg border-2 bg-blue-100 border-blue-400">
                                            <p className="font-bold text-lg mb-2">
                                              Kết luận:
                                            </p>
                                            <p className="text-blue-800 font-bold text-lg">
                                              ⚠ CÓ KHẢ NĂNG ĐÃ TỪNG KẾT HÔN
                                              TRƯỚC ĐÂY
                                            </p>
                                            <p className="text-sm text-blue-700 mt-2">
                                              Hào Phụ Mẫu cùng quái với hào Quan
                                              Quỷ có Lục Thú là Chu Tước và có Tuần không = "K",
                                              cho thấy có khả năng chồng đã từng
                                              kết hôn trước đây.
                                            </p>
                                          </div>
                                        )}

                                        {!coKhaNangTungKetHon && (
                                          <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                                            <p className="font-semibold mb-2">
                                              Kết luận:
                                            </p>
                                            <p className="text-gray-700">
                                              Không đủ điều kiện để kết luận đã
                                              từng kết hôn trước đây.
                                            </p>
                                            {!laChuTuoc && (
                                              <p className="text-sm text-red-600 mt-1">
                                                • Lục Thú không phải Chu Tước
                                              </p>
                                            )}
                                            {!coTuanKhong && (
                                              <p className="text-sm text-red-600 mt-1">
                                                • Không có Tuần không = "K"
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            ),
                          },
                          {
                            key: "4",
                            label: "Luận Cây Trước Nhà",
                            children: (
                              <div className="bg-white p-4 rounded-lg border border-amber-200">
                                {(() => {
                                  // Bước 1: Tìm cây trong quẻ
                                  const cayHaos = [];

                                  // Tìm các hào có địa chi Dần, Mão, hoặc Mùi trong quẻ chính
                                  lineData1.forEach((line1, index) => {
                                    const diaChi = extractDiaChi(line1.canChi);
                                    if (
                                      diaChi === "Dần" ||
                                      diaChi === "Mão" ||
                                      diaChi === "Mùi"
                                    ) {
                                      // Kiểm tra hào tương ứng trong quẻ biến
                                      if (index < lineData2.length) {
                                        const line2 = lineData2[index];
                                        const lucTuName = getLucTuName(
                                          line2.lucTu
                                        );
                                        if (
                                          lucTuName === "Thanh Long" ||
                                          lucTuName === "Bạch Hổ" ||
                                          lucTuName === "Chu Tước"
                                        ) {
                                          cayHaos.push({
                                            hao: line1.hao,
                                            diaChi: diaChi,
                                            canChi: line1.canChi,
                                            lucTu: lucTuName,
                                            line1: line1,
                                            line2: line2,
                                          });
                                        }
                                      }
                                    }
                                  });

                                  if (cayHaos.length === 0) {
                                    return (
                                      <div className="space-y-2">
                                        <p className="text-gray-500 italic">
                                          Không tìm thấy cây trong quẻ
                                        </p>
                                        <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                                          <p className="font-semibold mb-2">
                                            Bước 1: Tìm cây trong quẻ
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            Điều kiện 1: Không có hào Dần, Mão,
                                            hoặc Mùi trong quẻ chính
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            HOẶC
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            Điều kiện 2: Hào tương ứng trong quẻ
                                            biến không có Thanh Long, Bạch Hổ,
                                            hoặc Chu Tước
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div className="space-y-4">
                                      {/* Bước 1: Tìm cây trong quẻ */}
                                      <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                                        <p className="font-semibold mb-2">
                                          Bước 1: Tìm cây trong quẻ
                                        </p>
                                        <p className="text-sm text-gray-600 mb-2">
                                          ✓ Điều kiện 1: Tìm thấy hào có địa chi
                                          Dần, Mão, hoặc Mùi trong quẻ chính
                                        </p>
                                        <p className="text-sm text-gray-600 mb-2">
                                          ✓ Điều kiện 2: Hào tương ứng trong quẻ
                                          biến có Thanh Long, Bạch Hổ, hoặc Chu
                                          Tước
                                        </p>
                                        <div className="mt-2 space-y-1">
                                          {cayHaos.map((cay, idx) => (
                                            <p
                                              key={idx}
                                              className="text-sm font-medium text-gray-700"
                                            >
                                              • Hào {cay.hao} ({cay.canChi}) -
                                              Địa Chi:{" "}
                                              <strong>{cay.diaChi}</strong> -
                                              Lục Thú:{" "}
                                              <strong>{cay.lucTu}</strong>
                                            </p>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Bước 2 và 3 cho từng cây */}
                                      {cayHaos.map((cay, idx) => {
                                        // Bước 2: Xác định vị trí
                                        let viTri = "";
                                        if (cay.lucTu === "Thanh Long") {
                                          viTri = "Bên trái";
                                        } else if (cay.lucTu === "Bạch Hổ") {
                                          viTri = "Bên phải";
                                        } else if (cay.lucTu === "Chu Tước") {
                                          viTri = "Phía trước";
                                        }

                                        // Bước 3: Xác định loại cây
                                        let loaiCay = "";
                                        let caySize = "medium"; // small, medium, large
                                        let cayColor = "#22c55e"; // màu xanh lá
                                        if (cay.diaChi === "Dần") {
                                          loaiCay = "Cây to thân gỗ";
                                          caySize = "large";
                                          cayColor = "#166534"; // xanh đậm
                                        } else if (cay.diaChi === "Mão") {
                                          loaiCay =
                                            "Cây cỏ hoặc thân leo hoặc bụi cây";
                                          caySize = "small";
                                          cayColor = "#86efac"; // xanh nhạt
                                        } else if (cay.diaChi === "Mùi") {
                                          loaiCay =
                                            "Rất nhiều cây như rừng hoặc công viên hoặc lùm cây (nhập mộ của Dần/Mão)";
                                          caySize = "multiple";
                                          cayColor = "#16a34a"; // xanh lá
                                        }

                                        // Hàm vẽ SVG ngôi nhà và cây
                                        const renderHouseWithTree = (
                                          viTri,
                                          loaiCay,
                                          caySize,
                                          cayColor
                                        ) => {
                                          const svgSize = 140; // Kích thước SVG lớn hơn để có không gian cho cây, đặc biệt là rừng cây
                                          const houseSize = 32;
                                          const houseX =
                                            svgSize / 2 - houseSize / 2;
                                          const houseY =
                                            svgSize / 2 - houseSize / 2;

                                          // Xác định vị trí cây (nhìn từ trên xuống, đảo ngược so với nhìn từ trong nhà ra ngoài)
                                          // Điều chỉnh khoảng cách dựa trên loại cây (rừng cây cần nhiều không gian hơn)
                                          const treeDistance =
                                            caySize === "multiple" ? 25 : 20;
                                          let treeX = 0;
                                          let treeY = 0;
                                          if (viTri === "Bên trái") {
                                            // Bên trái (từ trong nhà) = Bên phải (nhìn từ trên xuống)
                                            treeX =
                                              houseX + houseSize + treeDistance;
                                            treeY = houseY + houseSize / 2;
                                          } else if (viTri === "Bên phải") {
                                            // Bên phải (từ trong nhà) = Bên trái (nhìn từ trên xuống)
                                            treeX = houseX - treeDistance;
                                            treeY = houseY + houseSize / 2;
                                          } else if (viTri === "Phía trước") {
                                            // Phía trước (từ trong nhà) = Phía dưới (nhìn từ trên xuống)
                                            treeX = houseX + houseSize / 2;
                                            treeY =
                                              houseY + houseSize + treeDistance;
                                          }

                                          // Vẽ cây dựa trên loại
                                          const renderTree = () => {
                                            if (caySize === "multiple") {
                                              // Rừng cây / Công viên / Lùm cây (Mùi) - nhiều cây rải rác
                                              // Điều chỉnh vị trí để căn giữa tốt hơn
                                              let offsetX = 0;
                                              let offsetY = 0;
                                              if (
                                                viTri === "Bên trái" ||
                                                viTri === "Bên phải"
                                              ) {
                                                // Khi ở bên trái/phải, căn giữa theo chiều dọc
                                                offsetY = -5;
                                              } else {
                                                // Khi ở phía trước, căn giữa theo chiều ngang
                                                offsetX = -5;
                                              }

                                              return (
                                                <>
                                                  {/* Cây 1 */}
                                                  <circle
                                                    cx={treeX - 8 + offsetX}
                                                    cy={treeY - 10 + offsetY}
                                                    r="7"
                                                    fill={cayColor}
                                                  />
                                                  <rect
                                                    x={treeX - 10 + offsetX}
                                                    y={treeY + offsetY}
                                                    width="4"
                                                    height="10"
                                                    fill="#8b4513"
                                                  />
                                                  {/* Cây 2 */}
                                                  <circle
                                                    cx={treeX - 2 + offsetX}
                                                    cy={treeY - 8 + offsetY}
                                                    r="6"
                                                    fill={cayColor}
                                                  />
                                                  <rect
                                                    x={treeX - 4 + offsetX}
                                                    y={treeY + offsetY}
                                                    width="4"
                                                    height="8"
                                                    fill="#8b4513"
                                                  />
                                                  {/* Cây 3 */}
                                                  <circle
                                                    cx={treeX + 4 + offsetX}
                                                    cy={treeY - 10 + offsetY}
                                                    r="7"
                                                    fill={cayColor}
                                                  />
                                                  <rect
                                                    x={treeX + 2 + offsetX}
                                                    y={treeY + offsetY}
                                                    width="4"
                                                    height="10"
                                                    fill="#8b4513"
                                                  />
                                                  {/* Cây 4 */}
                                                  <circle
                                                    cx={treeX + 10 + offsetX}
                                                    cy={treeY - 7 + offsetY}
                                                    r="6"
                                                    fill={cayColor}
                                                  />
                                                  <rect
                                                    x={treeX + 8 + offsetX}
                                                    y={treeY + offsetY}
                                                    width="4"
                                                    height="8"
                                                    fill="#8b4513"
                                                  />
                                                  {/* Cây 5 */}
                                                  <circle
                                                    cx={treeX + 1 + offsetX}
                                                    cy={treeY - 12 + offsetY}
                                                    r="5"
                                                    fill={cayColor}
                                                  />
                                                  <rect
                                                    x={treeX - 1 + offsetX}
                                                    y={treeY + offsetY}
                                                    width="4"
                                                    height="7"
                                                    fill="#8b4513"
                                                  />
                                                </>
                                              );
                                            } else if (caySize === "small") {
                                              // Cây bụi / Cây cỏ / Thân leo (Mão) - nhóm cây nhỏ gần nhau
                                              return (
                                                <>
                                                  {/* Cây bụi 1 */}
                                                  <circle
                                                    cx={treeX - 3}
                                                    cy={treeY - 5}
                                                    r="4"
                                                    fill={cayColor}
                                                  />
                                                  <rect
                                                    x={treeX - 4}
                                                    y={treeY}
                                                    width="2"
                                                    height="4"
                                                    fill="#8b4513"
                                                  />
                                                  {/* Cây bụi 2 */}
                                                  <circle
                                                    cx={treeX}
                                                    cy={treeY - 6}
                                                    r="5"
                                                    fill={cayColor}
                                                  />
                                                  <rect
                                                    x={treeX - 1}
                                                    y={treeY}
                                                    width="2"
                                                    height="5"
                                                    fill="#8b4513"
                                                  />
                                                  {/* Cây bụi 3 */}
                                                  <circle
                                                    cx={treeX + 3}
                                                    cy={treeY - 5}
                                                    r="4"
                                                    fill={cayColor}
                                                  />
                                                  <rect
                                                    x={treeX + 2}
                                                    y={treeY}
                                                    width="2"
                                                    height="4"
                                                    fill="#8b4513"
                                                  />
                                                  {/* Thêm một số cây cỏ nhỏ */}
                                                  <circle
                                                    cx={treeX - 1}
                                                    cy={treeY - 3}
                                                    r="2"
                                                    fill={cayColor}
                                                    opacity="0.8"
                                                  />
                                                  <circle
                                                    cx={treeX + 2}
                                                    cy={treeY - 2}
                                                    r="2"
                                                    fill={cayColor}
                                                    opacity="0.8"
                                                  />
                                                </>
                                              );
                                            } else {
                                              // Cây to thân gỗ (Dần) - cây lớn đơn lẻ
                                              const treeRadius = 12;
                                              const trunkWidth = 5;
                                              const trunkHeight = 10;
                                              return (
                                                <>
                                                  {/* Tán lá chính */}
                                                  <circle
                                                    cx={treeX}
                                                    cy={treeY - trunkHeight}
                                                    r={treeRadius}
                                                    fill={cayColor}
                                                  />
                                                  {/* Tán lá phụ (tạo độ sâu) */}
                                                  <circle
                                                    cx={treeX - 3}
                                                    cy={treeY - trunkHeight - 2}
                                                    r={treeRadius - 2}
                                                    fill={cayColor}
                                                    opacity="0.7"
                                                  />
                                                  <circle
                                                    cx={treeX + 3}
                                                    cy={treeY - trunkHeight - 2}
                                                    r={treeRadius - 2}
                                                    fill={cayColor}
                                                    opacity="0.7"
                                                  />
                                                  {/* Thân cây */}
                                                  <rect
                                                    x={treeX - trunkWidth / 2}
                                                    y={treeY}
                                                    width={trunkWidth}
                                                    height={trunkHeight}
                                                    fill="#8b4513"
                                                  />
                                                </>
                                              );
                                            }
                                          };

                                          return (
                                            <svg
                                              width={svgSize}
                                              height={svgSize}
                                              viewBox={`0 0 ${svgSize} ${svgSize}`}
                                              className="border border-gray-300 rounded bg-gray-50"
                                            >
                                              {/* Vẽ ngôi nhà (nhìn từ trên xuống) */}
                                              {/* Mái nhà (hình tam giác) */}
                                              <polygon
                                                points={`${houseX + houseSize / 2
                                                  },${houseY} ${houseX},${houseY + houseSize / 3
                                                  } ${houseX + houseSize},${houseY + houseSize / 3
                                                  }`}
                                                fill="#dc2626"
                                                stroke="#991b1b"
                                                strokeWidth="1"
                                              />
                                              {/* Thân nhà (hình chữ nhật) */}
                                              <rect
                                                x={houseX}
                                                y={houseY + houseSize / 3}
                                                width={houseSize}
                                                height={(houseSize * 2) / 3}
                                                fill="#fbbf24"
                                                stroke="#d97706"
                                                strokeWidth="1"
                                              />
                                              {/* Cửa (ở phía dưới - phía trước khi nhìn từ trong nhà ra ngoài) */}
                                              <rect
                                                x={houseX + houseSize / 2 - 4}
                                                y={houseY + houseSize - 12}
                                                width="8"
                                                height="12"
                                                fill="#78350f"
                                              />

                                              {/* Vẽ cây */}
                                              {renderTree()}
                                            </svg>
                                          );
                                        };

                                        return (
                                          <div
                                            key={idx}
                                            className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                                          >
                                            <p className="font-semibold mb-2">
                                              Cây {idx + 1}: Hào {cay.hao} (
                                              {cay.canChi})
                                            </p>

                                            {/* Bước 2: Vị trí */}
                                            <div className="mb-3">
                                              <p className="font-semibold text-sm mb-1">
                                                Bước 2: Vị trí của cây
                                              </p>
                                              <div className="flex items-center gap-4">
                                                <p className="text-sm text-gray-700">
                                                  <strong>Lục Thú:</strong>{" "}
                                                  {cay.lucTu} →{" "}
                                                  <strong className="text-blue-700">
                                                    {viTri}
                                                  </strong>{" "}
                                                  (tính từ trong nhà nhìn ra
                                                  ngoài)
                                                </p>
                                                <div className="flex-shrink-0">
                                                  {renderHouseWithTree(
                                                    viTri,
                                                    loaiCay,
                                                    caySize,
                                                    cayColor
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Bước 3: Loại cây */}
                                            <div>
                                              <p className="font-semibold text-sm mb-1">
                                                Bước 3: Loại cây
                                              </p>
                                              <p className="text-sm text-gray-700">
                                                <strong>Địa Chi:</strong>{" "}
                                                {cay.diaChi} →{" "}
                                                <strong className="text-green-700">
                                                  {loaiCay}
                                                </strong>
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}
                              </div>
                            ),
                          },
                          {
                            key: "5",
                            label: "Khác",
                            children: (
                              <div className="bg-white p-4 rounded-lg border border-amber-200 space-y-4">
                                {(() => {
                                  const results = [];
                                  const hexNames = [];
                                  if (originalHexagram?.name)
                                    hexNames.push(originalHexagram.name);
                                  if (changedHexagram?.name)
                                    hexNames.push(changedHexagram.name);

                                  const checkLogic = (name) => {
                                    const upperName = name.toUpperCase();
                                    if (upperName === "HỎA SƠN LỮ") {
                                      results.push({
                                        title: `Quẻ ${name}`,
                                        content:
                                          "Cần kiểm tra phong thuỷ của phòng khách, nhà kho hoặc nơi cất tạm bợ.",
                                      });
                                    }
                                    if (upperName.includes("BÍ")) {
                                      results.push({
                                        title: `Quẻ ${name}`,
                                        content:
                                          "Cần kiểm tra bóng đèn trong nhà, trên bàn thờ hoặc di ảnh.",
                                      });
                                    }
                                    if (upperName === "THIÊN LÔI VÔ VỌNG") {
                                      results.push({
                                        title: `Quẻ ${name}`,
                                        content:
                                          "Nhà có vong, vong bị đói khát không được cúng kiếng.",
                                      });
                                    }
                                  };

                                  hexNames.forEach(checkLogic);

                                  // Remove duplicates if same rule applies to both original and changed hexagrams
                                  const uniqueResults = [];
                                  const seenContent = new Set();
                                  results.forEach((res) => {
                                    if (!seenContent.has(res.content)) {
                                      uniqueResults.push(res);
                                      seenContent.add(res.content);
                                    }
                                  });

                                  if (uniqueResults.length === 0) {
                                    return (
                                      <p className="text-gray-500 italic">
                                        Không có thông tin bổ sung cho quẻ này.
                                      </p>
                                    );
                                  }

                                  return uniqueResults.map((res, i) => (
                                    <div
                                      key={i}
                                      className="p-3 bg-blue-50 rounded border-l-4 border-blue-500"
                                    >
                                      <p className="font-semibold text-blue-800 mb-1">
                                        {res.title}
                                      </p>
                                      <p className="text-gray-700">
                                        {res.content}
                                      </p>
                                    </div>
                                  ));
                                })()}
                              </div>
                            ),
                          },
                        ]}
                      />
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
