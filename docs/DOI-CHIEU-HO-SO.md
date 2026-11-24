# Đối chiếu hồ sơ Sump Pit và Smoke Exhaust

Số trang PDF đếm từ 1. Số tờ lấy trong khung tên. Chỉ đọc tệp nguồn trong `TU DIEN`.

## Kiểm kê và chọn phạm vi mẫu

| Nhóm hồ sơ | Nhận diện và phạm vi |
|---|---|
| `PDF/26. SP-CP-01 (Rev.A 20251030).pdf` | Tủ SP-CP-01 (PH), bản vẽ Q25-6123-26 Rev.A, 30/10/2025. Trang 11–14, tờ 301–304. Hai bơm SP-01-01 và SP-01-02, bốn tiếp điểm mức XC1 và nhánh báo chung. Đây là tủ dùng cho mẫu Sump Pit. |
| `PDF/27. SP-CP-02 (Rev.A 20251030).pdf`, `PDF/28. SP-CP-03 (Rev.A 20260416).pdf` | Các tủ SP-CP-02 (ADM), SP-CP-03 (WH) riêng. Số tag tải và nguồn cấp khác SP-CP-01. Tên tủ trong SLD trang 10 dùng để phân biệt. |
| `PDF/2.PIT PUMP POWER PANEL No.1 (Rev.A 260311).pdf`, `PDF/3.PIT PUMP POWER PANEL No.2 (Rev.A 260311).pdf` | Tờ 302, trang 13 của cả hai bộ, ghi tải P-9901 và P-9903 tương ứng, có lệnh ngoài, ELR và jumper liên động. Hai bộ này thuộc Q26-6029, khác các tủ SP-CP thuộc Q25-6123. |
| `PDF/10. P1- SEFP-1 (Rev.A 20251030).pdf` | Tủ P1-SEFP-1, bản vẽ Q25-6123-10 Rev.A, 30/10/2025. Trang 11–14, tờ 301–304. Ba quạt SME.PR-1-1, SME.PR-1-2 và SME.PR-2-3-1, tương ứng ba nhánh mô phỏng F-1 đến F-3. |
| `PDF/11. P1- SEFP-2 (Rev.A 20251030).pdf`, `PDF/12. P1- SEFP-3 (Rev.A 20251030).pdf`, `PDF/13. P1- SEFP-4 (Rev.A 20251030).pdf` | Các tủ SEFP khác. Tên tủ và các tag tải khác trên SLD trang 10. |

Tệp PDF cùng tên trong `PDF`, `CAD/Update` và `CAD/VU` khác ở cấp byte. Ảnh raster của vùng sơ đồ cho thấy khác biệt nét và chữ giữa các bản in. Đối chiếu bằng mắt các nhánh dùng trong mẫu trên bản `PDF` và `CAD/Update` cho cùng logic thể hiện trong các bảng dưới đây. `CAD/VU` và `CAD/Update` trùng ảnh vùng sơ đồ kiểm tra, ngoại trừ cụm ký hiệu của nhánh F-4 trên tờ SEFP-1/302, ngoài phạm vi mẫu. Khung tên các tờ dùng trong mẫu ghi Rev.A, đệ trình lần 1. Hồ sơ này đủ nhận diện tờ tham chiếu cho mẫu, trạng thái bản được duyệt thi công chưa được xác nhận. Mã nguồn mẫu ghi rõ tủ và nhánh được chọn khi thư mục có nhiều tủ cùng loại.

## Sump Pit — SP-CP-01

| Tệp và trang | Tag và chân trên bản vẽ | Miền nguồn, trạng thái và trình tự |
|---|---|---|
| SP-CP-01, trang 11–12 / 301–302 | Main MCCB 4P, MCB điều khiển 2P, EMER 11A–12A, PS AC/DC, MC1/MC2, TH1/TH2, XP1/XP2 U/V/W | Bus động lực 380 V. L/N qua MCB và tiếp điểm EMER đến LC/NC 220 VAC. PS cấp 24 VDC/0 V cho mạch mức. Mỗi tải có nhánh ELCB 3P → MC → TH → XP U/V/W. |
| SP-CP-01, trang 13 / 303 | XC1:1–2 / 3–4 / 5–6 / 7–8 tương ứng LEVEL 1–4. RL1–RL4 cuộn 13–14. RL1, RL4 NO 9–5 | Bốn tiếp điểm ngoài vẽ hở cấp lần lượt RL1–RL4 ở 24 VDC. RL1 9–5 cấp đèn LOW LEVEL, RL4 9–5 cấp đèn HIGH LEVEL. Đèn dùng LC/NC 220 VAC. |
| SP-CP-01, trang 14 / 304 | S AUTO/OFF/MAN, RL2 NO 9–5 và 10–6, ALT cuộn 13–14, ALT NO 4–3 / NC 4–1, RL3 NO 9–5, T1 cuộn A1/A2 và NO 151–181, RA | AUTO qua RL2 9–5 đến T1 ON delay 3 phút và tiếp điểm ALT. RL2 10–6 cấp cuộn ALT trực tiếp từ LC, trước selector. ALT 4–3 cấp nhánh MC1 và ALT 4–1 cấp nhánh MC2. RL3/T1 nối hai nút 1203/1207 nên tiếp điểm nào đóng cũng cấp thêm nhánh đang hở tại ALT, nếu TH và RA tương ứng cho phép. RA nhả ở AUTO, các nhánh qua RA NC. |
| SP-CP-01, trang 14 / 304 | PB ON NO 13–14, PB OFF NC 11–12, 1R1/2R1 NO 5–9, RA NO 5–9 / 6–10, TH1/TH2 NC 96–95, MC1/MC2 A2–A1 | MAN cấp RA và hai nhánh nút ấn. Mỗi ON có tiếp điểm tự giữ song song; OFF và TH NC nối tiếp với cuộn MC và relay chỉ thị đi cùng. S ở OFF tách lệnh AUTO và MAN. |
| SP-CP-01, trang 13–14 / 303–304 | TH NO 98–97, RF1/RF2 cuộn 13–14 và NO 9–5, RL4 NO 10–6, RBZ NC 9–1 và NO 9–5, MUTE 3–4, AS NO 9–5 → XC1:9–10 | TH trip ngắt cuộn và cấp relay/đèn FAULT. RL4 hoặc RF1/RF2 cấp AS và nhánh chuông/đèn xoay. MUTE tự giữ RBZ để ngắt chuông/đèn xoay tới khi mất điều kiện báo. XC1:9–10 là ngõ ra báo dạng tiếp điểm. Đèn ON/OFF theo các tiếp điểm 1R1/2R1 và RF, tải mô phỏng lấy đủ ba pha. |

### R.ATL Omron G4Q-212S AC220

Rơ-le DPDT dùng đế 8PFA1. Khi cuộn được cấp điện sau khi đã nhả, cơ cấu bánh cóc chuyển vị trí một lần. Giữ điện liên tục hoặc cắt điện cuộn đều giữ vị trí tiếp điểm vừa chọn. Omron quy định xung cấp cuộn từ 100 ms khi điều khiển bằng xung. Mô phỏng kiểm tra logic đổi vị trí theo cạnh cấp điện. [Danh mục Omron G4Q và đế 8PFA1](https://www.ia.omron.com/products/family/965/lineup.html) · [Datasheet Omron, trang 4](https://www.ia.omron.com/data_pdf/cat/g4q_ds_e_3_2_csm44.pdf#page=4) · [Nguyên lý rơ-le bánh cóc](https://www.ia.omron.com/product/cautions/36/safety_precautions.html)

Tờ 304 ghi cuộn 13–14 và thể hiện 4 là chân chung của nhánh 4–3 / 4–1. Omron ghi cuộn 2–7, bộ thứ nhất COM 1 / NO 3 / NC 4 và bộ thứ hai COM 8 / NO 6 / NC 5. Mạch mẫu hiển thị số chân theo tờ 304. Mục thông tin thiết bị hiển thị chân đế Omron. Cần xác minh số đầu dây tại tủ. [Datasheet Omron, trang 4–5](https://www.ia.omron.com/data_pdf/cat/g4q_ds_e_3_2_csm44.pdf#page=5)

Trong AUTO, khi RL2 nhả, lệnh chạy mất và G4Q giữ vị trí. Nếu cấp điện lại tạo cạnh lên ở cuộn ALT, G4Q sẽ đổi nhánh ưu tiên. Vị trí cam ban đầu trong mẫu là một thiết lập để tái lập ca kiểm thử. Cần xác minh vị trí thực tế và điều kiện khởi động lại của cả tủ.

Chưa có bảng cao độ, kiểu tiếp điểm khi phao ướt/khô hoặc quan hệ đóng/mở giữa bốn mức từ cụm ngoài XC1. Trình tự tăng/giảm nước của mẫu áp dụng giả thiết thao tác theo số thứ tự LEVEL, giữ các tiếp điểm mức thấp hơn đóng khi tăng lên và nhả theo thứ tự ngược khi giảm. Bản vẽ thể hiện tự giữ của hai nút ON tại MAN. Trạng thái tự giữ của bộ mức ngoài XC1 và tín hiệu xác nhận bơm thực chạy cần xác nhận tại dự án.

Trang 10/tờ 201 và sơ đồ tải trang 12/tờ 302 có giá trị công suất khác nhau cho các bơm. Mẫu chỉ dùng định danh tải và topology nhánh điều khiển. PE, SPD, đèn chỉ pha và quạt thông gió tủ nằm ngoài mạch logic mẫu.

## Smoke Exhaust — P1-SEFP-1

| Tệp và trang | Tag và chân trên bản vẽ | Miền nguồn, trạng thái và trình tự |
|---|---|---|
| P1-SEFP-1, trang 11–12 / 301–302 | Main MCCB 4P, CTR MCB 2P, MCCB nhánh F-1 3P, MC1, TH1, XP1 U/V/W | Bus 380 V cấp F-1 → MC1 → TH1 → quạt SME.PR-1-1. CTR cấp LC 220 VAC và NC từ L1/N1. Hở CB nhánh làm mất động lực. Sơ đồ điều khiển MC1 không vẽ tiếp điểm phụ CB nhánh. |
| P1-SEFP-1, trang 12 / 302 | S AUTO/OFF/MAN, FF SIGNAL COMMAND RUN/STOP 1101→1104, PB ON NO 13–14, 1R1 NO 5–9, PB OFF NC 11–12, TH1 NC 96–95, MC1 A2–A1, 1R1 13–14 | AUTO dùng tiếp điểm yêu cầu ngoài FF. MAN dùng PB ON, tự giữ qua 1R1, dừng bằng PB OFF. Cả hai đường qua TH1 NC trước nút cấp 1R1, MC1 và đèn ON. OFF cắt hai nhánh lệnh ở selector. |
| P1-SEFP-1, trang 12 / 302 | MC1 NC 11–12, TH1 NO 98–97, 1R2 13–14, 1R1 NO 8–12 và 1R2 NO 8–12, 1108–1109 / 1110–1111 | MC1 NC điều khiển đèn OFF. TH1 trip kích đèn FAULT và 1R2. Cặp đầu ra RUN/STOP phản ánh 1R1 cùng lệnh cấp cuộn, cặp FAULT phản ánh 1R2/TH1. Bản vẽ này chưa đưa phản hồi tốc độ/quay hoặc lưu lượng về tủ. |
| P1-SEFP-1, trang 13 / 303 | F-2, SME.PR-1-2, MC2, TH2, 2R1/2R2, FF 1201→1204, đầu ra 1208–1209 / 1210–1211 | Cùng cấu trúc điều khiển như F-1, qua selector và FF riêng trên tờ này. Giữ 2R1/2R2 và trạng thái nhiệt độc lập. |
| P1-SEFP-1, trang 14 / 304 | F-3, SME.PR-2-3-1, MC3, TH3, 3R1/3R2, FF 1301→1304, đầu ra 1308–1309 / 1310–1311 | Cùng cấu trúc điều khiển như F-1. Tờ 304 ghi cuộn MC3 A3–A2, MC3 NC 12–13, TH3 NC 97–96 và NO 99–98. Giữ các ký hiệu đó trong bí danh chân, cần đối chiếu đầu đấu vật lý của thiết bị. |

Các tờ 302–304 thể hiện tiếp điểm FF tại ranh giới tủ. Cần xác nhận logic ngoài từ hệ báo cháy, tiêu chí chấp nhận phản hồi chạy, tín hiệu xác nhận damper và đấu dây tương ứng nếu có, ưu tiên FIRE so với chế độ tại tủ, quy tắc reset/khởi động lại. Kết quả mất và cấp lại nguồn với FF giữ đóng mô tả logic mô hình tại ranh giới tủ. PE, SPD, đèn chỉ pha và quạt thông gió tủ nằm ngoài mạch logic mẫu. Các đầu terminal RUN/STOP, FAULT của tủ quạt và XC1:9–10 của tủ bơm để hở phía ngoài theo ranh giới tài liệu.
