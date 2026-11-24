import {t} from "./i18n.mjs";
import {createDevice, createId} from "./model.mjs";

const samePoint = (a, b) => a.x === b.x && a.y === b.y;
const sameEnd = (a, b) => a.device === b.device && a.pin === b.pin;
const coords = ({x, y}) => ({x, y});

// Project onto the conductor itself. Corners and existing terminals are exact targets.
export function nearestTap(route, pointer) {
  let closest = null;
  for (let index = 1; index < route.length; index++) {
    const a = route[index - 1];
    const b = route[index];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (!length) continue;
    const horizontal = a.y === b.y;
    const axis = horizontal ? "x" : "y";
    const low = Math.min(a[axis], b[axis]);
    const high = Math.max(a[axis], b[axis]);
    const location = pointer ? Math.round(pointer[axis]) : (low + high) / 2;
    const point = {...coords(a), [axis]: Math.max(low, Math.min(high, location))};
    const score = pointer ? Math.hypot(point.x - pointer.x, point.y - pointer.y) : -length;
    if (!closest || score < closest.score) closest = {index, point, score, segment: {axis, low, high}};
  }
  if (!closest) return null;
  const {index, point, segment} = closest;
  if (samePoint(point, route[0])) return {point, segment, end: "from"};
  if (samePoint(point, route.at(-1))) return {point, segment, end: "to"};
  // Keep even a single straight leg manual after splitting an auto-routed wire.
  const inside = (points, start, end) => {
    const clean = points.filter(p => !samePoint(p, start) && !samePoint(p, end)).map(coords);
    return clean.length ? clean : [{x: (start.x + end.x) / 2, y: (start.y + end.y) / 2}];
  };
  return {point, segment, before: inside(route.slice(1, index), route[0], point),
    after: inside(route.slice(index, -1), point, route.at(-1))};
}

export function tapIntersection(a, b) {
  if (a.segment.axis === b.segment.axis) return null;
  const [horizontal, vertical] = a.segment.axis === "x" ? [a, b] : [b, a];
  const x = vertical.point.x;
  const y = horizontal.point.y;
  return x >= horizontal.segment.low && x <= horizontal.segment.high && y >= vertical.segment.low && y <= vertical.segment.high
    ? {x, y} : null;
}

function insertJunction(project, point) {
  const tags = new Set(project.devices.map(item => item.tag.toUpperCase()));
  let number = 1;
  while (tags.has("J" + number)) number++;
  const node = createDevice("junction", point.x, point.y, "J" + number);
  project.devices.push(node);
  return {device: node.id, pin: "J"};
}

export function splitConductor(project, wireId, tap, existingEnd) {
  const index = project.wires.findIndex(item => item.id === wireId);
  const wire = project.wires[index];
  if (!wire) throw new Error(t("Dây đã thay đổi. Hãy chọn lại điểm nối."));
  if (tap.end) return wire[tap.end];
  const join = existingEnd ?? insertJunction(project, tap.point);
  project.wires.splice(index, 1, {...wire, to: join, points: tap.before},
    {...wire, id: createId(), from: join, points: tap.after});
  return join;
}

// Called on the editor's draft so both splits and the branch form a single undo step.
export function connectTargets(project, start, end, waypoints) {
  if (start.wire && start.wire === end.wire) return {message: t("Hai điểm đã nằm trên cùng dây.")};
  // A hit on the end of an existing wire already has a real terminal. Reuse
  // it so coincident independent endpoints still receive an electrical link.
  const existing = target => target.tap?.end
    ? {...project.wires.find(w => w.id === target.wire)[target.tap.end], point: target.point}
    : target;
  start = existing(start);
  end = existing(end);
  for (const [tap, pin] of [[start, end], [end, start]]) {
    const wire = tap.wire && !pin.wire && project.wires.find(item => item.id === tap.wire);
    if (wire && (sameEnd(pin, wire.from) || sameEnd(pin, wire.to))) return {message: t("Điểm và chân này đã nằm trên cùng dây.")};
  }
  const resolve = (target, existing) => target.wire
    ? splitConductor(project, target.wire, target.tap, existing)
    : {device: target.device, pin: target.pin};
  const coincident = start.point && end.point && samePoint(start.point, end.point) && !waypoints.length;
  if (coincident && (start.wire || end.wire)) {
    const [first, second] = start.wire ? [end, start] : [start, end];
    const shared = resolve(first);
    resolve(second, shared);
    return {selected: shared.device, message: t("Đã tạo nút nối ngay tại giao điểm.")};
  }
  const from = resolve(start);
  const to = resolve(end);
  const duplicate = sameEnd(from, to) || project.wires.some(wire =>
    sameEnd(wire.from, from) && sameEnd(wire.to, to) || sameEnd(wire.from, to) && sameEnd(wire.to, from));
  if (duplicate) return {message: t("Hai điểm này đã nối trực tiếp.")};
  const id = createId();
  project.wires.push({id, from, to, label: "", points: waypoints.map(coords)});
  return {selected: id, message: t("Đã nối dây. Có thể gắn nhãn dây ở bảng Thuộc tính.")};
}
