/**
 * Bát Quái (Eight Trigrams) data
 * Each trigram has 3 lines (from bottom to top)
 * 1 = Yang (solid), 0 = Yin (broken)
 */

export interface Trigram {
  id: number;
  name: string;
  lines: [number, number, number]; // bottom to top
  element: string;
  direction: string;
}

export const TRIGRAMS: Record<number, Trigram> = {
  0: {
    id: 0,
    name: "Khôn",
    lines: [0, 0, 0],
    element: "Thổ",
    direction: "Tây Nam",
  },
  1: {
    id: 1,
    name: "Càn",
    lines: [1, 1, 1],
    element: "Kim",
    direction: "Tây Bắc",
  },
  2: {
    id: 2,
    name: "Đoài",
    lines: [1, 1, 0],
    element: "Kim",
    direction: "Tây",
  },
  3: {
    id: 3,
    name: "Ly",
    lines: [1, 0, 1],
    element: "Hỏa",
    direction: "Nam",
  },
  4: {
    id: 4,
    name: "Chấn",
    lines: [1, 0, 0],
    element: "Mộc",
    direction: "Đông",
  },
  5: {
    id: 5,
    name: "Tốn",
    lines: [0, 1, 1],
    element: "Mộc",
    direction: "Đông Nam",
  },
  6: {
    id: 6,
    name: "Khảm",
    lines: [0, 1, 0],
    element: "Thủy",
    direction: "Bắc",
  },
  7: {
    id: 7,
    name: "Cấn",
    lines: [0, 0, 1],
    element: "Thổ",
    direction: "Đông Bắc",
  },
};

/**
 * Get trigram by remainder (0-7)
 */
export function getTrigramByRemainder(remainder: number): Trigram {
  const key = remainder === 0 ? 0 : remainder;
  return TRIGRAMS[key];
}
