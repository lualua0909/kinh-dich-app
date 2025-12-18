const HEXAGRAM_OMENS: Record<string, string> = {
  "3-3": "Thiên quan tứ phúc", // BÁT THUẦN LY
  "3-7": "Tức điều phán sào", // HỎA SƠN LỮ
  "3-5": "Ngư ông đắc lợi", // HỎA PHONG ĐỈNH
  "3-6": "Tiêu hồ ngật tế", // HỎA THỦY VỊ TẾ
  "7-6": "Tiêu quỷ thần tiên", // SƠN THỦY MÔNG
  "5-6": "Cách hà vọng kim", // PHONG THỦY HOÁN
  "1-6": "Nhị nhân tranh lộ", // THIÊN THỦY TỤNG
  "1-3": "Tiên nhân chỉ lộ", // THIÊN HỎA ĐỒNG NHÂN
  "0-0": "Nga hồ đắc thục", // BÁT THUẦN KHÔN
  "0-4": "Phu thê phản mục", // ĐỊA LÔI PHỤC
  "0-2": "Phát chính thi nhân", // ĐỊA TRẠCH LÂM
  "0-1": "Hỉ báo tam nguyên", // ĐỊA THIÊN THÁI
  "4-1": "Cộng sự đắc mộc", // LÔI THIÊN ĐẠI TRÁNG
  "2-1": "Du phong thoát vong", // TRẠCH THIÊN QUẢI
  "6-1": "Minh châu xuất thổ", // THỦY THIÊN NHU
  "6-0": "Thuyền đắc thuận phong", // THỦY ĐỊA TỶ
  "7-7": "Sơn trạch trùng điệp", // BÁT THUẦN CẤN
  "7-3": "Trần thế đắc khai", // SƠN HỎA BÍ
  "7-1": "Hỉ khí doanh môn", // SƠN THIÊN ĐẠI SÚC
  "7-2": "Tổn kỷ lợi nhân", // SƠN TRẠCH TỔN
  "3-2": "Thái công bất ngộ", // HỎA TRẠCH KHUÊ
  "1-2": "Phượng minh Kỳ Sơn", // THIÊN TRẠCH LÝ
  "5-2": "Hành tẩu bạc bằng", // PHONG TRẠCH TRUNG PHU
  "5-7": "Hồng nhạn cao phi", // PHONG SƠN TIỆM
  "1-1": "Khốn Long đắc thủy", // BÁT THUẦN CÀN
  "2-2": "Lưỡng trạch tương tư", // BÁT THUẦN ĐOÀI
  "5-5": "Cô chu đắc thủy", // BÁT THUẦN TỐN
  "6-6": "Khảm vi thủy", // BÁT THUẦN KHẢM
  "4-4": "Thiên hạ dương danh", // BÁT THUẦN CHẤN
  "1-5": "Tha hưởng ngộ hữu", // THIÊN PHONG CẤU
  "1-7": "Nùng vân tế nhật", // THIÊN SƠN ĐỘN
  "1-0": "Hổ lạc hàm khanh", // THIÊN ĐỊA BỈ
  "5-0": "Hạn Bồng Phùng Hà", // PHONG ĐỊA QUAN
  "7-0": "Ứng thuộc đông lâm", // SƠN ĐỊA BÁC
  "3-0": "Sử địa đắc kim", // HỎA ĐỊA TẤN
  "3-1": "Nhuyển mộc nộ tước", // HỎA THIÊN ĐẠI HỮU
  "2-6": "Loát hãn du thê", // TRẠCH THỦY KHỐN
  "2-0": "Ngự hóa vi Long", // TRẠCH ĐỊA TUỴ
  "2-7": "Nanh Nha xuất thổ", // TRẠCH SƠN HÀM
  "6-7": "Vũ tuyết tài đổ", // THỦY SƠN KIỂN
  "0-7": "Nhị nhân phân kim", // ĐỊA SƠN KHIÊM
  "4-7": "Phi điểu di âm", // LÔI SƠN TIỂU QUÁ
  "4-2": "Duyên Mộc câu ngư", // LÔI TRẠCH QUY MUỘI
  "4-0": "Thanh Long đắc vị", // LÔI ĐỊA DỰ
  "4-6": "Ngũ quan thoát nạn", // LÔI THỦY GIẢI
  "4-5": "Ngư lai chòng võng", // LÔI PHONG HẰNG
  "0-5": "Chỉ nhật cao thăng", // ĐỊA PHONG THĂNG
  "6-5": "Khê tĩnh sinh tuyền", // THỦY PHONG TỈNH
  "2-5": "Dạ mộng kim ngân", // TRẠCH PHONG ĐẠI QUÁ
  "2-4": "Bộ bộ đăng cao", // TRẠCH LÔI TÙY
  "6-2": "Hải đề lao nguyệt", // THỦY TRẠCH TIẾT
  "6-4": "Loạn ti vô đầu", // THỦY LÔI TRUÂN
  "6-3": "Loạn tu vô đầu", // THỦY HỎA KÝ TẾ
  "2-3": "Kim bảng đề danh", // TRẠCH HỎA CÁCH
  "4-3": "Cổ kính trùng minh", // LÔI HỎA PHONG
  "0-3": "Cổ kính trùng minh", // ĐỊA HỎA MINH DI
  "0-6": "Mã đáo thành công", // ĐỊA THỦY SƯ
  "5-1": "Mật vân bất vũ", // PHONG THIÊN TIỂU SÚC
  "5-3": "Quan Thủ lân chi", // PHONG HỎA GIA NHÂN
  "5-4": "Khô mộc khai hoa", // PHONG LÔI ÍCH
  "1-4": "Điểu bị lũng lao", // THIÊN LÔI VÔ VỌNG
  "3-4": "Cô nhân ngộ thực", // HỎA LÔI PHỆ HẠP
  "7-4": "Vị thủy phong hiền", // SƠN LÔI DI
  "7-5": "Súy ma phân dao", // SƠN PHONG CỔ
};

export function getHexagramOmen(key: string): string | null {
  return HEXAGRAM_OMENS[key] || null;
}
