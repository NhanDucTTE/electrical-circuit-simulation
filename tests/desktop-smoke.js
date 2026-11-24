(() => {
  const checks = [];
  const consoleErrors = window.desktopStartupErrors ?? [];

  const check = (condition, name) => {
    if (!condition) throw new Error(name);
    checks.push(name);
  };
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  async function waitFor(predicate, name) {
    for (let i = 0; i < 100; i++) {
      const result = predicate();
      if (result) return result;
      await delay(50);
    }
    throw new Error(name);
  }
  const query = (selector) => document.querySelector(selector);
  const action = (name) => query(`[data-action="${name}"]`);
  const device = (type) => query(`#schematic [data-device][data-type="${type}"]`);
  const projectTabs = () => [...document.querySelectorAll('#project-tabs [role="tab"]')];
  const activeProjectTab = () => projectTabs().find(tab => tab.getAttribute('aria-selected') === 'true');
  const wireCount = () => document.querySelectorAll('#wires-layer [data-wire]').length;

  function click(target) {
    if (!target) throw new Error('Không tìm thấy điều khiển cần bấm');
    target.click();
  }

  function pointAt(target, modifiers = {}) {
    if (!target) throw new Error('Không tìm thấy phần tử trên sơ đồ');
    const box = target.getBoundingClientRect();
    target.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true, cancelable: true, button: 0, buttons: 1, pointerId: 1, pointerType: 'mouse',
      clientX: box.left + box.width / 2, clientY: box.top + box.height / 2, ...modifiers
    }));
  }

  function drop(type, x, y) {
    const card = query(`#palette [data-type="${type}"]`);
    const canvas = query('#schematic');
    const box = canvas.getBoundingClientRect();
    const dataTransfer = new DataTransfer();
    card.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer }));
    canvas.dispatchEvent(new DragEvent('dragover', {
      bubbles: true, cancelable: true, dataTransfer, clientX: Math.round(box.left + box.width * x),
      clientY: Math.round(box.top + box.height * y)
    }));
    canvas.dispatchEvent(new DragEvent('drop', {
      bubbles: true, cancelable: true, dataTransfer, clientX: Math.round(box.left + box.width * x),
      clientY: Math.round(box.top + box.height * y)
    }));
    card.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer }));
  }

  function connect(pinA, pinB) {
    pointAt(device('source-ac').querySelector(`[data-pin="${pinA}"]`));
    pointAt(device('lamp').querySelector(`[data-pin="${pinB}"]`));
  }

  async function verifyBomExport() {
    for (const [type, value] of [['phase-relay', '=2+3'], ['motor', 'K,"ĐK"']]) {
      pointAt(device(type));
      const tag = query('#inspector [data-field="tag"]');
      tag.value = value;
      tag.dispatchEvent(new Event('change', { bubbles: true }));
    }
    drop('junction', 0.78, 0.78);
    check(Boolean(device('junction')), 'Thêm nút nối để kiểm tra bộ lọc bảng kê vật tư');
    drop('lamp', 0.25, 0.75);
    drop('lamp', 0.30, 0.75);
    click(action('bom'));
    const dialog = query('#bom-dialog');
    const rows = [...dialog.querySelectorAll('.bom-table tbody tr')];
    const quantities = rows.map(row => Number(row.querySelector('.bom-quantity').textContent));
    check(dialog.open && rows.every(row => row.children.length === 8) && quantities.some(quantity => quantity >= 2) &&
      rows.some(row => row.children[2].textContent.includes('Đèn') && Number(row.querySelector('.bom-quantity').textContent) >= 2),
      'Bảng kê có cột số lượng và gộp đèn cùng thông số');
    click(action('export-bom-csv'));
    await waitFor(() => {
      const status = query('#bom-export-status');
      return !status?.hidden && status?.textContent.includes('Đã xuất CSV') && status.textContent.includes('ui-bom.csv');
    }, 'Xuất BOM qua nút Windows chưa báo đã ghi tệp CSV');
    check(dialog.open && !action('export-bom-csv').disabled, 'Bảng kê báo đã xuất CSV và vẫn sẵn sàng thao tác');
    click(action('close-bom'));
    check(!dialog.open, 'Đóng hộp thoại bảng kê vật tư BOM');
    return { bomRowCount: rows.length, bomQuantity: quantities.reduce((a, b) => a + b, 0) };
  }

  async function verifyProjectWorkspace(roundtripTab) {
    click(roundtripTab);
    click(action('select'));
    const sourceId = device('source-ac').dataset.device;
    const lampId = device('lamp').dataset.device;
    const sourceTag = device('lamp').querySelector('.device-tag').textContent;
    pointAt(device('source-ac'));
    pointAt(device('lamp'), { shiftKey: true });
    click(action('copy'));

    const previousTabCount = projectTabs().length;
    click(action('new'));
    const targetTab = activeProjectTab();
    check(projectTabs().length === previousTabCount + 1 && targetTab !== roundtripTab && !device('lamp'),
      'Dự án mới mở tab riêng và giữ dự án đang sửa');
    await waitFor(() => !action('new').disabled, 'Tab mới chưa sẵn sàng chỉnh sửa');
    drop('lamp', 0.32, 0.50);
    check(device('lamp')?.querySelector('.device-tag').textContent === sourceTag, 'Tạo được tag trùng ở dự án đích để thử dán');

    const dialog = query('#paste-conflict-dialog');
    click(action('paste'));
    check(dialog.open && query('#paste-conflicts li').textContent.includes(sourceTag), 'Dán khác tab báo rõ tag thiết bị bị trùng');
    const cancelled = new Promise(resolve => dialog.addEventListener('close', resolve, { once: true }));
    click(dialog.querySelector('[value="cancel"]'));
    await cancelled;
    check(!device('source-ac') && wireCount() === 0, 'Hủy xung đột giữ nguyên sơ đồ đích');

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', ctrlKey: true, bubbles: true, cancelable: true }));
    await waitFor(() => dialog.open, 'Ctrl+V chưa hiện hộp thoại xung đột');
    const renamed = query('#paste-conflicts li strong').textContent;
    click(action('confirm-paste'));
    await waitFor(() => device('source-ac') && wireCount() === 2, 'Dán nhóm chưa mang đủ thiết bị và dây nội bộ');
    const pastedLamps = [...document.querySelectorAll('#schematic [data-device][data-type="lamp"]')];
    check(pastedLamps.length === 2 && pastedLamps.some(item => item.querySelector('.device-tag').textContent === renamed) &&
      renamed !== sourceTag && device('source-ac').dataset.device !== sourceId &&
      pastedLamps.every(item => item.dataset.device !== lampId), 'Dán khác tab giữ dây, cấp ID mới và đổi tag được duyệt');

    const recovery = JSON.parse(await window.desktop.getRecovery());
    const drafts = recovery.projects.map(({ text }) => JSON.parse(text));
    check(recovery.version === 2 && drafts.some(model => model.devices.some(item => item.id === sourceId)) &&
      drafts.some(model => model.devices.some(item => item.id === device('source-ac').dataset.device)),
      'Tự lưu đồng thời dự án nguồn và đích đang sửa');
    click(action('undo'));
    check(!device('source-ac') && wireCount() === 0, 'Hoàn tác ở tab đích chỉ gỡ nhóm vừa dán');
    click(roundtripTab);
    check(device('source-ac').dataset.device === sourceId && wireCount() === 2,
      'Dự án nguồn giữ ID và dây khi chuyển tab trở lại');
    click(targetTab);
    check(!device('source-ac') && wireCount() === 0, 'Tab đích giữ lịch sử và trạng thái sau khi chuyển tab');

    const close = query(`#project-tabs [data-action="close-project"][data-project-id="${targetTab.dataset.projectId}"]`);
    const closeDialog = query('#close-project-dialog');
    click(close);
    check(closeDialog.open, 'Đóng tab chưa lưu mở lựa chọn lưu, bỏ thay đổi hoặc hủy');
    click(closeDialog.querySelector('[value="cancel"]'));
    await waitFor(() => !closeDialog.open && !query('#project-tabs').inert, 'Không hủy được thao tác đóng tab');
    check(projectTabs().includes(targetTab), 'Hủy đóng giữ lại tab và nội dung');
    click(close);
    click(closeDialog.querySelector('[value="discard"]'));
    await waitFor(() => !projectTabs().includes(targetTab), 'Không đóng được tab đích');
    check(projectTabs().length === previousTabCount && projectTabs().includes(roundtripTab), 'Bỏ thay đổi chỉ đóng tab đã chọn');

    click(action('examples'));
    click(action('template-motor-dol'));
    await waitFor(() => device('motor') && device('contactor'), 'Không tải được mạch khởi động trực tiếp');
    const dolTab = activeProjectTab();
    check(dolTab !== roundtripTab && wireCount() > 0, 'Thư viện mở mạch khởi động trực tiếp đầy đủ dây trong tab riêng');
    click(action('examples'));
    click(action('template-motor-star-delta'));
    await waitFor(() => device('motor-6p') && device('timer-on'), 'Không tải được mạch sao tam giác');
    const starDeltaTab = activeProjectTab();
    check(starDeltaTab !== dolTab && projectTabs().includes(dolTab) && wireCount() > 0,
      'Thư viện mở mạch sao tam giác cùng mạch khởi động trực tiếp');
    click(dolTab);
    check(device('motor') && !device('motor-6p'), 'Chuyển tab trở về mạch khởi động trực tiếp');
    click(action('run'));
    const time = await waitFor(() => {
      const value = query('#virtual-time').textContent;
      return parseFloat(value) > 0 && value;
    }, 'Đồng hồ mạch mẫu không chạy');
    click(starDeltaTab);
    check(query('#sim-status').dataset.mode === 'idle' && query('#virtual-time').textContent === '0.000 s',
      'Tab mạch sao tam giác có trạng thái mô phỏng riêng');
    await delay(175);
    click(dolTab);
    check(query('#sim-status').dataset.mode === 'paused' && query('#virtual-time').textContent === time,
      'Đổi tab tạm dừng mô phỏng đang chạy và giữ đúng thời gian khi quay lại');
    click(action('examples'));
    click(action('template-pump-level'));
    await waitFor(() => device('pump') && device('float') && device('selector'), 'Không tải được mạch bơm theo mức nước');
    check(projectTabs().includes(dolTab) && projectTabs().includes(starDeltaTab), 'Thư viện mở mẫu bơm theo mức nước trong tab thứ ba');
  }

  async function verifyOu101Templates() {
    click(action('examples'));
    click(action('template-ou101-vfd'));
    await waitFor(() => device('vfd-ls-h100') && !action('new').disabled, 'Không tải được biến tần OU-101');
    const driveTab = activeProjectTab();
    check(query('#inspector').textContent.includes('302'), 'Mạch biến tần có nguồn tham chiếu tờ 302');
    click(query('[data-tab="tests"]'));
    click(action('run-tests'));
    check(query('#scenario-list .status-pass') && !query('#scenario-list .status-fail'), 'Các ca biến tần OU-101 đều đạt');
    click(action('step'));
    pointAt(query('#schematic [data-device="mode"]'));
    const mode = query('#inspector [data-input-key="mode"]');
    mode.value = 'AUTO';
    mode.dispatchEvent(new Event('change', { bubbles: true }));
    pointAt(query('#schematic [data-device="dcs-start"]'));
    click(query('#inspector [data-input-key="signal"]'));
    pointAt(device('vfd-ls-h100'));
    const frequency = query('#inspector [data-input-key="frequencyHz"]');
    frequency.value = '35';
    frequency.dispatchEvent(new Event('change', { bubbles: true }));
    check(/35\s*Hz.*1[.,\s]?050\s*rpm/u.test(device('vfd-ls-h100').querySelector('.device-state').textContent),
      'Sơ đồ biến tần hiển thị 35 Hz và 1050 rpm');

    click(action('examples'));
    click(action('template-ou101-scr'));
    await waitFor(() => device('scr-tpr-3sl') && !action('new').disabled, 'Không tải được mạch SCR OU-101');
    check(projectTabs().includes(driveTab) && document.querySelectorAll('#schematic [data-type="heater-3ph"]').length === 2 &&
      query('#inspector').textContent.includes('303') && query('#inspector').textContent.includes('304'),
      'Mạch SCR mở riêng và có đủ hai nhánh gia nhiệt tờ 303/304');
    click(query('[data-tab="tests"]'));
    click(action('run-tests'));
    check(query('#scenario-list .status-pass') && !query('#scenario-list .status-fail'), 'Các ca SCR OU-101 đều đạt');
  }

  async function run() {
    check(navigator.onLine === false, 'WebView2 đang ở trạng thái offline');
    check(typeof window.desktop?.saveProject === 'function', 'Cầu nối tệp Windows đã sẵn sàng');
    await waitFor(() => query('#palette [data-type="source-ac"]') && query('#schematic'), 'Thư viện hoặc canvas không tải');
    check(!query('#schematic [data-device]'), 'Dự án trống khi mở bản Windows');
    const drawing = query('#schematic').getBoundingClientRect();
    check(drawing.width > 200 && drawing.height > 100, 'Canvas và các bảng được bố trí trong cửa sổ desktop');
    const paletteSymbols = document.querySelectorAll('#palette .electrical-symbol');
    check(paletteSymbols.length === 49 && [...paletteSymbols].every(symbol => symbol.firstElementChild), 'Thư viện hiển thị 49 ký hiệu điện dạng vector');
    check(['pressure-sensys','controller-e5ec','weekly-h5s','level-61f-g2','level-61f-g3','rtd-evikon','transformer-ac','phase-relay','vfd','soft-starter','power-meter','motor-6p']
      .every(type => query(`#palette [data-type="${type}"] .electrical-symbol`)), 'Thư viện giữ các thiết bị chuyên dụng và bổ sung động cơ sáu đầu dây');
    const search = query('#device-search');
    search.value = 'G4Q-212S';
    search.dispatchEvent(new Event('input', {bubbles: true}));
    check(query('#palette [data-type="relay-alternate-g4q"]')?.textContent.includes('G4Q-212S'),
      'Tìm thấy Omron G4Q-212S AC220 trong thư viện thiết bị');
    search.value = '';
    search.dispatchEvent(new Event('input', {bubbles: true}));

    drop('source-ac', 0.27, 0.4);
    drop('lamp', 0.68, 0.4);
    check(device('source-ac') && device('lamp'), 'Kéo thả nguồn AC và đèn từ thư viện');
    check(device('source-ac').dataset.orientation === 'vertical' && device('lamp').dataset.orientation === 'vertical' &&
      device('lamp').querySelector('.electrical-symbol .symbol-paper'), 'Nguồn và đèn lên bản vẽ theo hướng dọc với hình ký hiệu');
    click(action('rotate'));
    check(device('lamp').dataset.orientation === 'horizontal', 'Đổi thiết bị đã chọn sang hướng ngang');
    click(action('undo'));
    check(device('lamp').dataset.orientation === 'vertical', 'Hoàn tác đổi hướng ký hiệu');
    connect('L', 'A1');
    connect('N', 'A2');
    pointAt(device('lamp'));
    const color = query('#inspector [data-field="lampColor"]');
    color.value = '#c361ee';
    color.dispatchEvent(new Event('change', {bubbles: true}));
    click(query('#inspector [data-field="blink"]'));
    const draft = JSON.parse(await window.desktop.getRecovery());
    check(draft?.version === 2 && JSON.parse(draft.projects[0].text).wires.length === 2, 'Tự lưu ghi trạng thái sơ đồ chưa lưu');
    click(action('run'));
    await waitFor(() => device('lamp').querySelector('.device-box.is-active'), 'Đèn chưa sáng sau khi nối đủ hai cực');
    check(device('lamp').querySelector('.device-state')?.textContent.trim() === 'Nhấp nháy' &&
      device('lamp').querySelector('.lamp-light')?.getAttribute('fill') === '#c361ee', 'Đèn dùng màu đã chọn và có nhãn nhấp nháy');
    await waitFor(() => getComputedStyle(device('lamp').querySelector('.lamp-light')).visibility === 'hidden', 'Đèn chưa đến pha tối');
    await waitFor(() => getComputedStyle(device('lamp').querySelector('.lamp-light')).visibility === 'visible', 'Đèn chưa quay lại pha sáng');
    check(true, 'Đèn có cả pha sáng và pha tối theo đồng hồ mô phỏng');

    pointAt(device('source-ac'));
    const sourceInput = await waitFor(() => query('#inspector [data-input-key="on"]'), 'Không có điều khiển nguồn AC');
    click(sourceInput);
    await waitFor(() => !device('lamp').querySelector('.device-box.is-active'), 'Đèn chưa tắt khi cắt nguồn');
    check(device('lamp').querySelector('.device-state')?.textContent.trim() === 'Tắt', 'Cắt nguồn làm đèn tắt và đổi nhãn');
    click(action('pause'));

    await waitFor(() => action('save') && !action('save').disabled, 'Không thể lưu');
    click(action('save'));
    let saved;
    for (let attempt = 0; attempt < 20; attempt++) {
      try { saved = await window.desktop.openProject(); break; } catch { await delay(75); }
    }
    check(Boolean(saved?.path), 'Lưu từ giao diện tạo dự án trên đĩa');
    const original = JSON.parse(saved.text);
    check(original.version === 1 && original.devices.length === 2 && original.wires.length === 2, 'Tệp lưu có schema, hai thiết bị và hai dây');
    check(original.devices.every(item => item.params.orientation === 'vertical'), 'Hướng ký hiệu được lưu trong dự án');
    check(await window.desktop.getRecovery() === null, 'Lưu dự án xóa bản nháp đã được ghi vào tệp');
    click(action('save-as'));
    await waitFor(() => action('save-as') && !action('save-as').disabled, 'Lưu thành chưa hoàn tất');
    const saveAsPath = saved.path.replace(/ui-roundtrip\.td2d\.json$/i, 'UI-SAVE-AS.TD2D.JSON');
    let duplicatePathError;
    try {
      await window.desktop.saveProject(JSON.stringify({ ...original, name: 'Duplicate Save As' }), null, [saveAsPath]);
    } catch (error) { duplicatePathError = error; }
    check(duplicatePathError?.message.includes('tab khác'), 'Cầu nối Lưu thành từ chối đường dẫn đang mở ở tab khác, không phân biệt hoa thường');

    const savedAsTab = activeProjectTab();
    click(action('new'));
    await waitFor(() => !query('#schematic [data-device]'), 'Canvas chưa trở về dự án trống');
    click(action('open'));
    await waitFor(() => device('source-ac') && device('lamp'), 'Không mở lại được thiết bị đã lưu');
    const roundtripTab = activeProjectTab();
    check(roundtripTab !== savedAsTab && projectTabs().includes(savedAsTab), 'Mở tệp giữ dự án khác đang mở trên tab');
    click(savedAsTab);
    const tabCount = projectTabs().length;
    click(action('open'));
    await waitFor(() => activeProjectTab() === roundtripTab, 'Mở lại cùng tệp chưa chọn đúng tab hiện có');
    check(projectTabs().length === tabCount, 'Mở lại tệp đang mở chuyển đến tab hiện có');
    check(!device('lamp').querySelector('.device-box.is-active'), 'Mở lại dự án và giữ mô phỏng ở trạng thái dừng');
    check(query('#sim-status')?.dataset.mode === 'idle', 'Mở dự án ở chế độ chỉnh sửa');
    click(action('run'));
    await waitFor(() => device('lamp')?.querySelector('.device-box.is-active'), 'Không giữ đủ dây sau khi mở dự án');
    check(true, 'Chạy lại và tái lập đúng trạng thái đèn sau khi mở tệp');
    click(action('pause'));
    for (const format of ['pdf','dwg']) {
      click(action('export-' + format));
      await waitFor(() => query('#status-message').textContent.includes('Đã xuất ' + format.toUpperCase()), 'Xuất ' + format.toUpperCase() + ' chưa thành công: ' + query('#status-message').textContent);
      check(true, 'Xuất ' + format.toUpperCase() + ' từ sơ đồ trong bản Windows');
    }
    const paths = () => [...document.querySelectorAll('#wires-layer [data-wire] .wire-hit')];
    const tapWire = (id, fraction) => {
      const path = paths().find(path => path.parentNode.dataset.wire === id);
      const local = path.getPointAtLength(path.getTotalLength() * fraction);
      const at = local.matrixTransform(path.getScreenCTM());
      path.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, button: 0, pointerId: 1, clientX: at.x, clientY: at.y}));
    };
    const [liveWire, returnWire] = paths().map(path => path.parentNode.dataset.wire);
    click(action('voltmeter'));
    tapWire(liveWire, 0.45);
    pointAt(device('source-ac').querySelector('[data-pin="N"]'));
    check(query('#meter-value').textContent === '230 V AC' && document.querySelectorAll('#probe-layer .meter-probe').length === 2,
      'Vôn kế đo từ giữa dây cấp đến chân N được 230 V AC');
    click(action('ammeter'));
    tapWire(liveWire, 0.65);
    check(query('#meter-note').textContent.includes('Chưa khai báo'), 'Ampe kế báo rõ khi tải chưa có dữ liệu dòng');
    click(action('select'));
    pointAt(device('lamp'));
    const rated = query('#inspector [data-field="operating-current"]');
    rated.value = '0.02';
    rated.dispatchEvent(new Event('change', {bubbles: true}));
    click(action('ammeter'));
    tapWire(returnWire, 0.6);
    check(query('#meter-value').textContent === '20 mA', 'Ampe kế đo giữa dây về được 20 mA theo dòng đèn đã nhập');
    click(action('wire'));
    tapWire(liveWire, 0.45);
    tapWire(returnWire, 0.6);
    check(document.querySelectorAll('#schematic [data-type="junction"]').length === 2 && paths().length === 5,
      'Nối trực tiếp hai đoạn dây sinh hai nút T và một nhánh mới');
    click(action('undo'));
    check(!device('junction') && paths().length === 2, 'Hoàn tác một lần khôi phục cả hai dây nguyên vẹn');
    click(action('select'));
    drop('relay', 0.3, 0.75);
    const master = device('relay').dataset.device;
    drop('contact-no', 0.6, 0.75);
    const link = query('#inspector [data-field="masterId"]');
    link.value = master;
    link.dispatchEvent(new Event('change', {bubbles:true}));
    check(query('#inspector [data-field="tag"]').readOnly, 'Tiếp điểm khóa trường tag sau khi chọn thiết bị chủ');
    pointAt(device('relay'));
    const tag = query('#inspector [data-field="tag"]');
    tag.value = 'K-ĐK2';
    tag.dispatchEvent(new Event('change', {bubbles:true}));
    check(device('contact-no').querySelector('.device-tag').textContent === 'K-ĐK2', 'Đổi tag cuộn đổi ngay tên tiếp điểm trên bản vẽ');
    const {BuzzerAudio} = await import('./signals.mjs');
    const offlineAudio = new OfflineAudioContext(1, 4800, 48000);
    const alarm = new BuzzerAudio();
    alarm.context = {state:'running', currentTime:0, destination: offlineAudio.destination,
      createOscillator: () => offlineAudio.createOscillator(), createGain: () => offlineAudio.createGain()};
    alarm.sync(true);
    const pcm = await offlineAudio.startRendering();
    check(pcm.getChannelData(0).some(sample => Math.abs(sample) > 0.01), 'Bộ phát còi tạo sóng âm thanh trong WebView2');

    for (const slug of ['sump-pit', 'smoke-exhaust']) {
      const example = JSON.parse((await window.desktop.openExample(slug)).text);
      check(example.version === 1 && example.devices.length > 0 && example.scenarios.length > 0, `Tệp mẫu ${slug} tải từ gói Windows`);
      click(action(slug));
      await waitFor(() => query('#document-name').value === example.name, `Không mở được ${slug} từ trình đơn`);
      check(query('#schematic [data-type="mccb-3ph"] .electrical-symbol .symbol-mechanical') &&
        query('#schematic .device-junction') && query('#schematic .wire-bridge-clearance') && query('#schematic .wire-number-mark'),
      `Bản vẽ ${slug} có CB liên động ba cực, nút nối, dây vượt và dấu số dây`);
      if (slug === 'sump-pit') {
        const alternate = query('#schematic [data-device="alt"][data-type="relay-alternate-g4q"]');
        check(alternate?.querySelector('.electrical-symbol .symbol-paper'), 'Mẫu Sump Pit dùng ký hiệu cuộn Omron G4Q-212S');
        pointAt(alternate);
        const hardware = query('#inspector [data-hardware-model]');
        check(['8PFA1', '2–7', '13–14', 'COM 1', 'COM 8', '100 ms'].every(value => hardware?.textContent.includes(value)),
          'Thuộc tính ALT tách chân vật lý, chân trên sơ đồ và thông số xung theo Omron');
      }
      click(query('[data-tab="tests"]'));
      click(action('run-tests'));
      await waitFor(() => query('#scenario-list .scenario-header .status-pass') &&
        query('#scenario-list .scenario-header .status-unverified'), `Kết quả kiểm thử ${slug} chưa hiển thị`);
      check(!query('#scenario-list .status-fail'), `Kiểm thử mẫu ${slug} hiển thị Pass và Chưa xác minh`);
    }
    click(action('pressure-control'));
    await waitFor(() => device('pressure-sensys'), 'Không mở được mạch mẫu áp suất');
    click(action('run'));
    pointAt(device('pressure-sensys'));
    const bar = query('#inspector [data-input-key="pressureBar"]');
    bar.value = '7.5';
    bar.dispatchEvent(new Event('change', {bubbles:true}));
    await waitFor(() => device('lamp').querySelector('.device-box.is-active'), 'Đèn chưa tác động theo cảm biến áp suất');
    check(true, 'Điều chỉnh áp suất thực nghiệm trên giao diện điều khiển được E5EC và đèn qua dây của sơ đồ');
    click(action('pause'));
    drop('weekly-h5s', 0.78, 0.78);
    const weeklyPanel = () => query('#inspector [data-instrument="weekly-h5s"]');
    const weeklyButton = label => [...weeklyPanel().querySelectorAll('button')].find(button => button.textContent === label);
    click(weeklyButton('Thêm chương trình tuần'));
    const scheduleEditor = weeklyPanel().querySelector('[data-schedule-editor]');
    scheduleEditor.querySelector('select:has(option[value="2"])').value = '2';
    scheduleEditor.querySelector('input[type="time"]').value = '00:00';
    click(weeklyButton('Lưu chương trình'));
    check(weeklyPanel().textContent.includes('CH2 · A · 00:00–17:00') && weeklyPanel().textContent.includes('CH2 dùng 2/40 bước'),
      'Thêm lịch ON/OFF cho CH2 của H5S từ bảng thuộc tính và cập nhật bộ đếm bước');
    for (const pin of ['L', 'N']) {
      pointAt(device('source-ac').querySelector('[data-pin="' + pin + '"]'));
      pointAt(device('weekly-h5s').querySelector('[data-pin="' + pin + '"]'));
    }
    click(action('run'));
    await waitFor(() => device('weekly-h5s').querySelector('.device-state')?.textContent.includes('CH1 OFF · CH2 ON'),
      'H5S chưa bật CH2 theo lịch vừa cấu hình');
    check(true, 'H5S có nguồn chạy lịch kênh 2 vào đầu tuần và giữ kênh 1 tắt');
    click(action('pause'));
    pointAt(device('weekly-h5s'));
    const languagePicker = query('#language-selection');
    check(languagePicker.value === 'vi' && document.documentElement.lang === 'vi', 'Giao diện khởi chạy mặc định bằng Tiếng Việt');
    click(weeklyButton('Thêm chương trình tuần'));
    weeklyPanel().querySelector('[data-schedule-editor] input[type="time"]').value = '13:24';
    const beforeLanguage = await window.desktop.getRecovery();
    const originalName = query('#document-name').value;
    const originalTime = query('#virtual-time').textContent;
    for (const [language, runLabel, libraryLabel, parentLabel] of [
      ['en','Run','Device library','Device tag'],
      ['ja','実行','機器ライブラリ','機器タグ'],
    ]) {
      languagePicker.value = language;
      languagePicker.dispatchEvent(new Event('change', {bubbles:true}));
      await waitFor(() => action('run').textContent.trim() === runLabel, 'Không đổi được ngôn ngữ '+language);
      check(query('.palette-pane h2').textContent === libraryLabel &&
        query('#inspector label').textContent.includes(parentLabel) &&
        query('#document-name').value === originalName && query('#virtual-time').textContent === originalTime,
        'Đổi sang '+language+' cập nhật thanh lệnh, thư viện và thuộc tính, giữ tên dự án và thời gian mô phỏng');
      check(query('#palette [data-type="source-ac"]').textContent.includes(language === 'en' ? 'AC control supply' : 'AC制御電源'),
        'Tên thiết bị trong thư viện được dịch sang '+language);
      check(localStorage.getItem('mo-phong-tu-dien-language') === language, 'Lưu lựa chọn ngôn ngữ '+language+' trên máy');
    }
    check(await window.desktop.getRecovery() === beforeLanguage, 'Đổi ngôn ngữ giữ nguyên dữ liệu dự án và trạng thái tự lưu');
    check(weeklyPanel().querySelector('[data-schedule-editor] input[type="time"]').value === '13:24',
      'Đổi ngôn ngữ giữ nội dung chương trình tuần đang nhập chưa lưu');
    click(action('about'));
    const about = query('#about-dialog');
    check(about.open && ['Nguyên Nhân Đức','Công ty TNHH Takasago Vietnam','nhanduc.business@gmail.com']
      .every(text => about.textContent.includes(text)), 'Mục Giới thiệu có đủ tác giả, đơn vị công tác và email góp ý');
    check(query('#about-title').textContent === 'このソフトについて', 'Mục Giới thiệu dùng ngôn ngữ đang chọn');
    click(action('close-about'));
    languagePicker.value = 'vi';
    languagePicker.dispatchEvent(new Event('change', {bubbles:true}));
    await waitFor(() => action('run').textContent.trim() === 'Chạy', 'Không trở về Tiếng Việt');
    check(true, 'Có thể trở về Tiếng Việt ngay trong phiên sử dụng');
    click(action('ats-panel'));
    await waitFor(() => device('phase-relay'), 'Không mở được mạch mẫu ATS từ trình đơn');
    check(query('#schematic [data-type="phase-relay"]'), 'Mạch mẫu ATS có rơ-le giám sát bảo vệ pha');
    const bom = await verifyBomExport();
    await verifyProjectWorkspace(roundtripTab);
    await verifyOu101Templates();
    check(performance.getEntriesByType('resource').every(resource => new URL(resource.name).origin === location.origin),
      'Tất cả tài nguyên giao diện tải từ gói cục bộ');
    check(consoleErrors.length === 0, 'Không có lỗi JavaScript trong các bước kiểm tra');
    return bom;
  }

  run().then((bom) => {
    window.desktopVerification = { ok: true, checks, ...bom };
  }).catch((error) => {
    window.desktopVerification = { ok: false, checks, error: String(error), consoleErrors };
  });
})();
