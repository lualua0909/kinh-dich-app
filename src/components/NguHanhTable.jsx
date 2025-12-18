import React, { useState } from "react";
import { Card, Tooltip } from "antd";
import { motion } from "framer-motion";

/**
 * Ngũ Hành Table component - displays Five Elements relationships
 */
export default function NguHanhTable() {
  const [collapsed, setCollapsed] = useState(true);

  const nguHanhData = {
    Mộc: {
      name: "Mộc",
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
      tuongSinh: { sinh: "Hỏa", duocSinh: "Thủy" },
      tuongKhac: { khac: "Thổ", biKhac: "Kim" }
    },
    Hỏa: {
      name: "Hỏa",
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      tuongSinh: { sinh: "Thổ", duocSinh: "Mộc" },
      tuongKhac: { khac: "Kim", biKhac: "Thủy" }
    },
    Thổ: {
      name: "Thổ",
      color: "bg-amber-700",
      textColor: "text-amber-800",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      tuongSinh: { sinh: "Kim", duocSinh: "Hỏa" },
      tuongKhac: { khac: "Thủy", biKhac: "Mộc" }
    },
    Kim: {
      name: "Kim",
      color: "bg-yellow-400",
      textColor: "text-yellow-700",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      tuongSinh: { sinh: "Thủy", duocSinh: "Thổ" },
      tuongKhac: { khac: "Mộc", biKhac: "Hỏa" }
    },
    Thủy: {
      name: "Thủy",
      color: "bg-blue-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      tuongSinh: { sinh: "Mộc", duocSinh: "Kim" },
      tuongKhac: { khac: "Hỏa", biKhac: "Thổ" }
    }
  };

  const renderTooltipContent = (element) => {
    const data = nguHanhData[element];
    return (
      <div className="max-w-xs">
        <div className={`font-bold mb-3 text-lg ${data.textColor}`}>
          {data.name}
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold text-green-300">Tương sinh:</span>
            <div className="ml-2 mt-1">
              <div>
                → Sinh ra:{" "}
                <span className="font-bold">{data.tuongSinh.sinh}</span>
              </div>
              <div>
                ← Được sinh bởi:{" "}
                <span className="font-bold">{data.tuongSinh.duocSinh}</span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-400">
            <span className="font-semibold text-red-300">Tương khắc:</span>
            <div className="ml-2 mt-1">
              <div>
                → Khắc: <span className="font-bold">{data.tuongKhac.khac}</span>
              </div>
              <div>
                ← Bị khắc bởi:{" "}
                <span className="font-bold">{data.tuongKhac.biKhac}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="text-center font-bold text-lg text-gray-800 flex-1">
              NGŨ HÀNH TƯƠNG SINH - TƯƠNG KHẮC
            </div>
            <button
              type="button"
              className="ml-4 px-3 py-1 text-xs font-semibold rounded-full border border-gray-300 text-gray-600 bg-white hover:bg-gray-100 transition-colors"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? "Hiển thị" : "Thu gọn"}
            </button>
          </div>
        }
        className="bg-parchment-50 border-2 border-parchment-300"
      >
        {!collapsed && (
          <div className="space-y-6">
            {/* Tương sinh cycle */}
            <div>
              <div className="font-semibold text-gray-700 mb-3 text-center">
                <span className="text-green-600">NGŨ HÀNH TƯƠNG SINH</span>
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {["Kim", "Thủy", "Mộc", "Hỏa", "Thổ"].map((element, index) => {
                  const data = nguHanhData[element];
                  return (
                    <React.Fragment key={element}>
                      <Tooltip
                        title={renderTooltipContent(element)}
                        placement="top"
                      >
                        <motion.div
                          className={`px-4 py-2 rounded-lg ${data.bgColor} ${data.borderColor} border-2 cursor-pointer font-semibold ${data.textColor} shadow-md hover:shadow-lg transition-all`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {element}
                        </motion.div>
                      </Tooltip>
                      {index < 4 && (
                        <span className="text-green-600 font-bold text-xl">
                          →
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="mt-3 text-xs text-gray-600 text-center">
                Kim sinh Thủy → Thủy sinh Mộc → Mộc sinh Hỏa → Hỏa sinh Thổ →
                Thổ sinh Kim
              </div>
            </div>

            {/* Tương khắc cycle */}
            <div>
              <div className="font-semibold text-gray-700 mb-3 text-center">
                <span className="text-red-600">NGŨ HÀNH TƯƠNG KHẮC</span>
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {["Kim", "Mộc", "Thổ", "Thủy", "Hỏa"].map((element, index) => {
                  const data = nguHanhData[element];
                  return (
                    <React.Fragment key={element}>
                      <Tooltip
                        title={renderTooltipContent(element)}
                        placement="top"
                      >
                        <motion.div
                          className={`px-4 py-2 rounded-lg ${data.bgColor} ${data.borderColor} border-2 cursor-pointer font-semibold ${data.textColor} shadow-md hover:shadow-lg transition-all`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {element}
                        </motion.div>
                      </Tooltip>
                      {index < 4 && (
                        <span className="text-red-600 font-bold text-xl">
                          →
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="mt-3 text-xs text-gray-600 text-center">
                Kim khắc Mộc → Mộc khắc Thổ → Thổ khắc Thủy → Thủy khắc Hỏa →
                Hỏa khắc Kim
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
