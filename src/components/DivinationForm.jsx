import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  message,
  Card,
  Radio,
  Switch,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import { TRIGRAMS } from "../data/trigrams";
import { LunarCalendar } from "@dqcai/vn-lunar";

const { Option } = Select;

/**
 * DivinationForm component - input form for serial number OR manual lines
 * Note: Dụng Thần chỉ được chọn trực tiếp trên quẻ chính, không chọn trong form này
 */
export default function DivinationForm({ onDivinate }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("serial"); // 'serial' | 'manual' | 'datetime'

  // Effect to parse URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("t");
    const query = params.get("q");
    const movingLineParam = params.get("ml");
    const datetimeParam = params.get("dt");
    const viewDateParam = params.get("vd"); // viewDate parameter

    if (type === "s" && query) {
      setMode("serial");
      form.setFieldsValue({ serial: query });
    } else if (type === "m" && query) {
      setMode("manual");
      const lines = query.split("");
      const formLines = {};
      lines.forEach((line, index) => {
        formLines[`line${index + 1}`] = Number(line);
      });
      if (movingLineParam) {
        movingLineParam.split(",").forEach((ml) => {
          formLines[`moving${ml}`] = true;
        });
      }
      form.setFieldsValue(formLines);
    }

    // Set view date from URL or default to current date and time
    if (viewDateParam) {
      form.setFieldsValue({ viewDate: dayjs(viewDateParam) });
    } else {
      form.setFieldsValue({ viewDate: dayjs() }); // Default to current date and time
    }

    if (datetimeParam) {
      const dt = new Date(datetimeParam);
      form.setFieldsValue({
        day: dt.getDate(),
        month: dt.getMonth() + 1,
        year: dt.getFullYear(),
        hour: dt.getHours(),
        minute: dt.getMinutes(),
        viewDate: dayjs(dt), // Also set viewDate for datetime mode (disabled)
      });
    }
  }, [form]);

  // Effect to handle mode changes
  useEffect(() => {
    if (mode === "datetime") {
      const params = new URLSearchParams(window.location.search);
      const datetimeParam = params.get("dt");

      // Only set current time if not loading from URL
      if (!datetimeParam) {
        const now = new Date();
        form.setFieldsValue({
          day: now.getDate(),
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          hour: now.getHours(),
          minute: now.getMinutes(),
          viewDate: dayjs(), // Set viewDate to current time (will be disabled)
        });
      } else {
        // Update viewDate from datetimeParam
        const dt = new Date(datetimeParam);
        form.setFieldsValue({ viewDate: dayjs(dt) });
      }
    } else {
      // Set default view date to current date and time if not set (for serial/manual mode)
      const currentViewDate = form.getFieldValue("viewDate");
      if (!currentViewDate) {
        form.setFieldsValue({ viewDate: dayjs() }); // Default to current date and time
      }
    }
  }, [mode, form]);

  // Helper function to update viewDate from day/month/year/hour/minute in datetime mode
  const updateViewDateFromDatetime = () => {
    if (mode === "datetime") {
      const { day, month, year, hour, minute } = form.getFieldsValue();
      if (day && month && year && hour !== undefined && minute !== undefined) {
        const date = new Date(year, month - 1, day, hour, minute);
        form.setFieldsValue({ viewDate: dayjs(date) });
      }
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Get view date (default to current date and time)
      const viewDate = values.viewDate ? values.viewDate.toDate() : new Date();

      if (mode === "serial") {
        const serial = (values.serial || "").trim();

        // Validation: only numeric
        if (!serial || !/^\d+$/.test(serial)) {
          message.error("Chỉ được chứa số và không được để trống");
          setLoading(false);
          return;
        }

        await onDivinate({ type: "serial", serial, datetime: viewDate, question: values.question }, null);
      } else if (mode === "datetime") {
        const { day, month, year, hour, minute } = values;

        // Sử dụng @dqcai/vn-lunar để chuyển đổi sang âm lịch
        const calendar = LunarCalendar.fromSolar(day, month, year);
        const lunar = calendar.lunarDate;

        const lunarYear = lunar.year;
        const lunarMonth = lunar.month;
        const lunarDay = lunar.day;

        const yearBranch = ((lunarYear - 4) % 12) + 1;
        const hourBranch = (Math.floor((hour + 1) / 2) % 12) + 1;

        const upperSum = yearBranch + lunarMonth + lunarDay;
        let upperRemainder = upperSum % 8;
        if (upperRemainder === 0) upperRemainder = 8;

        const lowerSum = upperSum + hourBranch;
        let lowerRemainder = lowerSum % 8;
        if (lowerRemainder === 0) lowerRemainder = 8;

        const movingSum = lowerSum;
        let movingRemainder = movingSum % 6;
        if (movingRemainder === 0) movingRemainder = 6;

        const mapRemainderToId = (r) => (r === 8 ? 0 : r);
        const upperId = mapRemainderToId(upperRemainder);
        const lowerId = mapRemainderToId(lowerRemainder);

        const upperTrigram = TRIGRAMS[upperId];
        const lowerTrigram = TRIGRAMS[lowerId];

        if (!upperTrigram || !lowerTrigram) {
          throw new Error("Không thể tính được quẻ. Vui lòng kiểm tra lại ngày giờ.");
        }

        const lines = [...lowerTrigram.lines, ...upperTrigram.lines];
        // In datetime mode, viewDate is automatically synced from day/month/year/hour/minute
        // Use the date/time from the form inputs
        const selectedDate = new Date(year, month - 1, day, hour, minute);

        await onDivinate(
          {
            type: "manual",
            lines,
            movingLines: [movingRemainder],
            datetime: selectedDate,
            question: values.question,
          },
          null
        );
      } else {
        const lines = [];
        for (let i = 1; i <= 6; i++) {
          const val = values[`line${i}`];
          if (val !== 0 && val !== 1) {
            message.error("Vui lòng chọn đủ Âm/Dương cho 6 hào");
            setLoading(false);
            return;
          }
          lines.push(val);
        }

        const movingLines = [];
        for (let i = 1; i <= 6; i++) {
          if (values[`moving${i}`]) {
            movingLines.push(i);
          }
        }

        await onDivinate(
          {
            type: "manual",
            lines,
            movingLines: movingLines,
            datetime: viewDate,
            question: values.question,
          },
          null
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
          question: "",
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
          viewDate: dayjs(), // Default to current date and time
        }}
      >
        <Form.Item
          name="question"
          label={<span className="font-semibold text-gray-700">Câu hỏi / Sự việc cần xem:</span>}
          className="mb-4"
        >
          <Input.TextArea
            placeholder="Ví dụ: Xem về tài vận tháng này, Tìm đồ vật bị mất, Xem về sức khỏe người thân..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            className="rounded-md"
          />
        </Form.Item>

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
              name="viewDate"
              label={
                <span className="font-semibold text-gray-700">
                  Ngày giờ xem quẻ:
                </span>
              }
              className="min-w-[200px]"
            >
              <DatePicker
                size="large"
                showTime
                format="DD/MM/YYYY HH:mm"
                className="w-full"
                placeholder="Chọn ngày giờ"
              />
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
                    <Select
                      className="min-w-[70px]"
                      onChange={updateViewDateFromDatetime}
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <Option key={d} value={d}>
                          {d}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="month" noStyle>
                    <Select
                      className="min-w-[70px]"
                      onChange={updateViewDateFromDatetime}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <Option key={m} value={m}>
                          {m}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="year" noStyle>
                    <Select
                      className="min-w-[90px]"
                      onChange={updateViewDateFromDatetime}
                    >
                      {Array.from(
                        { length: 100 },
                        (_, i) => new Date().getFullYear() - 50 + i
                      ).map((y) => (
                        <Option key={y} value={y}>
                          {y}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </Form.Item>
              <Form.Item label="Giờ lập quẻ" className="mb-0">
                <div className="flex gap-2">
                  <Form.Item name="hour" noStyle>
                    <Select
                      className="min-w-[70px]"
                      onChange={updateViewDateFromDatetime}
                    >
                      {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                        <Option key={h} value={h}>
                          {h.toString().padStart(2, "0")}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="minute" noStyle>
                    <Select
                      className="min-w-[70px]"
                      onChange={updateViewDateFromDatetime}
                    >
                      {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                        <Option key={m} value={m}>
                          {m.toString().padStart(2, "0")}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </Form.Item>
            </div>

            <Form.Item
              name="viewDate"
              label={
                <span className="font-semibold text-gray-700">
                  Ngày giờ xem quẻ:
                </span>
              }
              className="min-w-[200px]"
              tooltip="Ngày giờ xem quẻ tự động lấy từ ngày giờ lập quẻ ở trên"
            >
              <DatePicker
                size="large"
                showTime
                format="DD/MM/YYYY HH:mm"
                className="w-full"
                placeholder="Chọn ngày giờ"
                disabled
              />
            </Form.Item>

            <div className="flex flex-wrap items-end gap-4">
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
              name="viewDate"
              label={
                <span className="font-semibold text-gray-700">
                  Ngày giờ xem quẻ:
                </span>
              }
              className="min-w-[200px]"
            >
              <DatePicker
                size="large"
                showTime
                format="DD/MM/YYYY HH:mm"
                className="w-full"
                placeholder="Chọn ngày giờ"
              />
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
