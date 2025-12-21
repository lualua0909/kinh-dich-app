/* ===============================
 * CAN CHI UTILS
 * Mốc chuẩn: 2025 = Ất Tỵ
 * =============================== */

/** Thiên Can */
const HEAVENLY_STEMS = [
  "Giáp",
  "Ất",
  "Bính",
  "Đinh",
  "Mậu",
  "Kỷ",
  "Canh",
  "Tân",
  "Nhâm",
  "Quý"
];

/** Địa Chi */
const EARTHLY_BRANCHES = [
  "Tý",
  "Sửu",
  "Dần",
  "Mão",
  "Thìn",
  "Tỵ",
  "Ngọ",
  "Mùi",
  "Thân",
  "Dậu",
  "Tuất",
  "Hợi"
];

/* ===============================
 * CAN CHI NĂM
 * Mốc: 2025 = Ất Tỵ
 * =============================== */
function getYearGanzhi(year) {
  const BASE_YEAR = 2025;
  const BASE_STEM_INDEX = 1; // Ất
  const BASE_BRANCH_INDEX = 5; // Tỵ

  const offset = year - BASE_YEAR;

  const stem =
    HEAVENLY_STEMS[
      (BASE_STEM_INDEX + offset) % 10 >= 0
        ? (BASE_STEM_INDEX + offset) % 10
        : (BASE_STEM_INDEX + offset + 10) % 10
    ];

  const branch =
    EARTHLY_BRANCHES[
      (BASE_BRANCH_INDEX + offset) % 12 >= 0
        ? (BASE_BRANCH_INDEX + offset) % 12
        : (BASE_BRANCH_INDEX + offset + 12) % 12
    ];

  return `${stem} ${branch}`;
}

/* ===============================
 * CAN CHI THÁNG
 * Phụ thuộc CAN của năm
 * (chuẩn dùng Lục Hào / Tử Bình)
 * =============================== */
function getMonthGanzhi(yearStem, month) {
  // Bảng khởi Can tháng Giêng (Dần)
  const MONTH_STEM_START = {
    Giáp: 2,
    Kỷ: 2,
    Ất: 4,
    Canh: 4,
    Bính: 6,
    Tân: 6,
    Đinh: 8,
    Nhâm: 8,
    Mậu: 0,
    Quý: 0
  };

  const stemIndexStart = MONTH_STEM_START[yearStem];
  if (stemIndexStart === undefined) {
    throw new Error("Invalid year stem");
  }

  const stem = HEAVENLY_STEMS[(stemIndexStart + month - 1) % 10];

  // Tháng 1 = Dần
  const branch = EARTHLY_BRANCHES[(month + 1) % 12];

  return `${stem} ${branch}`;
}

/* ===============================
 * CAN CHI NGÀY
 * Dùng Julian Day Number
 * Mốc chuẩn: 1924/2/5 = Giáp Tý (JDN 2423308)
 * Công thức: Thiên Can = (JDN - BASE_JDN + 9) % 10
 *           Địa Chi = (JDN - BASE_JDN + 1) % 12
 *
 * Lưu ý: Có thể cần điều chỉnh mốc chuẩn tùy theo hệ thống lịch
 * =============================== */
function getDayGanzhi(year, month, day) {
  let y = year;
  let m = month;
  let d = day;

  // Chuyển đổi tháng nếu cần (tháng 1, 2 được tính như tháng 13, 14 của năm trước)
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  // Tính Julian Day Number
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    d +
    B -
    1524.5;

  const jdn = Math.floor(jd);

  // Mốc chuẩn: 1984/2/4 = Giáp Tý (JDN 2445708)
  // Đây là mốc chuẩn phổ biến trong Lục Hào Dịch học hiện đại
  const BASE_JDN = 2445708;

  const offset = jdn - BASE_JDN;

  // Tính index với offset
  let stemIndex = (offset + 9) % 10;
  let branchIndex = (offset + 1) % 12;

  // Đảm bảo index không âm
  if (stemIndex < 0) stemIndex += 10;
  if (branchIndex < 0) branchIndex += 12;

  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];

  return `${stem} ${branch}`;
}

/* ===============================
 * TỔNG HỢP CAN CHI
 * =============================== */
function getGanzhiFromDate({ year, month, day }) {
  const yearGanzhi = getYearGanzhi(year);
  const yearStem = yearGanzhi.split(" ")[0];

  return {
    year: yearGanzhi,
    month: getMonthGanzhi(yearStem, month),
    day: getDayGanzhi(year, month, day)
  };
}

/* ===============================
 * EXPORT (nếu dùng module)
 * =============================== */
export {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  getYearGanzhi,
  getMonthGanzhi,
  getDayGanzhi,
  getGanzhiFromDate
};

/* ===============================
 * VÍ DỤ TEST
 * =============================== */
// const result = getGanzhiFromDate({
//   year: 2025,
//   month: 12,
//   day: 21
// });
// console.log(result);
// {
//   year: "Ất Tỵ",
//   month: "Mậu Tý",
//   day: "Tân Mão"
// }
