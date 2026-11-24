import {t} from "./i18n.mjs";
import {BREAKER_TYPES, COIL_TYPES, LINKED_TYPES, LOAD_TYPES, SIX_PIN_MOTOR, THREE_PHASE_HEATER, TPR_3SL, pinKey} from "./model.mjs";
import {truePairs} from "./simulator.mjs";

const unknown = note => ({value: null, unit: "", note});
const keyOf = end => pinKey(end.device, end.pin);
const supplyPins = {
  "source-ac": ["L", "N"], "source-dc": ["+", "-"], "source-3ph": ["L1", "L2", "L3"],
  "power-supply-dc": ["+", "-"], "transformer-ac": ["X1", "X2"],
};
const instrumentLoads = new Set(["power-supply-dc", "transformer-ac", "controller-e5ec", "weekly-h5s", "level-61f-g2", "level-61f-g3"]);
const passive = new Set(["terminal", "junction", "selector", "fuse", "overload", "float", "dry-contact", "push-no", "push-nc", ...BREAKER_TYPES, ...LINKED_TYPES]);
const noRating = tag => unknown(t`Chưa khai báo dòng làm việc của ${tag} trong Thuộc tính.`);

export function supportsOperatingCurrent(type) {
  return COIL_TYPES.has(type) || (LOAD_TYPES.has(type) && type !== SIX_PIN_MOTOR && type !== THREE_PHASE_HEATER) || instrumentLoads.has(type);
}

export function probePin(sim, target) {
  return target.wire ? sim.project.wires.find(wire => wire.id === target.wire)?.from : target;
}

function netAt(sim, target) {
  const pin = probePin(sim, target);
  if (!pin) return null;
  const root = sim.network.networks.find(keyOf(pin));
  if (root === undefined) return null;
  const tokens = sim.network.values.get(root) ?? [];
  return {root, token: tokens[0], conflict: tokens.length > 1 || sim.network.classes.get(root)?.size > 1};
}

function nominalVoltage(token) {
  const number = /^(?:AC|DC|3P)\s*(\d+(?:[.,]\d+)?)\s*V?$/i.exec(token.domain)?.[1];
  return number === undefined ? null : Number(number.replace(",", "."));
}

// An open switch leaves the load side at its return potential when there is
// a passive coil to that return. Two different boundary potentials in a chain
// of series loads require an impedance model, so do not assign an internal voltage.
const restLinksCache = new WeakMap();
function restingLinks(sim) {
  if (restLinksCache.has(sim.network)) return restLinksCache.get(sim.network);
  const links = new Map();
  for (const device of sim.project.devices) {
    if (!COIL_TYPES.has(device.type) || sim.state[device.id]?.powered) continue;
    const a = sim.network.networks.find(pinKey(device.id, "A1"));
    const b = sim.network.networks.find(pinKey(device.id, "A2"));
    if (!links.has(a)) links.set(a, new Set());
    if (!links.has(b)) links.set(b, new Set());
    links.get(a).add(b);
    links.get(b).add(a);
  }
  restLinksCache.set(sim.network, links);
  return links;
}

function restingGroup(sim, root) {
  const roots = new Set([root]);
  const boundary = new Map();
  const links = restingLinks(sim);
  let conflict = false;
  for (const node of roots) {
    const tokens = sim.network.values.get(node) ?? [];
    if (tokens.length > 1 || sim.network.classes.get(node)?.size > 1) conflict = true;
    for (const token of tokens) boundary.set(pinKey(token.source, token.pin), token);
    // A terminal already fixed by an ideal voltage source ends the search.
    if (!tokens.length) for (const next of links.get(node) ?? []) roots.add(next);
  }
  return {roots, boundary, conflict};
}

function referencedNet(sim, target) {
  const net = netAt(sim, target);
  if (!net || net.token || net.conflict) return net;
  const group = restingGroup(sim, net.root);
  return {...net, ...group, token: group.boundary.size === 1 ? group.boundary.values().next().value : null};
}

export function referenceFor(sim, target) {
  const net = referencedNet(sim, target);
  if (!net?.token || net.conflict) return null;
  const source = sim.devices.get(net.token.source);
  const pins = supplyPins[source?.type];
  return pins?.length === 2 ? {device: source.id, pin: pins[1]} : null;
}

function hasVariableScrVoltage(sim, targets, roots) {
  const outputs = [];
  for (const device of sim.project.devices) {
    const state = sim.state[device.id];
    if (device.type !== TPR_3SL || !state?.running || state.outputPercent === 100) continue;
    for (const pin of ["U", "V", "W"]) {
      const key = pinKey(device.id, pin);
      if (roots.includes(sim.network.networks.find(key))) outputs.push(key);
    }
  }
  if (!outputs.length) return false;
  const graph = idealGraph(sim, {isolateScrOutput: true});
  const probeKeys = targets.map(target => keyOf(probePin(sim, target)));
  return outputs.some(output => {
    const downstream = reachable(graph, output);
    return probeKeys.some(key => downstream.has(key));
  });
}

export function measureVoltage(sim, first, second) {
  if (sim.halted) return unknown(t("Mạch đang dừng do logic không hội tụ."));
  const a = referencedNet(sim, first);
  const b = referencedNet(sim, second);
  if (!a || !b) return unknown(t("Điểm đo chưa có trong sơ đồ."));
  if (a.conflict || b.conflict) return unknown(t("Điểm đo nằm trên mạng xung đột nguồn hoặc sai miền."));
  if (hasVariableScrVoltage(sim, [first, second], [a.root, b.root])) return unknown(t("Mô hình SCR chưa tính điện áp hiệu dụng ở mức điều khiển một phần."));
  if (a.root === b.root) return {value: 0, unit: "V", note: t("Hai que cùng nút điện.")};
  if (!a.token || !b.token) return unknown(t("Điểm đo chưa có điện thế tham chiếu trong mô hình."));
  if (a.token.source !== b.token.source) return unknown(t("Hai nguồn độc lập, chưa xác định điện áp tương đối."));
  if (a.token.pin === b.token.pin) return {value: 0, unit: "V", note: t("Hai điểm cùng điện thế tham chiếu.")};
  const voltage = nominalVoltage(a.token);
  if (voltage === null) return unknown(t("Miền nguồn chưa ghi trị số điện áp, ví dụ AC220, DC24 hoặc 3P380."));
  if (/^DC/i.test(a.token.domain)) {
    const sign = a.token.role === "return" ? -1 : 1;
    return {value: sign * voltage, unit: "V DC", note: t("Điện áp que (+) so với que (−).")};
  }
  return {value: voltage, unit: "V AC", note: a.token.role.startsWith("L") ? t("Điện áp hiệu dụng giữa hai pha.") : t("Điện áp hiệu dụng danh định.")};
}

// Each terminal contributes its operating current into the device. Ideal contacts
// and wires carry that current without drawing any of their own.
function demand(sim, device, pin) {
  const {type, params} = device;
  const state = sim.state[device.id] ?? {};
  if (supplyPins[type]?.includes(pin)) return state.powered ? {source: true} : {value: 0};
  if (type === "pressure-sensys") {
    const amps = Number.isFinite(state.currentMa) ? state.currentMa / 1000 : 0;
    return {value: pin === "+" ? amps : -amps};
  }
  if (type === "rtd-evikon") return unknown(t("Mô hình Pt100 chưa xác định dòng kích thích đo điện trở."));
  if (type === SIX_PIN_MOTOR) return unknown(t("Mô hình sao–tam giác chưa tính dòng cuộn dây."));
  if (type === THREE_PHASE_HEATER || type === TPR_3SL && ["L1", "L2", "L3", "U", "V", "W"].includes(pin)) {
    return unknown(t("Mô hình SCR và bộ sấy chưa tính dòng tải."));
  }
  if (supportsOperatingCurrent(type)) {
    const input = instrumentLoads.has(type);
    const level = type.startsWith("level-61f-");
    const mainsPins = level ? ["S0", "S1", "S2"] : ["L", "N"];
    if (input && !mainsPins.includes(pin)) {
      if (type === "controller-e5ec" && ["A", "B"].includes(pin) && params.inputMode === "4–20 mA") {
        const transmitters = Object.values(sim.state).filter(sensor => sensor.receiverId === device.id && Number.isFinite(sensor.currentMa));
        if (transmitters.length) {
          const total = transmitters.reduce((sum, sensor) => sum + sensor.currentMa / 1000, 0);
          return {value: total * (pin === "A" ? 1 : -1)};
        }
        if (!netAt(sim, {device: device.id, pin: "A"}).token || !netAt(sim, {device: device.id, pin: "B"}).token) return {value: 0};
      }
      const contacts = truePairs(device, state, true).flat();
      if (contacts.includes(pin)) return {value: 0};
      return unknown(t`Chưa có mô hình dòng cho chân ${device.tag}/${pin}.`);
    }
    if (!state.powered) {
      if (COIL_TYPES.has(type)) {
        const a = referencedNet(sim, {device: device.id, pin: "A1"});
        const b = referencedNet(sim, {device: device.id, pin: "A2"});
        if (a.conflict || b.conflict || a.boundary?.size > 1 || b.boundary?.size > 1 ||
            a.token && b.token && (a.token.pin !== b.token.pin || a.token.source !== b.token.source)) {
          return unknown(t`Chưa xác định được dòng qua ${device.tag} trong cấu hình cấp điện này.`);
        }
      }
      if (LOAD_TYPES.has(type) && ["U", "V", "W"].some(p => netAt(sim, {device: device.id, pin: p}).token)) {
        return unknown(t`Tải ${device.tag} thiếu pha hoặc sai miền. Chưa có mô hình dòng mất pha.`);
      }
      return {value: 0};
    }
    if (level && pin !== "S0" && pin !== state.supplyTap) return {value: 0};
    if (typeof params.operatingCurrentA !== "number" || !Number.isFinite(params.operatingCurrentA) || params.operatingCurrentA < 0) return noRating(device.tag);
    const returns = netAt(sim, {device: device.id, pin}).token?.role === "return";
    return {value: params.operatingCurrentA * (returns ? -1 : 1)};
  }
  if (supplyPins[type] || passive.has(type)) return {value: 0};
  return unknown(t`Chưa có mô hình dòng cho chân ${device.tag}/${pin}.`);
}

function idealGraph(sim, {isolateScrOutput = false} = {}) {
  const graph = new Map(sim.pinKeys.map(key => [key, []]));
  const connect = (a, b, wire) => {
    if (!graph.has(a) || !graph.has(b)) return;
    const edge = {a, b, wire};
    graph.get(a).push(edge);
    graph.get(b).push(edge);
  };
  for (const wire of sim.project.wires) connect(keyOf(wire.from), keyOf(wire.to), wire.id);
  for (const device of sim.project.devices) {
    for (const [a, b] of truePairs(device, sim.state[device.id])) {
      if (isolateScrOutput && device.type === TPR_3SL && ["U", "V", "W"].includes(b)) continue;
      connect(pinKey(device.id, a), pinKey(device.id, b));
    }
  }
  return graph;
}

function reachable(graph, start, cut) {
  const reached = new Set([start]);
  for (const node of reached) {
    for (const edge of graph.get(node) ?? []) {
      if (edge === cut) continue;
      reached.add(edge.a === node ? edge.b : edge.a);
    }
  }
  return reached;
}

function sumDemand(sim, nodes) {
  let sum = 0;
  const reasons = [];
  for (const node of nodes) {
    const [id, pin] = JSON.parse(node);
    const item = demand(sim, sim.devices.get(id), pin);
    if (item.source) return {source: true};
    if (item.value === null) reasons.push(item.note);
    else sum += item.value;
  }
  return reasons.length ? unknown(reasons[0]) : {value: sum};
}

const amps = value => ({value: Math.abs(value), unit: "A", note: t("Dòng nhánh mô phỏng. Với AC, các dòng tải trên cùng dây được cộng theo giả thiết cùng góc pha.")});
const ambiguous = () => unknown(t("Dây dẫn lý tưởng có đường song song. Chưa biết trở kháng để chia dòng từng nhánh."));

function across(sim, graph, edge) {
  const first = reachable(graph, edge.a, edge);
  if (first.has(edge.b)) return ambiguous();
  const left = sumDemand(sim, first);
  if (left.value != null) return amps(left.value);
  const right = sumDemand(sim, reachable(graph, edge.b, edge));
  if (right.value != null) return amps(right.value);
  return [left, right].find(result => result.note) ?? unknown(t("Nhánh có nhiều nguồn, chưa đủ dữ liệu chia dòng."));
}

export function measureCurrent(sim, target) {
  if (sim.halted) return unknown(t("Mạch đang dừng do logic không hội tụ."));
  const node = netAt(sim, target);
  if (!node) return unknown(t("Điểm đo chưa có trong sơ đồ."));
  if (node.conflict) return unknown(t("Mạng xung đột hoặc ngắn mạch. Chưa xác định được dòng sự cố."));
  const endpoint = probePin(sim, target);
  const key = keyOf(endpoint);
  const graph = idealGraph(sim);
  const incident = graph.get(key) ?? [];
  if (target.wire) {
    const edge = incident.find(edge => edge.wire === target.wire);
    return edge ? across(sim, graph, edge) : unknown(t("Dây chưa nối đủ hai đầu."));
  }
  const device = sim.devices.get(endpoint.device);
  const wires = incident.filter(edge => edge.wire);
  if (wires.length === 0) return amps(0);
  if (wires.length === 1) return across(sim, graph, wires[0]);
  const contacts = incident.filter(edge => !edge.wire);
  if (contacts.length === 1) return across(sim, graph, contacts[0]);
  if (device.type === "junction" || contacts.length > 1) return unknown(t("Nút có nhiều nhánh. Bấm đoạn dây cần đo ngay bên cạnh nút."));
  const terminal = demand(sim, device, endpoint.pin);
  if (!terminal.source) return terminal.value == null ? terminal : amps(terminal.value);
  const remainder = reachable(graph, key);
  remainder.delete(key);
  const result = sumDemand(sim, remainder);
  return result.source ? unknown(t("Nút có nhiều nguồn dòng.")) : result.value == null ? result : amps(result.value);
}
