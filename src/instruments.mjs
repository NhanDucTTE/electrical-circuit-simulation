import {t} from "./i18n.mjs";
import {checkSchedule, clockMinutes, weekDays, weeklyAt} from './weekly.mjs';

const signalGroup = 'Tín hiệu';
const controlGroup = 'Điều khiển';
const pin = (id, side, label = id, domain) => ({id, side, label, domain});
const left = (...ids) => ids.map(id => pin(id, 'left'));
const right = (...ids) => ids.map(id => pin(id, 'right'));
const num = (key, label, min, max, step = 'any') => ({key, label, type: 'number', min, max, step});
const sw = (key, label) => ({key, label, type: 'choice', options: ['AUTO', 'ON', 'OFF']});
const levelInputs = [num('waterLevel', 'Mức trong bể ảo (%)', 0, 100)];
const levelDefaults = {levelInput: 'virtual', waterLevel: 0};
const level = (version, inputs, outputs) => ({
  name: t`Bộ điều khiển mức nước Omron 61F-${version} AC110/220`, group: controlGroup, symbol: `61F-${version}`, tag: 'LC',
  pins: [...left('S0', 'S1', 'S2', ...inputs), ...right(...outputs)], defaults: levelDefaults, inputs: levelInputs,
});

export const INSTRUMENTS = {
  'pressure-sensys': {
    name: 'Cảm biến áp suất nước Sensys M5256-C3079E-010BG', group: signalGroup, symbol: 'P/I', tag: 'PT',
    pins: [pin('+', 'left', 'Loop +'), pin('-', 'right', 'Loop −')], defaults: {pressureBar: 0},
    inputs: [num('pressureBar', 'Áp suất nước (bar)', 0, 10)],
  },
  'rtd-evikon': {
    name: 'Cảm biến nhiệt độ Evikon ET201-D6L130-Pt100-S5-IP68', group: signalGroup, symbol: 'Pt100', tag: 'TE',
    pins: [pin('A', 'left'), pin('B', 'right'), pin('B2', 'right', 'B′')], defaults: {temperatureC: 20},
    inputs: [num('temperatureC', 'Nhiệt độ nước (°C)', -50, 200)],
  },
  'controller-e5ec': {
    name: 'Bộ điều khiển ngõ ra relay Omron E5EC-RX2ASM-800', group: controlGroup, symbol: 'E5EC', tag: 'PIC',
    pins: [pin('L', 'left', '1 AC'), pin('N', 'left', '2 AC'), pin('A', 'left', '22 A/I+'),
      pin('B', 'left', '23 B/I−'), pin('B2', 'left', '24 B′'),
      ...right('3', '4', '11', '12', '9', '10')],
    defaults: {inputMode: '4–20 mA', scaleMin: 0, scaleMax: 10, action: 'direct', setpoint: 5,
      hysteresis: 0.5, alarmHigh: 8, alarmLow: 2}, inputs: [],
  },
  'weekly-h5s': {
    name: 'Timer tuần 2 kênh Omron H5S-WFB2 · 40 bước/kênh', group: controlGroup, symbol: 'H5S', tag: 'TS',
    pins: [pin('L', 'left', '4 AC'), pin('N', 'left', '5 AC'), ...left('6', '7'), ...right('2','3','8','9')],
    defaults: {clockDay: 'T2', clockStart: '00:00', schedule: []},
    inputs: [sw('override1','Chọn chế độ kênh 1'), sw('override2','Chọn chế độ kênh 2')],
  },
  'level-61f-g2': level('G2', ['E1','E2','E3','E4'], ['Ta1','Tc1','Tb1','Ta2','Tc2']),
  'level-61f-g3': level('G3', ['E1','E2','E3','E4','E5'], ['Ta','Tc','Tb','B1','B2','Lc','LH','LL']),
  'transformer-ac': {
    name: 'Bộ nguồn cách ly AC → AC', group: 'Nguồn điện', symbol: 'TR', tag: 'TR',
    pins: [pin('L','left','L','control'), pin('N','left','N','control'),
      pin('X1','right','X1','control'), pin('X2','right','X2','control')],
    defaults: {inputDomain: 'AC220', domain: 'AC110'}, inputs: [],
  },
};

export const instrumentStates = {
  'pressure-sensys': ['powered'], 'rtd-evikon': [],
  'controller-e5ec': ['powered', 'sensorFault', 'alarmHigh', 'alarmLow'],
  'weekly-h5s': ['powered', 'ch1', 'ch2'],
  'level-61f-g2': ['powered','alarmHigh'],
  'level-61f-g3': ['powered','alarmHigh','alarmLow'],
  'transformer-ac': ['powered'],
};

export function instrumentInputs(device) {
  const {type, params} = device;
  if (type === 'pressure-sensys') return {pressureBar: params.pressureBar};
  if (type === 'rtd-evikon') return {temperatureC: params.temperatureC};
  if (type.startsWith('level-61f-')) return {waterLevel: params.waterLevel};
  if (type === 'weekly-h5s') return {override1:'AUTO', override2:'AUTO'};
  return {};
}

export function validateInstrument(device) {
  const {params: p, type} = device;
  if (!Object.hasOwn(INSTRUMENTS, type)) return '';
  for (const input of INSTRUMENTS[type].inputs) {
    if (input.type === 'number' && (!Number.isFinite(p[input.key]) || p[input.key] < input.min || p[input.key] > input.max)) {
      return t`${input.label} phải từ ${input.min} đến ${input.max}.`;
    }
  }
  if (type === 'weekly-h5s') {
    if (!weekDays.includes(p.clockDay) || !Number.isFinite(clockMinutes(p.clockStart))) return t('Ngày và giờ bắt đầu không hợp lệ.');
    return checkSchedule(p.schedule);
  }
  if (type.startsWith('level-61f-') && !['virtual','electrodes'].includes(p.levelInput)) return t('Nguồn tín hiệu mức chưa hợp lệ.');
  if (type === 'transformer-ac' && ![p.inputDomain,p.domain].every(v => /^AC\d+(?:\.\d+)?$/.test(v) && Number(v.slice(2)) > 0)) {
    return t('Điện áp sơ cấp và thứ cấp cần có dạng AC220, AC110 hoặc AC24.');
  }
  if (type === 'controller-e5ec') {
    if (!['4–20 mA','Pt100'].includes(p.inputMode) || !['direct','reverse'].includes(p.action)) return t('Chế độ điều khiển chưa hợp lệ.');
    if (![p.scaleMin,p.scaleMax,p.setpoint,p.hysteresis,p.alarmHigh,p.alarmLow].every(Number.isFinite)
        || p.hysteresis < 0 || p.scaleMax === p.scaleMin || p.alarmHigh < p.alarmLow) return t('Kiểm tra thang đo, ngưỡng báo và độ trễ.');
  }
  return '';
}

export function instrumentPairs(device, state = {}, possible = false) {
  const result = [];
  const contact = (a, b, on) => { if (on || possible) result.push([a, b]); };
  if (device.type === 'controller-e5ec') {
    contact('3','4',state.active);
    contact('11','12',state.alarmHigh);
    contact('9','10',state.alarmLow);
  } else if (device.type === 'weekly-h5s') {
    contact('2','3',state.ch1);
    contact('8','9',state.ch2);
  } else if (device.type === 'level-61f-g2') {
    contact('Tc1','Ta1',state.active);
    contact('Tc1','Tb1',!state.active);
    contact('Tc2','Ta2',state.alarmHigh);
  } else if (device.type === 'level-61f-g3') {
    contact('Tc','Ta',state.active);
    contact('Tc','Tb',!state.active);
    contact('B1','B2',state.alarmHigh || !state.lowRelay);
    contact('Lc','LH',state.alarmHigh);
    contact('Lc','LL',!state.lowRelay);
  }
  return result;
}

// Spare relay throws, selectable taps and unused input modes are valid on these bases.
export function optionalInstrumentPin(device,pin,connected) {
  const {type,params} = device;
  const optionalPair = (a,b) => pin === a && !connected(b) || pin === b && !connected(a);
  if (type === 'controller-e5ec') {
    return (pin === 'B2' && params.inputMode !== 'Pt100') ||
      [['3','4'],['11','12'],['9','10']].some(([a,b]) => optionalPair(a,b));
  }
  if (type === 'weekly-h5s') return [['6','7'],['2','3'],['8','9']].some(([a,b]) => optionalPair(a,b));
  if (!type.startsWith('level-61f-')) return false;
  if (pin === 'S1') return connected('S2');
  if (pin === 'S2') return connected('S1');
  if (pin.startsWith('E')) return params.levelInput !== 'electrodes';
  const throws = type === 'level-61f-g2' ? ['Tc1','Ta1','Tb1'] : ['Tc','Ta','Tb'];
  const spareThrow = (common,no,nc) => pin === no && (!connected(common) || connected(nc)) ||
    pin === nc && (!connected(common) || connected(no)) || pin === common && !connected(no) && !connected(nc);
  return spareThrow(...throws) || (type === 'level-61f-g2' ? optionalPair('Tc2','Ta2')
    : optionalPair('B1','B2') || spareThrow('Lc','LH','LL'));
}

function round(value, places = 6) { return Number(value.toFixed(places)); }

function rtdResistance(t) {
  return round(100 * (1 + 3.9083e-3 * t - 5.775e-7 * t * t + (t < 0 ? -4.183e-12 * (t - 100) * t ** 3 : 0)));
}

// All electrical tests use wire/contact network roots after the current settle pass.
export function evaluateInstrument(device, before, input, env) {
  const {type, params} = device;
  const previous = before[device.id] ?? {};
  if (type === 'rtd-evikon') return {temperatureC: input.temperatureC, resistanceOhm: rtdResistance(input.temperatureC)};
  if (type === 'pressure-sensys') {
    const supply = env.dcSupply(device,'+');
    const candidate = env.receivers.filter(other => other.params.inputMode === '4–20 mA'
      && env.same(device,'-',other,'A') && env.unfed(device,'-') && supply && env.dcReturn(other,'B',supply));
    const direct = supply && env.dcReturn(device,'-',supply);
    const powered = Number.isFinite(input.pressureBar) && Boolean(supply && (direct || candidate.length === 1));
    return {pressureBar: input.pressureBar, powered, active: powered,
      currentMa: powered ? round(4 + 1.6 * input.pressureBar) : null,
      receiverId: powered && !direct ? candidate[0].id : null};
  }
  if (type === 'controller-e5ec') {
    const powered = env.acPair(device,'L','N',85,264);
    const candidates = params.inputMode === '4–20 mA'
      ? env.pressures.filter(other => before[other.id]?.receiverId === device.id && before[other.id]?.powered)
      : env.rtds.filter(other => env.same(device,'A',other,'A') &&
        ((env.same(device,'B',other,'B') && env.same(device,'B2',other,'B2')) ||
         (env.same(device,'B',other,'B2') && env.same(device,'B2',other,'B'))) &&
        !env.same(device,'A',device,'B') && !env.same(device,'A',device,'B2') &&
        !env.same(device,'B',device,'B2') && ['A','B','B2'].every(pin => env.unfed(device,pin)));
    const sensor = candidates.length === 1 ? before[candidates[0].id] : null;
    const raw = !sensor ? null : params.inputMode === 'Pt100' ? sensor.temperatureC :
      params.scaleMin + (sensor.currentMa - 4) * (params.scaleMax - params.scaleMin) / 16;
    const pv = powered && Number.isFinite(raw) ? round(raw) : null;
    let active = false;
    if (pv !== null) {
      if (params.action === 'direct') active = pv <= params.setpoint ? false : pv >= params.setpoint + params.hysteresis ? true : !!previous.active;
      else active = pv >= params.setpoint ? false : pv <= params.setpoint - params.hysteresis ? true : !!previous.active;
    }
    return {powered, sensorFault: powered && pv === null, sensorId: powered && sensor ? candidates[0].id : null, pv, active,
      alarmHigh: pv !== null && pv >= params.alarmHigh, alarmLow: pv !== null && pv <= params.alarmLow};
  }
  if (type === 'weekly-h5s') {
    const powered = env.acPair(device,'L','N',85,264);
    const bank = env.dryClosed(device,'6','7') ? 'B' : 'A';
    const auto = weeklyAt(params,env.time,bank);
    const output = (mode, schedule) => powered && (mode === 'ON' || (mode === 'AUTO' && schedule));
    const ch1 = output(input.override1,auto.ch1);
    const ch2 = output(input.override2,auto.ch2);
    return {powered, bank, ch1, ch2, active: ch1, override1:input.override1, override2:input.override2,
      scheduleDue: powered ? auto.due : null};
  }
  if (type.startsWith('level-61f-')) {
    const tap110 = env.acPair(device,'S0','S1',93.5,121);
    const tap220 = env.acPair(device,'S0','S2',187,242);
    const supplyTap = tap110 && env.unfed(device,'S2') ? 'S1' : tap220 && env.unfed(device,'S1') ? 'S2' : null;
    const powered = supplyTap !== null;
    const g2 = type === 'level-61f-g2';
    const electrodes = g2 ? {E2:25,E1:65,E4:90} : {E4:10,E3:25,E2:65,E1:90};
    const wet = pin => params.levelInput === 'electrodes' ? env.dryClosed(device,pin,g2 ? 'E3' : 'E5') : input.waterLevel >= electrodes[pin];
    const start = wet(g2 ? 'E1' : 'E2');
    const hold = wet(g2 ? 'E2' : 'E3');
    const active = powered && (start || (hold && previous.active === true));
    const alarmHigh = powered && wet(g2 ? 'E4' : 'E1');
    const lowRelay = powered && !g2 && wet('E4');
    return {powered, supplyTap, waterLevel:input.waterLevel, active, alarmHigh,
      ...(g2 ? {} : {lowRelay, alarmLow:powered && !lowRelay})};
  }
  return null;
}
