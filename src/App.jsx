import React, { useState, useEffect } from "react";
import { Card, Tooltip } from "antd";
import { performDivination } from "./utils/divination";
import { generateLineData } from "./data/lines";
import DivinationForm from "./components/DivinationForm";
import HexagramColumn from "./components/HexagramColumn";
import InterpretationTables from "./components/InterpretationTables";
import NguHanhTable from "./components/NguHanhTable";
import "./App.css";
import { LUC_THAN_CODES } from "./data/lucThuInfo";
import { initializeDataMigrations } from "./utils/dataMigration";
import { DIA_CHI_CODES, DIA_CHI_ICONS } from "./utils/diaChi";

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
  TY: { name: "Thủy", color: "text-blue-600 bg-blue-50" },
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
    <span>
      {diaChiCode && DIA_CHI_ICONS[diaChiCode] && (
        <span className="mr-1">{DIA_CHI_ICONS[diaChiCode]}</span>
      )}
      {canChi}
      {nguHanh && (
        <Tooltip
          title={renderNguHanhTooltip(nguHanh.name)}
          placement="top"
          overlayClassName="tooltip-custom"
        >
          <span
            className={`ml-2 text-xs px-2 py-0.5 rounded ${nguHanh.color} font-semibold cursor-help flex items-center gap-1`}
          >
            <span>{nguHanhRelations[nguHanh.name]?.icon}</span>
            <span>{nguHanh.name}</span>
          </span>
        </Tooltip>
      )}
    </span>
  );
};

const getDiaChiFromCanChi = (canChi) => {
  if (!canChi) return null;
  const parts = canChi.split(" ");
  return parts[1];
};

function App() {
  const [result, setResult] = useState(null);
  const [dungThan, setDungThan] = useState(null);

  // Initialize IndexedDB migrations on app start
  useEffect(() => {
    initializeDataMigrations().catch((error) => {
      console.error("Failed to initialize data migrations:", error);
    });

    // Parse URL on load
    const params = new URLSearchParams(window.location.search);
    const type = params.get("t"); // 's' for serial, 'm' for manual
    const query = params.get("q"); // serial or lines
    const movingLineParam = params.get("ml");
    const datetimeParam = params.get("dt");
    const dungThanParam = params.get("dtu");

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

      handleDivinate(input, dungThanParam, true);
    }
  }, []);

  const handleDivinate = (input, dungThanValue, isInitialLoad = false) => {
    try {
      const divinationResult =
        input.type === "serial"
          ? performDivination(input.serial, undefined, undefined, input.datetime)
          : performDivination(
            undefined,
            input.lines,
            input.movingLine,
            input.datetime
          );
      setResult(divinationResult);
      setDungThan(dungThanValue || null);

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

        if (dungThanValue) {
          params.set("dtu", dungThanValue);
        }

        window.history.pushState({}, "", `?${params.toString()}`);
      }
    } catch (error) {
      if (!isInitialLoad) throw error;
      console.error("Failed to perform initial divination from URL:", error);
    }
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
            <Card className="bg-parchment-50 border-2 border-parchment-300">
              <div className="text-sm grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4">
                <div>
                  <span className="font-semibold">Thời gian lập quẻ:</span>{" "}
                  <span>{result.metadata.thoiGianDuong}</span>
                </div>
                <div>
                  <span className="font-semibold">Theo Âm Lịch:</span>{" "}
                  <span>{result.metadata.thoiGianAm}</span>
                </div>
                <br />
                <div>
                  <span className="font-semibold">Ngày:</span>{" "}
                  {renderCanChiWithNguHanh(result.metadata.dayCanChi)}
                </div>
                <div>
                  <span className="font-semibold">Tháng:</span>{" "}
                  {renderCanChiWithNguHanh(result.metadata.monthCanChi)}
                </div>
                <div>
                  <span className="font-semibold">Năm:</span>{" "}
                  {renderCanChiWithNguHanh(result.metadata.yearCanChi)}
                </div>
              </div>

              {/* Thái tuế / Nguyệt lệnh / Nhật lệnh */}
              {dungThan &&
                result.originalHexagram &&
                (() => {
                  const lineData = generateLineData(
                    result.originalHexagram.id,
                    result.movingLine
                  );
                  const dungThanLine = lineData.find(
                    (line) => line.lucThan === LUC_THAN_CODES[dungThan]
                  );
                  const dungThanDiaChi = dungThanLine
                    ? getDiaChiFromCanChi(dungThanLine.canChi)
                    : null;
                  const yearDiaChi = getDiaChiFromCanChi(
                    result.metadata.yearCanChi
                  );
                  const monthDiaChi = getDiaChiFromCanChi(
                    result.metadata.monthCanChi
                  );
                  const dayDiaChi = getDiaChiFromCanChi(
                    result.metadata.dayCanChi
                  );

                  const isThaiTue =
                    dungThanDiaChi &&
                    yearDiaChi &&
                    dungThanDiaChi === yearDiaChi;
                  const isNguyetLenh =
                    dungThanDiaChi &&
                    monthDiaChi &&
                    dungThanDiaChi === monthDiaChi;
                  const isNhatLenh =
                    dungThanDiaChi && dayDiaChi && dungThanDiaChi === dayDiaChi;
                  if (
                    !dungThanDiaChi ||
                    (!isThaiTue && !isNguyetLenh && !isNhatLenh)
                  ) {
                    return null;
                  }

                  return (
                    <div className="mt-3 pt-2 border-t border-parchment-300 text-sm grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4">
                      {isThaiTue && (
                        <div>
                          <span className="font-semibold">Thái tuế:</span>{" "}
                          <span className="text-green-700">
                            Trùng {yearDiaChi ? `(${yearDiaChi})` : ""}
                          </span>
                        </div>
                      )}
                      {isNguyetLenh && (
                        <div>
                          <span className="font-semibold">Nguyệt lệnh:</span>{" "}
                          <span className="text-green-700">
                            Trùng {monthDiaChi ? `(${monthDiaChi})` : ""}
                          </span>
                        </div>
                      )}
                      {isNhatLenh && (
                        <div>
                          <span className="font-semibold">Nhật lệnh:</span>{" "}
                          <span className="text-green-700">
                            Trùng {dayDiaChi ? `(${dayDiaChi})` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
            </Card>
          </div>
        )}

        {/* Main Hexagram Display - 3 Columns */}
        {result && (
          <div className="mb-8">
            <div
              className={`grid gap-6 ${result.movingLine
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2"
                }`}
            >
              {/* Quẻ Gốc (Original Hexagram) */}
              <HexagramColumn
                hexagram={result.originalHexagram}
                title=""
                movingLine={result.movingLine}
                dungThan={dungThan}
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
