import React, { useState, useEffect } from "react";
import { Card, Tooltip, message } from "antd";
import { performDivination } from "./utils/divination";
import { generateLineData } from "./data/lines";
import DivinationForm from "./components/DivinationForm";
import HexagramColumn from "./components/HexagramColumn";
import InterpretationTables from "./components/InterpretationTables";
import NguHanhTable from "./components/NguHanhTable";
import "./App.css";
import { LUC_THAN_CODES } from "./data/lucThuInfo";
import { DIA_CHI_CODES, DIA_CHI_ICONS } from "./utils/diaChi";
import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from "./utils/ganzhi";
import { EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Select, Button } from "antd";

// Ngũ hành theo Địa Chi (dùng cho tooltip)
import nguHanhRelations from "./data/nguHanhRelations.json";

// Ngũ hành theo Địa Chi (dùng cho tooltip)
// const nguHanhRelations = { ... } (moved to json)

const nguHanhFromDiaChi = {
  DN: { name: "Mộc", color: "text-green-600 bg-green-50" },
  MA: { name: "Mộc", color: "text-green-600 bg-green-50" },
  TI: { name: "Hỏa", color: "text-red-600 bg-red-50" },
  NG: { name: "Hỏa", color: "text-red-600 bg-red-50" },
  TH: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
  TU: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
  SU: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
  MU: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
  TN: { name: "Kim", color: "text-yellow-600 bg-yellow-50" },
  DA: { name: "Kim", color: "text-yellow-600 bg-yellow-50" },
  HO: { name: "Thủy", color: "text-blue-600 bg-blue-50" },
  TY: { name: "Thủy", color: "text-blue-600 bg-blue-50" }
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

const renderCanChiWithNguHanh = (canChi) => {
  if (!canChi) return "-";
  const parts = canChi.split(" ");
  const diaChi = parts[parts.length - 1];
  const diaChiCode = DIA_CHI_CODES[diaChi];
  const nguHanh = nguHanhFromDiaChi[diaChiCode];

  return (
    <>
      {diaChiCode && DIA_CHI_ICONS[diaChiCode] && (
        <span className="mr-1">{DIA_CHI_ICONS[diaChiCode]}</span>
      )}
      {canChi}
      {nguHanh && (
        <Tooltip
          title={renderNguHanhTooltip(nguHanh.name)}
          placement="top"
          classNames={{ root: "tooltip-custom" }}
        >
          <span className={`${nguHanh.color}`}>
            {nguHanhRelations[nguHanh.name]?.icon}
          </span>
        </Tooltip>
      )}
    </>
  );
};

const getDiaChiFromCanChi = (canChi) => {
  if (!canChi) return null;
  const parts = canChi.split(" ");
  return parts[parts.length - 1];
};

const getDungThanDiaChi = (result, dungThanHao) => {
  // dungThanHao: hao number (1-6) or null
  if (!dungThanHao || !result || !result.originalHexagram) return null;

  // Lấy dayCanChi từ metadata để tính Lục Thú
  const dayCanChi = result.metadata?.dayCanChi;
  const lineData = generateLineData(result.originalHexagram.id, dayCanChi);
  // Find line by hao number
  const dungThanLine = lineData.find((line) => line.hao === dungThanHao);
  return dungThanLine ? getDiaChiFromCanChi(dungThanLine.canChi) : null;
};

function App() {
  const [result, setResult] = useState(null);
  const [dungThan, setDungThan] = useState(null); // Single Dụng Thần: hao number (1-6) or null
  const [isEditingCanChi, setIsEditingCanChi] = useState(false);
  const [editMetadata, setEditMetadata] = useState(null);

  // Parse URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("t"); // 's' for serial, 'm' for manual
    const query = params.get("q"); // serial or lines
    const movingLineParam = params.get("ml");
    const datetimeParam = params.get("dt");
    const dungThanParam = params.get("dtu"); // hao number (1-6) or null

    if (type && query) {
      const input = {};
      if (type === "s") {
        input.type = "serial";
        input.serial = query;
      } else if (type === "m") {
        input.type = "manual";
        input.lines = query.split("").map(Number);
      }

      if (movingLineParam) {
        input.movingLine = Number(movingLineParam);
      }

      if (datetimeParam) {
        input.datetime = new Date(datetimeParam);
      }

      // Parse dungThan from URL: hao number (1-6) or null
      const dungThanHao = dungThanParam ? Number(dungThanParam) : null;

      handleDivinate(input, dungThanHao, true);
    }
  }, []);

  const handleDivinate = (input, dungThanValue, isInitialLoad = false) => {
    try {
      const divinationResult =
        input.type === "serial"
          ? performDivination(
            input.serial,
            undefined,
            undefined,
            input.datetime
          )
          : performDivination(
            undefined,
            input.lines,
            input.movingLine,
            input.datetime
          );
      setResult(divinationResult);
      // Dụng Thần: hao number (1-6) or null
      setDungThan(dungThanValue);

      // Update URL if not from initial load
      if (!isInitialLoad) {
        const params = new URLSearchParams();
        if (input.type === "serial") {
          params.set("t", "s");
          params.set("q", input.serial);
        } else {
          params.set("t", "m");
          params.set("q", input.lines.join(""));
        }

        if (input.movingLine) {
          params.set("ml", input.movingLine);
        }

        if (input.datetime) {
          params.set("dt", input.datetime.toISOString());
        }

        // Dụng Thần không được lưu vào URL khi lập quẻ (chỉ được chọn sau khi lập quẻ)
        // URL sẽ được cập nhật khi user click vào hào để chọn Dụng Thần

        window.history.pushState({}, "", `?${params.toString()}`);
      }
    } catch (error) {
      if (!isInitialLoad) throw error;
      console.error("Failed to perform initial divination from URL:", error);
    }
  };

  const handleLineClick = (haoNumber) => {
    if (!haoNumber || !result) return;

    // Chọn Dụng Thần: chỉ được chọn DUY NHẤT 1 hào
    // Nếu click vào hào đã được chọn → bỏ chọn
    // Nếu click vào hào khác → chọn hào mới (hủy hào cũ)
    setDungThan((prevDungThanHao) => {
      const isSelected = prevDungThanHao === haoNumber;
      const newDungThanHao = isSelected ? null : haoNumber;

      // Update URL
      const params = new URLSearchParams(window.location.search);
      if (newDungThanHao) {
        params.set("dtu", newDungThanHao.toString());
      } else {
        params.delete("dtu");
      }
      window.history.pushState({}, "", `?${params.toString()}`);

      // Show message
      if (isSelected) {
        message.info(`Đã bỏ chọn Dụng Thần (Hào ${haoNumber})`);
      } else {
        message.success(`Đã chọn Hào ${haoNumber} làm Dụng Thần`);
      }

      return newDungThanHao;
    });
  };

  const handleStartEdit = () => {
    if (!result || !result.metadata) return;
    const { yearCanChi, monthCanChi, dayCanChi } = result.metadata;
    const [yearCan, yearChi] = yearCanChi.split(" ");
    const [monthCan, monthChi] = monthCanChi.split(" ");
    const [dayCan, dayChi] = dayCanChi.split(" ");

    setEditMetadata({
      yearCan,
      yearChi,
      monthCan,
      monthChi,
      dayCan,
      dayChi,
    });
    setIsEditingCanChi(true);
  };

  const handleSaveEdit = () => {
    if (!editMetadata || !result) return;
    const newMetadata = {
      ...result.metadata,
      yearCanChi: `${editMetadata.yearCan} ${editMetadata.yearChi}`,
      monthCanChi: `${editMetadata.monthCan} ${editMetadata.monthChi}`,
      dayCanChi: `${editMetadata.dayCan} ${editMetadata.dayChi}`,
    };
    setResult({
      ...result,
      metadata: newMetadata,
    });
    setIsEditingCanChi(false);
    message.success("Đã cập nhật Can Chi");
  };

  const handleCancelEdit = () => {
    setIsEditingCanChi(false);
    setEditMetadata(null);
  };

  return (
    <div className="min-h-screen bg-parchment-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Input Form */}
        <div className="mb-8">
          <DivinationForm onDivinate={handleDivinate} />
        </div>

        {/* Thời gian lập quẻ & Can Chi (Dương lịch + Âm lịch) + Thái tuế / Nguyệt lệnh / Nhật lệnh */}
        {result && result.metadata && (
          <div className="mb-6">
            <Card className="bg-parchment-50 border-2 border-parchment-300 relative group">
              <div className="absolute top-2 right-2">
                {!isEditingCanChi ? (
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={handleStartEdit}
                    type="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Sửa Can Chi
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      icon={<CheckOutlined />}
                      size="small"
                      type="primary"
                      onClick={handleSaveEdit}
                    >
                      Lưu
                    </Button>
                    <Button
                      icon={<CloseOutlined />}
                      size="small"
                      onClick={handleCancelEdit}
                    >
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
              <div className="text-sm grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4">
                <div>
                  <span className="font-semibold">Thời gian lập quẻ:</span>{" "}
                  <span>{result.metadata.thoiGianDuong}</span>
                </div>
                <div>
                  <span className="font-semibold">Theo Âm Lịch:</span>{" "}
                  <span>{result.metadata.thoiGianAm}</span>
                </div>
                <div className="sm:col-span-1" />

                {/* Ngày */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold shrink-0">Ngày:</span>
                  {isEditingCanChi ? (
                    <div className="flex gap-1 items-center">
                      <Select
                        size="small"
                        className="w-20"
                        value={editMetadata.dayCan}
                        onChange={(val) =>
                          setEditMetadata({ ...editMetadata, dayCan: val })
                        }
                      >
                        {HEAVENLY_STEMS.map((s) => (
                          <Select.Option key={s} value={s}>
                            {s}
                          </Select.Option>
                        ))}
                      </Select>
                      <Select
                        size="small"
                        className="w-20"
                        value={editMetadata.dayChi}
                        onChange={(val) =>
                          setEditMetadata({ ...editMetadata, dayChi: val })
                        }
                      >
                        {EARTHLY_BRANCHES.map((b) => (
                          <Select.Option key={b} value={b}>
                            {b}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                  ) : (
                    <>
                      {renderCanChiWithNguHanh(result.metadata.dayCanChi)}
                      {(() => {
                        const dtDiaChi = getDungThanDiaChi(result, dungThan);
                        const dayDiaChi = getDiaChiFromCanChi(
                          result.metadata.dayCanChi
                        );
                        if (dtDiaChi && dayDiaChi && dtDiaChi === dayDiaChi) {
                          return (
                            <span className="text-green-700 font-bold">
                              (Nhật lệnh)
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </>
                  )}
                </div>

                {/* Tháng */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold shrink-0">Tháng:</span>
                  {isEditingCanChi ? (
                    <div className="flex gap-1 items-center">
                      <Select
                        size="small"
                        className="w-20"
                        value={editMetadata.monthCan}
                        onChange={(val) =>
                          setEditMetadata({ ...editMetadata, monthCan: val })
                        }
                      >
                        {HEAVENLY_STEMS.map((s) => (
                          <Select.Option key={s} value={s}>
                            {s}
                          </Select.Option>
                        ))}
                      </Select>
                      <Select
                        size="small"
                        className="w-20"
                        value={editMetadata.monthChi}
                        onChange={(val) =>
                          setEditMetadata({ ...editMetadata, monthChi: val })
                        }
                      >
                        {EARTHLY_BRANCHES.map((b) => (
                          <Select.Option key={b} value={b}>
                            {b}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                  ) : (
                    <>
                      {renderCanChiWithNguHanh(result.metadata.monthCanChi)}
                      {(() => {
                        const dtDiaChi = getDungThanDiaChi(result, dungThan);
                        const monthDiaChi = getDiaChiFromCanChi(
                          result.metadata.monthCanChi
                        );
                        if (
                          dtDiaChi &&
                          monthDiaChi &&
                          dtDiaChi === monthDiaChi
                        ) {
                          return (
                            <span className="text-green-700 font-bold">
                              (Nguyệt lệnh)
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </>
                  )}
                </div>

                {/* Năm */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold shrink-0">Năm:</span>
                  {isEditingCanChi ? (
                    <div className="flex gap-1 items-center">
                      <Select
                        size="small"
                        className="w-20"
                        value={editMetadata.yearCan}
                        onChange={(val) =>
                          setEditMetadata({ ...editMetadata, yearCan: val })
                        }
                      >
                        {HEAVENLY_STEMS.map((s) => (
                          <Select.Option key={s} value={s}>
                            {s}
                          </Select.Option>
                        ))}
                      </Select>
                      <Select
                        size="small"
                        className="w-20"
                        value={editMetadata.yearChi}
                        onChange={(val) =>
                          setEditMetadata({ ...editMetadata, yearChi: val })
                        }
                      >
                        {EARTHLY_BRANCHES.map((b) => (
                          <Select.Option key={b} value={b}>
                            {b}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                  ) : (
                    <>
                      {renderCanChiWithNguHanh(result.metadata.yearCanChi)}
                      {(() => {
                        const dtDiaChi = getDungThanDiaChi(result, dungThan);
                        const yearDiaChi = getDiaChiFromCanChi(
                          result.metadata.yearCanChi
                        );
                        if (dtDiaChi && yearDiaChi && dtDiaChi === yearDiaChi) {
                          return (
                            <span className="text-green-700 font-bold">
                              (Thái tuế)
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Main Hexagram Display - 3 Columns */}
        {result && (
          <div className="mb-8">
            <div
              className={`grid gap-6 ${result.movingLine ? "grid-cols-3" : "grid-cols-3"
                }`}
            >
              {/* Quẻ Gốc (Original Hexagram) */}
              <HexagramColumn
                hexagram={result.originalHexagram}
                title=""
                movingLine={result.movingLine}
                dungThan={dungThan}
                onLineClick={handleLineClick}
              />

              {/* Quẻ Hỗ / Đại Quá (Mutual Hexagram) - chỉ hiển thị khi có hào động */}
              {result.movingLine > 0 ? (
                <HexagramColumn
                  hexagram={result.mutualHexagram}
                  title=""
                  scale={0.8}
                />
              ) : null}

              {/* Quẻ Biến (Changed Hexagram) */}
              {result.changedHexagram && (
                <HexagramColumn hexagram={result.changedHexagram} title="" />
              )}
            </div>
          </div>
        )}

        {/* Interpretation Tables */}
        {result && result.originalHexagram && (
          <InterpretationTables
            originalHexagram={result.originalHexagram}
            changedHexagram={result.changedHexagram}
            movingLine={result.movingLine}
            dungThan={dungThan}
            metadata={result.metadata}
          />
        )}

        {/* Ngũ Hành Table */}
        {/* <NguHanhTable /> */}
      </div>
    </div>
  );
}

export default App;
