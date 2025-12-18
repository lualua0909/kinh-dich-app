/**
 * Mai Hoa Dịch Số (Plum Blossom I Ching) Divination Logic
 *
 * Algorithm:
 * 1. Normalize serial: if length is odd, prepend '0'
 * 2. Split serial into two halves (upper and lower trigrams)
 * 3. Sum digits of each half, then mod 8 to get trigram
 * 4. Sum all digits, mod 6 to get moving line (hào động)
 * 5. Create original, mutual, and changed hexagrams
 */

import { getTrigramByRemainder } from "../data/trigrams";
import { getHexagram, Hexagram } from "../data/hexagrams";
import { LunarCalendar } from "@dqcai/vn-lunar";

export interface DivinationResult {
  originalHexagram: Hexagram | null;
  mutualHexagram: Hexagram | null;
  changedHexagram: Hexagram | null;
  movingLine: number; // 1-6
  serial: string;
  normalizedSerial: string;
  metadata: {
    thoiGianDuong: string;
    thoiGianAm: string;
    yearCanChi: string;
    monthCanChi: string;
    dayCanChi: string;
    tietKhi: string;
    nhatThan: string;
  };
}

/**
 * Step 1: Normalize Serial
 * If length is odd, prepend '0'
 */
function normalizeSerial(serial: string): string {
  if (serial.length % 2 === 1) {
    return "0" + serial;
  }
  return serial;
}

/**
 * Step 2: Split serial into upper and lower halves
 * - Upper trigram (Thượng quái): first half (nửa đầu dãy số)
 * - Lower trigram (Hạ quái): second half (nửa sau dãy số)
 */
function splitSerial(serial: string): { upper: string; lower: string } {
  const mid = serial.length / 2;
  return {
    upper: serial.slice(0, mid), // Nửa đầu → Thượng quái
    lower: serial.slice(mid) // Nửa sau → Hạ quái
  };
}

/**
 * Step 3: Sum digits and get trigram remainder
 */
function getTrigramFromDigits(digits: string): number {
  const sum = digits
    .split("")
    .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  return sum % 8;
}

/**
 * Step 4: Get moving line (hào động)
 * Sum all digits, mod 6
 * If remainder = 0, then hào 6
 */
function getMovingLine(serial: string): number {
  const sum = serial
    .split("")
    .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  const remainder = sum % 6;
  return remainder === 0 ? 6 : remainder;
}

/**
 * Step 5: Create mutual hexagram (Quẻ Hỗ)
 * The mutual hexagram uses lines 2, 3, 4 as lower trigram
 * and lines 3, 4, 5 as upper trigram
 */
function createMutualHexagram(originalHexagram: Hexagram): Hexagram | null {
  const lines = originalHexagram.lines;

  // Lower trigram: lines 2, 3, 4 (indices 1, 2, 3)
  const lowerTrigramLines = [lines[1], lines[2], lines[3]];

  // Upper trigram: lines 3, 4, 5 (indices 2, 3, 4)
  const upperTrigramLines = [lines[2], lines[3], lines[4]];

  // Find matching trigrams
  const lowerTrigram = findTrigramByLines(lowerTrigramLines);
  const upperTrigram = findTrigramByLines(upperTrigramLines);

  if (lowerTrigram === null || upperTrigram === null) {
    return null;
  }

  return getHexagram(upperTrigram, lowerTrigram);
}

/**
 * Find trigram ID by its three lines
 */
function findTrigramByLines(lines: [number, number, number]): number | null {
  console.log("lines = ", lines);

  for (let i = 0; i <= 7; i++) {
    const key = i === 0 ? 0 : i;
    const trigram = getTrigramByRemainder(key);
    if (
      trigram.lines[0] === lines[0] &&
      trigram.lines[1] === lines[1] &&
      trigram.lines[2] === lines[2]
    ) {
      console.log("trigram = ", trigram);
      return key;
    }
  }
  return null;
}

/**
 * Step 6: Create changed hexagram (Quẻ Biến)
 * Flip the moving line: Yang (1) → Yin (0), Yin (0) → Yang (1)
 * Then reconstruct the hexagram from the changed lines
 */
function createChangedHexagram(
  originalHexagram: Hexagram,
  movingLine: number
): Hexagram | null {
  const lines = [...originalHexagram.lines] as [
    number,
    number,
    number,
    number,
    number,
    number
  ];

  // Flip the moving line (hào động)
  // movingLine is 1-6, but array index is 0-5
  // Hào 1 = index 0, Hào 2 = index 1, ..., Hào 6 = index 5
  const lineIndex = movingLine - 1;
  lines[lineIndex] = lines[lineIndex] === 1 ? 0 : 1;

  // Split into upper and lower trigrams
  // Hạ quái: hào 1, 2, 3 (indices 0, 1, 2)
  // Thượng quái: hào 4, 5, 6 (indices 3, 4, 5)
  const lowerTrigramLines: [number, number, number] = [
    lines[0],
    lines[1],
    lines[2]
  ];
  const upperTrigramLines: [number, number, number] = [
    lines[3],
    lines[4],
    lines[5]
  ];

  // Find matching trigrams by comparing lines
  const lowerTrigram = findTrigramByLines(lowerTrigramLines);
  const upperTrigram = findTrigramByLines(upperTrigramLines);

  if (lowerTrigram === null || upperTrigram === null) {
    return null;
  }

  // Create hexagram: upper trigram (thượng quái) - lower trigram (hạ quái)
  return getHexagram(upperTrigram, lowerTrigram);
}

/**
 * Get current date/time metadata
 */
function getMetadata(): DivinationResult["metadata"] {
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  // Convert to Vietnamese lunar calendar using @dqcai/vn-lunar
  const solarDay = now.getDate();
  const solarMonth = now.getMonth() + 1; // JS months are 0-based
  const solarYear = now.getFullYear();

  const lunar = LunarCalendar.fromSolar(solarDay, solarMonth, solarYear);

  const tietKhi = "Lập Xuân";
  const nhatThan = "Mậu Thổ";

  return {
    thoiGianDuong: dateStr,
    thoiGianAm: lunar.formatLunar(),
    yearCanChi: lunar.yearCanChi,
    monthCanChi: lunar.monthCanChi,
    dayCanChi: lunar.dayCanChi,
    tietKhi,
    nhatThan
  };
}

/**
 * Main divination function
 * Performs Mai Hoa Dịch Số calculation
 */
export function performDivination(
  serial?: string,
  manualLines?: [number, number, number, number, number, number],
  manualMovingLine?: number | null
): DivinationResult {
  let originalHexagram: Hexagram | null = null;
  let mutualHexagram: Hexagram | null = null;
  let changedHexagram: Hexagram | null = null;
  let movingLine: number;
  let usedSerial = serial ?? "";
  let normalizedSerial = serial ?? "";

  if (manualLines && manualLines.length === 6) {
    // Manual hexagram: build from lines directly
    const lowerTrigramLines: [number, number, number] = [
      manualLines[0],
      manualLines[1],
      manualLines[2]
    ];
    const upperTrigramLines: [number, number, number] = [
      manualLines[3],
      manualLines[4],
      manualLines[5]
    ];

    const lowerTrigram = findTrigramByLines(lowerTrigramLines);
    const upperTrigram = findTrigramByLines(upperTrigramLines);

    if (lowerTrigram === null || upperTrigram === null) {
      throw new Error("Không tìm được quẻ tương ứng với 6 hào đã chọn");
    }

    originalHexagram = getHexagram(upperTrigram, lowerTrigram);
    movingLine = manualMovingLine ?? 0;
  } else {
    if (!serial) {
      throw new Error("Serial cannot be empty");
    }

    // Validate: only numeric
    if (!/^\d+$/.test(serial)) {
      throw new Error("Serial must contain only digits");
    }

    if (serial.length === 0) {
      throw new Error("Serial cannot be empty");
    }

    // Step 1: Normalize
    normalizedSerial = normalizeSerial(serial);

    // Step 2: Split
    const { upper, lower } = splitSerial(normalizedSerial);

    // Step 3: Get trigrams
    const upperTrigramRemainder = getTrigramFromDigits(upper);
    const lowerTrigramRemainder = getTrigramFromDigits(lower);

    // Step 4: Get moving line
    movingLine = getMovingLine(normalizedSerial);

    // Step 5: Get original hexagram
    originalHexagram = getHexagram(
      upperTrigramRemainder === 0 ? 0 : upperTrigramRemainder,
      lowerTrigramRemainder === 0 ? 0 : lowerTrigramRemainder
    );
    usedSerial = serial;
  }

  // Step 6: Get mutual hexagram
  mutualHexagram = originalHexagram
    ? createMutualHexagram(originalHexagram)
    : null;

  // Step 7: Get changed hexagram
  changedHexagram =
    originalHexagram && movingLine
      ? createChangedHexagram(originalHexagram, movingLine)
      : null;

  // Get metadata
  const metadata = getMetadata();

  return {
    originalHexagram,
    mutualHexagram,
    changedHexagram,
    movingLine,
    serial: usedSerial,
    normalizedSerial,
    metadata
  };
}
