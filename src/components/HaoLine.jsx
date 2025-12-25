import React from "react";

const HaoLine = ({
  lineType,
  isMoving,
  isDungThan = false,
  isNguyenThan = false,
  isKyThan = false,
  isCuuThan = false,
  isTietThan = false,
  isAmDong = false
}) => {
  const isYang = lineType === 1;
  const lineColor = isMoving ? "bg-red-600" : isAmDong ? "bg-purple-600" : "bg-gray-800";

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="flex items-center justify-center">
        {isYang ? (
          <div className={`h-2 w-12 ${lineColor} rounded-full`} />
        ) : (
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

export default HaoLine;
