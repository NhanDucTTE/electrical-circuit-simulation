const svgNs = "http://www.w3.org/2000/svg";
const iconPaths = {
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 11v6m0-10h.01",
  export: "M4 12v8h16v-8 M12 15V3m-5 5 5-5 5 5",
  sound: "M3 9h4l5-4v14l-5-4H3z M15 8a5 5 0 0 1 0 8 M18 5a9 9 0 0 1 0 14",
  mute: "M3 9h4l5-4v14l-5-4H3z M16 9l5 6m0-6-5 6",
  brand: "M3 14V5h5m8 0h5v9m0 5H3m8-16-3 7h5l-2 5 6-7h-5l2-5",
  document: "M6 3h8l4 4v14H6z M14 3v5h4 M9 12h6m-6 4h6",
  "add-file": "M5 3h9l5 5v13H5z M14 3v5h5m-7 3v7m-3-3h6",
  folder: "M3 7V5h7l2 2h9v3 M3 7v12h16l3-9H6l-3 9",
  save: "M4 4h13l3 3v13H4z M8 4v6h8V4m1 16v-7H7v7",
  "save-as": "M4 4h13l3 3v4 M4 4v16h8m-4-7h4 M8 4v5h8V4m-2 16 1-4 5-5 3 3-5 5z",
  examples: "M4 5h7v14H4z m9 0h7v14h-7 M7 9h1m-1 4h1m8-4h1m-1 4h1",
  chevron: "m7 9 5 5 5-5",
  play: "M8 5l11 7-11 7z",
  pause: "M8 5v14m8-14v14",
  step: "M5 5l11 7-11 7z m14 0v14",
  reset: "M4 11a8 8 0 1 1 2 7 M4 5v6h6",
  offline: "M8 6v5m8-5v5M6 11h12v2a6 6 0 0 1-6 6v2",
  search: "M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z m-2 5 5 5",
  grip: "M8 5h.01M16 5h.01M8 12h.01M16 12h.01M8 19h.01M16 19h.01",
  sheet: "M4 4h16v16H4z M8 4v16m8-16v16m-9-8h11",
  cursor: "m5 3 12 9-6 1-2 6z",
  wire: "M5 4a2 2 0 1 0 0 4 2 2 0 1 0 0-4zm14 12a2 2 0 1 0 0 4 2 2 0 1 0 0-4zM7 6h6v12h4",
  hand: "M8 12V6a1 1 0 0 1 2 0v5-7a1 1 0 0 1 2 0v7-6a1 1 0 0 1 2 0v6-3a1 1 0 0 1 2 0v6l2-2c2-1 3 1 2 2l-4 6H9l-4-6c-1-2 1-3 3-2z",
  rotate: "M18 5h4v5m-1-4a8 8 0 0 0-14-2M3 14v5h5m-4-1a8 8 0 0 0 14 2M10 9h5v6h-5z",
  undo: "M9 5l-5 5 5 5M4 10h10a5 5 0 0 1 5 5v4",
  redo: "m15 5 5 5-5 5m5-5H10a5 5 0 0 0-5 5v4",
  duplicate: "M8 8h12v12H8z M5 16H4V4h12v1",
  paste: "M9 5H6v16h12V5h-3 M9 3h6v4H9z M9 12h6m-6 4h6",
  trash: "M4 6h16M9 6V3h6v3m2 0-1 15H8L7 6m4 4v7m2-7v7",
  empty: "M2 7h4m12 0h4M6 7v10h12V7M6 10h3m6 0h3m-9-2v4m6-4v4m-6-2h6M9 17v4m6-4v4",
  grid: "M4 4h16v16H4z M4 9h16m-16 6h16M9 4v16m6-16v16",
  snap: "M5 4h4v9a3 3 0 0 0 6 0V4h4v9a7 7 0 0 1-14 0z M5 8h4m6 0h4",
  minus: "M5 12h14",
  plus: "M5 12h14m-7-7v14",
  fit: "M4 9V4h5m6 0h5v5m0 6v5h-5m-6 0H4v-5m4-3h8m-4-4v8",
  settings: "M4 6h16M4 12h16M4 18h16M8 4v4m8 2v4m-5 2v4",
  warning: "M12 4 3 20h18z M12 9v5m0 3h.01",
  list: "M8 5h12M8 12h12M8 19h12M4 5h.01M4 12h.01M4 19h.01",
  tests: "M5 4h14v16H5z m3 7 3 3 5-6",
  collapse: "m6 9 6 5 6-5M5 19h14",
  close: "M6 6l12 12m0-12L6 18",
  pin: "M9 3h6l-1 7 3 3v2H7v-2l3-3z M12 15v6",
};

export function html(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== false && value != null) node.setAttribute(key, value === true ? "" : value);
  }
  node.append(...children.filter(child => child != null));
  return node;
}

export function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS(svgNs, tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== false && value != null) node.setAttribute(key, value);
  }
  node.append(...children.filter(child => child != null));
  return node;
}

export function putIcon(node, name) {
  const path = iconPaths[name];
  if (path) node.replaceChildren(svg("svg", {viewBox: "0 0 24 24", "aria-hidden": "true"}, svg("path", {d: path})));
  return node;
}

export function icon(name) {
  return putIcon(html("span", {"data-icon": name}), name);
}
