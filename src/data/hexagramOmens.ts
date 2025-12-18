/**
 * Điềm báo ngắn cho một số quẻ (có thể mở rộng thêm sau)
 * Key: tên quẻ tiếng Việt (vietnameseName trong hexagrams.ts)
 */

const HEXAGRAM_OMENS: Record<string, string> = {
  // Nhóm Thuần Ly
  "BÁT THUẦN LY": "Thiên quan tứ phước",
  "HỎA SƠN LỮ": "Tức điều phán sào",
  "HỎA PHONG ĐỈNH": "Ngư ông đắc lợi",
  "HỎA THỦY VỊ TẾ": "Tiêu hồ ngật tế",
  "SƠN THỦY MÔNG": "Tiêu quỷ thần tiên",
  "PHONG THỦY HOÁN": "Cách hà vọng kim",
  "THIÊN THỦY TỤNG": "Nhị nhân tranh lộ",
  "THIÊN HỎA ĐỒNG NHÂN": "Tiên nhân chỉ lộ",

  // Một số quẻ thuộc Nhóm tượng Khôn - Ngũ hành Thổ
  "BÁT THUẦN KHÔN": "Nga hồ đắc thục",
  "ĐỊA LÔI PHỤC": "Phu thê phản mục",
  "ĐỊA TRẠCH LÂM": "Phát chính thi nhân",
  "ĐỊA THIÊN THÁI": "Hỉ báo tam nguyên",
  "LÔI THIÊN ĐẠI TRÁNG": "Cộng sự đắc mộc",
  "TRẠCH THIÊN QUẢI": "Du phong thoát vong",
  "THỦY THIÊN NHU": "Minh châu xuất thổ",

  // Thủy Địa Tỷ (hình dưới)
  "THỦY ĐỊA TỶ": "Thuyền đắc thuận phong",

  "BÁT THUẦN CÀN": "Khốn Long đắc thủy",
  "BÁT THUẦN ĐOÀI": "Lưỡng trạch tương tư",
  "BÁT THUẦN TỐN": "Cô chu đắc thủy",
  "BÁT THUẦN KHẢM": "Khảm vi thủy",
  "BÁT THUẦN CHẤN": "Thiên hạ dương danh",
  "THIÊN PHONG CẤU": "Tha hưởng ngộ hữu",
  "THIÊN SƠN ĐỘN": "Nùng vân tế nhật",
  "THIÊN ĐỊA BỈ": "Hổ lạc hàm khanh",
  "PHONG ĐỊA QUAN": "Hạn Bồng Phùng Hà",
  "SƠN ĐỊA BÁC": "Ứng thuộc đông lâm",
  "HỎA ĐỊA TẤN": "Sử địa đắc kim",
  "HỎA THIÊN ĐẠI HỮU": "Nhuỵễn mộc nộ tước",
  "TRẠCH THỦY KHỐN": "Loát hãn du thê",
  "TRẠCH ĐỊA TUỴ": "Ngự hóa vi Long",
  "TRẠCH SƠN HÀM": "Nanh Nha xuất thổ",
  "THỦY SƠN KIỂN": "Vũ tuyết tài đổ",
  "ĐỊA SƠN KHIÊM": "Nhị nhân phân kim",
  "LÔI SƠN TIỂU QUÁ": "Phi điểu di âm",
  "LÔI TRẠCH QUY MUỘI": "Duyên Mộc câu ngư",
  "LÔI ĐỊA DỰ": "Thanh Long đắc vị",
  "LÔI THỦY GIẢI": "Ngũ quan thoát nạn",
  "LÔI PHONG HẰNG": "Ngư lai chòng võng",
  "ĐỊA PHONG THĂNG": "Chỉ nhật cao thăng",
  "THỦY PHONG TỈNH": "Khê tĩnh sinh tuyền",
  "TRẠCH PHONG ĐẠI QUÁ": "Dạ mộng kim ngân",
  "TRẠCH LÔI TÙY": "Suy xa khảo nha",
  "THỦY TRẠCH TIẾT": "Hải đề lao nguyệt",
  "THỦY LÔI TRUÂN": "Trảm tướng phong thần",
  "THỦY HỎA KÝ TẾ": "Loạn tu vô đầu",
  "TRẠCH HỎA CÁCH": "Kim bảng đề danh",
  "LÔI HỎA PHONG": "Hạn miêu đắc vũ",
  "ĐỊA HỎA MINH DI": "Cổ kính trùng minh",
  "ĐỊA THỦY SƯ": "Mã đáo thành công",
  "PHONG THIÊN TIỂU SÚC": "Mạt vân bất vũ",
  "PHONG HỎA GIA NHÂN": "Quan Thủ lân chi",
  "PHONG LÔI ÍCH": "Khô mộc khai hoa",
  "THIÊN LÔI VÔ VỌNG": "Điểu bị lũng lao",
  "HỎA LÔI PHỆ HẠP": "Cô nhân ngộ thực",
  "SƠN LÔI DI": "Vị thủy phong hiền",
  "SƠN PHONG CỔ": "Súy ma phân dao"
};

export function getHexagramOmen(vietnameseName: string): string | null {
  return HEXAGRAM_OMENS[vietnameseName] || null;
}
