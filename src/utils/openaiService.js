import OpenAI from "openai";
import { generateLineData } from "../data/lines";
import { getLucThanName } from "../data/lucThuInfo";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const interpretHexagram = async (divinationData) => {
  if (!API_KEY) {
    throw new Error("VITE_OPENAI_API_KEY is not defined in environment variables.");
  }

  const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true // Required for client-side usage in Vite
  });

  const prompt = constructPrompt(divinationData);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content: "Bạn là một chuyên gia Kinh Dịch (I Ching). Hãy luận giải quẻ một cách CỰC KỲ NGẮN GỌN, súc tích, đi thẳng vào vấn đề. Tránh giải thích dài dòng về lý thuyết."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error Detail:", error);
    const errorMessage = error.message || "Lỗi không xác định từ OpenAI API";
    if (errorMessage.includes("quota") || errorMessage.includes("insufficient_quota")) {
      throw new Error("Hạn mức (Quota) của OpenAI API Key đã hết hoặc chưa được kích hoạt. Vui lòng kiểm tra tại OpenAI Dashboard.");
    }
    throw new Error(errorMessage);
  }
};

export const suggestDungThan = async (question, divinationData) => {
  if (!API_KEY) {
    throw new Error("VITE_OPENAI_API_KEY is not defined in environment variables.");
  }

  const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true
  });

  const { originalHexagram, metadata } = divinationData;
  const dayCanChi = metadata.dayCanChi;
  const lines = generateLineData(originalHexagram.id, dayCanChi);

  const linesInfo = lines.map(l => `Hào ${l.hao}: ${getLucThanName(l.lucThan)}`).reverse().join("\n");

  const prompt = `Câu hỏi của người dùng: "${question}"

Dữ liệu Lục Thân của quẻ ${originalHexagram.name}:
${linesInfo}

Dựa trên kiến thức về Kinh Dịch, hãy xác định "Dụng Thần" phù hợp nhất cho câu hỏi này trong số 5 Lục Thân (Phụ mẫu, Huynh đệ, Tử tôn, Thê tài, Quan quỷ).

Yêu cầu trả về định dạng JSON duy nhất như sau:
{
  "lucThan": "Tên Lục Thân gợi ý (viết đầy đủ, ví dụ: 'Thê tài')",
  "hao": [Danh sách các số hào tương ứng trong quẻ trên (1-6)],
  "reason": "Lý do lựa chọn ngắn gọn trong 1 câu"
}

Lưu ý: Chỉ trả về JSON, không giải thích thêm.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content: `Bạn là chuyên gia phân tích Dụng Thần trong Kinh Dịch. Hãy dựa vào các quy tắc sau để xác định Dụng Thần:
          - Phụ Mẫu: Cha mẹ, thầy dạy, bề trên, nhà cửa, đất đai, giấy tờ, hợp đồng, bằng cấp, tin tức, xe cộ.
          - Huynh Đệ: Anh em, bạn bè, đồng nghiệp, sự cạnh tranh, cản trở, hao tốn tiền bạc.
          - Tử Tôn: Con cái, cháu chắt, vật nuôi, niềm vui, bác sĩ, công an, khắc chế tai họa (khắc Quan Quỷ), thuốc men.
          - Thê Tài: Tiền bạc, tài sản, vợ, bạn gái, lợi nhuận, lương bổng, đồ ăn thức uống.
          - Quan Quỷ: Công việc, sự nghiệp, chồng, bạn trai, quan chức, luật pháp, bệnh tật, tai họa, lo âu, vong linh.
          
          Bạn chỉ trả về dữ liệu định dạng JSON.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI Suggestion Error:", error);
    throw new Error("Không thể gợi ý Dụng Thần lúc này.");
  }
};

const constructPrompt = (data) => {
  const { originalHexagram, mutualHexagram, changedHexagram, movingLines, metadata, dungThan } = data;

  const dayCanChi = metadata.dayCanChi;
  const originalLines = generateLineData(originalHexagram.id, dayCanChi);
  const mutualLines = mutualHexagram ? generateLineData(mutualHexagram.id, dayCanChi) : [];
  const changedLines = changedHexagram ? generateLineData(changedHexagram.id, dayCanChi) : [];

  const formatLines = (lines) => {
    return lines.map(l => {
      const isThe = l.theUng === "1";
      const isUng = l.theUng === "2";
      const theUngLabel = isThe ? " (Thế)" : (isUng ? " (Ứng)" : "");
      const lucThanName = getLucThanName(l.lucThan);
      return `- Hào ${l.hao}: ${l.canChi} ${lucThanName}${theUngLabel}${l.phucThan ? ` [Phục: ${l.phucThan}]` : ""}${l.tuanKhong ? " [Tuần Không]" : ""} - ${l.lucTu}`;
    }).reverse().join("\n");
  };

  let prompt = `Thực hiện luận giải quẻ dịch theo các bước phân tích chuyên sâu nhưng trình bày thật NGẮN GỌN:

### Dữ liệu quẻ:
- **Quẻ Gốc:** ${originalHexagram.name} (Họ ${originalHexagram.family})
${formatLines(originalLines)}

${mutualHexagram ? `- **Quẻ Hỗ:** ${mutualHexagram.name}\n${formatLines(mutualLines)}` : ""}
${changedHexagram ? `- **Quẻ Biến:** ${changedHexagram.name}\n${formatLines(changedLines)}` : ""}

- **Hào Động:** ${movingLines.length > 0 ? movingLines.join(", ") : "Tĩnh"}
- **Dụng Thần:** ${dungThan ? `Hào ${dungThan}` : "Chưa chọn"}
- **Ngày:** ${metadata.dayCanChi}, **Tháng:** ${metadata.monthCanChi}

### Các bước luận giải (Yêu cầu viết súc tích):
1. **Phân tích Quẻ (Gốc/Hỗ/Biến):** Ý nghĩa biểu tượng nhanh.
2. **Xét Dụng Thần & Thế/Ứng:** Đánh giá vượng/suy/hưu/tù dựa trên Nhật, Nguyệt lệnh.
3. **Phân tích Hào Động:** Hào động biến gì? Sinh hay khắc Dụng Thần/Thế hào?
4. **Các yếu tố đặc biệt:** Tuần không, Phục thần (nếu có ảnh hưởng lớn).
5. **Kết luận Cát/Hung:** Dự báo và lời khuyên cuối cùng.

*Yêu cầu: Tổng độ dài không quá 300 chữ. Đi thẳng vào kết quả phân tích.*`;

  return prompt;
};
