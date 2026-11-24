import {t} from "./i18n.mjs";
import {
  ALTERNATE_TYPES, BREAKER_TYPES, CATALOG, COIL_TYPES, DEFAULT_MOTOR_POLES, LINKED_TYPES, LOAD_TYPES, LS_H100, MOTOR_WINDINGS, SIX_PIN_MOTOR,
  SOURCE_TYPES, THREE_PHASE_HEATER, THREE_POLE_TYPES, TPR_3SL, getDeviceInputs, knownDomain, normalizeProject,
  pinKey, supportsMasterState, validMotorPoles, validateProject,
} from './model.mjs';
import {INSTRUMENTS, evaluateInstrument, instrumentInputs, instrumentPairs, validateInstrument} from './instruments.mjs';
import {weeklyClock} from './weekly.mjs';

const CONVERTER = 'power-supply-dc';
const converters = new Set([CONVERTER, 'transformer-ac']);
const TIMER_TYPES = new Set(['timer-on', 'timer-off']);
const TERMINALS = {
  'source-ac': [['L', 'supply'], ['N', 'return']],
  'source-dc': [['+', 'supply'], ['-', 'return']],
  'source-3ph': [['L1', 'L1'], ['L2', 'L2'], ['L3', 'L3']],
  [CONVERTER]: [['+', 'supply'], ['-', 'return']],
  'transformer-ac': [['X1','supply'], ['X2','return']],
  vfd: [['U', 'L1'], ['V', 'L2'], ['W', 'L3']],
};
TERMINALS[LS_H100] = TERMINALS.vfd;
const drivePhases = [['L1', 'L1'], ['L2', 'L2'], ['L3', 'L3']];
const scrPoles = [['L1', 'U'], ['L2', 'V'], ['L3', 'W']];
const scrControlSupply = [['3', 'supply'], ['4', 'return']];
const coilRequirements = [['A1', 'supply'], ['A2', 'return']];
const converterRequirements = [['L', 'supply'], ['N', 'return']];
const loadRequirements = [['U', 'L1'], ['V', 'L2'], ['W', 'L3']];
const windingRequirements = MOTOR_WINDINGS.map(([start], index) => [start, `L${index + 1}`]);
const statusText = {
  active: ['nhả / tắt', 'tác động'],
  powered: ['mất cấp điện', 'có cấp điện'],
  closed: ['mở', 'đóng'],
  command: ['bỏ lệnh chạy', 'có lệnh chạy'],
  running: ['dừng', 'chạy'],
  feedback: ['mất phản hồi chạy', 'có phản hồi chạy'],
  tripped: ['đã reset', 'trip'],
  healthy: ['lỗi pha', 'pha bình thường'],
  alarm: ['bình thường', 'cảnh báo điện áp'],
};

function equivalent(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

class Networks {
  constructor(keys) {
    this.parent = new Map(keys.map(key => [key, key]));
  }

  find(key) {
    if (!this.parent.has(key)) return undefined;
    let root = key;
    while (root !== this.parent.get(root)) root = this.parent.get(root);
    while (key !== root) {
      const next = this.parent.get(key);
      this.parent.set(key, root);
      key = next;
    }
    return root;
  }

  join(left, right) {
    const a = this.find(left);
    const b = this.find(right);
    if (a !== undefined && b !== undefined && a !== b) this.parent.set(a, b);
  }
}

export function truePairs(device, state, possible = false) {
  const type = device.type;
  if (Object.hasOwn(INSTRUMENTS,type)) return instrumentPairs(device, state, possible);
  if (type === 'phase-relay') {
    if (possible) return [['11', '14'], ['11', '12']];
    return state?.healthy ? [['11', '14']] : [['11', '12']];
  }
  if (type === 'vfd') {
    if (possible) return [['30C', '30A'], ['30C', '30B']];
    return state?.tripped ? [['30C', '30A']] : [['30C', '30B']];
  }
  if (type === LS_H100) {
    if (possible) return [['C1', 'A1'], ['C1', 'B1'], ['C2', 'A2']];
    const pairs = [state?.powered && state?.tripped ? ['C1', 'A1'] : ['C1', 'B1']];
    if (state?.running) pairs.push(['C2', 'A2']);
    return pairs;
  }
  if (type === TPR_3SL) {
    if (possible) return [...scrPoles, ['8', '9'], ['8', '7']];
    const pairs = [state?.controlPowered && state?.tripped ? ['8', '9'] : ['8', '7']];
    if (state?.running) pairs.push(...scrPoles);
    return pairs;
  }
  if (type === 'soft-starter') {
    if (possible) return [['L1', 'T1'], ['L2', 'T2'], ['L3', 'T3'], ['13', '14'], ['23', '24'], ['95', '96'], ['97', '98']];
    const pairs = [];
    if (state?.running) pairs.push(['L1', 'T1'], ['L2', 'T2'], ['L3', 'T3'], ['13', '14'], ['23', '24']);
    if (state?.tripped) pairs.push(['97', '98']);
    else pairs.push(['95', '96']);
    return pairs;
  }
  if (type === 'power-meter') {
    if (possible) return [['ALM1', 'ALM2']];
    return state?.alarm ? [['ALM1', 'ALM2']] : [];
  }
  if (type === 'selector') {
    const modes = possible ? ['AUTO', 'MAN'] : [state?.mode];
    return modes.filter(mode => mode === 'AUTO' || mode === 'MAN').map(mode => ['COM', mode]);
  }
  if (!possible && !state?.closed && type !== 'terminal') return [];
  if (THREE_POLE_TYPES.has(type)) return [['L1', 'T1'], ['L2', 'T2'], ['L3', 'T3']];
  if (type === 'mcb-2p') return [['L', 'LC'], ['N', 'NC']];
  if (type === 'terminal' || type === 'fuse' || BREAKER_TYPES.has(type)) return [['1', '2']];
  if (['push-nc', 'contact-nc'].includes(type)) return [['21', '22']];
  if (LINKED_TYPES.has(type) || ['push-no', 'float', 'dry-contact'].includes(type)) return [['13', '14']];
  return [];
}

function publicToken(token) {
  const kind = token.role === 'supply' ? 'live' : token.role === 'return' ? 'return' : 'phase';
  return { kind, label: `${token.pin} · ${token.domain}`, domain: token.domain, source: token.source };
}

function initialInput(device) {
  const params = device.params;
  if (Object.hasOwn(INSTRUMENTS,device.type)) return instrumentInputs(device);
  if (device.type === 'phase-relay') {
    return { on: params.initial !== false, trip: false, faultMode: params.faultMode ?? 'NORMAL' };
  }
  if (device.type === 'vfd' || device.type === LS_H100) {
    return { trip: false, frequencyHz: params.frequencyHz ?? 50 };
  }
  if (device.type === TPR_3SL) return { trip: false, demandPercent: params.demandPercent };
  if (device.type === 'soft-starter') {
    return { trip: false, rampTimeSec: params.rampTimeSec ?? 5 };
  }
  if (device.type === 'power-meter') {
    return { simulateFault: params.simulateFault ?? 'NORMAL' };
  }
  if (SOURCE_TYPES.has(device.type) || BREAKER_TYPES.has(device.type) || device.type === 'fuse') {
    return { on: params.initial !== false, ...(BREAKER_TYPES.has(device.type) ? { trip: false } : {}) };
  }
  if (device.type === 'overload') return { trip: params.initial === true };
  if (device.type === 'selector') {
    const mode = ['AUTO', 'MAN', 'OFF'].includes(params.initial) ? params.initial : 'OFF';
    return { mode };
  }
  if (device.type === 'push-nc' || device.type === 'push-no') return { pressed: params.initial === true };
  if (device.type === 'float' || device.type === 'dry-contact') return { signal: params.initial === true };
  return {};
}

function sourceTerms(device) {
  return (TERMINALS[device.type] ?? []).map(([pin, role]) => ({
    source: device.id, pin, role, domain: knownDomain(device, pin)?.id ?? '',
  }));
}

function availability(inputs, state, device) {
  if (device.type === 'vfd' || device.type === LS_H100) return state[device.id]?.running === true;
  return converters.has(device.type) ? state[device.id]?.powered === true : inputs.get(device.id)?.on === true;
}

function associatedValue(state) {
  return state?.signal ?? state?.running ?? state?.active ?? state?.closed ?? null;
}

function driveSpeed(frequency, poles) {
  return { frequency, speedRpm: 120 * frequency / (validMotorPoles(poles) ? poles : DEFAULT_MOTOR_POLES) };
}

export class Simulator {
  constructor(project, initialActions = []) {
    this.project = normalizeProject(project);
    this.devices = new Map(this.project.devices.map(device => [device.id, device]));
    this.pinKeys = this.project.devices.flatMap(device => CATALOG[device.type].pins.map(pin => pinKey(device.id, pin.id)));
    this.sources = this.project.devices.filter(device => Object.hasOwn(TERMINALS, device.type));
    const byType = type => this.project.devices.filter(device => device.type === type);
    this.receivers = byType('controller-e5ec');
    this.pressures = byType('pressure-sensys');
    this.rtds = byType('rtd-evikon');
    this.weeklyTimers = byType('weekly-h5s');
    this.staticIssues = validateProject(this.project);
    this.injectedFaults = new Set();
    this.reset(initialActions);
  }

  reset(initialActions = []) {
    this.time = 0;
    this.halted = false;
    this.log = [];
    this.injectedFaults = new Set();
    this.inputs = new Map(this.project.devices.map(device => [device.id, initialInput(device)]));
    this.state = Object.create(null);
    this.memory = new Map(this.project.devices
      .filter(device => TIMER_TYPES.has(device.type) || ALTERNATE_TYPES.has(device.type))
      .map(device => [device.id, {
        active: ALTERNATE_TYPES.has(device.type) && device.params.initial === true,
        powered: false,
        due: null,
      }]));
    for (const prepared of initialActions.map(action => this.#prepareInput(action))) this.#setInput(prepared);
    this.#settle();
    return this.snapshot();
  }

  injectFault(faultType) {
    this.injectedFaults.add(faultType);
    this.#settle();
  }

  clearFault(faultType) {
    this.injectedFaults.delete(faultType);
    this.#settle();
  }

  clearAllFaults() {
    this.injectedFaults.clear();
    this.#settle();
  }

  getInjectedFaults() {
    return Array.from(this.injectedFaults);
  }

  #addLog(tag, event, reason, device) {
    this.log.push({ time: this.time, tag, event, reason, ...(device ? { device } : {}) });
  }

  #buildNetwork(state) {
    const networks = new Networks(this.pinKeys);
    const errors = [];
    for (const wire of this.project.wires) {
      networks.join(pinKey(wire.from.device, wire.from.pin), pinKey(wire.to.device, wire.to.pin));
    }
    for (const device of this.project.devices) {
      for (const [a, b] of truePairs(device, state[device.id])) {
        networks.join(pinKey(device.id, a), pinKey(device.id, b));
      }
    }
    const values = new Map();
    for (const source of this.sources) {
      if (!availability(this.inputs, state, source)) continue;
      for (const token of sourceTerms(source)) {
        const root = networks.find(pinKey(source.id, token.pin));
        if (!values.has(root)) values.set(root, []);
        values.get(root).push(token);
      }
    }
    const classes = new Map();
    for (const device of this.project.devices) {
      for (const pin of CATALOG[device.type].pins) {
        const domain = knownDomain(device, pin.id);
        if (!domain?.id) continue;
        const root = networks.find(pinKey(device.id, pin.id));
        if (!classes.has(root)) classes.set(root, new Map());
        const group = classes.get(root);
        group.set(`${domain.kind} · ${domain.id}`, device.id);
      }
    }
    for (const [root, group] of classes) {
      if (group.size < 2) continue;
      errors.push({
        severity: 'error', code: 'network-domain-mismatch', device: [...group.values()].at(-1),
        message: t`Mạng nối các miền nguồn khác nhau (${[...group.keys()].join(' ↔ ')}).`,
      });
    }
    for (const [root, tokens] of values) {
      if (tokens.length < 2) continue;
      const description = tokens.map(token => `${this.devices.get(token.source).tag} ${token.pin}`).join(' ↔ ');
      const wire = this.project.wires.find(wire => networks.find(pinKey(wire.from.device, wire.from.pin)) === root);
      errors.push({
        severity: 'error', code: 'opposed-sources', wire: wire?.id, device: tokens[0].source,
        message: t`Đối nghịch nguồn trong cùng mạng: ${description}.`,
      });
    }
    const network = { networks, values, classes, errors };
    if (this.project.devices.some(d => Object.hasOwn(INSTRUMENTS,d.type))) network.instruments = this.#instrumentEnvironment(network);
    return network;
  }

  #instrumentEnvironment(network) {
    const root = (d,pin) => network.networks.find(pinKey(d.id,pin));
    const tokens = (d,pin) => network.values.get(root(d,pin)) ?? [];
    const same = (a,p,b,q) => root(a,p) === root(b,q);
    const unfed = (d,pin) => tokens(d,pin).length === 0;
    const single = (d,pin) => {
      const ts = tokens(d,pin);
      return ts.length === 1 && !(network.classes.get(root(d,pin))?.size > 1) ? ts[0] : null;
    };
    const acPair = (d,a,b,min,max) => {
      const x = single(d,a), y = single(d,b);
      if (!x || !y || x.source !== y.source || x.role === y.role || x.domain !== y.domain || !/^AC\d+(?:\.\d+)?$/.test(x.domain)) return false;
      const v = Number(x.domain.slice(2));
      return v >= min && v <= max;
    };
    const dcSupply = (d,pin) => {
      const t = single(d,pin);
      const volts = /^DC\d+(?:\.\d+)?$/.test(t?.domain) ? Number(t.domain.slice(2)) : NaN;
      return t?.role === 'supply' && volts >= 9 && volts <= 30 ? t : null;
    };
    const dcReturn = (d,pin,s) => {
      const t = single(d,pin);
      return t?.role === 'return' && t.source === s.source && t.domain === s.domain;
    };
    return {time:this.time, receivers:this.receivers, pressures:this.pressures, rtds:this.rtds,
      same, unfed, acPair, dcSupply, dcReturn, dryClosed:(d,a,b) => same(d,a,d,b) && unfed(d,a)};
  }

  #tokens(network, deviceId, pin) {
    return network.values.get(network.networks.find(pinKey(deviceId, pin))) ?? [];
  }

  #continuity(device, network, a, b, dry = false) {
    const root = network.networks.find(pinKey(device.id, a));
    return root !== undefined && root === network.networks.find(pinKey(device.id, b))
      && (!dry || !network.values.has(root));
  }

  #measure(device, requirements, network, allowPermutedPhases = false) {
    const tokens = [];
    for (const [pin, role] of requirements) {
      const root = network.networks.find(pinKey(device.id, pin));
      const candidates = network.values.get(root) ?? [];
      if (candidates.length !== 1 || network.classes.get(root)?.size > 1) return false;
      const token = candidates[0];
      const matchesRole = allowPermutedPhases ? /^L[123]$/.test(token.role) : token.role === role;
      if (!matchesRole || !token.domain || token.domain !== knownDomain(device, pin)?.id) return false;
      tokens.push(token);
    }
    return tokens.every(token => token.source === tokens[0].source)
      && (!allowPermutedPhases || new Set(tokens.map(token => token.role)).size === requirements.length);
  }

  #motorConnection(device, network) {
    if (!this.#measure(device, windingRequirements, network, true)) return null;
    const rootOf = pin => network.networks.find(pinKey(device.id, pin));
    const starts = MOTOR_WINDINGS.map(([start]) => rootOf(start));
    const ends = MOTOR_WINDINGS.map(([, end]) => rootOf(end));
    const star = ends[0];
    if (ends.every(root => root === star) && !network.values.has(star)
      && !(network.classes.get(star)?.size > 1)) return 'star';
    const delta = [1, 2].some(offset => ends.every((root, index) => root === starts[(index + offset) % starts.length]));
    return delta ? 'delta' : null;
  }

  #evaluate(device, before, network) {
    const input = this.inputs.get(device.id);
    const { type, params } = device;
    if (SOURCE_TYPES.has(type)) return { on: input.on, powered: input.on, active: input.on };
    if (converters.has(type)) {
      const powered = type === CONVERTER ? this.#measure(device, converterRequirements, network)
        : !validateInstrument(device) && network.instruments.acPair(device,'L','N',Number(params.inputDomain.slice(2)),Number(params.inputDomain.slice(2)));
      return { powered, active: powered };
    }
    if (Object.hasOwn(INSTRUMENTS,type)) return evaluateInstrument(device,before,input,network.instruments);
    if (BREAKER_TYPES.has(type)) {
      const closed = input.on && !input.trip;
      return { on: input.on, tripped: input.trip, closed, active: closed };
    }
    if (type === 'fuse') return { on: input.on, closed: input.on, active: input.on };
    if (type === 'overload') return { tripped: input.trip, closed: !input.trip, active: input.trip };
    if (type === 'terminal' || type === 'junction') return { closed: true };
    if (type === 'selector') return { mode: input.mode, closed: input.mode !== 'OFF', active: input.mode !== 'OFF' };
    if (type === 'push-no' || type === 'push-nc') {
      return { pressed: input.pressed, closed: type === 'push-no' ? input.pressed : !input.pressed, active: input.pressed };
    }
    if (type === 'float' || type === 'dry-contact') {
      return { signal: input.signal, closed: input.signal !== (params.normalClosed === true), active: input.signal };
    }
    if (LINKED_TYPES.has(type)) {
      const stateKey = params.masterState ?? 'active';
      const deviceType = this.devices.get(params.masterId)?.type;
      const master = supportsMasterState(deviceType, stateKey) ? before[params.masterId] : null;
      const engaged = master?.[stateKey] === true;
      const closed = Boolean(master) && (type === 'contact-nc' ? !engaged : engaged);
      return { closed, active: closed, masterId: params.masterId };
    }
    if (COIL_TYPES.has(type)) {
      const powered = this.#measure(device, coilRequirements, network);
      const memory = this.memory.get(device.id);
      const state = { powered, active: memory ? memory.active : powered };
      if (TIMER_TYPES.has(type)) state.pendingUntil = memory.due;
      return state;
    }
    if (LOAD_TYPES.has(type)) {
      const sixPin = type === SIX_PIN_MOTOR;
      const connection = sixPin ? this.#motorConnection(device, network) : null;
      const powered = sixPin ? connection !== null : this.#measure(device, loadRequirements, network, true);
      return {
        powered, running: powered, active: powered,
        command: associatedValue(before[params.commandId]),
        feedback: associatedValue(before[params.feedbackId]),
        ...(sixPin ? { connection } : {}),
        ...(type === THREE_PHASE_HEATER ? { heating: powered } : {}),
      };
    }
    if (type === 'phase-relay') {
      const hasL1 = !this.injectedFaults?.has('phase-loss-L1') && input.faultMode !== 'LOSS_L1';
      const hasL2 = !this.injectedFaults?.has('phase-loss-L2') && input.faultMode !== 'LOSS_L2';
      const hasL3 = !this.injectedFaults?.has('phase-loss-L3') && input.faultMode !== 'LOSS_L3';
      const reversal = input.faultMode === 'REVERSAL' || this.injectedFaults?.has('phase-reversal');
      const phaseOk = hasL1 && hasL2 && hasL3 && !reversal;
      const phaseReq = [['L1', 'L1'], ['L2', 'L2'], ['L3', 'L3']];
      const hasPower = this.#measure(device, phaseReq, network, false);
      const isTripped = Boolean(input.trip) || !phaseOk;
      const healthy = hasPower && !isTripped && input.on !== false;
      return { powered: hasPower, healthy, tripped: !healthy, active: healthy, closed: healthy };
    }
    if (type === 'vfd') {
      const hasPower = this.#measure(device, [['L1', 'L1'], ['L2', 'L2'], ['L3', 'L3']], network, true);
      const rootFwd = network.networks.find(pinKey(device.id, 'FWD'));
      const rootCm = network.networks.find(pinKey(device.id, 'CM'));
      const fwdActive = rootFwd !== undefined && rootFwd === rootCm;
      const isTripped = Boolean(input.trip) || this.injectedFaults?.has('vfd-fault');
      const running = hasPower && fwdActive && !isTripped;
      return {
        powered: hasPower, running, tripped: isTripped,
        ...driveSpeed(running ? (input.frequencyHz ?? 50) : 0, params.motorPoles),
        active: running, closed: running,
      };
    }
    if (type === LS_H100) {
      const powered = this.#measure(device, drivePhases, network, true);
      const command = this.#continuity(device, network, 'P1', 'CM', true);
      const autoInput = this.#continuity(device, network, 'P5', 'CM', true);
      const tripped = Boolean(input.trip) || this.injectedFaults.has('vfd-fault');
      const setpoint = Number.isFinite(input.frequencyHz) && input.frequencyHz <= 60 ? input.frequencyHz : 0;
      const running = powered && command && !tripped && setpoint > 0;
      return { powered, command, autoInput, running, tripped, ...driveSpeed(running ? setpoint : 0, params.motorPoles), active: running };
    }
    if (type === TPR_3SL) {
      const controlPowered = this.#measure(device, scrControlSupply, network);
      const powered = controlPowered && this.#measure(device, drivePhases, network, true);
      const command = this.#continuity(device, network, '4', '6');
      const tripped = Boolean(input.trip);
      const demandPercent = Number.isFinite(input.demandPercent) && input.demandPercent >= 0 && input.demandPercent <= 100 ? input.demandPercent : 0;
      const running = powered && command && !tripped && demandPercent > 0;
      return { powered, controlPowered, command, running, tripped, demandPercent,
        outputPercent: running ? demandPercent : 0, active: running };
    }
    if (type === 'soft-starter') {
      const hasPower = this.#measure(device, [['L1', 'L1'], ['L2', 'L2'], ['L3', 'L3']], network, true);
      const rootRun = network.networks.find(pinKey(device.id, 'RUN'));
      const rootCom = network.networks.find(pinKey(device.id, 'COM'));
      const runActive = rootRun !== undefined && rootRun === rootCom;
      const isTripped = Boolean(input.trip) || this.injectedFaults?.has('sst-fault');
      const running = hasPower && runActive && !isTripped;
      return { powered: hasPower, running, bypass: running, tripped: isTripped, active: running, closed: running };
    }
    if (type === 'power-meter') {
      const hasPower = this.#measure(device, [['L1', 'L1'], ['L2', 'L2'], ['L3', 'L3']], network, true);
      const isPhaseLoss = this.injectedFaults?.has('loss-l1') || this.injectedFaults?.has('loss-l2') || this.injectedFaults?.has('loss-l3');
      const isFault = input.simulateFault === 'UNDER_VOLT' || input.simulateFault === 'OVER_VOLT' || this.injectedFaults?.has('undervoltage') || isPhaseLoss;
      const alarm = !hasPower || isFault;
      return {
        powered: hasPower, alarm, active: hasPower && !alarm,
        voltage: hasPower ? (input.simulateFault === 'UNDER_VOLT' ? 310 : input.simulateFault === 'OVER_VOLT' ? 460 : 380) : 0,
        v12: hasPower ? (input.simulateFault === 'UNDER_VOLT' ? 310 : input.simulateFault === 'OVER_VOLT' ? 460 : 400) : 0,
        v23: hasPower ? 400 : 0, v31: hasPower ? 400 : 0,
        hz: hasPower ? 50.0 : 0,
        frequency: hasPower ? 50 : 0,
      };
    }
    return {};
  }

  #updateMemory() {
    let changed = false;
    for (const [id, memory] of this.memory) {
      const device = this.devices.get(id);
      const powered = this.state[id].powered;
      const previous = { ...memory };
      if (ALTERNATE_TYPES.has(device.type)) {
        if (powered && !memory.powered) memory.active = !memory.active;
      } else {
        const delay = Number.isFinite(device.params.delayMs) ? Math.max(0, device.params.delayMs) : 1000;
        if (memory.active === powered) {
          memory.due = null;
        } else if (delay === 0 || (device.type === 'timer-on' && !powered)
            || (device.type === 'timer-off' && powered)) {
          memory.active = powered;
          memory.due = null;
        } else {
          memory.due ??= this.time + delay;
          if (memory.due <= this.time) {
            memory.active = powered;
            memory.due = null;
          }
        }
      }
      memory.powered = powered;
      if (!equivalent(previous, memory)) changed = true;
    }
    return changed;
  }

  #halt(ids) {
    this.halted = true;
    const tags = ids.map(id => this.devices.get(id)?.tag ?? id);
    this.diagnosticIssue = {
      severity: 'error', code: 'oscillation', devices: ids,
      message: t`Logic không hội tụ tại ${this.time} ms. Phần tử thay đổi: ${tags.join(', ') || t('mạng mạch')}.`,
    };
    this.#addLog(t('MÔ PHỎNG'), t('Dừng do dao động logic'), this.diagnosticIssue.message);
  }

  #settle() {
    this.diagnosticIssue = null;
    const beforeEvent = this.state;
    const signature = () => JSON.stringify([this.state, [...this.memory.values()]]);
    const seen = new Map();
    const history = [];
    const budget = Math.min(Math.max(128, this.project.devices.length * 6), 10000);
    for (let iteration = 0; iteration < budget; iteration++) {
      const key = signature();
      if (seen.has(key)) {
        const cycle = history.slice(seen.get(key));
        const ids = [...this.devices.keys()].filter(id => cycle.some(state => !equivalent(state[id], this.state[id])));
        this.#halt(ids);
        break;
      }
      seen.set(key, history.length);
      history.push(this.state);
      const network = this.#buildNetwork(this.state);
      const next = Object.fromEntries(this.project.devices.map(device => [
        device.id, this.#evaluate(device, this.state, network),
      ]));
      const stable = equivalent(this.state, next);
      this.state = next;
      if (stable && !this.#updateMemory()) break;
      if (iteration === budget - 1) {
        const recent = history.slice(-8);
        this.#halt([...this.devices.keys()].filter(id => recent.some(state => !equivalent(state[id], this.state[id]))));
      }
    }
    this.network = this.#buildNetwork(this.state);
    for (const device of this.project.devices) {
      const previous = beforeEvent[device.id];
      const state = this.state[device.id];
      const changes = Object.keys(statusText).filter(key => typeof state[key] === 'boolean' && previous?.[key] !== state[key]);
      if (changes.length === 0) continue;
      const event = changes.map(key => t(statusText[key][Number(state[key])])).join(' · ');
      let reasons = this.diagnose(device.id);
      if (TIMER_TYPES.has(device.type) && previous?.pendingUntil === this.time && changes.includes('active')) {
        reasons = [t('Đã đến thời điểm chuyển đầu ra timer.'), ...reasons];
      }
      if (ALTERNATE_TYPES.has(device.type) && state.powered && !previous?.powered) {
        reasons = [t('Cạnh tác động cuộn ALT đổi trạng thái tiếp điểm.'), ...reasons];
      }
      this.#addLog(device.tag, event, reasons.join(' '), device.id);
    }
  }

  #prepareInput({ device: deviceId, key, value }) {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error(t`Thiết bị đầu vào không tồn tại: ${deviceId}`);
    const definition = getDeviceInputs(device).find(definition => definition.key === key);
    if (!definition || (definition.type === 'boolean' && typeof value !== 'boolean')
        || (definition.type === 'choice' && !definition.options.includes(value))
        || (definition.type === 'number' && (!Number.isFinite(value) || value < definition.min || value > definition.max))) {
      throw new Error(t`${device.tag}: giá trị đầu vào không hợp lệ (${key}).`);
    }
    return { device, definition, key, value };
  }

  #setInput({ device, definition, key, value }) {
    const deviceId = device.id;
    const state = this.inputs.get(deviceId);
    if (BREAKER_TYPES.has(device.type) && key === 'on' && value && state.trip) {
      this.#addLog(device.tag, t('Lệnh đóng bị chặn'), t('CB đang trip. Reset chốt trip trước khi đóng lại.'), deviceId);
      return;
    }
    if (state[key] === value) return;
    state[key] = value;
    if (BREAKER_TYPES.has(device.type) && key === 'trip' && value) state.on = false;
    const text = typeof value === 'boolean' ? (value ? t('có') : t('không')) : value;
    this.#addLog(device.tag, t('Đầu vào'), `${t(definition.label)} — ${text}.`, deviceId);
  }

  apply(deviceId, key, value) {
    return this.applyActions([{ device: deviceId, key, value }]);
  }

  setInput(deviceId, key, value) {
    return this.apply(deviceId, key, value);
  }

  applyActions(actions) {
    if (this.halted) return this.snapshot();
    for (const prepared of actions.map(action => this.#prepareInput(action))) this.#setInput(prepared);
    this.#settle();
    return this.snapshot();
  }

  #nextDue() {
    let next = Infinity;
    for (const memory of this.memory.values()) next = Math.min(next, memory.due ?? Infinity);
    for (const timer of this.weeklyTimers) next = Math.min(next, this.state[timer.id]?.scheduleDue ?? Infinity);
    return next;
  }

  advance(ms) {
    if (!Number.isFinite(ms) || ms < 0 || !Number.isFinite(this.time + ms)) {
      throw new Error(t('Khoảng thời gian mô phỏng phải hữu hạn và không âm.'));
    }
    const target = this.time + ms;
    while (!this.halted) {
      const due = this.#nextDue();
      if (due > target) {
        this.time = target;
        break;
      }
      this.time = due;
      this.#settle();
    }
    return this.snapshot();
  }

  step() {
    const due = this.#nextDue();
    return this.advance(Number.isFinite(due) ? Math.max(0, due - this.time) : 100);
  }

  #potentialPath(start, targets) {
    const graph = new Map(this.pinKeys.map(key => [key, []]));
    const add = (a, b, blocked) => {
      graph.get(a)?.push({ other: b, blocked });
      graph.get(b)?.push({ other: a, blocked });
    };
    for (const wire of this.project.wires) {
      add(pinKey(wire.from.device, wire.from.pin), pinKey(wire.to.device, wire.to.pin), null);
    }
    for (const device of this.project.devices) {
      const pairs = truePairs(device, this.state[device.id]);
      for (const [a, b] of truePairs(device, this.state[device.id], true)) {
        const closed = pairs.some(([left, right]) => left === a && right === b);
        add(pinKey(device.id, a), pinKey(device.id, b), closed ? null : device.id);
      }
    }
    const distance = new Map([[start, 0]]);
    const wait = [{ at: start, blockers: [], cost: 0 }];
    let best;
    while (wait.length) {
      wait.sort((a, b) => b.cost - a.cost);
      const path = wait.pop();
      if (path.cost !== distance.get(path.at)) continue;
      if (best && best.cost <= path.cost) break;
      const target = targets.get(path.at);
      if (target) {
        const off = !availability(this.inputs, this.state, target);
        const cost = path.cost + Number(off);
        if (!best || cost < best.cost) best = { ...path, cost, target, off };
      }
      for (const { other, blocked } of graph.get(path.at) ?? []) {
        const cost = path.cost + Number(Boolean(blocked));
        if (cost >= (distance.get(other) ?? Infinity)) continue;
        distance.set(other, cost);
        wait.push({ at: other, blockers: blocked ? [...path.blockers, blocked] : path.blockers, cost });
      }
    }
    return best;
  }

  #explainPath(device, pin, role, visited) {
    const domain = knownDomain(device, pin)?.id;
    const candidates = this.#tokens(this.network, device.id, pin);
    if (candidates.length > 1) return t`Chân ${pin} nằm trên mạng có nguồn đối nghịch.`;
    const root = this.network.networks.find(pinKey(device.id, pin));
    if (this.network.classes.get(root)?.size > 1) return t`Chân ${pin} nằm trên mạng nối sai miền nguồn.`;
    const [token] = candidates;
    const phase = /^L[123]$/.test(role);
    if (token && (token.domain !== domain || (phase ? !/^L[123]$/.test(token.role) : token.role !== role))) {
      return t`Chân ${pin} nhận ${token.pin} miền ${token.domain}, cần ${role === 'return' ? t('đường về') : t('nguồn cấp')} miền ${domain}.`;
    }
    if (token) return '';
    const targets = new Map();
    for (const source of this.sources) {
      if (source.id === device.id) continue;
      for (const term of sourceTerms(source)) {
        if (term.domain === domain && (term.role === role || (phase && /^L[123]$/.test(term.role)))) {
          targets.set(pinKey(source.id, term.pin), source);
        }
      }
    }
    const label = role === 'return' ? t('thiếu đường về') : phase ? t('thiếu pha') : t('thiếu đường cấp');
    const path = this.#potentialPath(pinKey(device.id, pin), targets);
    if (!path) return t`Chân ${pin} ${label} (${domain}).`;
    const blockers = path.blockers.map(id => {
      const member = this.devices.get(id);
      const state = this.state[id];
      if (state.tripped) return t`${member.tag} đang trip`;
      if (member.type === 'selector') return t`${member.tag} đang ở ${state.mode}`;
      const master = this.devices.get(member.params.masterId);
      const contact = member.params.contactLabel;
      const name = contact && contact !== member.tag ? `${member.tag} · ${contact}` : member.tag;
      const description = t`${name} đang mở${master ? t` (thiết bị chủ ${master.tag})` : ''}`;
      if (!master || visited.has(master.id)) return description;
      const masterState = this.state[master.id];
      if (masterState?.tripped) return t`${description} vì ${master.tag} đang trip`;
      if (masterState?.powered === false || Number.isFinite(masterState?.pendingUntil)) {
        const upstream = this.diagnose(master.id, visited).join(' ');
        return t`${description} vì ${master.tag}: ${upstream}`;
      }
      return description;
    });
    if (path.off) {
      blockers.push(t`${path.target.tag} mất nguồn hoặc đang tắt`);
      if (converters.has(path.target.type) && !visited.has(path.target.id)) {
        blockers.push(...this.diagnose(path.target.id, visited));
      }
    }
    return t`Chân ${pin} ${label}${blockers.length ? t` do ${blockers.join(', ')}` : ''}.`;
  }

  diagnose(deviceId, visited = new Set()) {
    if (visited.has(deviceId)) return [];
    const chain = new Set([...visited, deviceId]);
    const device = this.devices.get(deviceId);
    const state = this.state[deviceId];
    if (!device || !state) return [t('Thiết bị không tồn tại.')];
    let requirements;
    if (LOAD_TYPES.has(device.type)) requirements = device.type === SIX_PIN_MOTOR ? windingRequirements : loadRequirements;
    if (COIL_TYPES.has(device.type)) requirements = coilRequirements;
    if (converters.has(device.type)) requirements = converterRequirements;
    if (device.type === 'controller-e5ec' && state.sensorFault) return [t('S.Err · Kiểm tra chế độ ngõ vào, dây tín hiệu và nguồn của vòng 4–20 mA.')];
    if (device.type === 'pressure-sensys' && !state.powered) return [t('Cần vòng kín đúng cực, nguồn 9–30 VDC và đường về cùng nguồn.')];
    if (device.type.startsWith('level-61f-') && !state.powered) return [t('S0–S1 dùng AC110 hoặc S0–S2 dùng AC220.')];
    if (['controller-e5ec','weekly-h5s'].includes(device.type) && !state.powered) return [t('Hai chân nguồn cần điện áp AC100–240 từ cùng một nguồn.')];
    if (device.type === 'phase-relay') {
      if (!state.powered) return [t('Cần cấp đủ ba pha L1, L2, L3 từ nguồn 3 pha.')];
      if (state.tripped) return [t('Rơ-le bảo vệ pha đang tác động báo lỗi (mất pha, đảo pha hoặc trip thủ công).')];
      return [t('Ba pha đầy đủ và đúng thứ tự, rơ-le bảo vệ pha ở trạng thái tốt (11-14 đóng).')];
    }
    if (device.type === 'vfd') {
      if (!state.powered) return [t('Thiếu nguồn 3 pha L1, L2, L3 cấp cho biến tần.')];
      if (state.tripped) return [t('Biến tần đang ở trạng thái lỗi sự cố (Trip).')];
      if (!state.running) return [t('Chưa có lệnh chạy (chân FWD chưa nối thông với chân CM).')];
      return [t`Biến tần đang chạy với tần số ${state.frequency} Hz, cấp 3 pha ra U-V-W.`];
    }
    if (device.type === LS_H100) {
      if (!state.powered) return [t('Thiếu nguồn 3 pha L1, L2, L3 cấp cho biến tần.')];
      if (state.tripped) return [t('Biến tần đang ở trạng thái lỗi sự cố (Trip).')];
      if (!state.command) return [t('Chưa có lệnh chạy: tiếp điểm khô P1–CM đang hở.')];
      if (!state.running) return [t('Tần số đặt đang bằng 0 Hz.')];
      return [t`Biến tần đang chạy với tần số ${state.frequency} Hz, cấp 3 pha ra U-V-W.`];
    }
    if (device.type === TPR_3SL) {
      if (!state.controlPowered) return [t('SCR thiếu nguồn điều khiển AC tại chân 3–4.')];
      if (state.tripped) return [t('SCR đang báo lỗi qua tiếp điểm 8–9.')];
      if (!state.powered) return [t('SCR thiếu nguồn động lực ba pha.')];
      if (!state.command) return [t('Chưa có lệnh chạy: tiếp điểm 4–6 đang hở.')];
      if (!state.running) return [t('Mức yêu cầu SCR đang bằng 0%.')];
      return [t`SCR đang đóng đường cấp cho bộ sấy · Mức yêu cầu ${state.outputPercent}%.`];
    }
    if (device.type === 'soft-starter') {
      if (!state.powered) return [t('Thiếu nguồn 3 pha L1, L2, L3 cấp cho khởi động mềm.')];
      if (state.tripped) return [t('Khởi động mềm đang bị lỗi trip.')];
      if (!state.running) return [t('Chưa có lệnh chạy (chân RUN chưa nối thông với chân COM).')];
      return [t('Khởi động mềm đang chạy và đóng tiếp điểm Bypass (23-24).')];
    }
    if (device.type === 'power-meter') {
      if (!state.powered) return [t('Chưa có nguồn đo cấp vào chân L1, L2, L3.')];
      if (state.alarm) return [t('Điện áp bất thường ngoài ngưỡng cho phép (báo động ALM1-ALM2 đóng).')];
      return [t('Điện áp 3 pha bình thường, hiển thị đầy đủ thông số.')];
    }
    if (requirements && !state.powered) {
      const reasons = requirements.map(([pin, role]) => this.#explainPath(device, pin, role, chain)).filter(Boolean);
      if (Number.isFinite(state.pendingUntil)) reasons.push(t`Đầu ra timer dự kiến đổi tại ${state.pendingUntil} ms.`);
      if (reasons.length) return reasons;
      if (device.type === SIX_PIN_MOTOR && this.#measure(device, windingRequirements, this.network, true)) {
        return [t('Mạch cuộn dây đang hở hoặc đấu sao–tam giác chưa đúng.')];
      }
      return [LOAD_TYPES.has(device.type)
        ? t('Cần đủ ba pha khác nhau từ cùng một nguồn, trong đúng miền động lực.')
        : t('Đường cấp và đường về phải thuộc cùng một nguồn và đúng miền điều khiển.')];
    }
    if (state.connection === 'star') return [t('Đủ ba pha · Cuộn dây đang đấu sao (Y).')];
    if (state.connection === 'delta') return [t('Đủ ba pha · Cuộn dây đang đấu tam giác (Δ).')];
    if (LOAD_TYPES.has(device.type)) return [t('Đủ ba pha từ cùng một nguồn động lực.')];
    if (TIMER_TYPES.has(device.type) && state.pendingUntil !== null) {
      return [t`Đầu ra timer dự kiến đổi tại ${state.pendingUntil} ms.`];
    }
    if (requirements && state.powered) return [t('Có đường cấp và đường về hợp lệ.')];
    if (LINKED_TYPES.has(device.type)) {
      const master = this.devices.get(device.params.masterId);
      return [master ? t`Theo ${master.tag} · ${device.params.masterState ?? 'active'}.` : t('Chưa gán thiết bị chủ.')];
    }
    if (state.tripped) return [t('Tác động đầu vào trip.')];
    if (SOURCE_TYPES.has(device.type)) return [state.on ? t('Nguồn mô hình đang cấp.') : t('Nguồn mô hình đang tắt.')];
    if (device.type === 'selector') return [t`Chế độ ${state.mode}.`];
    return [t('Theo trạng thái đầu vào và tiếp điểm của thiết bị.')];
  }

  snapshot() {
    const pinStates = Object.fromEntries(this.pinKeys.map(key => {
      const root = this.network.networks.find(key);
      const tokens = this.network.values.get(root) ?? [];
      let state = { kind: 'idle', label: t('Mạng không có thế nguồn') };
      if (tokens.length === 1) state = publicToken(tokens[0]);
      if (tokens.length > 1) state = { kind: 'conflict', label: t('Đối nghịch nguồn') };
      else if (this.network.classes.get(root)?.size > 1) state = { kind: 'conflict', label: t('Sai miền nguồn') };
      return [key, state];
    }));
    const wires = Object.fromEntries(this.project.wires.map(wire => [
      wire.id, pinStates[pinKey(wire.from.device, wire.from.pin)] ?? { kind: 'idle', label: t('Đầu nối thiếu') },
    ]));
    return {
      time: this.time,
      devices: Object.fromEntries(Object.entries(this.state).map(([id, state]) => [id,
        this.devices.get(id).type === 'weekly-h5s' ? {...state,clockText:weeklyClock(this.devices.get(id).params,this.time)} : {...state}])),
      wires,
      pins: pinStates,
      log: [...this.log],
      issues: [...this.staticIssues, ...this.network.errors, ...(this.diagnosticIssue ? [this.diagnosticIssue] : [])],
      halted: this.halted,
    };
  }
}

function resultStatus(checks, verification, halted) {
  if (halted || checks.some(check => !check.pass)) return 'fail';
  if (verification) return 'unverified';
  return checks.length ? 'pass' : 'unverified';
}

export function runScenario(project, scenario) {
  const actions = scenario.initial ?? [];
  let simulator;
  try {
    simulator = new Simulator(project, actions);
  } catch (error) {
    return {
      id: scenario.id, name: scenario.name, reference: scenario.reference ?? '', initial: actions,
      steps: [], status: 'fail', error: error.message,
    };
  }
  const initialState = simulator.snapshot();
  const verification = scenario.verification === 'unverified' || scenario.status === 'unverified';
  const steps = (scenario.steps ?? []).map(step => {
    const label = step.label ?? t('Bước kiểm thử');
    const reference = step.reference ?? scenario.reference ?? '';
    const actions = step.actions ?? [];
    try {
      if (step.atMs !== undefined) simulator.advance(step.atMs - simulator.time);
      else if (step.advanceMs !== undefined) simulator.advance(step.advanceMs);
      const state = simulator.applyActions(actions);
      const checks = (step.expect ?? []).map(check => {
        const actual = state.devices[check.device]?.[check.key];
        return { ...check, actual, pass: actual !== undefined && equivalent(actual, check.value) };
      });
      return {
        label, reference, actions, checks, time: state.time,
        status: resultStatus(checks, verification || step.verification === 'unverified', state.halted),
        ...(state.halted ? { error: state.issues.find(issue => issue.code === 'oscillation')?.message } : {}),
      };
    } catch (error) {
      return { label, reference, actions, checks: [], time: simulator.time, status: 'fail', error: error.message };
    }
  });
  let status = 'unverified';
  if (steps.some(step => step.status === 'fail')) status = 'fail';
  else if (steps.length && steps.every(step => step.status === 'pass')) status = 'pass';
  return {
    id: scenario.id, name: scenario.name, reference: scenario.reference ?? '', initial: actions,
    initialState, steps, status,
  };
}
