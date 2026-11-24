# HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG MÔ PHỎNG TỦ ĐIỆN 2D (v1.4.3)
## Dành Cho Kỹ Sư MEP, Tự Động Hóa & Thiết Kế Điện Công Trình

---

## 1. Giới thiệu và Phạm vi Kỹ thuật
**Mô phỏng tủ điện 2D (Electrical Cabinet Simulator 2D - v1.4.3)** là ứng dụng Windows desktop chuyên dụng, chạy hoàn toàn **Offline 100%**, hỗ trợ kỹ sư MEP:
- Kéo thả dựng sơ đồ mạch điều khiển và động lực theo chuẩn ký hiệu IEC/JIS.
- Kiểm tra tính đúng đắn của logic điều khiển: mạch tự giữ (self-holding latch), khóa liên động điện (electrical interlock), trễ thời gian (timer ON/OFF delay), đảo mạch luân phiên bánh cóc (ratchet latching), vòng lặp đo lường 4–20 mA, bộ lập lịch tuần (weekly timer), rơ-le bảo vệ pha, biến tần VFD, khởi động mềm và chuyển nguồn tự động ATS trước khi thi công tủ điện thực tế.
- Đo kiểm điện áp và dòng điện trực tiếp trên sơ đồ bằng que đo Vôn kế (Voltmeter) và Ampe kế (Ammeter).
- **Bộ 3 công cụ kỹ thuật nâng cao mới:**
  1. **Bảng kê vật tư thiết bị (BOM):** Tự động bóc tách khối lượng, xuất bảng Excel CSV chuẩn UTF-8 tiếng Việt.
  2. **Mô phỏng sự cố cưỡng bức (Fault Injection):** Giả lập mất pha L1/L2/L3, đảo pha, sụt áp theo thời gian thực.
  3. **Cây truy vết nguyên nhân trực quan (Visual Cause Chain):** Thẻ màu sắc trực quan (Xanh/Đỏ/Lam) chỉ ra chính xác điểm đứt gãy mạch điện.
- Xuất bản vẽ in PDF độ nét cao và bản vẽ CAD DWG chuẩn AutoCAD (chỉnh sửa được các layer WIRE, SYMBOL, TEXT, TERMINAL).

> **LƯU Ý KỸ THUẬT QUAN TRỌNG:**  
> Đây là công cụ **kiểm tra logic sơ đồ mạch**, không phải phần mềm tính toán dòng ngắn mạch, sụt áp, độ tăng nhiệt hay phối hợp thời gian cắt của rơ-le bảo vệ. Không kết nối hoặc gửi lệnh điều khiển trực tiếp đến tủ điện thật ngoài hiện trường. Kết quả kiểm thử "ĐẠT" phản ánh logic sơ đồ mạch đúng theo kịch bản mô phỏng, không thay thế hồ sơ nghiệm thu kỹ thuật hoặc chứng chỉ an toàn PCCC của cơ quan quản lý.

---

## 2. Cấu trúc Thư mục và Khởi động Ứng dụng

### 2.1. Cấu trúc gói portable
- `Mo Phong Mach Dien.exe` và `MoPhongTuDien.exe` cùng khởi chạy ứng dụng Windows x64 qua WinForms và WebView2.
- `ACadSharp.dll`: Thư viện xử lý và xuất bản vẽ vector CAD AutoCAD (DWG/DXF).
- `Microsoft.Web.WebView2.*.dll` & `WebView2Loader.dll`: Nhân hiển thị đồ họa vector độc lập, bảo mật, ngắt kết nối mạng tuyệt đối.
- `web/`: Toàn bộ mã nguồn giao diện ES Modules, biểu tượng vector SVG, CSS, bộ dịch ngôn ngữ.
- `examples/`: 4 dự án tủ điện mẫu hoàn chỉnh:
  1. `sump-pit.td2d.json`: Tủ bơm thoát nước hố thu luân phiên G4Q-212S.
  2. `smoke-exhaust.td2d.json`: Tủ quạt hút khói sự cố liên động PCCC.
  3. `pressure-control.td2d.json`: Tủ bơm tăng áp biến tần vòng lặp 4-20mA Sensys & E5EC.
  4. `ats-panel.td2d.json`: Tủ chuyển đổi nguồn tự động ATS 2 nguồn (Lưới - Máy phát).
- `docs/`: Toàn bộ hồ sơ kỹ thuật, bảng đối chiếu bản vẽ gốc và báo cáo kết quả kiểm nghiệm.
- `KHOI_DONG_UNG_DUNG.bat`: Kịch bản khởi động ứng dụng nhanh 1-click.
- `CHAY_KIEM_THU.bat` chạy kiểm thử tích hợp ứng dụng Windows và lưu kết quả vào thư mục tạm.

### 2.2. Cách khởi động ứng dụng trên Windows
1. Giải nén toàn bộ gói vào một thư mục.
2. Mở `MoPhongTuDien.exe`, `Mo Phong Mach Dien.exe` hoặc `KHOI_DONG_UNG_DUNG.bat` trong thư mục đó.
3. Ứng dụng dùng .NET Framework 4.8 và Microsoft Edge WebView2 Runtime trên Windows x64.

---

## 3. Hướng dẫn Thao tác và Tính năng Chính

### 3.1. Bố cục Giao diện Chuẩn MEP
- **Thanh tiêu đề (Titlebar):** Tên dự án, trạng thái thay đổi chưa lưu (`*`), chuyển đổi đa ngôn ngữ (Tiếng Việt, English, 日本語), hộp thoại Giới thiệu & Bản quyền.
- **Thanh lệnh (Toolbar):** 
  - Quản lý tệp: Dự án mới (`Ctrl+N`), Mở dự án (`Ctrl+O`), Lưu (`Ctrl+S`), Lưu thành (`Ctrl+Shift+S`).
  - **BOM (Bảng kê vật tư):** Mở cửa sổ thống kê vật tư thiết bị và xuất file CSV Excel.
  - **Sự cố (Faults):** Bảng tiêm sự cố cưỡng bức (Mất pha L1/L2/L3, Đảo pha, Thấp áp, Reset).
  - Xuất bản vẽ: Xuất PDF độ nét cao, Xuất DWG mở bằng AutoCAD.
  - **Mạch mẫu** mở các mạch khởi động trực tiếp, sao–tam giác, bơm theo mức nước, Sump Pit, Smoke Exhaust, điều khiển áp suất, tủ ATS và hai mẫu biến tần/SCR của tủ DEMO-01. [Hướng dẫn DEMO-01](MACH-MAU-DEMO-01.md)
  - Điều khiển mô phỏng: Chạy (`Run`), Tạm dừng (`Pause`), Từng bước (`Step`), Đặt lại (`Reset`), Tốc độ mô phỏng (0.5x, 1x, 2x, 5x).
  - Thao tác: Hoàn tác (`Ctrl+Z`), Làm lại (`Ctrl+Y`), Xóa phần tử (`Delete`).
  - Que đo mạch: Bật que đo Vôn kế (V) và Ampe kế (A).
- **Thư viện thiết bị (Bên trái):** Gồm 49 ký hiệu vector kỹ thuật được phân nhóm rõ ràng (Nguồn điện, Đóng cắt bảo vệ, Khởi động từ & Rơ-le, Cảm biến & Thiết bị đo lường, Báo hiệu & Phụ tải...). Có thanh tìm kiếm tức thời theo tên hoặc ký hiệu.
- **Bàn vẽ chính (Canvas 2D):** Không gian vẽ vô hạn, có lưới căn chỉnh (Grid Snap), hỗ trợ Pan (chuột giữa hoặc giữ Space), Zoom chuột mượt mà.
- **Bảng thuộc tính (Bên phải):** Cấu hình tag thiết bị, thông số điện, thời gian trễ timer, kiểu tiếp điểm, thiết bị chủ (Master Device), lựa chọn kênh lịch tuần, và hiển thị Cây truy vết chuỗi nguyên nhân.
- **Bảng ca kiểm thử & Nhật ký (Bên dưới):** Chạy kịch bản kiểm thử tự động của mạch mẫu, ghi chép dòng thời gian sự kiện mô phỏng, cảnh báo sai miền nguồn, hở mạch, ngắn mạch.

### 3.2. Mở nhiều dự án và sao chép thiết bị

1. Dùng **Mở**, **Mới** hoặc chọn **Mạch mẫu**. Chọn tab ngay dưới thanh lệnh để chuyển dự án. Mô phỏng đang chạy sẽ tạm dừng khi chuyển tab và giữ thời gian để chạy tiếp.
2. Chọn một hoặc nhiều thiết bị trong dự án nguồn. Nhấn `Ctrl+C`, chuyển sang tab đích rồi nhấn `Ctrl+V`. Dây nối nội bộ được sao chép cùng nhóm thiết bị.
3. Khi thấy hộp thoại trùng tag, kiểm tra các tag được đề xuất và chọn **Đổi tag và dán** hoặc **Hủy**.
4. Nút `×` đóng từng tab. Nếu tab có thay đổi chưa lưu, chọn **Lưu**, **Bỏ thay đổi** hoặc **Hủy**.

### 3.3. Quy tắc Nối dây và Phân nhánh (Wiring Rules)
1. **Nối chân đến chân (Pin-to-Pin):**
   - Nhấp chuột vào chân thiết bị xuất phát (vòng tròn bắt điểm màu xanh/đỏ).
   - Di chuột và nhấp vào chân đích cần kết nối. Đường dây tự động bẻ góc vuông vắn (Orthogonal routing).
2. **Nối rẽ nhánh chữ T (T-Branch):**
   - Nhấp vào một chân thiết bị, sau đó nhấp vào thân một đoạn dây có sẵn. Hệ thống sẽ tự động tách dây và tạo nút liên kết (Junction Dot) chuẩn kỹ thuật.
3. **Dây giao nhau (Crossing Wires):**
   - Mặc định hai dây cắt ngang nhau không có nút chấm tròn sẽ **không nối điện** với nhau (có cầu vòng vượt dây thể hiện trực quan).

---

## 4. Các Thiết bị Công nghiệp Mới Bổ sung (v1.4.0)

1. **Rơ-le bảo vệ pha 3 pha (Phase Protection Relay - Schneider RM4TR / Omron APR-S):**
   - Giám sát nguồn điện 3 pha 380V (L1, L2, L3).
   - Bộ tiếp điểm ngõ ra độc lập (Dry Contacts): Chân chung 11 (COM), chân 12 (NC - Báo sự cố), chân 14 (NO - Nguồn tốt/Healthy).
   - Khi nguồn đủ 3 pha và đúng thứ tự pha: 11 nối thông với 14, 11 hở với 12.
   - Khi mất pha (L1, L2 hoặc L3) hoặc đảo thứ tự pha: 11 ngắt khỏi 14, đóng sang 12 để ngắt khởi động từ và báo còi/đèn sự cố.

2. **Biến tần động cơ (Inverter / VFD - Inovance MD310 / Schneider ATV310):**
   - Đầu vào động lực 3 pha 380V (L1-L2-L3).
   - Đầu ra điều khiển động cơ 3 pha biến thiên (U-V-W).
   - Chân điều khiển logic đa năng: FWD (Chạy thuận), REV (Chạy nghịch), CM (Chân chung tín hiệu).
   - Tiếp điểm rơ-le báo lỗi sự cố: 30A (NO), 30B (NC), 30C (COM).
   - Điều chỉnh tần số vận hành trực tiếp từ 0.0 Hz đến 60.0 Hz.

3. **Khởi động mềm (Soft Starter - Schneider ATS22 / ABB PSE):**
   - Đầu vào 3 pha L1-L2-L3, đầu ra phụ tải T1-T2-T3.
   - Chân điều khiển RUN, STOP, COM.
   - Tiếp điểm phản hồi chạy RUN (chân 13-14).
   - Tiếp điểm hoàn tất khởi động BYPASS (chân 23-24) để đóng contactor nối tắt bypass tiết kiệm năng lượng.
   - Tiếp điểm bảo vệ sự cố FAULT (95-96 NC ngắt mạch khi lỗi, 97-98 NO đóng báo sự cố).

4. **Đồng hồ đa năng giám sát điện năng (Multifunction Power Meter - Selec MFM383A / PM5000):**
   - Đo điện áp dây và điện áp pha 3P4W (L1-L2-L3-N), tần số nguồn.
   - Tiếp điểm rơ-le cảnh báo ALM1-ALM2 đóng mạch khi điện áp vượt quá hoặc thấp hơn ngưỡng an toàn, hoặc khi mất pha nguồn.

---

## 5. Mạch Mẫu Mới: Tủ Chuyển Nguồn Tự Động ATS (`ats-panel.td2d.json`)

Tủ ATS được thiết kế theo tiêu chuẩn IEC 60947-6-1 với 2 nguồn độc lập:
- **Nguồn 1 (Mains Grid):** Nguồn điện lưới quốc gia 3P 380V, qua MCCB lưới và rơ-le bảo vệ pha PR1.
- **Nguồn 2 (Generator):** Nguồn máy phát điện dự phòng 3P 380V, qua MCCB máy phát.
- **Khóa liên động kép:** 
  - Liên động cơ khí giữa 2 khởi động từ `KM_M` (Lưới) và `KM_G` (Máy phát).
  - Liên động điện bằng tiếp điểm phụ thường đóng NC (`nc_km_g` và `nc_km_m`) đấu chéo nối tiếp trước cuộn hút contactor đối diện.
  - Rơ-le thời gian trễ `KT_G` (Timer ON Delay 1s) kiểm soát độ trễ chuyển nguồn ổn định tránh sốc điện cho tải động cơ `M_CRITICAL`.
- **Kịch bản kiểm thử tích hợp:**
  1. *Kịch bản 1:* Nguồn lưới bình thường -> PR1 báo tốt (11-14 đóng) -> Đóng KM_M cấp điện cho động cơ, đèn xanh HL_M sáng.
  2. *Kịch bản 2:* Mất pha L1 lưới -> PR1 cắt (11-14 mở, 11-12 đóng) -> KM_M nhả, đèn đỏ sự cố HL_FLT sáng -> Đóng NC_KM_M kích hoạt timer KT_G -> Hết trễ đóng KM_G cấp điện từ máy phát, đèn vàng HL_G sáng. Đạt 100% Pass.

---

## 6. Hướng dẫn Sử dụng 3 Công cụ Kỹ thuật Nâng cao

### 6.1. Bảng kê vật tư thiết bị (BOM - Bill of Materials)
- Nhấp vào nút **BOM** trên thanh công cụ (Toolbar).
- Hộp thoại hiển thị đầy đủ bảng kê gồm:
  - **STT**, **Ký hiệu (Tag)**, **Tên thiết bị**, **Nhóm thiết bị**, **Hãng / Mã hiệu**, **Thông số**, **Số chân** và **Số lượng**.
- Các thiết bị cùng loại, mã hiệu và thông số được gộp một dòng và giữ danh sách tag. Tiếp điểm liên kết được tính cùng thiết bị chủ. **Số chân** đếm đầu cực của ký hiệu thiết bị trong mô hình.
- Nhấp **Xuất tệp CSV (Excel)**, chọn nơi lưu trong hộp thoại Windows rồi bấm **Lưu**. Tệp dùng dấu phẩy để phân cột và UTF-8 có BOM để giữ dấu tiếng Việt khi mở trong Microsoft Excel.

### 6.2. Bảng mô phỏng sự cố cưỡng bức (Fault Injection)
- Nhấp vào nút **Sự cố** trên thanh công cụ mô phỏng để mở trình đơn sự cố:
  - **Mất pha L1 / L2 / L3:** Cưỡng bức ngắt nguồn 1 pha để kiểm tra rơ-le bảo vệ pha và đồng hồ đa năng có cắt mạch kịp thời không.
  - **Đảo thứ tự pha (Phase Reversal):** Giả lập cấp ngược chiều quay pha để kiểm tra liên động bảo vệ động cơ.
  - **Thấp áp / Quá áp (Undervoltage):** Cưỡng bức điện áp tụt dưới ngưỡng cho phép.
  - **Khôi phục bình thường (Reset):** Xóa toàn bộ sự cố cưỡng bức, đưa hệ thống về trạng thái nguồn ban đầu.

### 6.3. Cây truy vết nguyên nhân trực quan (Visual Cause Chain)
- Trong khi mô phỏng đang chạy, nhấp chọn bất kỳ thiết bị nào trên bản vẽ (ví dụ: động cơ không quay, cuộn hút không đóng, đèn không sáng).
- Tại bảng **Thuộc tính** bên phải, xem phần **Truy vết chuỗi nguyên nhân**:
  - **Thẻ Xanh (OK):** Các điều kiện đã thỏa mãn (có đường cấp hợp lệ, có đường về, tiếp điểm đã đóng).
  - **Thẻ Đỏ (SỰ CỐ / NGẮT MẠCH):** Chỉ rõ chính xác chân nào đang thiếu điện, CB nào đang bị trip, hoặc tiếp điểm liên động nào đang hở.
  - **Thẻ Lam (THÔNG TIN):** Cung cấp diễn giải kỹ thuật và trạng thái vận hành của thiết bị.

---

## 7. Báo cáo Kiểm nghiệm Tự động (QA Verification)

Mở `CHAY_KIEM_THU.bat` trong thư mục portable để chạy kiểm thử tích hợp Windows ở chế độ offline. Xem `result.json` trong thư mục kiểm thử mới nhất tại `%TEMP%\MoPhongTuDien-Verify`.

Từ thư mục mã nguồn, chạy `node --test "./tests/*.test.mjs"` để kiểm tra mô phỏng và dữ liệu dự án.
