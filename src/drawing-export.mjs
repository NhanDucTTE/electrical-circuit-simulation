import {t} from "./i18n.mjs";
import {svg} from "./ui-elements.mjs";

const arities = {M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0};
const layer = {wire: "DAY-DAN", device: "THIET-BI", pin: "DAU-NOI", text: "CHU"};

// Curves are flattened separately. This keeps wire corners exact and preserves each pen lift.
export function pathStrokes(d, curvePoints) {
  const tokens = d.match(/[a-z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi) ?? [];
  const strokes = [];
  let cursor = 0, command, last = "", pos = [0, 0], start = pos, control = pos, vertices = [];
  const finish = closed => {
    if (vertices.length > 1) strokes.push({vertices, closed});
    vertices = [];
  };
  while (cursor < tokens.length) {
    if (/^[a-z]$/i.test(tokens[cursor])) command = tokens[cursor++];
    const key = command?.toUpperCase();
    if (!(key in arities)) throw new Error(t("Lệnh hình học SVG không hợp lệ."));
    const size = arities[key];
    const values = tokens.slice(cursor, cursor + size).map(Number);
    if (values.length !== size || values.some(v => !Number.isFinite(v))) throw new Error(t("Tọa độ SVG không hợp lệ."));
    cursor += size;
    const relative = command !== key;
    const xy = i => [values[i] + (relative ? pos[0] : 0), values[i + 1] + (relative ? pos[1] : 0)];
    const reflected = () => [pos[0] * 2 - control[0], pos[1] * 2 - control[1]];
    let end;
    if (key === "Z") {
      finish(true);
      pos = start;
      command = null;
    } else if (key === "M") {
      finish(false);
      start = pos = xy(0);
      vertices.push(pos);
      command = relative ? "l" : "L";
    } else {
      if (!vertices.length) vertices.push(pos);
      if (key === "H") end = [values[0] + (relative ? pos[0] : 0), pos[1]];
      else if (key === "V") end = [pos[0], values[0] + (relative ? pos[1] : 0)];
      else end = xy(size - 2);
      let curve;
      if (key === "C" || key === "S") {
        const c1 = key === "C" ? xy(0) : last === "C" || last === "S" ? reflected() : pos;
        control = xy(key === "C" ? 2 : 0);
        curve = "C " + [...c1, ...control, ...end].join(" ");
      } else if (key === "Q" || key === "T") {
        control = key === "Q" ? xy(0) : last === "Q" || last === "T" ? reflected() : pos;
        curve = "Q " + [...control, ...end].join(" ");
      } else if (key === "A") {
        curve = "A " + [...values.slice(0, 5), ...end].join(" ");
      }
      if (curve) vertices.push(...curvePoints("M " + pos.join(" ") + " " + curve));
      if (vertices.at(-1)[0] !== end[0] || vertices.at(-1)[1] !== end[1]) vertices.push(end);
      pos = end;
    }
    last = key;
  }
  finish(false);
  return strokes;
}

function sampleCurve(d) {
  const el = svg("path", {d});
  const len = el.getTotalLength();
  const steps = Math.min(256, Math.max(3, Math.ceil(len / 2)));
  return Array.from({length: steps - 1}, (_, i) => {
    const {x, y} = el.getPointAtLength(len * (i + 1) / steps);
    return [x, y];
  });
}

function paperFor(board, name) {
  if (!board.project?.devices.length) throw new Error(t("Sơ đồ chưa có phần tử để xuất."));
  const group = svg("g", {}, board.wiresLayer.cloneNode(true), board.devicesLayer.cloneNode(true));
  group.querySelectorAll(".wire-hit, .device-box, .junction-target, [fill='transparent'], .device-state, .lamp-light, .pin-connected, title")
    .forEach(el => el.remove());
  group.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));
  group.querySelectorAll(".selected, .pending, .is-active, .is-tripped").forEach(el =>
    el.classList.remove("selected", "pending", "is-active", "is-tripped"));
  group.querySelectorAll("[data-kind]").forEach(el => el.removeAttribute("data-kind"));
  const wires = new Map(board.project.wires.map(wire => [wire.id, wire]));
  group.querySelectorAll("[data-wire] .wire-label").forEach(el => {
    const label = wires.get(el.closest("[data-wire]").dataset.wire)?.label;
    if (label) el.textContent = label;
    else el.remove();
  });
  const devices = new Map(board.project.devices.map(device => [device.id, device]));
  group.querySelectorAll(".device-tag").forEach(el => {
    const device = devices.get(el.closest("[data-device]").dataset.device);
    if (device) el.textContent = devices.get(device.params?.masterId)?.tag ?? device.params?.drawingTag ?? device.tag;
  });
  const paper = document.createElement("section");
  paper.className = "drawing-print-paper";
  paper.setAttribute("aria-hidden", "true");
  const title = document.createElement("h1");
  title.textContent = name;
  const drawing = svg("svg", {xmlns: "http://www.w3.org/2000/svg"}, group);
  paper.append(title, drawing);
  document.body.append(paper);
  const box = group.getBBox();
  const margin = 12;
  const bounds = [box.x - margin, box.y - margin, box.width + margin * 2, box.height + margin * 2];
  drawing.setAttribute("viewBox", bounds.join(" "));
  return {paper, group, bounds, drawing};
}

function cadScene({group, bounds, drawing}) {
  const entities = [];
  const rootInverse = drawing.getScreenCTM().inverse();
  for (const el of group.querySelectorAll("path, circle, rect, text, line, polyline, polygon, ellipse")) {
    if (el.closest(".crossing-bridges")) continue; // The wire itself already includes the bridge curve.
    const transform = rootInverse.multiply(el.getScreenCTM());
    const map = ([x, y]) => {
      const p = new DOMPoint(x, y).matrixTransform(transform);
      return [Math.round(p.x * 10000) / 10000, Math.round(p.y * 10000) / 10000];
    };
    const value = key => Number(el.getAttribute(key) || 0);
    const name = el.tagName;
    const channel = el.closest("[data-wire]") ? layer.wire : el.closest("[data-pin]") ? layer.pin : layer.device;
    const dashed = getComputedStyle(el).strokeDasharray !== "none";
    const line = (vertices, closed = false) => {
      if (vertices.length > 1) entities.push(["path", channel, closed, dashed, vertices.flatMap(map)]);
    };
    if (name === "path") {
      for (const stroke of pathStrokes(el.getAttribute("d") || "", sampleCurve)) line(stroke.vertices, stroke.closed);
    } else if (name === "rect") {
      const x = value("x"), y = value("y"), w = value("width"), h = value("height");
      line([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true);
    } else if (name === "line") {
      line([[value("x1"), value("y1")], [value("x2"), value("y2")]]);
    } else if (name === "polyline" || name === "polygon") {
      line(Array.from(el.points, ({x, y}) => [x, y]), name === "polygon");
    } else if (name === "circle") {
      const radius = value("r") * Math.hypot(transform.a, transform.b);
      const kind = el.matches(".wire-end, .device-junction") ? "dot" : "circle";
      entities.push([kind, channel, ...map([value("cx"), value("cy")]), radius]);
    } else if (name === "ellipse") {
      const x = value("cx"), y = value("cy"), rx = value("rx"), ry = value("ry");
      line(Array.from({length: 48}, (_, i) => [x + Math.cos(i * Math.PI / 24) * rx, y + Math.sin(i * Math.PI / 24) * ry]), true);
    } else if (name === "text" && el.getNumberOfChars()) {
      const start = el.getStartPositionOfChar(0);
      const height = parseFloat(getComputedStyle(el).fontSize) * 0.72 * Math.hypot(transform.c, transform.d);
      entities.push(["text", layer.text, ...map([start.x, start.y]), height, Math.atan2(transform.b, transform.a), el.textContent]);
    }
  }
  return {entities, bounds};
}

let exporting = false;
export async function exportDrawing(format, board, name) {
  if (format !== "pdf" && format !== "dwg") throw new Error(t("Định dạng xuất chưa được hỗ trợ."));
  if (!window.desktop?.exportDrawing) throw new Error(t("Hãy mở bản Windows để xuất bản vẽ."));
  if (exporting) throw new Error(t("Đang xuất bản vẽ. Hãy chờ tệp hiện tại hoàn tất."));
  exporting = true;
  let page;
  try {
    page = paperFor(board, name);
    return await window.desktop.exportDrawing(format, name, format === "dwg" ? cadScene(page) : null);
  } finally {
    page?.paper.remove();
    exporting = false;
  }
}
