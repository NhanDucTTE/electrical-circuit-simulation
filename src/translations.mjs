// Entries contain English and Japanese. Vietnamese source text is the lookup key.
export const messages = {
  "Số lượng": ["Quantity", "数量"],
  "Số chân": ["Terminals", "端子数"],
  "Hãng / Mã hiệu": ["Brand / Part number", "メーカー・型式"],
  "{0} thiết bị · {1} dòng vật tư": ["{0} devices · {1} material lines", "機器{0}台 · 明細{1}件"],
  "Số cực động cơ": ["Motor pole count", "電動機の極数"],
  "Dòng định mức (A)": ["Rated current (A)", "定格電流（A）"],
  "Công suất định mức (kW)": ["Rated power (kW)", "定格出力（kW）"],
  "Tần số đặt (Hz)": ["Frequency setpoint (Hz)", "設定周波数（Hz）"],
  "Mức điều khiển đặt (%)": ["Demand setpoint (%)", "要求値設定（%）"],
  "Biến tần LS H100": ["LS H100 inverter", "LS H100 インバータ"],
  "Bộ điều khiển công suất SCR Hanyoung TPR-3SL": ["Hanyoung TPR-3SL SCR power controller", "Hanyoung TPR-3SL SCR 電力調整器"],
  "Điện trở sấy 3 pha": ["Three-phase resistive heater", "三相抵抗ヒーター"],
  "Mức yêu cầu SCR (%)": ["SCR demand (%)", "SCR 要求値（%）"],
  "Mức cho phép SCR (%)": ["Enabled SCR demand (%)", "SCR 有効要求値（%）"],
  "Có nguồn điều khiển": ["Control power available", "制御電源あり"],
  "Đầu vào P5": ["P5 input", "P5 入力"],
  "Tần số đầu ra (Hz)": ["Output frequency (Hz)", "出力周波数（Hz）"],
  "Tốc độ đồng bộ ước tính (rpm)": ["Estimated synchronous speed (rpm)", "推定同期速度（rpm）"],
  "Đang gia nhiệt": ["Heating", "加熱中"],
  "Số cực động cơ phải là số nguyên dương chẵn.": ["Motor pole count must be a positive even integer.", "電動機の極数は正の偶数で指定してください。"],
  "Chưa có lệnh chạy: tiếp điểm khô P1–CM đang hở.": ["No run command: the P1–CM dry contact is open.", "運転指令なし。P1–CM の無電圧接点が開いています。"],
  "Tần số đặt đang bằng 0 Hz.": ["The frequency setpoint is 0 Hz.", "設定周波数は 0 Hz です。"],
  "SCR thiếu nguồn điều khiển AC tại chân 3–4.": ["The SCR has no AC control supply at terminals 3–4.", "SCR の端子 3–4 に交流制御電源がありません。"],
  "SCR đang báo lỗi qua tiếp điểm 8–9.": ["The SCR is signaling a fault via contact 8–9.", "SCR の接点 8–9 が異常を通知しています。"],
  "SCR thiếu nguồn động lực ba pha.": ["The SCR lacks three-phase power.", "SCR の三相主電源がありません。"],
  "Chưa có lệnh chạy: tiếp điểm 4–6 đang hở.": ["No run command: contact 4–6 is open.", "運転指令なし。接点 4–6 が開いています。"],
  "Mức yêu cầu SCR đang bằng 0%.": ["SCR demand is 0%.", "SCR 要求値は 0% です。"],
  "SCR đang đóng đường cấp cho bộ sấy · Mức yêu cầu {0}%.": ["SCR is enabling heater power · Demand {0}%.", "SCR がヒーターへの給電を許可しています · 要求値 {0}%。"],
  "Mô hình SCR và bộ sấy chưa tính dòng tải.": ["The SCR and heater model does not calculate load current.", "SCR とヒーターのモデルでは負荷電流を計算しません。"],
  "Mô hình SCR chưa tính điện áp hiệu dụng ở mức điều khiển một phần.": ["The SCR model does not calculate RMS voltage at partial demand.", "SCR モデルでは部分出力時の実効電圧を計算しません。"],
  "Dự án đang mở": ["Open projects", "開いているプロジェクト"],
  "{0} · Có thay đổi chưa lưu": ["{0} · Unsaved changes", "{0} · 未保存の変更あり"],
  "Đóng dự án “{0}”": ["Close project “{0}”", "プロジェクト「{0}」を閉じる"],
  "Đóng dự án": ["Close project", "プロジェクトを閉じる"],
  "Lưu thay đổi trong “{0}” trước khi đóng?": ["Save changes to “{0}” before closing?", "「{0}」を閉じる前に変更を保存しますか？"],
  "Bỏ thay đổi": ["Discard changes", "変更を破棄"],
  "Có bản tự lưu của {0} dự án. Sau khi khôi phục, chọn nơi lưu cho từng dự án.": ["Autosaves are available for {0} projects. Choose a save location for each project after recovery.", "{0}件のプロジェクトの自動保存があります。復元後、プロジェクトごとに保存先を選択してください。"],
  "Sao chép phần tử (Ctrl+C)": ["Copy elements (Ctrl+C)", "要素をコピー（Ctrl+C）"],
  "Dán phần tử (Ctrl+V)": ["Paste elements (Ctrl+V)", "要素を貼り付け（Ctrl+V）"],
  "Đã sao chép {0} thiết bị · {1} dây.": ["Copied {0} devices · {1} wires.", "機器{0}個・配線{1}本をコピーしました。"],
  "Đã dán {0} thiết bị · {1} dây.": ["Pasted {0} devices · {1} wires.", "機器{0}個・配線{1}本を貼り付けました。"],
  "Đã bỏ {0} liên kết đến thiết bị ngoài vùng sao chép.": ["Removed {0} links to devices outside the selection.", "選択範囲外の機器へのリンクを{0}件解除しました。"],
  "Trùng tag thiết bị": ["Duplicate device tags", "機器タグの重複"],
  "Các tag dưới đây trùng trong dự án đích hoặc trong nhóm được sao chép.": ["These tags are already in use in the destination project or within the copied selection.", "次のタグは貼り付け先のプロジェクトまたはコピーした範囲内で重複しています。"],
  "Đổi tag và dán": ["Rename and paste", "名前を変更して貼り付け"],
  "Mẫu theo thiết bị và hồ sơ": ["Device and project examples", "機器・プロジェクトのサンプル"],
  "Động cơ 3 pha 6 đầu dây": ["Six-terminal three-phase motor", "六端子三相電動機"],
  "Mạch cuộn dây đang hở hoặc đấu sao–tam giác chưa đúng.": ["The windings are open or the star–delta connection is incorrect.", "巻線が開放されているか、スター・デルタ結線が正しくありません。"],
  "Đủ ba pha · Cuộn dây đang đấu sao (Y).": ["All three phases present · Windings connected in star (Y).", "三相電源あり · 巻線はスター結線（Y）です。"],
  "Đủ ba pha · Cuộn dây đang đấu tam giác (Δ).": ["All three phases present · Windings connected in delta (Δ).", "三相電源あり · 巻線はデルタ結線（Δ）です。"],
  "Đấu sao (Y)": ["Star (Y)", "スター（Y）"],
  "Đấu tam giác (Δ)": ["Delta (Δ)", "デルタ（Δ）"],
  "Mô hình sao–tam giác chưa tính dòng cuộn dây.": ["The star–delta model does not calculate winding current.", "スター・デルタモデルでは巻線電流を計算できません。"],
  "Dự án mới": [
    "New project",
    "新規プロジェクト"
  ],
  "Tạm dừng mô phỏng trước khi thay đổi sơ đồ.": [
    "Pause the simulation before editing the circuit.",
    "回路を編集する前にシミュレーションを一時停止してください。"
  ],
  "Đã hoàn tác.": [
    "Undone.",
    "元に戻しました。"
  ],
  "Đã làm lại.": [
    "Redone.",
    "やり直しました。"
  ],
  "Tự lưu gặp lỗi. {0}": [
    "Autosave failed. {0}",
    "自動保存に失敗しました。{0}"
  ],
  "Có bản tự lưu của “{0}”. Sau khi khôi phục, chọn nơi lưu khi bấm Lưu.": [
    "An autosave of “{0}” is available. After recovery, choose a location when saving.",
    "「{0}」の自動保存があります。復元後、保存先を選択してください。"
  ],
  "Không đọc được bản tự lưu. {0}": [
    "Could not read the autosave. {0}",
    "自動保存を読み込めません。{0}"
  ],
  "Dự án có thay đổi chưa lưu. Bỏ các thay đổi này?": [
    "The project has unsaved changes. Discard them?",
    "未保存の変更があります。破棄しますか？"
  ],
  "Mở mạch mẫu từ cửa sổ ứng dụng Windows.": [
    "Open example circuits in the Windows application.",
    "Windowsアプリからサンプル回路を開いてください。"
  ],
  "Một phần hồ sơ còn chờ xác minh. Xem thông tin ở bảng Thuộc tính.": [
    "Some documentation is awaiting verification. See Properties for details.",
    "資料の一部は確認待ちです。プロパティを参照してください。"
  ],
  "Đã mở mạch mẫu “{0}”.": [
    "Opened example “{0}”.",
    "サンプル「{0}」を開きました。"
  ],
  "Đã mở “{0}”.": [
    "Opened “{0}”.",
    "「{0}」を開きました。"
  ],
  "Đã lưu “{0}”.": [
    "Saved “{0}”.",
    "「{0}」を保存しました。"
  ],
  "Đã thêm {0} · {1}.": [
    "Added {0} · {1}.",
    "{0} · {1}を追加しました。"
  ],
  "Dây quá ngắn để chèn nút nối. Dời thiết bị hoặc chỉnh đường dây rồi thử lại.": [
    "The wire is too short for a junction. Move the device or adjust the route and try again.",
    "接続点を挿入するには配線が短すぎます。機器の位置または配線経路を調整してください。"
  ],
  "Đã chèn nút nối. Chọn tâm nút để nối thêm nhánh. Shift+bấm để chọn nút.": [
    "Junction inserted. Select its center to add a branch. Shift+click to select it.",
    "接続点を挿入しました。中心を選んで分岐を追加できます。Shift＋クリックで選択します。"
  ],
  "Đã nhân bản {0} thiết bị cùng dây nối giữa chúng.": [
    "Duplicated {0} devices and their connecting wires.",
    "{0}個の機器と機器間の配線を複製しました。"
  ],
  "Đã xóa phần tử đã chọn.": [
    "Deleted the selected elements.",
    "選択した要素を削除しました。"
  ],
  "Thêm {0}": [
    "Add {0}",
    "{0}を追加"
  ],
  "Không tìm thấy thiết bị.": [
    "No devices found.",
    "機器が見つかりません。"
  ],
  "{0} thiết bị · {1} dây": [
    "{0} devices · {1} wires",
    "機器 {0}個 · 配線 {1}本"
  ],
  "Chạy mô phỏng để ghi đầu vào và thay đổi trạng thái theo thời gian.": [
    "Run the simulation to record inputs and state changes over time.",
    "シミュレーションを実行すると入力と状態変化を記録します。"
  ],
  "Giá trị thiết bị chưa hợp lệ.": [
    "Invalid device value.",
    "機器の値が無効です。"
  ],
  "Mô tả tiếp điểm": [
    "Contact description",
    "接点の説明"
  ],
  "Đèn nhấp nháy": [
    "Flashing lamp",
    "ランプ点滅"
  ],
  "Màu đèn khi sáng": [
    "Illuminated color",
    "点灯色"
  ],
  "Miền nguồn": [
    "Supply domain",
    "電源ドメイン"
  ],
  "Miền nguồn AC vào": [
    "AC input domain",
    "AC入力ドメイン"
  ],
  "Thời gian trễ (ms)": [
    "Delay (ms)",
    "遅延時間（ms）"
  ],
  "Tiếp điểm thường đóng (NC)": [
    "Normally closed (NC)",
    "常閉接点（NC）"
  ],
  "Thiết bị chủ": [
    "Parent device",
    "親機器"
  ],
  "Trạng thái của thiết bị chủ": [
    "Parent device state",
    "親機器の状態"
  ],
  "Trạng thái ban đầu": [
    "Initial state",
    "初期状態"
  ],
  "Thiết bị phát lệnh chạy": [
    "Run command device",
    "運転指令機器"
  ],
  "Thiết bị phản hồi chạy": [
    "Run feedback device",
    "運転フィードバック機器"
  ],
  "Ghi chú": [
    "Notes",
    "備考"
  ],
  "Hướng ký hiệu": [
    "Symbol orientation",
    "記号の向き"
  ],
  "Ký hiệu trong đèn": [
    "Lamp marking",
    "ランプ内の記号"
  ],
  "Tác động": [
    "Active",
    "動作"
  ],
  "Đóng": [
    "Closed",
    "閉"
  ],
  "Cuộn có điện": [
    "Coil energized",
    "コイル通電"
  ],
  "Dọc": [
    "Vertical",
    "縦"
  ],
  "NO mở, NC đóng": [
    "NO open, NC closed",
    "NO開・NC閉"
  ],
  "NO đóng, NC mở": [
    "NO closed, NC open",
    "NO閉・NC開"
  ],
  "Dòng làm việc mô phỏng (A)": [
    "Simulated operating current (A)",
    "模擬運転電流（A）"
  ],
  "Theo dữ liệu tải": [
    "From load data",
    "負荷データを入力"
  ],
  "Dòng khi được cấp điện. Với động cơ ba pha, nhập dòng dây mỗi pha.": [
    "Current when energized. For a three-phase motor, enter the current per phase.",
    "通電時の電流です。三相電動機は各相の線電流を入力してください。"
  ],
  "Chưa liên kết": [
    "Unassigned",
    "未割当"
  ],
  "{0} · thiếu thiết bị": [
    "{0} · missing device",
    "{0} · 機器なし"
  ],
  "Vị trí trước khi mô phỏng": [
    "Position before simulation",
    "シミュレーション開始時の位置"
  ],
  "Cắt": [
    "Open supply",
    "電源を切る"
  ],
  "Đang nhấn": [
    "Pressed",
    "押下中"
  ],
  "Nhấn giữ": [
    "Press and hold",
    "長押し"
  ],
  "Tắt tín hiệu": [
    "Deactivate signal",
    "信号をOFF"
  ],
  "Bật tín hiệu": [
    "Activate signal",
    "信号をON"
  ],
  "Đế cắm": [
    "Socket",
    "ソケット"
  ],
  "Cuộn 220 VAC": [
    "220 VAC coil",
    "AC220 Vコイル"
  ],
  "Cực {0}": [
    "Pole {0}",
    "極 {0}"
  ],
  "Xung điều khiển": [
    "Control pulse",
    "制御パルス"
  ],
  "Chân vật lý theo Omron": [
    "Physical terminals per Omron",
    "オムロン資料の実端子"
  ],
  "Cuộn trên sơ đồ ghi {0}. Trên đế {1}, cuộn ở chân {2}.": [
    "The schematic shows coil terminals {0}. On socket {1}, the coil uses {2}.",
    "図面のコイル端子は{0}です。ソケット{1}のコイル端子は{2}です。"
  ],
  "Tag thiết bị": [
    "Device tag",
    "機器タグ"
  ],
  "Tag thiết bị cần có ít nhất một ký tự.": [
    "A device tag must contain at least one character.",
    "機器タグを1文字以上入力してください。"
  ],
  "Tag lấy từ thiết bị chủ": [
    "Tag follows the parent device",
    "タグは親機器に連動します"
  ],
  "{0} dây": [
    "{0} wires",
    "配線 {0}本"
  ],
  "Chưa nối": [
    "Unconnected",
    "未接続"
  ],
  "Chân trên sơ đồ": [
    "Schematic terminals",
    "図面上の端子"
  ],
  "Chân đấu": [
    "Terminals",
    "端子"
  ],
  "Liên kết": [
    "Links",
    "関連付け"
  ],
  "Đầu vào mô phỏng": [
    "Simulation inputs",
    "シミュレーション入力"
  ],
  "Vị trí tiếp điểm": [
    "Contact position",
    "接点位置"
  ],
  "Mốc timer": [
    "Timer transition",
    "タイマ切替時刻"
  ],
  "Trạng thái mô phỏng": [
    "Simulation state",
    "シミュレーション状態"
  ],
  "Truy vết điều kiện": [
    "Condition trace",
    "動作条件の追跡"
  ],
  "Định tuyến lại": [
    "Reroute",
    "再配線"
  ],
  "Chèn nút nối vào dây": [
    "Insert junction on wire",
    "配線に接続点を挿入"
  ],
  "Dây nối": [
    "Wire",
    "配線"
  ],
  "Nhãn dây": [
    "Wire label",
    "線番"
  ],
  "Hai đầu dây": [
    "Wire endpoints",
    "配線の両端"
  ],
  "Đường đi": [
    "Route",
    "配線経路"
  ],
  "Dây giao cắt chỉ liên thông khi cùng nối vào một chân hoặc nút nối.": [
    "Crossing wires connect only through a shared terminal or junction.",
    "交差する配線は、共通端子または接続点がある場合に導通します。"
  ],
  "Chọn thiết bị hoặc dây": [
    "Select a device or wire",
    "機器または配線を選択"
  ],
  "Xem chân đấu, sửa tag và kiểm tra trạng thái của phần tử đang chọn.": [
    "View terminals, edit tags and inspect the selected element's state.",
    "選択した要素の端子、タグ、状態を確認できます。"
  ],
  "Hồ sơ còn phần chưa xác minh": [
    "Some documentation remains unverified",
    "資料の一部が未確認です"
  ],
  "Một số tín hiệu và trình tự cần xác nhận.": [
    "Some signals and sequences need confirmation.",
    "一部の信号と動作順序は確認が必要です。"
  ],
  "Hồ sơ tham chiếu": [
    "Reference documentation",
    "参照資料"
  ],
  "Nội dung cần xác nhận": [
    "Items requiring confirmation",
    "要確認事項"
  ],
  "{0} phần tử đã chọn": [
    "{0} elements selected",
    "{0}個の要素を選択中"
  ],
  "Nhân bản thiết bị": [
    "Duplicate devices",
    "機器を複製"
  ],
  "Sơ đồ": [
    "Schematic",
    "回路図"
  ],
  "Chưa ghi nhận lỗi hoặc cảnh báo mô hình.": [
    "No model errors or warnings recorded.",
    "モデルのエラーや警告はありません。"
  ],
  "Cảnh báo hiện ở đây khi mô hình có chân chưa nối, liên kết thiếu hoặc xung đột nguồn.": [
    "Warnings appear here for unconnected terminals, missing links or supply conflicts.",
    "未接続端子、関連付けの不足、電源の競合をここに表示します。"
  ],
  "Lỗi mô hình": [
    "Model error",
    "モデルエラー"
  ],
  "Cảnh báo": [
    "Warnings",
    "警告"
  ],
  "Loại": [
    "Type",
    "種類"
  ],
  "Vị trí": [
    "Location",
    "位置"
  ],
  "Chi tiết": [
    "Details",
    "詳細"
  ],
  "Chưa có sự kiện trong phiên mô phỏng hiện tại.": [
    "No events in the current simulation session.",
    "現在のシミュレーションにイベントはありません。"
  ],
  "Đang hiển thị 250 trong {0} sự kiện gần nhất.": [
    "Showing the latest 250 of {0} events.",
    "{0}件中、最新の250件を表示しています。"
  ],
  "Thời điểm": [
    "Time",
    "時刻"
  ],
  "Sự kiện": [
    "Event",
    "イベント"
  ],
  "Lý do": [
    "Reason",
    "理由"
  ],
  "Đang chỉnh sửa": [
    "Editing",
    "編集中"
  ],
  "Đang chạy": [
    "Running",
    "実行中"
  ],
  "Tạm dừng": [
    "Paused",
    "一時停止"
  ],
  "Dừng chẩn đoán": [
    "Diagnostic stop",
    "診断停止"
  ],
  "Mô phỏng đã dừng để chẩn đoán. Xem Cảnh báo rồi đặt lại hoặc chỉnh sơ đồ.": [
    "Simulation stopped for diagnosis. See Warnings, then reset or edit the circuit.",
    "診断のため停止しました。警告を確認し、リセットまたは回路を編集してください。"
  ],
  "Mô phỏng gặp lỗi. {0}": [
    "Simulation error. {0}",
    "シミュレーションエラー。{0}"
  ],
  "Đã đặt thời gian và đầu vào mô phỏng về trạng thái đầu.": [
    "Simulation time and inputs reset to their initial states.",
    "時刻と入力を初期状態に戻しました。"
  ],
  "Đã chạy {0} ca với thời gian mô phỏng độc lập.": [
    "Ran {0} tests with independent simulation clocks.",
    "独立したシミュレーション時計で{0}件のテストを実行しました。"
  ],
  "Mở bảng dưới": [
    "Expand bottom panel",
    "下部パネルを展開"
  ],
  "Thu gọn bảng dưới": [
    "Collapse bottom panel",
    "下部パネルを折りたたむ"
  ],
  "Chọn một chân hoặc một đoạn dây. Bấm khoảng trống để đặt điểm gấp.": [
    "Select a terminal or wire segment. Click empty space to add a bend.",
    "端子または配線を選択してください。空白をクリックすると曲がり点を追加します。"
  ],
  "Vôn kế": [
    "Voltmeter",
    "電圧計"
  ],
  "Ampe kế": [
    "Ammeter",
    "電流計"
  ],
  "Bấm một dây hoặc chân cho que (+), sau đó chọn điểm tham chiếu (−).": [
    "Click a wire or terminal for the (+) probe, then select the (−) reference.",
    "配線または端子で（＋）を選び、次に基準点（−）を選択してください。"
  ],
  "Bấm một đoạn dây hoặc chân để đo dòng nhánh.": [
    "Click a wire segment or terminal to measure branch current.",
    "配線または端子をクリックして分岐電流を測定します。"
  ],
  "Que (+) tại {0}. Chọn điểm (−) để đo điện áp.": [
    "(+) probe at {0}. Select a (−) point to measure voltage.",
    "（＋）は{0}です。電圧を測定する基準点（−）を選択してください。"
  ],
  "So với {0}. Bấm điểm (−) để đổi tham chiếu. ": [
    "Relative to {0}. Click a (−) point to change reference. ",
    "基準点は{0}です。（−）をクリックして変更できます。 "
  ],
  " Đang đo trạng thái ban đầu.": [
    " Measuring the initial state.",
    " 初期状態を測定中です。"
  ],
  "Chưa phát được âm thanh. Bấm nút loa để bật lại âm thanh còi.": [
    "Audio could not start. Click the speaker button to enable the buzzer again.",
    "音声を開始できません。スピーカーボタンでブザー音を有効にしてください。"
  ],
  "Đã xuất {0} · {1}": [
    "Exported {0} · {1}",
    "{0}を出力しました · {1}"
  ],
  "Tắt âm thanh còi": [
    "Mute buzzer",
    "ブザーを消音"
  ],
  "Bật âm thanh còi": [
    "Enable buzzer sound",
    "ブザー音を有効にする"
  ],
  "Đã tạo dự án mới.": [
    "Created a new project.",
    "新規プロジェクトを作成しました。"
  ],
  "Đã khôi phục bản tự lưu.": [
    "Recovered the autosave.",
    "自動保存を復元しました。"
  ],
  "Lệnh hình học SVG không hợp lệ.": [
    "Invalid SVG geometry command.",
    "SVGの図形命令が無効です。"
  ],
  "Tọa độ SVG không hợp lệ.": [
    "Invalid SVG coordinates.",
    "SVGの座標が無効です。"
  ],
  "Sơ đồ chưa có phần tử để xuất.": [
    "The schematic has no elements to export.",
    "出力する回路要素がありません。"
  ],
  "Định dạng xuất chưa được hỗ trợ.": [
    "Export format is unsupported.",
    "未対応の出力形式です。"
  ],
  "Hãy mở bản Windows để xuất bản vẽ.": [
    "Open the Windows application to export drawings.",
    "図面を出力するにはWindowsアプリを開いてください。"
  ],
  "Đang xuất bản vẽ. Hãy chờ tệp hiện tại hoàn tất.": [
    "An export is in progress. Wait for the current file to finish.",
    "出力中です。現在のファイルの完了をお待ちください。"
  ],
  "Áp suất (bar)": [
    "Pressure (bar)",
    "圧力（bar）"
  ],
  "Dòng vòng (mA)": [
    "Loop current (mA)",
    "ループ電流（mA）"
  ],
  "Nhiệt độ (°C)": [
    "Temperature (°C)",
    "温度（℃）"
  ],
  "Điện trở Pt100 (Ω)": [
    "Pt100 resistance (Ω)",
    "Pt100抵抗値（Ω）"
  ],
  "Giá trị đo PV": [
    "Measured value PV",
    "測定値PV"
  ],
  "Lỗi ngõ vào S.Err": [
    "Input error S.Err",
    "入力エラー S.Err"
  ],
  "Báo mức cao": [
    "High-level alarm",
    "上限警報"
  ],
  "Báo mức thấp": [
    "Low-level alarm",
    "下限警報"
  ],
  "Mức trong bể ảo (%)": [
    "Virtual tank level (%)",
    "仮想タンク水位（%）"
  ],
  "Đầu nguồn đang dùng": [
    "Active supply tap",
    "使用中の電源タップ"
  ],
  "Ngõ ra kênh 1": [
    "Channel 1 output",
    "チャンネル1出力"
  ],
  "Ngõ ra kênh 2": [
    "Channel 2 output",
    "チャンネル2出力"
  ],
  "Đồng hồ tuần": [
    "Weekly clock",
    "週間時計"
  ],
  "Nhóm lịch đang dùng": [
    "Active schedule bank",
    "使用中のプログラム群"
  ],
  "Chế độ kênh 1": [
    "Channel 1 mode",
    "チャンネル1モード"
  ],
  "Chế độ kênh 2": [
    "Channel 2 mode",
    "チャンネル2モード"
  ],
  "Áp suất ban đầu (bar)": [
    "Initial pressure (bar)",
    "初期圧力（bar）"
  ],
  "Nhiệt độ ban đầu (°C)": [
    "Initial temperature (°C)",
    "初期温度（℃）"
  ],
  "Loại đầu vào": [
    "Input type",
    "入力種別"
  ],
  "Giá trị tại 4 mA": [
    "Value at 4 mA",
    "4 mA時の値"
  ],
  "Giá trị tại 20 mA": [
    "Value at 20 mA",
    "20 mA時の値"
  ],
  "Chiều tác động OUT1": [
    "OUT1 control direction",
    "OUT1の制御方向"
  ],
  "Giá trị đặt SP": [
    "Setpoint SP",
    "設定値SP"
  ],
  "Độ trễ ON/OFF": [
    "ON/OFF hysteresis",
    "ON/OFFヒステリシス"
  ],
  "Ngưỡng báo cao AUX1": [
    "AUX1 high alarm threshold",
    "AUX1上限警報設定値"
  ],
  "Ngưỡng báo thấp AUX2": [
    "AUX2 low alarm threshold",
    "AUX2下限警報設定値"
  ],
  "Ngày bắt đầu mô phỏng": [
    "Simulation start day",
    "シミュレーション開始曜日"
  ],
  "Giờ bắt đầu mô phỏng": [
    "Simulation start time",
    "シミュレーション開始時刻"
  ],
  "Nguồn tín hiệu mức": [
    "Level signal source",
    "水位信号源"
  ],
  "Mức ban đầu trong bể ảo (%)": [
    "Initial virtual tank level (%)",
    "仮想タンクの初期水位（%）"
  ],
  "Dòng 4–20 mA": [
    "4–20 mA current",
    "4–20 mA電流"
  ],
  "Pt100 ba dây": [
    "Three-wire Pt100",
    "3線式Pt100"
  ],
  "Thuận · tác động khi PV cao": [
    "Direct · active at high PV",
    "正動作 · PV上昇時にON"
  ],
  "Nghịch · tác động khi PV thấp": [
    "Reverse · active at low PV",
    "逆動作 · PV低下時にON"
  ],
  "Bể ảo theo phần trăm": [
    "Virtual tank percentage",
    "仮想タンクの水位（%）"
  ],
  "Đấu điện cực ngoài trên sơ đồ": [
    "External electrode wiring",
    "外部電極配線"
  ],
  "Vòng hai dây 9–30 VDC. Nối DC+ vào Loop +, Loop − tới 22 của E5EC, rồi nối 23 về DC−. Tín hiệu tăng từ 4 mA ở 0 bar tới 20 mA ở 10 bar.": [
    "9–30 VDC two-wire loop. Wire DC+ to Loop +, Loop − to E5EC 22, and 23 to DC−. Output rises from 4 mA at 0 bar to 20 mA at 10 bar.",
    "DC9–30 Vの2線式ループです。DC+をLoop +、Loop −をE5ECの22、23をDC−に接続します。0 barで4 mA、10 barで20 mAとなります。"
  ],
  "Đầu dò Pt100 ba dây, Ø6 × 130 mm, IP68. Nối A vào 22, B và B′ vào 23 và 24 của E5EC. Chọn đầu vào Pt100 trên bộ điều khiển.": [
    "Three-wire Pt100 probe, Ø6 × 130 mm, IP68. Wire A to 22, B and B′ to E5EC 23 and 24. Select the controller's Pt100 input.",
    "3線式Pt100、Ø6 × 130 mm、IP68です。Aを22、BとB′をE5ECの23と24に接続し、入力種別をPt100に設定します。"
  ],
  "Nguồn AC100–240 tại 1–2. OUT1 đóng 3–4 theo SP và độ trễ. AUX1 đóng 11–12 khi PV đạt ngưỡng cao. AUX2 đóng 9–10 khi PV xuống ngưỡng thấp. S.Err mở cả ba ngõ ra.": [
    "AC100–240 supply at 1–2. OUT1 closes 3–4 by SP and hysteresis. AUX1 closes 11–12 at the high limit; AUX2 closes 9–10 at the low limit. S.Err opens all three outputs.",
    "1–2にAC100–240 Vを供給します。OUT1はSPとヒステリシスにより3–4を閉じます。AUX1は上限で11–12、AUX2は下限で9–10を閉じます。S.Err時は3出力とも開きます。"
  ],
  "Cấp AC100–240 vào 4–5. Hai tiếp điểm NO ở 2–3 và 8–9. Chân 6–7 chọn nhóm lịch B khi nối kín bằng tiếp điểm khô. Đồng hồ chạy theo thời gian mô phỏng.": [
    "Supply AC100–240 at 4–5. NO contacts are 2–3 and 8–9. A dry contact across 6–7 selects bank B. The clock follows simulation time.",
    "4–5にAC100–240 Vを供給します。NO接点は2–3と8–9です。6–7を無電圧接点で閉じるとプログラム群Bになります。時計はシミュレーション時刻に従います。"
  ],
  "S0–S1 dùng AC110, S0–S2 dùng AC220. E3 là điện cực chung. E1 tác động relay, E2 duy trì, E4 báo tràn. Bể ảo đặt E2 ở 25%, E1 ở 65%, E4 ở 90%. Tc1–Ta1 để xả, Tc1–Tb1 để cấp. Báo tràn ở Tc2–Ta2.": [
    "Use S0–S1 for AC110 or S0–S2 for AC220. E3 is common. E1 operates the relay, E2 holds it, E4 alarms on overflow. Virtual electrodes are E2 25%, E1 65%, E4 90%. Use Tc1–Ta1 to drain, Tc1–Tb1 to fill; overflow is Tc2–Ta2.",
    "AC110 VはS0–S1、AC220 VはS0–S2に接続します。共通電極はE3です。E1で動作、E2で保持、E4で満水警報となります。仮想電極はE2 25%、E1 65%、E4 90%です。排水はTc1–Ta1、給水はTc1–Tb1、満水警報はTc2–Ta2を使います。"
  ],
  "S0–S1 dùng AC110, S0–S2 dùng AC220. E5 là điện cực chung. Bể ảo đặt E4 ở 10% (báo cạn), E3 ở 25%, E2 ở 65%, E1 ở 90% (báo tràn). Tc–Ta để xả, Tc–Tb để cấp. Lc–LH/LL cho đèn báo, B1–B2 cho còi chung.": [
    "Use S0–S1 for AC110 or S0–S2 for AC220. E5 is common. Virtual electrodes are E4 10% (low), E3 25%, E2 65%, E1 90% (high). Use Tc–Ta to drain, Tc–Tb to fill, Lc–LH/LL for lamps and B1–B2 for the common buzzer.",
    "AC110 VはS0–S1、AC220 VはS0–S2に接続します。共通電極はE5です。仮想電極はE4 10%（渇水）、E3 25%、E2 65%、E1 90%（満水）です。排水はTc–Ta、給水はTc–Tb、表示灯はLc–LH/LL、共通ブザーはB1–B2を使います。"
  ],
  "Sơ cấp L–N, thứ cấp cách ly X1–X2. Chọn điện áp bằng tên miền, ví dụ AC220 và AC110. Tải thứ cấp cần dùng cả hai đầu của cùng một cuộn.": [
    "Primary L–N, isolated secondary X1–X2. Set voltage domains such as AC220 and AC110. Connect both ends of the same secondary winding to the load.",
    "一次側はL–N、絶縁二次側はX1–X2です。AC220、AC110などの電圧ドメインを設定し、負荷は同一二次巻線の両端に接続してください。"
  ],
  "Khoảng ON/OFF": [
    "ON/OFF interval",
    "ON/OFF時間帯"
  ],
  "Chu kỳ": [
    "Cyclic",
    "サイクル"
  ],
  "Kênh": [
    "Channel",
    "チャンネル"
  ],
  "Nhóm lịch": [
    "Schedule bank",
    "プログラム群"
  ],
  "Kiểu chương trình": [
    "Program type",
    "プログラム種別"
  ],
  "Ngày chạy": [
    "Days of operation",
    "動作曜日"
  ],
  "Giờ bắt đầu": [
    "Start time",
    "開始時刻"
  ],
  "Giờ kết thúc": [
    "End time",
    "終了時刻"
  ],
  "Độ rộng xung (giây)": [
    "Pulse width (seconds)",
    "パルス幅（秒）"
  ],
  "Thời gian ON (phút)": [
    "ON time (minutes)",
    "ON時間（分）"
  ],
  "Thời gian OFF (phút)": [
    "OFF time (minutes)",
    "OFF時間（分）"
  ],
  "Lưu chương trình": [
    "Save program",
    "プログラムを保存"
  ],
  "Hủy chỉnh lịch": [
    "Cancel schedule editing",
    "編集をキャンセル"
  ],
  "Đấu nối và vận hành": [
    "Wiring and operation",
    "配線と操作"
  ],
  "Tạo lại lịch trống": [
    "Reset to empty schedule",
    "空のプログラムに戻す"
  ],
  "Sửa": [
    "Edit",
    "編集"
  ],
  "Xóa": [
    "Delete",
    "削除"
  ],
  "Thêm chương trình tuần": [
    "Add weekly program",
    "週間プログラムを追加"
  ],
  "Lịch tuần": [
    "Weekly schedule",
    "週間プログラム"
  ],
  "CH1 dùng {0}/40 bước · CH2 dùng {1}/40 bước": [
    "CH1 uses {0}/40 steps · CH2 uses {1}/40 steps",
    "CH1 {0}/40ステップ · CH2 {1}/40ステップ"
  ],
  "Tín hiệu": [
    "Signals",
    "信号"
  ],
  "Điều khiển": [
    "Control",
    "制御"
  ],
  "Bộ điều khiển mức nước Omron 61F-{0} AC110/220": [
    "Omron 61F-{0} AC110/220 level controller",
    "オムロン61F-{0} AC110/220水位制御器"
  ],
  "Cảm biến áp suất nước Sensys M5256-C3079E-010BG": [
    "Sensys M5256-C3079E-010BG water pressure sensor",
    "Sensys M5256-C3079E-010BG水圧センサ"
  ],
  "Áp suất nước (bar)": [
    "Water pressure (bar)",
    "水圧（bar）"
  ],
  "Cảm biến nhiệt độ Evikon ET201-D6L130-Pt100-S5-IP68": [
    "Evikon ET201-D6L130-Pt100-S5-IP68 temperature sensor",
    "Evikon ET201-D6L130-Pt100-S5-IP68温度センサ"
  ],
  "Nhiệt độ nước (°C)": [
    "Water temperature (°C)",
    "水温（℃）"
  ],
  "Bộ điều khiển ngõ ra relay Omron E5EC-RX2ASM-800": [
    "Omron E5EC-RX2ASM-800 relay output controller",
    "オムロンE5EC-RX2ASM-800リレー出力調節器"
  ],
  "Timer tuần 2 kênh Omron H5S-WFB2 · 40 bước/kênh": [
    "Omron H5S-WFB2 weekly timer · 2 channels · 40 steps/channel",
    "オムロンH5S-WFB2週間タイマ · 2回路 · 40ステップ/回路"
  ],
  "Chọn chế độ kênh 1": [
    "Select channel 1 mode",
    "チャンネル1モードを選択"
  ],
  "Chọn chế độ kênh 2": [
    "Select channel 2 mode",
    "チャンネル2モードを選択"
  ],
  "Bộ nguồn cách ly AC → AC": [
    "AC → AC isolation transformer",
    "AC → AC絶縁変圧器"
  ],
  "Nguồn điện": [
    "Power supplies",
    "電源"
  ],
  "{0} phải từ {1} đến {2}.": [
    "{0} must be between {1} and {2}.",
    "{0}は{1}～{2}で指定してください。"
  ],
  "Ngày và giờ bắt đầu không hợp lệ.": [
    "Invalid start day or time.",
    "開始曜日または時刻が無効です。"
  ],
  "Nguồn tín hiệu mức chưa hợp lệ.": [
    "Invalid level signal source.",
    "水位信号源が無効です。"
  ],
  "Điện áp sơ cấp và thứ cấp cần có dạng AC220, AC110 hoặc AC24.": [
    "Primary and secondary domains must use formats such as AC220, AC110 or AC24.",
    "一次側と二次側はAC220、AC110、AC24などで指定してください。"
  ],
  "Chế độ điều khiển chưa hợp lệ.": [
    "Invalid control mode.",
    "制御モードが無効です。"
  ],
  "Kiểm tra thang đo, ngưỡng báo và độ trễ.": [
    "Check scaling, alarm limits and hysteresis.",
    "スケール、警報設定値、ヒステリシスを確認してください。"
  ],
  "Tín hiệu tác động": [
    "Active signal",
    "信号ON"
  ],
  "Bảo vệ": [
    "Protection",
    "保護"
  ],
  "Tiếp điểm": [
    "Contacts",
    "接点"
  ],
  "Tải": [
    "Loads",
    "負荷"
  ],
  "Đấu nối": [
    "Connections",
    "接続"
  ],
  "Nguồn điều khiển AC": [
    "AC control supply",
    "AC制御電源"
  ],
  "Nguồn điều khiển DC": [
    "DC control supply",
    "DC制御電源"
  ],
  "Nguồn động lực 3 pha": [
    "Three-phase power supply",
    "三相動力電源"
  ],
  "Bộ nguồn AC → DC": [
    "AC → DC power supply",
    "AC → DC電源"
  ],
  "CB một cực": [
    "Single-pole circuit breaker",
    "単極遮断器"
  ],
  "MCB một cực": [
    "Single-pole MCB",
    "単極MCB"
  ],
  "MCB hai cực": [
    "Two-pole MCB",
    "2極MCB"
  ],
  "MCCB một cực": [
    "Single-pole MCCB",
    "単極MCCB"
  ],
  "CB ba cực": [
    "Three-pole circuit breaker",
    "3極遮断器"
  ],
  "MCCB ba cực": [
    "Three-pole MCCB",
    "3極MCCB"
  ],
  "Cầu chì": [
    "Fuse",
    "ヒューズ"
  ],
  "Rơ-le nhiệt": [
    "Thermal overload relay",
    "サーマルリレー"
  ],
  "Nút nối": [
    "Junction",
    "接続点"
  ],
  "Nút nhấn NO": [
    "NO push button",
    "NO押しボタン"
  ],
  "Nút nhấn NC": [
    "NC push button",
    "NC押しボタン"
  ],
  "Công tắc AUTO / MAN / OFF": [
    "AUTO / MAN / OFF selector",
    "AUTO / MAN / OFF切替スイッチ"
  ],
  "Chế độ": [
    "Mode",
    "モード"
  ],
  "Cuộn relay": [
    "Relay coil",
    "リレーコイル"
  ],
  "Relay luân phiên": [
    "Alternating relay",
    "交互運転リレー"
  ],
  "Relay luân phiên Omron G4Q-212S AC220": [
    "Omron G4Q-212S AC220 alternating relay",
    "オムロンG4Q-212S AC220交互運転リレー"
  ],
  "Cuộn contactor": [
    "Contactor coil",
    "電磁接触器コイル"
  ],
  "Tiếp điểm phụ NO": [
    "NO auxiliary contact",
    "NO補助接点"
  ],
  "Tiếp điểm phụ NC": [
    "NC auxiliary contact",
    "NC補助接点"
  ],
  "Tiếp điểm chính NO": [
    "NO main contact",
    "NO主接点"
  ],
  "Tiếp điểm chính 3 pha": [
    "Three-phase main contacts",
    "三相主接点"
  ],
  "Đèn báo": [
    "Indicator lamp",
    "表示灯"
  ],
  "Còi báo": [
    "Buzzer",
    "ブザー"
  ],
  "Phao / tín hiệu mức": [
    "Float / level signal",
    "フロート・水位信号"
  ],
  "Tín hiệu khô ngoài tủ": [
    "External dry contact",
    "外部無電圧接点"
  ],
  "Bơm 3 pha": [
    "Three-phase pump",
    "三相ポンプ"
  ],
  "Quạt 3 pha": [
    "Three-phase fan",
    "三相ファン"
  ],
  "Động cơ 3 pha": [
    "Three-phase motor",
    "三相電動機"
  ],
  "Loại thiết bị chưa hỗ trợ: {0}": [
    "Unsupported device type — {0}",
    "未対応の機器種別 — {0}"
  ],
  "{0}: cần một đối tượng.": [
    "{0} requires an object.",
    "{0}にはオブジェクトが必要です。"
  ],
  "Ca kiểm thử {0}": [
    "Test case {0}",
    "テストケース {0}"
  ],
  "{0}: trạng thái đầu cần là một danh sách thao tác.": [
    "{0} requires an initial action list.",
    "{0}の初期状態には操作リストが必要です。"
  ],
  "{0}: thiếu danh sách bước.": [
    "{0} has no step list.",
    "{0}にステップリストがありません。"
  ],
  "{0}, bước {1}": [
    "{0}, step {1}",
    "{0}、ステップ{1}"
  ],
  "thao tác": [
    "actions",
    "操作"
  ],
  "kết quả dự kiến": [
    "expected results",
    "期待結果"
  ],
  "{0}: {1} cần là một danh sách.": [
    "{0} requires a list for {1}.",
    "{0}の{1}にはリストが必要です。"
  ],
  "Dự án": [
    "Project",
    "プロジェクト"
  ],
  "Phiên bản định dạng chưa hỗ trợ: {0}.": [
    "Unsupported format version — {0}.",
    "未対応の形式バージョン — {0}。"
  ],
  "không có": [
    "none",
    "なし"
  ],
  "Dự án cần danh sách thiết bị và dây.": [
    "The project needs device and wire lists.",
    "プロジェクトには機器と配線のリストが必要です。"
  ],
  "Thiết bị {0}": [
    "Device {0}",
    "機器 {0}"
  ],
  "Thiết bị {0} thiếu ID.": [
    "Device {0} is missing its ID.",
    "機器{0}のIDがありません。"
  ],
  "Dây {0}": [
    "Wire {0}",
    "配線 {0}"
  ],
  "Dây {0} thiếu ID.": [
    "Wire {0} is missing its ID.",
    "配線{0}のIDがありません。"
  ],
  "ID thiết bị bị trùng.": [
    "Duplicate device IDs.",
    "機器IDが重複しています。"
  ],
  "ID dây bị trùng.": [
    "Duplicate wire IDs.",
    "配線IDが重複しています。"
  ],
  "Ca kiểm thử cần là một danh sách.": [
    "Test cases must be a list.",
    "テストケースはリストで指定してください。"
  ],
  "Dây có đầu nối không tồn tại.": [
    "A wire endpoint does not exist.",
    "配線の接続先が存在しません。"
  ],
  "Dây lặp lại cùng cặp chân.": [
    "Duplicate wires connect the same terminal pair.",
    "同じ端子間の配線が重複しています。"
  ],
  "Dây nối hai miền nguồn khác nhau ({0} ↔ {1}).": [
    "Wire connects different supply domains ({0} ↔ {1}).",
    "配線が異なる電源ドメインを接続しています（{0} ↔ {1}）。"
  ],
  "Loại thiết bị chưa hỗ trợ.": [
    "Unsupported device type.",
    "未対応の機器種別です。"
  ],
  "Tag {0} trùng với thiết bị khác.": [
    "Tag {0} is used by another device.",
    "タグ{0}は別の機器で使用中です。"
  ],
  "Thiết bị chưa gắn tag.": [
    "Device tag is missing.",
    "機器タグがありません。"
  ],
  "{0} · Chân {1} chưa nối.": [
    "{0} · Terminal {1} is unconnected.",
    "{0} · 端子{1}が未接続です。"
  ],
  "{0} · Chưa gán thiết bị chủ hợp lệ.": [
    "{0} · Assign a valid parent device.",
    "{0} · 有効な親機器を割り当ててください。"
  ],
  "{0} · {1} không có trạng thái “{2}”.": [
    "{0} · {1} has no state “{2}”.",
    "{0} · {1}には状態「{2}」がありません。"
  ],
  "{0} · Chưa khai báo miền nguồn{1}.": [
    "{0} · Supply domain{1} is missing.",
    "{0} · 電源ドメイン{1}が未設定です。"
  ],
  " đầu vào": [
    " input",
    " 入力側"
  ],
  "{0} · Thời gian trễ phải là số hữu hạn và không âm.": [
    "{0} · Delay must be finite and non-negative.",
    "{0} · 遅延時間は有限の0以上の値にしてください。"
  ],
  "lệnh chạy": [
    "run command",
    "運転指令"
  ],
  "phản hồi chạy": [
    "run feedback",
    "運転フィードバック"
  ],
  "{0} · Liên kết {1} không hợp lệ.": [
    "{0} · Invalid {1} link.",
    "{0} · {1}の関連付けが無効です。"
  ],
  "Chưa khai báo dòng làm việc của {0} trong Thuộc tính.": [
    "Enter the operating current for {0} in Properties.",
    "プロパティで{0}の運転電流を入力してください。"
  ],
  "Mạch đang dừng do logic không hội tụ.": [
    "Circuit stopped because logic did not converge.",
    "論理が収束しないため回路が停止しています。"
  ],
  "Điểm đo chưa có trong sơ đồ.": [
    "The measurement point is missing from the schematic.",
    "測定点が回路図にありません。"
  ],
  "Điểm đo nằm trên mạng xung đột nguồn hoặc sai miền.": [
    "The point is on a network with supply conflicts or domain mismatch.",
    "測定点のネットワークに電源競合またはドメイン不一致があります。"
  ],
  "Hai que cùng nút điện.": [
    "Both probes are on the same electrical node.",
    "両プローブは同じ電気ノードにあります。"
  ],
  "Điểm đo chưa có điện thế tham chiếu trong mô hình.": [
    "The model has no reference potential for this point.",
    "この測定点の基準電位が未確定です。"
  ],
  "Hai nguồn độc lập, chưa xác định điện áp tương đối.": [
    "Independent sources have no defined relative voltage.",
    "独立電源間の相対電圧が未確定です。"
  ],
  "Hai điểm cùng điện thế tham chiếu.": [
    "Both points have the same reference potential.",
    "両点の基準電位は同じです。"
  ],
  "Miền nguồn chưa ghi trị số điện áp, ví dụ AC220, DC24 hoặc 3P380.": [
    "Specify a voltage in the supply domain, such as AC220, DC24 or 3P380.",
    "電源ドメインにAC220、DC24、3P380などの電圧を指定してください。"
  ],
  "Điện áp que (+) so với que (−).": [
    "Voltage of the (+) probe relative to (−).",
    "（−）を基準とした（＋）の電圧です。"
  ],
  "Điện áp hiệu dụng giữa hai pha.": [
    "RMS phase-to-phase voltage.",
    "相間電圧の実効値です。"
  ],
  "Điện áp hiệu dụng danh định.": [
    "Nominal RMS voltage.",
    "定格電圧の実効値です。"
  ],
  "Mô hình Pt100 chưa xác định dòng kích thích đo điện trở.": [
    "The Pt100 model has no defined resistance measurement excitation current.",
    "Pt100の抵抗測定用励起電流は未設定です。"
  ],
  "Chưa có mô hình dòng cho chân {0}/{1}.": [
    "No current model for terminal {0}/{1}.",
    "端子{0}/{1}の電流モデルがありません。"
  ],
  "Chưa xác định được dòng qua {0} trong cấu hình cấp điện này.": [
    "Current through {0} is undetermined in this supply configuration.",
    "この電源構成では{0}の電流を確定できません。"
  ],
  "Tải {0} thiếu pha hoặc sai miền. Chưa có mô hình dòng mất pha.": [
    "Load {0} has phase loss or a domain mismatch. Phase-loss current is not modeled.",
    "負荷{0}に欠相またはドメイン不一致があります。欠相時の電流は未設定です。"
  ],
  "Dòng nhánh mô phỏng. Với AC, các dòng tải trên cùng dây được cộng theo giả thiết cùng góc pha.": [
    "Simulated branch current. AC load currents on the same wire are summed assuming equal phase angles.",
    "模擬分岐電流です。ACでは同一配線の各負荷電流を同一位相と仮定して加算します。"
  ],
  "Dây dẫn lý tưởng có đường song song. Chưa biết trở kháng để chia dòng từng nhánh.": [
    "Parallel ideal conductors have no impedance data for dividing current between branches.",
    "理想配線の並列経路があります。分流の計算に必要なインピーダンスが未設定です。"
  ],
  "Nhánh có nhiều nguồn, chưa đủ dữ liệu chia dòng.": [
    "Multiple sources feed the branch; current sharing is undetermined.",
    "分岐に複数の電源があり、電流分担が未確定です。"
  ],
  "Mạng xung đột hoặc ngắn mạch. Chưa xác định được dòng sự cố.": [
    "Supply conflict or short circuit. Fault current is undetermined.",
    "電源競合または短絡です。故障電流は未確定です。"
  ],
  "Dây chưa nối đủ hai đầu.": [
    "Both wire ends must be connected.",
    "配線の両端を接続してください。"
  ],
  "Nút có nhiều nhánh. Bấm đoạn dây cần đo ngay bên cạnh nút.": [
    "The node has multiple branches. Click the wire segment beside it.",
    "ノードに複数の分岐があります。隣接する配線をクリックしてください。"
  ],
  "Nút có nhiều nguồn dòng.": [
    "The node has multiple current sources.",
    "ノードに複数の電流源があります。"
  ],
  "Tiếp điểm đóng": [
    "Contact closed",
    "接点閉"
  ],
  "Lệnh chạy": [
    "Run command",
    "運転指令"
  ],
  "Tải nhận 3 pha": [
    "Load receives three phases",
    "負荷に三相供給"
  ],
  "Phản hồi": [
    "Feedback",
    "フィードバック"
  ],
  "Đóng / bật": [
    "Closed / on",
    "閉・ON"
  ],
  "Đạt": [
    "Pass",
    "合格"
  ],
  "Không đạt": [
    "Fail",
    "不合格"
  ],
  "Chưa xác minh": [
    "Unverified",
    "未確認"
  ],
  "Nguồn / CB": [
    "Supply / circuit breaker",
    "電源・遮断器"
  ],
  "Nút nhấn": [
    "Push button",
    "押しボタン"
  ],
  "Có / ON": [
    "Yes / ON",
    "有・ON"
  ],
  "Không / OFF": [
    "No / OFF",
    "無・OFF"
  ],
  "Chưa mô hình hóa": [
    "Not modeled",
    "未設定"
  ],
  "khớp": [
    "match",
    "一致"
  ],
  "lệch": [
    "mismatch",
    "不一致"
  ],
  "Bước {0}": [
    "Step {0}",
    "ステップ {0}"
  ],
  "Chưa chạy": [
    "Not run",
    "未実行"
  ],
  "Nguồn chưa ghi": [
    "No reference supplied",
    "参照資料なし"
  ],
  "Chạy ca": [
    "Run test",
    "テストを実行"
  ],
  "{0} bước · {1}": [
    "{0} steps · {1}",
    "{0}ステップ · {1}"
  ],
  "Chưa xác minh theo hồ sơ": [
    "Unverified against documentation",
    "資料との照合待ち"
  ],
  "Chi tiết kiểm thử": [
    "Test details",
    "テスト詳細"
  ],
  "Trạng thái đầu theo cấu hình mặc định của thiết bị.": [
    "Initial state follows the devices' default configuration.",
    "初期状態は機器の初期設定に従います。"
  ],
  "Thao tác": [
    "Actions",
    "操作"
  ],
  "Nguồn": [
    "Source",
    "参照元"
  ],
  "Dự kiến": [
    "Expected",
    "期待値"
  ],
  "Thực tế": [
    "Actual",
    "実測値"
  ],
  "Kết quả": [
    "Result",
    "結果"
  ],
  "Thêm ca để ghi lại thao tác và trạng thái dự kiến.": [
    "Add a test to record actions and expected states.",
    "操作と期待状態を記録するテストを追加してください。"
  ],
  "Chọn thiết bị": [
    "Select a device",
    "機器を選択"
  ],
  "Trống = chưa có giá trị": [
    "Empty = no value",
    "空欄 = 値なし"
  ],
  "Giá trị": [
    "Value",
    "値"
  ],
  "Chọn thiết bị có đầu vào": [
    "Select a device with inputs",
    "入力のある機器を選択"
  ],
  "Xóa dòng": [
    "Remove row",
    "行を削除"
  ],
  "Thiết bị": [
    "Device",
    "機器"
  ],
  "Trạng thái": [
    "State",
    "状態"
  ],
  "Chọn đầy đủ thiết bị và trạng thái cho mỗi dòng.": [
    "Select a device and a state for every row.",
    "各行で機器と状態を選択してください。"
  ],
  "Xóa bước": [
    "Remove step",
    "ステップを削除"
  ],
  "Thêm thao tác": [
    "Add action",
    "操作を追加"
  ],
  "Thêm dự kiến": [
    "Add expectation",
    "期待値を追加"
  ],
  "Tên bước": [
    "Step name",
    "ステップ名"
  ],
  "Thời điểm (ms)": [
    "Time (ms)",
    "時刻（ms）"
  ],
  "Tiến thêm (ms)": [
    "Advance (ms)",
    "進める時間（ms）"
  ],
  "Nguồn riêng của bước": [
    "Step reference",
    "ステップの参照元"
  ],
  "Ca kiểm thử cần ít nhất một bước và một kết quả dự kiến.": [
    "A test needs at least one step and one expectation.",
    "テストには1つ以上のステップと期待値が必要です。"
  ],
  "Hở": [
    "Open circuit",
    "開路"
  ],
  "Cấp": [
    "Live",
    "電源側"
  ],
  "Về": [
    "Return",
    "戻り側"
  ],
  "Lỗi nguồn": [
    "Supply error",
    "電源エラー"
  ],
  "Mất nguồn": [
    "No power",
    "電源なし"
  ],
  "S.Err · Mất tín hiệu": [
    "S.Err · Signal lost",
    "S.Err · 信号なし"
  ],
  "Relay hút": [
    "Relay energized",
    "リレー励磁"
  ],
  "Relay nhả": [
    "Relay released",
    "リレー非励磁"
  ],
  "Thứ cấp có điện": [
    "Secondary energized",
    "二次側通電"
  ],
  "Sáng": [
    "Lit",
    "点灯"
  ],
  "Tắt": [
    "Off",
    "消灯"
  ],
  "Kêu": [
    "Sounding",
    "鳴動"
  ],
  "Dừng": [
    "Stopped",
    "停止"
  ],
  "Có nguồn": [
    "Power available",
    "電源あり"
  ],
  "NO đóng": [
    "NO closed",
    "NO閉"
  ],
  "NC đóng": [
    "NC closed",
    "NC閉"
  ],
  "Đầu ra ON": [
    "Output ON",
    "出力ON"
  ],
  "Đầu ra OFF": [
    "Output OFF",
    "出力OFF"
  ],
  "Cuộn hút": [
    "Coil energized",
    "コイル励磁"
  ],
  "Cuộn nhả": [
    "Coil released",
    "コイル非励磁"
  ],
  "Mở": [
    "Open",
    "開"
  ],
  "{0} chân {1}": [
    "{0} terminal {1}",
    "{0} 端子{1}"
  ],
  "Nhấp nháy": [
    "Flashing",
    "点滅"
  ],
  "Đã chọn điểm đầu. Bấm chân hoặc đoạn dây đích, hoặc bấm khoảng trống để đặt điểm gấp.": [
    "Start point selected. Click the target terminal or wire, or empty space to add a bend.",
    "始点を選択しました。終点の端子か配線をクリックしてください。空白で曲がり点を追加できます。"
  ],
  "Đã hủy nối dây.": [
    "Wiring canceled.",
    "配線をキャンセルしました。"
  ],
  "Bấm vào chân thiết bị hoặc một đoạn dây dẫn để đặt que đo.": [
    "Click a device terminal or wire segment to place a probe.",
    "端子または配線をクリックしてプローブを置いてください。"
  ],
  "nhả / tắt": [
    "released / off",
    "復帰・OFF"
  ],
  "tác động": [
    "active",
    "動作"
  ],
  "mất cấp điện": [
    "supply lost",
    "電源消失"
  ],
  "có cấp điện": [
    "supply available",
    "電源供給"
  ],
  "mở": [
    "open",
    "開"
  ],
  "đóng": [
    "closed",
    "閉"
  ],
  "bỏ lệnh chạy": [
    "run command removed",
    "運転指令解除"
  ],
  "có lệnh chạy": [
    "run command present",
    "運転指令あり"
  ],
  "dừng": [
    "stopped",
    "停止"
  ],
  "chạy": [
    "running",
    "運転"
  ],
  "mất phản hồi chạy": [
    "run feedback lost",
    "運転フィードバック消失"
  ],
  "có phản hồi chạy": [
    "run feedback present",
    "運転フィードバックあり"
  ],
  "đã reset": [
    "reset",
    "リセット済"
  ],
  "Mạng nối các miền nguồn khác nhau ({0}).": [
    "Network connects different supply domains ({0}).",
    "異なる電源ドメインが接続されています（{0}）。"
  ],
  "Đối nghịch nguồn trong cùng mạng: {0}.": [
    "Conflicting sources in the same network — {0}.",
    "同一ネットワーク内で電源が競合しています — {0}。"
  ],
  "Logic không hội tụ tại {0} ms. Phần tử thay đổi: {1}.": [
    "Logic did not converge at {0} ms. Changing elements — {1}.",
    "{0} msで論理が収束しません。変化中の要素 — {1}。"
  ],
  "mạng mạch": [
    "circuit network",
    "回路ネットワーク"
  ],
  "MÔ PHỎNG": [
    "SIMULATION",
    "シミュレーション"
  ],
  "Dừng do dao động logic": [
    "Stopped due to logic oscillation",
    "論理の発振により停止"
  ],
  "Đã đến thời điểm chuyển đầu ra timer.": [
    "Timer output transition is due.",
    "タイマ出力の切替時刻になりました。"
  ],
  "Cạnh tác động cuộn ALT đổi trạng thái tiếp điểm.": [
    "ALT coil pickup edge changed the contact position.",
    "ALTコイルの立上りで接点位置が切り替わりました。"
  ],
  "Thiết bị đầu vào không tồn tại: {0}": [
    "Input device does not exist — {0}",
    "入力機器が存在しません — {0}"
  ],
  "{0}: giá trị đầu vào không hợp lệ ({1}).": [
    "{0} has an invalid input value ({1}).",
    "{0}の入力値が無効です（{1}）。"
  ],
  "Lệnh đóng bị chặn": [
    "Close command blocked",
    "投入指令を拒否"
  ],
  "CB đang trip. Reset chốt trip trước khi đóng lại.": [
    "Circuit breaker is tripped. Reset the trip latch before closing again.",
    "遮断器がトリップ中です。再投入する前にトリップをリセットしてください。"
  ],
  "có": [
    "yes",
    "有"
  ],
  "không": [
    "no",
    "無"
  ],
  "Đầu vào": [
    "Input",
    "入力"
  ],
  "Khoảng thời gian mô phỏng phải hữu hạn và không âm.": [
    "Simulation duration must be finite and non-negative.",
    "シミュレーション時間は有限の0以上の値にしてください。"
  ],
  "Chân {0} nằm trên mạng có nguồn đối nghịch.": [
    "Terminal {0} is on a network with conflicting sources.",
    "端子{0}のネットワークに電源競合があります。"
  ],
  "Chân {0} nằm trên mạng nối sai miền nguồn.": [
    "Terminal {0} is on a network with supply domain mismatch.",
    "端子{0}のネットワークに電源ドメイン不一致があります。"
  ],
  "Chân {0} nhận {1} miền {2}, cần {3} miền {4}.": [
    "Terminal {0} receives {1} in domain {2}; it needs {3} in domain {4}.",
    "端子{0}には{2}の{1}が接続されています。必要なのは{4}の{3}です。"
  ],
  "đường về": [
    "return path",
    "戻り経路"
  ],
  "nguồn cấp": [
    "supply",
    "電源供給"
  ],
  "thiếu đường về": [
    "missing return path",
    "戻り経路なし"
  ],
  "thiếu pha": [
    "missing phase",
    "欠相"
  ],
  "thiếu đường cấp": [
    "missing supply path",
    "電源供給経路なし"
  ],
  "Chân {0} {1} ({2}).": [
    "Terminal {0} {1} ({2}).",
    "端子{0} {1}（{2}）。"
  ],
  "{0} đang trip": [
    "{0} is tripped",
    "{0}はトリップ中"
  ],
  "{0} đang ở {1}": [
    "{0} is in {1}",
    "{0}は{1}"
  ],
  "{0} đang mở{1}": [
    "{0} is open{1}",
    "{0}は開{1}"
  ],
  " (thiết bị chủ {0})": [
    " (parent device {0})",
    " （親機器{0}）"
  ],
  "{0} vì {1} đang trip": [
    "{0} because {1} is tripped",
    "{1}がトリップしているため{0}"
  ],
  "{0} vì {1}: {2}": [
    "{0} because {1} — {2}",
    "{1}が{2}のため{0}"
  ],
  "{0} mất nguồn hoặc đang tắt": [
    "{0} has lost power or is off",
    "{0}は電源消失またはOFF"
  ],
  "Chân {0} {1}{2}.": [
    "Terminal {0} {1}{2}.",
    "端子{0} {1}{2}。"
  ],
  "Thiết bị không tồn tại.": [
    "Device does not exist.",
    "機器が存在しません。"
  ],
  "S.Err · Kiểm tra chế độ ngõ vào, dây tín hiệu và nguồn của vòng 4–20 mA.": [
    "S.Err · Check input mode, signal wiring and the 4–20 mA loop supply.",
    "S.Err · 入力種別、信号配線、4–20 mAループ電源を確認してください。"
  ],
  "Cần vòng kín đúng cực, nguồn 9–30 VDC và đường về cùng nguồn.": [
    "Requires a closed loop of correct polarity, 9–30 VDC and a return to the same supply.",
    "正しい極性の閉ループ、DC9–30 V、同一電源への戻り経路が必要です。"
  ],
  "S0–S1 dùng AC110 hoặc S0–S2 dùng AC220.": [
    "Use S0–S1 for AC110 or S0–S2 for AC220.",
    "AC110 VはS0–S1、AC220 VはS0–S2に接続してください。"
  ],
  "Hai chân nguồn cần điện áp AC100–240 từ cùng một nguồn.": [
    "Both supply terminals need AC100–240 from the same source.",
    "両電源端子に同一電源からAC100–240 Vを供給してください。"
  ],
  "Đầu ra timer dự kiến đổi tại {0} ms.": [
    "Timer output is due to change at {0} ms.",
    "タイマ出力は{0} msで切替予定です。"
  ],
  "Cần đủ ba pha khác nhau từ cùng một nguồn, trong đúng miền động lực.": [
    "Requires three distinct phases from the same source in the correct power domain.",
    "同一電源の異なる三相と、正しい動力ドメインが必要です。"
  ],
  "Đường cấp và đường về phải thuộc cùng một nguồn và đúng miền điều khiển.": [
    "Supply and return must come from the same source in the correct control domain.",
    "供給側と戻り側を同一電源の正しい制御ドメインに接続してください。"
  ],
  "Đủ ba pha từ cùng một nguồn động lực.": [
    "Three distinct phases are available from the same source.",
    "同一電源から三相が供給されています。"
  ],
  "Có đường cấp và đường về hợp lệ.": [
    "Valid supply and return paths are available.",
    "有効な電源供給経路と戻り経路があります。"
  ],
  "Chưa gán thiết bị chủ.": [
    "Parent device is unassigned.",
    "親機器が未割当です。"
  ],
  "Tác động đầu vào trip.": [
    "Trip input is active.",
    "トリップ入力がONです。"
  ],
  "Nguồn mô hình đang cấp.": [
    "Model supply is on.",
    "モデル電源はONです。"
  ],
  "Nguồn mô hình đang tắt.": [
    "Model supply is off.",
    "モデル電源はOFFです。"
  ],
  "Chế độ {0}.": [
    "Mode {0}.",
    "モード {0}。"
  ],
  "Theo trạng thái đầu vào và tiếp điểm của thiết bị.": [
    "Follows the device inputs and contact state.",
    "機器の入力と接点状態に従います。"
  ],
  "Mạng không có thế nguồn": [
    "Network has no source potential",
    "ネットワークに電源電位なし"
  ],
  "Đối nghịch nguồn": [
    "Conflicting sources",
    "電源競合"
  ],
  "Sai miền nguồn": [
    "Supply domain mismatch",
    "電源ドメイン不一致"
  ],
  "Đầu nối thiếu": [
    "Missing endpoint",
    "接続先なし"
  ],
  "Bước kiểm thử": [
    "Test step",
    "テストステップ"
  ],
  "Lịch tuần phải là danh sách chương trình.": [
    "Weekly schedule must be a program list.",
    "週間プログラムはリストで指定してください。"
  ],
  "Chương trình {0} · {1}": [
    "Program {0} · {1}",
    "プログラム {0} · {1}"
  ],
  "chọn kênh, nhóm lịch và chế độ hợp lệ.": [
    "select a valid channel, bank and mode.",
    "有効なチャンネル、プログラム群、モードを選択してください。"
  ],
  "chọn ít nhất một ngày trong tuần.": [
    "select at least one day of the week.",
    "曜日を1つ以上選択してください。"
  ],
  "giờ phải theo định dạng HH:MM.": [
    "times must use HH:MM.",
    "時刻をHH:MM形式で指定してください。"
  ],
  "xung phải từ 1 đến 59 giây hoặc từ 1 đến 60 phút nguyên.": [
    "pulse width must be 1–59 seconds or 1–60 whole minutes.",
    "パルス幅は1～59秒、または1～60分の整数で指定してください。"
  ],
  "độ dài ON và OFF phải từ 1 đến 719 phút.": [
    "ON and OFF times must each be 1–719 minutes.",
    "ON時間とOFF時間はそれぞれ1～719分にしてください。"
  ],
  "kênh {0} vượt quá 40 bước.": [
    "channel {0} exceeds 40 steps.",
    "チャンネル{0}が40ステップを超えています。"
  ],
  "Dây đã thay đổi. Hãy chọn lại điểm nối.": [
    "The wire has changed. Select the connection point again.",
    "配線が変更されました。接続点を再選択してください。"
  ],
  "Hai điểm đã nằm trên cùng dây.": [
    "Both points are already on the same wire.",
    "両点は既に同一配線上にあります。"
  ],
  "Điểm và chân này đã nằm trên cùng dây.": [
    "The point and terminal are already on the same wire.",
    "点と端子は既に同一配線上にあります。"
  ],
  "Đã tạo nút nối ngay tại giao điểm.": [
    "Created a junction at the crossing.",
    "交点に接続点を作成しました。"
  ],
  "Hai điểm này đã nối trực tiếp.": [
    "These points are already directly connected.",
    "両点は既に直接接続されています。"
  ],
  "Đã nối dây. Có thể gắn nhãn dây ở bảng Thuộc tính.": [
    "Wire connected. Set its label in Properties.",
    "配線を接続しました。プロパティで線番を設定できます。"
  ],
  "Mô phỏng tủ điện 2D": [
    "Electrical Cabinet Simulator 2D",
    "電気制御盤シミュレータ2D"
  ],
  "Cục bộ": [
    "Local",
    "ローカル"
  ],
  "Mới": [
    "New",
    "新規"
  ],
  "Lưu": [
    "Save",
    "保存"
  ],
  "Lưu thành…": [
    "Save as…",
    "名前を付けて保存…"
  ],
  "Xuất": [
    "Export",
    "出力"
  ],
  "Xuất PDF…": [
    "Export PDF…",
    "PDF出力…"
  ],
  "Bản vẽ để in và chia sẻ": [
    "Drawing for printing and sharing",
    "印刷・共有用の図面"
  ],
  "Xuất DWG…": [
    "Export DWG…",
    "DWG出力…"
  ],
  "Bản vẽ CAD chỉnh sửa được": [
    "Editable CAD drawing",
    "編集可能なCAD図面"
  ],
  "Mạch mẫu": [
    "Examples",
    "サンプル回路"
  ],
  "Mạch bơm hố thu": [
    "Sump pit pump circuit",
    "排水ピットポンプ回路"
  ],
  "Mạch quạt hút khói": [
    "Smoke exhaust fan circuit",
    "排煙ファン回路"
  ],
  "Điều khiển áp suất nước": [
    "Water pressure control",
    "水圧制御"
  ],
  "Chạy": [
    "Run",
    "実行"
  ],
  "Từng bước": [
    "Step",
    "ステップ実行"
  ],
  "Đặt lại": [
    "Reset",
    "リセット"
  ],
  "Thư viện thiết bị": [
    "Device library",
    "機器ライブラリ"
  ],
  "Kéo thả thiết bị vào sơ đồ": [
    "Drag devices onto the schematic",
    "機器を回路図へドラッグ"
  ],
  "Sơ đồ nguyên lý": [
    "Circuit schematic",
    "回路図"
  ],
  "Bắt đầu dựng mạch": [
    "Build a circuit",
    "回路を作成"
  ],
  "Kéo ký hiệu từ thư viện vào bản vẽ, rồi chọn hai chân để nối dây.": [
    "Drag a symbol from the library, then select two terminals to connect.",
    "ライブラリの記号を配置し、2つの端子を選んで配線してください。"
  ],
  "Tìm thiết bị": [
    "Find device",
    "機器を検索"
  ],
  "Mở mạch mẫu": [
    "Open example",
    "サンプルを開く"
  ],
  "Lưới": [
    "Grid",
    "グリッド"
  ],
  "Bắt dính": [
    "Snap",
    "スナップ"
  ],
  "Thuộc tính": [
    "Properties",
    "プロパティ"
  ],
  "Nhật ký": [
    "Log",
    "ログ"
  ],
  "Kiểm thử": [
    "Tests",
    "テスト"
  ],
  "Chạy tất cả": [
    "Run all",
    "すべて実行"
  ],
  "Thêm ca": [
    "Add test",
    "テストを追加"
  ],
  "Lỗi": [
    "Fault",
    "異常"
  ],
  "0 thiết bị · 0 dây": [
    "0 devices · 0 wires",
    "機器 0個 · 配線 0本"
  ],
  "Ca kiểm thử": [
    "Test case",
    "テストケース"
  ],
  "Tên ca": [
    "Test name",
    "テスト名"
  ],
  "Nguồn hoặc trang tham chiếu": [
    "Source or reference page",
    "資料・参照ページ"
  ],
  "Mô tả trạng thái đầu": [
    "Initial state description",
    "初期状態の説明"
  ],
  "Thêm đầu vào ban đầu": [
    "Add initial input",
    "初期入力を追加"
  ],
  "Đối chiếu hồ sơ": [
    "Documentation verification",
    "資料との照合"
  ],
  "Đã xác minh": [
    "Verified",
    "確認済"
  ],
  "Thêm bước": [
    "Add step",
    "ステップを追加"
  ],
  "Hủy": [
    "Cancel",
    "キャンセル"
  ],
  "Lưu ca": [
    "Save test",
    "テストを保存"
  ],
  "Khôi phục dự án": [
    "Recover project",
    "プロジェクトを復元"
  ],
  "Bỏ bản tự lưu": [
    "Discard autosave",
    "自動保存を破棄"
  ],
  "Khôi phục": [
    "Recover",
    "復元"
  ],
  "Tên dự án": [
    "Project name",
    "プロジェクト名"
  ],
  "Có thay đổi chưa lưu": [
    "Unsaved changes",
    "未保存の変更"
  ],
  "Lệnh dự án và mô phỏng": [
    "Project and simulation commands",
    "プロジェクト・シミュレーション操作"
  ],
  "Dự án mới (Ctrl+N)": [
    "New project (Ctrl+N)",
    "新規プロジェクト（Ctrl+N）"
  ],
  "Mở dự án (Ctrl+O)": [
    "Open project (Ctrl+O)",
    "プロジェクトを開く（Ctrl+O）"
  ],
  "Lưu dự án (Ctrl+S)": [
    "Save project (Ctrl+S)",
    "保存（Ctrl+S）"
  ],
  "Lưu thành tệp khác (Ctrl+Shift+S)": [
    "Save as (Ctrl+Shift+S)",
    "名前を付けて保存（Ctrl+Shift+S）"
  ],
  "Xuất toàn bộ sơ đồ": [
    "Export full schematic",
    "回路図全体を出力"
  ],
  "Mở dự án mẫu": [
    "Open example project",
    "サンプルプロジェクトを開く"
  ],
  "Chạy mô phỏng": [
    "Run simulation",
    "シミュレーションを実行"
  ],
  "Tiến một bước từ mô phỏng": [
    "Advance one simulation step",
    "1ステップ進める"
  ],
  "Đặt lại mô phỏng": [
    "Reset simulation",
    "シミュレーションをリセット"
  ],
  "Âm thanh còi": [
    "Buzzer sound",
    "ブザー音"
  ],
  "Đồng hồ mô phỏng": [
    "Simulation clock",
    "シミュレーション時計"
  ],
  "Tìm thiết bị…": [
    "Find a device…",
    "機器を検索…"
  ],
  "Bản vẽ mạch": [
    "Circuit drawing",
    "回路図"
  ],
  "Công cụ sơ đồ": [
    "Schematic tools",
    "回路図ツール"
  ],
  "Chọn (V)": [
    "Select (V)",
    "選択（V）"
  ],
  "Nối dây (W)": [
    "Wire (W)",
    "配線（W）"
  ],
  "Vôn kế · chọn hai điểm": [
    "Voltmeter · select two points",
    "電圧計 · 2点を選択"
  ],
  "Ampe kế · chọn đoạn dây hoặc chân": [
    "Ammeter · select wire or terminal",
    "電流計 · 配線または端子を選択"
  ],
  "Dịch khung nhìn (H)": [
    "Pan (H)",
    "表示を移動（H）"
  ],
  "Đổi hướng ký hiệu (R)": [
    "Rotate symbol (R)",
    "記号の向きを変更（R）"
  ],
  "Đổi hướng ký hiệu dọc/ngang (R)": [
    "Toggle vertical/horizontal symbol (R)",
    "記号の縦・横を切替（R）"
  ],
  "Hoàn tác (Ctrl+Z)": [
    "Undo (Ctrl+Z)",
    "元に戻す（Ctrl+Z）"
  ],
  "Làm lại (Ctrl+Y)": [
    "Redo (Ctrl+Y)",
    "やり直す（Ctrl+Y）"
  ],
  "Nhân bản (Ctrl+D)": [
    "Duplicate (Ctrl+D)",
    "複製（Ctrl+D）"
  ],
  "Xóa phần tử (Delete)": [
    "Delete selection (Delete)",
    "選択を削除（Delete）"
  ],
  "Canvas sơ đồ mạch": [
    "Circuit schematic canvas",
    "回路図キャンバス"
  ],
  "Hiện lưới": [
    "Show grid",
    "グリッド表示"
  ],
  "Bắt dính lưới": [
    "Snap to grid",
    "グリッドにスナップ"
  ],
  "Thu nhỏ": [
    "Zoom out",
    "縮小"
  ],
  "Mức thu phóng": [
    "Zoom level",
    "表示倍率"
  ],
  "Phóng to": [
    "Zoom in",
    "拡大"
  ],
  "Vừa khung nhìn": [
    "Fit to view",
    "全体表示"
  ],
  "Thuộc tính và chân đấu": [
    "Properties and terminals",
    "プロパティと端子"
  ],
  "Cảnh báo, nhật ký và ca kiểm thử": [
    "Warnings, log and tests",
    "警告・ログ・テスト"
  ],
  "Kết quả và kiểm thử": [
    "Results and tests",
    "結果・テスト"
  ],
  "Chú giải dây": [
    "Wire legend",
    "配線の凡例"
  ],
  "Ví dụ: nguồn đang bật, CB đang đóng": [
    "Example — supply on, circuit breaker closed",
    "例 — 電源ON、遮断器閉"
  ],
  "Ngôn ngữ": [
    "Language",
    "言語"
  ],
  "Giới thiệu": [
    "About",
    "このソフトについて"
  ],
  "Tác giả": [
    "Author",
    "作者"
  ],
  "Công tác tại": [
    "Organization",
    "所属"
  ],
  "Mọi góp ý xin gửi về": [
    "Feedback email",
    "ご意見・ご要望の送付先"
  ],
  "Sao chép email": [
    "Copy email",
    "メールアドレスをコピー"
  ],
  "Sao chép": [
    "Copy",
    "コピー"
  ],
  "Đã sao chép email.": [
    "Email copied.",
    "メールアドレスをコピーしました。"
  ],
  "Chọn địa chỉ email để sao chép.": [
    "Select the email address to copy it.",
    "メールアドレスを選択してコピーしてください。"
  ],
  "Ngang": [
    "Horizontal",
    "横"
  ],
  "Xung": [
    "Pulse",
    "パルス"
  ],
  "T2": [
    "Mon",
    "月"
  ],
  "T3": [
    "Tue",
    "火"
  ],
  "T4": [
    "Wed",
    "水"
  ],
  "T5": [
    "Thu",
    "木"
  ],
  "T6": [
    "Fri",
    "金"
  ],
  "T7": [
    "Sat",
    "土"
  ],
  "CN": [
    "Sun",
    "日"
  ],
  "Terminal": [
    "Terminal",
    "端子台"
  ],
  "Timer ON delay": [
    "ON-delay timer",
    "オンディレータイマ"
  ],
  "Timer OFF delay": [
    "OFF-delay timer",
    "オフディレータイマ"
  ],
  "Bộ điều khiển mức nước Omron 61F-G2 AC110/220": [
    "Omron 61F-G2 AC110/220 level controller",
    "オムロン61F-G2 AC110/220水位制御器"
  ],
  "Bộ điều khiển mức nước Omron 61F-G3 AC110/220": [
    "Omron 61F-G3 AC110/220 level controller",
    "オムロン61F-G3 AC110/220水位制御器"
  ],
  "≥ {0} ms theo Omron": [
    "≥ {0} ms per Omron",
    "オムロン指定で{0} ms以上"
  ],
  " do {0}": [
    " due to {0}",
    " 原因 {0}"
  ],
  "Theo {0} · {1}.": [
    "Follows {0} · {1}.",
    "{0} · {1}に連動します。"
  ],
  "Đóng cửa sổ": [
    "Close",
    "閉じる"
  ]
};
