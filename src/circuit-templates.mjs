import { createDevice, createProject, normalizeProject, SIX_PIN_MOTOR } from './model.mjs';
import { demo01VfdTemplate } from './demo01-vfd.mjs';
import { demo01ScrTemplate } from './demo01-scr.mjs';

const text = (vi, en, ja) => Object.freeze({ vi, en, ja });
const localized = (labels, language) => labels[language] ?? labels.vi;
const starTime = 3000;
const transitionTime = 250;

const templates = [
  {
    id: 'motor-dol',
    title: text('Khởi động trực tiếp động cơ (DOL)', 'Direct-on-line motor starter (DOL)', '電動機の直入れ始動（DOL）'),
    description: text(
      'Mạch START/STOP, tự giữ contactor và bảo vệ quá tải. Nhấn SB1 để chạy, SB0 để dừng.',
      'START/STOP control with a holding contact and overload protection. Press SB1 to start and SB0 to stop.',
      '自己保持と過負荷保護付きの始動・停止回路です。SB1で始動し、SB0で停止します。',
    ),
    build: directStarter,
  },
  {
    id: 'motor-star-delta',
    title: text('Khởi động sao–tam giác động cơ', 'Star–delta motor starter', '電動機のスター・デルタ始動'),
    description: text(
      'Nhấn SB1. Động cơ 6 đầu dây đấu sao trong 3 giây, ngắt 0,25 giây rồi chuyển sang tam giác. Nhấn SB0 để dừng.',
      'Press SB1. The six-terminal motor runs in star for 3 s, disconnects for 0.25 s, then switches to delta. Press SB0 to stop.',
      'SB1を押すと六端子電動機がスター結線で3秒間運転し、0.25秒の開放を経てデルタ結線に切り替わります。SB0で停止します。',
    ),
    build: starDeltaStarter,
  },
  {
    id: 'pump-level',
    title: text('Điều khiển bơm theo mức nước', 'Water-level pump control', '水位によるポンプ制御'),
    description: text(
      'Chọn AUTO trên SA1 để chạy theo phao LS1. MAN chạy bằng tay, OFF dừng bơm.',
      'Select AUTO on SA1 to run from float switch LS1. MAN runs the pump manually and OFF stops it.',
      'SA1をAUTOにするとフロートスイッチLS1で制御します。MANで手動運転し、OFFで停止します。',
    ),
    build: levelPump,
  },
  demo01VfdTemplate,
  demo01ScrTemplate,
];

export const circuitTemplates = Object.freeze(templates.map(({ id, title, description }) =>
  Object.freeze({ id, title, description })));

function diagram(name) {
  const project = createProject(name);
  function device(id, type, tag, x, y, params) {
    const component = createDevice(type, x, y, tag, id);
    Object.assign(component.params, params);
    project.devices.push(component);
  }
  function wire(from, to, ...points) {
    const endpoint = value => {
      const [device, pin] = value.split(':');
      return { device, pin };
    };
    const conductor = {
      id: `w${project.wires.length + 1}`,
      from: endpoint(from), to: endpoint(to),
      ...(points.length ? { points: points.map(([x, y]) => ({ x, y })) } : {}),
    };
    project.wires.push(conductor);
    return conductor;
  }
  return {
    project, device, wire,
    junction: (id, x, y) => device(id, 'junction', id, x, y),
  };
}

function linePower({ device, wire }, type = 'motor') {
  const vertical = { orientation: 'vertical' };
  device('power', 'source-3ph', 'AC1', 240, 70, vertical);
  device('breaker', 'breaker-3ph', 'QF1', 240, 200, vertical);
  device('line-poles', 'main-3ph', 'KM1', 240, 330, { ...vertical, masterId: 'line' });
  device('overload', 'overload', 'FR1', 240, 460, vertical);
  const isSixPin = type === SIX_PIN_MOTOR;
  device('load', type, type === 'pump' ? 'P1' : 'M1', 240, isSixPin ? 645 : 612, {
    ...vertical, commandId: 'line',
  });
  for (const [i, input] of ['U', 'V', 'W'].entries()) {
    const num = i + 1;
    const x = 224 + i * 16;
    wire(`power:L${num}`, `breaker:L${num}`, [x, 135]);
    wire(`breaker:T${num}`, `line-poles:L${num}`, [x, 265]);
    wire(`line-poles:T${num}`, `overload:L${num}`, [x, 395]);
    if (!isSixPin) wire(`overload:T${num}`, `load:${input}`, [x, 535]);
  }
}

function changeoverPower({ device, junction, wire }) {
  device('star-poles', 'main-3ph', 'KM2', 240, 817, { orientation: 'vertical', masterId: 'star' });
  device('delta-poles', 'main-3ph', 'KM3', 416, 635, { masterId: 'delta' });
  junction('star-point', 240, 910);
  for (const [i, phase] of ['U', 'V', 'W'].entries()) {
    const num = i + 1;
    const x = 224 + i * 16;
    const lineY = 540 + i * 16;
    const deltaInputX = 316 + i * 14;
    const deltaPinY = 619 + i * 16;
    junction(`feed-${num}`, x, lineY);
    wire(`overload:T${num}`, `feed-${num}:J`);
    wire(`feed-${num}:J`, `load:${phase}1`);
    wire(`feed-${num}:J`, `delta-poles:L${num}`, [deltaInputX, lineY], [deltaInputX, deltaPinY]);
    const endY = 718 + i * 16;
    junction(`winding-${num}`, x, endY);
    wire(`load:${phase}2`, `winding-${num}:J`);
    wire(`winding-${num}:J`, `star-poles:L${num}`, [x, 756]);
    wire(`star-poles:T${num}`, 'star-point:J', [x, 910]);
  }
  // L1 goes to W2, L2 to U2, and L3 to V2 when the delta poles close.
  for (const [i, endIndex] of [2, 0, 1].entries()) {
    const x = 494 + i * 12;
    wire(`delta-poles:T${i + 1}`, `winding-${endIndex + 1}:J`,
      [x, 619 + i * 16], [x, 718 + endIndex * 16]);
  }
}

function controlSupply({ device, wire }, returnX) {
  device('control', 'source-ac', 'AC2', 550, 84);
  device('stop', 'push-nc', 'SB0', 700, 76);
  device('overload-nc', 'contact-nc', 'FR1', 842, 76, {
    masterId: 'overload', masterState: 'tripped', pinLabels: { 21: '95', 22: '96' },
  });
  device('line', 'contactor', 'KM1', returnX - 112, 220);
  wire('control:L', 'stop:21');
  wire('stop:22', 'overload-nc:21');
}

function manualControl(circuit, withChangeover) {
  const { device, junction, wire } = circuit;
  const returnX = withChangeover ? 1280 : 1030;
  controlSupply(circuit, returnX);
  device('start', 'push-no', 'SB1', 700, 220);
  device('hold', 'contact-no', 'KM1', 700, 320, { masterId: 'line' });
  junction('control-feed', 610, 220);
  junction('run-feed', 790, 220);
  wire('overload-nc:22', 'control-feed:J', [938, 76], [938, 152], [610, 152]);
  wire('control-feed:J', 'start:13');
  wire('control-feed:J', 'hold:13', [610, 320]);
  wire('start:14', 'run-feed:J');
  wire('run-feed:J', 'line:A1');
  if (!withChangeover) {
    wire('hold:14', 'run-feed:J', [790, 320]);
    wire('control:N', 'line:A2', [624, 92], [624, 122], [returnX, 122], [returnX, 220]);
    return;
  }
  junction('run-320', 790, 320);
  wire('hold:14', 'run-320:J');
  wire('run-320:J', 'run-feed:J');
  junction('return-220', returnX, 220);
  wire('control:N', 'return-220:J', [624, 92], [624, 122], [returnX, 122]);
  wire('line:A2', 'return-220:J');
}

function changeoverControl({ device, junction, wire }) {
  device('star-timer', 'timer-on', 'KT1', 1168, 420, { delayMs: starTime });
  device('star-timer-nc', 'contact-nc', 'KT1', 900, 520, { masterId: 'star-timer' });
  device('delta-interlock', 'contact-nc', 'KM3', 1034, 520, { masterId: 'delta' });
  device('star', 'contactor', 'KM2', 1168, 520);
  device('star-timer-no', 'contact-no', 'KT1', 900, 620, { masterId: 'star-timer' });
  device('transfer-timer', 'timer-on', 'KT2', 1168, 620, { delayMs: transitionTime });
  device('transfer-timer-no', 'contact-no', 'KT2', 900, 720, { masterId: 'transfer-timer' });
  device('star-interlock', 'contact-nc', 'KM2', 1034, 720, { masterId: 'star' });
  device('delta', 'contactor', 'KM3', 1168, 720);

  const rungs = [
    [420, ['star-timer:A1', 'star-timer:A2']],
    [520, ['star-timer-nc:21', 'star-timer-nc:22', 'delta-interlock:21', 'delta-interlock:22', 'star:A1', 'star:A2']],
    [620, ['star-timer-no:13', 'star-timer-no:14', 'transfer-timer:A1', 'transfer-timer:A2']],
    [720, ['transfer-timer-no:13', 'transfer-timer-no:14', 'star-interlock:21', 'star-interlock:22', 'delta:A1', 'delta:A2']],
  ];
  let feed = 'run-320:J';
  let neutral = 'return-220:J';
  for (const [y, endpoints] of rungs) {
    junction(`run-${y}`, 790, y);
    junction(`return-${y}`, 1280, y);
    wire(feed, `run-${y}:J`);
    wire(neutral, `return-${y}:J`);
    feed = `run-${y}:J`;
    neutral = `return-${y}:J`;
    wire(feed, endpoints[0]);
    for (let i = 2; i < endpoints.length; i += 2) {
      wire(endpoints[i - 1], endpoints[i], [967 + (i / 2 - 1) * 134, y]);
    }
    wire(endpoints.at(-1), neutral);
  }
}

const circuitSource = text('Thư viện mạch mẫu', 'Sample circuit library', 'サンプル回路ライブラリ');
const pressStart = text('Nhấn START (SB1)', 'Press START (SB1)', 'START（SB1）を押す');
const releaseStart = text('Nhả START (SB1)', 'Release START (SB1)', 'START（SB1）を離す');
const pressStop = text('Nhấn STOP (SB0)', 'Press STOP (SB0)', 'STOP（SB0）を押す');
const tripOverload = text('Tác động rơ-le nhiệt FR1', 'Trip overload relay FR1', '過負荷リレーFR1をトリップさせる');
const action = (device, key, value) => ({ device, key, value });
const loadRunning = value => action('load', 'running', value);
const linePowered = value => action('line', 'powered', value);
const startButton = value => action('start', 'pressed', value);
const stopButton = value => action('stop', 'pressed', value);

function addScenario(project, language, id, name, steps) {
  project.scenarios.push({
    id, name: localized(name, language), reference: localized(circuitSource, language),
    steps: steps.map(step => ({ ...step, label: localized(step.label, language) })),
  });
}

function directStarter(circuit, language) {
  linePower(circuit);
  manualControl(circuit, false);
  addScenario(circuit.project, language, 'start-stop', text('Khởi động, tự giữ và dừng', 'Start, hold, and stop', '始動・自己保持・停止'), [
    { label: pressStart, actions: [startButton(true)], expect: [linePowered(true), loadRunning(true)] },
    { label: releaseStart, actions: [startButton(false)], expect: [linePowered(true), loadRunning(true)] },
    { label: pressStop, actions: [stopButton(true)], expect: [linePowered(false), loadRunning(false)] },
  ]);
  addScenario(circuit.project, language, 'overload-trip', text('Dừng khi quá tải', 'Stop on overload', '過負荷時の停止'), [
    { label: pressStart, actions: [startButton(true)], expect: [loadRunning(true)] },
    { label: releaseStart, actions: [startButton(false)], expect: [loadRunning(true)] },
    { label: tripOverload, actions: [action('overload', 'trip', true)], expect: [linePowered(false), loadRunning(false)] },
  ]);
}

function starDeltaStarter(circuit, language) {
  linePower(circuit, SIX_PIN_MOTOR);
  changeoverPower(circuit);
  manualControl(circuit, true);
  changeoverControl(circuit);
  const star = value => action('star-poles', 'closed', value);
  const delta = value => action('delta-poles', 'closed', value);
  addScenario(circuit.project, language, 'changeover', text('Chuyển mạch sao–tam giác', 'Star–delta changeover', 'スター・デルタ切り替え'), [
    { label: pressStart, atMs: 0, actions: [startButton(true)], expect: [star(true), delta(false), loadRunning(true)] },
    { label: releaseStart, atMs: 100, actions: [startButton(false)], expect: [star(true), delta(false), loadRunning(true)] },
    {
      label: text('Ngắt sao và chờ chuyển mạch', 'Open star and wait before changeover', 'スター接点を開放して切り替えを待つ'),
      atMs: starTime, expect: [star(false), delta(false), linePowered(true), loadRunning(false)],
    },
    {
      label: text('Đóng tam giác', 'Close delta', 'デルタ接点を閉じる'),
      atMs: starTime + transitionTime, expect: [star(false), delta(true), loadRunning(true)],
    },
    { label: pressStop, actions: [stopButton(true)], expect: [star(false), delta(false), loadRunning(false)] },
  ]);
}

function levelPump(circuit, language) {
  linePower(circuit, 'pump');
  const { device, junction, wire } = circuit;
  controlSupply(circuit, 1280);
  device('mode', 'selector', 'SA1', 700, 220);
  device('level', 'float', 'LS1', 900, 220);
  junction('pump-feed', 1010, 220);
  wire('overload-nc:22', 'mode:COM', [938, 76], [938, 152], [610, 152], [610, 220]);
  wire('mode:AUTO', 'level:13', [802, 212], [802, 220]);
  wire('mode:MAN', 'pump-feed:J', [784, 228], [784, 318], [1010, 318]);
  wire('level:14', 'pump-feed:J');
  wire('pump-feed:J', 'line:A1');
  wire('control:N', 'line:A2', [624, 92], [624, 122], [1280, 122], [1280, 220]);

  addScenario(circuit.project, language, 'pump-mode', text('Thử AUTO, MAN và OFF', 'Test AUTO, MAN, and OFF', 'AUTO・MAN・OFFを試験する'), [
    {
      label: text('Chọn AUTO khi phao chưa tác động', 'Select AUTO while the float switch is idle', 'フロート未作動でAUTOを選ぶ'),
      actions: [action('mode', 'mode', 'AUTO')], expect: [loadRunning(false)],
    },
    {
      label: text('Tác động phao LS1', 'Activate float switch LS1', 'フロートスイッチLS1を作動させる'),
      actions: [action('level', 'signal', true)], expect: [loadRunning(true)],
    },
    {
      label: text('Nhả phao LS1', 'Release float switch LS1', 'フロートスイッチLS1を解除する'),
      actions: [action('level', 'signal', false)], expect: [loadRunning(false)],
    },
    {
      label: text('Chọn MAN', 'Select MAN', 'MANを選ぶ'),
      actions: [action('mode', 'mode', 'MAN')], expect: [loadRunning(true)],
    },
    {
      label: text('Chọn OFF', 'Select OFF', 'OFFを選ぶ'),
      actions: [action('mode', 'mode', 'OFF')], expect: [loadRunning(false)],
    },
  ]);
}

export function createCircuitTemplate(id, language = 'vi') {
  const template = templates.find(item => item.id === id);
  if (!template) throw new RangeError(`Unknown circuit template: ${id}`);
  const circuit = diagram(localized(template.title, language));
  template.build(circuit, language);
  return normalizeProject(circuit.project);
}
