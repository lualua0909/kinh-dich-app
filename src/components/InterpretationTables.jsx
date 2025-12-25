import React, { useState } from "react";
import { Table, Card, Drawer, Modal, Button, Tooltip, message, Collapse } from "antd";
import ReactMarkdown from "react-markdown";
import { getNguHanhFromDiaChi } from "../utils/nguHanh";
import {
  getNguHanhRelation,
  getDiaChiRelation,
  calculateDiaChiForce
} from "../utils/divinationScoring";
import { getDungThanInfo } from "../data/dungThan";
import {
  LUC_TU_CODES,
  LUC_TU_ICONS,
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
import { UserOutlined, QuestionCircleOutlined, BulbOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { suggestDungThan } from "../utils/openaiService";
import lucTuInfo from "../data/lucTuInfo.json";
import { useHexagramLines } from "../hooks/useHexagramLines";
import {
  getNhiHopOf,
  getNhiXungOf,
  getNhapMoOf,
  isNhiHopDiaChi,
  DIA_CHI_CODES,
  DIA_CHI_NAMES,
  isNhiXungDiaChi,
  extractDiaChi,
  DIA_CHI_ICONS,
} from "../utils/diaChi";
import nguHanhRelations from "../data/nguHanhRelations.json";

import HaoLine from "./HaoLine";
import NguHanhTooltip from "./NguHanhTooltip";
import DiaChiTooltip from "./DiaChiTooltip";
import LucTuDrawerContent from "./interpretation/LucTuDrawerContent";
import { useDivinationData } from "../hooks/useDivinationData";
import { useSpecialInterpretations } from "../hooks/useSpecialInterpretations";

const HouseWithTree = ({ viTri, loaiCay, caySize, cayColor }) => {
  const svgSize = 140;
  const houseSize = 32;
  const houseX = svgSize / 2 - houseSize / 2;
  const houseY = svgSize / 2 - houseSize / 2;

  const treeDistance = caySize === "multiple" ? 25 : 20;
  let treeX = 0;
  let treeY = 0;
  if (viTri === "Bên trái") {
    treeX = houseX + houseSize + treeDistance;
    treeY = houseY + houseSize / 2;
  } else if (viTri === "Bên phải") {
    treeX = houseX - treeDistance;
    treeY = houseY + houseSize / 2;
  } else if (viTri === "Phía trước") {
    treeX = houseX + houseSize / 2;
    treeY = houseY + houseSize + treeDistance;
  }

  const renderTree = () => {
    if (caySize === "multiple") {
      let offsetX = viTri === "Phía trước" ? -5 : 0;
      let offsetY = (viTri === "Bên trái" || viTri === "Bên phải") ? -5 : 0;
      return (
        <>
          <circle cx={treeX - 8 + offsetX} cy={treeY - 10 + offsetY} r="7" fill={cayColor} />
          <rect x={treeX - 10 + offsetX} y={treeY + offsetY} width="4" height="10" fill="#8b4513" />
          <circle cx={treeX - 2 + offsetX} cy={treeY - 8 + offsetY} r="6" fill={cayColor} />
          <rect x={treeX - 4 + offsetX} y={treeY + offsetY} width="4" height="8" fill="#8b4513" />
          <circle cx={treeX + 4 + offsetX} cy={treeY - 10 + offsetY} r="7" fill={cayColor} />
          <rect x={treeX + 2 + offsetX} y={treeY + offsetY} width="4" height="10" fill="#8b4513" />
          <circle cx={treeX + 10 + offsetX} cy={treeY - 7 + offsetY} r="6" fill={cayColor} />
          <rect x={treeX + 8 + offsetX} y={treeY + offsetY} width="4" height="8" fill="#8b4513" />
          <circle cx={treeX + 1 + offsetX} cy={treeY - 12 + offsetY} r="5" fill={cayColor} />
          <rect x={treeX - 1 + offsetX} y={treeY + offsetY} width="4" height="7" fill="#8b4513" />
        </>
      );
    } else if (caySize === "small") {
      return (
        <>
          <circle cx={treeX - 3} cy={treeY - 5} r="4" fill={cayColor} />
          <rect x={treeX - 4} y={treeY} width="2" height="4" fill="#8b4513" />
          <circle cx={treeX} cy={treeY - 6} r="5" fill={cayColor} />
          <rect x={treeX - 1} y={treeY} width="2" height="5" fill="#8b4513" />
          <circle cx={treeX + 3} cy={treeY - 5} r="4" fill={cayColor} />
          <rect x={treeX + 2} y={treeY} width="2" height="4" fill="#8b4513" />
        </>
      );
    } else {
      return (
        <>
          <circle cx={treeX} cy={treeY - 10} r="12" fill={cayColor} />
          <rect x={treeX - 2.5} y={treeY} width="5" height="10" fill="#8b4513" />
        </>
      );
    }
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="bg-slate-50 rounded-lg border border-slate-200">
        <rect x={houseX} y={houseY} width={houseSize} height={houseSize} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
        <path d={`M${houseX},${houseY} L${houseX + houseSize / 2},${houseY - 15} L${houseX + houseSize},${houseY} Z`} fill="#ef4444" />
        {renderTree()}
      </svg>
      <p className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{viTri}</p>
    </div>
  );
};
export default function InterpretationTables({
  originalHexagram,
  changedHexagram,
  movingLines = [],
  dungThan = null,
  metadata = null,
  question = "",
  onSelectDungThan,
}) {
  if (!originalHexagram) return null;

  const meaningsReady = useHexagramMeanings();
  const {
    lineData1,
    lineData2,
    normalizedLines1,
    normalizedLines2,
    truongSinhNgayMap1,
    truongSinhThangMap1,
    truongSinhNgayMap2,
    truongSinhThangMap2,
  } = useDivinationData(originalHexagram, changedHexagram, movingLines, dungThan, metadata);

  const dayDiaChi = metadata?.dayCanChi?.split(" ").pop();
  const monthDiaChi = metadata?.monthCanChi?.split(" ").pop();
  const yearDiaChi = metadata?.yearCanChi?.split(" ").pop();

  const {
    sayBoCon,
    voDaTungKetHon,
    chongDaTungKetHon,
    phongThuyNha,
    khacResults,
    cayTruocNha
  } = useSpecialInterpretations({
    lineData1,
    lineData2,
    movingLines,
    originalHexagram,
    changedHexagram,
    metadata,
    dayDiaChi,
    monthDiaChi
  });

  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const [lucTuDrawerData, setLucTuDrawerData] = useState(null);
  const [hexagramModalData, setHexagramModalData] = useState(null);
  const [lucThanModalData, setLucThanModalData] = useState(null);

  const handleSuggestDungThan = async () => {
    if (!question) return;
    setSuggestionLoading(true);
    try {
      const suggestion = await suggestDungThan(question, { originalHexagram, metadata });
      setAiSuggestion(suggestion);
    } catch (error) {
      console.error(error);
      message.error("Không thể lấy gợi ý Dụng Thần.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const dungThanHaos1 = new Set(normalizedLines1.filter((l) => l.isDungThan).map((l) => l.hao));
  const amDongHaos1 = new Set(normalizedLines1.filter((l) => l.isAmDong).map((l) => l.hao));
  const nguyenThanHaos1 = new Set(normalizedLines1.filter((l) => l.isNguyenThan).map((l) => l.hao));
  const kyThanHaos1 = new Set(normalizedLines1.filter((l) => l.isKyThan).map((l) => l.hao));
  const cuuThanHaos1 = new Set(normalizedLines1.filter((l) => l.isCuuThan).map((l) => l.hao));
  const tietThanHaos1 = new Set(normalizedLines1.filter((l) => l.isTietThan).map((l) => l.hao));

  const dungThanHaos2 = new Set(normalizedLines2.filter((l) => l.isDungThan).map((l) => l.hao));
  const amDongHaos2 = new Set(normalizedLines2.filter((l) => l.isAmDong).map((l) => l.hao));



  const openLucTuDrawer = (lucTu, record) => {
    if (!lucTu) return;
    setLucTuDrawerData({ lucTu, record });
  };
  const closeLucTuDrawer = () => setLucTuDrawerData(null);
  const openHexagramModal = (hexagramKey, hexagramName, omen) => setHexagramModalData({ hexagramKey, hexagramName, omen });
  const closeHexagramModal = () => setHexagramModalData(null);

  const renderLucThan = (lucThan, record) => {
    const fullLucThan = getLucThanName(lucThan);
    const info = getDungThanInfo(fullLucThan);
    if (!info) return <span className="font-semibold">{fullLucThan}</span>;

    let childOrderInfo = null;
    if (fullLucThan === "Tử Tôn" && record?.canChi) {
      const diaChi = extractDiaChi(record.canChi);
      const normalizedCode = DIA_CHI_CODES[diaChi] || diaChi;
      const mapCodeToOrder = { TY: 1, SU: 2, DN: 3, MA: 4, TH: 5, TI: 6, NG: 7, MU: 8, TN: 9, DA: 10, TU: 11, HO: 12 };
      const order = mapCodeToOrder[normalizedCode];
      if (order) {
        childOrderInfo = (
          <div className="pt-2 border-t border-gray-300 mt-2">
            <span className="font-semibold text-purple-600">Luận đoán thứ bậc con:</span>
            <div className="ml-2 mt-1"><span>Là con thứ <strong>{order}</strong></span></div>
          </div>
        );
      }
    }

    return (
      <span
        className={`font-semibold text-blue-700 cursor-pointer underline decoration-dotted ${record?.extraClassName || ""}`}
        onClick={() => setLucThanModalData({ title: info.label, content: info.content, extra: childOrderInfo })}
      >
        {fullLucThan}
      </span>
    );
  };

  const renderCanChi = (canChi) => {
    if (!canChi) return "-";
    const diaChi = canChi.includes("-") ? canChi.split("-")[0] : canChi.split(" ").pop();
    const nguHanh = getNguHanhFromDiaChi(diaChi);

    return (
      <div className="flex flex-col items-center gap-1">
        <Tooltip title={<DiaChiTooltip diaChi={diaChi} />} placement="top">
          <span className="cursor-help text-center flex flex-col items-center">
            {DIA_CHI_ICONS[DIA_CHI_CODES[diaChi]] && (
              <span className="text-lg leading-none mb-0.5">{DIA_CHI_ICONS[DIA_CHI_CODES[diaChi]]}</span>
            )}
            <span className="leading-tight">{canChi}</span>
          </span>
        </Tooltip>
        {nguHanh && (
          <Tooltip title={<NguHanhTooltip nguHanhName={nguHanh.name} />} placement="top">
            <span className={`text-xs px-2 py-0.5 rounded ${nguHanh.color} font-semibold cursor-help flex items-center gap-1`}>
              <span>{nguHanhRelations[nguHanh.name]?.icon}</span>
              <span>{nguHanh.name}</span>
            </span>
          </Tooltip>
        )}
      </div>
    );
  };

  const renderLucTu = (lucTu, record) => {
    if (!lucTu) return "-";
    const fullLucTu = getLucTuName(lucTu);
    const code = LUC_TU_CODES[fullLucTu] || lucTu;
    const info = lucTuInfo[code];
    return (
      <span
        className={`cursor-pointer underline decoration-dotted flex items-center justify-center gap-1 ${info ? "text-blue-700" : ""}`}
        onClick={() => openLucTuDrawer(lucTu, record)}
      >
        {LUC_TU_ICONS[code] && <span>{LUC_TU_ICONS[code]}</span>}
        <span>{fullLucTu}</span>
      </span>
    );
  };

  const renderHoa = (index) => {
    if (!movingLines?.length) return "";
    const record1 = lineData1[index];
    const record2 = lineData2[index];
    if (!record1 || !record2 || !movingLines.includes(record1.hao)) return "";

    const diaChi1 = extractDiaChi(record1.canChi);
    const nguHanh1 = getNguHanhFromDiaChi(diaChi1);
    const diaChi2 = extractDiaChi(record2.canChi);
    const nguHanh2 = getNguHanhFromDiaChi(diaChi2);
    if (!nguHanh1 || !nguHanh2) return "";

    const relation = getNguHanhRelation(nguHanh1.name, nguHanh2.name);
    if (relation === "duocSinh") return <span className="text-green-600 font-bold">SINH</span>;
    if (relation === "biKhac") return <span className="text-red-600 font-bold">KHẮC</span>;
    if (isNhiHopDiaChi(diaChi1, diaChi2)) return <span className="text-blue-600 font-bold">HỢP</span>;
    if (isNhiXungDiaChi(diaChi1, diaChi2)) return <span className="text-orange-600 font-bold">XUNG</span>;

    if (nguHanh1.name === nguHanh2.name) {
      const diaChiList = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
      const idx1 = diaChiList.indexOf(diaChi1);
      const idx2 = diaChiList.indexOf(diaChi2);
      if (idx1 !== -1 && idx2 !== -1) {
        if (idx2 > idx1) return <span className="text-purple-600 font-bold">TIẾN</span>;
        if (idx2 < idx1) return <span className="text-gray-500 font-bold">THOÁI</span>;
      }
    }

    if ((diaChi1 === "Tý" && diaChi2 === "Tỵ") || (diaChi1 === "Mão" && diaChi2 === "Thân") || (diaChi1 === "Dậu" && diaChi2 === "Dần")) {
      return <span className="text-red-400 font-bold">TUYỆT</span>;
    }

    if (getNhapMoOf(diaChi1) === (DIA_CHI_CODES[diaChi2] || diaChi2)) return <span className="text-amber-700 font-bold">MỘ</span>;
    return "";
  };

  // End of refactored logic block

  // Columns for TỨC ĐIỀU PHÁN SÀO: Hào / Thế ứng / Lục thân / Can chi / Phục thần / Tuần không / Ngày / Tháng
  const columns1 = [
    {
      title: "Hào",
      dataIndex: "hao",
      key: "hao",
      width: 80,
      align: "center",
      render: (hao, record, index) => {
        const info = normalizedLines1[index];
        if (!info) return null;
        const realHao = info.hao;
        const lineType = info.lineType;
        const isMoving = info.isMoving;
        const isDungThanHao = dungThanHaos1.has(realHao);
        const isNguyenThanHao = nguyenThanHaos1.has(realHao);
        const isKyThanHao = kyThanHaos1.has(realHao);
        const isCuuThanHao = cuuThanHaos1.has(realHao);
        const isTietThanHao = tietThanHaos1.has(realHao);
        const isAmDongHao = amDongHaos1.has(realHao);
        return (
          <HaoLine
            hao={realHao}
            lineType={lineType}
            isMoving={isMoving}
            isDungThan={isDungThanHao}
            isNguyenThan={isNguyenThanHao}
            isKyThan={isKyThanHao}
            isCuuThan={isCuuThanHao}
            isTietThan={isTietThanHao}
            isAmDong={isAmDongHao}
          />
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
        // dungThan: hao number (1-6) or null
        let selectedDungThanName = null;
        if (dungThan) {
          const dungThanHao = Number(dungThan);
          const dungThanLineData = lineData1.find((line) => line.hao === dungThanHao);
          if (dungThanLineData && dungThanLineData.lucThan) {
            selectedDungThanName = getLucThanName(dungThanLineData.lucThan);
          }
        }
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
                title={<DiaChiTooltip diaChi={diaChi} />}
                placement="top"
                classNames={{ root: "tooltip-custom" }}
              >
                <span className="text-xs cursor-help">{diaChi}</span>
              </Tooltip>
              {nguHanh && (
                <Tooltip
                  title={<NguHanhTooltip nguHanhName={nguHanh.name} />}
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
    {
      title: "Ngày",
      dataIndex: "ngay",
      key: "ngay",
      width: 100,
      align: "center",
      render: (ngay, record) => {
        const trangThai = truongSinhNgayMap1.get(record.hao);
        return <span>{trangThai || ""}</span>;
      },
    },
    {
      title: "Tháng",
      dataIndex: "thang",
      key: "thang",
      width: 100,
      align: "center",
      render: (thang, record) => {
        const trangThai = truongSinhThangMap1.get(record.hao);
        return <span>{trangThai || ""}</span>;
      },
    },
    {
      title: "Hoá",
      key: "hoa",
      width: 100,
      align: "center",
      render: (text, record, index) => renderHoa(index),
    },
  ];

  // Columns for NHÂN ĐOÁN TÁO CAO: Hào / Lục thân / Can chi / Lục tú / Tuần không / Ngày / Tháng
  const columns2 = [
    {
      title: "Hào",
      dataIndex: "hao",
      key: "hao",
      width: 80,
      align: "center",
      render: (hao, record, index) => {
        const info = normalizedLines2[index];
        if (!info) return null;
        return (
          <HaoLine
            hao={info.hao}
            lineType={info.lineType}
            isMoving={info.isMoving}
          />
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
    {
      title: "Ngày",
      dataIndex: "ngay",
      key: "ngay",
      width: 100,
      align: "center",
      render: (ngay, record) => {
        const trangThai = truongSinhNgayMap2.get(record.hao);
        return <span>{trangThai || ""}</span>;
      },
    },
    {
      title: "Tháng",
      dataIndex: "thang",
      key: "thang",
      width: 100,
      align: "center",
      render: (thang, record) => {
        const trangThai = truongSinhThangMap2.get(record.hao);
        return <span>{trangThai || ""}</span>;
      },
    },
    {
      title: "Hoá",
      key: "hoa",
      width: 100,
      align: "center",
      render: (text, record, index) => renderHoa(index),
    },
  ];

  // Render content for Lục Thú fullscreen drawer
  const renderLucTuDrawerContent = () => {
    if (!lucTuDrawerData) return null;
    return <LucTuDrawerContent lucTu={lucTuDrawerData.lucTu} record={lucTuDrawerData.record} />;
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

      {/* Phân tích câu hỏi & Gợi ý Dụng Thần */}
      {question && (
        <Card
          className="border-2 border-emerald-200 bg-emerald-50 rounded-xl shadow-sm mb-6"
          title={
            <div className="flex items-center gap-2 text-emerald-800">
              <QuestionCircleOutlined />
              <span>Phân tích Sự việc & Dụng Thần</span>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">Câu hỏi của bạn:</span>
              <p className="text-lg font-medium text-emerald-900 bg-white/50 p-3 rounded-lg border border-emerald-100 italic">
                "{question}"
              </p>
            </div>

            {!aiSuggestion ? (
              <Button
                type="primary"
                icon={<BulbOutlined />}
                onClick={handleSuggestDungThan}
                loading={suggestionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 border-none"
              >
                Gợi ý Dụng Thần bằng AI
              </Button>
            ) : (
              <div className="bg-white p-4 rounded-lg border border-emerald-200 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
                    <CheckCircleOutlined />
                    <span>Dụng Thần gợi ý: <span className="text-emerald-900 underline decoration-emerald-300 decoration-4 underline-offset-4">{aiSuggestion.lucThan}</span></span>
                  </div>
                  <Button
                    size="small"
                    icon={<BulbOutlined />}
                    onClick={handleSuggestDungThan}
                    loading={suggestionLoading}
                  >
                    Gợi ý lại
                  </Button>
                </div>

                <p className="text-gray-700 mb-3 leading-relaxed">
                  <span className="font-semibold">Lý do:</span> {aiSuggestion.reason}
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500 self-center">Áp dụng chọn Hào:</span>
                  {aiSuggestion.hao.map(h => (
                    <Button
                      key={h}
                      size="small"
                      type={dungThan === h ? "primary" : "default"}
                      onClick={() => onSelectDungThan(h)}
                      className={dungThan === h ? "bg-emerald-600 border-emerald-600" : ""}
                    >
                      Hào {h}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

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
          const dungThanHao = Number(dungThan);
          const dungThanLineData = lineData1.find((line) => line.hao === dungThanHao);
          const dungThanDiaChi = dungThanLineData ? extractDiaChi(dungThanLineData.canChi) : null;
          const dungThanName = dungThanLineData?.lucThan ? getLucThanName(dungThanLineData.lucThan) : null;
          const dungThanInfo = dungThanName ? getDungThanInfo(dungThanName) : null;

          // Steps calculation using utility
          const dungThanForce = dungThanDiaChi ? calculateDiaChiForce(dungThanDiaChi, yearDiaChi, monthDiaChi, dayDiaChi) : null;
          const theForce = theDiaChi ? calculateDiaChiForce(theDiaChi, yearDiaChi, monthDiaChi, dayDiaChi) : null;

          const buoc3ThaiTueDiem = dungThanForce?.details.find(d => d.step === "1")?.diem || 0;
          const thaiTue = dungThanDiaChi === yearDiaChi;
          const tuePha = getNhiXungOf(dungThanDiaChi) === yearDiaChi;

          const buoc3Results = dungThanForce?.details.filter(d => d.step.startsWith("2")) || [];
          const buoc3Diem = buoc3Results.reduce((acc, curr) => acc + curr.diem, 0);
          const buoc3DungTai = buoc3Results.length > 0 ? buoc3Results[0].step : null;
          const buoc3Dung = buoc3Results.length > 0;

          const buoc4Results = dungThanForce?.details.filter(d => d.step.startsWith("3")) || [];
          const buoc4Diem = buoc4Results.reduce((acc, curr) => acc + curr.diem, 0);
          const buoc4DungTai = buoc4Results.length > 0 ? buoc4Results[0].step : null;
          const buoc4Dung = buoc4Results.length > 0;

          const thaiTueThe = theDiaChi === yearDiaChi;
          const tuePhaThe = getNhiXungOf(theDiaChi) === yearDiaChi;
          const buoc5ThaiTueDiem = theForce?.details.find(d => d.step === "1")?.diem || 0;

          const buoc5Results = theForce?.details.filter(d => d.step.startsWith("2")) || [];
          const buoc5Diem = buoc5Results.reduce((acc, curr) => acc + curr.diem, 0);
          const buoc5DungTai = buoc5Results.length > 0 ? buoc5Results[0].step : null;
          const buoc5Dung = buoc5Results.length > 0;

          const buoc6Results = theForce?.details.filter(d => d.step.startsWith("3")) || [];
          const buoc6Diem = buoc6Results.reduce((acc, curr) => acc + curr.diem, 0);
          const buoc6DungTai = buoc6Results.length > 0 ? buoc6Results[0].step : null;
          const buoc6Dung = buoc6Results.length > 0;

          const buoc2KetLuan = (theDiaChi && dungThanDiaChi) ? (() => {
            const relation = getDiaChiRelation(theDiaChi, dungThanDiaChi);
            const patterns = {
              "bằng": { relation: "Bằng nhau", text: "Tốt", color: "text-green-600" },
              "duocSinh": { relation: "Thế được sinh bởi Dụng", text: "Tốt", color: "text-green-600" },
              "sinh": { relation: "Thế sinh Dụng", text: "Tốt nhưng cần phải có sự cố gắng thì việc mới thành", color: "text-yellow-600" },
              "khac": { relation: "Thế khắc Dụng", text: "Rất xấu", color: "text-red-600" },
              "biKhac": { relation: "Dụng khắc Thế", text: "Tương đối xấu", color: "text-orange-600" }
            };
            return patterns[relation] || null;
          })() : null;

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
                    {(() => {
                      // Logic: Luận Vợ Đã Từng Kết Hôn (Removed inline calculation in favor of hook)


                      // Bước 8: Ứng kỳ
                      let buoc8Item = null;
                      if (dungThanLineData && dungThanDiaChi) {
                        const isDong = movingLines.includes(dungThanLineData.hao);
                        const isQuaVuong = (dungThanDiaChi === monthDiaChi) && (dungThanDiaChi === dayDiaChi);

                        const dungThanNguHanh = getNguHanhFromDiaChi(dungThanDiaChi);
                        const monthNguHanh = getNguHanhFromDiaChi(monthDiaChi);
                        const isSuyTuyet = dungThanNguHanh && monthNguHanh && getNguHanhRelation(dungThanNguHanh.name, monthNguHanh.name) === 'biKhac';

                        const isNhapTamMo = getNhapMoOf(dungThanDiaChi) === (DIA_CHI_CODES[monthDiaChi] || monthDiaChi);
                        const isNguyetPha = isNhiXungDiaChi(dungThanDiaChi, monthDiaChi);

                        const formatDiaChiUngKy = (dc) => {
                          const name = DIA_CHI_NAMES[DIA_CHI_CODES[dc] || dc] || dc;
                          const firstDay = { "Tý": 1, "Sửu": 2, "Dần": 3, "Mão": 4, "Thìn": 5, "Tỵ": 6, "Ngọ": 7, "Mùi": 8, "Thân": 9, "Dậu": 10, "Tuất": 11, "Hợi": 12 }[name];

                          const days = [];
                          if (firstDay) {
                            for (let d = firstDay; d <= 30; d += 12) {
                              days.push(d);
                            }
                          }

                          const monthMap = { "Dần": 1, "Mão": 2, "Thìn": 3, "Tỵ": 4, "Ngọ": 5, "Mùi": 6, "Thân": 7, "Dậu": 8, "Tuất": 9, "Hợi": 10, "Tý": 11, "Sửu": 12 };
                          return <span>ngày {name} (ngày {days.join(", ")}), tháng {name} (tháng {monthMap[name]})</span>;
                        };

                        buoc8Item = {
                          key: "8",
                          label: "Bước 8: Ứng kỳ",
                          children: (
                            <div className="bg-white p-4 rounded-lg border border-parchment-200">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-parchment-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                  8
                                </div>
                                <div className="flex-1 prose prose-sm max-w-none text-gray-700">
                                  <p className="font-semibold mb-3 text-base">Phân tích Ứng kỳ cho Dụng Thần</p>
                                  <div className="space-y-4">
                                    <div className={`p-3 rounded border-l-4 ${isDong ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-400'}`}>
                                      <p className="font-bold m-0 text-sm">{isDong ? 'Hào Động' : 'Hào Tĩnh'}</p>
                                      <p className="text-xs text-gray-600 m-0 mt-1">
                                        {isDong ? `Hào Dụng Thần (Hào ${dungThanLineData.hao}) là hào động.` : `Hào Dụng Thần (Hào ${dungThanLineData.hao}) là hào tĩnh.`}
                                      </p>
                                      {isDong && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                          <p className="text-xs text-blue-700 m-0 leading-relaxed">
                                            • Ứng kỳ: {formatDiaChiUngKy(dungThanDiaChi)}
                                          </p>
                                          <p className="text-xs text-green-700 m-0 mt-1 leading-relaxed">
                                            • Ứng kỳ (Hợp): {formatDiaChiUngKy(getNhiHopOf(dungThanDiaChi))}
                                          </p>
                                          {(() => {
                                            const ttIndex = lineData1.findIndex(l => l.hao === dungThanLineData.hao);
                                            const ttChangedLine = lineData2[ttIndex];
                                            if (ttChangedLine) {
                                              const changedDiaChi = extractDiaChi(ttChangedLine.canChi);
                                              if (changedDiaChi && changedDiaChi !== dungThanDiaChi) {
                                                return (
                                                  <p className="text-xs text-purple-700 m-0 mt-1 leading-relaxed">
                                                    • Ứng kỳ (Biến): {formatDiaChiUngKy(changedDiaChi)}
                                                  </p>
                                                );
                                              }
                                            }
                                            return null;
                                          })()}
                                        </div>
                                      )}
                                      {!isDong && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                          <p className="text-xs text-blue-700 m-0 leading-relaxed">
                                            • Ứng kỳ: {formatDiaChiUngKy(dungThanDiaChi)}
                                          </p>
                                          <p className="text-xs text-red-700 m-0 mt-1 leading-relaxed">
                                            • Ứng kỳ (Xung): {formatDiaChiUngKy(getNhiXungOf(dungThanDiaChi))}
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {isQuaVuong && (
                                      <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                                        <p className="font-bold text-green-700 m-0 text-sm">Quá Vượng</p>
                                        <p className="text-xs text-gray-600 m-0 mt-1">Dụng thần đồng thời xuất hiện tại Nhật kiến và Nguyệt kiến ({dungThanDiaChi}).</p>
                                        <div className="mt-2 pt-2 border-t border-green-200">
                                          {getNhapMoOf(dungThanDiaChi) && (
                                            <p className="text-xs text-amber-700 m-0 leading-relaxed">
                                              • Ứng kỳ (Mộ): {formatDiaChiUngKy(getNhapMoOf(dungThanDiaChi))}
                                            </p>
                                          )}
                                          <p className="text-xs text-red-700 m-0 mt-1 leading-relaxed">
                                            • Ứng kỳ (Xung): {formatDiaChiUngKy(getNhiXungOf(dungThanDiaChi))}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {isSuyTuyet && (
                                      <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                                        <p className="font-bold text-red-700 m-0 text-sm">Suy Tuyệt</p>
                                        <p className="text-xs text-gray-600 m-0 mt-1">Ngũ hành Dụng thần ({dungThanNguHanh.name}) bị ngũ hành của Tháng ({monthNguHanh.name}) tương khắc.</p>
                                      </div>
                                    )}

                                    {isNhapTamMo && (
                                      <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                                        <p className="font-bold text-orange-700 m-0 text-sm">Nhập Tam Mộ</p>
                                        <p className="text-xs text-gray-600 m-0 mt-1">Địa chi Dụng thần ({dungThanDiaChi}) nhập mộ tại địa chi của Tháng ({monthDiaChi}).</p>
                                      </div>
                                    )}

                                    {isNguyetPha && (
                                      <div className="p-3 bg-red-100 rounded border-l-4 border-red-600">
                                        <p className="font-bold text-red-800 m-0 text-sm">Bị Nguyệt Phá</p>
                                        <p className="text-xs text-gray-600 m-0 mt-1">Địa chi Dụng thần ({dungThanDiaChi}) bị địa chi của Tháng ({monthDiaChi}) nhị xung.</p>
                                      </div>
                                    )}

                                    {!isQuaVuong && !isSuyTuyet && !isNhapTamMo && !isNguyetPha && (
                                      <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                                        <p className="text-gray-500 italic text-xs m-0">Không có các trạng thái Quá Vượng, Suy Tuyệt, Nhập Mộ hay Nguyệt Phá.</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        };
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
                                      {dungThanLineData && (
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-2">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <p className="m-0 text-sm">
                                            <strong>Hào Dụng Thần:</strong> Hào {dungThanLineData.hao} ({dungThanLineData.canChi})
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
                                    dungThanLineData &&
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
                                        {dungThanLineData.hao} ({dungThanLineData.canChi})
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

                      // Bước 7: Lực của hào động và mối tương quan với Dụng Thần
                      const movingHaos = normalizedLines1.filter((l) => l.isMoving);
                      if (movingHaos.length > 0) {
                        collapseItems.push({
                          key: "7",
                          label: "Bước 7: Lực của hào động và mối tương quan với Dụng Thần",
                          children: (
                            <div className="space-y-4">
                              {movingHaos.map((mHao, idx) => {
                                const mDiaChi = extractDiaChi(mHao.lineData.canChi);
                                const force = calculateDiaChiForce(
                                  mDiaChi,
                                  yearDiaChi,
                                  monthDiaChi,
                                  dayDiaChi
                                );

                                let correlation = null;
                                if (force.totalScore > 0 && dungThanDiaChi) {
                                  const isHop = isNhiHopDiaChi(
                                    mDiaChi,
                                    dungThanDiaChi
                                  );
                                  const isXung = isNhiXungDiaChi(
                                    mDiaChi,
                                    dungThanDiaChi
                                  );
                                  const nh1 = getNguHanhFromDiaChi(mDiaChi)?.name;
                                  const nh2 =
                                    getNguHanhFromDiaChi(dungThanDiaChi)?.name;
                                  const nhRel = getNguHanhRelation(nh1, nh2);
                                  correlation = { isHop, isXung, nhRel, nh1, nh2 };
                                }

                                return (
                                  <div
                                    key={idx}
                                    className="bg-white p-4 rounded-lg border border-parchment-200"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0 w-8 h-8 bg-parchment-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        7
                                      </div>
                                      <div className="flex-1 space-y-3 prose prose-sm max-w-none text-gray-700">
                                        <p className="font-semibold mb-0">
                                          Hào Động: Hào {mHao.hao} (
                                          {mHao.lineData.canChi})
                                        </p>

                                        <div className="p-3 bg-gray-50 rounded border-l-4 border-parchment-400">
                                          <p className="font-semibold mb-2 text-sm">
                                            7.2: Xét lực của hào động (Tổng điểm:{" "}
                                            {force.totalScore.toFixed(2)})
                                          </p>
                                          <div className="space-y-1">
                                            {force.details.map((d, i) => (
                                              <p
                                                key={i}
                                                className={`text-xs m-0 ${d.color}`}
                                              >
                                                • {d.name}: {d.diem > 0 ? "+" : ""}
                                                {d.diem} ({d.description})
                                              </p>
                                            ))}
                                          </div>
                                          <p
                                            className={`font-bold mt-2 mb-0 ${force.totalScore > 0
                                              ? "text-green-600"
                                              : "text-gray-500"
                                              }`}
                                          >
                                            →{" "}
                                            {force.totalScore > 0
                                              ? "Hào có Lực (Vượng)"
                                              : "Hào hưu tù (Không có lực)"}
                                          </p>
                                        </div>

                                        {correlation && (
                                          <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                            <p className="font-semibold mb-2 text-sm">
                                              7.3: Tương quan với Dụng Thần (
                                              {dungThanDiaChi})
                                            </p>
                                            <div className="space-y-1 text-xs text-gray-700">
                                              {correlation.isHop && (
                                                <p className="text-blue-600 font-semibold m-0">
                                                  • Nhị Hợp với Dụng Thần
                                                </p>
                                              )}
                                              {correlation.isXung && (
                                                <p className="text-red-600 font-semibold m-0">
                                                  • Nhị Xung với Dụng Thần
                                                </p>
                                              )}
                                              {correlation.nhRel === "sinh" && (
                                                <p className="m-0">
                                                  • Ngũ hành: Hào động (
                                                  {correlation.nh1}) sinh Dụng Thần
                                                  ({correlation.nh2})
                                                </p>
                                              )}
                                              {correlation.nhRel ===
                                                "duocSinh" && (
                                                  <p className="text-green-600 font-semibold m-0">
                                                    • Ngũ hành: Hào động (
                                                    {correlation.nh1}) được Dụng Thần
                                                    ({correlation.nh2}) sinh
                                                  </p>
                                                )}
                                              {correlation.nhRel === "khac" && (
                                                <p className="text-red-600 font-semibold m-0">
                                                  • Ngũ hành: Hào động (
                                                  {correlation.nh1}) khắc Dụng Thần
                                                  ({correlation.nh2})
                                                </p>
                                              )}
                                              {correlation.nhRel ===
                                                "biKhac" && (
                                                  <p className="m-0">
                                                    • Ngũ hành: Hào động (
                                                    {correlation.nh1}) bị Dụng Thần
                                                    ({correlation.nh2}) khắc
                                                  </p>
                                                )}
                                              {correlation.nhRel === "trung" && (
                                                <p className="m-0">
                                                  • Ngũ hành: Hào động và Dụng Thần
                                                  cùng hành {correlation.nh1}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ),
                        });
                      }

                      // Bước 7.1: Lực của hào ám động và mối tương quan với Dụng Thần
                      const amDongHaosAnalysis = normalizedLines1.filter((l) => l.isAmDong);
                      if (amDongHaosAnalysis.length > 0) {
                        collapseItems.push({
                          key: "7.1",
                          label: "Bước 7.1: Lực của hào ám động và mối tương quan với Dụng Thần",
                          children: (
                            <div className="space-y-4">
                              {amDongHaosAnalysis.map((aHao, idx) => {
                                const aDiaChi = extractDiaChi(aHao.lineData.canChi);
                                const force = calculateDiaChiForce(
                                  aDiaChi,
                                  yearDiaChi,
                                  monthDiaChi,
                                  dayDiaChi
                                );

                                let correlation = null;
                                if (force.totalScore > 0 && dungThanDiaChi) {
                                  const isHop = isNhiHopDiaChi(
                                    aDiaChi,
                                    dungThanDiaChi
                                  );
                                  const isXung = isNhiXungDiaChi(
                                    aDiaChi,
                                    dungThanDiaChi
                                  );
                                  const nh1 = getNguHanhFromDiaChi(aDiaChi)?.name;
                                  const nh2 =
                                    getNguHanhFromDiaChi(dungThanDiaChi)?.name;
                                  const nhRel = getNguHanhRelation(nh1, nh2);
                                  correlation = { isHop, isXung, nhRel, nh1, nh2 };
                                }

                                return (
                                  <div
                                    key={idx}
                                    className="bg-white p-4 rounded-lg border border-purple-200"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0 w-8 h-8 bg-purple-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        7.1
                                      </div>
                                      <div className="flex-1 space-y-3 prose prose-sm max-w-none text-gray-700">
                                        <p className="font-semibold mb-0">
                                          Hào Ám Động: Hào {aHao.hao} (
                                          {aHao.lineData.canChi})
                                        </p>

                                        <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                                          <p className="font-semibold mb-2 text-sm">
                                            7.1.2: Xét lực của hào ám động (Tổng điểm:{" "}
                                            {force.totalScore.toFixed(2)})
                                          </p>
                                          <div className="space-y-1">
                                            {force.details.map((d, i) => (
                                              <p
                                                key={i}
                                                className={`text-xs m-0 ${d.color}`}
                                              >
                                                • {d.name}: {d.diem > 0 ? "+" : ""}
                                                {d.diem} ({d.description})
                                              </p>
                                            ))}
                                          </div>
                                          <p
                                            className={`font-bold mt-2 mb-0 ${force.totalScore > 0
                                              ? "text-green-600"
                                              : "text-gray-500"
                                              }`}
                                          >
                                            →{" "}
                                            {force.totalScore > 0
                                              ? "Hào có Lực (Vượng)"
                                              : "Hào hưu tù (Không có lực)"}
                                          </p>
                                        </div>

                                        {correlation && (
                                          <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                            <p className="font-semibold mb-2 text-sm">
                                              7.1.3: Tương quan với Dụng Thần (
                                              {dungThanDiaChi})
                                            </p>
                                            <div className="space-y-1 text-xs text-gray-700">
                                              {correlation.isHop && (
                                                <p className="text-blue-600 font-semibold m-0">
                                                  • Nhị Hợp với Dụng Thần
                                                </p>
                                              )}
                                              {correlation.isXung && (
                                                <p className="text-red-600 font-semibold m-0">
                                                  • Nhị Xung với Dụng Thần
                                                </p>
                                              )}
                                              {correlation.nhRel === "sinh" && (
                                                <p className="m-0">
                                                  • Ngũ hành: Hào ám động (
                                                  {correlation.nh1}) sinh Dụng Thần
                                                  ({correlation.nh2})
                                                </p>
                                              )}
                                              {correlation.nhRel ===
                                                "duocSinh" && (
                                                  <p className="text-green-600 font-semibold m-0">
                                                    • Ngũ hành: Hào ám động (
                                                    {correlation.nh1}) được Dụng Thần
                                                    ({correlation.nh2}) sinh
                                                  </p>
                                                )}
                                              {correlation.nhRel === "khac" && (
                                                <p className="text-red-600 font-semibold m-0">
                                                  • Ngũ hành: Hào ám động (
                                                  {correlation.nh1}) khắc Dụng Thần
                                                  ({correlation.nh2})
                                                </p>
                                              )}
                                              {correlation.nhRel ===
                                                "biKhac" && (
                                                  <p className="m-0">
                                                    • Ngũ hành: Hào ám động (
                                                    {correlation.nh1}) bị Dụng Thần
                                                    ({correlation.nh2}) khắc
                                                  </p>
                                                )}
                                              {correlation.nhRel === "trung" && (
                                                <p className="m-0">
                                                  • Ngũ hành: Hào ám động và Dụng Thần
                                                  cùng hành {correlation.nh1}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ),
                        });
                      }

                      if (voDaTungKetHon) {
                        collapseItems.push({
                          key: "vo-da-tung-ket-hon",
                          label: "Luận giải bổ sung: Luận Vợ Đã Từng Kết Hôn",
                          children: (
                            <div className="bg-white p-4 rounded-lg border border-parchment-200">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-parchment-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                  +
                                </div>
                                <div className="flex-1 prose prose-sm max-w-none text-gray-700">
                                  <p className="font-semibold mb-2">Luận đoán Thê Tài biến Chu Tước</p>
                                  <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                                    <p className="font-semibold text-blue-700 mb-1">
                                      Kết luận: Khả năng cao vợ đã từng kết hôn hoặc có người yêu sâu đậm trước đó
                                    </p>
                                    <p className="text-sm text-gray-600">{voDaTungKetHon.description}</p>
                                    <p className="text-xs text-gray-500 mt-2 italic">
                                      (Hào Thê Tài {voDaTungKetHon.targetHao} và Phụ Mẫu {voDaTungKetHon.phuMauHao} cùng quái, Phụ Mẫu biến không Tuần Không, Thê Tài biến lâm Chu Tước)
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        });
                      }

                      if (chongDaTungKetHon) {
                        collapseItems.push({
                          key: "chong-da-tung-ket-hon",
                          label: "Luận giải bổ sung: Luận Chồng Đã Từng Kết Hôn",
                          children: (
                            <div className="bg-white p-4 rounded-lg border border-parchment-200">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-parchment-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                  +
                                </div>
                                <div className="flex-1 prose prose-sm max-w-none text-gray-700">
                                  <p className="font-semibold mb-2">Luận đoán Quan Quỷ biến Chu Tước</p>
                                  <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                                    <p className="font-semibold text-blue-700 mb-1">
                                      Kết luận: Khả năng cao chồng đã từng kết hôn hoặc có người yêu sâu đậm trước đó
                                    </p>
                                    <p className="text-sm text-gray-600">{chongDaTungKetHon.description}</p>
                                    <p className="text-xs text-gray-500 mt-2 italic">
                                      (Hào Quan Quỷ {chongDaTungKetHon.targetHao} và Phụ Mẫu {chongDaTungKetHon.phuMauHao} cùng quái, Phụ Mẫu biến không Tuần Không, Quan Quỷ biến lâm Chu Tước)
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        });
                      }

                      if (buoc8Item) {
                        collapseItems.push(buoc8Item);
                      }

                      return <Collapse items={collapseItems} />;
                    })()}
                  </div>

                  {/* Tổng điểm và Kết luận cho Dụng Thần */}
                  {dungThanDiaChi && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-300 shadow-lg">
                      <div className="text-center">
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
                              <p className="font-bold text-lg text-gray-800 mb-4">
                                Tổng Điểm Dụng Thần {tongDiemDungThan > 0 ? "+" : ""}
                                {tongDiemDungThan.toFixed(2)}  <span
                                  className={`px-2 rounded-full font-bold text-lg ${ketLuanColorDungThan} border-2 ${tongDiemDungThan > 0
                                    ? "border-green-500"
                                    : tongDiemDungThan === 0
                                      ? "border-blue-500"
                                      : "border-red-500"
                                    }`}
                                >
                                  {ketLuanDungThan}
                                </span>
                              </p>
                              <div className="mt-4 text-sm text-gray-600 space-y-1">
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
                              <p className="font-bold text-lg text-gray-800 mb-4">
                                Tổng Điểm Hào Thế  {tongDiemHaoThe > 0 ? "+" : ""}
                                {tongDiemHaoThe.toFixed(2)}   <span
                                  className={`px-2 rounded-full font-bold text-lg ${ketLuanColorHaoThe} border-2 ${tongDiemHaoThe > 0
                                    ? "border-green-500"
                                    : tongDiemHaoThe === 0
                                      ? "border-blue-500"
                                      : "border-red-500"
                                    }`}
                                >
                                  {ketLuanHaoThe}
                                </span>
                              </p>
                              <div className="mt-4 text-sm text-gray-600 space-y-1">
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
                    <Collapse
                      items={[
                        {
                          key: "1",
                          label: "Luận Sảy Bỏ Con",
                          children: (
                            <>
                              {sayBoCon ? (
                                <div className="space-y-3">
                                  <p className="font-semibold mb-2">
                                    Hào Tử Tôn: Hào {sayBoCon.tuTonHao.hao} ({sayBoCon.tuTonHao.canChi}) - Địa Chi: <strong>{sayBoCon.tuTonDiaChi}</strong>
                                  </p>
                                  <div className={`p-3 rounded border-l-4 ${sayBoCon.isPartOfTamHinh ? "bg-red-50 border-red-500" : "bg-green-50 border-green-500"}`}>
                                    <p className="font-semibold mb-1">Kiểm tra Tam Hình chứa hào Tử Tôn</p>
                                    {sayBoCon.isPartOfTamHinh ? (
                                      <p className="text-red-700 font-bold">⚠ Có nguy cơ: Tử Tôn nằm trong bộ Tam Hình {sayBoCon.tamHinhGroup.join("-")}</p>
                                    ) : (
                                      <p className="text-green-700">✓ Không tìm thấy nhóm Tam Hình đầy đủ có chứa hào Tử Tôn</p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">Không tìm thấy hào Tử Tôn trong quẻ</p>
                              )}
                            </>
                          ),
                        },
                        {
                          key: "2",
                          label: "Luận Vợ Đã Từng Kết Hôn (Thê Tài)",
                          children: (
                            <>
                              {voDaTungKetHon ? (
                                <div className="space-y-3">
                                  <p className="font-semibold">Thê Tài: Hào {voDaTungKetHon.targetHao}</p>
                                  <div className="p-4 rounded-lg border-2 bg-blue-100 border-blue-400">
                                    <p className="font-bold text-lg mb-2 text-blue-800">⚠ CÓ KHẢ NĂNG ĐÃ TỪNG KẾT HÔN TRƯỚC ĐÂY</p>
                                    <p className="text-sm text-blue-700">{voDaTungKetHon.description}</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">Không đủ điều kiện để kết luận vợ đã từng kết hôn trước đây.</p>
                              )}
                            </>
                          ),
                        },
                        {
                          key: "2b",
                          label: "Luận Chồng Đã Từng Kết Hôn (Quan Quỷ)",
                          children: (
                            <>
                              {chongDaTungKetHon ? (
                                <div className="space-y-3">
                                  <p className="font-semibold">Quan Quỷ: Hào {chongDaTungKetHon.targetHao}</p>
                                  <div className="p-4 rounded-lg border-2 bg-blue-100 border-blue-400">
                                    <p className="font-bold text-lg mb-2 text-blue-800">⚠ CÓ KHẢ NĂNG ĐÃ TỪNG KẾT HÔN TRƯỚC ĐÂY</p>
                                    <p className="text-sm text-blue-700">{chongDaTungKetHon.description}</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">Không đủ điều kiện để kết luận chồng đã từng kết hôn trước đây.</p>
                              )}
                            </>
                          ),
                        },
                        {
                          key: "3",
                          label: "Luận Cây Trước Nhà",
                          children: (
                            <>
                              {cayTruocNha && cayTruocNha.length > 0 ? (
                                <div className="space-y-4">
                                  {cayTruocNha.map((cay, idx) => (
                                    <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                      <p className="font-semibold mb-2">Cây {idx + 1}: Hào {cay.hao} ({cay.canChi})</p>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-gray-700"><strong>Vị trí:</strong> {cay.viTri}</p>
                                          <p className="text-sm text-gray-700"><strong>Loại cây:</strong> {cay.loaiCay}</p>
                                        </div>
                                        <HouseWithTree {...cay} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">Không tìm thấy cây trong quẻ</p>
                              )}
                            </>
                          ),
                        },
                        {
                          key: "4",
                          label: "Khác",
                          children: (
                            <>
                              {phongThuyNha && (
                                <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                                  <p className="font-semibold text-red-800 mb-1">Phong thủy nhà ở</p>
                                  <p className="text-gray-700">{phongThuyNha.content}</p>
                                </div>
                              )}
                              {khacResults && khacResults.length > 0 ? (
                                khacResults.map((res, i) => (
                                  <div key={i} className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                                    <p className="font-semibold text-blue-800 mb-1">{res.title}</p>
                                    <p className="text-gray-700">{res.content}</p>
                                  </div>
                                ))
                              ) : !phongThuyNha ? (
                                <p className="text-gray-500 italic">Không có thông tin bổ sung cho quẻ này.</p>
                              ) : null}
                            </>
                          ),
                        },
                      ]}
                    />
                  </div>
                </div>
              </Card>
            </div>
          );
        })()}
    </>
  );
}
