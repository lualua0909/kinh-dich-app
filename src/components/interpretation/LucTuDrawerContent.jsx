import React from "react";
import ReactMarkdown from "react-markdown";
import { 
  getLucTuName, 
  getLucThanName, 
  LUC_TU_CODES, 
  LUC_TU_ICONS, 
  LUC_THAN_CODES,
  thanhLongLucThanInfo,
  bachHoLucThanInfo,
  cauTranLucThanInfo,
  chuTuocLucThanInfo,
  dangXaLucThanInfo,
  huyenVuLucThanInfo,
  thanhLongDiaChiInfo,
  bachHoDiaChiInfo,
  huyenVuDiaChiInfo,
  dangXaDiaChiInfo,
  chuTuocDiaChiInfo,
  cauTranDiaChiInfo
} from "../../data/lucThuInfo";
import { extractDiaChi, DIA_CHI_CODES, DIA_CHI_ICONS } from "../../utils/diaChi";
import lucTuInfo from "../../data/lucTuInfo.json";

const LucTuDrawerContent = ({ lucTu, record }) => {
  if (!lucTu) return null;
  const lucTuName = getLucTuName(lucTu);
  const lucTuCode = LUC_TU_CODES[lucTuName] || lucTu;
  const info = lucTuInfo[lucTuCode];
  const lucThan = record?.lucThan;
  const lucThanName = getLucThanName(lucThan);
  const lucThanCode = LUC_THAN_CODES[lucThanName] || lucThan || "";

  const diaChi = extractDiaChi(record?.canChi);
  const diaChiCode = DIA_CHI_CODES[diaChi] || diaChi || "";

  const getClsThan = () => {
    if (!lucTuCode || !lucThanCode) return null;
    const tuIcon = LUC_TU_ICONS[lucTuCode] || "";
    return { label: `${tuIcon}${lucTuName} lâm ${lucThanName}`, code: `${lucTuCode}-${lucThanCode}` };
  };

  const getClsDiaChi = () => {
    if (!lucTuCode || !diaChiCode) return null;
    const tuIcon = LUC_TU_ICONS[lucTuCode] || "";
    const chiIcon = DIA_CHI_ICONS[diaChiCode] || "";
    return { label: `${tuIcon}${lucTuName} lâm ${chiIcon}${diaChi}`, code: `${lucTuCode}-${diaChiCode}` };
  };

  const clsThan = getClsThan();
  const clsDiaChi = getClsDiaChi();

  let diaChiExtraText = null;
  if (lucTuCode === "TL") diaChiExtraText = thanhLongDiaChiInfo[diaChiCode];
  else if (lucTuCode === "BH") diaChiExtraText = bachHoDiaChiInfo[diaChiCode];
  else if (lucTuCode === "CTr") diaChiExtraText = cauTranDiaChiInfo[diaChiCode];
  else if (lucTuCode === "CT") diaChiExtraText = chuTuocDiaChiInfo[diaChiCode];
  else if (lucTuCode === "DX") diaChiExtraText = dangXaDiaChiInfo[diaChiCode];
  else if (lucTuCode === "HV") diaChiExtraText = huyenVuDiaChiInfo[diaChiCode];

  const lucThanExtraInfo = {
    TL: thanhLongLucThanInfo[lucThanCode],
    BH: bachHoLucThanInfo[lucThanCode],
    CTr: cauTranLucThanInfo[lucThanCode],
    CT: chuTuocLucThanInfo[lucThanCode],
    DX: dangXaLucThanInfo[lucThanCode],
    HV: huyenVuLucThanInfo[lucThanCode],
  }[lucTuCode];

  return (
    <div className="space-y-4 text-sm">
      {info && (
        <>
          {(clsThan || clsDiaChi) && (
            <div className="pt-4 border-t border-gray-300 space-y-3">
              {clsThan && (
                <div>
                  <div className="font-semibold">{clsThan.label}</div>
                  {lucThanExtraInfo && (
                    <div className="mt-2 text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none">
                      <ReactMarkdown>{lucThanExtraInfo}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
              {clsDiaChi && (
                <div>
                  <div className="font-semibold">{clsDiaChi.label}</div>
                  {diaChiExtraText && (
                    <div className="mt-2 text-xs leading-relaxed text-gray-700 prose prose-sm max-w-none">
                      <ReactMarkdown>{diaChiExtraText}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {info.content && (
            <div className="pt-4 border-t border-gray-300">
              <div className="leading-relaxed text-gray-800 prose prose-sm max-w-none">
                <ReactMarkdown>{info.content}</ReactMarkdown>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LucTuDrawerContent;
