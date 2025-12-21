import {
  getYearGanzhi,
  getMonthGanzhi,
  getDayGanzhi,
  getGanzhiFromDate
} from "./ganzhi.js";

/* ===============================
 * HELPER
 * =============================== */
function expectEqual(actual, expected, message) {
  if (actual !== expected) {
    console.error(`❌ ${message}`);
    console.error(`   Expected: ${expected}`);
    console.error(`   Actual:   ${actual}`);
    process.exit(1);
  } else {
    console.log(`✅ ${message}`);
  }
}

/* ===============================
 * TEST CAN CHI NĂM
 * =============================== */
expectEqual(getYearGanzhi(2025), "Ất Tỵ", "Năm 2025 phải là Ất Tỵ");

expectEqual(getYearGanzhi(2024), "Giáp Thìn", "Năm 2024 phải là Giáp Thìn");

expectEqual(getYearGanzhi(2026), "Bính Ngọ", "Năm 2026 phải là Bính Ngọ");

/* ===============================
 * TEST CAN CHI THÁNG
 * =============================== */
expectEqual(
  getMonthGanzhi("Ất", 1),
  "Mậu Dần",
  "Tháng 1 năm Ất phải là Mậu Dần"
);

expectEqual(
  getMonthGanzhi("Ất", 12),
  "Kỷ Sửu",
  "Tháng 12 năm Ất phải là Kỷ Sửu"
);

/* ===============================
 * TEST CAN CHI NGÀY
 * =============================== */
// Lưu ý: Test case Can Chi ngày có thể cần điều chỉnh tùy theo mốc chuẩn
// Mốc chuẩn hiện tại: 1984/2/4 = Giáp Tý (JDN 2445708)
expectEqual(
  getDayGanzhi(2025, 12, 21),
  "Ất Hợi",
  "Ngày 21/12/2025 phải là Ất Hợi"
);

expectEqual(
  getDayGanzhi(2024, 2, 10),
  "Ất Mão",
  "Ngày 10/02/2024 phải là Ất Mão"
);

/* ===============================
 * TEST TỔNG HỢP
 * =============================== */
const result = getGanzhiFromDate({
  year: 2025,
  month: 12,
  day: 21
});

expectEqual(result.year, "Ất Tỵ", "Tổng hợp: Can Chi năm đúng");
expectEqual(result.month, "Kỷ Sửu", "Tổng hợp: Can Chi tháng đúng");
expectEqual(result.day, "Ất Hợi", "Tổng hợp: Can Chi ngày đúng");

console.log("\n🎉 TẤT CẢ TEST PASSED");
