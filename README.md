# Electrical Circuit Simulation · Mô phỏng tủ điện 2D

Windows desktop electrical circuit simulation for control panels, motor starters, VFDs and SCR heater circuits. Build and simulate schematics, open projects in tabs, copy components across projects, and export drawings and a bill of materials. The interface supports Vietnamese, English and Japanese.

[Download Windows x64 v1.4.3](https://github.com/NhanDucTTE/electrical-circuit-simulation/releases/tag/v1.4.3)

Keywords include Electrical Circuit Simulation, electrical control panel, motor control, star-delta starter, VFD, SCR, circuit simulator and MEP.

Ứng dụng Windows x64 để dựng sơ đồ tủ điện và kiểm thử trình tự hoạt động. Giao diện tiếng Việt, tệp dự án lưu cục bộ. Ứng dụng sử dụng trình hiển thị WebView2 nhúng, vì vậy người dùng mở trực tiếp tệp `.exe`.

## Mở ứng dụng

1. Giải nén toàn bộ `MoPhongTuDien-v1.4.3-win-x64.zip`. Nếu đã có thư mục `release/MoPhongTuDien-v1.4.3-win-x64`, có thể dùng trực tiếp.
2. Mở `MoPhongTuDien.exe` trong thư mục đã giải nén. Giữ thư mục `web`, `examples` và các DLL cạnh tệp `.exe`.
3. Máy chạy cần Windows x64 với .NET Framework 4.8 và Microsoft Edge WebView2 Runtime đã có sẵn. Khi máy thiếu WebView2, cài gói **Evergreen Standalone Installer x64** chính thức theo quy trình của đơn vị trước khi sử dụng offline. [Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

Tệp phục hồi và hồ sơ WebView2 nằm trong `%LOCALAPPDATA%\MoPhongTuDien2D`. Nội dung ứng dụng, sơ đồ và ca kiểm thử được xử lý cục bộ. Nội dung web chỉ tải từ gói đi kèm và phiên WebView2 chạy ở chế độ offline.

## Ngôn ngữ và tác giả

Chọn **Tiếng Việt**, **English** hoặc **日本語** ở góc trên bên phải để đổi ngôn ngữ giao diện. Lần đầu mở dùng Tiếng Việt. Phần mềm nhớ lựa chọn cho lần mở sau. Thanh lệnh, thư viện, bảng thuộc tính, công cụ đo, ca kiểm thử và tiêu đề hộp thoại tệp sử dụng ngôn ngữ đã chọn. Tên dự án, tag, nhãn dây, ghi chú và nội dung hồ sơ vẫn theo văn bản người dùng nhập. Đổi ngôn ngữ giữ trạng thái và thời gian mô phỏng.

Mở **Giới thiệu** cạnh bộ chọn ngôn ngữ để xem thông tin và sao chép email góp ý.

- Tác giả **Nguyên Nhân Đức**.
- Công tác tại **Công ty TNHH Takasago Vietnam**.
- Mọi góp ý xin gửi về **nhanduc.business@gmail.com**.

## Dựng mạch mới

1. Chọn **Mới** và đặt tên dự án trong thanh trên. Tìm và kéo thiết bị từ thư viện vào sơ đồ. Có thể bấm mục trong thư viện để thêm nhanh.
2. Chọn thiết bị để chỉnh tag, tham số và xem các chân đấu bên phải. Thiết bị mới đặt dọc theo sơ đồ nguyên lý. Dùng **Hướng ký hiệu** hoặc phím **R** để đổi hướng phần tử đang chọn. Dùng lưới, bắt dính, thu phóng và **Vừa khung nhìn** để đọc sơ đồ. Giữ Ctrl hoặc Shift khi chọn nhiều phần tử.
3. Bấm hai chân cần nối. Để rẽ nhánh, chọn **Nối dây (W)** rồi bấm một chân hoặc một đoạn dây ở mỗi đầu. Bấm nền giữa hai đầu nếu cần đặt điểm gấp. Phần mềm tự chèn nút nối vào đoạn dây đã chọn. Chấm đặc biểu thị kết nối điện, cung vượt biểu thị hai dây đi ngang qua nhau. Chọn dây để đặt số dây.
4. Để liên kết tiếp điểm với relay, contactor hoặc timer, chọn tiếp điểm rồi chọn **Thiết bị chủ**. Tag của tiếp điểm tự theo tag chủ và được khóa tại tiếp điểm. Đổi tag ở cuộn sẽ cập nhật các tiếp điểm đã liên kết qua ID. Mô tả tiếp điểm của dự án cũ được giữ trong thuộc tính. Đặt cùng miền nguồn trên nguồn và thiết bị nhận, ví dụ `AC230`, `DC24` hoặc `3P400`. Đèn thử AC230 dùng `L → A1` và `A2 → N`.
5. Chọn **Lưu** hoặc **Lưu thành…** để ghi tệp dạng `*.td2d.json` phiên bản 1. Tệp chứa thiết bị, dây, liên kết và ca kiểm thử. Khi có bản tự lưu từ phiên trước, ứng dụng cho phép khôi phục và chọn vị trí lưu khi bấm **Lưu**. Mở dự án đưa sơ đồ về chế độ chỉnh sửa và đồng hồ mô phỏng về điểm đầu.

## Mở nhiều dự án và sao chép thiết bị

- **Mới**, **Mở** và **Mạch mẫu** đưa dự án vào thanh tab. Bấm tên dự án hoặc dùng **Ctrl+Tab** để chuyển tab. Mỗi tab giữ riêng lịch sử hoàn tác, khung nhìn và trạng thái mô phỏng. Khi chuyển khỏi tab đang chạy, mô phỏng tạm dừng tại thời điểm hiện tại.
- Chọn một hoặc nhiều thiết bị ở tab nguồn, nhấn **Ctrl+C**, chuyển sang tab đích và nhấn **Ctrl+V**. Các dây và nhánh nối trong nhóm, cùng liên kết giữa các thiết bị được sao chép, sẽ đi theo nhóm. Để giữ liên kết với cuộn hoặc thiết bị điều khiển khi chuyển dự án, chọn cả thiết bị chủ.
- Khi tag trùng, ứng dụng hiển thị tag gốc và tag đề xuất. Chọn **Đổi tag và dán** hoặc **Hủy**. Những tiếp điểm liên kết với thiết bị chủ vẫn dùng chung tag với chủ.
- Chấm vàng báo tab có thay đổi chưa lưu. Bấm **×** để đóng tab. Với tab có thay đổi, chọn **Lưu**, **Bỏ thay đổi** hoặc **Hủy**. Tự lưu theo dõi từng tab đã sửa.

## Thư viện mạch mẫu

- **Khởi động trực tiếp động cơ (DOL)** có START/STOP, tiếp điểm tự giữ và tác động quá tải.
- **Khởi động sao–tam giác động cơ** dùng động cơ sáu đầu dây. Mạch mẫu chạy sao 3 giây, ngắt 0,25 giây rồi chuyển sang tam giác. Hai contactor sao và tam giác có liên động.
- **Điều khiển bơm theo mức nước** có phao và công tắc AUTO/MAN/OFF.
- **DEMO-01 · Biến tần** mô phỏng nhánh AC3 với LS H100, lệnh chạy và phản hồi chạy/lỗi. Biến tần hiển thị tần số đầu ra (Hz) và tốc độ đồng bộ ước tính (vòng/phút) theo số cực cài trong Thuộc tính.
- **DEMO-01 · SCR** mô phỏng hai nhánh gia nhiệt HT-1 (60 kW) và HT-2 (6 kW), có lệnh chạy và phản hồi lỗi riêng.

Sau khi mở mẫu, dùng **Chạy** để thao tác hoặc **Kiểm thử → Chạy tất cả** để kiểm tra trình tự. Chọn **Lưu** để lưu dự án mẫu vào tệp riêng. Các mẫu Sump Pit, Smoke Exhaust, áp suất nước và ATS cũng có sẵn trong **Mạch mẫu**.

[Hướng dẫn thao tác và đối chiếu bản vẽ DEMO-01](docs/MACH-MAU-DEMO-01.md)

## Mô phỏng và kiểm thử

- Chọn **Chạy** để bắt đầu. **Tạm dừng** giữ thời gian hiện tại, **Từng bước** tiến đồng hồ ảo và **Đặt lại** nạp lại đầu vào ban đầu của sơ đồ. Dùng thuộc tính thiết bị để bấm nút tức thời, đặt AUTO/MAN/OFF, tác động tín hiệu mức, đổi nguồn và đóng/cắt hoặc trip/reset bảo vệ.
- Quan sát nhãn trạng thái trên thiết bị và chú giải **Cấp**, **Về**, **Hở**, **Lỗi**. Chọn thiết bị để xem điều kiện cấp điện và nguyên nhân dừng. Trên tải ba pha, lệnh chạy, có đủ pha để chạy và phản hồi chạy là các trường độc lập. Phản hồi ngoài cần một tín hiệu mô hình hóa và liên kết riêng.
- Mở **Cảnh báo** để xem chân hở, tag trùng, liên kết và miền nguồn. **Nhật ký** hiển thị thời điểm mô phỏng, tag, sự kiện và lý do. Khi có vòng logic không hội tụ, sửa phần tử được chỉ ra và đặt lại mô phỏng.
- Tìm **G4Q-212S** trong thư viện để thêm rơ-le luân phiên Omron cuộn 220 VAC với đế 8PFA1. Đặt vị trí tiếp điểm trước khi mô phỏng trong **Thuộc tính**. Mỗi lần cuộn có điện sau khi nhả, mô hình đảo vị trí và giữ vị trí đó khi mất điện cuộn. Thông số xung ≥100 ms là yêu cầu của Omron khi dùng xung trên thiết bị vật lý. Mẫu Sump Pit giữ số chân trên tờ 304 và hiển thị số chân của đế trong mục **Chân vật lý theo Omron**. [Datasheet Omron G4Q, trang 4–5](https://www.ia.omron.com/data_pdf/cat/g4q_ds_e_3_2_csm44.pdf#page=4)
- Ở **Mạch mẫu**, chọn **Sump Pit** hoặc **Smoke Exhaust**, rồi mở tab **Kiểm thử**. Chạy từng ca hoặc **Chạy tất cả**. Mở chi tiết ca để xem trang tham chiếu, trạng thái đầu, thao tác, kết quả kỳ vọng và kết quả thực tế từng bước. **Chưa xác minh** nghĩa là hồ sơ thiếu dữ liệu để khẳng định kết quả ngoài thực tế. Có thể lưu một bản riêng của mẫu trước khi chỉnh.
- Để thêm ca kiểm thử, nhập tên, trang tham chiếu, trạng thái đầu, các bước và giá trị cần kiểm tra. Mỗi ca chạy trong một bộ mô phỏng riêng với đồng hồ ảo. Thay đổi sơ đồ hoặc ca thì lưu lại dự án.

## Đo điện, đèn và còi

- Chọn **V** rồi bấm dây, chân hoặc nút nối. Với nguồn hai cực đã xác định, lần bấm đầu cho điện áp so với chân về. Bấm điểm thứ hai để đo điện áp giữa hai que. Đảo que sẽ đổi dấu điện áp DC.
- Chọn **A** rồi bấm đoạn dây cần đo. Với cuộn, đèn, còi hoặc động cơ, nhập **Dòng làm việc mô phỏng (A)** trong Thuộc tính để làm cơ sở tính dòng nhánh. Có thể đo dòng tín hiệu 4–20 mA trên vòng Sensys. Đồng hồ nêu lý do khi điểm đo thiếu tham chiếu, thiếu dữ liệu tải hoặc khi dây song song khiến dòng từng nhánh chưa xác định.
- Chọn đèn để chỉnh **Màu đèn khi sáng**, **Ký hiệu trong đèn** và **Đèn nhấp nháy**. Đèn nháy theo chu kỳ một giây của đồng hồ mô phỏng. Còi phát âm thanh khi chạy và có đủ điện ở hai chân. Bấm nút loa cạnh **Đặt lại** để tắt hoặc bật tiếng. Tạm dừng mô phỏng cũng dừng âm thanh.

## Thử mạch đo áp suất nước

Mở **Mạch mẫu → Điều khiển áp suất nước**, bấm **Chạy**, chọn **PT1** và nhập **7,5 bar**. PT1 tạo tín hiệu **16 mA** trên vòng DC24. PIC1 nhận giá trị 7,5 bar và đóng OUT1 để cấp điện cho đèn HL1. Nhập **1 bar** để quan sát ngõ ra nhả. Có thể chọn **A** và bấm dây **I+** để đọc trực tiếp dòng tín hiệu. Điểm đặt trong mạch này là 5 bar, độ trễ đóng/ngắt đặt 0,5 bar. Biến áp TR1 cách ly nguồn AC220 và cấp AC110 cho bộ điều khiển cùng đèn.

[Cách đấu cảm biến, cài E5EC, lập lịch H5S và đặt điện cực cho 61F-G2/G3](docs/LINH-KIEN-DO-DIEU-KHIEN.md)

## Xuất bản vẽ

Mở menu **Xuất** rồi chọn **Xuất PDF…** hoặc **Xuất DWG…**. Chọn đường dẫn lưu trong hộp thoại Windows. Cả hai định dạng lấy toàn bộ sơ đồ đang mở kể cả phần ngoài khung nhìn.

[Định dạng PDF, lớp bản vẽ DWG và kết quả mở lại tệp xuất](docs/XUAT-BAN-VE.md)

## Xuất bảng kê vật tư CSV

Mở **BOM → Xuất tệp CSV (Excel)**, chọn tên và vị trí trong hộp thoại Windows rồi bấm **Lưu**. Tệp dùng dấu phẩy để phân cột và UTF-8 có BOM để giữ dấu tiếng Việt khi mở trong Excel.

**Số lượng** đếm số thiết bị cùng loại, mã hiệu và thông số được liệt kê trong một dòng. Cột **Tag** giữ các ký hiệu để đối chiếu. Nút nối dây được bỏ qua, còn các khối tiếp điểm liên kết hợp lệ được tính cùng thiết bị chủ. **Số chân** là số đầu cực của ký hiệu thiết bị trong mô hình.

## Phạm vi áp dụng

Ứng dụng mô phỏng logic, tiếp điểm, tín hiệu cảm biến và tính liên tục của đường cấp/đường về. Vôn kế hiển thị điện áp danh định, ampe kế dùng dòng tải đã nhập hoặc dòng vòng đo được mô hình hóa. Sụt áp, dòng ngắn mạch, quá độ khởi động, phối hợp bảo vệ, kết nối tủ thực và nghiệm thu PCCC nằm ngoài phạm vi của mô hình.

- [Đối chiếu hồ sơ và yêu cầu xác nhận](docs/DOI-CHIEU-HO-SO.md)
- [Báo cáo kiểm thử](docs/BAO-CAO-KIEM-THU.md)

## Mã nguồn và đóng gói

Trong thư mục mã nguồn, `src/` chứa giao diện, thư viện mạch điều khiển và bộ mô phỏng JavaScript. `desktop/` chứa host WinForms và tập lệnh build. `examples/` chứa các dự án mẫu, `tests/` chứa kiểm thử.

Từ PowerShell, chạy các lệnh sau ở thư mục mã nguồn.

```powershell
node --test "./tests/*.test.mjs"
& .\desktop\build.ps1
```

`build.ps1` dùng trình biên dịch .NET Framework x64 đi kèm Windows trên máy kiểm thử. SDK WebView2 pinned **1.0.2365.46** được lấy từ các DLL Microsoft ký số có sẵn trong Microsoft Power Query for Excel trên máy build. Trên máy build khác, giải nén gói NuGet đúng phiên bản và truyền `-WebViewSdkDirectory` trỏ vào thư mục đã giải nén. Runtime WebView2 trên máy kiểm thử là **157.0.4341.60**. Kiểm thử JavaScript sử dụng **Node.js 24.20.0**. Bản chạy không cần Node.js. [SDK WebView2 1.0.2365.46](https://www.nuget.org/packages/Microsoft.Web.WebView2/1.0.2365.46) · [Node.js](https://nodejs.org/)

Kiểm thử giao diện bản Windows có thể chạy bằng `MoPhongTuDien.exe --verify-offline <thư-mục-kết-quả>`. Thư mục này chứa tệp mô phỏng thử và `result.json`. Chế độ này dùng dữ liệu kiểm thử riêng và thao tác với chính giao diện WebView2 của bản đóng gói.

