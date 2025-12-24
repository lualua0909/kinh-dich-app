import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateLineData } from "../data/lines";
import { getLucThanName } from "../data/lucThuInfo";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const interpretHexagram = async (divinationData) => {
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not defined in environment variables.");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = constructPrompt(divinationData);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error Detail:", error);
    // Trích xuất thông báo lỗi chi tiết nếu có
    const errorMessage = error.message || "Lỗi không xác định từ Gemini API";
    if (errorMessage.includes("quota") || errorMessage.includes("429")) {
      throw new Error("Hạn mức (Quota) của API Key đã hết hoặc chưa được kích hoạt cho model này. Vui lòng kiểm tra tại Google AI Studio.");
    }
    throw new Error(errorMessage);
  }
};

const constructPrompt = (data) => {
  const { originalHexagram, mutualHexagram, changedHexagram, movingLines, metadata, dungThan } = data;

  const dayCanChi = metadata.dayCanChi;
  const originalLines = generateLineData(originalHexagram.id, dayCanChi);
  const mutualLines = mutualHexagram ? generateLineData(mutualHexagram.id, dayCanChi) : [];
  const changedLines = changedHexagram ? generateLineData(changedHexagram.id, dayCanChi) : [];

  const formatLines = (lines, hexName) => {
    return lines.map(l => {
      const isThe = l.theUng === "1";
      const isUng = l.theUng === "2";
      const theUngLabel = isThe ? " (Thế)" : (isUng ? " (Ứng)" : "");
      const lucThanName = getLucThanName(l.lucThan);
      return `- Hào ${l.hao}: ${l.canChi} ${lucThanName}${theUngLabel}${l.phucThan ? ` [Phục: ${l.phucThan}]` : ""}${l.tuanKhong ? " [Tuần Không]" : ""} - ${l.lucTu}`;
    }).reverse().join("\n");
  };

  let prompt = `Bạn là một chuyên gia Kinh Dịch (I Ching) lão luyện. Hãy giải quẻ sau đây một cách chi tiết, sâu sắc và dễ hiểu.

### Thông tin quẻ:
- **Thời gian lập quẻ (Dương lịch):** ${metadata.thoiGianDuong}
- **Thời gian lập quẻ (Âm lịch):** ${metadata.thoiGianAm}
- **Can Chi Ngày:** ${metadata.dayCanChi}
- **Can Chi Tháng:** ${metadata.monthCanChi}
- **Can Chi Năm:** ${metadata.yearCanChi}

### 1. Quẻ Gốc: ${originalHexagram.name} (Họ ${originalHexagram.family})
${formatLines(originalLines, originalHexagram.name)}

- **Hào Động:** ${movingLines.length > 0 ? movingLines.join(", ") : "Không có"}
${dungThan ? `- **Dụng Thần được chọn:** Hào ${dungThan}` : ""}`;

  if (mutualHexagram) {
    prompt += `\n\n### 2. Quẻ Hỗ: ${mutualHexagram.name}\n${formatLines(mutualLines, mutualHexagram.name)}`;
  }

  if (changedHexagram) {
    prompt += `\n\n### 3. Quẻ Biến: ${changedHexagram.name}\n${formatLines(changedLines, changedHexagram.name)}`;
  }

  prompt += `\n\n### Yêu cầu giải quẻ:
1. **Phân tích quẻ Gốc, Hỗ, Biến**: Ý nghĩa biểu tượng của các quẻ này trong bối cảnh thời gian lập quẻ.
2. **Phân tích chi tiết các Hào**: 
   - Tập trung vào hào Thế, hào Ứng và hào Dụng Thần (nếu có).
   - Đánh giá sức mạnh của Dụng Thần dựa trên quan hệ với Nhật lệnh (Ngày) và Nguyệt lệnh (Tháng).
   - Phân tích sự biến đổi của hào động: từ hào Gốc sang hào Biến (Biến sinh, Biến khắc, Biến thoái, Biến vượng...).
3. **Xét tương quan Ngũ Hành**: 
   - Quan hệ giữa các Lục Thân (Phụ mẫu, Huynh đệ, Tử tôn, Thê tài, Quan quỷ).
   - Xem xét Tuần Không, Phục Thần nếu có sự xuất hiện đặc biệt.
4. **Kết luận và Lời khuyên**: Đưa ra nhận định tổng quát cho sự việc người hỏi quan tâm (thường là về Cát/Hung, Thành/Bại) và lời khuyên hành động.
5. **Phong thái**: Uy nghiêm, uyên bác nhưng dễ hiểu. Sử dụng Markdown để trình bày đẹp mắt. Trả lời bằng tiếng Việt.`;

  return prompt;
};
