# Báo cáo kiểm thử Mô phỏng tủ điện 2D

Bản 1.3.1 · 23/11/2026

Các ca sau đối chiếu mô hình logic. [Xem bảng đối chiếu và phần hồ sơ còn thiếu](DOI-CHIEU-HO-SO.md).

Ba mạch mẫu có **12 Pass**, **0 Fail** và **4 Chưa xác minh**. 276/276 kiểm tra trạng thái trong mô hình khớp giá trị kỳ vọng.

## Kiểm thử tự động bộ mô phỏng

- Số ca 34
- Đạt 34
- Không đạt 0
- Bỏ qua 0
- Pass · CAD preserves every corner, relative pen lift and disconnected stroke
- Pass · CAD keeps a closed symbol separate from its next connection
- Pass · CAD preserves reflected quadratic control and arc endpoints
- Pass · NO, NC theo đầu vào và ID thiết bị chủ khi tag trùng
- Pass · Cuộn cần đủ đường cấp và đường về từ cùng nguồn, cùng miền
- Pass · Tự giữ bằng NO song song và dừng qua NC
- Pass · Liên động NC chặn cuộn thứ hai
- Pass · Timer ON/OFF delay theo đồng hồ ảo và hủy chuyển tiếp đang chờ
- Pass · Trip/reset, truy nguyên mất nguồn và phân biệt lệnh chạy, tải chạy, phản hồi
- Pass · Dừng và chỉ ra phần tử gây dao động khi NC nối tiếp cuộn của chính nó
- Pass · Phát hiện đối nghịch nguồn qua terminal và giữ tách biệt dây giao nhau
- Pass · CB hai cực cắt bộ nguồn DC và relay luân phiên đổi đầu ra theo cạnh tác động
- Pass · Omron G4Q-212S giữ vị trí khi mất điện và đảo tiếp điểm ở lần cấp kế tiếp
- Pass · Lưu/mở giữ chân, liên kết, tuyến dây, ca kiểm thử và kết quả tái lập
- Pass · Ngôn ngữ mặc định, lưu lựa chọn và phục hồi cả khi bộ nhớ bị chặn
- Pass · Ba ngôn ngữ giữ nguyên nội dung nội suy của người dùng và đủ bản dịch
- Pass · Đổi ngôn ngữ giữ dữ liệu dự án và trạng thái điện của mạch đang mô phỏng
- Pass · Biến áp cách ly có nguồn riêng ở thứ cấp, cắt sơ cấp làm ngắt tải
- Pass · Sensys và E5EC đo áp suất trong vòng hai dây, OUT1 và hai relay phụ riêng biệt
- Pass · Pt100 ba dây, đổi hai B được phép, mất một dây báo S.Err
- Pass · H5S chạy đúng thời điểm ảo, hai kênh, xung, chuyển nhóm và qua nửa đêm
- Pass · H5S giới hạn 40 bước mỗi kênh và chu kỳ lặp 1 phút khi lập lịch
- Pass · 61F-G2 AC110/220 duy trì giữa hai điện cực và báo đầy bằng tiếp điểm
- Pass · 61F-G3 theo điện cực E1–E5, ngõ ra điều khiển, giới hạn cao và thấp
- Pass · Ampe kế phân biệt dòng tổng, dòng nhánh, chân tải và dòng khi hở tiếp điểm
- Pass · Dòng chưa khai báo, dòng trong dây song song và miền xung đột được phân biệt
- Pass · Vôn kế giữ đúng cực DC, đo giữa pha, từ chối điểm trôi và nguồn độc lập
- Pass · Nối hai dây trong một thao tác, giữ đường dây, nhãn và kết nối khi mở lại
- Pass · Tạo đúng một nút tại giao điểm; hủy trường hợp chạm lại cùng dây
- Pass · Hai đầu dây trùng tọa độ vẫn cần liên kết hai chân độc lập
- Pass · Mẫu áp suất đo 4–20 mA ở mọi đoạn vòng 2 dây, điện áp sơ/thứ cấp cách ly
- Pass · Các tiếp điểm mang tag của chủ, giữ mô tả cũ và kiểm tra trùng giữa hai thiết bị độc lập
- Pass · Đèn dùng màu đã chọn hoặc màu từ ký hiệu bản vẽ cũ
- Pass · Còi bắt đầu một lần, dừng khi tắt tiếng hoặc mất điện và kêu trở lại khi cho phép

## Giao diện bản Windows đóng gói

[Kiểm tra nội dung PDF và thực thể trong DWG](XUAT-BAN-VE.md)

- Kết quả Pass.
- Windows 10.0.26300.0, WebView2 157.0.4341.60.
- Pass · WebView2 đang ở trạng thái offline.
- Pass · Cầu nối tệp Windows đã sẵn sàng.
- Pass · Dự án trống khi mở bản Windows.
- Pass · Canvas và các bảng được bố trí trong cửa sổ desktop.
- Pass · Thư viện hiển thị 41 ký hiệu điện dạng vector.
- Pass · Có đủ sáu model chuyên dụng và biến áp cách ly AC.
- Pass · Tìm thấy Omron G4Q-212S AC220 trong thư viện thiết bị.
- Pass · Kéo thả nguồn AC và đèn từ thư viện.
- Pass · Nguồn và đèn lên bản vẽ theo hướng dọc với hình ký hiệu.
- Pass · Đổi thiết bị đã chọn sang hướng ngang.
- Pass · Hoàn tác đổi hướng ký hiệu.
- Pass · Tự lưu ghi trạng thái sơ đồ chưa lưu.
- Pass · Đèn dùng màu đã chọn và có nhãn nhấp nháy.
- Pass · Đèn có cả pha sáng và pha tối theo đồng hồ mô phỏng.
- Pass · Cắt nguồn làm đèn tắt và đổi nhãn.
- Pass · Lưu từ giao diện tạo dự án trên đĩa.
- Pass · Tệp lưu có schema, hai thiết bị và hai dây.
- Pass · Hướng ký hiệu được lưu trong dự án.
- Pass · Lưu dự án xóa bản nháp đã được ghi vào tệp.
- Pass · Mở lại dự án và giữ mô phỏng ở trạng thái dừng.
- Pass · Mở dự án ở chế độ chỉnh sửa.
- Pass · Chạy lại và tái lập đúng trạng thái đèn sau khi mở tệp.
- Pass · Xuất PDF từ sơ đồ trong bản Windows.
- Pass · Xuất DWG từ sơ đồ trong bản Windows.
- Pass · Vôn kế đo từ giữa dây cấp đến chân N được 230 V AC.
- Pass · Ampe kế báo rõ khi tải chưa có dữ liệu dòng.
- Pass · Ampe kế đo giữa dây về được 20 mA theo dòng đèn đã nhập.
- Pass · Nối trực tiếp hai đoạn dây sinh hai nút T và một nhánh mới.
- Pass · Hoàn tác một lần khôi phục cả hai dây nguyên vẹn.
- Pass · Tiếp điểm khóa trường tag sau khi chọn thiết bị chủ.
- Pass · Đổi tag cuộn đổi ngay tên tiếp điểm trên bản vẽ.
- Pass · Bộ phát còi tạo sóng âm thanh trong WebView2.
- Pass · Tệp mẫu sump-pit tải từ gói Windows.
- Pass · Bản vẽ sump-pit có CB liên động ba cực, nút nối, dây vượt và dấu số dây.
- Pass · Mẫu Sump Pit dùng ký hiệu cuộn Omron G4Q-212S.
- Pass · Thuộc tính ALT tách chân vật lý, chân trên sơ đồ và thông số xung theo Omron.
- Pass · Kiểm thử mẫu sump-pit hiển thị Pass và Chưa xác minh.
- Pass · Tệp mẫu smoke-exhaust tải từ gói Windows.
- Pass · Bản vẽ smoke-exhaust có CB liên động ba cực, nút nối, dây vượt và dấu số dây.
- Pass · Kiểm thử mẫu smoke-exhaust hiển thị Pass và Chưa xác minh.
- Pass · Điều chỉnh áp suất thực nghiệm trên giao diện điều khiển được E5EC và đèn qua dây của sơ đồ.
- Pass · Thêm lịch ON/OFF cho CH2 của H5S từ bảng thuộc tính và cập nhật bộ đếm bước.
- Pass · H5S có nguồn chạy lịch kênh 2 vào đầu tuần và giữ kênh 1 tắt.
- Pass · Giao diện khởi chạy mặc định bằng Tiếng Việt.
- Pass · Đổi sang en cập nhật thanh lệnh, thư viện và thuộc tính, giữ tên dự án và thời gian mô phỏng.
- Pass · Tên thiết bị trong thư viện được dịch sang en.
- Pass · Lưu lựa chọn ngôn ngữ en trên máy.
- Pass · Đổi sang ja cập nhật thanh lệnh, thư viện và thuộc tính, giữ tên dự án và thời gian mô phỏng.
- Pass · Tên thiết bị trong thư viện được dịch sang ja.
- Pass · Lưu lựa chọn ngôn ngữ ja trên máy.
- Pass · Đổi ngôn ngữ giữ nguyên dữ liệu dự án và trạng thái tự lưu.
- Pass · Đổi ngôn ngữ giữ nội dung chương trình tuần đang nhập chưa lưu.
- Pass · Mục Giới thiệu có đủ tác giả, đơn vị công tác và email góp ý.
- Pass · Mục Giới thiệu dùng ngôn ngữ đang chọn.
- Pass · Có thể trở về Tiếng Việt ngay trong phiên sử dụng.
- Pass · Tất cả tài nguyên giao diện tải từ gói cục bộ.
- Pass · Không có lỗi JavaScript trong các bước kiểm tra.
- Pass · Lưu thành tạo tệp thứ hai có nội dung đúng trên đĩa.

Kiểm tra chạy trên tệp `.exe` của bản portable, với WebView2 ở chế độ offline. Sự kiện kéo thả, nối chân và bấm dùng DOM trong cửa sổ desktop. Kiểm thử thay phần chọn đường dẫn của hộp thoại bằng thư mục QA riêng và thực hiện ghi/mở tệp qua cùng mã lưu trữ của bản phát hành. Kết nối Wi-Fi của Windows giữ nguyên.

## Sump Pit · SP-CP-01

### 01 · Mức nước tăng/giảm theo giả thiết XC1 · Chưa xác minh

Tham chiếu TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 13 / tờ 303 + tờ 304.

Đầu vào ban đầu S · AUTO/OFF/MAN · mode = AUTO.

Trạng thái đầu tại các điểm kiểm tra RL2 · active = Tắt/sai · SP-01-01 · running = Tắt/sai · SP-01-02 · running = Tắt/sai · RL1 · active = Tắt/sai · LOW LEVEL · active = Tắt/sai · ALT · active = Tắt/sai · MC1 · active = Tắt/sai · 1R1 · active = Tắt/sai · ON 1 · active = Tắt/sai · RL3 · active = Tắt/sai · RL4 · active = Tắt/sai · HIGH LEVEL · active = Tắt/sai · BZ · active = Tắt/sai · RL · đèn xoay · active = Tắt/sai · AS · closed = Tắt/sai · OFF 1 · active = Bật/đúng.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| Đáy bể giả định: cả bốn tiếp điểm mở · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 13 / tờ 303 + tờ 304 | Giữ nguyên đầu vào | RL2 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | RL2 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | Chưa xác minh |
| Tăng đến LEVEL 1; vùng giữa L1/L2 theo chiều tăng · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 13 / tờ 303 + tờ 304 | LEVEL 1 · signal = Bật/đúng | RL1 · active = Bật/đúng<br>LOW LEVEL · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | RL1 · active = Bật/đúng<br>LOW LEVEL · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | Chưa xác minh |
| LEVEL 2 đóng; ALT đổi sang nhánh MC1 trong mẫu · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 13 / tờ 303 + tờ 304 | LEVEL 2 · signal = Bật/đúng | RL2 · active = Bật/đúng<br>ALT · active = Bật/đúng<br>MC1 · active = Bật/đúng<br>1R1 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Tắt/sai<br>ON 1 · active = Bật/đúng | RL2 · active = Bật/đúng<br>ALT · active = Bật/đúng<br>MC1 · active = Bật/đúng<br>1R1 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Tắt/sai<br>ON 1 · active = Bật/đúng | Chưa xác minh |
| LEVEL 3 đóng; RL3 nối hai nhánh nên hai bơm cùng có lệnh · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 13 / tờ 303 + tờ 304 | LEVEL 3 · signal = Bật/đúng | RL3 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Bật/đúng | RL3 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Bật/đúng | Chưa xác minh |
| LEVEL 4 đóng; báo mức cao · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 13 / tờ 303 + tờ 304 | LEVEL 4 · signal = Bật/đúng | RL4 · active = Bật/đúng<br>HIGH LEVEL · active = Bật/đúng<br>BZ · active = Bật/đúng<br>RL · đèn xoay · active = Bật/đúng<br>AS · closed = Bật/đúng | RL4 · active = Bật/đúng<br>HIGH LEVEL · active = Bật/đúng<br>BZ · active = Bật/đúng<br>RL · đèn xoay · active = Bật/đúng<br>AS · closed = Bật/đúng | Chưa xác minh |
| Giảm qua LEVEL 4 · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 13 / tờ 303 + tờ 304 | LEVEL 4 · signal = Tắt/sai | HIGH LEVEL · active = Tắt/sai<br>AS · closed = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Bật/đúng | HIGH LEVEL · active = Tắt/sai<br>AS · closed = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Bật/đúng | Chưa xác minh |
| Giảm qua LEVEL 3 trước mốc timer, nhánh được ALT chọn vẫn chạy · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 13 / tờ 303 + tờ 304 | LEVEL 3 · signal = Tắt/sai | RL3 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | RL3 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | Chưa xác minh |
| Giảm dưới LEVEL 2; L1 vẫn đóng trong vùng giữa · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 13 / tờ 303 + tờ 304 | LEVEL 2 · signal = Tắt/sai | RL2 · active = Tắt/sai<br>MC1 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai<br>OFF 1 · active = Bật/đúng | RL2 · active = Tắt/sai<br>MC1 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai<br>OFF 1 · active = Bật/đúng | Chưa xác minh |
| Giảm dưới LEVEL 1 · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 13 / tờ 303 + tờ 304 | LEVEL 1 · signal = Tắt/sai | RL1 · active = Tắt/sai<br>LOW LEVEL · active = Tắt/sai | RL1 · active = Tắt/sai<br>LOW LEVEL · active = Tắt/sai | Chưa xác minh |

### 02 · AUTO theo XC1, Omron G4Q và T1 · Pass

Tham chiếu TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304. Omron G4Q CSM_G4Q_DS_E_3_2 · tr. 4–5.

Trạng thái đầu AUTO, XC1:3–4 mở. Ca chọn vị trí ban đầu của ALT để lần cấp điện đầu tiên ưu tiên MC1.

Đầu vào ban đầu S · AUTO/OFF/MAN · mode = AUTO.

Trạng thái đầu tại các điểm kiểm tra RL2 · active = Tắt/sai · ALT · powered = Tắt/sai · ALT · closed = Bật/đúng · MC1 · active = Tắt/sai · SP-01-01 · running = Tắt/sai · SP-01-02 · running = Tắt/sai · MC2 · active = Tắt/sai · T1 · 3 phút · active = Tắt/sai.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| Đóng XC1:3–4 lần 1, cuộn ALT đổi sang nhánh MC1 · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304. Omron G4Q CSM_G4Q_DS_E_3_2 · tr. 4–5 | LEVEL 2 · signal = Bật/đúng | RL2 · active = Bật/đúng<br>ALT · powered = Bật/đúng<br>ALT · closed = Bật/đúng<br>ALT · closed = Tắt/sai<br>MC1 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | RL2 · active = Bật/đúng<br>ALT · powered = Bật/đúng<br>ALT · closed = Bật/đúng<br>ALT · closed = Tắt/sai<br>MC1 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | Pass |
| Giữ XC1:3–4 đóng, G4Q giữ nhánh đã chọn · 1000 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304. Omron G4Q CSM_G4Q_DS_E_3_2 · tr. 4–5 | Giữ nguyên đầu vào | ALT · powered = Bật/đúng<br>ALT · closed = Bật/đúng<br>ALT · closed = Tắt/sai | ALT · powered = Bật/đúng<br>ALT · closed = Bật/đúng<br>ALT · closed = Tắt/sai | Pass |
| Mở XC1:3–4, lệnh AUTO mất và cam G4Q giữ vị trí · 1000 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304. Omron G4Q CSM_G4Q_DS_E_3_2 · tr. 4–5 | LEVEL 2 · signal = Tắt/sai | ALT · powered = Tắt/sai<br>ALT · closed = Bật/đúng<br>ALT · closed = Tắt/sai<br>MC1 · active = Tắt/sai<br>MC2 · active = Tắt/sai | ALT · powered = Tắt/sai<br>ALT · closed = Bật/đúng<br>ALT · closed = Tắt/sai<br>MC1 · active = Tắt/sai<br>MC2 · active = Tắt/sai | Pass |
| Đóng XC1:3–4 lần 2, ALT chọn MC2 · 1000 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304. Omron G4Q CSM_G4Q_DS_E_3_2 · tr. 4–5 | LEVEL 2 · signal = Bật/đúng | ALT · powered = Bật/đúng<br>ALT · closed = Tắt/sai<br>ALT · closed = Bật/đúng<br>MC1 · active = Tắt/sai<br>MC2 · active = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Bật/đúng<br>T1 · 3 phút · active = Tắt/sai | ALT · powered = Bật/đúng<br>ALT · closed = Tắt/sai<br>ALT · closed = Bật/đúng<br>MC1 · active = Tắt/sai<br>MC2 · active = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Bật/đúng<br>T1 · 3 phút · active = Tắt/sai | Pass |
| Trước mốc 3 phút · 180999 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304. Omron G4Q CSM_G4Q_DS_E_3_2 · tr. 4–5 | Giữ nguyên đầu vào | T1 · 3 phút · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Bật/đúng | T1 · 3 phút · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Bật/đúng | Pass |
| Chạm 3 phút, T1 NO cấp thêm MC1 · 181000 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304. Omron G4Q CSM_G4Q_DS_E_3_2 · tr. 4–5 | Giữ nguyên đầu vào | T1 · 3 phút · active = Bật/đúng<br>MC1 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Bật/đúng | T1 · 3 phút · active = Bật/đúng<br>MC1 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Bật/đúng | Pass |
| OFF ngắt lệnh chạy, cuộn ALT vẫn được RL2 cấp điện · 181000 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304. Omron G4Q CSM_G4Q_DS_E_3_2 · tr. 4–5 | S · AUTO/OFF/MAN · mode = OFF | ALT · powered = Bật/đúng<br>ALT · closed = Bật/đúng<br>MC1 · active = Tắt/sai<br>MC2 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | ALT · powered = Bật/đúng<br>ALT · closed = Bật/đúng<br>MC1 · active = Tắt/sai<br>MC2 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | Pass |

### 03 · RL3 bổ sung MC1 khi ALT cấp MC2 · Pass

Tham chiếu TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304.

Đầu vào ban đầu S · AUTO/OFF/MAN · mode = AUTO.

Trạng thái đầu tại các điểm kiểm tra ALT · active = Tắt/sai · SP-01-01 · running = Tắt/sai · SP-01-02 · running = Tắt/sai · RL3 · active = Tắt/sai · T1 · 3 phút · active = Tắt/sai · 1R1 · active = Tắt/sai · MC1 · active = Tắt/sai.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| Tạo hai cạnh lên RL2 để chọn nhánh MC2 · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | LEVEL 2 · signal = Bật/đúng | ALT · active = Bật/đúng | ALT · active = Bật/đúng | Pass |
| Nhả XC1:3–4 · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | LEVEL 2 · signal = Tắt/sai | Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | Pass |
| Đóng lại XC1:3–4 · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | LEVEL 2 · signal = Bật/đúng | Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Bật/đúng | Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Bật/đúng | Pass |
| Đóng XC1:5–6 trước mốc timer; RL3 cấp thêm MC1 · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | LEVEL 3 · signal = Bật/đúng | RL3 · active = Bật/đúng<br>T1 · 3 phút · active = Tắt/sai<br>1R1 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Bật/đúng | RL3 · active = Bật/đúng<br>T1 · 3 phút · active = Tắt/sai<br>1R1 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Bật/đúng | Pass |
| Mở XC1:5–6 trước mốc timer; MC1 nhả · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | LEVEL 3 · signal = Tắt/sai | MC1 · active = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Bật/đúng | MC1 · active = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Bật/đúng | Pass |

### 04 · MAN, tự giữ, trip/reset và OFF · Pass

Tham chiếu TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304.

Đầu vào ban đầu S · AUTO/OFF/MAN · mode = MAN.

Trạng thái đầu tại các điểm kiểm tra RA · active = Bật/đúng · MC1 · active = Tắt/sai · OFF 1 · active = Bật/đúng · 1R1 · active = Tắt/sai · SP-01-01 · running = Tắt/sai · 1R1 · closed = Tắt/sai · TH1 · closed = Bật/đúng · FAULT 1 · active = Tắt/sai · AS · closed = Tắt/sai · RBZ · active = Tắt/sai · BZ · active = Tắt/sai · SP-01-02 · running = Tắt/sai · ON 2 · active = Tắt/sai · 2R1 · active = Tắt/sai · MC2 · active = Tắt/sai.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| MAN, chưa có thao tác ON · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | Giữ nguyên đầu vào | RA · active = Bật/đúng<br>MC1 · active = Tắt/sai<br>OFF 1 · active = Bật/đúng | RA · active = Bật/đúng<br>MC1 · active = Tắt/sai<br>OFF 1 · active = Bật/đúng | Pass |
| Nhấn ON 1 · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | PB ON 1 · pressed = Bật/đúng | 1R1 · active = Bật/đúng<br>MC1 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng | 1R1 · active = Bật/đúng<br>MC1 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng | Pass |
| Nhả ON 1, tự giữ nhờ 1R1 · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | PB ON 1 · pressed = Tắt/sai | 1R1 · closed = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng | 1R1 · closed = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng | Pass |
| Giả lập TH1 trip · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | TH1 · trip = Bật/đúng | TH1 · closed = Tắt/sai<br>MC1 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>FAULT 1 · active = Bật/đúng<br>AS · closed = Bật/đúng | TH1 · closed = Tắt/sai<br>MC1 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>FAULT 1 · active = Bật/đúng<br>AS · closed = Bật/đúng | Pass |
| Nhấn MUTE · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | MUTE · pressed = Bật/đúng | RBZ · active = Bật/đúng<br>BZ · active = Tắt/sai<br>AS · closed = Bật/đúng | RBZ · active = Bật/đúng<br>BZ · active = Tắt/sai<br>AS · closed = Bật/đúng | Pass |
| Nhả MUTE, còi vẫn tắt khi FAULT còn · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | MUTE · pressed = Tắt/sai | RBZ · active = Bật/đúng<br>BZ · active = Tắt/sai<br>AS · closed = Bật/đúng | RBZ · active = Bật/đúng<br>BZ · active = Tắt/sai<br>AS · closed = Bật/đúng | Pass |
| Reset TH1, tự giữ cũ đã nhả · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | TH1 · trip = Tắt/sai | FAULT 1 · active = Tắt/sai<br>RBZ · active = Tắt/sai<br>AS · closed = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai | FAULT 1 · active = Tắt/sai<br>RBZ · active = Tắt/sai<br>AS · closed = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai | Pass |
| Nhấn ON 2 · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | PB ON 2 · pressed = Bật/đúng | Bơm 2 đủ điều kiện động lực = Bật/đúng<br>ON 2 · active = Bật/đúng | Bơm 2 đủ điều kiện động lực = Bật/đúng<br>ON 2 · active = Bật/đúng | Pass |
| Nhả ON 2 · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | PB ON 2 · pressed = Tắt/sai | Bơm 2 đủ điều kiện động lực = Bật/đúng | Bơm 2 đủ điều kiện động lực = Bật/đúng | Pass |
| Nhấn OFF 2 · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | PB OFF 2 · pressed = Bật/đúng | 2R1 · active = Tắt/sai<br>MC2 · active = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | 2R1 · active = Tắt/sai<br>MC2 · active = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | Pass |
| Chuyển OFF rồi nhả nút · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | S · AUTO/OFF/MAN · mode = OFF<br>PB OFF 2 · pressed = Tắt/sai | RA · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | RA · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | Pass |

### 05 · Tách mất động lực, điều khiển và nguồn chung · Pass

Tham chiếu TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 + tờ 304.

Đầu vào ban đầu S · AUTO/OFF/MAN · mode = MAN.

Trạng thái đầu tại các điểm kiểm tra MC1 · active = Tắt/sai · SP-01-01 · running = Tắt/sai · SP-01-01 · command = Tắt/sai · PS · 24 VDC · active = Bật/đúng · 1R1 · active = Tắt/sai · OFF 1 · active = Bật/đúng.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| Tạo lệnh MAN · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 + tờ 304 | PB ON 1 · pressed = Bật/đúng | MC1 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng | MC1 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Bật/đúng | Pass |
| Nhả ON · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 + tờ 304 | PB ON 1 · pressed = Tắt/sai | Bơm 1 đủ điều kiện động lực = Bật/đúng | Bơm 1 đủ điều kiện động lực = Bật/đúng | Pass |
| Mất động lực độc lập nhưng cuộn vẫn hút · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 + tờ 304 | R/S/T · 380 V · on = Tắt/sai | MC1 · active = Bật/đúng<br>SP-01-01 · command = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Tắt/sai | MC1 · active = Bật/đúng<br>SP-01-01 · command = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Tắt/sai | Pass |
| Mất điều khiển và 24 VDC · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 + tờ 304 | R/N · 220 V · on = Tắt/sai | PS · 24 VDC · active = Tắt/sai<br>1R1 · active = Tắt/sai<br>MC1 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai | PS · 24 VDC · active = Tắt/sai<br>1R1 · active = Tắt/sai<br>MC1 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai | Pass |
| Khôi phục hai miền nguồn, không có lệnh MAN mới · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 + tờ 304 | R/S/T · 380 V · on = Bật/đúng<br>R/N · 220 V · on = Bật/đúng | PS · 24 VDC · active = Bật/đúng<br>MC1 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai | PS · 24 VDC · active = Bật/đúng<br>MC1 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai | Pass |
| Cắt MAIN, mất cả nhánh PS và chỉ thị · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 + tờ 304 | MAIN MCCB · on = Tắt/sai | PS · 24 VDC · active = Tắt/sai<br>OFF 1 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai | PS · 24 VDC · active = Tắt/sai<br>OFF 1 · active = Tắt/sai<br>Bơm 1 đủ điều kiện động lực = Tắt/sai | Pass |
| Đóng MAIN tại MAN, đèn OFF trở lại · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 + tờ 304 | MAIN MCCB · on = Bật/đúng | PS · 24 VDC · active = Bật/đúng<br>OFF 1 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Tắt/sai | PS · 24 VDC · active = Bật/đúng<br>OFF 1 · active = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Tắt/sai | Pass |

### 06 · Khởi động lại AUTO cần xác nhận hiện trường · Chưa xác minh

Tham chiếu TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 và PDF tr. 14 / tờ 304. Điều kiện khởi động lại tại tủ cần xác nhận.

Đầu vào ban đầu S · AUTO/OFF/MAN · mode = AUTO.

Trạng thái đầu tại các điểm kiểm tra SP-01-01 · running = Tắt/sai · SP-01-02 · running = Tắt/sai · ALT · powered = Tắt/sai · ALT · closed = Bật/đúng · SP-01-02 · feedback = Chưa có liên kết.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| Đóng tiếp điểm mức 2 khi AUTO · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 và PDF tr. 14 / tờ 304. Điều kiện khởi động lại tại tủ cần xác nhận | LEVEL 2 · signal = Bật/đúng | Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | Bơm 1 đủ điều kiện động lực = Bật/đúng<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | Chưa xác minh |
| Cắt MAIN khi XC1:3–4 chưa mở · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 và PDF tr. 14 / tờ 304. Điều kiện khởi động lại tại tủ cần xác nhận | MAIN MCCB · on = Tắt/sai | ALT · powered = Tắt/sai<br>ALT · closed = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | ALT · powered = Tắt/sai<br>ALT · closed = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Tắt/sai | Chưa xác minh |
| Đóng MAIN, mô hình tạo cạnh lên mới nên ALT đổi nhánh · 0 ms | TU DIEN/PDF/26. SP-CP-01 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 và PDF tr. 14 / tờ 304. Điều kiện khởi động lại tại tủ cần xác nhận | MAIN MCCB · on = Bật/đúng | ALT · powered = Bật/đúng<br>ALT · closed = Tắt/sai<br>ALT · closed = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Bật/đúng<br>Chưa có phản hồi bơm thực = Chưa có liên kết | ALT · powered = Bật/đúng<br>ALT · closed = Tắt/sai<br>ALT · closed = Bật/đúng<br>Bơm 1 đủ điều kiện động lực = Tắt/sai<br>Bơm 2 đủ điều kiện động lực = Bật/đúng<br>Chưa có phản hồi bơm thực = Chưa có liên kết | Chưa xác minh |


## Smoke Exhaust · P1-SEFP-1

### 01 · Trạng thái thường, FF yêu cầu chạy/dừng, OFF · Pass

Tham chiếu TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302.

Đầu vào ban đầu S1 · AUTO/OFF/MAN · mode = AUTO.

Trạng thái đầu tại các điểm kiểm tra FF1 · RUN/STOP · closed = Tắt/sai · MC1 · active = Tắt/sai · OFF 1 · active = Bật/đúng · 1R1 · closed = Tắt/sai · SME.PR-1-1 · running = Tắt/sai · 1R1 · active = Tắt/sai · MC1 · closed = Tắt/sai · 1R2 · closed = Tắt/sai.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| Thường: AUTO, tiếp điểm FF mở · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | Giữ nguyên đầu vào | FF1 · RUN/STOP · closed = Tắt/sai<br>MC1 · active = Tắt/sai<br>OFF 1 · active = Bật/đúng<br>1R1 · closed = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai | FF1 · RUN/STOP · closed = Tắt/sai<br>MC1 · active = Tắt/sai<br>OFF 1 · active = Bật/đúng<br>1R1 · closed = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai | Pass |
| FF đóng yêu cầu chạy · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | FF1 · RUN/STOP · signal = Bật/đúng | FF1 · RUN/STOP · closed = Bật/đúng<br>1R1 · active = Bật/đúng<br>MC1 · active = Bật/đúng<br>MC1 · closed = Bật/đúng<br>SME.PR-1-1 · running = Bật/đúng<br>1R1 · closed = Bật/đúng<br>1R2 · closed = Tắt/sai | FF1 · RUN/STOP · closed = Bật/đúng<br>1R1 · active = Bật/đúng<br>MC1 · active = Bật/đúng<br>MC1 · closed = Bật/đúng<br>SME.PR-1-1 · running = Bật/đúng<br>1R1 · closed = Bật/đúng<br>1R2 · closed = Tắt/sai | Pass |
| FF mở yêu cầu dừng · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | FF1 · RUN/STOP · signal = Tắt/sai | MC1 · active = Tắt/sai<br>OFF 1 · active = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai<br>1R1 · closed = Tắt/sai | MC1 · active = Tắt/sai<br>OFF 1 · active = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai<br>1R1 · closed = Tắt/sai | Pass |
| OFF khi có tiếp điểm FF đóng · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | S1 · AUTO/OFF/MAN · mode = OFF<br>FF1 · RUN/STOP · signal = Bật/đúng | FF1 · RUN/STOP · closed = Bật/đúng<br>MC1 · active = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai | FF1 · RUN/STOP · closed = Bật/đúng<br>MC1 · active = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai | Pass |

### 02 · MAN, tự giữ và dừng tại tủ · Pass

Tham chiếu TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302.

Đầu vào ban đầu S1 · AUTO/OFF/MAN · mode = MAN<br>FF1 · RUN/STOP · signal = Bật/đúng.

Trạng thái đầu tại các điểm kiểm tra FF1 · RUN/STOP · closed = Bật/đúng · MC1 · active = Tắt/sai · 1R1 · active = Tắt/sai · SME.PR-1-1 · running = Tắt/sai · 1R1 · closed = Tắt/sai · OFF 1 · active = Bật/đúng.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| FF đóng nhưng selector ở MAN, chưa nhấn ON · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | Giữ nguyên đầu vào | FF1 · RUN/STOP · closed = Bật/đúng<br>MC1 · active = Tắt/sai | FF1 · RUN/STOP · closed = Bật/đúng<br>MC1 · active = Tắt/sai | Pass |
| Nhấn PB ON · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | PB ON 1 · pressed = Bật/đúng | 1R1 · active = Bật/đúng<br>MC1 · active = Bật/đúng<br>SME.PR-1-1 · running = Bật/đúng | 1R1 · active = Bật/đúng<br>MC1 · active = Bật/đúng<br>SME.PR-1-1 · running = Bật/đúng | Pass |
| Nhả PB ON · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | PB ON 1 · pressed = Tắt/sai | 1R1 · closed = Bật/đúng<br>SME.PR-1-1 · running = Bật/đúng | 1R1 · closed = Bật/đúng<br>SME.PR-1-1 · running = Bật/đúng | Pass |
| Nhấn PB OFF · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | PB OFF 1 · pressed = Bật/đúng | 1R1 · active = Tắt/sai<br>MC1 · active = Tắt/sai<br>1R1 · closed = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai | 1R1 · active = Tắt/sai<br>MC1 · active = Tắt/sai<br>1R1 · closed = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai | Pass |
| Nhả PB OFF, latch đã ngắt · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | PB OFF 1 · pressed = Tắt/sai | 1R1 · closed = Tắt/sai<br>OFF 1 · active = Bật/đúng | 1R1 · closed = Tắt/sai<br>OFF 1 · active = Bật/đúng | Pass |

### 03 · F-1 đóng/cắt, trip/reset và chỉ thị RUN · Pass

Tham chiếu TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302.

Đầu vào ban đầu S1 · AUTO/OFF/MAN · mode = AUTO<br>FF1 · RUN/STOP · signal = Bật/đúng.

Trạng thái đầu tại các điểm kiểm tra MC1 · active = Bật/đúng · 1R1 · closed = Bật/đúng · SME.PR-1-1 · running = Bật/đúng · 1R2 · closed = Tắt/sai · SME.PR-1-1 · feedback = Chưa có liên kết · F-1 · closed = Bật/đúng · F-1 · tripped = Tắt/sai.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| FF đang yêu cầu, F-1 đóng · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | Giữ nguyên đầu vào | MC1 · active = Bật/đúng<br>1R1 · closed = Bật/đúng<br>SME.PR-1-1 · running = Bật/đúng | MC1 · active = Bật/đúng<br>1R1 · closed = Bật/đúng<br>SME.PR-1-1 · running = Bật/đúng | Pass |
| Cắt F-1: mất động lực, relay lệnh vẫn hút · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | F-1 · on = Tắt/sai | MC1 · active = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai<br>1R1 · closed = Bật/đúng<br>1R2 · closed = Tắt/sai<br>SME.PR-1-1 · feedback = Chưa có liên kết | MC1 · active = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai<br>1R1 · closed = Bật/đúng<br>1R2 · closed = Tắt/sai<br>SME.PR-1-1 · feedback = Chưa có liên kết | Pass |
| Mở FF rồi đóng F-1 · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | FF1 · RUN/STOP · signal = Tắt/sai<br>F-1 · on = Bật/đúng | MC1 · active = Tắt/sai<br>F-1 · closed = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai | MC1 · active = Tắt/sai<br>F-1 · closed = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai | Pass |
| Giả lập F-1 trip khi FF yêu cầu · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | FF1 · RUN/STOP · signal = Bật/đúng<br>F-1 · trip = Bật/đúng | F-1 · tripped = Bật/đúng<br>F-1 · closed = Tắt/sai<br>MC1 · active = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai | F-1 · tripped = Bật/đúng<br>F-1 · closed = Tắt/sai<br>MC1 · active = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai | Pass |
| Bỏ yêu cầu FF và reset F-1 · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | FF1 · RUN/STOP · signal = Tắt/sai<br>F-1 · trip = Tắt/sai | F-1 · tripped = Tắt/sai<br>F-1 · closed = Tắt/sai<br>MC1 · active = Tắt/sai | F-1 · tripped = Tắt/sai<br>F-1 · closed = Tắt/sai<br>MC1 · active = Tắt/sai | Pass |
| Đóng lại F-1 tại trạng thái thường · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | F-1 · on = Bật/đúng | F-1 · closed = Bật/đúng<br>MC1 · active = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai | F-1 · closed = Bật/đúng<br>MC1 · active = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai | Pass |

### 04 · TH1 trip/reset và ngõ ra FAULT · Pass

Tham chiếu TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302.

Đầu vào ban đầu S1 · AUTO/OFF/MAN · mode = AUTO<br>FF1 · RUN/STOP · signal = Bật/đúng.

Trạng thái đầu tại các điểm kiểm tra SME.PR-1-1 · running = Bật/đúng · 1R1 · closed = Bật/đúng · 1R2 · closed = Tắt/sai · TH1 · closed = Bật/đúng · MC1 · active = Bật/đúng · FAULT 1 · active = Tắt/sai.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| FF đóng; bình thường đang có lệnh · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | Giữ nguyên đầu vào | SME.PR-1-1 · running = Bật/đúng<br>1R1 · closed = Bật/đúng<br>1R2 · closed = Tắt/sai | SME.PR-1-1 · running = Bật/đúng<br>1R1 · closed = Bật/đúng<br>1R2 · closed = Tắt/sai | Pass |
| Giả lập TH1 trip · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | TH1 · trip = Bật/đúng | TH1 · closed = Tắt/sai<br>TH1 · closed = Bật/đúng<br>MC1 · active = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai<br>FAULT 1 · active = Bật/đúng<br>1R2 · closed = Bật/đúng | TH1 · closed = Tắt/sai<br>TH1 · closed = Bật/đúng<br>MC1 · active = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai<br>FAULT 1 · active = Bật/đúng<br>1R2 · closed = Bật/đúng | Pass |
| Nhả FF và reset TH1 · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 | FF1 · RUN/STOP · signal = Tắt/sai<br>TH1 · trip = Tắt/sai | TH1 · closed = Bật/đúng<br>FAULT 1 · active = Tắt/sai<br>1R2 · closed = Tắt/sai<br>MC1 · active = Tắt/sai | TH1 · closed = Bật/đúng<br>FAULT 1 · active = Tắt/sai<br>1R2 · closed = Tắt/sai<br>MC1 · active = Tắt/sai | Pass |

### 05 · Mất và khôi phục nguồn khi không có yêu cầu FF · Pass

Tham chiếu TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 11 / tờ 301 + tờ 302.

Đầu vào ban đầu S1 · AUTO/OFF/MAN · mode = AUTO<br>FF1 · RUN/STOP · signal = Bật/đúng.

Trạng thái đầu tại các điểm kiểm tra MC1 · active = Bật/đúng · SME.PR-1-1 · running = Bật/đúng · 1R1 · closed = Bật/đúng · OFF 1 · active = Tắt/sai.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| Cắt nguồn động lực · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 11 / tờ 301 + tờ 302 | R/S/T · 380 V · on = Tắt/sai | MC1 · active = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai<br>1R1 · closed = Bật/đúng | MC1 · active = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai<br>1R1 · closed = Bật/đúng | Pass |
| Khôi phục nguồn ba pha sau khi đã nhả FF · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 11 / tờ 301 + tờ 302 | FF1 · RUN/STOP · signal = Tắt/sai<br>R/S/T · 380 V · on = Bật/đúng | MC1 · active = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai | MC1 · active = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai | Pass |
| Cắt CTR · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 11 / tờ 301 + tờ 302 | CTR MCB · on = Tắt/sai | OFF 1 · active = Tắt/sai<br>1R1 · closed = Tắt/sai | OFF 1 · active = Tắt/sai<br>1R1 · closed = Tắt/sai | Pass |
| Đóng CTR khi FF mở · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 11 / tờ 301 + tờ 302 | CTR MCB · on = Bật/đúng | OFF 1 · active = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai | OFF 1 · active = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai | Pass |
| Cắt rồi trả MAIN, FF vẫn mở · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 11 / tờ 301 + tờ 302 | MAIN MCCB · on = Tắt/sai | OFF 1 · active = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai | OFF 1 · active = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai | Pass |
| Đóng MAIN · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 11 / tờ 301 + tờ 302 | MAIN MCCB · on = Bật/đúng | OFF 1 · active = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai | OFF 1 · active = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai | Pass |

### 06 · Nguồn trở lại với FF giữ đóng · Chưa xác minh

Tham chiếu TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 11 / tờ 301 + tờ 302; cần bảng logic FF.

Đầu vào ban đầu S1 · AUTO/OFF/MAN · mode = AUTO<br>FF1 · RUN/STOP · signal = Bật/đúng.

Trạng thái đầu tại các điểm kiểm tra MC1 · active = Bật/đúng · SME.PR-1-1 · running = Bật/đúng · 1R1 · closed = Bật/đúng · SME.PR-1-1 · feedback = Chưa có liên kết.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| Giữ FF đóng ở AUTO, cắt MAIN · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 11 / tờ 301 + tờ 302; cần bảng logic FF | MAIN MCCB · on = Tắt/sai | MC1 · active = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai<br>1R1 · closed = Tắt/sai | MC1 · active = Tắt/sai<br>SME.PR-1-1 · running = Tắt/sai<br>1R1 · closed = Tắt/sai | Chưa xác minh |
| Đóng MAIN, giữ nguyên trạng thái tiếp điểm giả lập · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 11 / tờ 301 + tờ 302; cần bảng logic FF | MAIN MCCB · on = Bật/đúng | MC1 · active = Bật/đúng<br>SME.PR-1-1 · running = Bật/đúng<br>1R1 · closed = Bật/đúng<br>SME.PR-1-1 · feedback = Chưa có liên kết | MC1 · active = Bật/đúng<br>SME.PR-1-1 · running = Bật/đúng<br>1R1 · closed = Bật/đúng<br>SME.PR-1-1 · feedback = Chưa có liên kết | Chưa xác minh |

### 07 · Phản hồi quay, damper và ưu tiên FIRE · Chưa xác minh

Tham chiếu TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 · FF/1108–1111; cần ma trận ngoài phạm vi tờ 302.

Đầu vào ban đầu S1 · AUTO/OFF/MAN · mode = AUTO.

Trạng thái đầu tại các điểm kiểm tra 1R1 · closed = Tắt/sai · SME.PR-1-1 · feedback = Chưa có liên kết.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| FF yêu cầu và có trạng thái RUN tại tủ; phản hồi quay còn thiếu · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 · FF/1108–1111; cần ma trận ngoài phạm vi tờ 302 | FF1 · RUN/STOP · signal = Bật/đúng | 1R1 · closed = Bật/đúng<br>Trạng thái quay tại hiện trường chưa được cung cấp = Chưa có liên kết | 1R1 · closed = Bật/đúng<br>Trạng thái quay tại hiện trường chưa được cung cấp = Chưa có liên kết | Chưa xác minh |
| Đọc phạm vi tiếp điểm FF; hồ sơ không xác định damper có/không xác nhận hoặc ưu tiên FIRE · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 12 / tờ 302 · FF/1108–1111; cần ma trận ngoài phạm vi tờ 302 | Giữ nguyên đầu vào | Chưa quy định | Chưa có giá trị đối chiếu | Chưa xác minh |

### 08 · F-2 chạy/dừng và lỗi độc lập · Pass

Tham chiếu TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 13 / tờ 303.

Đầu vào ban đầu S1 · AUTO/OFF/MAN · mode = AUTO<br>S2 · AUTO/OFF/MAN · mode = AUTO<br>S3 · AUTO/OFF/MAN · mode = AUTO.

Trạng thái đầu tại các điểm kiểm tra MC2 · active = Tắt/sai · 2R1 · closed = Tắt/sai · SME.PR-1-2 · running = Tắt/sai · SME.PR-1-1 · running = Tắt/sai · SME.PR-2-3-1 · running = Tắt/sai · 2R2 · closed = Tắt/sai · 1R2 · closed = Tắt/sai.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| FF nhánh 2 đóng, hai nhánh khác giữ trạng thái thường · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 13 / tờ 303 | FF2 · RUN/STOP · signal = Bật/đúng | MC2 · active = Bật/đúng<br>2R1 · closed = Bật/đúng<br>SME.PR-1-2 · running = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai<br>SME.PR-2-3-1 · running = Tắt/sai | MC2 · active = Bật/đúng<br>2R1 · closed = Bật/đúng<br>SME.PR-1-2 · running = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai<br>SME.PR-2-3-1 · running = Tắt/sai | Pass |
| TH2 trip, báo FAULT riêng · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 13 / tờ 303 | TH2 · trip = Bật/đúng | MC2 · active = Tắt/sai<br>2R1 · closed = Tắt/sai<br>2R2 · closed = Bật/đúng<br>SME.PR-1-2 · running = Tắt/sai<br>1R2 · closed = Tắt/sai | MC2 · active = Tắt/sai<br>2R1 · closed = Tắt/sai<br>2R2 · closed = Bật/đúng<br>SME.PR-1-2 · running = Tắt/sai<br>1R2 · closed = Tắt/sai | Pass |
| Mở FF và reset TH2 · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 13 / tờ 303 | FF2 · RUN/STOP · signal = Tắt/sai<br>TH2 · trip = Tắt/sai | MC2 · active = Tắt/sai<br>2R2 · closed = Tắt/sai | MC2 · active = Tắt/sai<br>2R2 · closed = Tắt/sai | Pass |

### 09 · F-3 chạy/dừng và lỗi độc lập · Pass

Tham chiếu TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304.

Đầu vào ban đầu S1 · AUTO/OFF/MAN · mode = AUTO<br>S3 · AUTO/OFF/MAN · mode = AUTO<br>S2 · AUTO/OFF/MAN · mode = AUTO.

Trạng thái đầu tại các điểm kiểm tra MC3 · active = Tắt/sai · 3R1 · closed = Tắt/sai · SME.PR-2-3-1 · running = Tắt/sai · SME.PR-1-1 · running = Tắt/sai · SME.PR-1-2 · running = Tắt/sai · 3R2 · closed = Tắt/sai · 1R2 · closed = Tắt/sai.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| FF nhánh 3 đóng, hai nhánh khác giữ trạng thái thường · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | FF3 · RUN/STOP · signal = Bật/đúng | MC3 · active = Bật/đúng<br>3R1 · closed = Bật/đúng<br>SME.PR-2-3-1 · running = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai<br>SME.PR-1-2 · running = Tắt/sai | MC3 · active = Bật/đúng<br>3R1 · closed = Bật/đúng<br>SME.PR-2-3-1 · running = Bật/đúng<br>SME.PR-1-1 · running = Tắt/sai<br>SME.PR-1-2 · running = Tắt/sai | Pass |
| TH3 trip, báo FAULT riêng · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | TH3 · trip = Bật/đúng | MC3 · active = Tắt/sai<br>3R1 · closed = Tắt/sai<br>3R2 · closed = Bật/đúng<br>SME.PR-2-3-1 · running = Tắt/sai<br>1R2 · closed = Tắt/sai | MC3 · active = Tắt/sai<br>3R1 · closed = Tắt/sai<br>3R2 · closed = Bật/đúng<br>SME.PR-2-3-1 · running = Tắt/sai<br>1R2 · closed = Tắt/sai | Pass |
| Mở FF và reset TH3 · 0 ms | TU DIEN/PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf · PDF tr. 14 / tờ 304 | FF3 · RUN/STOP · signal = Tắt/sai<br>TH3 · trip = Tắt/sai | MC3 · active = Tắt/sai<br>3R2 · closed = Tắt/sai | MC3 · active = Tắt/sai<br>3R2 · closed = Tắt/sai | Pass |


## Điều khiển áp suất nước · PT1 / PIC1

### Vòng 4–20 mA và ngõ ra OUT1 · Pass

Tham chiếu Mạch minh họa · Sensys 0–10 bar / 4–20 mA, E5EC ở chế độ ON/OFF tác động thuận, điểm đặt 5 bar..

Trạng thái đầu AC1 và DC1 bật. TR1 cấp 110 VAC cho PIC1 và đèn HL1..

Đầu vào ban đầu Giữ nguyên đầu vào.

Trạng thái đầu tại các điểm kiểm tra PT1 · currentMa = 4 · PIC1 · pv = 0 · PIC1 · active = Tắt/sai · HL1 · active = Tắt/sai · PIC1 · sensorFault = Tắt/sai.

| Bước và thời điểm | Tham chiếu | Thao tác | Kỳ vọng | Thực tế | Kết quả |
| --- | --- | --- | --- | --- | --- |
| Áp suất 0 bar · 0 ms | Mạch minh họa · Sensys 0–10 bar / 4–20 mA, E5EC ở chế độ ON/OFF tác động thuận, điểm đặt 5 bar. | PT1 · pressureBar = 0 | PT1 · currentMa = 4<br>PIC1 · pv = 0<br>PIC1 · active = Tắt/sai<br>HL1 · active = Tắt/sai | PT1 · currentMa = 4<br>PIC1 · pv = 0<br>PIC1 · active = Tắt/sai<br>HL1 · active = Tắt/sai | Pass |
| Áp suất 5.5 bar · 0 ms | Mạch minh họa · Sensys 0–10 bar / 4–20 mA, E5EC ở chế độ ON/OFF tác động thuận, điểm đặt 5 bar. | PT1 · pressureBar = 5.5 | PT1 · currentMa = 12.8<br>PIC1 · pv = 5.5<br>PIC1 · active = Bật/đúng<br>HL1 · active = Bật/đúng | PT1 · currentMa = 12.8<br>PIC1 · pv = 5.5<br>PIC1 · active = Bật/đúng<br>HL1 · active = Bật/đúng | Pass |
| Áp suất 10 bar · 0 ms | Mạch minh họa · Sensys 0–10 bar / 4–20 mA, E5EC ở chế độ ON/OFF tác động thuận, điểm đặt 5 bar. | PT1 · pressureBar = 10 | PT1 · currentMa = 20<br>PIC1 · pv = 10<br>PIC1 · active = Bật/đúng<br>HL1 · active = Bật/đúng | PT1 · currentMa = 20<br>PIC1 · pv = 10<br>PIC1 · active = Bật/đúng<br>HL1 · active = Bật/đúng | Pass |
| Áp suất 1 bar · 0 ms | Mạch minh họa · Sensys 0–10 bar / 4–20 mA, E5EC ở chế độ ON/OFF tác động thuận, điểm đặt 5 bar. | PT1 · pressureBar = 1 | PT1 · currentMa = 5.6<br>PIC1 · pv = 1<br>PIC1 · active = Tắt/sai<br>HL1 · active = Tắt/sai | PT1 · currentMa = 5.6<br>PIC1 · pv = 1<br>PIC1 · active = Tắt/sai<br>HL1 · active = Tắt/sai | Pass |
| Cắt nguồn vòng đo · 0 ms | Mạch minh họa · Sensys 0–10 bar / 4–20 mA, E5EC ở chế độ ON/OFF tác động thuận, điểm đặt 5 bar. | DC1 · on = Tắt/sai | PIC1 · sensorFault = Bật/đúng<br>HL1 · active = Tắt/sai | PIC1 · sensorFault = Bật/đúng<br>HL1 · active = Tắt/sai | Pass |

