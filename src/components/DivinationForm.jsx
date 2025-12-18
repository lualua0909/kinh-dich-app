import React, { useState, useEffect } from "react";
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
import { LunarCalendar } from "@dqcai/vn-lunar";
import { TRIGRAMS } from "../data/trigrams";

const { Option } = Select;

/**
 * DivinationForm component - input form for serial number OR manual lines and dụng thần
 */
export default function DivinationForm({ onDivinate }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDungThan, setSelectedDungThan] = useState(null);
  const [mode, setMode] = useState("serial"); // 'serial' | 'manual' | 'datetime'

  useEffect(() => {
    if (mode === "datetime") {
      const now = new Date();
      form.setFieldsValue({
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        hour: now.getHours(),
        minute: now.getMinutes(),
      });
    }
  }, [mode, form]);

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
          message.error("Chỉ được chứa số và không được để trống");
          setLoading(false);
          return;
        }

        await onDivinate({ type: "serial", serial }, values.dungThan);
      } else if (mode === "datetime") {
        const { day, month, year, hour, minute } = values;
        
        // Convert to Lunar
        const lunarObj = LunarCalendar.fromSolar(day, month, year);
        // Access nested lunarDate object
        const lunarDate = lunarObj.lunarDate;
        
        const lunarYear = lunarDate.year;
        const lunarMonth = lunarDate.month; 
        const lunarDay = lunarDate.day; 

        // Year Branch (Chi Năm): 1=Tý..12=Hợi
        // Formula: (year - 4) % 12 + 1. 
        // 1984 (Giáp Tý) -> (1984-4)%12 = 0 -> +1 = 1 (Tý). Correct.
        const yearBranch = ((lunarYear - 4) % 12) + 1;

        // Hour Branch (Chi Giờ): 23-01=Tý(1).
        // 23:00 - 00:59 => Tý (1)
        // 01:00 - 02:59 => Sửu (2)
        // ...
        // Formula: floor((hour + 1) / 2) % 12 + 1
        // Test: 23 => (24/2)%12 + 1 = 0+1 = 1.
        // Test: 0 => (1/2)%12 + 1 = 0+1 = 1.
        // Test: 1 => (2/2)%12 + 1 = 1+1 = 2 (Sửu). Correct.
        const hourBranch = (Math.floor((hour + 1) / 2) % 12) + 1;

        // Thượng quái: (Năm + Tháng + Ngày) % 8
        const upperSum = yearBranch + lunarMonth + lunarDay;
        let upperRemainder = upperSum % 8;
        if (upperRemainder === 0) upperRemainder = 8; 

        // Hạ quái: (Năm + Tháng + Ngày + Giờ) % 8
        const lowerSum = upperSum + hourBranch;
        let lowerRemainder = lowerSum % 8;
        if (lowerRemainder === 0) lowerRemainder = 8; 

        // Hào động: (Năm + Tháng + Ngày + Giờ) % 6
        const movingSum = lowerSum;
        let movingRemainder = movingSum % 6;
        if (movingRemainder === 0) movingRemainder = 6;

        // Map Remainder to ID (0=Khôn, 1-7 match)
        const mapRemainderToId = (r) => (r === 8 ? 0 : r);
        const upperId = mapRemainderToId(upperRemainder);
        const lowerId = mapRemainderToId(lowerRemainder);

        const upperTrigram = TRIGRAMS[upperId];
        const lowerTrigram = TRIGRAMS[lowerId];

        if (!upperTrigram || !lowerTrigram) {
             console.error("Invalid Trigrams:", { upperId, lowerId, TRIGRAMS, upperSum, upperRemainder, lowerSum, lowerRemainder });
             throw new Error("Không thể tính được quẻ. Vui lòng kiểm tra lại ngày giờ.");
        }

        const lines = [
          ...lowerTrigram.lines,
          ...upperTrigram.lines
        ];

        const selectedDate = new Date(year, month - 1, day, hour, minute);

        await onDivinate(
          {
            type: "manual",
            lines,
            movingLine: movingRemainder,
            datetime: selectedDate,
          },
          values.dungThan
        );

      } else {
        // Manual mode: collect six lines and moving line
        const lines = [];
        for (let i = 1; i <= 6; i++) {
          const key = `line${i}`;
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
      console.error(error);
      message.error(error.message || "Có lỗi xảy ra khi lập quẻ");
    } finally {
      setLoading(false);
    }
  };

  const currentDate = new Date();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-parchment-300">
      <div className="mb-4">
        <Radio.Group
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="serial">Lập quẻ bằng số</Radio.Button>
          <Radio.Button value="manual">Lập quẻ thủ công</Radio.Button>
          <Radio.Button value="datetime">Lập quẻ theo thời gian</Radio.Button>
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
          day: currentDate.getDate(),
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          hour: currentDate.getHours(),
          minute: currentDate.getMinutes(),
        }}
      >
        {mode === "serial" && (
          <div className="flex flex-wrap items-end gap-4">
            <Form.Item
              name="serial"
              rules={[
                { required: true, message: "Vui lòng nhập" },
                { pattern: /^\d+$/, message: "Chỉ được nhập số" },
              ]}
              className="flex-1 min-w-[200px]"
            >
              <Input
                placeholder="Nhập số"
                size="large"
                className="font-mono"
                maxLength={20}
                type="number"
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
                              {/* ... info details ... */}
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

        {mode === "datetime" && (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item label="Ngày lập quẻ" className="mb-0">
                        <div className="flex gap-2">
                             <Form.Item name="day" noStyle>
                                 <Select className="min-w-[70px]">
                                     {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                                         <Option key={d} value={d}>{d}</Option>
                                     ))}
                                 </Select>
                             </Form.Item>
                             <Form.Item name="month" noStyle>
                                 <Select className="min-w-[70px]">
                                     {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                         <Option key={m} value={m}>{m}</Option>
                                     ))}
                                 </Select>
                             </Form.Item>
                             <Form.Item name="year" noStyle>
                                 <Select className="min-w-[90px]">
                                     {Array.from({length: 100}, (_, i) => new Date().getFullYear() - 50 + i).map(y => (
                                         <Option key={y} value={y}>{y}</Option>
                                     ))}
                                 </Select>
                             </Form.Item>
                        </div>
                    </Form.Item>
                    <Form.Item label="Giờ lập quẻ" className="mb-0">
                         <div className="flex gap-2">
                             <Form.Item name="hour" noStyle>
                                 <Select className="min-w-[70px]">
                                     {Array.from({length: 24}, (_, i) => i).map(h => (
                                         <Option key={h} value={h}>{h.toString().padStart(2, '0')}</Option>
                                     ))}
                                 </Select>
                             </Form.Item>
                             <Form.Item name="minute" noStyle>
                                 <Select className="min-w-[70px]">
                                     {Array.from({length: 60}, (_, i) => i).map(m => (
                                         <Option key={m} value={m}>{m.toString().padStart(2, '0')}</Option>
                                     ))}
                                 </Select>
                             </Form.Item>
                         </div>
                    </Form.Item>
                </div>
                
                <div className="flex flex-wrap items-end gap-4">
                 <Form.Item
                  name="dungThan"
                  label={
                    <span className="font-semibold text-gray-700 flex items-center gap-2">
                      Dụng Thần:
                      <Tooltip title="Chọn dụng thần">
                        <InfoCircleOutlined className="text-blue-500 cursor-help" />
                      </Tooltip>
                    </span>
                  }
                  className="min-w-[180px]"
                >
                  <Select placeholder="Chọn dụng thần" size="large" allowClear onChange={handleDungThanChange}>
                    {dungThanOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
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
                      <Radio.Group
                        block
                        options={[
                          {
                            label: (
                              <div className="flex items-center justify-center h-full">
                                <div className="h-2 w-12 bg-gray-500 rounded-full dark:bg-gray-300" />
                              </div>
                            ),
                            value: 1,
                          },
                          {
                            label: (
                              <div className="flex items-center justify-center h-full gap-1">
                                <div className="h-2 w-5 bg-gray-500 rounded-full dark:bg-gray-300" />
                                <div className="h-2 w-1 bg-transparent" />
                                <div className="h-2 w-5 bg-gray-500 rounded-full dark:bg-gray-300" />
                              </div>
                            ),
                            value: 0,
                          },
                        ]}
                        optionType="button"
                        buttonStyle="solid"
                      />
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
