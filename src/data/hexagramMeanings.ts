/**
 * Ý nghĩa 64 quẻ Kinh Dịch theo Dịch Lý, Việt Dịch, Mai Hoa
 * Nguồn: https://kinhdichluchao.vn/y-nghia-64-que-kinh-dich-theo-dịch-ly-viet-dich-mai-hoa/
 * Key: chuỗi "upper-lower" giống như trong HEXAGRAM_NAME_BY_KEY (ví dụ: "1-1")
 */

export const HEXAGRAM_MEANINGS: Record<string, string> = {
  // BÁT THUẦN
  "1-1":
    "CHÍNH YẾU. Cứng mạnh, khô, lớn, khỏe mạnh, đức không nghỉ. Nguyên động lực, mạnh mẽ, dẻo dai, bền bỉ, chính yếu, cao lớn, liền lạc, tròn đày, ngay đúng, nghiêm chỉnh, khô cứng, trong sáng, hiện rõ, hoàn thành, như nhiên.",
  "2-2":
    "Duyệt dã. VUI MỪNG. Vui mừng, hân hoan, vui vẻ, hứng khởi, phấn khởi, hân hạnh.",
  "3-3":
    "Ly dã. SÁNG SỦA. Sáng sủa, rõ ràng, minh bạch, trong sáng, sáng tỏ, rực rỡ.",
  "4-4":
    "Động dã. CHẤN ĐỘNG. Chấn động, rung động, lay động, dao động, chuyển động, động đất.",
  "5-5":
    "Nhập dã. VÀO TRONG. Vào trong, thâm nhập, xâm nhập, đi vào, tiến vào, nhập cuộc.",
  "6-6":
    "Hiểm dã. NGUY HIỂM. Nguy hiểm, hiểm trở, khó khăn, nguy nan, hiểm họa, rủi ro.",
  "7-7":
    "Chỉ dã. DỪNG LẠI. Dừng lại, ngừng lại, đình chỉ, tạm dừng, nghỉ ngơi, yên tĩnh.",
  "0-0":
    "Thuận dã. NHU THUẬN. Thuận tòng, mềm dẻo, theo đường mà được lợi, hòa theo lẽ, chịu lấy. Nhu tĩnh, trống không, đứt đoạn, phụ trợ, mềm yếu, tối thấp, lạnh nhạt, chưa xong, tiềm ẩn, đi theo, hứng chịu, bình thường, nhỏ nhặt, ướt át, rời rã.",

  // THƯỢNG CÀN (1)
  "1-2":
    "Lễ dã. LỘ HÀNH. Nghi lễ, có chừng mực, khuôn phép, dẫm lên, không cho đi sai, có ý chận đường sái quá, hệ thống, pháp lý. Di chuyển, đường đi, hệ thống, quy củ, khuôn phép, chừng mực, lễ nghi, pháp lý, chặn đường, dẫm đạp.",
  "1-3":
    "Thân dã. THÂN THIỆN. Trên dưới cùng lòng, cùng người ưa thích, cùng một bọn người. Giống nhau, gần nhau, cùng nhau, thống nhất, đồng thời, thành một, quen thuộc, quen hơi.",
  "1-4":
    "Thiên tai dã. XÂM LẤN. Tai vạ, lỗi bậy bạ, không lề lối, không quy củ, càn đại, chống đối, khứng chịu. Tai hoạ từ trên, từ ngoài đến, xâm lấn, xâm lăng, càn đại, không quy củ, hứng chịu, đi ẩu, càn bậy, bậy bạ, không mong được.",
  "1-5":
    "Ngộ dã. TƯƠNG NGỘ. Gặp gỡ, cấu kết, liên kết, kết hợp, móc nối, mềm gặp cứng. Gặp gỡ thình lình, ít khi...",
  "1-6":
    "Tranh dã. TRANH CÃI. Tranh cãi, kiện tụng, tranh luận, cãi nhau, đối đầu, đối kháng, đối lập, đối nghịch.",
  "1-7":
    "Thoái dã. CÁO THOÁI. Lui, ẩn, phía sau, từ chối, mất dấu, vắng bóng, nhường nhịn, nhốt vào trong, giữ gìn.",
  "1-0":
    "Tắc dã. BẾ TẮC. Bế tắc, không thông, đóng kín, ngăn chặn, không lưu thông, tắc nghẽn.",

  // THƯỢNG ĐOÀI (2)
  "2-1":
    "Quyết dã. QUYẾT ĐỊNH. Quyết định, quyết đoán, cắt đứt, phân ly, tách rời, quyết liệt.",
  "2-3":
    "Cách dã. CẢI CÁCH. Cải cách, thay đổi, đổi mới, cách mạng, biến đổi, thay thế.",
  "2-4":
    "Tùy dã. TÙY THEO. Tùy theo, theo sau, phụ thuộc, tùy thuộc, đi theo, hưởng ứng.",
  "2-5":
    "Quá dã. QUÁ ĐỘ. Quá độ, vượt quá, quá mức, quá nhiều, quá lớn, vượt ngưỡng.",
  "2-6":
    "Khốn dã. KHỐN KHỔ. Khốn khổ, khó khăn, bế tắc, khốn đốn, cùng quẫn, khó xử.",
  "2-7":
    "Cảm dã. CẢM ỨNG. Cảm ứng, cảm động, cảm xúc, tương cảm, hấp dẫn, thu hút.",
  "2-0": "Tụy dã. TỤ HỌP. Tụ họp, tập hợp, hội tụ, quy tụ, tụ lại, hội họp.",

  // THƯỢNG LY (3)
  "3-1": "Hữu dã. CÓ ĐƯỢC. Có được, sở hữu, giàu có, đầy đủ, phong phú, dư dả.",
  "3-2":
    "Ly dã. LY TÁN. Ly tán, chia lìa, tách rời, phân ly, xa cách, không hợp.",
  "3-4":
    "Hạp dã. HỢP LẠI. Hợp lại, kết hợp, liên kết, gắn bó, hòa hợp, thống nhất.",
  "3-5": "Đỉnh dã. ĐỈNH CAO. Đỉnh cao, cao nhất, tột đỉnh, đỉnh điểm, cao vời.",
  "3-6":
    "Tế dã. CHƯA XONG. Chưa xong, chưa hoàn thành, dang dở, chưa trọn vẹn, chưa đạt.",
  "3-7": "Lữ dã. ĐI XA. Đi xa, du lịch, lữ hành, xa nhà, tha hương, lưu lạc.",
  "3-0":
    "Tấn dã. TIẾN LÊN. Tiến lên, thăng tiến, phát triển, tiến bộ, thăng cấp, thăng hạng.",

  // THƯỢNG CHẤN (4)
  "4-1":
    "Tráng dã. MẠNH MẼ. Mạnh mẽ, cường tráng, hùng mạnh, mạnh dạn, dũng cảm.",
  "4-2": "Quy dã. VỀ NHÀ. Về nhà, quy tụ, trở về, hồi hương, quy hồi.",
  "4-3":
    "Phong dã. PHONG PHÚ. Phong phú, đầy đủ, dồi dào, sung túc, giàu có, thịnh vượng.",
  "4-5":
    "Hằng dã. BỀN LÂU. Bền lâu, lâu dài, thường xuyên, liên tục, bền vững, ổn định.",
  "4-6":
    "Giải dã. GIẢI QUYẾT. Giải quyết, giải tỏa, tháo gỡ, cởi mở, giải phóng, giải thoát.",
  "4-7":
    "Quá dã. QUÁ NHỎ. Quá nhỏ, vượt quá một chút, quá mức nhẹ, vượt ngưỡng nhỏ.",
  "4-0":
    "Dự dã. VUI VẺ. Vui vẻ, hân hoan, vui mừng, hứng khởi, phấn khởi, hân hạnh.",

  // THƯỢNG TỐN (5)
  "5-1":
    "Súc dã. TÍCH TRỮ. Tích trữ, dự trữ, cất giữ, thu thập, gom góp, tích lũy.",
  "5-2":
    "Phu dã. TRUNG THỰC. Trung thực, chân thành, thành thật, trung tín, đáng tin.",
  "5-3":
    "Gia dã. GIA ĐÌNH. Gia đình, nhà cửa, nội bộ, trong nhà, thân thuộc, ruột thịt.",
  "5-4": "Ích dã. CÓ LỢI. Có lợi, ích lợi, bổ ích, hữu ích, có ích, lợi ích.",
  "5-6":
    "Hoán dã. TAN RÃ. Tan rã, phân tán, rời rạc, tản mạn, phân ly, ly tán.",
  "5-7":
    "Tiệm dã. DẦN DẦN. Dần dần, từ từ, tiệm tiến, tuần tự, lần lượt, từng bước.",
  "5-0":
    "Quan dã. QUAN SÁT. Quan sát, xem xét, nhìn ngắm, chiêm ngưỡng, tham quan, xem.",

  // THƯỢNG KHẢM (6)
  "6-1": "Nhu dã. CHỜ ĐỢI. Chờ đợi, đợi chờ, kiên nhẫn, nhẫn nại, chờ thời cơ.",
  "6-2":
    "Tiết dã. TIẾT CHẾ. Tiết chế, kiềm chế, hạn chế, giới hạn, điều độ, có chừng mực.",
  "6-3":
    "Tế dã. HOÀN THÀNH. Hoàn thành, xong xuôi, đạt được, thành công, viên mãn.",
  "6-4":
    "Truân dã. KHÓ KHĂN. Khó khăn, gian nan, vất vả, trắc trở, khốn khó, bế tắc.",
  "6-5":
    "Tỉnh dã. GIẾNG NƯỚC. Giếng nước, nguồn nước, cố định, ổn định, không đổi.",
  "6-7":
    "Kiển dã. GIAN NAN. Gian nan, khó khăn, trắc trở, vất vả, khốn khó, bế tắc.",
  "6-0": "Tụy dã. TỤ HỌP. Tụ họp, tập hợp, hội tụ, quy tụ, tụ lại, hội họp.",

  // THƯỢNG CẤN (7)
  "7-1":
    "Súc dã. TÍCH LŨY. Tích lũy, dự trữ, cất giữ, thu thập, gom góp, tích tụ.",
  "7-2":
    "Tổn dã. TỔN HẠI. Tổn hại, thiệt hại, mất mát, hao tổn, giảm sút, suy giảm.",
  "7-3":
    "Bí dã. TRANG SỨC. Trang sức, làm đẹp, tô điểm, trang hoàng, sửa sang, chỉnh trang.",
  "7-4":
    "Di dã. DỊU DÀNG. Dịu dàng, nhẹ nhàng, êm ái, mềm mại, thanh nhã, tao nhã.",
  "7-5": "Cổ dã. CŨ KỸ. Cũ kỹ, lỗi thời, cổ xưa, xưa cũ, lạc hậu, không mới.",
  "7-6":
    "Mông dã. MƠ HỒ. Mơ hồ, không rõ, mờ mịt, tối tăm, không sáng, mù mịt.",
  "7-0":
    "Khiêm dã. KHIÊM TỐN. Khiêm tốn, nhún nhường, khiêm từ, cáo thoái, từ giã, lui vào trong.",

  // THƯỢNG KHÔN (0)
  "0-1":
    "Thái dã. THỊNH VƯỢNG. Thịnh vượng, phồn thịnh, hưng thịnh, phát đạt, thịnh đạt.",
  "0-2":
    "Lâm dã. ĐẾN GẦN. Đến gần, tiếp cận, gần kề, sắp đến, sắp tới, gần sát.",
  "0-3": "Di dã. TỐI TĂM. Tối tăm, mờ mịt, không sáng, u ám, tăm tối, mù mịt.",
  "0-4":
    "Phục dã. TRỞ LẠI. Trở lại, quay về, phục hồi, khôi phục, trở về, hồi phục.",
  "0-5":
    "Thăng dã. THĂNG TIẾN. Thăng tiến, thăng cấp, thăng hạng, tiến lên, phát triển.",
  "0-6":
    "Sư dã. QUÂN ĐỘI. Quân đội, binh lính, quân sự, chiến tranh, đấu tranh, tranh đấu.",
  "0-7":
    "Khiêm dã. KHIÊM TỐN. Khiêm tốn, nhún nhường, khiêm từ, cáo thoái, từ giã, lui vào trong, giữ gìn, nhốt vào trong."
};

/**
 * Get hexagram meaning by hexagram key ("upper-lower")
 */
export function getHexagramMeaning(key: string): string | null {
  return HEXAGRAM_MEANINGS[key] || null;
}
