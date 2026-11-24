import {t, getLocale} from "./i18n.mjs";
import {ALTERNATE_TYPES, CATALOG, LOAD_TYPES, LS_H100, THREE_PHASE_HEATER, TPR_3SL, pinKey} from "./model.mjs";
import {electricalSymbol, tagInSymbol} from "./electrical-symbols.mjs";
import {svg} from "./ui-elements.mjs";
import {nearestTap, tapIntersection} from "./wire-branches.mjs";

export const dragType = "application/x-tudien-device";
const minZoom = 0.08;
const maxZoom = 4;
const spacing = 20;
const wireStateName = {idle: "Hở", live: "Cấp", return: "Về", phase: "Pha", conflict: "Lỗi nguồn"};
const directions = {left: [-1, 0], right: [1, 0], top: [0, -1], bottom: [0, 1]};
const transposeSide = {left: "top", right: "bottom", top: "left", bottom: "right"};

export function orientationOf(device) {
  return device.params?.orientation === "vertical" ? "vertical" : "horizontal";
}

function horizontalBounds(device) {
  const pins = CATALOG[device.type].pins;
  const lateral = Math.max(...["left", "right"].map(side => pins.filter(pin => pin.side === side).length));
  return {width: 98, height: lateral >= 3 ? Math.max(72, (lateral - 1) * 16 + 28) : 60};
}

function bounds(device) {
  const {width, height} = horizontalBounds(device);
  return orientationOf(device) === "vertical" ? {width: height, height: width} : {width, height};
}

export function pinLocation(device, pinId) {
  if (!device) return null;
  const pins = CATALOG[device.type].pins;
  const pin = pins.find(item => item.id === pinId);
  if (!pin) return null;
  if (device.type === "junction") return {x: device.x, y: device.y, side: null};
  const side = pin.side ?? "left";
  const siblings = pins.filter(item => (item.side ?? "left") === side);
  const index = siblings.indexOf(pin);
  const {width, height} = horizontalBounds(device);
  const perpendicular = index - (siblings.length - 1) / 2;
  const [dx, dy] = directions[side];
  const x = dx ? dx * (width / 2 + 9) : perpendicular * 20;
  const y = dy ? dy * (height / 2 + 9) : perpendicular * 16;
  return orientationOf(device) === "vertical"
    ? {x: device.x + y, y: device.y + x, side: transposeSide[side]}
    : {x: device.x + x, y: device.y + y, side};
}

function samePoint(a, b) {
  return a.x === b.x && a.y === b.y;
}

function orthogonal(points) {
  const result = [points[0]];
  for (const point of points.slice(1)) {
    const previous = result.at(-1);
    if (samePoint(previous, point)) continue;
    if (previous.x !== point.x && previous.y !== point.y) result.push({x: point.x, y: previous.y});
    result.push(point);
  }
  return result;
}

function escapePort(port) {
  if (!port.side) return port;
  const [dx, dy] = directions[port.side];
  return {x: port.x + dx * 12, y: port.y + dy * 12};
}

function automaticRoute(start, end) {
  const a = escapePort(start);
  const b = escapePort(end);
  if (samePoint(a, b)) return [start, a, end];
  if (!start.side || !end.side) return orthogonal([start, a, b, end]);
  const horizontalStart = start.side === "left" || start.side === "right";
  const horizontalEnd = end.side === "left" || end.side === "right";
  if (horizontalStart && horizontalEnd) {
    if (a.x === b.x) return orthogonal([start, a, b, end]);
    const facing = start.side !== end.side && (start.side === "right" ? a.x < b.x : a.x > b.x);
    if (!facing) {
      const track = Math.max(a.y, b.y) + 54;
      return orthogonal([start, a, {x: a.x, y: track}, {x: b.x, y: track}, b, end]);
    }
  }
  if (!horizontalStart && !horizontalEnd) {
    const facing = start.side !== end.side && (start.side === "bottom" ? a.y < b.y : a.y > b.y);
    if (!facing) {
      const track = Math.max(a.x, b.x) + 54;
      return orthogonal([start, a, {x: track, y: a.y}, {x: track, y: b.y}, b, end]);
    }
  }
  if (a.y === b.y) return orthogonal([start, a, b, end]);
  if (start.side === "top" || start.side === "bottom") {
    if (end.side === "left" || end.side === "right") return orthogonal([start, a, {x: a.x, y: b.y}, b, end]);
    const middle = (a.y + b.y) / 2;
    return orthogonal([start, a, {x: a.x, y: middle}, {x: b.x, y: middle}, b, end]);
  }
  if (end.side === "top" || end.side === "bottom") return orthogonal([start, a, {x: b.x, y: a.y}, b, end]);
  const middle = (a.x + b.x) / 2;
  return orthogonal([start, a, {x: middle, y: a.y}, {x: middle, y: b.y}, b, end]);
}

export function wireRoute(wire, devices) {
  const start = pinLocation(devices.get(wire.from.device), wire.from.pin);
  const end = pinLocation(devices.get(wire.to.device), wire.to.pin);
  if (!start || !end) return [];
  if (!wire.points?.length) return automaticRoute(start, end);
  return orthogonal([start, ...wire.points, end]);
}

const crossingRadius = 5;

export function wireCrossings(routes, junctions) {
  const horizontal = [];
  const vertical = [];
  for (const {wire, points} of routes) {
    for (let index = 1; index < points.length; index++) {
      const a = points[index - 1];
      const b = points[index];
      if (samePoint(a, b)) continue;
      if (a.y === b.y) horizontal.push({id: wire.id, index, y: a.y, min: Math.min(a.x, b.x), max: Math.max(a.x, b.x)});
      else if (a.x === b.x) vertical.push({id: wire.id, x: a.x, min: Math.min(a.y, b.y), max: Math.max(a.y, b.y)});
    }
  }
  const bridges = new Map();
  for (const row of horizontal) {
    const cuts = [...new Set(vertical.filter(column => column.id !== row.id &&
      column.x > row.min + crossingRadius && column.x < row.max - crossingRadius &&
      row.y > column.min && row.y < column.max && !junctions.has(`${column.x},${row.y}`)).map(column => column.x))].sort((a, b) => a - b);
    if (!cuts.length) continue;
    const bridge = cuts.filter((x, i) => i === 0 || x - cuts[i - 1] >= crossingRadius * 2);
    if (!bridges.has(row.id)) bridges.set(row.id, new Map());
    bridges.get(row.id).set(row.index, bridge);
  }
  return bridges;
}

function pathOf(points, crossings = new Map()) {
  if (!points.length) return "";
  const path = [`M ${points[0].x} ${points[0].y}`];
  for (let index = 1; index < points.length; index++) {
    const {x, y} = points[index];
    const cuts = crossings.get(index) ?? [];
    const direction = Math.sign(x - points[index - 1].x);
    for (const cut of (direction < 0 ? [...cuts].reverse() : cuts)) {
      path.push(`L ${cut - direction * crossingRadius} ${y} Q ${cut} ${y - 2 * crossingRadius} ${cut + direction * crossingRadius} ${y}`);
    }
    path.push(`L ${x} ${y}`);
  }
  return path.join(" ");
}

function showCrossingBridges(routes, bridges, wireStates, selection) {
  const layer = svg("g", {class: "crossing-bridges", "pointer-events": "none", "aria-hidden": "true"});
  for (const {wire, points} of routes) {
    for (const [index, cuts] of bridges.get(wire.id) ?? []) {
      const {y} = points[index];
      for (const x of cuts) {
        const d = `M ${x - crossingRadius} ${y} Q ${x} ${y - 2 * crossingRadius} ${x + crossingRadius} ${y}`;
        layer.append(svg("path", {d, class: "wire-bridge-clearance"}),
          svg("path", {d, class: `wire-line${selection.has(wire.id) ? " selected" : ""}`, "data-kind": wireStates?.[wire.id]?.kind}));
      }
    }
  }
  return layer;
}

function deviceStateLabel(type, state) {
  if (!state) return "";
  const format = n => Number.isFinite(n) ? n.toLocaleString(getLocale(), {maximumFractionDigits: 2}) : "—";
  if (type === "pressure-sensys") return `${format(state.pressureBar)} bar · ${format(state.currentMa)} mA`;
  if (type === "rtd-evikon") return `${format(state.temperatureC)} °C · ${format(state.resistanceOhm)} Ω`;
  if (type === "controller-e5ec") return !state.powered ? t("Mất nguồn") : state.sensorFault ? t("S.Err · Mất tín hiệu")
    : `PV ${format(state.pv)} · OUT1 ${state.active ? "ON" : "OFF"}`;
  if (type === "weekly-h5s") return state.powered ? `CH1 ${state.ch1 ? "ON" : "OFF"} · CH2 ${state.ch2 ? "ON" : "OFF"}` : t("Mất nguồn");
  if (type.startsWith("level-61f-")) return !state.powered ? t("Mất nguồn") : state.alarmHigh ? t("Báo mức cao") : state.alarmLow ? t("Báo mức thấp") : state.active ? t("Relay hút") : t("Relay nhả");
  if (type === "transformer-ac") return state.powered ? t("Thứ cấp có điện") : t("Mất nguồn");
  if (state.tripped) return "TRIP";
  if (type === "vfd" || type === LS_H100) {
    return !state.powered ? t("Mất nguồn") : state.running ? `${format(state.frequency)} Hz · ${format(Math.round(state.speedRpm))} rpm` : t("Dừng");
  }
  if (type === TPR_3SL) return !state.controlPowered ? t("Mất nguồn") : state.running ? `${format(state.outputPercent)} %` : t("Dừng");
  if (type === THREE_PHASE_HEATER) return state.heating ? t("Đang gia nhiệt") : t("Tắt");
  if (type === "lamp") return state.active ? t("Sáng") : t("Tắt");
  if (type === "buzzer") return state.active ? t("Kêu") : t("Tắt");
  if (state.connection === "star") return t("Đấu sao (Y)");
  if (state.connection === "delta") return t("Đấu tam giác (Δ)");
  if ("running" in state && LOAD_TYPES.has(type)) return state.running ? t("Đang chạy") : t("Dừng");
  if ("mode" in state && state.mode) return state.mode;
  if (type.startsWith("source") || type === "power-supply-dc") return state.active || state.on ? t("Có nguồn") : t("Mất nguồn");
  if (ALTERNATE_TYPES.has(type)) return state.active ? t("NO đóng") : t("NC đóng");
  if (["relay", "contactor", "timer-on", "timer-off"].includes(type)) {
    if (type.startsWith("timer")) return state.active ? t("Đầu ra ON") : t("Đầu ra OFF");
    return state.powered ? t("Cuộn hút") : t("Cuộn nhả");
  }
  if ("closed" in state && typeof state.closed === "boolean") return state.closed ? t("Đóng") : t("Mở");
  return "";
}

function showPin(device, pin, current, connectionCount) {
  const location = pinLocation(device, pin.id);
  const x = location.x - device.x;
  const y = location.y - device.y;
  const label = device.params?.pinLabels?.[pin.id] ?? pin.label ?? pin.id;
  const junction = device.type === "junction";
  const element = svg("g", {
    class: `device-pin${current?.device === device.id && current.pin === pin.id ? " pending" : ""}`,
    "data-pin": pin.id,
    tabindex: "0",
    role: "button",
    "aria-label": t`${device.tag} chân ${label}`,
  });
  if (!junction) {
    const [dx, dy] = directions[location.side];
    element.append(
      svg("text", {
        x: dx ? x - 4 * dx : x + 4,
        y: dy ? y - 17 * dy + 3 : y - 4,
        class: "pin-label",
        "text-anchor": dx === 1 ? "end" : "start",
      }, String(label)),
    );
  }
  const visibleClass = junction ? "device-junction pin-visible" : `pin-visible${connectionCount ? " pin-connected" : ""}`;
  element.append(svg("circle", {cx: x, cy: y, r: junction ? 3.2 : 2.6, class: visibleClass}));
  if (connectionCount > 1 && !junction) element.append(svg("circle", {cx: x, cy: y, r: 2.7, class: "wire-end"}));
  element.append(
    svg("circle", {cx: x, cy: y, r: 9, fill: "transparent"}),
    svg("title", {}, `${device.tag} · ${label}`),
  );
  return element;
}

function showDevice(device, state, selected, pending, counts, master) {
  const {name, pins} = CATALOG[device.type];
  const orientation = orientationOf(device);
  const active = ALTERNATE_TYPES.has(device.type) ? Boolean(state?.powered) : Boolean(state?.active || state?.running || state?.closed || state?.powered);
  const group = svg("g", {
    class: `circuit-device${selected ? " selected" : ""}${state?.tripped ? " is-tripped" : active ? " is-active" : ""}`,
    transform: `translate(${device.x} ${device.y})`,
    "data-device": device.id,
    "data-type": device.type,
    "data-orientation": orientation,
  });
  const label = device.type === "lamp" && device.params?.blink && state?.active ? t("Nhấp nháy") : deviceStateLabel(device.type, state);
  if (device.type !== "junction") {
    const {width, height} = bounds(device);
    const vertical = orientation === "vertical";
    const labelX = vertical ? -(width / 2 + 3) : 0;
    const labelY = vertical ? -6 : -(height / 2 + 2);
    const externalTag = master?.tag ?? device.params?.drawingTag ?? device.tag;
    group.append(
      svg("rect", {
        x: -width / 2, y: -height / 2, width, height,
        class: `device-box${active ? " is-active" : ""}`,
      }),
      svg("g", {class: "device-symbol"}, electricalSymbol(device, state, orientation, master?.type)),
    );
    if (!tagInSymbol(device)) group.append(svg("text", {x: labelX, y: labelY, class: "device-tag", "text-anchor": vertical ? "end" : "middle"},
      externalTag.length > 23 ? `${externalTag.slice(0, 22)}…` : externalTag));
    if (label) group.append(svg("text", {x: labelX, y: vertical ? 9 : height / 2 + 4, class: "device-state", "text-anchor": vertical ? "end" : "middle"}, label));
  } else {
    group.append(svg("circle", {r: 10, class: "junction-target"}));
    if (device.params?.drawingTag) group.append(svg("text", {x: -8, y: -5, class: "rail-tag", "text-anchor": "end"}, device.params.drawingTag));
  }
  group.append(svg("title", {}, `${device.tag} · ${t(name)}${label ? ` · ${label}` : ""}`));
  for (const pin of pins) group.append(showPin(device, pin, pending, counts.get(pinKey(device.id, pin.id)) ?? 0));
  return group;
}

function showWire(wire, points, state, selected, crossings) {
  const kind = state?.kind;
  const shownState = state?.label ?? t(wireStateName[kind]) ?? "";
  const label = [wire.label, selected ? shownState : ""].filter(Boolean).join(" · ");
  const d = pathOf(points, crossings);
  const group = svg("g", {"data-wire": wire.id, "data-kind": kind},
    svg("path", {d, class: `wire-line${selected ? " selected" : ""}`, "data-kind": kind}),
    svg("path", {d, class: "wire-hit"}),
    svg("title", {}, [wire.label, shownState].filter(Boolean).join(" · ") || t("Dây nối")),
  );
  if (label) {
    let segment = 1;
    for (let index = 2; index < points.length; index += 1) {
      const length = distance(points[index - 1], points[index]);
      if (length > distance(points[segment - 1], points[segment])) segment = index;
    }
    const a = points[segment - 1];
    const b = points[segment];
    const vertical = a.x === b.x;
    const x = (a.x + b.x) / 2;
    const y = (a.y + b.y) / 2;
    if (wire.label && distance(a, b) >= 26) group.append(svg("path", {class: "wire-number-mark", d: `M ${x - 5} ${y + 3} l 10 -6`}));
    group.append(svg("text", {
      class: "wire-label", x: x - (vertical ? 7 : 0), y: y - (vertical ? 3 : 6),
      "text-anchor": vertical ? "end" : "middle",
    }, label));
  }
  return group;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export class Schematic {
  constructor(element, hooks) {
    this.element = element;
    this.hooks = hooks;
    this.world = element.querySelector("#drawing-world");
    this.devicesLayer = element.querySelector("#devices-layer");
    this.wiresLayer = element.querySelector("#wires-layer");
    this.interactionLayer = element.querySelector("#interaction-layer");
    this.probeLayer = element.querySelector("#probe-layer");
    this.view = {x: 0, y: 0, scale: 1};
    this.selection = new Set();
    this.tool = "select";
    this.grid = false;
    this.snap = true;
    this.pending = null;
    this.waypoints = [];
    this.devices = new Map();
    this.bind();
  }

  setContext(project, snapshot) {
    this.project = project;
    this.snapshot = snapshot;
    this.devices = new Map(project.devices.map(device => [device.id, device]));
    this.render();
  }

  setTool(tool) {
    this.tool = tool;
    this.element.dataset.tool = tool;
    this.cancelWire();
  }

  markProbes(targets) {
    this.probeLayer.replaceChildren(...targets.map((target, index) => {
      const {x, y} = target.point;
      const mark = this.tool === "ammeter" ? "A" : index === 0 ? "+" : "−";
      return svg("g", {class: "meter-probe", "data-probe": mark, transform: `translate(${x} ${y})`},
        svg("circle", {r: 5}), svg("text", {x: 7, y: -6}, mark));
    }));
  }

  render() {
    if (!this.project) return;
    const focused = document.activeElement?.closest?.(".device-pin");
    const focusedPin = focused && this.element.contains(focused)
      ? {device: focused.closest("[data-device]").dataset.device, pin: focused.dataset.pin} : null;
    const counts = new Map();
    const routes = [];
    for (const wire of this.project.wires) {
      for (const end of [wire.from, wire.to]) {
        const key = pinKey(end.device, end.pin);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      const points = wireRoute(wire, this.devices);
      if (points.length >= 2) routes.push({wire, points});
    }
    const joins = new Set();
    for (const device of this.project.devices) {
      for (const pin of CATALOG[device.type].pins) {
        if (device.type !== "junction" && (counts.get(pinKey(device.id, pin.id)) ?? 0) < 2) continue;
        const {x, y} = pinLocation(device, pin.id);
        joins.add(`${x},${y}`);
      }
    }
    const bridges = wireCrossings(routes, joins);
    this.wiresLayer.replaceChildren(...routes.map(({wire, points}) => showWire(
      wire, points, this.snapshot?.wires?.[wire.id], this.selection.has(wire.id), bridges.get(wire.id),
    )), showCrossingBridges(routes, bridges, this.snapshot?.wires, this.selection));
    this.devicesLayer.replaceChildren(...this.project.devices.map(device => showDevice(
      device, this.snapshot?.devices?.[device.id], this.selection.has(device.id), this.pending, counts, this.devices.get(device.params?.masterId),
    )));
    if (focusedPin) {
      const {device, pin} = focusedPin;
      this.element.querySelector(`[data-device="${CSS.escape(device)}"] [data-pin="${CSS.escape(pin)}"]`)?.focus({preventScroll: true});
    }
  }

  updateView() {
    const {x, y, scale} = this.view;
    this.world.setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);
    this.element.querySelector("#grid-field").classList.toggle("grid-hidden", !this.grid);
    this.hooks.view(scale);
  }

  zoom(factor, x = this.element.clientWidth / 2, y = this.element.clientHeight / 2) {
    const current = this.view;
    const scale = Math.min(maxZoom, Math.max(minZoom, current.scale * factor));
    const ratio = scale / current.scale;
    this.view = {x: x - (x - current.x) * ratio, y: y - (y - current.y) * ratio, scale};
    this.updateView();
  }

  fit() {
    const boxes = this.project.devices.map(device => {
      const {width, height} = bounds(device);
      const tagMargin = orientationOf(device) === "vertical" && device.type !== "junction" ? 8 + Math.min(device.tag.length, 23) * 5 : 15;
      return {left: device.x - width / 2 - tagMargin, top: device.y - height / 2 - 15,
        right: device.x + width / 2 + 15, bottom: device.y + height / 2 + 15};
    });
    for (const wire of this.project.wires) {
      for (const {x, y} of wireRoute(wire, this.devices)) boxes.push({left: x, top: y, right: x, bottom: y});
    }
    if (!boxes.length) {
      this.view = {x: 0, y: 0, scale: 1};
      this.updateView();
      return;
    }
    const left = Math.min(...boxes.map(box => box.left));
    const right = Math.max(...boxes.map(box => box.right));
    const top = Math.min(...boxes.map(box => box.top));
    const bottom = Math.max(...boxes.map(box => box.bottom));
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;
    const scale = Math.min(1.5, Math.max(minZoom, Math.min((width - 36) / (right - left), (height - 70) / (bottom - top))));
    this.view = {
      x: (width - (right + left) * scale) / 2,
      y: (height - 28 - (bottom + top) * scale) / 2,
      scale,
    };
    this.updateView();
  }

  point(event) {
    const rect = this.element.getBoundingClientRect();
    return {x: (event.clientX - rect.left - this.view.x) / this.view.scale, y: (event.clientY - rect.top - this.view.y) / this.view.scale};
  }

  align(point) {
    const step = this.snap ? spacing : 1;
    return {x: Math.round(point.x / step) * step, y: Math.round(point.y / step) * step};
  }

  addFromPalette(type) {
    const rect = this.element.getBoundingClientRect();
    const middle = this.align(this.point({clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2}));
    const available = Array.from({length: 30}, (_, index) => ({x: middle.x + 20 * index, y: middle.y + 20 * index}));
    const target = available.find(point => this.project.devices.every(device => distance(point, device) >= 65)) ?? available.at(-1);
    this.hooks.addDevice(type, target);
  }

  select(ids) {
    this.selection = new Set(ids);
    this.render();
    this.hooks.select(this.selection);
  }

  reveal(id) {
    const device = this.devices.get(id);
    const wire = this.project.wires.find(item => item.id === id);
    let point = device;
    if (!point && wire) {
      const points = wireRoute(wire, this.devices);
      const index = Math.floor(points.length / 2);
      if (index) point = {x: (points[index].x + points[index - 1].x) / 2, y: (points[index].y + points[index - 1].y) / 2};
    }
    if (!point) return;
    const {x, y, scale} = this.view;
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;
    const px = point.x * scale + x;
    const py = point.y * scale + y;
    if (px >= 35 && px <= width - 35 && py >= 35 && py <= height - 55) return;
    this.view.x = width / 2 - point.x * scale;
    this.view.y = (height - 28) / 2 - point.y * scale;
    this.updateView();
  }

  toggleSelected(id) {
    const next = new Set(this.selection);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.select(next);
  }

  cancelWire() {
    this.pending = null;
    this.waypoints = [];
    this.interactionLayer.replaceChildren();
    this.render();
  }

  usePin(endpoint) {
    const position = pinLocation(this.devices.get(endpoint.device), endpoint.pin);
    if (!position) return;
    this.useTarget({...endpoint, point: {x: position.x, y: position.y}});
  }

  useTarget(endpoint) {
    if (this.tool === "voltmeter" || this.tool === "ammeter") {
      this.hooks.measure(endpoint);
      return;
    }
    if (!this.hooks.editable()) return;
    if (!this.pending) {
      this.pending = endpoint;
      this.render();
      this.hooks.status(t("Đã chọn điểm đầu. Bấm chân hoặc đoạn dây đích, hoặc bấm khoảng trống để đặt điểm gấp."));
      if (endpoint.wire) this.previewWire(endpoint.point);
      return;
    }
    if (this.pending.device && this.pending.device === endpoint.device && this.pending.pin === endpoint.pin) {
      this.cancelWire();
      this.hooks.status(t("Đã hủy nối dây."));
      return;
    }
    const start = this.pending;
    const points = this.waypoints;
    this.cancelWire();
    this.hooks.addWire(start, endpoint, points);
  }

  bind() {
    this.element.addEventListener("dragover", event => {
      if (!this.hooks.editable()) return;
      if ([dragType, "text/plain"].some(type => event.dataTransfer.types.includes(type))) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }
    });
    this.element.addEventListener("drop", event => {
      if (!this.hooks.editable()) return;
      const type = event.dataTransfer.getData(dragType) || event.dataTransfer.getData("text/plain");
      if (!Object.hasOwn(CATALOG, type)) return;
      event.preventDefault();
      this.hooks.addDevice(type, this.align(this.point(event)));
    });
    this.element.addEventListener("wheel", event => {
      event.preventDefault();
      const rect = this.element.getBoundingClientRect();
      this.zoom(event.deltaY < 0 ? 1.16 : 1 / 1.16, event.clientX - rect.left, event.clientY - rect.top);
    }, {passive: false});
    this.element.addEventListener("pointerdown", event => this.pointerDown(event));
    this.element.addEventListener("pointermove", event => this.pointerMove(event));
    this.element.addEventListener("pointerup", event => this.pointerUp(event));
    this.element.addEventListener("pointercancel", () => this.cancelGesture());
    this.element.addEventListener("keydown", event => {
      const pin = event.target.closest(".device-pin");
      if (pin && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        event.stopPropagation();
        this.usePin({device: pin.closest("[data-device]").dataset.device, pin: pin.dataset.pin});
      }
    });
  }

  wireTarget(wireId, point) {
    const wire = this.project.wires.find(wire => wire.id === wireId);
    const route = wireRoute(wire, this.devices);
    const tap = nearestTap(route, point);
    if (!tap) return null;
    // The upper SVG path usually receives both clicks at a crossing. Look
    // through it for the other conductor when it is already the start wire.
    if (this.pending?.wire === wireId) {
      let best;
      for (const other of this.project.wires) {
        if (other.id === wireId) continue;
        const otherRoute = wireRoute(other, this.devices);
        const hit = nearestTap(otherRoute, point);
        const cross = hit && tapIntersection(tap, hit);
        if (!cross) continue;
        const offset = distance(point, cross);
        if (offset <= 6 && (!best || offset < best.offset)) best = {other, otherRoute, cross, offset};
      }
      if (best) {
        if (!this.waypoints.length && distance(this.pending.point, best.cross) <= 6) {
          this.pending = {wire: wire.id, tap: nearestTap(route, best.cross), point: best.cross};
        }
        return {wire: best.other.id, tap: nearestTap(best.otherRoute, best.cross), point: best.cross};
      }
    }
    return {wire: wire.id, tap, point: tap.point};
  }

  pointerDown(event) {
    const pan = event.button === 1 || event.button === 0 && (this.tool === "pan" || this.space);
    if (event.button !== 0 && !pan) return;
    const point = this.point(event);
    if (pan) {
      event.preventDefault();
      this.gesture = {kind: "pan", clientX: event.clientX, clientY: event.clientY, ...this.view};
      this.element.classList.add("is-panning");
      if (event.isTrusted) this.element.setPointerCapture(event.pointerId);
      return;
    }
    const pin = event.target.closest(".device-pin");
    const device = event.target.closest("[data-device]");
    const wire = event.target.closest("[data-wire]");
    const metering = this.tool === "voltmeter" || this.tool === "ammeter";
    if (pin && device && (metering || this.hooks.editable()) && !event.shiftKey && !event.ctrlKey) {
      this.usePin({device: device.dataset.device, pin: pin.dataset.pin});
      return;
    }
    if (wire && (metering || this.hooks.editable() && (this.pending || this.tool === "wire")) && !event.shiftKey && !event.ctrlKey) {
      const target = this.wireTarget(wire.dataset.wire, point);
      if (target) this.useTarget(target);
      return;
    }
    if (metering) {
      this.hooks.status(t("Bấm vào chân thiết bị hoặc một đoạn dây dẫn để đặt que đo."));
      return;
    }
    if (this.pending && !device && this.hooks.editable()) {
      this.waypoints.push(this.align(point));
      this.previewWire(point);
      return;
    }
    const id = device?.dataset.device ?? wire?.dataset.wire;
    if (id) {
      if (event.shiftKey || event.ctrlKey) this.toggleSelected(id);
      else if (!this.selection.has(id)) this.select([id]);
      if (wire) this.lastWirePoint = {id, point};
      if (device && this.selection.has(id) && this.hooks.editable() && this.tool === "select") {
        const originals = this.project.devices.filter(item => this.selection.has(item.id)).map(({id, x, y}) => ({id, x, y}));
        this.gesture = {kind: "move", point, originals, anchor: this.devices.get(id)};
        if (event.isTrusted) this.element.setPointerCapture(event.pointerId);
      }
      return;
    }
    if (!event.shiftKey && !event.ctrlKey) this.select([]);
    if (this.tool !== "select") return;
    this.gesture = {kind: "marquee", point, add: event.shiftKey || event.ctrlKey};
    if (event.isTrusted) this.element.setPointerCapture(event.pointerId);
  }

  pointerMove(event) {
    const point = this.point(event);
    if (this.pending) this.previewWire(point);
    const gesture = this.gesture;
    if (!gesture) return;
    if (gesture.kind === "pan") {
      this.view.x = gesture.x + event.clientX - gesture.clientX;
      this.view.y = gesture.y + event.clientY - gesture.clientY;
      this.updateView();
      return;
    }
    if (gesture.kind === "marquee") {
      this.interactionLayer.replaceChildren(svg("rect", {
        x: Math.min(gesture.point.x, point.x), y: Math.min(gesture.point.y, point.y),
        width: Math.abs(gesture.point.x - point.x), height: Math.abs(gesture.point.y - point.y), class: "marquee",
      }));
      return;
    }
    const {anchor, originals} = gesture;
    const next = this.align({x: anchor.x + point.x - gesture.point.x, y: anchor.y + point.y - gesture.point.y});
    const delta = {x: next.x - anchor.x, y: next.y - anchor.y};
    gesture.positions = originals.map(original => ({id: original.id, x: original.x + delta.x, y: original.y + delta.y}));
    this.previewMove(gesture.positions);
  }

  previewWire(point) {
    const start = this.pending?.point;
    if (!start) return;
    const points = orthogonal([start, ...this.waypoints, this.align(point)]);
    this.interactionLayer.replaceChildren(svg("path", {d: pathOf(points), class: "route-preview"}),
      svg("circle", {cx: start.x, cy: start.y, r: 4, fill: "#08776b"}));
  }

  previewMove(positions) {
    const preview = new Map(this.devices);
    for (const position of positions) {
      const device = this.devices.get(position.id);
      preview.set(position.id, {...device, ...position});
      this.devicesLayer.querySelector(`[data-device="${CSS.escape(position.id)}"]`)?.setAttribute("transform", `translate(${position.x} ${position.y})`);
    }
    for (const wire of this.project.wires) {
      const group = this.wiresLayer.querySelector(`[data-wire="${CSS.escape(wire.id)}"]`);
      if (!group) continue;
      const points = wireRoute(wire, preview);
      for (const path of group.querySelectorAll(".wire-line, .wire-hit")) path.setAttribute("d", pathOf(points));
    }
    this.wiresLayer.querySelector(".crossing-bridges")?.replaceChildren();
  }

  pointerUp(event) {
    const gesture = this.gesture;
    if (!gesture) return;
    this.gesture = null;
    this.element.classList.remove("is-panning");
    if (this.element.hasPointerCapture(event.pointerId)) this.element.releasePointerCapture(event.pointerId);
    if (gesture.kind === "marquee") {
      this.interactionLayer.replaceChildren();
      const end = this.point(event);
      const start = gesture.point;
      if (distance(start, end) < 4 / this.view.scale) return;
      const x = [Math.min(start.x, end.x), Math.max(start.x, end.x)];
      const y = [Math.min(start.y, end.y), Math.max(start.y, end.y)];
      const picked = this.project.devices.filter(device => device.x >= x[0] && device.x <= x[1] && device.y >= y[0] && device.y <= y[1]);
      this.select([...(gesture.add ? this.selection : []), ...picked.map(device => device.id)]);
      return;
    }
    if (gesture.kind !== "move" || !gesture.positions) return;
    if (gesture.positions.some((position, index) => !samePoint(position, gesture.originals[index]))) this.hooks.move(gesture.positions);
    else this.render();
  }

  cancelGesture() {
    this.gesture = null;
    this.element.classList.remove("is-panning");
    this.interactionLayer.replaceChildren();
    this.render();
  }

  splitPoint(wire) {
    const route = wireRoute(wire, this.devices);
    const point = this.lastWirePoint?.id === wire.id ? this.lastWirePoint.point : null;
    const tap = nearestTap(route, point);
    return tap?.end ? nearestTap(route, null) : tap;
  }
}
