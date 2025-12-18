import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  message,
  Tooltip,
  Card,
  Radio,
  Switch,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { getDungThanInfo } from "../data/dungThan";

const { Option } = Select;

/**
 * DivinationForm component - input form for serial number OR manual lines and dụng thần
 */
export default function DivinationForm({ onDivinate }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDungThan, setSelectedDungThan] = useState(null);
  const [mode, setMode] = useState("serial"); // 'serial' | 'manual'

  const dungThanOptions = [
    { value: "Phụ Mẫu", label: "Phụ Mẫu" },
    { value: "Huynh Đệ", label: "Huynh Đệ" },
    { value: "Tử Tôn", label: "Tử Tôn" },
    { value: "Thê Tài", label: "Thê Tài" },
    { value: "Quan Quỷ", label: "Quan Quỷ" },
  ];

  const handleDungThanChange = (value) => {
    setSelectedDungThan(value ? getDungThanInfo(value) : null);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (mode === "serial") {
        const serial = (values.serial || "").trim();

        // Validation: only numeric
        if (!serial || !/^\d+$/.test(serial)) {
          message.error("Serial chỉ được chứa số và không được để trống");
          setLoading(false);
          return;
        }

        await onDivinate({ type: "serial", serial }, values.dungThan);
      } else {
        // Manual mode: collect six lines and moving line
        const lines = [];
        for (let i = 1; i <= 6; i++) {
          const key = `line${i}`;
          const movingKey = `moving${i}`;
          const val = values[key];
          if (val !== 0 && val !== 1) {
            message.error("Vui lòng chọn đủ Âm/Dương cho 6 hào");
            setLoading(false);
            return;
          }
          lines.push(val);
        }

        // Determine moving line from switches
        const movingLines = [];
        for (let i = 1; i <= 6; i++) {
          const movingKey = `moving${i}`;
          if (values[movingKey]) {
            movingLines.push(i);
          }
        }

        if (movingLines.length > 1) {
          message.error("Chỉ được chọn tối đa một hào động");
          setLoading(false);
          return;
        }

        const movingLine = movingLines.length === 1 ? movingLines[0] : null;

        await onDivinate(
          {
            type: "manual",
            lines,
            movingLine: movingLine === "none" ? null : Number(movingLine),
          },
          values.dungThan
        );
      }
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi lập quẻ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-parchment-300">
      <div className="mb-4">
        <Radio.Group
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="serial">Lập quẻ bằng Serial</Radio.Button>
          <Radio.Button value="manual">Lập quẻ Lục hào thủ công</Radio.Button>
        </Radio.Group>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          line1: 1,
          line2: 1,
          line3: 1,
          line4: 1,
          line5: 1,
          line6: 1,
        }}
      >
        {mode === "serial" && (
          <div className="flex flex-wrap items-end gap-4">
            <Form.Item
              name="serial"
              label={
                <span className="font-semibold text-gray-700">
                  Serial Tiên:
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng nhập Serial" },
                { pattern: /^\d+$/, message: "Chỉ được nhập số" },
              ]}
              className="flex-1 min-w-[200px]"
            >
              <Input
                placeholder="Nhập số Serial"
                size="large"
                className="font-mono"
                maxLength={20}
              />
            </Form.Item>

            <Form.Item
              name="dungThan"
              label={
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                  Dụng Thần:
                  <Tooltip
                    title={
                      <div className="text-xs">
                        Chọn dụng thần để xem thông tin chi tiết về ý nghĩa và
                        ứng dụng
                      </div>
                    }
                  >
                    <InfoCircleOutlined className="text-blue-500 cursor-help" />
                  </Tooltip>
                </span>
              }
              className="min-w-[180px]"
            >
              <Select
                placeholder="Chọn dụng thần"
                size="large"
                allowClear
                className="w-full"
                onChange={handleDungThanChange}
              >
                {dungThanOptions.map((option) => {
                  const info = getDungThanInfo(option.value);
                  return (
                    <Option
                      key={option.value}
                      value={option.value}
                      title={
                        info
                          ? `${info.label}: ${info.description}`
                          : option.label
                      }
                    >
                      <Tooltip
                        title={
                          info ? (
                            <div className="max-w-md">
                              <div className="font-bold mb-2">{info.label}</div>
                              <div className="text-xs space-y-1">
                                <div>
                                  <span className="font-semibold">
                                    Vai vế, Chức vụ, Địa Vị:
                                  </span>{" "}
                                  {info.vaiVe}
                                </div>
                                <div>
                                  <span className="font-semibold">
                                    Đồ dùng, phụ kiện:
                                  </span>{" "}
                                  {info.doDung}
                                </div>
                                <div>
                                  <span className="font-semibold">
                                    Mang tính chất:
                                  </span>{" "}
                                  {info.mangTinhChat}
                                </div>
                                <div>
                                  <span className="font-semibold">
                                    Thời tiết:
                                  </span>{" "}
                                  {info.thoiTiet}
                                </div>
                                <div>
                                  <span className="font-semibold">Cơ thể:</span>{" "}
                                  {info.coThe}
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-300">
                                  <div className="text-green-300">
                                    <span className="font-semibold">Cát:</span>{" "}
                                    {info.triTheCat}
                                  </div>
                                  <div className="text-red-300 mt-1">
                                    <span className="font-semibold">
                                      Không Cát:
                                    </span>{" "}
                                    {info.triTheKhongCat}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            option.label
                          )
                        }
                        placement="right"
                        overlayStyle={{ maxWidth: "500px" }}
                      >
                        <span>{option.label}</span>
                      </Tooltip>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="bg-amber-600 hover:bg-amber-700 border-amber-600"
              >
                Lập Quẻ
              </Button>
            </Form.Item>
          </div>
        )}

        {mode === "manual" && (
          <>
            <Card
              size="small"
              className="mb-4 bg-gray-50"
              title={<span className="font-semibold">Lập quẻ Lục hào</span>}
            >
              <div className="grid grid-cols-[auto,auto,auto,1fr] gap-y-2 gap-x-4 items-center">
                {[6, 5, 4, 3, 2, 1].map((hao) => (
                  <React.Fragment key={hao}>
                    <div className="text-sm text-gray-700">
                      Hào{" "}
                      {hao === 6
                        ? "Thượng"
                        : hao === 5
                        ? "Ngũ"
                        : hao === 4
                        ? "Tứ"
                        : hao === 3
                        ? "Tam"
                        : hao === 2
                        ? "Nhị"
                        : "Sơ"}
                      :
                    </div>
                    <Form.Item
                      name={`line${hao}`}
                      className="mb-0"
                      rules={[{ required: true, message: "Chọn Âm/Dương" }]}
                      initialValue={1}
                    >
                      <Select
                        size="small"
                        className="w-28"
                        placeholder="Âm/Dương"
                      >
                        <Select.Option value={1}>Dương (—)</Select.Option>
                        <Select.Option value={0}>Âm (--)</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name={`moving${hao}`}
                      valuePropName="checked"
                      className="mb-0"
                    >
                      <Switch size="small" />
                    </Form.Item>
                    <div className="text-xs text-gray-500">
                      {hao === 6
                        ? "Lần gieo 6"
                        : hao === 5
                        ? "Lần gieo 5"
                        : hao === 4
                        ? "Lần gieo 4"
                        : hao === 3
                        ? "Lần gieo 3"
                        : hao === 2
                        ? "Lần gieo 2"
                        : "Lần gieo 1"}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </Card>

            <Form.Item
              name="dungThan"
              label={
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                  Dụng Thần:
                  <Tooltip
                    title={
                      <div className="text-xs">
                        Chọn dụng thần để xem thông tin chi tiết về ý nghĩa và
                        ứng dụng
                      </div>
                    }
                  >
                    <InfoCircleOutlined className="text-blue-500 cursor-help" />
                  </Tooltip>
                </span>
              }
              className="min-w-[180px]"
            >
              <Select
                placeholder="Chọn dụng thần"
                size="large"
                allowClear
                className="w-full"
                onChange={handleDungThanChange}
              >
                {dungThanOptions.map((option) => {
                  const info = getDungThanInfo(option.value);
                  return (
                    <Option
                      key={option.value}
                      value={option.value}
                      title={
                        info
                          ? `${info.label}: ${info.description}`
                          : option.label
                      }
                    >
                      <span>{option.label}</span>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="bg-amber-600 hover:bg-amber-700 border-amber-600"
              >
                Lập Quẻ Lục hào
              </Button>
            </Form.Item>
          </>
        )}
      </Form>
    </div>
  );
}
