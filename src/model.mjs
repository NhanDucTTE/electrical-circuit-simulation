import {t} from "./i18n.mjs";
import {INSTRUMENTS, instrumentStates, optionalInstrumentPin, validateInstrument} from './instruments.mjs';

export const FORMAT_VERSION = 1;

const pin = (id, side, label = id, domain) => ({ id, label, side, domain });
const pair = (a = '1', b = '2') => [pin(a, 'left'), pin(b, 'right')];
const coilPins = [pin('A1', 'left', 'A1', 'control'), pin('A2', 'right', 'A2', 'control')];
const poles = ['L1', 'L2', 'L3'].map(id => pin(id, 'left', id, 'power'))
  .concat(['T1', 'T2', 'T3'].map(id => pin(id, 'right', id, 'power')));
const loads = ['U', 'V', 'W'].map(id => pin(id, 'left', id, 'power'));
export const SIX_PIN_MOTOR = 'motor-6p';
export const MOTOR_WINDINGS = [['U1', 'U2'], ['V1', 'V2'], ['W1', 'W2']];
export const LS_H100 = 'vfd-ls-h100';
export const TPR_3SL = 'scr-tpr-3sl';
export const THREE_PHASE_HEATER = 'heater-3ph';
export const DEFAULT_MOTOR_POLES = 4;
const windingPins = MOTOR_WINDINGS.map(([start]) => pin(start, 'left', start, 'power'))
  .concat(MOTOR_WINDINGS.map(([, end]) => pin(end, 'right', end, 'power')));
const drivePower = ['R', 'S', 'T'].map((label, index) => pin(`L${index + 1}`, 'left', `L${index + 1}/${label}`, 'power'));
const driveOutput = ['U', 'V', 'W'].map(id => pin(id, 'right', id, 'power'));
const boolean = (key, label) => ({ key, label, type: 'boolean' });
const on = boolean('on', 'Đóng');
const trip = boolean('trip', 'Trip');
const pressed = boolean('pressed', 'Nhấn giữ');
const signal = boolean('signal', 'Tín hiệu tác động');
const choice = (key, label, options) => ({ key, label, type: 'choice', options });
const groups = {
  source: 'Nguồn điện',
  protection: 'Bảo vệ',
  control: 'Điều khiển',
  contacts: 'Tiếp điểm',
  io: 'Tín hiệu',
  load: 'Tải',
  connection: 'Đấu nối',
};

function item(name, group, symbol, tag, pins, defaults = {}, inputs = []) {
  return { name, group: groups[group], symbol, tag, pins, defaults, inputs };
}

const linked = { masterId: '', masterState: 'active' };
const loadParameters = { domain: '3P400', commandId: '', feedbackId: '' };

export const CATALOG = {
  'source-ac': item('Nguồn điều khiển AC', 'source', '~', 'AC', [
    pin('L', 'right', 'L', 'control'), pin('N', 'right', 'N', 'control'),
  ], { domain: 'AC230', initial: true }, [on]),
  'source-dc': item('Nguồn điều khiển DC', 'source', '⎓', 'DC', [
    pin('+', 'right', '+', 'control'), pin('-', 'right', '−', 'control'),
  ], { domain: 'DC24', initial: true }, [on]),
  'source-3ph': item('Nguồn động lực 3 pha', 'source', '3~', 'L', [
    pin('L1', 'right', 'L1', 'power'), pin('L2', 'right', 'L2', 'power'), pin('L3', 'right', 'L3', 'power'),
  ], { domain: '3P400', initial: true }, [on]),
  'power-supply-dc': item('Bộ nguồn AC → DC', 'source', 'PS', 'PS', [
    pin('L', 'left', 'L', 'control'), pin('N', 'left', 'N', 'control'),
    pin('+', 'right', '+', 'control'), pin('-', 'right', '−', 'control'),
  ], { inputDomain: 'AC220', domain: 'DC24' }),
  breaker: item('CB một cực', 'protection', 'CB', 'QF', pair(), { initial: true }, [on, trip]),
  mcb: item('MCB một cực', 'protection', 'MCB', 'QF', pair(), { initial: true }, [on, trip]),
  'mcb-2p': item('MCB hai cực', 'protection', 'MCB 2P', 'QF', [
    pin('L', 'left', 'L', 'control'), pin('N', 'left', 'N', 'control'),
    pin('LC', 'right', 'L′', 'control'), pin('NC', 'right', 'N′', 'control'),
  ], { domain: 'AC220', initial: true }, [on, trip]),
  mccb: item('MCCB một cực', 'protection', 'MCCB', 'QF', pair(), { initial: true }, [on, trip]),
  'breaker-3ph': item('CB ba cực', 'protection', 'CB 3P', 'QF', poles,
    { domain: '3P400', initial: true }, [on, trip]),
  'mccb-3ph': item('MCCB ba cực', 'protection', 'MCCB 3P', 'QF', poles,
    { domain: '3P400', initial: true }, [on, trip]),
  fuse: item('Cầu chì', 'protection', 'FU', 'FU', pair(), { initial: true }, [on]),
  overload: item('Rơ-le nhiệt', 'protection', 'OL', 'OL', poles,
    { domain: '3P400', initial: false }, [trip]),
  terminal: item('Terminal', 'connection', 'XT', 'XT', pair()),
  junction: item('Nút nối', 'connection', '●', 'J', [pin('J', 'bottom')]),
  'push-no': item('Nút nhấn NO', 'control', 'NO', 'PB', pair('13', '14'), { initial: false }, [pressed]),
  'push-nc': item('Nút nhấn NC', 'control', 'NC', 'PB', pair('21', '22'), { initial: false }, [pressed]),
  selector: item('Công tắc AUTO / MAN / OFF', 'control', 'SA', 'SA', [
    pin('COM', 'left'), pin('AUTO', 'right'), pin('MAN', 'right'),
  ], { initial: 'OFF' }, [choice('mode', 'Chế độ', ['AUTO', 'MAN', 'OFF'])]),
  relay: item('Cuộn relay', 'control', 'K', 'K', coilPins, { domain: 'AC230' }),
  'relay-alternate': item('Relay luân phiên', 'control', 'ALT', 'ALT', coilPins, { domain: 'AC230', initial: false }),
  'relay-alternate-g4q': {
    ...item('Relay luân phiên Omron G4Q-212S AC220', 'control', 'ALT', 'ALT', coilPins,
      { domain: 'AC220', initial: false, pinLabels: { A1: '2', A2: '7' } }),
    hardware: {
      model: 'Omron G4Q-212S AC220',
      socket: '8PFA1',
      coil: '2–7',
      contactSets: [{ common: '1', no: '3', nc: '4' }, { common: '8', no: '6', nc: '5' }],
      minPulseMs: 100,
      source: 'https://www.ia.omron.com/data_pdf/cat/g4q_ds_e_3_2_csm44.pdf#page=4',
    },
  },
  contactor: item('Cuộn contactor', 'control', 'KM', 'KM', coilPins, { domain: 'AC230' }),
  'contact-no': item('Tiếp điểm phụ NO', 'contacts', 'NO', 'K', pair('13', '14'), linked),
  'contact-nc': item('Tiếp điểm phụ NC', 'contacts', 'NC', 'K', pair('21', '22'), linked),
  'main-no': item('Tiếp điểm chính NO', 'contacts', 'NO', 'KM', pair('13', '14'), linked),
  'main-3ph': item('Tiếp điểm chính 3 pha', 'contacts', 'KM 3P', 'KM', poles,
    { ...linked, domain: '3P400' }),
  'timer-on': item('Timer ON delay', 'control', 'TON', 'KT', coilPins,
    { domain: 'AC230', delayMs: 1000 }),
  'timer-off': item('Timer OFF delay', 'control', 'TOF', 'KT', coilPins,
    { domain: 'AC230', delayMs: 1000 }),
  lamp: item('Đèn báo', 'io', '⊗', 'HL', coilPins, { domain: 'AC230', blink: false }),
  buzzer: item('Còi báo', 'io', 'BZ', 'BZ', coilPins, { domain: 'AC230' }),
  float: item('Phao / tín hiệu mức', 'io', 'LS', 'LS', pair('13', '14'),
    { initial: false, normalClosed: false }, [signal]),
  'dry-contact': item('Tín hiệu khô ngoài tủ', 'io', 'DI', 'DI', pair('13', '14'),
    { initial: false, normalClosed: false }, [signal]),
  pump: item('Bơm 3 pha', 'load', 'P', 'P', loads, loadParameters),
  fan: item('Quạt 3 pha', 'load', 'F', 'F', loads, loadParameters),
  motor: item('Động cơ 3 pha', 'load', 'M', 'M', loads, loadParameters),
  [SIX_PIN_MOTOR]: item('Động cơ 3 pha 6 đầu dây', 'load', 'M', 'M', windingPins, loadParameters),
  [THREE_PHASE_HEATER]: item('Điện trở sấy 3 pha', 'load', 'HT', 'HT', loads, loadParameters),
  'phase-relay': {
    ...item('Rơ-le bảo vệ mất pha / đảo pha', 'protection', 'PR', 'PR', [
      pin('L1', 'left', 'L1', 'power'), pin('L2', 'left', 'L2', 'power'), pin('L3', 'left', 'L3', 'power'),
      pin('11', 'right', '11 COM'), pin('12', 'right', '12 NC'), pin('14', 'right', '14 NO'),
    ], { domain: '3P400', initial: true, faultMode: 'NORMAL' }, [
      on, trip, choice('faultMode', 'Chế độ pha', ['NORMAL', 'LOSS_L1', 'LOSS_L2', 'LOSS_L3', 'REVERSAL']),
    ]),
    hardware: { model: 'Schneider RM4TR / Omron APR-S', powerPins: 'L1-L2-L3 (380-415VAC)', contactSets: [{ common: '11', nc: '12', no: '14' }] },
  },
  vfd: {
    ...item('Biến tần động cơ (Inverter / VFD)', 'control', 'VFD', 'VFD', [
      pin('L1', 'left', 'L1', 'power'), pin('L2', 'left', 'L2', 'power'), pin('L3', 'left', 'L3', 'power'),
      pin('FWD', 'left', 'FWD'), pin('REV', 'left', 'REV'), pin('CM', 'left', 'CM'),
      pin('U', 'right', 'U', 'power'), pin('V', 'right', 'V', 'power'), pin('W', 'right', 'W', 'power'),
      pin('30A', 'right', '30A NO'), pin('30B', 'right', '30B NC'), pin('30C', 'right', '30C COM'),
    ], { domain: '3P400', frequencyHz: 50, motorPoles: DEFAULT_MOTOR_POLES, initial: true }, [
      trip, { key: 'frequencyHz', label: 'Tần số đặt (Hz)', type: 'number', min: 0, max: 60, step: 0.5 },
    ]),
    hardware: { model: 'Inovance MD310 / Schneider Altivar ATV310', powerPins: '3P 380V', faultRelay: '30A-30B-30C' },
  },
  [LS_H100]: {
    ...item('Biến tần LS H100', 'control', 'H100', 'VFD', [
      ...drivePower,
      pin('P1', 'left'), pin('P5', 'left'), pin('CM', 'left'), pin('V1', 'left'), pin('I2', 'left'),
      ...driveOutput,
      pin('C1', 'right'), pin('A1', 'right'), pin('B1', 'right'), pin('C2', 'right'), pin('A2', 'right'),
    ], { domain: '3P400', frequencyHz: 50, motorPoles: DEFAULT_MOTOR_POLES }, [
      trip, { key: 'frequencyHz', label: 'Tần số đặt (Hz)', type: 'number', min: 0, max: 60, step: 0.5 },
    ]),
    hardware: { model: 'LS LSLV0185H100-4COFN' },
  },
  [TPR_3SL]: {
    ...item('Bộ điều khiển công suất SCR Hanyoung TPR-3SL', 'control', 'SCR', 'SCR', [
      ...drivePower,
      pin('3', 'left', '3', 'control'), pin('4', 'left', '4', 'control'), pin('6', 'left'),
      pin('1', 'left', '1 (+)'), pin('2', 'left', '2 (+)'), pin('5', 'left', '5 (−)'),
      ...driveOutput, pin('8', 'right'), pin('9', 'right'), pin('7', 'right'),
    ], { domain: '3P400', inputDomain: 'AC220', demandPercent: 0 }, [
      trip, { key: 'demandPercent', label: 'Mức yêu cầu SCR (%)', type: 'number', min: 0, max: 100, step: 1 },
    ]),
    hardware: { model: 'Hanyoung NUX TPR-3SL' },
  },
  'soft-starter': {
    ...item('Khởi động mềm (Soft Starter)', 'control', 'SST', 'SST', [
      pin('L1', 'left', 'L1', 'power'), pin('L2', 'left', 'L2', 'power'), pin('L3', 'left', 'L3', 'power'),
      pin('RUN', 'left', 'RUN'), pin('STOP', 'left', 'STOP'), pin('COM', 'left', 'COM'),
      pin('T1', 'right', 'T1', 'power'), pin('T2', 'right', 'T2', 'power'), pin('T3', 'right', 'T3', 'power'),
      pin('13', 'right', '13-14 RUN'), pin('14', 'right', '14 RUN'),
      pin('23', 'right', '23-24 BYP'), pin('24', 'right', '24 BYP'),
      pin('95', 'right', '95-96 NC TRIP'), pin('96', 'right', '96 NC TRIP'),
      pin('97', 'right', '97-98 NO TRIP'), pin('98', 'right', '98 NO TRIP'),
    ], { domain: '3P400', rampTimeSec: 5, initial: true }, [
      trip, { key: 'rampTimeSec', label: 'Thời gian khởi động (s)', type: 'number', min: 1, max: 30, step: 1 },
    ]),
    hardware: { model: 'Schneider ATS22 / ABB PSE', powerPins: '3P 380V', bypass: 'Tích hợp bypass contactor' },
  },
  'power-meter': {
    ...item('Đồng hồ đa năng giám sát điện năng', 'io', 'MFM', 'MFM', [
      pin('L1', 'left', 'L1', 'power'), pin('L2', 'left', 'L2', 'power'), pin('L3', 'left', 'L3', 'power'), pin('N', 'left', 'N', 'power'),
      pin('ALM1', 'right', 'ALM1'), pin('ALM2', 'right', 'ALM2'),
    ], { domain: '3P400', initial: true, simulateFault: 'NORMAL' }, [
      choice('simulateFault', 'Mô phỏng điện áp', ['NORMAL', 'UNDER_VOLT', 'OVER_VOLT']),
    ]),
    hardware: { model: 'Selec MFM383A / Schneider PM5000', display: 'V/A/Hz/PF/kW/kwh' },
  },
  ...INSTRUMENTS,
};

export const SOURCE_TYPES = new Set(['source-ac', 'source-dc', 'source-3ph']);
export const ALTERNATE_TYPES = new Set(['relay-alternate', 'relay-alternate-g4q']);
export const COIL_TYPES = new Set(['relay', ...ALTERNATE_TYPES, 'contactor', 'timer-on', 'timer-off', 'lamp', 'buzzer']);
export const LINKED_TYPES = new Set(['contact-no', 'contact-nc', 'main-no', 'main-3ph']);
export const LOAD_TYPES = new Set(['pump', 'fan', 'motor', SIX_PIN_MOTOR, THREE_PHASE_HEATER]);
export const BREAKER_TYPES = new Set(['breaker', 'mccb', 'mcb', 'mcb-2p', 'breaker-3ph', 'mccb-3ph']);
export const THREE_POLE_TYPES = new Set(['breaker-3ph', 'mccb-3ph', 'overload', 'main-3ph']);
export const MASTER_STATES = ['active', 'closed', 'tripped', 'powered', 'ch1', 'ch2', 'alarmHigh', 'alarmLow', 'sensorFault', 'healthy', 'running', 'bypass', 'alarm'];

export function supportsMasterState(type, state) {
  if (Object.hasOwn(INSTRUMENTS, type)) return instrumentStates[type].includes(state) || (state === 'active' && type !== 'rtd-evikon');
  if (type === 'phase-relay') return ['healthy', 'tripped', 'powered', 'active'].includes(state);
  if (type === 'vfd') return ['running', 'tripped', 'powered', 'active'].includes(state);
  if (type === LS_H100 || type === TPR_3SL) return ['running', 'tripped', 'powered', 'command', 'active'].includes(state);
  if (type === 'soft-starter') return ['running', 'bypass', 'tripped', 'powered', 'active'].includes(state);
  if (type === 'power-meter') return ['alarm', 'powered', 'active'].includes(state);
  if (state === 'tripped') return BREAKER_TYPES.has(type) || type === 'overload';
  if (state === 'powered') return SOURCE_TYPES.has(type) || COIL_TYPES.has(type) || type === 'power-supply-dc';
  if (state === 'closed') {
    return BREAKER_TYPES.has(type)
      || ['overload', 'fuse', 'selector', 'push-no', 'push-nc', 'float', 'dry-contact'].includes(type);
  }
  return state === 'active' && !LINKED_TYPES.has(type) && !LOAD_TYPES.has(type)
    && type !== 'terminal' && type !== 'junction' && Object.hasOwn(CATALOG, type);
}

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createProject(name = t('Dự án mới')) {
  return { version: FORMAT_VERSION, name, devices: [], wires: [], scenarios: [] };
}

export function createDevice(type, x = 0, y = 0, tag, id = createId()) {
  if (!Object.hasOwn(CATALOG, type)) throw new Error(t`Loại thiết bị chưa hỗ trợ: ${type}`);
  const definition = CATALOG[type];
  return { id, type, tag: tag ?? definition.tag, x, y, params: structuredClone(definition.defaults) };
}

export function getDeviceInputs(device) {
  if (device.type.startsWith('level-61f-') && device.params.levelInput === 'electrodes') return [];
  return CATALOG[device.type]?.inputs ?? [];
}

export function syncContactTags(devices, preserveLabels = false) {
  const byId = new Map(devices.map(device => [device.id, device]));
  for (const device of devices) {
    if (!LINKED_TYPES.has(device.type)) continue;
    const master = byId.get(device.params?.masterId);
    if (!master || !supportsMasterState(master.type, 'active')) continue;
    if (preserveLabels && device.tag && device.tag !== master.tag && !device.params.contactLabel) {
      device.params.contactLabel = device.tag;
    }
    device.tag = master.tag;
  }
}

export function pinKey(device, pinId) {
  return JSON.stringify([device, pinId]);
}

export function normalizeComponentTag(tag) {
  return tag.trim().replace(/\s+/gu, ' ').toLocaleUpperCase('vi');
}

export function validMotorPoles(poles) {
  return Number.isSafeInteger(poles) && poles > 0 && poles % 2 === 0;
}

function cleanString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function cleanNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function ensureRecord(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(t`${label}: cần một đối tượng.`);
  }
}

function normalizeEndpoint(endpoint) {
  return { device: cleanString(endpoint?.device), pin: cleanString(endpoint?.pin) };
}

function validateScenarioShape(scenario, index) {
  const label = t`Ca kiểm thử ${index + 1}`;
  ensureRecord(scenario, label);
  if (scenario.initial !== undefined && !Array.isArray(scenario.initial)) {
    throw new Error(t`${label}: trạng thái đầu cần là một danh sách thao tác.`);
  }
  if (!Array.isArray(scenario.steps)) throw new Error(t`${label}: thiếu danh sách bước.`);
  for (const [stepIndex, step] of scenario.steps.entries()) {
    const stepLabel = t`${label}, bước ${stepIndex + 1}`;
    ensureRecord(step, stepLabel);
    for (const [key, field] of [['actions', t('thao tác')], ['expect', t('kết quả dự kiến')]]) {
      if (step[key] !== undefined && !Array.isArray(step[key])) {
        throw new Error(t`${stepLabel}: ${field} cần là một danh sách.`);
      }
      for (const record of step[key] ?? []) ensureRecord(record, stepLabel);
    }
  }
  for (const action of scenario.initial ?? []) ensureRecord(action, label);
}

export function normalizeProject(raw) {
  ensureRecord(raw, t('Dự án'));
  if (raw.version !== FORMAT_VERSION) {
    throw new Error(t`Phiên bản định dạng chưa hỗ trợ: ${raw.version ?? t('không có')}.`);
  }
  if (!Array.isArray(raw.devices) || !Array.isArray(raw.wires)) {
    throw new Error(t('Dự án cần danh sách thiết bị và dây.'));
  }
  const devices = raw.devices.map((device, index) => {
    ensureRecord(device, t`Thiết bị ${index + 1}`);
    if (typeof device.id !== 'string' || !device.id) throw new Error(t`Thiết bị ${index + 1} thiếu ID.`);
    const normalized = createDevice(device.type, cleanNumber(device.x), cleanNumber(device.y),
      typeof device.tag === 'string' ? device.tag : undefined, device.id);
    if (device.params && typeof device.params === 'object' && !Array.isArray(device.params)) {
      normalized.params = { ...normalized.params, ...device.params };
    }
    return normalized;
  });
  syncContactTags(devices, true);
  const wires = raw.wires.map((wire, index) => {
    ensureRecord(wire, t`Dây ${index + 1}`);
    if (typeof wire.id !== 'string' || !wire.id) throw new Error(t`Dây ${index + 1} thiếu ID.`);
    const normalized = {
      id: wire.id,
      from: normalizeEndpoint(wire.from),
      to: normalizeEndpoint(wire.to),
    };
    if (typeof wire.label === 'string') normalized.label = wire.label;
    if (Array.isArray(wire.points)) {
      normalized.points = wire.points.filter(point => Number.isFinite(point?.x) && Number.isFinite(point?.y))
        .map(point => ({ x: point.x, y: point.y }));
    }
    return normalized;
  });
  if (new Set(devices.map(device => device.id)).size !== devices.length) throw new Error(t('ID thiết bị bị trùng.'));
  if (new Set(wires.map(wire => wire.id)).size !== wires.length) throw new Error(t('ID dây bị trùng.'));
  if (raw.scenarios !== undefined && !Array.isArray(raw.scenarios)) throw new Error(t('Ca kiểm thử cần là một danh sách.'));
  (raw.scenarios ?? []).forEach(validateScenarioShape);
  const project = {
    ...raw,
    version: FORMAT_VERSION,
    name: cleanString(raw.name, t('Dự án mới')),
    devices,
    wires,
    scenarios: Array.isArray(raw.scenarios) ? structuredClone(raw.scenarios) : [],
  };
  return project;
}

export function parseProject(text) {
  return normalizeProject(JSON.parse(text.replace(/^\uFEFF/, '')));
}

export function serializeProject(project) {
  return `${JSON.stringify(normalizeProject(project), null, 2)}\n`;
}

export function knownDomain(device, pinId) {
  const pin = CATALOG[device.type]?.pins.find(pin => pin.id === pinId);
  if (!pin?.domain) return null;
  const input = ['power-supply-dc','transformer-ac'].includes(device.type) && ['L', 'N'].includes(pinId)
    || device.type === TPR_3SL && ['3', '4'].includes(pinId);
  const key = input ? 'inputDomain' : 'domain';
  const domain = device.params?.[key] ?? CATALOG[device.type].defaults[key];
  return { kind: pin.domain, id: typeof domain === 'string' ? domain.trim() : '' };
}

function optionalDrivePin(type, pin, wired) {
  const relay = (common, no, nc) => pin === common && !wired(no) && !wired(nc)
    || pin === no && (!wired(common) || wired(nc)) || pin === nc && (!wired(common) || wired(no));
  if (type === LS_H100) return ['P5', 'V1', 'I2'].includes(pin) || relay('C1', 'A1', 'B1')
    || pin === 'C2' && !wired('A2') || pin === 'A2' && !wired('C2');
  if (type === TPR_3SL) return ['1', '2', '5'].includes(pin) || relay('8', '9', '7');
  return false;
}

export function validateProject(project) {
  const issues = [];
  const devices = new Map(project.devices.map(device => [device.id, device]));
  const connected = new Set();
  const usedTags = new Map();
  const wirePairs = new Set();
  for (const wire of project.wires) {
    const ends = [wire.from, wire.to];
    const valid = ends.every(end => CATALOG[devices.get(end.device)?.type]?.pins.some(pin => pin.id === end.pin));
    if (!valid) {
      issues.push({ severity: 'error', code: 'invalid-endpoint', wire: wire.id, message: t('Dây có đầu nối không tồn tại.') });
      continue;
    }
    const keys = ends.map(end => pinKey(end.device, end.pin));
    const pairKey = JSON.stringify(keys.slice().sort());
    if (keys[0] === keys[1] || wirePairs.has(pairKey)) {
      issues.push({ severity: 'warning', code: 'duplicate-wire', wire: wire.id, message: t('Dây lặp lại cùng cặp chân.') });
    }
    wirePairs.add(pairKey);
    for (const key of keys) connected.add(key);
    const [fromDomain, toDomain] = ends.map(end => knownDomain(devices.get(end.device), end.pin));
    if (fromDomain && toDomain && (fromDomain.kind !== toDomain.kind || fromDomain.id !== toDomain.id)) {
      issues.push({
        severity: 'error', code: 'domain-mismatch', wire: wire.id,
        message: t`Dây nối hai miền nguồn khác nhau (${fromDomain.id || fromDomain.kind} ↔ ${toDomain.id || toDomain.kind}).`,
      });
    }
  }
  for (const device of project.devices) {
    const definition = CATALOG[device.type];
    if (!definition) {
      issues.push({ severity: 'error', code: 'unknown-device', device: device.id, message: t('Loại thiết bị chưa hỗ trợ.') });
      continue;
    }
    const tag = normalizeComponentTag(device.tag);
    const master = LINKED_TYPES.has(device.type) ? devices.get(device.params?.masterId) : null;
    const tagOwner = master && supportsMasterState(master.type, 'active') ? master.id : device.id;
    const duplicate = tag && usedTags.get(tag);
    if (duplicate && duplicate !== tagOwner) {
      issues.push({ severity: 'warning', code: 'duplicate-tag', device: device.id, message: t`Tag ${device.tag} trùng với thiết bị khác.` });
    } else if (tag) {
      usedTags.set(tag, tagOwner);
    } else {
      issues.push({ severity: 'warning', code: 'missing-tag', device: device.id, message: t('Thiết bị chưa gắn tag.') });
    }
    for (const pin of definition.pins) {
      const wired = id => connected.has(pinKey(device.id,id));
      if (!wired(pin.id) && !optionalInstrumentPin(device,pin.id,wired) && !optionalDrivePin(device.type, pin.id, wired)) {
        issues.push({
          severity: 'warning', code: 'unconnected-pin', device: device.id, pin: pin.id,
          message: t`${device.tag} · Chân ${pin.label} chưa nối.`,
        });
      }
    }
    if (LINKED_TYPES.has(device.type)) {
      const masterId = device.params?.masterId;
      const master = devices.get(masterId);
      if (!master || master.id === device.id || !supportsMasterState(master.type, 'active')) {
        issues.push({
          severity: 'error', code: 'missing-master', device: device.id,
          message: t`${device.tag} · Chưa gán thiết bị chủ hợp lệ.`,
        });
      } else if (!supportsMasterState(master.type, device.params?.masterState ?? 'active')) {
        issues.push({
          severity: 'error', code: 'invalid-master-state', device: device.id,
          message: t`${device.tag} · ${master.tag} không có trạng thái “${device.params.masterState}”.`,
        });
      }
    }
    for (const key of ['domain', 'inputDomain']) {
      const value = device.params?.[key] ?? definition.defaults[key];
      if (Object.hasOwn(definition.defaults, key) && (typeof value !== 'string' || !value.trim())) {
        issues.push({
          severity: 'error', code: 'missing-domain', device: device.id,
          message: t`${device.tag} · Chưa khai báo miền nguồn${key === 'inputDomain' ? t(' đầu vào') : ''}.`,
        });
      }
    }
    const instrumentError = validateInstrument(device);
    if (instrumentError) issues.push({severity: 'error', code:'instrument-config', device:device.id, message: `${device.tag} · ${instrumentError}`});
    if ((device.type === 'vfd' || device.type === LS_H100) && !validMotorPoles(device.params.motorPoles ?? definition.defaults.motorPoles)) {
      issues.push({severity: 'warning', code: 'invalid-motor-poles', device: device.id,
        message: `${device.tag} · ${t('Số cực động cơ phải là số nguyên dương chẵn.')}`});
    }
    if (device.type === LS_H100 || device.type === TPR_3SL) {
      for (const input of definition.inputs.filter(input => input.type === 'number')) {
        const value = device.params[input.key];
        if (!Number.isFinite(value) || value < input.min || value > input.max) {
          issues.push({severity: 'error', code: 'invalid-drive-setpoint', device: device.id,
            message: `${device.tag} · ${t`${t(input.label)} phải từ ${input.min} đến ${input.max}.`}`});
        }
      }
    }
    if (Object.hasOwn(definition.defaults, 'delayMs')) {
      const delay = device.params?.delayMs ?? definition.defaults.delayMs;
      if (!Number.isFinite(delay) || delay < 0) {
        issues.push({
          severity: 'error', code: 'invalid-delay', device: device.id,
          message: t`${device.tag} · Thời gian trễ phải là số hữu hạn và không âm.`,
        });
      }
    }
    if (LOAD_TYPES.has(device.type)) {
      for (const [key, label] of [['commandId', t('lệnh chạy')], ['feedbackId', t('phản hồi chạy')]]) {
        const target = device.params?.[key];
        if (target && (!devices.has(target) || LOAD_TYPES.has(devices.get(target).type))) {
          issues.push({
            severity: 'warning', code: 'missing-link', device: device.id,
            message: t`${device.tag} · Liên kết ${label} không hợp lệ.`,
          });
        }
      }
    }
  }
  return issues;
}
