const local = (vi, en, ja) => ({vi, en, ja});
const languageValue = (value, language) => value[language] ?? value.vi;
const act = (device, key, value) => ({device, key, value});
const drawing = 'Q25-6123-20 · OU-101 · Rev.A · 16/04/2026';
const sourceFile = '21. OU-101 (Rev.A 20260416).pdf';
const powerDomain = '3P380';
const controlDomain = 'AC220';
const branches = [
  {index: 2, branch: 'AC4', sheet: '303', xp: 'XP2', breaker: 'mccb-3ph', breakerTag: 'MCCB-AC4',
    breakerPart: 'ABS103c', breakerRating: 125, contactorPart: 'MC-130a', contactorRating: 130,
    partNumber: 'TPR-3SL130H', ratedCurrentA: 130, ratedPowerKw: 60},
  {index: 3, branch: 'AC5', sheet: '304', xp: 'XP3', breaker: 'breaker-3ph', breakerTag: 'MCB-AC5',
    breakerPart: 'BKJ63N 3P / LA63N 3P', breakerRating: 20, contactorPart: 'MC-18b', contactorRating: 18,
    partNumber: 'TPR-3SL040H', ratedCurrentA: 40, ratedPowerKw: 6},
];

function addBranch({project, device, wire, junction}, branch, row) {
  const {index, branch: title, sheet, xp, partNumber, ratedCurrentA, ratedPowerKw} = branch;
  const key = name => `${title.toLowerCase()}-${name}`;
  const offset = 800 * row;
  const place = (name, type, tag, x, y, params = {}) => device(key(name), type, tag, x, y + offset, params);
  const node = (name, x, y) => junction(key(name), x, y + offset);
  const endpoint = pin => `${key(pin.includes(':') ? pin : `${pin}:J`)}`;
  const link = (from, to, number, ...points) => {
    wire(endpoint(from), endpoint(to), ...points.map(([x, y]) => [x, y + offset]));
    if (number) project.wires.at(-1).label = number;
  };
  const number = suffix => `${index + 10}${String(suffix).padStart(2, '0')}`;
  const pinLabels = {A1: '13', A2: '14'};
  const reference = `${drawing} · ${sheet}`;
  const contact = (name, master, nc, from, to, x, y, label) => place(name,
    nc ? 'contact-nc' : 'contact-no', master, x, y, {
      masterId: key(master),
      pinLabels: nc ? {21: from, 22: to} : {13: from, 14: to},
      ...(label ? {contactLabel: label} : {}),
    });
  const relay = (name, model, x, y, domain = controlDomain) => place(name, 'relay', name, x, y,
    {domain, pinLabels, partNumber: model});
  const lamp = (name, tag, mark, x, y) => place(name, 'lamp', tag, x, y,
    {domain: controlDomain, pinLabels: {A1: 'X1', A2: 'X2'}, lampMark: mark});
  const [autoRelay, runRelay, faultRelay, remoteRelay] = [1, 2, 3, 4].map(n => `${index}R${n}`);

  place('breaker', branch.breaker, branch.breakerTag, 345, 55,
    {domain: powerDomain, partNumber: branch.breakerPart, ratedCurrentA: branch.breakerRating, note: `${title} · ${reference}`});
  place('poles', 'main-3ph', `MC${index}`, 557, 55, {domain: powerDomain, masterId: key('main-coil')});
  place('scr', 'scr-tpr-3sl', `SCR-${index}`, 890, 103,
    {domain: powerDomain, inputDomain: controlDomain, partNumber, ratedCurrentA, note: `HANYOUNG · ${ratedCurrentA} A · ${reference}`});
  place('heater', 'heater-3ph', `HT-${index - 1}`, 1324, 77,
    {domain: powerDomain, ratedPowerKw, commandId: key(runRelay), note: `DX-OHU-101 · ${title} · ${ratedPowerKw} kW · ${reference}`});
  for (const [phase, output] of ['U', 'V', 'W'].entries()) {
    const stemX = 157 + phase * 25;
    const terminal = `xp-${output}`;
    const p = phase + 1;
    const phaseY = 39 + phase * 16;
    node(`bus-${p}`, stemX, phaseY);
    if (!row) wire(`main-bus:L${p}`, endpoint(`bus-${p}`), [stemX, 25 + phase * 16]);
    else wire(`ac4-bus-${p}:J`, endpoint(`bus-${p}`));
    place(terminal, 'terminal', `${xp}-${output}`, 1113, 27 + phase * 50,
      {pinLabels: {1: output, 2: output}});
    link(`bus-${p}`, `breaker:L${p}`);
    link(`breaker:T${p}`, `poles:L${p}`);
    link(`poles:T${p}`, `scr:L${p}`);
    link(`scr:${output}`, `${terminal}:1`);
    link(`${terminal}:2`, `heater:${output}`);
  }

  place('control', 'source-ac', `L1/N-${title}`, 86, 212, {domain: controlDomain});
  place('bus-control-gate', 'contact-no', 'MAIN BUSBAR OU-101', 303, 204,
    {masterId: 'main-bus', masterState: 'powered', contactLabel: 'L1'});
  place('control-gate', 'contact-no', branch.breakerTag, 445, 204,
    {masterId: key('breaker'), masterState: 'closed', contactLabel: 'L1'});
  place('fuse', 'fuse', `FC${index}`, 587, 204, {ratedCurrentA: 6});
  node('live-top', 665, 204);
  node('neutral-top', 1450, 188);
  node('live-permit', 665, 288);
  node('permitted', 817, 288);
  node('neutral-aux', 1450, 248);
  link('control:L', 'bus-control-gate:13');
  link('bus-control-gate:14', 'control-gate:13');
  link('control-gate:14', 'fuse:1');
  link('fuse:2', 'live-top');
  link('control:N', 'neutral-top', null, [146, 220], [146, -23], [1450, -23]);
  link('live-top', 'live-permit');
  link('neutral-top', 'neutral-aux');

  // The 3/4 auxiliary supply and alarm remain live when the MC power poles open.
  node('aux-neutral', 816, 184);
  link('live-top', 'scr:3', null, [665, 162], [806, 162], [806, 87]);
  link('scr:4', 'aux-neutral', number(10), [827, 103], [827, 184]);
  link('aux-neutral', 'neutral-top', null, [816, 188]);
  node('alarm-live', 1020, 204);
  link('live-top', 'alarm-live');
  link('alarm-live', 'scr:8', null, [1020, 111]);
  relay(faultRelay, 'MY4N', 1300, 252);
  link('scr:9', `${faultRelay}:A1`, number(9), [1000, 127], [1000, 252]);
  link(`${faultRelay}:A2`, 'neutral-aux');
  contact('run-scr', runRelay, false, '8', '12', 625, 126);
  link('aux-neutral', 'run-scr:13', number(11), [798, 184], [798, 168], [545, 168], [545, 126]);
  link('run-scr:14', 'scr:6', number(12), [748, 126], [748, 119]);

  contact('permit-nc', faultRelay, true, '1', '9', 735, 288);
  place('mode', 'selector', `AUTO/OFF/MAN-${index}`, 913, 288);
  link('live-permit', 'permit-nc:21');
  link('permit-nc:22', 'permitted', number(1));
  link('permitted', 'mode:COM');
  node('auto', 1000, 324);
  node('auto-run', 1000, 428);
  link('mode:AUTO', 'auto', number(2), [992, 280], [992, 324]);
  link('auto', 'auto-run');
  relay(autoRelay, 'MY2N', 1300, 324);
  node('neutral-branch', 1450, 266);
  node('neutral-auto', 1450, 324);
  link('auto', `${autoRelay}:A1`);
  link(`${autoRelay}:A2`, 'neutral-auto');
  link('neutral-aux', 'neutral-branch');
  link('neutral-branch', 'neutral-auto');

  contact('remote-on', remoteRelay, false, '5', '9', 1085, 428);
  contact('auto-enabled', autoRelay, false, '5', '9', 1240, 428);
  node('request-auto', 1325, 428);
  link('auto-run', 'remote-on:13');
  link('remote-on:14', 'auto-enabled:13', number(3));
  link('auto-enabled:14', 'request-auto');

  place('on-pb', 'push-no', `ON-${index}`, 1085, 503);
  place('off-pb', 'push-nc', `OFF-${index}`, 1240, 503, {pinLabels: {21: '11', 22: '12'}});
  contact('seal', runRelay, false, '5', '9', 1085, 571);
  node('seal-man', 1160, 503);
  node('request-man', 1325, 503);
  link('mode:MAN', 'on-pb:13', number(4), [982, 296], [982, 503]);
  link('on-pb:14', 'seal-man', number(5));
  link('seal-man', 'off-pb:21');
  // The bypass starts at 1201/1301, on the supply side of the mode selector.
  link('permitted', 'seal:13', null, [817, 571]);
  link('seal:14', 'seal-man', null, [1160, 571]);
  link('off-pb:22', 'request-man', number(6));
  link('request-auto', 'request-man');

  node('enable-top', 1325, 568);
  node('enable-mid', 1325, 630);
  node('enable-bottom', 1325, 692);
  node('neutral-enable', 1610, 568);
  node('neutral-coil', 1610, 630);
  node('neutral-on', 1610, 692);
  relay(runRelay, 'MY4N', 1450, 568);
  place('main-coil', 'contactor', `MC${index}`, 1450, 630, {
    domain: controlDomain, pinLabels: {A1: 'A2', A2: 'A1'}, partNumber: branch.contactorPart, ratedCurrentA: branch.contactorRating,
  });
  lamp('on-lamp', `ĐÈN ON-${index}`, 'G', 1450, 692);
  link('request-man', 'enable-top');
  link('enable-top', 'enable-mid');
  link('enable-mid', 'enable-bottom');
  link('neutral-auto', 'neutral-enable', null, [1610, 324]);
  link('neutral-enable', 'neutral-coil');
  link('neutral-coil', 'neutral-on');
  link('enable-top', `${runRelay}:A1`);
  link(`${runRelay}:A2`, 'neutral-enable');
  link('enable-mid', 'main-coil:A1');
  link('main-coil:A2', 'neutral-coil');
  link('enable-bottom', 'on-lamp:A1');
  link('on-lamp:A2', 'neutral-on');

  for (const [label, master, nc, contactPins, color, rowY, line] of [
    ['OFF', runRelay, true, ['2', '10'], 'R', 363, 7],
    ['FAULT', faultRelay, false, ['6', '10'], 'O', 477, 8],
  ]) {
    const id = label.toLowerCase();
    node(`live-${id}`, 365, rowY);
    node(`neutral-${id}`, 788, rowY + 33);
    contact(`${id}-contact`, master, nc, ...contactPins, 505, rowY);
    lamp(`${id}-lamp`, `ĐÈN ${label}-${index}`, color, 505, rowY + 60);
    link(`live-${id}`, `${id}-contact:${nc ? '21' : '13'}`);
    link(`${id}-contact:${nc ? '22' : '14'}`, `${id}-lamp:A1`, number(line),
      [585, rowY], [585, rowY + 30], [428, rowY + 30], [428, rowY + 60]);
    link(`${id}-lamp:A2`, `neutral-${id}`, null, [623, rowY + 60], [623, rowY + 33]);
  }
  link('live-permit', 'live-off', null, [665, 307], [365, 307]);
  link('live-off', 'live-fault');
  link('neutral-branch', 'neutral-off', null, [1355, 266], [1355, 214], [788, 214]);
  link('neutral-off', 'neutral-fault');

  place('remote-supply', 'source-ac', `BMS 24VAC-${index}`, 90, 661, {domain: 'AC24'});
  place('remote', 'dry-contact', `BMS START/STOP-${index}`, 365, 653,
    {pinLabels: {13: 'COMMON', 14: 'AUTO MODE'}});
  relay(remoteRelay, 'MY4N', 590, 653, 'AC24');
  link('remote-supply:L', 'remote:13');
  link('remote:14', `${remoteRelay}:A1`, number(14));
  link('remote-supply:N', `${remoteRelay}:A2`, number(13), [190, 669], [190, 713], [675, 713], [675, 653]);

  // The BMS wires end at floating terminal points; the field-side BMS is outside the cabinet.
  const bmsStates = [['auto', autoRelay, 'AUTO MODE'], ['fault', faultRelay, 'FAULT STATUS'], ['run', runRelay, 'RUN STATUS']];
  for (const [i, [name, master, caption]] of bmsStates.entries()) {
    const y = 625 + 58 * i;
    node(`bms-common-${name}`, 810, y);
    contact(`bms-${name}`, master, false, '8', '12', 944, y, caption);
    node(`bms-out-${name}`, 1077, y);
    link(`bms-common-${name}`, `bms-${name}:13`, i ? null : number(15));
    link(`bms-${name}:14`, `bms-out-${name}`, number(16 + i));
  }
  link('bms-common-auto', 'bms-common-fault');
  link('bms-common-fault', 'bms-common-run');

  return key;
}

function build(circuit, language) {
  const {project, device} = circuit;
  const tr = value => languageValue(value, language);
  device('main-bus', 'source-3ph', 'MAIN BUSBAR OU-101', 74, 33, {domain: powerDomain});
  const [ac4, ac5] = branches.map((branch, row) => addBranch(circuit, branch, row));
  project.metadata = {
    verification: 'unverified',
    references: [{file: sourceFile, pages: `${drawing} · tờ 006, 201, 303, 304`}],
    summary: tr(local('Mẫu mô phỏng hai nhánh gia nhiệt HT-1 và HT-2 theo sơ đồ tủ OU-101 Rev.A.',
      'Simulation of the HT-1 and HT-2 heater branches in OU-101 Rev.A.', 'OU-101 Rev.A のヒーター回路 HT-1・HT-2 をシミュレーションします。')),
    openIssues: [
      tr(local('Tín hiệu điều khiển SCR đặt theo % trong Thuộc tính. Tờ 303/304 ghi 4–20 mA và 1–5 VDC tại SCR, còn đầu ngoài tủ ghi 0–20 mA và 0–10 VDC. Cần xác nhận cách chuyển đổi.',
        'Set the SCR command as a percentage in Properties. Sheets 303/304 label the SCR at 4–20 mA and 1–5 VDC, and the field side at 0–20 mA and 0–10 VDC. The scaling needs confirmation.',
        'SCR 指令はプロパティで百分率を指定します。303・304図のSCR端子は4–20 mAと1–5 VDC、盤外は0–20 mAと0–10 VDCです。変換方式は要確認です。')),
      tr(local('Nguồn L1/N sau CB được biểu diễn bằng nguồn AC220 và tiếp điểm đồng trạng thái với thanh cái và CB. Tín hiệu BMS START/STOP 24VAC dùng công tắc thử.',
        'The L1/N takeoff downstream of each breaker uses an AC220 source with bus- and breaker-linked contacts. BMS START/STOP 24 VAC is a test contact.',
        '遮断器下流のL1/NはAC220電源と母線・遮断器の連動接点で表現しています。BMS START/STOP 24 VACは試験接点です。')),
      tr(local('Theo đường tự giữ 1201/1301, chuyển công tắc sang OFF có thể giữ lệnh chạy. Thử nút OFF sau khi nhánh AUTO đã hở. Cần xác nhận chu trình với hồ sơ điều khiển hiện trường.',
        'The 1201/1301 holding path can keep the run command active after selecting OFF. Test the OFF pushbutton after the AUTO path opens. Confirm the sequence against the field controls.',
        '1201/1301の自己保持経路により、セレクターをOFFにしても運転指令が保持される場合があります。自動回路を開いてからOFFボタンを試験してください。現地制御仕様は要確認です。')),
      tr(local('Mức % biểu diễn lệnh cấp tải; mô hình ghi nhận trạng thái gia nhiệt, góc kích và công suất nhiệt không có trong ca kiểm thử.',
        'The percentage represents the power command. Scenarios observe the heating state; they do not calculate the firing angle or thermal power.',
        '百分率は負荷指令を示します。試験では加熱状態を確認し、点弧角や熱出力の計算は行いません。')),
    ],
  };
  const step = (label, actions, expect) => ({label: tr(label), actions, expect});
  const scenario = (id, name, sheets, steps) => project.scenarios.push({id, name: tr(name), reference: `${drawing} · ${sheets}`, steps});
  const heating = (key, value) => act(key('heater'), 'heating', value);
  const demand = (key, value) => act(key('scr'), 'demandPercent', value);
  const press = (key, deviceName, value) => act(key(deviceName), 'pressed', value);
  const mode = (key, value) => act(key('mode'), 'mode', value);
  const setDemand = local('Đặt yêu cầu gia nhiệt', 'Set the heater demand', '加熱指令を設定');
  const runManual = local('Chọn MAN và nhấn ON', 'Select MAN and press ON', 'MANに切り替えてONを押す');
  scenario('ac4-manual', local('AC4 · Chạy tay, tự giữ và dừng bằng nút OFF', 'AC4 · Manual start, hold and OFF pushbutton', 'AC4 · 手動始動・自己保持・OFFボタン'), '303', [
    step(setDemand, [demand(ac4, 60)], [heating(ac4, false)]),
    step(runManual, [mode(ac4, 'MAN'), press(ac4, 'on-pb', true)], [heating(ac4, true), heating(ac5, false)]),
    step(local('Nhả nút ON', 'Release the ON pushbutton', 'ONボタンを離す'), [press(ac4, 'on-pb', false)],
      [heating(ac4, true), act(ac4('scr'), 'outputPercent', 60)]),
    step(local('Nhấn nút OFF', 'Press the OFF pushbutton', 'OFFボタンを押す'), [press(ac4, 'off-pb', true)],
      [heating(ac4, false), act(ac4('scr'), 'command', false)]),
  ]);
  scenario('ac5-auto-alarm', local('AC5 · Lệnh AUTO, alarm và cắt nhánh độc lập', 'AC5 · Auto command and independent fault shutdown', 'AC5 · 自動運転指令と独立した異常停止'), '303–304', [
    step(runManual, [demand(ac4, 40), mode(ac4, 'MAN'), press(ac4, 'on-pb', true), demand(ac5, 25), mode(ac5, 'AUTO')],
      [heating(ac4, true), heating(ac5, false), act(ac5('bms-auto'), 'closed', true)]),
    step(local('Đóng tiếp điểm thử START/STOP 24VAC cho AC5', 'Close the AC5 24 VAC START/STOP test contact', 'AC5の24 VAC START/STOP試験接点を閉じる'),
      [press(ac4, 'on-pb', false), act(ac5('remote'), 'signal', true)],
      [heating(ac4, true), heating(ac5, true), act(ac5('bms-run'), 'closed', true)]),
    step(local('Gây lỗi SCR-3', 'Trip SCR-3', 'SCR-3をトリップ'), [act(ac5('scr'), 'trip', true)],
      [heating(ac4, true), heating(ac5, false), act(ac5('3R3'), 'powered', true), act(ac5('bms-run'), 'closed', false),
        act(ac5('bms-fault'), 'closed', true), act(ac5('poles'), 'closed', false)]),
    step(local('Bỏ lệnh AUTO rồi reset lỗi', 'Release AUTO demand, then reset the fault', '自動運転指令を解除して異常をリセット'),
      [act(ac5('remote'), 'signal', false), act(ac5('scr'), 'trip', false)],
      [heating(ac4, true), heating(ac5, false), act(ac5('3R3'), 'powered', false)]),
  ]);
}

export const ou101ScrTemplate = {
  id: 'ou101-scr',
  title: local('OU-101 · Mạch SCR gia nhiệt', 'OU-101 · SCR heater circuit', 'OU-101 · SCRヒーター回路'),
  description: local('HT-1 60 kW và HT-2 6 kW · AUTO/MAN, SCR Hanyoung và liên động báo lỗi.',
    'HT-1 60 kW and HT-2 6 kW · AUTO/MAN, Hanyoung SCR units and fault interlocks.',
    'HT-1 60 kW・HT-2 6 kW · 自動/手動、Hanyoung製SCR、異常インターロック。'),
  build,
};
