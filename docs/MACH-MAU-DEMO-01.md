# Mạch mẫu OU-101

Mở **Mạch mẫu** và chọn một trong hai mục **OU-101**. Mỗi mẫu mở ở tab riêng. Mở **Kiểm thử → Chạy tất cả** để xem trình tự và kết quả từng bước.

| Nhánh | Thiết bị trên mô hình | Hồ sơ Q25-6123-20 Rev.A, 16/04/2026 |
| --- | --- | --- |
| AC3, DX-OHU-101 IU | Biến tần LS H100 18,5 kW, MC1, tải 16,34 kW qua XP1 | Tờ 201 và 302, trang PDF 10 và 12 |
| AC4, HT-1 | SCR-2 Hanyoung TPR-3SL130H 130 A, MC2, gia nhiệt 60 kW qua XP2 | Tờ 201 và 303, trang PDF 10 và 13 |
| AC5, HT-2 | SCR-3 Hanyoung TPR-3SL040H 40 A, MC3, gia nhiệt 6 kW qua XP3 | Tờ 201 và 304, trang PDF 10 và 14 |

Danh mục thiết bị nằm ở tờ 006, trang PDF 6 của `21. OU-101 (Rev.A 20260416).pdf`. Mã biến tần AC3 là `LSLV0185H100-4COFN`. Bỏ chọn thiết bị trên sơ đồ để xem **Hồ sơ tham chiếu** và **Nội dung cần xác nhận** trong bảng Thuộc tính. [Danh mục H100 của LS Electric](https://www.ls-electric.com/upload/customer/download/d67d85a7-6722-44a1-84e5-5c19099fdc67/H100_E_181018.pdf)

## Biến tần AC3

Chọn **Chạy**. Dùng AUTO và tín hiệu DCS START/STOP, hoặc chọn MAN và dùng nút ON/OFF. Tín hiệu FIRE cho phép thử liên động báo cháy. Chọn VFD-1 và nhập **Tần số đặt (Hz)** trong **Đầu vào mô phỏng**. Khi có đầu ra, ký hiệu biến tần hiển thị Hz và vòng/phút. Bảng Thuộc tính cho biết tần số đầu ra và tốc độ đồng bộ ước tính.

Tốc độ đồng bộ ước tính bằng `120 × tần số đầu ra / số cực`. Mẫu đặt 4 cực vì hồ sơ chưa xác nhận số cực động cơ. Ví dụ 35 Hz tương ứng 1.050 vòng/phút. Có thể chỉnh **Số cực động cơ** trước khi chạy mô phỏng. Giá trị này biểu diễn tốc độ đồng bộ theo tần số, còn tốc độ trục phụ thuộc động cơ và tải thực tế.

Các đầu vào analog được biểu diễn bằng giá trị đặt tần số. Tờ 201 ghi AC3 63AT và tờ 302 ghi 60 A. Mẫu giữ ghi chú đối chiếu tại CB AC3.

## SCR AC4 và AC5

Chọn SCR-2 hoặc SCR-3 và đặt **Mức yêu cầu SCR (%)**. Dùng công tắc AUTO/OFF/MAN và các tín hiệu tương ứng trên từng nhánh. Tác động **Trip** trên SCR để kiểm tra hồi tiếp alarm và ngắt gia nhiệt từng nhánh. Ca kiểm thử có sẵn minh họa tự giữ và ảnh hưởng của alarm.

Mức yêu cầu biểu diễn lệnh điều khiển. Phần mềm mô phỏng điều kiện cấp nguồn, RUN/STOP, hồi tiếp lỗi và trạng thái gia nhiệt theo từng nhánh. Tờ 303 và 304 ghi dải tại đầu SCR là 4–20 mA hoặc 1–5 VDC, trong khi dải ghi ở đầu nối tín hiệu ngoài là 0–20 mA hoặc 0–10 VDC. Các mẫu dùng giá trị phần trăm để thử logic điều khiển trong khi phần chuyển đổi thang tín hiệu còn cần xác nhận.
