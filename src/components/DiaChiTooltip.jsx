import React from "react";
import { 
  getNhiHopOf, 
  getNhiXungOf, 
  getTamHopGroupOf, 
  getNhapMoOf, 
  DIA_CHI_NAMES 
} from "../utils/diaChi";

const DiaChiTooltip = ({ diaChi }) => {
  const getName = (code) => DIA_CHI_NAMES[code] || code;

  const nhHop = getNhiHopOf(diaChi);
  const nhXung = getNhiXungOf(diaChi);
  const tamHop = getTamHopGroupOf(diaChi);
  const nhapMo = getNhapMoOf(diaChi);

  return (
    <div className="max-w-xs text-xs space-y-2">
      <div className="font-bold mb-1 text-sm">
        Địa Chi: {getName(diaChi)} ({diaChi})
      </div>
      <div>
        <span className="font-semibold text-green-600">Nhị hợp:</span>{" "}
        {nhHop ? `${getName(nhHop)} (${nhHop})` : "Không có"}
      </div>
      <div>
        <span className="font-semibold text-red-600">Nhị xung:</span>{" "}
        {nhXung ? `${getName(nhXung)} (${nhXung})` : "Không có"}
      </div>
      <div>
        <span className="font-semibold text-blue-600">Tam hợp cục:</span>{" "}
        {tamHop ? tamHop.map(getName).join(" - ") : "Không có"}
      </div>
      <div>
        <span className="font-semibold text-orange-600">Nhập mộ tại:</span>{" "}
        {nhapMo ? `${getName(nhapMo)} (${nhapMo})` : "Không có"}
      </div>
    </div>
  );
};

export default DiaChiTooltip;
