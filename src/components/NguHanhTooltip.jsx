import React from "react";
import nguHanhRelations from "../data/nguHanhRelations.json";

const NguHanhTooltip = ({ nguHanhName }) => {
  const rel = nguHanhRelations[nguHanhName];
  if (!rel) return <span>{nguHanhName}</span>;

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

export default NguHanhTooltip;
