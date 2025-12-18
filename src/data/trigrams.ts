/**
 * Bát Quái (Eight Trigrams) data
 * Each trigram has 3 lines (from bottom to top)
 * 1 = Yang (solid), 0 = Yin (broken)
 */

export interface Trigram {
  id: number;
  name: string;
  vietnameseName: string;
  lines: [number, number, number]; // bottom to top
  element: string;
  direction: string;
}

export const TRIGRAMS: Record<number, Trigram> = {
  0: {
    id: 0,
    name: "Khôn",
    vietnameseName: "KHÔN",
    lines: [0, 0, 0],
    element: "Thổ",
    direction: "Tây Nam"
  },
  1: {
    id: 1,
    name: "Càn",
    vietnameseName: "CÀN",
    lines: [1, 1, 1],
    element: "Kim",
    direction: "Tây Bắc"
  },
  2: {
    id: 2,
    name: "Đoài",
    vietnameseName: "ĐOÀI",
    lines: [1, 1, 0],
    element: "Kim",
    direction: "Tây"
  },
  3: {
    id: 3,
    name: "Ly",
    vietnameseName: "LY",
    lines: [1, 0, 1],
    element: "Hỏa",
    direction: "Nam"
  },
  4: {
    id: 4,
    name: "Chấn",
    vietnameseName: "CHẤN",
    lines: [1, 0, 0],
    element: "Mộc",
    direction: "Đông"
  },
  5: {
    id: 5,
    name: "Tốn",
    vietnameseName: "TỐN",
    lines: [0, 1, 1],
    element: "Mộc",
    direction: "Đông Nam"
  },
  6: {
    id: 6,
    name: "Khảm",
    vietnameseName: "KHẢM",
    lines: [0, 1, 0],
    element: "Thủy",
    direction: "Bắc"
  },
  7: {
    id: 7,
    name: "Cấn",
    vietnameseName: "CẤN",
    lines: [0, 0, 1],
    element: "Thổ",
    direction: "Đông Bắc"
  }
};

/**
 * Get trigram by remainder (0-7)
 */
export function getTrigramByRemainder(remainder: number): Trigram {
  const key = remainder === 0 ? 0 : remainder;
  return TRIGRAMS[key];
}
