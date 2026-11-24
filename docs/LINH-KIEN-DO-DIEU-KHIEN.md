# Linh kiện đo lường và điều khiển

## Áp suất nước và Omron E5EC

Trong thư viện, chọn **Sensys M5256-C3079E-010BG** và **Omron E5EC-RX2ASM-800**. Tạo vòng tín hiệu theo thứ tự DC+ → Loop + của Sensys → Loop − của Sensys → chân 22 (I+) của E5EC. Nối chân 23 (I−) của E5EC về DC− của cùng nguồn. Dùng một nguồn AC 100–240 V riêng cho chân 1–2 của E5EC. Có thể đi qua cầu đấu, nút nối hoặc tiếp điểm trên đường tín hiệu.

Chọn đầu vào **Dòng 4–20 mA** và đặt hai đầu thang của E5EC bằng 0 và 10 để đọc bar. Khi chạy, thay đổi **Áp suất nước** trên cảm biến. Ở 0, 5 và 10 bar, dòng lần lượt bằng 4, 12 và 20 mA. Cảm biến cần nguồn vòng 9–30 VDC. Khi mất nguồn vòng hoặc đứt dây vào E5EC, bộ điều khiển đang có điện báo S.Err và nhả các đầu ra.

E5EC có đầu ra điều khiển OUT1 và hai đầu ra phụ. Mô hình dùng điều khiển ON/OFF theo điểm đặt SP và độ trễ H. Ở chiều thuận, relay đóng khi PV lên tới SP + H và mở khi xuống SP. Ở chiều nghịch, relay đóng khi PV xuống tới SP − H và mở khi lên SP. Với H bằng 0, tiếp điểm mở khi PV đúng bằng SP. AUX1 và AUX2 được gán giới hạn tuyệt đối cao và thấp, kể cả tại ngưỡng. Có thể nối nguồn và tải riêng qua từng cặp tiếp điểm.

| Cặp chân E5EC | Chức năng trong mô hình |
| --- | --- |
| 1–2 | Nguồn AC 100–240 V |
| 22 / 23 / 24 | RTD A / B / B′ |
| 22 / 23 | Dòng I+ / I− |
| 3–4 | OUT1 NO |
| 11–12 | AUX1 NO, báo cao |
| 9–10 | AUX2 NO, báo thấp |

Phần mềm mô hình hóa tín hiệu lý tưởng, chế độ ON/OFF và hai ngưỡng cảnh báo nói trên. Đặc tính động của quá trình, chế độ PID/AT, các kiểu cảnh báo khác và điện trở dây nằm ngoài phạm vi mô phỏng của model này. Tài liệu tham chiếu gồm [catalogue Sensys M5200](https://www.sungjitech.kr/%EC%A0%9C%ED%92%88%EB%8B%A4%EC%9A%B4%EB%A1%9C%EB%93%9C/download?fn=mmUY%2FKzsu1pPHFEpS53kOkxkczJVUnlYNnZKMHV5TFY0L2krSk1aUGQ5ZURRZ3ZEbXIybWVUWXNvMFk9), [cấu hình M5256-C3079E-010BG](https://sensysvietnam.com/san-pham/cam-bien-ap-suat-sensys-m5256-c3079e-010bg/), [bảng cấu hình E5EC-800 của Omron](https://www.omron-ap.com/products/family/3221/lineup.html) và [sơ đồ đấu chân của Omron, trang 30](https://www.omron-ap.com/data_pdf/cat/e5_c-800_h179-e1_5_7_csm1001629.pdf?id=3219#page=30).

## Nhiệt độ Evikon ET201

Đầu dò ET201-D6L130-Pt100-S5-IP68 là Pt100 ba dây, ống Ø6 × 130 mm. Nối A, B và B′ lần lượt tới 22, 23 và 24 của E5EC rồi chọn đầu vào **Pt100**. Có thể đổi chỗ hai dây B. Chọn đầu dò khi đang chạy để thay đổi nhiệt độ từ −50 tới 200 °C. Đầu dò báo điện trở theo đặc tuyến platinum 100 Ω tại 0 °C, khoảng 138,51 Ω tại 100 °C. E5EC nhận PV theo °C. Đường RTD cần đủ ba dây riêng đến tận đầu dò. [Thông số đúng mã đầu dò](https://cambien.com.vn/cam-bien-nhiet-do-nuoc-dang-tha-chim-et201-d6l130-pt100-s5-ip68) · [Datasheet dòng ET201 do Evikon phát hành](https://www.tme.eu/Document/0691b907b0ecd98aad2d31f2dace45ff/ET201_DS_EN%282%29.pdf).

## Timer tuần Omron H5S-WFB2

Cấp nguồn AC 100–240 V vào 4–5. Dùng 2–3 cho kênh 1, 8–9 cho kênh 2. Đặt **Ngày bắt đầu mô phỏng** và **Giờ bắt đầu mô phỏng**, mở **Lịch tuần**, bấm **Thêm chương trình tuần**. Chọn kênh, thứ, nhóm lịch, kiểu vận hành và giờ. Mỗi kênh có ngân sách 40 bước. Một khoảng ON/OFF dùng hai bước, một xung dùng một bước, một chu kỳ lặp dùng bốn bước. Khoảng kết thúc sớm hơn giờ bắt đầu sẽ tiếp tục qua nửa đêm. Để bắt đầu một chu kỳ theo nhiều thứ, chọn các thứ trong cùng chương trình.

| Kiểu | Thông số |
| --- | --- |
| Khoảng ON/OFF | Giờ bắt đầu và giờ kết thúc, chính xác đến phút |
| Xung | Giờ bắt đầu, độ dài 1–59 giây hoặc 1–60 phút nguyên |
| Chu kỳ | Giờ bắt đầu, giờ kết thúc, thời gian ON và OFF mỗi pha từ 1 đến 719 phút |

Nhóm A chạy khi 6–7 hở, nhóm B chạy khi đóng 6–7 bằng tiếp điểm khô. Có thể cưỡng bức từng kênh sang ON/OFF trong bảng đầu vào. Đưa về AUTO để áp dụng lịch. Khi ngắt nguồn điều khiển, hai đầu ra mở, đồng hồ tuần tiếp tục theo thời gian ảo. Đóng nguồn sẽ đánh giá lịch tại thời điểm hiện hành. **Từng bước** chuyển tới sự kiện tiếp theo. Lịch chạy độc lập với giờ của Windows. [Thông số, dung lượng và các chế độ H5S](https://www.ia.omron.com/products/family/217/specification.html) · [Hướng dẫn đấu chân của Omron](https://files.omron.eu/downloads/latest/manual/en/1618687-7_h5s_instruction_manual_en.pdf).

## Điều khiển mức Omron 61F

G2 và G3 đều dùng S0–S1 ở AC110 và S0–S2 ở AC220. Chọn **Bể ảo theo phần trăm** để thay đổi mức trực tiếp trong lúc chạy. Các cao độ phần trăm dưới đây là vị trí điện cực quy ước riêng cho bể mô phỏng. Chọn **Đấu điện cực ngoài trên sơ đồ** để dùng tiếp điểm khô nối mỗi đầu E tới điện cực chung. Trạng thái nhúng của mỗi điện cực lúc đó do dây và tiếp điểm trên bản vẽ quyết định.

| Chức năng | 61F-G2 | 61F-G3 |
| --- | --- | --- |
| Điện cực chung | E3 | E5 |
| Kích relay điều khiển khi nước dâng | E1 ở 65% | E2 ở 65% |
| Duy trì tới khi nước xuống dưới | E2 ở 25% | E3 ở 25% |
| Báo tràn | E4 ở 90% | E1 ở 90% |
| Báo cạn | — | Dưới E4 ở 10% |
| Tiếp điểm cho bơm xả / bơm cấp | Tc1–Ta1 / Tc1–Tb1 | Tc–Ta / Tc–Tb |
| Cảnh báo | Tc2–Ta2 báo tràn | Lc–LH báo tràn, Lc–LL báo cạn, B1–B2 báo chung |

Đặt tiếp điểm vào đường điều khiển cuộn hút để thử bơm cấp hoặc xả. Khi điện cực khô dần, relay điều khiển giữ trạng thái trong khoảng giữa hai điện cực vận hành. Tiếp điểm báo thấp của G3 trở về vị trí thường đóng khi mất nguồn relay. [Sơ đồ hai model và nguyên lý – catalogue Omron, trang 8–9](https://files.omron.eu/downloads/latest/datasheet/en/61f-g_floatless_level_switch_%28basic_type%29_datasheet_en.pdf#page=8).

## Biến áp cách ly AC → AC

Nhập miền nguồn sơ cấp và thứ cấp, ví dụ AC220 và AC110. Nối sơ cấp vào L–N. Dùng cặp X1–X2 cấp cho toàn bộ mạch thứ cấp. Phần mềm chỉ cấp điện thứ cấp khi đủ điện áp sơ cấp và tạo một nguồn thứ cấp riêng. Dòng từ hóa, tổn hao và sụt áp tải thuộc mô hình điện từ chi tiết hơn.

