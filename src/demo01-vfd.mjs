import { pinLocation } from './schematic.mjs';

const drawing = 'DEMO-ELEC-001 · Rev.A · 16/04/2026';
const title = {
  vi: 'DEMO-01 · Biến tần VFD-1 (AC3)',
  en: 'DEMO-01 · VFD-1 motor circuit (AC3)',
  ja: 'DEMO-01 · VFD-1 インバータ回路（AC3）',
};
const description = {
  vi: 'Tờ 302 · Biến tần LS H100, AUTO/OFF/MAN, DCS START/STOP và dừng báo cháy.',
  en: 'Sheet 302 · LS H100 drive, AUTO/OFF/MAN, DCS START/STOP and fire alarm stop.',
  ja: '図面302 · LS H100、AUTO/OFF/MAN、DCS 始動・停止、火災信号停止。',
};
const sheet302 = {
  vi: `${drawing} · tờ 302 (PDF trang 12)`,
  en: `${drawing} · sheet 302 (PDF page 12)`,
  ja: `${drawing} · 図面302（PDF 12ページ）`,
};
const ac = 'AC220';
const dc = 'DC24';
const power = '3P380';
const vertical = { orientation: 'vertical' };
const pinLabels = (from, to, nc = false) => nc ? { 21: from, 22: to } : { 13: from, 14: to };
const record = (device, key, value) => ({ device, key, value });

function build(c, language) {
  const { project, device, junction, wire } = c;
  const l = (vi, en, ja) => ({ vi, en, ja })[language] ?? vi;
  const local = value => value[language] ?? value.vi;

  function labeled(from, to, label, ...points) {
    wire(from, to, ...points).label = label;
  }
  function contact(id, owner, tag, x, y, from, to, nc = false, masterState = 'active', note) {
    device(id, nc ? 'contact-nc' : 'contact-no', tag, x, y,
      { masterId: owner, masterState, pinLabels: pinLabels(from, to, nc), note });
  }
  function relay(id, tag, x, y, partNumber, domain = ac) {
    device(id, 'relay', tag, x, y, { domain, partNumber, pinLabels: { A1: '13', A2: '14' } });
  }
  function bus(tag, x, ys, upstream) {
    let previous = upstream;
    for (const y of ys) {
      const id = `${tag}-${y}`;
      junction(id, x, y);
      if (previous) wire(previous, `${id}:J`);
      previous = `${id}:J`;
    }
  }
  function pin(endpoint) {
    const [id, terminal] = endpoint.split(':');
    return pinLocation(project.devices.find(d => d.id === id), terminal);
  }
  function throughY(from, to, y) {
    const start = pin(from);
    const end = pin(to);
    wire(from, to, [start.x, y], [end.x, y]);
  }
  project.metadata = {
    verification: 'unverified',
    summary: l(
      'Nhánh AC3 trên tờ 201/302. Mạch mẫu kiểm tra lệnh chạy, dừng, sự cố và phản hồi số của VFD-1.',
      'AC3 branch on sheets 201/302. The model tests VFD-1 run, stop, fault and digital feedback.',
      '図面201/302のAC3分岐。VFD-1の始動・停止・異常・デジタル応答を検証します。',
    ),
    references: [{ file: '21. DEMO-01 (Rev.A 20260416).pdf', pages: l('Tờ 201, 302 · PDF trang 10, 12', 'Sheets 201, 302 · PDF pages 10, 12', '図面201、302 · PDF 10、12ページ') }, drawing],
    openIssues: [
      l('Tờ 302 ghi MCCB ABS103c 3P–60 A; tờ 201 ghi 125AF/63AT. Dòng CB cần xác nhận theo thiết bị thực tế.',
        'Sheet 302 labels ABS103c 3P–60 A, while sheet 201 lists 125AF/63AT. Verify the installed breaker rating.',
        '図面302はABS103c 3極60 A、図面201は125AF/63ATです。設置機器の定格を確認してください。'),
      l('Nguồn LC1 220 V được biểu diễn bằng nguồn riêng có liên động trạng thái đóng của MCCB AC3. Nhánh MC1 được cấp ở AUTO hoặc MAN. Mạch tự giữ MAN được lấy qua ngõ MAN của bộ chọn để thử chế độ OFF.',
        'LC1 220 V is represented by a separate source interlocked with the AC3 breaker. AUTO or MAN energizes MC1. The MAN holding branch is gated by the MAN output to test OFF operation.',
        'LC1 220 VはAC3遮断器と連動する別電源でモデル化しています。MC1はAUTOまたはMANで励磁します。OFF試験用にMANの自己保持はMAN出力を通します。'),
      l('DCS START là tín hiệu duy trì. DCS STOP và FIRE là tín hiệu mô phỏng bên ngoài. VI 0–10 VDC và I2 0–20 mA được ghi theo bản vẽ; đặt tần số trong Thuộc tính để thử đáp ứng. Trạng thái DCS đọc qua relay 1R1/1R3/1R4.',
        'DCS START is maintained. DCS STOP and FIRE are external test signals. VI 0–10 VDC and I2 0–20 mA are shown in the drawing; set frequency in Properties for testing. Read DCS states on 1R1/1R3/1R4.',
        'DCS STARTは保持信号、DCS STOPとFIREは外部試験信号です。VI 0–10 VDCとI2 0–20 mAは図面の表示です。試験周波数はプロパティで設定し、DCS状態は1R1/1R3/1R4で確認します。'),
      l('Bản vẽ chưa nêu số cực động cơ. Mẫu dùng 4 cực mặc định và hiển thị tốc độ đồng bộ ước tính theo tần số.',
        'The drawing does not state the motor pole count. The sample defaults to four poles and displays estimated synchronous speed from frequency.',
        '図面に電動機の極数は記載されていません。サンプルは4極を初期値とし、周波数から推定同期速度を表示します。'),
    ],
  };

  device('busbar', 'source-3ph', 'L1–L3', 185, 80, { ...vertical, domain: power });
  device('breaker', 'mccb-3ph', 'AC3 MCCB', 185, 222, { ...vertical, domain: power, partNumber: 'ABS103c', note: project.metadata.openIssues[0] });
  device('line-poles', 'main-3ph', 'MC1', 185, 364, { ...vertical, domain: power, masterId: 'line', ratedCurrentA: 40 });
  device('drive', 'vfd-ls-h100', 'VFD-1', 185, 529, {
    ...vertical, domain: power, partNumber: 'LSLV0185H100-4COFN', ratedPowerKw: 18.5, motorPoles: 4,
    pinLabels: { L1: 'L1/R', L2: 'L2/S', L3: 'L3/T', V1: 'V1(+)', I2: 'I2(+)' }, note: project.metadata.openIssues[2],
  });
  device('motor', 'motor', 'AC3', 185, 900, { ...vertical, domain: power, ratedPowerKw: 16.34,
    operatingCurrentA: 31, commandId: 'drive', feedbackId: 'run-feedback',
  });
  for (const [i, phase] of ['U', 'V', 'W'].entries()) {
    const n = i + 1;
    const terminal = `xp1-${phase.toLowerCase()}`;
    device(terminal, 'terminal', `XP1-${phase}`, 80 + i * 105, 755, { ...vertical, pinLabels: { 1: phase, 2: phase } });
    wire(`busbar:L${n}`, `breaker:L${n}`);
    wire(`breaker:T${n}`, `line-poles:L${n}`);
    throughY(`line-poles:T${n}`, `drive:L${n}`, 450 + i * 19);
    throughY(`drive:${phase}`, `${terminal}:1`, 640 + i * 19);
    throughY(`${terminal}:2`, `motor:${phase}`, 831 + i * 9);
  }

  device('control', 'source-ac', 'LC1/N1', 449, 76, { domain: ac });
  contact('ac3-permissive', 'breaker', 'AC3 MCCB', 602, 68, '13', '14', false, 'closed', project.metadata.openIssues[1]);
  device('fuse', 'fuse', 'FC1', 750, 68, { ratedCurrentA: 6 });
  const feedX = 844;
  const neutralX = 2016;
  bus('feed', feedX, [68, 170, 267, 390, 495, 590, 685]);
  bus('neutral', neutralX, [267, 390, 495, 590, 770, 892, 1000, 1182]);
  wire('control:L', 'ac3-permissive:13');
  wire('ac3-permissive:14', 'fuse:1');
  wire('fuse:2', 'feed-68:J');
  wire('control:N', 'neutral-267:J', [526, 84], [526, 128], [neutralX, 128]);

  contact('fire-interlock', 'fire-relay', '1R7', 970, 170, '11', '12', true);
  junction('permitted', 1060, 170);
  device('mode', 'selector', 'AUTO/OFF/MAN', 1160, 170);
  wire('feed-170:J', 'fire-interlock:21');
  labeled('fire-interlock:22', 'permitted:J', '1101');
  wire('permitted:J', 'mode:COM');

  device('fire', 'dry-contact', 'FIRE', 1060, 267, { note: l('Tín hiệu báo cháy ngoài tủ.', 'External fire alarm contact.', '盤外の火災警報接点。') });
  relay('fire-relay', '1R7', 1578, 267, 'MY2N');
  wire('feed-267:J', 'fire:13');
  labeled('fire:14', 'fire-relay:A1', '1120');
  wire('fire-relay:A2', 'neutral-267:J');

  contact('aux-mode', 'mode', 'AUTO/OFF/MAN', 1205, 390, '1101', '1102.1', false, 'closed');
  device('line', 'contactor', 'MC1', 1578, 390, { domain: ac, partNumber: 'MC-40a', ratedCurrentA: 40, pinLabels: { A1: 'A2', A2: 'A1' } });
  wire('permitted:J', 'aux-mode:13', [1097, 170], [1097, 390]);
  labeled('aux-mode:14', 'line:A1', '1102.1');
  wire('line:A2', 'neutral-390:J');

  junction('auto-feed', 1245, 495);
  relay('auto-relay', '1R1', 1578, 495, 'MY2N');
  labeled('mode:AUTO', 'auto-feed:J', '1102', [1245, 162]);
  wire('auto-feed:J', 'auto-relay:A1');
  wire('auto-relay:A2', 'neutral-495:J');
  contact('auto-start', 'dcs-start-relay', '1R5', 1352, 660, '5', '9');
  contact('auto-permit', 'auto-relay', '1R1', 1498, 660, '5', '9');
  contact('auto-stop', 'dcs-stop-relay', '1R6', 1644, 660, '9', '1', true);
  junction('run-660', 1744, 660);
  wire('auto-feed:J', 'auto-start:13', [1245, 660]);
  labeled('auto-start:14', 'auto-permit:13', '1103');
  labeled('auto-permit:14', 'auto-stop:21', '1106.2');
  wire('auto-stop:22', 'run-660:J');

  junction('manual-feed', 1272, 770);
  device('manual-on', 'push-no', 'ON', 1370, 770);
  contact('hold', 'run-relay', '1R2', 1370, 845, '5', '9');
  junction('manual-hold', 1463, 770);
  device('manual-off', 'push-nc', 'OFF', 1559, 770, { pinLabels: pinLabels('11', '12', true) });
  contact('manual-stop', 'dcs-stop-relay', '1R6', 1697, 832, '12', '4', true);
  junction('run-770', 1744, 770);
  labeled('mode:MAN', 'manual-feed:J', '1104', [1269, 178], [1269, 735], [1272, 735]);
  wire('manual-feed:J', 'manual-on:13');
  wire('manual-feed:J', 'hold:13', [1272, 845]);
  wire('manual-on:14', 'manual-hold:J');
  labeled('hold:14', 'manual-hold:J', '1105', [1463, 845]);
  wire('manual-hold:J', 'manual-off:21');
  labeled('manual-off:22', 'manual-stop:21', '1106.1', [1628, 770], [1628, 832]);
  wire('manual-stop:22', 'run-770:J', [1774, 832], [1774, 783], [1744, 783]);
  wire('run-660:J', 'run-770:J');

  contact('fault-interlock', 'fault-feedback', '1R3', 1850, 660, '1', '9', true);
  relay('run-relay', '1R2', 1930, 770, 'MY2N');
  labeled('run-660:J', 'fault-interlock:21', '1106');
  labeled('fault-interlock:22', 'run-relay:A1', '1106.3', [1950, 660], [1950, 722], [1798, 722], [1798, 770]);
  wire('run-relay:A2', 'neutral-770:J');

  device('dcs-24v', 'source-dc', 'DCS 24 VDC', 465, 1000, { domain: dc });
  device('dcs-start', 'dry-contact', 'DCS START', 680, 992);
  device('dcs-stop', 'dry-contact', 'DCS STOP', 680, 1106);
  junction('dcs-plus', 565, 992);
  junction('dcs-zero', 988, 992);
  relay('dcs-start-relay', '1R5', 880, 992, 'MY4N', dc);
  relay('dcs-stop-relay', '1R6', 880, 1106, 'MY4N', dc);
  labeled('dcs-24v:+', 'dcs-plus:J', '1113');
  wire('dcs-plus:J', 'dcs-start:13');
  wire('dcs-plus:J', 'dcs-stop:13', [565, 1106]);
  labeled('dcs-start:14', 'dcs-start-relay:A1', '1114');
  labeled('dcs-stop:14', 'dcs-stop-relay:A1', '1114.1');
  wire('dcs-start-relay:A2', 'dcs-zero:J');
  wire('dcs-stop-relay:A2', 'dcs-zero:J', [988, 1106]);
  wire('dcs-24v:-', 'dcs-zero:J', [539, 1008], [539, 1152], [988, 1152]);

  contact('drive-run', 'run-relay', '1R2', 477, 370, '8', '12');
  contact('drive-auto', 'auto-relay', '1R1', 477, 405, '8', '12');
  junction('drive-common', 351, 370);
  const commonPin = pin('drive:CM');
  labeled('drive:CM', 'drive-common:J', '1111', [commonPin.x, 426], [351, 426]);
  wire('drive-common:J', 'drive-run:13');
  wire('drive-common:J', 'drive-auto:13', [351, 405]);
  for (const [i, [from, to, label]] of [['drive-run:14', 'drive:P1', '1112'], ['drive-auto:14', 'drive:P5', '1112.1']].entries()) {
    const dest = pin(to);
    const y = 458 + i * 10;
    labeled(from, to, label, [584 + i * 23, pin(from).y], [584 + i * 23, y], [dest.x, y]);
  }

  relay('fault-feedback', '1R3', 700, 720, 'MY4N');
  relay('run-feedback', '1R4', 700, 820, 'MY4N');
  bus('feedback-return', 784, [720, 820]);
  wire('feedback-return-820:J', 'neutral-1182:J', [784, 1182]);
  for (const [i, [com, output, relayId, label]] of [['C1', 'A1', 'fault-feedback', '1109'], ['C2', 'A2', 'run-feedback', '1110']].entries()) {
    const common = pin(`drive:${com}`);
    const out = pin(`drive:${output}`);
    const track = 586 - i * 23;
    wire(`feed-${590 + 95 * i}:J`, `drive:${com}`, [747, 590 + 95 * i], [747, 608 + i * 19], [common.x, 608 + i * 19]);
    labeled(`drive:${output}`, `${relayId}:A1`, label, [out.x, 665 + i * 31], [track, 665 + i * 31], [track, 720 + i * 100]);
    wire(`${relayId}:A2`, `feedback-return-${720 + i * 100}:J`);
  }

  const lamps = [
    [590, 'run-lamp', 'HL-ON', 'run-feedback', '1R4', '6', '10', '#219653', '1106.4', false],
    [892, 'off-lamp', 'HL-OFF', 'run-feedback', '1R4', '2', '10', '#d32f2f', '1107', true],
    [1000, 'fault-lamp', 'HL-FAULT', 'fault-feedback', '1R3', '6', '10', '#ee8018', '1108', false],
  ];
  bus('lamp-feed', 1115, [590, 892, 1000], 'feed-590:J');
  for (const [y, id, tag, owner, ownerTag, from, to, lampColor, label, nc] of lamps) {
    contact(`${id}-contact`, owner, ownerTag, 1195, y, from, to, nc);
    device(id, 'lamp', tag, 1488, y, { domain: ac, lampColor, pinLabels: { A1: 'X1', A2: 'X2' } });
    wire(`lamp-feed-${y}:J`, `${id}-contact:${nc ? 21 : 13}`);
    labeled(`${id}-contact:${nc ? 22 : 14}`, `${id}:A1`, label);
    wire(`${id}:A2`, `neutral-${y}:J`);
  }

  function scenario(id, name, steps) {
    project.scenarios.push({ id, name, reference: local(sheet302), steps });
  }
  const step = (label, actions, expect) => ({ label, actions, expect });
  const mode = value => record('mode', 'mode', value);
  const pressed = (id, value) => record(id, 'pressed', value);
  const signal = (id, value) => record(id, 'signal', value);
  const running = value => [record('drive', 'running', value), record('motor', 'running', value), record('run-feedback', 'powered', value)];
  const man = [mode('MAN'), pressed('manual-on', true)];
  scenario('demo01-vfd-man', l('MAN · Khởi động, tự giữ và dừng', 'MAN · Start, latch and stop', 'MAN · 始動、自己保持、停止'), [
    step(l('Chọn MAN và nhấn ON', 'Select MAN and press ON', 'MANを選びONボタンを押す'), man, running(true)),
    step(l('Nhả ON', 'Release ON', 'ONボタンを離す'), [pressed('manual-on', false)], running(true)),
    step(l('Nhấn OFF', 'Press OFF', 'OFFボタンを押す'), [pressed('manual-off', true)], running(false)),
  ]);
  scenario('demo01-vfd-auto', l('AUTO · Điều khiển DCS và tần số', 'AUTO · DCS command and frequency', 'AUTO · DCS指令と周波数'), [
    step(l('Chọn AUTO khi chưa có START', 'Select AUTO with START off', 'STARTなしでAUTOを選ぶ'), [mode('AUTO')],
      [...running(false), record('drive', 'autoInput', true)]),
    step(l('Bật DCS START và đặt 35 Hz', 'Enable DCS START and set 35 Hz', 'DCS STARTを有効にし35 Hzに設定'),
      [signal('dcs-start', true), record('drive', 'frequencyHz', 35)],
      [...running(true), record('drive', 'frequency', 35), record('drive', 'speedRpm', 1050)]),
    step(l('Bật DCS STOP', 'Enable DCS STOP', 'DCS STOPを有効にする'), [signal('dcs-stop', true)],
      [...running(false), record('drive', 'frequency', 0), record('drive', 'speedRpm', 0)]),
    step(l('Bỏ START rồi chọn OFF', 'Clear START and select OFF', 'STARTを解除してOFFを選ぶ'),
      [signal('dcs-start', false), signal('dcs-stop', false), mode('OFF')], [...running(false), record('line', 'powered', false)]),
  ]);
  scenario('demo01-vfd-fire-fault', l('Liên động báo cháy và lỗi biến tần', 'Fire alarm interlock and VFD fault', '火災インターロックとインバータ異常'), [
    step(l('Khởi động bằng MAN', 'Start in MAN', 'MANで始動'), man, running(true)),
    step(l('Nhả ON và bật FIRE', 'Release ON and enable FIRE', 'ONを離してFIREを有効にする'),
      [pressed('manual-on', false), signal('fire', true)], [...running(false), record('line', 'powered', false)]),
    step(l('Bỏ tín hiệu FIRE', 'Clear FIRE', 'FIREを解除する'), [signal('fire', false)], running(false)),
    step(l('Khởi động lại bằng ON', 'Restart with ON', 'ONで再始動する'), [pressed('manual-on', true)], running(true)),
    step(l('Nhả ON và tác động Trip VFD-1', 'Release ON and trip VFD-1', 'ONを離してVFD-1をトリップさせる'),
      [pressed('manual-on', false), record('drive', 'trip', true)], [...running(false), record('fault-feedback', 'powered', true), record('fault-lamp', 'active', true)]),
  ]);
}

export const demo01VfdTemplate = { id: 'demo01-vfd', title, description, build };
