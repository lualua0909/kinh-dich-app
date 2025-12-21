import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tooltip } from "antd";
import { getLucTuName, getLucThanName } from "../data/lucThuInfo";
import { DIA_CHI_CODES, DIA_CHI_ICONS } from "../utils/diaChi";
import { extractDiaChi } from "./InterpretationTables";

/**
 * Line component - renders a single hào (line)
 * @param {number} type - 1 for Yang (solid), 0 for Yin (broken)
 * @param {boolean} isMoving - whether this is the moving line (hào động)
 * @param {number} haoNumber - line number (1-6)
 * @param {Object} lineData - optional line data for tooltip
 * @param {boolean} isDungThan - whether this line is selected as Dụng Thần
 * @param {Function} onLineClick - callback when line is clicked, receives hao number (1-6), optional
 */
export default function Line({
  type,
  isMoving = false,
  haoNumber,
  lineData = null,
  isDungThan = false,
  onLineClick = null
}) {
  const isYang = type === 1;
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onLineClick) {
      onLineClick(haoNumber);
    }
  };

  const tooltipContent = lineData ? (
    <div className="text-left">
      <div className="font-bold mb-1">Hào {lineData.hao}</div>
      <div className="text-xs">Thế ứng: {lineData.theUng || ""}</div>
      <div className="text-xs">
        Lục Thân: {getLucThanName(lineData.lucThan)}
      </div>
      <div className="text-xs">
        Can Chi: {lineData.canChi}
        {(() => {
          const diaChi = extractDiaChi(lineData.canChi);
          const diaChiCode = DIA_CHI_CODES[diaChi];
          const icon = DIA_CHI_ICONS[diaChiCode];
          return icon ? <span className="ml-1">{icon}</span> : null;
        })()}
      </div>
      <div className="text-xs">
        Lục Thú: {getLucTuName(lineData.lucTu) || ""}
      </div>
      <div className="text-xs">Phục thần: {lineData.phucThan || ""}</div>
      <div className="text-xs">Tuần không: {lineData.tuanKhong || ""}</div>
      {onLineClick && (
        <div className="text-xs text-blue-600 mt-1 italic">
          Click để chọn làm Dụng Thần
        </div>
      )}
    </div>
  ) : (
    <div>
      <div className="font-bold">Hào {haoNumber}</div>
      <div className="text-xs">{isYang ? "Dương (Yang)" : "Âm (Yin)"}</div>
      {isMoving && <div className="text-xs text-red-400">Động</div>}
      {onLineClick && (
        <div className="text-xs text-blue-600 mt-1 italic">
          Click để chọn làm Dụng Thần
        </div>
      )}
    </div>
  );

  const lineContent = (
    <motion.div
      className={`flex items-center justify-center my-2 px-0 md:px-4 py-0 md:py-2 rounded-lg transition-all duration-300 ${
        onLineClick ? "cursor-pointer" : ""
      } ${
        isMoving
          ? "bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 shadow-md"
          : isDungThan
          ? "bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-400 shadow-md"
          : isHovered
          ? "bg-gray-50 border border-gray-200 shadow-sm"
          : "bg-transparent"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isYang ? (
        // Yang line (solid) ———
        <motion.div
          className={`h-4 w-full max-w-[224px] rounded-full ${
            isMoving
              ? "bg-gradient-to-r from-red-500 via-red-600 to-red-500 shadow-lg"
              : isDungThan
              ? "bg-gradient-to-r from-green-500 via-green-600 to-green-500 shadow-lg"
              : "bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 shadow-md"
          }`}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          whileHover={{
            boxShadow: isMoving
              ? "0 0 20px rgba(239, 68, 68, 0.5)"
              : isDungThan
              ? "0 0 20px rgba(34, 197, 94, 0.5)"
              : "0 0 15px rgba(0, 0, 0, 0.3)"
          }}
        />
      ) : (
        // Yin line (broken) — —
        <div className="flex gap-[1px] md:gap-3 items-center w-full max-w-[224px] justify-center">
          <motion.div
            className={`h-4 w-[40%] rounded-full ${
              isMoving
                ? "bg-gradient-to-r from-red-500 via-red-600 to-red-500 shadow-lg"
                : isDungThan
                ? "bg-gradient-to-r from-green-500 via-green-600 to-green-500 shadow-lg"
                : "bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 shadow-md"
            }`}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            whileHover={{
              boxShadow: isMoving
                ? "0 0 20px rgba(239, 68, 68, 0.5)"
                : "0 0 15px rgba(0, 0, 0, 0.3)"
            }}
          />
          <div className="h-4 w-4 bg-transparent flex-shrink-0" />
          <motion.div
            className={`h-4 w-[40%] rounded-full ${
              isMoving
                ? "bg-gradient-to-r from-red-500 via-red-600 to-red-500 shadow-lg"
                : isDungThan
                ? "bg-gradient-to-r from-green-500 via-green-600 to-green-500 shadow-lg"
                : "bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 shadow-md"
            }`}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            whileHover={{
              boxShadow: isMoving
                ? "0 0 20px rgba(239, 68, 68, 0.5)"
                : "0 0 15px rgba(0, 0, 0, 0.3)"
            }}
          />
        </div>
      )}
      {/* Removed "Động" label text for moving lines */}
    </motion.div>
  );

  return (
    <Tooltip
      title={tooltipContent}
      placement="right"
      classNames={{ root: "tooltip-custom" }}
    >
      {lineContent}
    </Tooltip>
  );
}
