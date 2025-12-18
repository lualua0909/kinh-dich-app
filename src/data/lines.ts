/**
 * Line (Hào) interpretation data
 * Contains information for each line in the hexagram
 */

import { HEXAGRAMS } from "./hexagrams";

export interface LineData {
  hao: number; // 1-6
  theUng: string; // Thế ứng
  lucThan: string; // Lục Thân (Six Relations)
  canChi: string; // Can Chi
  lucTu: string; // Lục Tú (Six Animals)
  phucThan: string; // Phục thần
  tuanKhong: string; // Tuần không
}

/**
 * Generate line data for a hexagram
 * This is a simplified version - in real practice, this would be more complex
 */
export function generateLineData(hexagramId: number): LineData[] {
  const lines: LineData[] = [];

  const lucThanOptions = [
    "Phụ Mẫu",
    "Huynh Đệ",
    "Tử Tôn",
    "Thê Tài",
    "Quan Quỷ",
    "Thế"
  ];
  const canChiOptions = [
    "Giáp Tý",
    "Ất Sửu",
    "Bính Dần",
    "Đinh Mão",
    "Mậu Thìn",
    "Kỷ Tỵ"
  ];
  const lucTuOptions = [
    "Thanh Long",
    "Chu Tước",
    "Câu Trần",
    "Đằng Xà",
    "Bạch Hổ",
    "Huyền Vũ"
  ];
  // Phục thần và Tuần không - cần logic phức tạp hơn, tạm thời để placeholder
  const phucThanOptions = ["", "", "", "", "", ""];
  const tuanKhongOptions = ["", "", "", "", "", ""];

  // Vị trí Thế / Ứng cho từng quẻ (có thể mở rộng thêm)
  // Key: tên quẻ tiếng Việt (vietnameseName trong hexagrams.ts)
  const hexagramTheUngByName: Record<
    string,
    {
      the: number;
      ung: number;
    }
  > = {
    // Nhóm Thuần Ly (hình trên)
    "BÁT THUẦN LY": { the: 6, ung: 3 },
    "HỎA SƠN LỮ": { the: 6, ung: 3 },
    "HỎA PHONG ĐỈNH": { the: 6, ung: 5 },
    "HỎA THỦY VỊ TẾ": { the: 4, ung: 3 },
    "SƠN THỦY MÔNG": { the: 4, ung: 2 },
    "PHONG THỦY HOÁN": { the: 5, ung: 1 },
    "THIÊN THỦY TỤNG": { the: 2, ung: 5 },
    "THIÊN HỎA ĐỒNG NHÂN": { the: 3, ung: 6 },

    // Nhóm tượng Khôn - Ngũ hành Thổ (hình giữa)
    "BÁT THUẦN KHÔN": { the: 6, ung: 3 },
    "ĐỊA LÔI PHỤC": { the: 1, ung: 4 },
    "ĐỊA TRẠCH LÂM": { the: 1, ung: 4 },
    "ĐỊA THIÊN THÁI": { the: 4, ung: 3 },
    "LÔI THIÊN ĐẠI TRÁNG": { the: 4, ung: 2 },
    "TRẠCH THIÊN QUẢI": { the: 5, ung: 1 },
    "THỦY THIÊN NHU": { the: 4, ung: 1 },

    // Hình dưới
    "THỦY ĐỊA TỶ": { the: 3, ung: 6 },

    "BÁT THUẦN CÀN": { the: 6, ung: 3 },
    "BÁT THUẦN ĐOÀI": { the: 6, ung: 3 },
    "BÁT THUẦN TỐN": { the: 6, ung: 5 },
    "BÁT THUẦN CHẤN": { the: 6, ung: 3 },
    "THIÊN PHONG CẤU": { the: 1, ung: 4 },
    "THIÊN SƠN ĐỘN": { the: 2, ung: 5 },
    "THIÊN ĐỊA BỈ": { the: 3, ung: 6 },
    "PHONG ĐỊA QUAN": { the: 4, ung: 1 },
    "SƠN ĐỊA BÁC": { the: 5, ung: 2 },
    "HỎA ĐỊA TẤN": { the: 4, ung: 1 },
    "HỎA THIÊN ĐẠI HỮU": { the: 3, ung: 6 },
    "TRẠCH THỦY KHỐN": { the: 1, ung: 4 },
    "TRẠCH ĐỊA TUỴ": { the: 2, ung: 5 },
    "TRẠCH SƠN HÀM": { the: 3, ung: 6 },
    "THỦY SƠN KIỂN": { the: 4, ung: 1 },
    "ĐỊA SƠN KHIÊM": { the: 5, ung: 2 },
    "LÔI SƠN TIỂU QUÁ": { the: 4, ung: 1 },
    "LÔI TRẠCH QUY MUỘI": { the: 3, ung: 6 },
    "LÔI ĐỊA DỰ": { the: 1, ung: 4 },
    "LÔI THỦY GIẢI": { the: 2, ung: 5 },
    "LÔI PHONG HẰNG": { the: 3, ung: 6 },
    "ĐỊA PHONG THĂNG": { the: 4, ung: 1 },
    "THỦY PHONG TỈNH": { the: 5, ung: 2 },
    "TRẠCH PHONG ĐẠI QUÁ": { the: 4, ung: 1 },
    "TRẠCH LÔI TÙY": { the: 3, ung: 6 },
    "PHONG THIÊN TIỂU SÚC": { the: 1, ung: 4 },
    "PHONG HỎA GIA NHÂN": { the: 2, ung: 5 },
    "PHONG LÔI ÍCH": { the: 3, ung: 6 },
    "THIÊN LÔI VÔ VỌNG": { the: 4, ung: 1 },
    "HỎA LÔI PHỆ HẠP": { the: 5, ung: 2 },
    "SƠN LÔI DI": { the: 4, ung: 1 },
    "SƠN PHONG CỔ": { the: 3, ung: 6 },
    "BÁT THUẦN KHẢM": { the: 6, ung: 3 },
    "THỦY TRẠCH TIẾT": { the: 1, ung: 4 },
    "THỦY LÔI TRUÂN": { the: 2, ung: 5 },
    "THỦY HỎA KÝ TẾ": { the: 3, ung: 6 },
    "TRẠCH HỎA CÁCH": { the: 4, ung: 1 },
    "LÔI HỎA PHONG": { the: 5, ung: 2 },
    "ĐỊA HỎA MINH DI": { the: 4, ung: 1 },
    "ĐỊA THỦY SƯ": { the: 3, ung: 6 }
  };

  // Tìm quẻ theo id để áp dụng vị trí Thế / Ứng
  const hexagram =
    Object.values(HEXAGRAMS).find((h) => h.id === hexagramId) || null;

  const defaultThe = 6;
  const defaultUng = 3;

  const config =
    (hexagram && hexagramTheUngByName[hexagram.vietnameseName]) || null;

  const theHao = config?.the || defaultThe;
  const ungHao = config?.ung || defaultUng;

  const theUngMapForHexagram: Record<number, number> = {};
  if (theHao) theUngMapForHexagram[theHao] = 1;
  if (ungHao) theUngMapForHexagram[ungHao] = 2;

  for (let i = 1; i <= 6; i++) {
    const index = (hexagramId + i - 1) % 6;

    lines.push({
      hao: i,
      theUng: theUngMapForHexagram[i]?.toString() || "",
      lucThan: lucThanOptions[index],
      canChi: canChiOptions[index],
      lucTu: lucTuOptions[index],
      phucThan: phucThanOptions[index] || "",
      tuanKhong: tuanKhongOptions[index] || ""
    });
  }

  return lines;
}
