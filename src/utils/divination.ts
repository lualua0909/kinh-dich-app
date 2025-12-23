/**
 * Mai Hoa Dịch Số (Plum Blossom I Ching) Divination Logic
 */

import { getTrigramByRemainder } from "../data/trigrams";
import { getHexagram, Hexagram } from "../data/hexagrams";
import { LunarCalendar } from "@dqcai/vn-lunar";

export interface DivinationResult {
  originalHexagram: Hexagram | null;
  mutualHexagram: Hexagram | null;
  changedHexagram: Hexagram | null;
  movingLines: number[]; // Array of 1-6
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
 */
function normalizeSerial(serial: string): string {
  if (serial.length % 2 === 1) {
    return "0" + serial;
  }
  return serial;
}

/**
 * Step 2: Split serial into upper and lower halves
 */
function splitSerial(serial: string): { upper: string; lower: string } {
  const mid = serial.length / 2;
  return {
    upper: serial.slice(0, mid),
    lower: serial.slice(mid),
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
 */
function getMovingLine(serial: string): number {
  const sum = serial
    .split("")
    .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  const remainder = sum % 6;
  return remainder === 0 ? 6 : remainder;
}

/**
 * Find trigram ID by its three lines
 */
function findTrigramByLines(lines: [number, number, number]): number | null {
  for (let i = 0; i <= 7; i++) {
    const key = i === 0 ? 0 : i;
    const trigram = getTrigramByRemainder(key);
    if (
      trigram.lines[0] === lines[0] &&
      trigram.lines[1] === lines[1] &&
      trigram.lines[2] === lines[2]
    ) {
      return key;
    }
  }
  return null;
}

/**
 * Step 5: Create mutual hexagram (Quẻ Hỗ)
 */
function createMutualHexagram(originalHexagram: Hexagram): Hexagram | null {
  const lines = originalHexagram.lines;
  const lowerTrigramLines: [number, number, number] = [lines[1], lines[2], lines[3]];
  const upperTrigramLines: [number, number, number] = [lines[2], lines[3], lines[4]];

  const lowerTrigram = findTrigramByLines(lowerTrigramLines);
  const upperTrigram = findTrigramByLines(upperTrigramLines);

  if (lowerTrigram === null || upperTrigram === null) return null;
  return getHexagram(upperTrigram, lowerTrigram);
}

/**
 * Step 6: Create changed hexagram (Quẻ Biến)
 */
function createChangedHexagram(
  originalHexagram: Hexagram,
  movingLines: number[]
): Hexagram | null {
  const lines = [...originalHexagram.lines] as [number, number, number, number, number, number];

  movingLines.forEach((ml) => {
    if (ml >= 1 && ml <= 6) {
      const lineIndex = ml - 1;
      lines[lineIndex] = lines[lineIndex] === 1 ? 0 : 1;
    }
  });

  const lowerTrigramLines: [number, number, number] = [lines[0], lines[1], lines[2]];
  const upperTrigramLines: [number, number, number] = [lines[3], lines[4], lines[5]];

  const lowerTrigram = findTrigramByLines(lowerTrigramLines);
  const upperTrigram = findTrigramByLines(upperTrigramLines);

  if (lowerTrigram === null || upperTrigram === null) return null;
  return getHexagram(upperTrigram, lowerTrigram);
}

/**
 * Get current date/time metadata
 */
function getMetadata(date?: Date): DivinationResult["metadata"] {
  const now = date || new Date();
  const dateStr = now.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const solarDay = now.getDate();
  const solarMonth = now.getMonth() + 1;
  const solarYear = now.getFullYear();
  
  const calendar = LunarCalendar.fromSolar(solarDay, solarMonth, solarYear);
  const lunar = calendar.lunarDate;
  
  const thoiGianAm = `Ngày ${lunar.day}/${lunar.month}/${lunar.year}${lunar.leap ? " (Nhuận)" : ""} - ${calendar.yearCanChi}, ${calendar.monthCanChi}, ${calendar.dayCanChi}`;

  const stemToElement: Record<string, string> = {
    "Giáp": "Mộc", "Ất": "Mộc", "Bính": "Hỏa", "Đinh": "Hỏa", "Mậu": "Thổ",
    "Kỷ": "Thổ", "Canh": "Kim", "Tân": "Kim", "Nhâm": "Thủy", "Quý": "Thủy"
  };
  const dayStem = calendar.dayCanChi.split(" ")[0];
  const nhatThan = `${dayStem} ${stemToElement[dayStem] || ""}`.trim();

  return {
    thoiGianDuong: dateStr,
    thoiGianAm: thoiGianAm,
    yearCanChi: calendar.yearCanChi,
    monthCanChi: calendar.monthCanChi,
    dayCanChi: calendar.dayCanChi,
    tietKhi: "Đang cập nhật",
    nhatThan,
  };
}

/**
 * Main divination function
 */
export function performDivination(
  serial?: string,
  manualLines?: [number, number, number, number, number, number],
  manualMovingLines?: number[] | number | null,
  datetime?: Date
): DivinationResult {
  let originalHexagram: Hexagram | null = null;
  let mutualHexagram: Hexagram | null = null;
  let changedHexagram: Hexagram | null = null;
  let movingLines: number[] = [];
  let usedSerial = serial ?? "";
  let normalizedSerial = serial ?? "";

  if (manualLines && manualLines.length === 6) {
    const lowerTrigramLines: [number, number, number] = [manualLines[0], manualLines[1], manualLines[2]];
    const upperTrigramLines: [number, number, number] = [manualLines[3], manualLines[4], manualLines[5]];

    const lowerTrigram = findTrigramByLines(lowerTrigramLines);
    const upperTrigram = findTrigramByLines(upperTrigramLines);

    if (lowerTrigram === null || upperTrigram === null) {
      throw new Error("Không tìm được quẻ tương ứng với 6 hào đã chọn");
    }

    originalHexagram = getHexagram(upperTrigram, lowerTrigram);
    
    if (Array.isArray(manualMovingLines)) {
      movingLines = manualMovingLines;
    } else if (typeof manualMovingLines === 'number') {
      movingLines = [manualMovingLines];
    } else {
      movingLines = [];
    }
  } else {
    if (!serial) throw new Error("Không tìm được quẻ");
    if (!/^\d+$/.test(serial)) throw new Error("Chỉ được chứa số");
    if (serial.length === 0) throw new Error("Không tìm được quẻ");

    normalizedSerial = normalizeSerial(serial);
    const { upper, lower } = splitSerial(normalizedSerial);
    const upperTrigramRemainder = getTrigramFromDigits(upper);
    const lowerTrigramRemainder = getTrigramFromDigits(lower);
    movingLines = [getMovingLine(normalizedSerial)];

    originalHexagram = getHexagram(
      upperTrigramRemainder === 0 ? 0 : upperTrigramRemainder,
      lowerTrigramRemainder === 0 ? 0 : lowerTrigramRemainder
    );
    usedSerial = serial;
  }

  mutualHexagram = originalHexagram && movingLines.length > 0
    ? createMutualHexagram(originalHexagram)
    : null;

  if (originalHexagram) {
    if (movingLines.length > 0) {
      const changed = createChangedHexagram(originalHexagram, movingLines);
      changedHexagram = changed || originalHexagram;
    } else {
      changedHexagram = originalHexagram;
    }
  }

  const metadata = getMetadata(datetime);

  return {
    originalHexagram,
    mutualHexagram,
    changedHexagram,
    movingLines,
    serial: usedSerial,
    normalizedSerial,
    metadata,
  };
}
