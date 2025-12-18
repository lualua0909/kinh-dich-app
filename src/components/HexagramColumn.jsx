import React from "react";
import { Card, Tooltip } from "antd";
import { motion } from "framer-motion";
import Line from "./Line";
import { generateLineData } from "../data/lines";
import { getHexagramMeaning } from "../data/hexagramMeanings";
import { getHexagramOmen } from "../data/hexagramOmens";
import { getLucThanName } from "../data/lucThuInfo";

/**
 * HexagramColumn component - displays a hexagram in a vertical column
 * @param {Object} hexagram - hexagram data
 * @param {string} title - column title (e.g., "Quẻ Gốc")
 * @param {number} movingLine - which line is moving (1-6), optional
 * @param {string} dungThan - dụng thần selected, optional
 * @param {number} scale - visual scale factor (1 = 100%), optional
 */
export default function HexagramColumn({
  hexagram,
  title,
  movingLine = null,
  dungThan = null,
  scale = 1
}) {
  if (!hexagram) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md mx-auto bg-parchment-50 border-2 border-parchment-300">
          <div className="text-center text-gray-500 py-8">Chưa có dữ liệu</div>
        </Card>
      </motion.div>
    );
  }

  // Lines are stored from bottom to top (hào 1 to hào 6)
  // But we display from top to bottom, so reverse the array
  const lines = [...hexagram.lines].reverse();

  // Generate line data cho tooltip
  const lineDataArray = generateLineData(hexagram.id, movingLine).reverse();
  // Key dạng "upper-lower" giống trong HEXAGRAMS / hexagramNames
  const hexagramKey = `${hexagram.upperTrigram}-${hexagram.lowerTrigram}`;
  const omen = getHexagramOmen(hexagramKey);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale }}
      animate={{ opacity: 1, y: 0, scale }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: scale * 1.02 }}
      className="w-full"
    >
      <Card
        className="w-full max-w-md mx-auto bg-gradient-to-br from-parchment-50 to-parchment-100 border-2 border-parchment-300 shadow-xl hover:shadow-2xl transition-shadow duration-300"
        title={null}
      >
        <div className="text-center space-y-3">
          {/* Hexagram Name */}
          <Tooltip
            title={
              <div className="max-w-md">
                <div className="font-bold mb-2 text-lg">
                  {hexagram.vietnameseName}
                </div>
                <div className="text-sm leading-relaxed space-y-2">
                  <div>
                    {getHexagramMeaning(hexagramKey) ||
                      "Ý nghĩa quẻ này đang được cập nhật..."}
                  </div>
                  {omen && (
                    <div className="italic text-amber-800">Điềm: {omen}</div>
                  )}
                </div>
              </div>
            }
            placement="top"
            overlayClassName="tooltip-custom"
          >
            <motion.div
              className="text-2xl font-bold text-gray-900 mb-4 cursor-help hover:text-blue-600 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {hexagram.vietnameseName}
            </motion.div>
          </Tooltip>

          {/* Family (Họ quẻ) - tạm ẩn */}
          {false && (
            <motion.div
              className="text-sm text-gray-600 mb-6 px-3 py-1 bg-white rounded-full inline-block border border-parchment-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {hexagram.family}
            </motion.div>
          )}

          {/* Lines - display from top (hào 6) to bottom (hào 1) */}
          <div className="space-y-2 py-4">
            {lines.map((lineType, index) => {
              // index 0 = hào 6, index 5 = hào 1
              const haoNumber = 6 - index;
              const isMoving = movingLine === haoNumber;
              const lineData = lineDataArray[index];
              // Check if this line's Lục Thân matches the selected dụng thần
              const isDungThan =
                dungThan && 
                lineData && 
                getLucThanName(lineData.lucThan) === getLucThanName(dungThan);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Line
                    type={lineType}
                    isMoving={isMoving}
                    haoNumber={haoNumber}
                    lineData={lineData}
                    isDungThan={isDungThan}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
