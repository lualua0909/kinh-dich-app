import React from "react";
import { Table, Card, Tooltip, Drawer } from "antd";
import { generateLineData } from "../data/lines";
import { getDungThanInfo } from "../data/dungThan";
import {
  thanhLongLucThanInfo,
  bachHoLucThanInfo,
  cauTranLucThanInfo,
  chuTuocLucThanInfo,
  dangXaLucThanInfo,
  huyenVuLucThanInfo,
  thanhLongDiaChiInfo,
  bachHoDiaChiInfo,
  huyenVuDiaChiInfo,
  dangXaDiaChiInfo,
  chuTuocDiaChiInfo,
  cauTranDiaChiInfo,
} from "../data/lucThuInfo";
import { getHexagramOmen } from "../data/hexagramOmens";
/**
 * InterpretationTables component - displays TỨC ĐIỀU PHÁN SÀO and NHÂN ĐOÁN TÁO CAO tables
 * TỨC ĐIỀU PHÁN SÀO: uses original hexagram
 * NHÂN ĐOÁN TÁO CAO: uses changed hexagram
 */
export default function InterpretationTables({
  originalHexagram,
  changedHexagram,
  movingLine,
  dungThan = null,
}) {
  if (!originalHexagram) {
    return null;
  }

  // Line data for TỨC ĐIỀU PHÁN SÀO (from original hexagram)
  const lineData1 = generateLineData(originalHexagram.id, movingLine).reverse();
  const lines1 = [...originalHexagram.lines].reverse(); // Now lines[0] = hào 6, lines[5] = hào 1

  // Line data for NHÂN ĐOÁN TÁO CAO (from changed hexagram)
  const lineData2 = changedHexagram
    ? generateLineData(changedHexagram.id, null).reverse()
    : [];
  const lines2 = changedHexagram ? [...changedHexagram.lines].reverse() : [];

  // Component to render hào line
  const renderHaoLine = (hao, lineType, isMoving) => {
    const isYang = lineType === 1;
    const lineColor = isMoving ? "bg-red-600" : "bg-gray-800";

    return (
      <div className="flex items-center justify-center">
        {isYang ? (
          // Yang line (solid)
          <div className={`h-2 w-12 ${lineColor} rounded-full`} />
        ) : (
          // Yin line (broken)
          <div className="flex gap-1 items-center">
            <div className={`h-2 w-5 ${lineColor} rounded-full`} />
            <div className="h-2 w-1 bg-transparent" />
            <div className={`h-2 w-5 ${lineColor} rounded-full`} />
          </div>
        )}
      </div>
    );
  };

  // Ngũ hành tương sinh / tương khắc data (dùng cho tooltip)
  const nguHanhRelations = {
    Mộc: {
      sinh: "Hỏa",
      duocSinh: "Thủy",
      khac: "Thổ",
      biKhac: "Kim",
    },
    Hỏa: {
      sinh: "Thổ",
      duocSinh: "Mộc",
      khac: "Kim",
      biKhac: "Thủy",
    },
    Thổ: {
      sinh: "Kim",
      duocSinh: "Hỏa",
      khac: "Thủy",
      biKhac: "Mộc",
    },
    Kim: {
      sinh: "Thủy",
      duocSinh: "Thổ",
      khac: "Mộc",
      biKhac: "Hỏa",
    },
    Thủy: {
      sinh: "Mộc",
      duocSinh: "Kim",
      khac: "Hỏa",
      biKhac: "Thổ",
    },
  };
  // Function to get Ngũ Hành from Địa Chi
  const getNguHanhFromDiaChi = (diaChi) => {
    const nguHanhMap = {
      Dần: { name: "Mộc", color: "text-green-600 bg-green-50" },
      Mão: { name: "Mộc", color: "text-green-600 bg-green-50" },
      Tỵ: { name: "Hỏa", color: "text-red-600 bg-red-50" },
      Ngọ: { name: "Hỏa", color: "text-red-600 bg-red-50" },
      Thìn: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
      Tuất: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
      Sửu: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
      Mùi: { name: "Thổ", color: "text-amber-800 bg-amber-50" },
      Thân: { name: "Kim", color: "text-yellow-600 bg-yellow-50" },
      Dậu: { name: "Kim", color: "text-yellow-600 bg-yellow-50" },
      Hợi: { name: "Thủy", color: "text-blue-600 bg-blue-50" },
      Tý: { name: "Thủy", color: "text-blue-600 bg-blue-50" },
    };
    return nguHanhMap[diaChi] || null;
  };

  const renderNguHanhTooltip = (nguHanhName) => {
    const rel = nguHanhRelations[nguHanhName];
    if (!rel) return nguHanhName;

    return (
      <div className="max-w-xs text-xs space-y-2">
        <div className="font-bold mb-1 text-sm">{nguHanhName}</div>
        <div>
          <span className="font-semibold text-green-600">Tương sinh:</span>
          <div className="ml-2 mt-1">
            <div>
              → Sinh ra: <span className="font-bold">{rel.sinh}</span>
            </div>
            <div>
              ← Được sinh bởi: <span className="font-bold">{rel.duocSinh}</span>
            </div>
          </div>
        </div>
        <div className="pt-2 border-t border-gray-300">
          <span className="font-semibold text-red-600">Tương khắc:</span>
          <div className="ml-2 mt-1">
            <div>
              → Khắc: <span className="font-bold">{rel.khac}</span>
            </div>
            <div>
              ← Bị khắc bởi: <span className="font-bold">{rel.biKhac}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mapping Lục Tú / Lục Thân → mã phân loại (ví dụ: Thanh Long + Phụ Mẫu → TL-PM)
  const lucTuCodeMap = {
    "Thanh Long": "TL",
    "Chu Tước": "CT",
    "Câu Trần": "CTr",
    "Đằng Xà": "ĐX",
    "Bạch Hổ": "BH",
    "Huyền Vũ": "HV",
  };

  const lucThanCodeMap = {
    "Phụ Mẫu": "PM",
    "Huynh Đệ": "HD",
    "Tử Tôn": "TT",
    "Thê Tài": "TTi",
    "Quan Quỷ": "QQ",
  };

  // Mã Địa Chi (Tý, Sửu, Dần...) dùng cho phân loại Lục Tú lâm Địa Chi
  const diaChiCodeMap = {
    Tý: "TY",
    Sửu: "SU",
    Dần: "DN",
    Mão: "MA",
    Thìn: "TH",
    Tỵ: "TỴ",
    Ngọ: "NG",
    Mùi: "MU",
    Thân: "TN",
    Dậu: "DA",
    Tuất: "TU",
    Hợi: "HO",
  };

  // (thanhLongDiaChiInfo được định nghĩa phía dưới, sau phần lucTuInfo)

  // State for fullscreen Lục Thú drawer
  const [lucTuDrawerData, setLucTuDrawerData] = React.useState(null);

  const openLucTuDrawer = (lucTu, record) => {
    if (!lucTu) return;
    setLucTuDrawerData({ lucTu, record });
  };

  const closeLucTuDrawer = () => {
    setLucTuDrawerData(null);
  };

  const getClassification = (lucTu, lucThan) => {
    if (!lucTu || !lucThan) return null;
    const tuCode = lucTuCodeMap[lucTu] || "--";
    const thanCode = lucThanCodeMap[lucThan] || "--";
    const code = `${tuCode}-${thanCode}`;
    return {
      label: `${lucTu} lâm ${lucThan}`,
      code,
    };
  };

  const getClassificationDiaChi = (lucTu, canChi) => {
    if (!lucTu || !canChi) return null;

    const parts = canChi.split(" ");
    const diaChi = parts[parts.length - 1];
    const tuCode = lucTuCodeMap[lucTu] || "--";
    const chiCode = diaChiCodeMap[diaChi] || "--";
    const code = `${tuCode}-${chiCode}`;

    return {
      label: `${lucTu} lâm ${diaChi}`,
      code,
    };
  };

  // Function to render Can Chi with Ngũ Hành
  const renderCanChi = (canChi) => {
    if (!canChi) return "-";

    // Extract Địa Chi (part after space)
    const parts = canChi.split(" ");
    const diaChi = parts[parts.length - 1];
    const nguHanh = getNguHanhFromDiaChi(diaChi);

    return (
      <div className="flex flex-col items-center gap-1">
        <span>{canChi}</span>
        {nguHanh && (
          <Tooltip title={renderNguHanhTooltip(nguHanh.name)} placement="top">
            <span
              className={`text-xs px-2 py-0.5 rounded ${nguHanh.color} font-semibold cursor-help`}
            >
              {nguHanh.name}
            </span>
          </Tooltip>
        )}
      </div>
    );
  };

  const renderLucThanTooltip = (lucThan) => {
    const info = getDungThanInfo(lucThan);
    if (!info) return lucThan;

    return (
      <div className="max-w-xs text-xs space-y-2">
        <div className="font-bold mb-1 text-sm">{info.label}</div>
        <div>
          <span className="font-semibold">Mô tả:</span>{" "}
          <span>{info.description}</span>
        </div>
        <div>
          <span className="font-semibold">Vai vế / quan hệ:</span>{" "}
          <span>{info.vaiVe}</span>
        </div>
        <div>
          <span className="font-semibold">Mang tính chất:</span>{" "}
          <span>{info.mangTinhChat}</span>
        </div>
      </div>
    );
  };

  // Lục Thú meanings (simplified; có thể mở rộng thêm sau)
  const lucTuInfo = {
    "Thanh Long": {
      title: "Thanh Long",
      content:
        "Thanh Long thuộc Mộc, tính Dương, là vị thần phò tá rất chung thủy, cao quý, có liêm sỉ, công minh, chính trực. Ứng về hôn nhân, lễ tiệc vui mừng, mai mối, thai sản, các việc vui tốt. Đắc địa thì phú quý cao sang; khắc hào Thế thì do ăn uống, rượu thịt, hoặc giao hợp quá độ mà hao tài, sinh bệnh. Về người là hạng người quý phái, quan văn, người học thức, thanh lịch, chàng rể. Về bệnh là bệnh tim, hoa mắt chóng mặt, đau lưng, nhức đầu, tay chân tê mỏi, bại liệt.",
    },
    "Chu Tước": {
      title: "Chu Tước",
      content:
        "Chu Tước bản vị tại Bính Ngọ, thuộc Dương Hỏa, hướng chính Nam, cung Ly, là nơi tột bậc của khí Dương và là nơi bắt đầu sinh khởi khí Âm; được vượng khí trong mùa Hạ. Chu Tước chuyên ứng về các việc văn thư, biện thuyết, lời nói, tin tức, khẩu thiệt. Đắc địa thì ứng về văn chương, ấn tín, sắc lệnh, đến công phủ nhận sắc lệnh, các việc thi cử, văn sách, nộp đơn xin việc làm, trao đổi hồ sơ, công văn giấy tờ.\n\nThất địa thì ứng điều hung như khẩu thiệt, cãi vã, sự nóng giận như điên như dại, việc kiện tụng, lạc mất văn thư, tổn thất tiền tài cùng vật dụng. Có sự tranh cãi rất ầm ĩ, huyên náo, tranh đấu nhau bằng lời lẽ, miệng lưỡi rất hung hăng, dữ tợn. Chu Tước khắc hào Thế thì gặp khẩu thiệt, tranh cãi, lòng dạ bất an không yên ổn, dễ bị quan trên khiển trách, trách mắng.\n\nVề người: Chu Tước là hạng chạy giấy tờ, công chức làm việc giấy tờ, thư ký, nhân viên văn phòng, người đưa công văn, thư tín; cũng là người đàn bà kinh cuồng khổ sở, kẻ nóng ác sân hận. Về bệnh: bệnh tim, bệnh bụng, nôn mửa, nghẹt mũi, lùng bùng lỗ tai, bệnh huyết áp. Luận thực vật là hột của ngũ cốc; luận về thú là loại có cánh bay; luận về sắc là màu đỏ có lẫn đen; về số là số 9. Về vật loại: thuộc lông cánh, tin tức, văn chương, thư tín (thời xưa dùng lông chim làm bút, dùng chim đưa thư).",
    },
    "Đằng Xà": {
      title: "Đằng Xà",
      content:
        "Đằng Xà bản vị tại Tỵ, thuộc âm Hỏa, phương Đông Nam, được vượng khí trong mùa Hạ. Đằng Xà chuyên ứng việc ưu tư lo lắng, quan tụng, khẩu thiệt, các việc gây tranh cãi, nghi ngờ, kinh hãi, bất an, hao tán, bất thành; sự việc thường có mờ ám, khuất tất, giấu diếm, che đậy, tin đồn nhảm, thị phi gian trá, điều kinh sợ vu vơ, mộng mị quỷ quái, danh dự không thật.\n\nGặp Đằng Xà là điềm nằm mộng thấy ma quỷ, tâm lo sợ không yên, bệnh thần kinh, có tranh đấu, khẩu thiệt, quan tụng, dễ mắc bệnh tật quái lạ. Đằng Xà khắc hào Thế là bị kẻ tiểu nhân đố kỵ ganh ghét, kẻ tâm địa hẹp hòi nhỏ mọn gây khó dễ, có phao tin đồn nhảm, thị phi gian trá, hoặc bị bệnh tinh thần.\n\nVề người: Đằng Xà là kẻ tiểu nhân, người có tâm địa độc ác, nhỏ mọn, hiềm thù, hạng đàn bà điên cuồng rồ dại, thần kinh hoảng hốt, làm lụng vất vả nhọc nhằn, hạng tiểu nhân ti tiện. Về bệnh: chứng bệnh thần kinh, nhức đầu, tay chân sưng, chảy máu. Về ngũ cốc là loại đậu; về thú là loại rắn; về vật thực là món ăn có mùi rất khó ăn. Về sắc là đỏ hồng, về số là số 4, về vật là kim hỏa sáng tốt, khi biến dị là loại kim hỏa thành tinh.",
    },
    "Câu Trần": {
      title: "Câu Trần",
      content:
        "Câu Trần bản vị tại Mậu Thìn, thuộc Dương Thổ, là Thổ trung ương, được vượng khí trong Tứ quý, chứa đầy sát khí và giữ chức tướng quân. Đắc địa thì được bề trên ban quyền lệnh, thụ ấn tước, bội tinh, huân chương của vua hay chính phủ tùy cấp bậc; thất địa thì ứng về hạng binh lính giữ cửa, kẻ bất kham, tranh đấu nhau.\n\nCâu Trần chuyên ứng các sự việc lưu trì, chậm trễ, dây dưa kéo dài; việc tranh chấp nhà cửa, ruộng vườn, động đất cát, ra đi lâu về, tai nạn dây dưa tổn thất tiền bạc; các việc binh trận, quan tụng, tranh chấp kéo dài, lâu năm, cũ; việc tụ tập đông người, huyên náo, rối loạn. Đối với dân thường là tranh chấp đất đai, kiện tụng về cầm cố tài sản. Câu Trần khắc hào Thế thì khó biện bạch lý phải trái, lý chính đáng của mình, là điềm tai họa vấn vương, việc công hay việc tư đều kéo dài lâu ngày chẳng lúc nào tạm an nhàn.\n\nVề người: Câu Trần ứng là người quen cũ, người làm nghề nhà binh, bộ đội, công an, người đàn bà xấu xí, kẻ hai mặt, hay chất chứa hai lòng, ưa tranh cãi kiện tụng. Luận về bệnh: chứng đau tim, đau bụng, nóng lạnh, ung thũng có máu. Luận về ngũ cốc là trái cây; luận về thú là động vật dưới nước; luận về sự biến dị là những thứ cũ nát, hư tổn, xưa cũ, đồ cổ; luận về sắc là màu đen; luận về số là số 5.",
    },
    "Bạch Hổ": {
      title: "Bạch Hổ",
      content:
        "Bạch Hổ bản vị tại Thân Dậu, thuộc Dương Kim, phương Tây, là Bạch Đế Kim tinh chuyên quyền sát phạt, được vượng khí trong mùa Thu. Bạch Hổ chuyên ứng việc bệnh tật, tang chế, tổn hại cốt nhục, chôn cất, khóc kể, việc hung ác, chém giết, khẩu thiệt, tù ngục, cầm cố, ẩu đả, tranh đấu, huyên náo, ám muội, oán thù, kinh sợ, hình phạt, máu lửa. Cũng ứng tin tức, đi đường, quan tụng, binh lính, việc đông người, việc ở dọc đường.\n\nĐối với quan quyền: Bạch Hổ ứng mất chức, đổi quan, kinh sợ, có khi bị lưu huyết, thanh toán. Đối với thường dân: dễ bị thương tổn, thân thể sa sút, thời vận suy vi, điên đảo. Bạch Hổ đắc địa thì có oai quyền, làm việc mau chóng thành tựu, có khả năng điều khiển đại sự. Bạch Hổ khắc hào Thế là bị kẻ hung bạo gây khó dễ, có thù oán tranh cạnh, hoặc bệnh tật mệt mỏi, đau ốm đột ngột.\n\nVề người: hạng có uy quyền, có đao gươm, mang súng; người khỏe mạnh, cương cường, hung dữ, lỗ mãng, thích sát phạt; hoặc người có bệnh, người đang có tang. Về bệnh: bệnh về máu, xương cốt. Về ngũ cốc: lúa mạch, mè. Về thú: vượn, đười ươi, hổ, báo. Về sắc: màu trắng. Về số: số 7. Về vật: kiếm, thương, đao.",
    },
    "Huyền Vũ": {
      title: "Huyền Vũ",
      content:
        "Huyền Vũ bản vị tại Hợi, thuộc âm Thủy, phương Tây Bắc, được vượng khí trong mùa Đông. Trên trời sao Huyền Vũ làm chức Hậu quân, vị thần làm khổ vũ (mưa trái thời tiết hoặc mưa quá nhiều sinh khổ hại). Huyền Vũ là tột bậc của Âm, chứa đầy tà khí, làm cho vạn vật tổn hại đến mức cuối cùng.\n\nHuyền Vũ chuyên ứng việc mờ ám, bất thường, thất lạc, hao tài, sai hẹn, trốn mất, cầu cạnh, việc chẳng minh bạch. Cũng ứng việc mưu tính âm thầm, việc tư riêng, cầu hoạch tài, các điều gian trá, thất ước, tật bệnh, trốn tránh, quỷ ám, mộng tưởng, những việc hao thoát, gian trá không thiết thực.\n\nĐối với quân tử, quan nhân, Huyền Vũ thường ứng mất xe ngựa, tôi tớ trốn đi; đối với thường dân thì dễ bị phá nhà cửa hoặc xảy ra chuyện dâm đãng lôi thôi. Huyền Vũ khắc hào Thế là gặp kẻ mua bán hoặc gian đạo đang mưu tính hại mình, là điềm hao phá tiền bạc, dính líu quan tụng, vụ trốn tránh, thiếu sót.\n\nVề người: bọn giặc cướp, trộm cắp, người gian tà tiểu tâm, hạng thông minh mà gian trá, lanh lợi mà mưu trí, có tài văn chương, hay cầu ước tài vật, thích giao du với quý nhân, người giàu. Cũng chủ tiểu nhân, đàn bà, con gái. Về bệnh: bệnh thủng ruột, sưng ruột. Về thú: heo, thủy trùng, loài có vẩy; cũng ứng các vật loại văn chương. Về sắc: màu đen. Về số: số 4. Về hình chất: vật hư rỗng, âm hộ của phụ nữ.",
    },
  };

  const renderLucTu = (lucTu, record) => {
    if (!lucTu) return "-";
    const info = lucTuInfo[lucTu];

    return (
      <span
        className={`cursor-pointer underline decoration-dotted ${
          info ? "text-blue-700" : ""
        }`}
        onClick={() => openLucTuDrawer(lucTu, record)}
      >
        {lucTu}
      </span>
    );
  };

  // Columns for TỨC ĐIỀU PHÁN SÀO: Hào / Thế ứng / Lục thân / Can chi / Phục thần / Tuần không
  const columns1 = [
    {
      title: "Hào",
      dataIndex: "hao",
      key: "hao",
      width: 80,
      align: "center",
      render: (hao, record, index) => {
        // index 0 = hào 6, index 5 = hào 1
        const lineType = lines1[index];
        const isMoving = movingLine === hao;
        return renderHaoLine(hao, lineType, isMoving);
      },
    },
    {
      title: "Thế ứng",
      dataIndex: "theUng",
      key: "theUng",
      width: 80,
      align: "center",
      render: (theUng) => {
        const value = Number(theUng);
        let label = "-";
        if (value === 1) label = "Thế";
        else if (value === 2) label = "Ứng";

        return <span className="font-semibold">{label}</span>;
      },
    },
    {
      title: "Lục Thân",
      dataIndex: "lucThan",
      key: "lucThan",
      width: 100,
      align: "center",
      render: (lucThan, record) => (
        <Tooltip
          title={renderLucThanTooltip(lucThan)}
          placement="top"
          overlayClassName="tooltip-custom"
        >
          <span
            className={
              dungThan && lucThan === dungThan ? "text-green-600 font-bold" : ""
            }
          >
            {lucThan}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Can Chi",
      dataIndex: "canChi",
      key: "canChi",
      width: 120,
      align: "center",
      render: (canChi) => renderCanChi(canChi),
    },
    {
      title: "Phục thần",
      dataIndex: "phucThan",
      key: "phucThan",
      width: 100,
      align: "center",
      render: (phucThan) => <span>{phucThan || "-"}</span>,
    },
    {
      title: "Tuần không",
      dataIndex: "tuanKhong",
      key: "tuanKhong",
      width: 100,
      align: "center",
      render: (tuanKhong) => <span>{tuanKhong || "-"}</span>,
    },
  ];

  // Columns for NHÂN ĐOÁN TÁO CAO: Hào / Lục thân / Can chi / Lục tú / Tuần không
  const columns2 = [
    {
      title: "Hào",
      dataIndex: "hao",
      key: "hao",
      width: 80,
      align: "center",
      render: (hao, record, index) => {
        // index 0 = hào 6, index 5 = hào 1
        const lineType = lines2[index];
        const isMoving = false; // Quẻ biến không có hào động
        return renderHaoLine(hao, lineType, isMoving);
      },
    },
    {
      title: "Lục Thân",
      dataIndex: "lucThan",
      key: "lucThan",
      width: 100,
      align: "center",
      render: (lucThan, record) => (
        <Tooltip
          title={renderLucThanTooltip(lucThan)}
          placement="top"
          overlayClassName="tooltip-custom"
        >
          <span
            className={
              dungThan && lucThan === dungThan ? "text-green-600 font-bold" : ""
            }
          >
            {lucThan}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Can Chi",
      dataIndex: "canChi",
      key: "canChi",
      width: 120,
      align: "center",
      render: (canChi) => renderCanChi(canChi),
    },
    {
      title: "Lục Thú",
      dataIndex: "lucTu",
      key: "lucTu",
      width: 120,
      align: "center",
      render: (lucTu, record) => renderLucTu(lucTu, record),
    },
    {
      title: "Tuần không",
      dataIndex: "tuanKhong",
      key: "tuanKhong",
      width: 100,
      align: "center",
      render: (tuanKhong) => <span>{tuanKhong || "-"}</span>,
    },
  ];

  // Render content for Lục Thú fullscreen drawer
  const renderLucTuDrawerContent = () => {
    if (!lucTuDrawerData) return null;
    const { lucTu, record } = lucTuDrawerData;
    const info = lucTuInfo[lucTu];
    const lucThan = record?.lucThan;
    const clsThan = getClassification(lucTu, lucThan);
    const clsDiaChi = getClassificationDiaChi(lucTu, record?.canChi);

    let diaChiExtraText = null;
    if (record?.canChi) {
      const parts = record.canChi.split(" ");
      const diaChi = parts[parts.length - 1];
      if (lucTu === "Thanh Long") {
        diaChiExtraText = thanhLongDiaChiInfo[diaChi] || null;
      } else if (lucTu === "Bạch Hổ") {
        diaChiExtraText = bachHoDiaChiInfo[diaChi] || null;
      } else if (lucTu === "Câu Trần") {
        diaChiExtraText = cauTranDiaChiInfo[diaChi] || null;
      } else if (lucTu === "Chu Tước") {
        diaChiExtraText = chuTuocDiaChiInfo[diaChi] || null;
      } else if (lucTu === "Đằng Xà") {
        diaChiExtraText = dangXaDiaChiInfo[diaChi] || null;
      } else if (lucTu === "Huyền Vũ") {
        diaChiExtraText = huyenVuDiaChiInfo[diaChi] || null;
      }
    }

    return (
      <div className="space-y-4 text-sm">
        {info && (
          <>
            <div className="leading-relaxed whitespace-pre-line text-gray-800">
              {info.content}
            </div>
          </>
        )}

        {(clsThan || clsDiaChi) && (
          <div className="pt-4 border-t border-gray-300 space-y-3">
            {clsThan && (
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span>{clsThan.label}</span>
                </div>
                {lucThan &&
                  lucTu === "Thanh Long" &&
                  thanhLongLucThanInfo[lucThan] && (
                    <div className="mt-2 text-xs leading-relaxed whitespace-pre-line text-gray-700">
                      {thanhLongLucThanInfo[lucThan]}
                    </div>
                  )}
                {lucThan &&
                  lucTu === "Bạch Hổ" &&
                  bachHoLucThanInfo[lucThan] && (
                    <div className="mt-2 text-xs leading-relaxed whitespace-pre-line text-gray-700">
                      {bachHoLucThanInfo[lucThan]}
                    </div>
                  )}
                {lucThan &&
                  lucTu === "Câu Trần" &&
                  cauTranLucThanInfo[lucThan] && (
                    <div className="mt-2 text-xs leading-relaxed whitespace-pre-line text-gray-700">
                      {cauTranLucThanInfo[lucThan]}
                    </div>
                  )}
                {lucThan &&
                  lucTu === "Chu Tước" &&
                  chuTuocLucThanInfo[lucThan] && (
                    <div className="mt-2 text-xs leading-relaxed whitespace-pre-line text-gray-700">
                      {chuTuocLucThanInfo[lucThan]}
                    </div>
                  )}
                {lucThan &&
                  lucTu === "Đằng Xà" &&
                  dangXaLucThanInfo[lucThan] && (
                    <div className="mt-2 text-xs leading-relaxed whitespace-pre-line text-gray-700">
                      {dangXaLucThanInfo[lucThan]}
                    </div>
                  )}
                {lucThan &&
                  lucTu === "Huyền Vũ" &&
                  huyenVuLucThanInfo[lucThan] && (
                    <div className="mt-2 text-xs leading-relaxed whitespace-pre-line text-gray-700">
                      {huyenVuLucThanInfo[lucThan]}
                    </div>
                  )}
              </div>
            )}

            {clsDiaChi && (
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span>{clsDiaChi.label}</span>
                </div>
                {diaChiExtraText && (
                  <div className="mt-2 text-xs leading-relaxed whitespace-pre-line text-gray-700">
                    {diaChiExtraText}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Drawer
        open={!!lucTuDrawerData}
        onClose={closeLucTuDrawer}
        placement="left"
        height="100%"
        width={window.innerWidth < 640 ? "100%" : "70%"}
        title={lucTuDrawerData?.lucTu || "Lục Thú"}
        destroyOnClose
        bodyStyle={{ padding: 16 }}
      >
        {renderLucTuDrawerContent()}
      </Drawer>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
        {/* TỨC ĐIỀU PHÁN SÀO */}
        <Card
          title={
            <p
              className="text-center font-bold text-lg text-gray-800 m-0"
              style={{ textTransform: "uppercase" }}
            >
              {getHexagramOmen(
                `${originalHexagram.upperTrigram}-${originalHexagram.lowerTrigram}`
              )}
            </p>
          }
          className="bg-parchment-50 border-2 border-parchment-300"
        >
          <Table
            dataSource={lineData1}
            columns={columns1}
            pagination={false}
            size="small"
            rowKey="hao"
            className="bg-white"
            rowClassName={(record) => {
              if (dungThan && record.lucThan === dungThan) {
                return "bg-green-50 hover:bg-green-100";
              }
              return "";
            }}
          />
        </Card>

        {/* NHÂN ĐOÁN TÁO CAO */}
        <Card
          title={
            <p
              className="text-center font-bold text-lg text-gray-800 m-0"
              style={{ textTransform: "uppercase" }}
            >
              {changedHexagram &&
                getHexagramOmen(
                  `${changedHexagram.upperTrigram}-${changedHexagram.lowerTrigram}`
                )}
            </p>
          }
          className="bg-parchment-50 border-2 border-parchment-300"
        >
          <Table
            dataSource={lineData2}
            columns={columns2}
            pagination={false}
            size="small"
            rowKey="hao"
            className="bg-white"
            rowClassName={(record) => {
              if (dungThan && record.lucThan === dungThan) {
                return "bg-green-50 hover:bg-green-100";
              }
              return "";
            }}
          />
        </Card>
      </div>
    </>
  );
}
