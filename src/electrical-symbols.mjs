import {ALTERNATE_TYPES, BREAKER_TYPES, CATALOG, LOAD_TYPES, LS_H100, SIX_PIN_MOTOR, SOURCE_TYPES, THREE_PHASE_HEATER, TPR_3SL} from "./model.mjs";
import {svg} from "./ui-elements.mjs";
import {lampColor} from "./signals.mjs";

const port = 58;
const polePitch = 16;
const transpose = "matrix(0 1 1 0 0 0)";
const coilTypes = new Set(["relay", ...ALTERNATE_TYPES, "contactor", "timer-on", "timer-off"]);

function path(d, attributes = {}) {
  return svg("path", {d, ...attributes});
}

function mechanical(d) {
  return path(d, {class: "symbol-mechanical", "stroke-dasharray": "3 2"});
}

function paperCircle(cx, cy, r) {
  return svg("circle", {cx, cy, r, class: "symbol-paper"});
}

function symbolText(value, x, y, vertical, size = 9) {
  const transform = `translate(${x} ${y})${vertical ? ` ${transpose}` : ""}`;
  return svg("text", {
    transform, "text-anchor": "middle", "dominant-baseline": "central", "font-size": size,
    "font-weight": 600,
  }, value);
}

function poleRows(type, side) {
  const pins = CATALOG[type].pins.filter(pin => pin.side === side);
  return pins.map((pin, index) => (index - (pins.length - 1) / 2) * polePitch);
}

export function tagInSymbol(device) {
  return coilTypes.has(device.type) && Boolean(device.tag) && [...device.tag].length <= 6;
}

function source(type) {
  return poleRows(type, "right").map(y => path(`M-24 ${y - 4.5}V${y + 4.5}L-12 ${y}Z M-12 ${y}H${port}`));
}

function powerSupply() {
  return [
    path(`M-${port} -8H-19 M-${port} 8H-19 M19 -8H${port} M19 8H${port}`),
    svg("rect", {x: -19, y: -15, width: 38, height: 30, class: "symbol-paper"}),
    path("M-19 15 19-15 M-15-3q3-5 6 0t6 0 M5 4h10 M5 9h2m2 0h2m2 0h2"),
  ];
}

function contactBlades(y, closed, nc) {
  const fixedTip = nc ? -4 : 0;
  const blade = closed ? fixedTip : -10;
  return path(`M-${port} ${y}H-14${nc ? `V${y + fixedTip}H-9` : ""} M${port} ${y}H14L${nc && closed ? -11 : -14} ${y + blade}`);
}

function contact(device, state, masterType) {
  const {type, params} = device;
  const nc = type.endsWith("-nc") || params?.normalClosed === true;
  const closed = state?.closed ?? nc;
  const pieces = [contactBlades(0, closed, nc)];
  if (type.startsWith("push-")) {
    pieces.push(mechanical("M0 -10V-20"), path("M0 -20V-24 M-5-24H5"), paperCircle(0, -27, 3));
  } else if (type === "float" || type === "dry-contact") {
    pieces.push(svg("rect", {x: -28, y: -18, width: 56, height: 36, "stroke-dasharray": "3 2"}));
    if (type === "float") pieces.push(mechanical("M0 -10V-20"), path("M-8-20q4-4 8 0t8 0"));
  } else if (masterType === "overload") {
    pieces.push(mechanical("M0 -10V-16"), path("M-5-19v3H-2v-6H2v6H5v-3"));
  }
  return pieces;
}

function selector(device, state) {
  const mode = state?.mode ?? device.params?.initial;
  const pieces = [
    path(`M-${port} 0H-41V-16H-13 M-41 0V16H-13 M13 -16H34V-8H${port} M13 16H34V8H${port}`),
    svg("rect", {x: -31, y: -24, width: 55, height: 48, "stroke-dasharray": "3 2"}),
    mechanical("M0 -30V17"),
    path("M-5-30H5 M0 -35v5"),
  ];
  const branches = [[-16, "AUTO"], [16, "MAN"]];
  for (const [y, position] of branches) {
    pieces.push(path(`M13 ${y}L-13 ${mode === position ? y : y - 6}`));
  }
  return pieces;
}

function gangedContacts(type, closed) {
  const rows = poleRows(type, "left");
  return [
    ...rows.map(y => contactBlades(y, closed, false)),
    mechanical(`M0 ${rows[0] - 4}V${rows.at(-1) + 4}`),
  ];
}

function circuitBreaker(device, state) {
  const rows = poleRows(device.type, "left");
  const moulded = device.type.startsWith("mccb");
  const closed = state?.closed === true;
  const pieces = [];
  for (const y of rows) {
    pieces.push(
      path(`M-${port} ${y}H-27 M9 ${y}H-1L-27 ${closed ? y : y - 8} M33 ${y}H${port}`),
      svg("rect", {x: 9, y: y - 7.5, width: 24, height: 15, class: "symbol-paper"}),
      path(`M9 ${y}h4v-3h5v6h5v-3h10 M25 ${y - 7.5}V${y + 7.5} M28 ${y - 2.5}l3 2.5-3 2.5`),
    );
    if (moulded) pieces.push(path(`M26 ${y - 2.5}l2 2.5-2 2.5`));
  }
  if (rows.length > 1) {
    pieces.push(mechanical(`M-15 ${rows[0] - 10}V${rows.at(-1) + 2}`));
  }
  const handleY = rows[0] - 11;
  pieces.push(svg("rect", {x: -19, y: handleY - 4, width: 8, height: 8, class: "symbol-paper"}),
    path(`M-15 ${handleY - 7}V${handleY + 7} M-22 ${handleY}H-8`));
  return pieces;
}

function overload() {
  return poleRows("overload", "left").flatMap(y => [
    path(`M-${port} ${y}H-15 M15 ${y}H${port}`),
    svg("rect", {x: -15, y: y - 7.5, width: 30, height: 15, class: "symbol-paper"}),
    path(`M-15 ${y}h6v-4h7v8h9v-4h8`),
  ]);
}

function coil(device, vertical) {
  const timer = device.type.startsWith("timer-");
  const longSide = 18;
  const shortSide = 9;
  const x = vertical ? shortSide : longSide;
  const y = vertical ? longSide : shortSide;
  const pieces = [
    path(`M-${port} 0H-${x} M${x} 0H${port}`),
    svg("rect", {x: -x, y: -y, width: x * 2, height: y * 2, class: "symbol-paper"}),
  ];
  if (timer) {
    if (vertical) pieces.push(path(`M-${x} -${y - 7}H${x} M-${x} -${y}L${x} -${y - 7} M${x} -${y}L-${x} -${y - 7}`));
    else pieces.push(path(`M-${x - 7} -${y}V${y} M-${x} -${y}L-${x - 7} ${y} M-${x} ${y}L-${x - 7} -${y}`));
  }
  if (tagInSymbol(device)) {
    const offset = timer ? 3.5 : 0;
    const size = device.tag.length > 4 ? 7.5 : 9;
    pieces.push(symbolText(device.tag, vertical ? 0 : offset, vertical ? offset : 0, vertical, size));
  }
  return pieces;
}

function lamp(device, vertical, state) {
  const mark = typeof device.params?.lampMark === "string" ? device.params.lampMark.trim().slice(0, 3) : "";
  return [
    path(`M-${port} 0H-11 M11 0H${port}`), paperCircle(0, 0, 11),
    ...(state?.active ? [svg("circle", {r: 10.2, class: "lamp-light", fill: lampColor(device.params),
      stroke: "none", "data-blink": String(device.params?.blink === true)})] : []),
    path("M-7.8-7.8l-3.5-3.5 M7.8-7.8l3.5-3.5 M-7.8 7.8l-3.5 3.5 M7.8 7.8l3.5 3.5"),
    mark ? symbolText(mark, 0, 0, vertical, 9) : path("M-4-4l8 8 M4-4l-8 8"),
  ];
}

function buzzer(vertical) {
  const d = vertical
    ? "M-11-11V0A11 11 0 0 0 11 0V-11Z M-6 14q6 5 12 0"
    : "M-11-11H0A11 11 0 0 1 0 11H-11Z M14-6q5 6 0 12";
  return [path(`M-${port} 0H-11 M11 0H${port}`), path(d, {class: "symbol-paper"})];
}

function motor(type, vertical) {
  const sixPin = type === SIX_PIN_MOTOR;
  const center = sixPin ? 0 : 9;
  const radius = 24;
  const cables = poleRows(type, "left").map(y => {
    const reach = Math.sqrt(radius ** 2 - y ** 2);
    const incoming = `M-${port} ${y}H${(center - reach).toFixed(2)}`;
    const outgoing = sixPin ? ` M${(center + reach).toFixed(2)} ${y}H${port}` : "";
    return path(incoming + outgoing);
  });
  return [
    ...cables, paperCircle(center, 0, radius),
    symbolText("M", vertical ? center - 6 : center, vertical ? 0 : -6, vertical, 13),
    symbolText("3~", vertical ? center + 8 : center, vertical ? 0 : 8, vertical, 11),
  ];
}

function heater() {
  return [
    svg("rect", {x: -24, y: -25, width: 48, height: 50, class: "symbol-paper"}),
    ...poleRows(THREE_PHASE_HEATER, "left").map(y =>
      path(`M-${port} ${y}H-18l4-4 6 8 6-8 6 8 6-8 4 4h4`)),
  ];
}

const instrumentMarks = {
  "pressure-sensys": ["PT", "4–20 mA"],
  "rtd-evikon": ["RTD", "Pt100"],
  "controller-e5ec": ["E5EC", "OUT"],
  "weekly-h5s": ["H5S", "2 CH"],
  "level-61f-g2": ["61F-G2", "LEVEL"],
  "level-61f-g3": ["61F-G3", "LEVEL"],
  "phase-relay": ["PR", "3~ ΔU"],
  "vfd": ["VFD", "INV 3~"],
  [LS_H100]: ["H100", "VFD 3~"],
  [TPR_3SL]: ["SCR", "TPR-3SL"],
  "soft-starter": ["SST", "SOFT 3~"],
  "power-meter": ["MFM", "V/A/Hz"],
};

function instrumentBlock(type, vertical) {
  const [name, descriptor] = instrumentMarks[type];
  const left = poleRows(type, "left");
  const right = poleRows(type, "right");
  const halfHeight = Math.max(19, ((Math.max(left.length, right.length) - 1) * polePitch) / 2 + 7);
  return [
    ...left.map(y => path(`M-${port} ${y}H-24`)),
    ...right.map(y => path(`M24 ${y}H${port}`)),
    svg("rect", {x: -24, y: -halfHeight, width: 48, height: 2 * halfHeight, class: "symbol-paper"}),
    symbolText(name, vertical ? -6 : 0, vertical ? 0 : -6, vertical, 10),
    symbolText(descriptor, vertical ? 8 : 0, vertical ? 0 : 8, vertical, 7),
  ];
}

function transformer() {
  return [
    path(`M-${port} -8H-18v-10h7 M-${port} 8H-18v10h7 M${port} -8H18v-10h-7 M${port} 8H18v10h-7`),
    path("M-11 -18q-11 4.5 0 9q-11 4.5 0 9q-11 4.5 0 9q-11 4.5 0 9 M11 -18q11 4.5 0 9q11 4.5 0 9q11 4.5 0 9q11 4.5 0 9"),
    path("M-2 -19v38 M2 -19v38"),
  ];
}

function symbolParts(device, state, vertical, masterType) {
  const {type} = device;
  if (SOURCE_TYPES.has(type)) return source(type);
  if (BREAKER_TYPES.has(type)) return circuitBreaker(device, state);
  if (type === THREE_PHASE_HEATER) return heater();
  if (LOAD_TYPES.has(type)) return motor(type, vertical);
  if (coilTypes.has(type)) return coil(device, vertical);
  if (Object.hasOwn(instrumentMarks, type)) return instrumentBlock(type, vertical);

  switch (type) {
    case "power-supply-dc": return powerSupply();
    case "transformer-ac": return transformer();
    case "main-3ph": return gangedContacts(type, state?.closed === true);
    case "overload": return overload();
    case "selector": return selector(device, state);
    case "lamp": return lamp(device, vertical, state);
    case "buzzer": return buzzer(vertical);
    case "fuse": return [
      svg("rect", {x: -13, y: -5, width: 26, height: 10, class: "symbol-paper"}),
      path(state?.closed === false ? `M-${port} 0H-3 M3 0H${port}` : `M-${port} 0H${port}`),
    ];
    case "terminal": return [path(`M-${port} 0H-5 M5 0H${port}`), paperCircle(0, 0, 5)];
    case "junction": return [svg("circle", {r: 3.6, fill: "currentColor", stroke: "none"})];
    default: return contact(device, state, masterType);
  }
}

export function electricalSymbol(device, state, orientation = "horizontal", masterType) {
  const vertical = orientation === "vertical";
  return svg("g", {class: "electrical-symbol", transform: vertical ? transpose : null}, ...symbolParts(device, state, vertical, masterType));
}
