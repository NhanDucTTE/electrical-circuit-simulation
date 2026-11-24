# Xuất bản vẽ PDF và DWG

Mở mạch, chọn **Xuất** trên thanh lệnh, chọn **Xuất PDF…** hoặc **Xuất DWG…** rồi chọn nơi lưu. Mỗi tệp chứa toàn bộ sơ đồ trong dự án, kể cả các nhánh nằm ngoài vùng đang nhìn. Chấm nối dây, tên chân, tag thiết bị, số dây và hình dạng tiếp điểm theo thời điểm xuất được đưa vào bản vẽ. Các nét màu báo điện, khung chọn và que đo là công cụ thao tác trên màn hình.

**PDF** có một trang A3 ngang với tên dự án. Nét sơ đồ là vector và nhãn là văn bản có thể tìm kiếm. Sơ đồ lớn được thu vừa trang, có thể phóng to khi xem. WebView2 có sẵn trên máy thực hiện việc in ra tệp.

**DWG** dùng định dạng AutoCAD 2013 (AC1027). Các lớp `DAY-DAN`, `THIET-BI`, `DAU-NOI` và `CHU` lần lượt chứa dây, ký hiệu, đầu nối và văn bản. Tọa độ sử dụng đơn vị sơ đồ. Đoạn thẳng, vòng tròn, chữ và polyline là các đối tượng CAD chỉnh sửa được. Đường cong của một số ký hiệu và cầu vượt dây được xấp xỉ thành các đoạn polyline. Mô hình mô phỏng, liên kết điện và kịch bản kiểm thử được lưu trong tệp dự án `.td2d.json`.

## Kiểm tra trên Windows

Đã xuất trọn mạch mẫu Sump Pit trong WebView2 ngoại tuyến 157.0.4341.60, với tiêu đề thử “Bản vẽ kiểm tra – Trạm bơm hố thu”.

| Kiểm tra | Kết quả |
| --- | --- |
| Mở PDF bằng trình phân tích PDF độc lập | Một trang A3 ngang, 1191,12 × 841,92 pt, 593 đối tượng vẽ vector. Đọc được tên tiếng Việt và nội dung nhãn. |
| Nhận dạng DWG | Sáu byte đầu là `AC1027`. |
| Đọc lại DWG bằng ACadSharp | Đủ 993 thực thể, gồm 285 LINE, 372 LWPOLYLINE, 21 CIRCLE và 315 TEXT. So khớp toàn bộ nhãn văn bản với lúc ghi. |
| Phân lớp DWG | 200 thực thể dây, 422 thực thể thiết bị, 56 thực thể đầu nối và 315 thực thể chữ. |
| Mở thủ công trên giao diện AutoCAD | Chưa kiểm tra. |

## Thư viện đóng gói

Trình ghi DWG sử dụng ACadSharp 3.7.1 cho .NET Framework 4.8. Gói Microsoft System.Memory 4.6.3 sử dụng System.Buffers 4.6.1, System.Numerics.Vectors 4.6.1 và System.Runtime.CompilerServices.Unsafe 6.1.2. Các DLL được trích từ các gói chính thức và đóng gói cùng ứng dụng. Người dùng có thể xuất tệp ngoại tuyến ngay cả khi máy chưa cài AutoCAD. Giấy phép MIT đi kèm trong thư mục `docs` của gói portable hoặc `desktop/cad` của mã nguồn. [ACadSharp 3.7.1](https://www.nuget.org/packages/ACadSharp/3.7.1) · [System.Memory 4.6.3 và các phụ thuộc](https://www.nuget.org/packages/System.Memory/4.6.3) · [Giấy phép ACadSharp](https://github.com/DomCR/ACadSharp/blob/d7dc111023477d8a9fffc2153139459c95b4f345/LICENSE) · [Giấy phép Microsoft](https://github.com/dotnet/maintenance-packages/blob/f62ca0009b038cab4725a720f386623a969d73ad/LICENSE)
