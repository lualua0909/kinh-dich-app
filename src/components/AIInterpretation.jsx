import React, { useState } from "react";
import { Button, Card, Spin, Modal, message } from "antd";
import { RobotOutlined, ExpandOutlined, OpenAIOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import { interpretHexagram } from "../utils/openaiService";

const AIInterpretation = ({ divinationData }) => {
  const [loading, setLoading] = useState(false);
  const [interpretation, setInterpretation] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isApiKeyMissing = !import.meta.env.VITE_OPENAI_API_KEY;

  const handleInterpret = async () => {
    if (isApiKeyMissing) {
      message.error("Thiếu VITE_OPENAI_API_KEY trong biến môi trường!");
      return;
    }
    setLoading(true);
    try {
      const result = await interpretHexagram(divinationData);
      setInterpretation(result);
      setIsModalVisible(true);
    } catch (error) {
      console.error("AI Interpretation Error:", error);
      message.error(error.message || "Không thể kết nối với ChatGPT AI. Vui lòng kiểm tra API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <Card 
        className="bg-green-50 border-green-200 shadow-sm"
        title={
          <div className="flex items-center gap-2 text-green-800">
            <RobotOutlined />
            <span>Trợ lý ChatGPT AI</span>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-4">
          {isApiKeyMissing ? (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-amber-700 text-xs">
              <strong>Lưu ý:</strong> Tính năng này yêu cầu <code>VITE_OPENAI_API_KEY</code> trong tệp <code>.env</code>.
            </div>
          ) : (
            <p className="text-sm text-green-600 text-center">
              Sử dụng trí tuệ nhân tạo GPT-5-Nano để tổng hợp và luận giải chi tiết về quẻ dịch của bạn.
            </p>
          )}
          <Button 
            type="primary" 
            icon={<RobotOutlined />} 
            loading={loading}
            disabled={isApiKeyMissing}
            onClick={handleInterpret}
            className={`${isApiKeyMissing ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
          >
            {interpretation ? "Luận giải lại" : "Luận giải bằng ChatGPT"}
          </Button>
          
          {interpretation && !loading && (
            <div className="w-full mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-green-800">Kết quả luận giải:</span>
                <Button 
                  type="link" 
                  icon={<ExpandOutlined />} 
                  onClick={() => setIsModalVisible(true)}
                >
                  Xem toàn màn hình
                </Button>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-100 max-h-96 overflow-y-auto prose prose-green prose-sm max-w-none">
                <ReactMarkdown>{interpretation}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2 border-b pb-3">
            <RobotOutlined className="text-green-600" />
            <span className="text-lg font-bold">Luận Giải Chi Tiết Bởi ChatGPT (GPT-5-Nano)</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={1000}
        centered
        className="ai-modal"
      >
        <div className="prose prose-green prose-base max-w-none p-4">
          <ReactMarkdown>{interpretation}</ReactMarkdown>
        </div>
      </Modal>
    </div>
  );
};

export default AIInterpretation;
