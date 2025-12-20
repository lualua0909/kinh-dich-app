import React, { useState } from "react";
import { Card, Tooltip, Modal } from "antd";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import Line from "./Line";
import { getHexagramMeaningCached, useHexagramMeanings } from "../hooks/useHexagramMeanings";
import { getHexagramOmen } from "../data/hexagramOmens";
import { useHexagramLines } from "../hooks/useHexagramLines";

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

  // Chuẩn hoá dữ liệu hào: mảng từ trên xuống (hào 6 → hào 1)
  const normalizedLines = useHexagramLines(hexagram, movingLine, dungThan);
  // Key dạng "upper-lower" giống trong HEXAGRAMS / hexagramNames
  const hexagramKey = `${hexagram.upperTrigram}-${hexagram.lowerTrigram}`;
  const omen = getHexagramOmen(hexagramKey);
  // Load hexagram meanings and get from cache
  const meaningsReady = useHexagramMeanings();
  const meaning = meaningsReady ? getHexagramMeaningCached(hexagramKey) : null;

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

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
            title="Click để xem chi tiết"
            placement="top"
          >
            <motion.div
              className="text-2xl font-bold text-gray-900 mb-4 cursor-pointer hover:text-blue-600 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={openModal}
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
            {normalizedLines.map((info, index) => {
              const { hao, lineType, lineData, isMoving, isDungThan } = info;

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
                    haoNumber={hao}
                    lineData={lineData}
                    isDungThan={isDungThan}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Modal hiển thị thông tin quẻ */}
      <Modal
        title={
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 m-0">
              {hexagram.vietnameseName}
            </h2>
            {omen && (
              <p className="text-sm text-amber-700 mt-2 italic">
                Điềm: {omen}
              </p>
            )}
          </div>
        }
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={window.innerWidth < 640 ? "90%" : "70%"}
        className="hexagram-modal"
      >
        <div className="prose prose-sm max-w-none text-gray-700">
          {meaning ? (
            <ReactMarkdown>{meaning}</ReactMarkdown>
          ) : (
            <p className="text-gray-500 italic">
              Ý nghĩa quẻ này đang được cập nhật...
            </p>
          )}
        </div>
      </Modal>
    </motion.div>
  );
}
