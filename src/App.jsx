import React, { useState } from "react";
import { Card, Tooltip } from "antd";
import { performDivination } from "./utils/divination";
import { generateLineData } from "./data/lines";
import DivinationForm from "./components/DivinationForm";
import HexagramColumn from "./components/HexagramColumn";
import InterpretationTables from "./components/InterpretationTables";
import NguHanhTable from "./components/NguHanhTable";
import "./App.css";

// Ngũ hành theo Địa Chi (dùng cho tooltip)
const nguHanhRelations = {
  Mộc: {
    sinh: "Hỏa",
    duocSinh: "Thủy",
    khac: "Thổ",
    biKhac: "Kim",
  },
  Hỏa: {
    sinh: "Thổ",
    duocSinh: "Mộc",
    khac: "Kim",
    biKhac: "Thủy",
  },
  Thổ: {
    sinh: "Kim",
    duocSinh: "Hỏa",
    khac: "Thủy",
    biKhac: "Mộc",
  },
  Kim: {
    sinh: "Thủy",
    duocSinh: "Thổ",
    khac: "Mộc",
    biKhac: "Hỏa",
  },
  Thủy: {
    sinh: "Mộc",
    duocSinh: "Kim",
    khac: "Hỏa",
    biKhac: "Thổ",
  },
};

const nguHanhFromDiaChi = {
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

const renderCanChiWithNguHanh = (canChi) => {
  if (!canChi) return "-";
  const parts = canChi.split(" ");
  const diaChi = parts[parts.length - 1];
  const nguHanh = nguHanhFromDiaChi[diaChi];

  return (
    <span>
      {canChi}
      {nguHanh && (
        <Tooltip
          title={renderNguHanhTooltip(nguHanh.name)}
          placement="top"
          overlayClassName="tooltip-custom"
        >
          <span
            className={`ml-2 text-xs px-2 py-0.5 rounded ${nguHanh.color} font-semibold cursor-help`}
          >
            {nguHanh.name}
          </span>
        </Tooltip>
      )}
    </span>
  );
};

const getDiaChiFromCanChi = (canChi) => {
  if (!canChi) return null;
  const parts = canChi.split(" ");
  return parts[parts.length - 1] || null;
};

function App() {
  const [result, setResult] = useState(null);
  const [dungThan, setDungThan] = useState(null);

  const handleDivinate = (input, dungThanValue) => {
    try {
      const divinationResult =
        input.type === "serial"
          ? performDivination(input.serial)
          : performDivination(undefined, input.lines, input.movingLine);
      setResult(divinationResult);
      setDungThan(dungThanValue || null);
    } catch (error) {
      throw error;
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
                    (line) => line.lucThan === dungThan
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
              className={`grid gap-6 ${
                result.movingLine
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
          />
        )}

        {/* Ngũ Hành Table */}
        {/* <NguHanhTable /> */}
      </div>
    </div>
  );
}

export default App;
