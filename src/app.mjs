import {t, getLanguage, getLocale, setLanguage, restoreLanguage, bindStaticUI, translateGenerated} from "./i18n.mjs";
import {ALTERNATE_TYPES, CATALOG, createDevice, createId, createProject, getDeviceInputs, parseProject, pinKey, serializeProject, supportsMasterState, validateProject} from "./model.mjs";
import {Simulator, runScenario} from "./simulator.mjs";
import {electricalSymbol} from "./electrical-symbols.mjs";
import {Schematic, dragType, orientationOf} from "./schematic.mjs";
import {connectTargets, splitConductor} from "./wire-branches.mjs";
import {measureCurrent, measureVoltage, probePin, referenceFor, supportsOperatingCurrent} from "./probes.mjs";
import {ScenarioEditor, cell, displayValue, renderScenarios, stateLabels, table} from "./scenarios-ui.mjs";
import {html, icon, putIcon, svg} from "./ui-elements.mjs";
import {normalizeComponentTag, syncContactTags} from "./model.mjs";
import {BuzzerAudio, lampColor} from "./signals.mjs";
import {exportDrawing} from "./drawing-export.mjs";
import {bomMaterials, createBomCsv} from "./bom-export.mjs";
import {instrumentInspector, instrumentParameter} from "./instrument-ui.mjs";
import {instrumentStates} from "./instruments.mjs";
import {captureProjectClipboard, planProjectPaste} from "./project-clipboard.mjs";
import {circuitTemplates, createCircuitTemplate} from "./circuit-templates.mjs";

const $ = id => document.getElementById(id);
const buttons = action => document.querySelectorAll(`button[data-action="${action}"]`);
const setDisabled = (action, value) => buttons(action).forEach(button => { button.disabled = value; });
const setPressed = (action, value) => buttons(action).forEach(button => button.setAttribute("aria-pressed", String(value)));
const desktop = globalThis.desktop;
const recoveryKey = "mo-phong-tu-dien-recovery-v1";
const historyLimit = 100;
const sounder = new BuzzerAudio();
restoreLanguage(globalThis.localStorage);
const translateStaticUI = bindStaticUI(document.documentElement);
translateStaticUI();
document.documentElement.lang = getLanguage();
$("language-selection").value = getLanguage();
desktop?.setLanguage?.(getLanguage()).catch(error => status(errorMessage(error)));
let project = createProject(t("Dự án mới"));
let savedPayload = serializeProject(project);
let currentPath = null;
let dirty = false;
let history = [];
let future = [];
let results = new Map();
let modelIssues = [];
let sim = null;
let snapshot = null;
let mode = "idle";
let clock = null;
let activeTab = "warnings";
let recovery = null;
let previousLogLength = 0;
let simViewSignature = "";
let nativeBusy = false;
let probes = [];
let previewMeterSim = null;
let clipboard = null;
let activeProject;
const projects = [];
const heldInputs = new Set();

for (const holder of document.querySelectorAll("[data-icon]")) putIcon(holder, holder.dataset.icon);

const board = new Schematic($("schematic"), {
  editable,
  addDevice,
  addWire,
  measure: placeProbe,
  move: positions => change(next => {
    for (const position of positions) {
      const device = next.devices.find(item => item.id === position.id);
      if (device) Object.assign(device, position);
    }
  }),
  select: () => {
    renderInspector();
    updateButtons();
  },
  status,
  view: scale => { $("zoom-level").textContent = `${Math.round(scale * 100)}%`; },
});

const scenarioEditor = new ScenarioEditor($("scenario-dialog"), scenario => change(next => {
  const index = next.scenarios.findIndex(item => item.id === scenario.id);
  if (index === -1) next.scenarios.push(scenario);
  else next.scenarios[index] = scenario;
}));

function editable() {
  return mode !== "running" && !nativeBusy;
}

function status(message = "") {
  $("status-message").textContent = message;
}

function errorMessage(error) {
  return translateGenerated(error?.message ?? String(error));
}

function clearSimulation() {
  sounder.sync(false);
  $("schematic").classList.remove("lamp-phase-off");
  if (clock != null) clearInterval(clock);
  clock = null;
  mode = "idle";
  sim = null;
  snapshot = null;
  simViewSignature = "";
}

function setProject(next, {fit = false} = {}) {
  clearSimulation();
  project = next;
  probes = [];
  previewMeterSim = null;
  refreshMeter();
  modelIssues = validateProject(project);
  results = new Map();
  board.selection = new Set([...board.selection].filter(id => project.devices.some(device => device.id === id) || project.wires.some(wire => wire.id === id)));
  board.setContext(project, null);
  if (fit) board.fit();
  renderProject();
}

function change(update, selected) {
  if (!editable()) {
    status(t("Tạm dừng mô phỏng trước khi thay đổi sơ đồ."));
    return;
  }
  const next = structuredClone(project);
  update(next);
  syncContactTags(next.devices);
  if (serializeProject(next) === serializeProject(project)) return;
  history.push(project);
  if (history.length > historyLimit) history.shift();
  future = [];
  board.cancelWire();
  if (selected) board.selection = new Set(selected);
  setProject(next);
  updateDirty();
}

function undo() {
  if (!editable() || !history.length) return;
  future.push(project);
  setProject(history.pop());
  updateDirty();
  status(t("Đã hoàn tác."));
}

function redo() {
  if (!editable() || !future.length) return;
  history.push(project);
  setProject(future.pop());
  updateDirty();
  status(t("Đã làm lại."));
}

function updateDirty() {
  const payload = serializeProject(project);
  dirty = payload !== savedPayload;
  if (dirty) activeProject.initialBlank = false;
  Object.assign(activeProject, {project, currentPath, dirty, payload, savedPayload});
  refreshDocumentStatus();
  const drafts = projects.filter(item => item.dirty).map(item => ({text: item.payload, saved: item.savedPayload}));
  writeRecovery(drafts.length ? JSON.stringify({version: 2, projects: drafts}) : null);
}

function refreshDocumentStatus() {
  $("dirty-indicator").classList.toggle("dirty", dirty);
  const hasUnsaved = projects.some(item => item.dirty);
  desktop?.setDirty?.(hasUnsaved)?.catch(error => status(errorMessage(error)));
  renderProjectTabs();
}

function writeRecovery(text) {
  try {
    if (desktop?.setRecovery) {
      desktop.setRecovery(text)?.catch(error => status(t`Tự lưu gặp lỗi. ${errorMessage(error)}`));
    } else if (text) {
      localStorage.setItem(recoveryKey, text);
    } else {
      localStorage.removeItem(recoveryKey);
    }
  } catch (error) {
    status(t`Tự lưu gặp lỗi. ${errorMessage(error)}`);
  }
}

async function findRecovery() {
  try {
    const text = desktop?.getRecovery ? await desktop.getRecovery() : localStorage.getItem(recoveryKey);
    if (!text) return;
    const candidate = JSON.parse(text);
    const drafts = candidate.version === 2 ? candidate.projects : [candidate];
    recovery = drafts.map(draft => ({model: parseProject(draft.text), saved: typeof draft.saved === "string" ? draft.saved : null}));
    if (!recovery.length) return;
    $("recovery-message").textContent = recovery.length === 1
      ? t`Có bản tự lưu của “${recovery[0].model.name}”. Sau khi khôi phục, chọn nơi lưu khi bấm Lưu.`
      : t`Có bản tự lưu của ${recovery.length} dự án. Sau khi khôi phục, chọn nơi lưu cho từng dự án.`;
    $("recovery-dialog").showModal();
  } catch (error) {
    status(t`Không đọc được bản tự lưu. ${errorMessage(error)}`);
  }
}

function storeActiveProject() {
  for (const release of heldInputs) release();
  if (mode === "running") {
    stopClock();
    sounder.sync(false);
    mode = "paused";
  }
  Object.assign(activeProject, {project, currentPath, savedPayload, dirty, history, future, results, sim, snapshot, mode,
    view: board.view, selection: board.selection, tool: board.tool, probes, consoleTab: activeTab, message: $("status-message").textContent});
  board.space = false;
  if (board.gesture) board.cancelGesture();
  if (board.pending) board.cancelWire();
}

function showProjectTab(item) {
  activeProject = item;
  ({project, currentPath, savedPayload, dirty, history, future, results, sim, snapshot, mode, probes} = item);
  previewMeterSim = null;
  simViewSignature = "";
  board.selection = item.selection;
  if (board.tool !== item.tool) setBoardTool(item.tool);
  board.setContext(project, snapshot);
  if (item.view) {
    board.view = item.view;
    board.updateView();
  } else board.fit();
  modelIssues = validateProject(project);
  showTab(item.consoleTab, {expand: false});
  status(translateGenerated(item.message));
  renderProject();
  refreshMeter();
  if (snapshot) {
    previousLogLength = snapshot.log.length;
    renderLog();
  }
  $("schematic").classList.toggle("lamp-phase-off", Math.floor((snapshot?.time ?? 0) / 500) % 2 === 1);
  refreshDocumentStatus();
  $("project-tabs").querySelector('[aria-selected="true"]')?.scrollIntoView({block: "nearest", inline: "nearest"});
}

function switchProject(item) {
  if (!item || item === activeProject) return;
  storeActiveProject();
  showProjectTab(item);
}

function makeProjectTab(model, path = null, baseline) {
  const payload = serializeProject(model);
  const saved = baseline === undefined ? payload : baseline;
  return {id: createId(), project: model, currentPath: path, savedPayload: saved, payload, dirty: payload !== saved,
    history: [], future: [], results: new Map(), sim: null, snapshot: null, mode: "idle", view: null,
    selection: new Set(), tool: "select", probes: [], consoleTab: "warnings", message: ""};
}

function openInTab(model, path = null, {reuseBlank = true} = {}) {
  storeActiveProject();
  const item = makeProjectTab(model, path);
  if (reuseBlank && activeProject.initialBlank) projects.splice(projects.indexOf(activeProject), 1, item);
  else projects.push(item);
  showProjectTab(item);
}

function renderProjectTabs() {
  const list = $("project-tabs");
  const rows = new Map([...list.children].map(row => [row.dataset.projectId, row]));
  for (const [index, item] of projects.entries()) {
    let row = rows.get(item.id);
    if (!row) {
      const attributes = {type: "button", "data-project-id": item.id};
      row = html("div", {class: "project-tab", role: "presentation", "data-project-id": item.id},
        html("button", {...attributes, role: "tab", "data-action": "activate-project", "aria-controls": "project-workspace"},
          icon("document"), html("span", {class: "project-tab-name"}), html("span", {class: "project-tab-dirty", "aria-hidden": "true"})),
        html("button", {...attributes, "data-action": "close-project", class: "project-tab-close"}, icon("close")));
    }
    if (list.children[index] !== row) list.insertBefore(row, list.children[index] ?? null);
    rows.delete(item.id);
    const selected = item === activeProject;
    const [tab, close] = row.children;
    tab.id = `project-tab-${item.id}`;
    row.classList.toggle("is-active", selected);
    row.classList.toggle("is-dirty", item.dirty);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    tab.title = [item.project.name, item.currentPath, item.dirty ? t("Có thay đổi chưa lưu") : null].filter(Boolean).join("\n");
    tab.setAttribute("aria-label", item.dirty ? t`${item.project.name} · Có thay đổi chưa lưu` : item.project.name);
    tab.querySelector(".project-tab-name").textContent = item.project.name;
    close.title = t`Đóng dự án “${item.project.name}”`;
    close.setAttribute("aria-label", close.title);
  }
  for (const row of rows.values()) row.remove();
  $("project-workspace").setAttribute("aria-labelledby", `project-tab-${activeProject.id}`);
}

function focusActiveProjectTab() {
  $("project-tabs").querySelector('[aria-selected="true"]')?.focus();
}

function projectDialog(id) {
  const dialog = $(id);
  dialog.returnValue = "";
  dialog.showModal();
  return new Promise(resolve => dialog.addEventListener("close", () => resolve(dialog.returnValue), {once: true}));
}

async function closeProject(item) {
  if (!item) return;
  if (item.dirty) {
    $("close-project-message").textContent = t`Lưu thay đổi trong “${item.project.name}” trước khi đóng?`;
    const result = await projectDialog("close-project-dialog");
    if (result === "save") {
      switchProject(item);
      if (!await saveProject(false)) return;
    } else if (result !== "discard") return;
  }
  const index = projects.indexOf(item);
  projects.splice(index, 1);
  if (item === activeProject) {
    storeActiveProject();
    const neighbor = projects[Math.min(index, projects.length - 1)];
    if (neighbor) showProjectTab(neighbor);
    else {
      const blank = makeProjectTab(createProject(t("Dự án mới")));
      blank.initialBlank = true;
      projects.push(blank);
      showProjectTab(blank);
    }
    requestAnimationFrame(focusActiveProjectTab);
  }
  updateDirty();
}

async function fileAction(action) {
  if (nativeBusy) return;
  if (document.activeElement?.matches("input:not([type=file]), select")) document.activeElement.blur();
  nativeBusy = true;
  updateButtons();
  try {
    await action();
  } catch (error) {
    status(errorMessage(error));
  } finally {
    nativeBusy = false;
    updateButtons();
  }
}

async function chooseExample(slug) {
  if (!desktop?.openExample) {
    try {
      const resp = await fetch(`../examples/${slug}.td2d.json`);
      if (resp.ok) {
        const text = await resp.text();
        const next = parseProject(text);
        openInTab(next);
        status(t`Đã mở mạch mẫu “${next.name}”.`);
        return;
      }
    } catch (_) {}
    throw new Error(t("Mở mạch mẫu từ cửa sổ ứng dụng Windows."));
  }
  const item = await desktop.openExample(slug);
  if (item?.text) {
    const next = parseProject(item.text);
    openInTab(next);
    status(next.metadata?.verification === "unverified" ? t("Một phần hồ sơ còn chờ xác minh. Xem thông tin ở bảng Thuộc tính.") : t`Đã mở mạch mẫu “${next.name}”.`);
  }
}

function openTemplate(id) {
  const next = createCircuitTemplate(id, getLanguage());
  openInTab(next);
  status(next.metadata?.verification === "unverified" ? t("Một phần hồ sơ còn chờ xác minh. Xem thông tin ở bảng Thuộc tính.") : t`Đã mở mạch mẫu “${next.name}”.`);
}

function renderTemplates() {
  $("circuit-templates").replaceChildren(...circuitTemplates.map(template => html("button", {type: "button",
    "data-action": `template-${template.id}`, "data-template-id": template.id},
    html("strong", {}, template.title[getLanguage()] ?? template.title.vi),
    html("small", {}, template.description[getLanguage()] ?? template.description.vi))));
}

async function openProject() {
  if (!desktop?.openProject) {
    $("open-file").click();
    return;
  }
  const opened = await desktop.openProject();
  if (opened?.text) {
    const existing = opened.path && projects.find(item => item.currentPath?.toLowerCase() === opened.path.toLowerCase());
    if (existing) {
      switchProject(existing);
      return;
    }
    const next = parseProject(opened.text);
    openInTab(next, opened.path ?? null);
    status(t`Đã mở “${next.name}”.`);
  }
}

async function saveProject(saveAs) {
  const payload = serializeProject(project);
  if (desktop?.saveProject) {
    const openPaths = projects.filter(item => item !== activeProject && item.currentPath).map(item => item.currentPath);
    const saved = await desktop.saveProject(payload, saveAs ? null : currentPath, openPaths);
    if (!saved?.path) return false;
    currentPath = saved.path;
  } else {
    const url = URL.createObjectURL(new Blob([payload], {type: "application/json"}));
    const filename = project.name.replace(/[<>:"/\\|?*]/gu, "_");
    html("a", {href: url, download: `${filename || "du-an"}.td2d.json`}).click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  savedPayload = payload;
  updateDirty();
  status(t`Đã lưu “${project.name}”.`);
  return true;
}

function tagFor(type, devices) {
  const prefix = CATALOG[type].tag || "TB";
  const tags = new Set(devices.map(device => normalizeComponentTag(device.tag)));
  let index = 1;
  while (tags.has(normalizeComponentTag(`${prefix}${index}`))) index += 1;
  return `${prefix}${index}`;
}

function addDevice(type, point) {
  const device = createDevice(type, point.x, point.y, tagFor(type, project.devices));
  if (type !== "junction") {
    const wideBlock = CATALOG[type].pins.length > 6 && !type.endsWith("3ph");
    device.params.orientation = wideBlock ? "horizontal" : "vertical";
  }
  change(next => next.devices.push(device), [device.id]);
  status(t`Đã thêm ${device.tag} · ${CATALOG[type].name}.`);
}

function addWire(from, to, points) {
  const selected = [];
  let result;
  change(next => {
    result = connectTargets(next, from, to, points);
    if (result.selected) selected.push(result.selected);
  }, selected);
  if (result) status(result.message);
}

function splitWire(wire) {
  const split = board.splitPoint(wire);
  if (!split) {
    status(t("Dây quá ngắn để chèn nút nối. Dời thiết bị hoặc chỉnh đường dây rồi thử lại."));
    return;
  }
  const selected = [];
  change(next => {
    selected.push(splitConductor(next, wire.id, split).device);
  }, selected);
  status(t("Đã chèn nút nối. Chọn tâm nút để nối thêm nhánh. Shift+bấm để chọn nút."));
}

function duplicate() {
  const originals = project.devices.filter(device => board.selection.has(device.id));
  if (!originals.length) return;
  const ids = new Map(originals.map(device => [device.id, createId()]));
  const offset = 40;
  change(next => {
    for (const device of originals) {
      const copy = structuredClone(device);
      copy.id = ids.get(device.id);
      copy.x += offset;
      copy.y += offset;
      copy.tag = tagFor(device.type, next.devices);
      for (const key of ["masterId", "commandId", "feedbackId"]) if (ids.has(copy.params?.[key])) copy.params[key] = ids.get(copy.params[key]);
      next.devices.push(copy);
    }
    const wires = next.wires.filter(wire => ids.has(wire.from.device) && ids.has(wire.to.device));
    for (const wire of wires) {
      next.wires.push({...wire, id: createId(),
        from: {...wire.from, device: ids.get(wire.from.device)},
        to: {...wire.to, device: ids.get(wire.to.device)},
        points: wire.points?.map(point => ({x: point.x + offset, y: point.y + offset})),
      });
    }
  }, [...ids.values()]);
  status(t`Đã nhân bản ${ids.size} thiết bị cùng dây nối giữa chúng.`);
}

function copySelection() {
  const contents = captureProjectClipboard(project, board.selection);
  if (!contents) return;
  clipboard = {...contents, source: activeProject.id};
  updateButtons();
  status(t`Đã sao chép ${contents.devices.length} thiết bị · ${contents.wires.length} dây.`);
}

function pasteOffset(devices, sameProject) {
  let offset = {x: 40, y: 40};
  if (!sameProject) {
    const rect = board.element.getBoundingClientRect();
    const center = board.point({clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2});
    const xs = devices.map(device => device.x);
    const ys = devices.map(device => device.y);
    offset = board.align({x: center.x - (Math.min(...xs) + Math.max(...xs)) / 2,
      y: center.y - (Math.min(...ys) + Math.max(...ys)) / 2});
  }
  const exactPositions = new Set(project.devices.map(device => `${device.x},${device.y}`));
  for (let step = 0; step < 10; step += 1) {
    if (devices.every(device => !exactPositions.has(`${device.x + offset.x},${device.y + offset.y}`))) break;
    offset = {x: offset.x + 40, y: offset.y + 40};
  }
  return offset;
}

async function pasteSelection() {
  if (!clipboard || !editable()) return;
  const sameProject = clipboard.source === activeProject.id;
  const plan = planProjectPaste(project, clipboard, {sameProject, offset: pasteOffset(clipboard.devices, sameProject)});
  if (plan.conflicts.length) {
    $("paste-conflicts").replaceChildren(...plan.conflicts.map(({originalTag, replacementTag}) =>
      html("li", {}, html("span", {}, originalTag), html("span", {"aria-hidden": "true"}, "→"), html("strong", {}, replacementTag))));
    if (await projectDialog("paste-conflict-dialog") !== "rename") return;
  }
  change(next => {
    next.devices.push(...plan.devices);
    next.wires.push(...plan.wires);
  }, [...plan.devices, ...plan.wires].map(item => item.id));
  const details = t`Đã dán ${plan.devices.length} thiết bị · ${plan.wires.length} dây.`;
  status(plan.disconnected ? `${details} ${t`Đã bỏ ${plan.disconnected} liên kết đến thiết bị ngoài vùng sao chép.`}` : details);
}

function deleteSelection() {
  const selected = board.selection;
  if (!selected.size) return;
  change(next => {
    next.devices = next.devices.filter(device => !selected.has(device.id));
    next.wires = next.wires.filter(wire => !selected.has(wire.id) && !selected.has(wire.from.device) && !selected.has(wire.to.device));
  }, []);
  status(t("Đã xóa phần tử đã chọn."));
}

function renderPalette() {
  const simplify = text => text.toLocaleLowerCase("vi").normalize("NFD").replace(/\p{M}/gu, "").replaceAll("đ", "d");
  const query = simplify($("device-search").value.trim());
  const groups = new Map();
  let count = 0;
  for (const [type, definition] of Object.entries(CATALOG)) {
    if (query && !simplify(`${t(definition.name)} ${definition.name} ${definition.tag} ${t(definition.group)} ${type}`).includes(query)) continue;
    const group = groups.get(definition.group) ?? [];
    const image = svg("svg", {viewBox: "-36 -51 72 102", "aria-hidden": "true"},
      electricalSymbol({type, tag: "", params: definition.defaults}, null, "vertical"));
    const item = html("button", {class: "palette-item", type: "button", draggable: true, "data-type": type, title: t`Thêm ${t(definition.name)}`}, image, html("span", {}, t(definition.name)));
    item.addEventListener("dragstart", event => {
      if (!editable()) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData(dragType, type);
      event.dataTransfer.setData("text/plain", type);
      event.dataTransfer.effectAllowed = "copy";
    });
    item.addEventListener("click", () => {
      if (editable()) board.addFromPalette(type);
    });
    group.push(item);
    groups.set(definition.group, group);
    count += 1;
  }
  $("library-count").textContent = count;
  $("palette").replaceChildren(...(count
    ? [...groups].map(([group, children]) => html("section", {class: "palette-group"}, html("h3", {}, t(group)), ...children))
    : [html("p", {class: "console-empty"}, t("Không tìm thấy thiết bị."))]));
}

function updateButtons() {
  const enabled = editable();
  $("language-selection").disabled = nativeBusy;
  for (const action of ["new", "open", "save", "save-as", "examples", "export-bom-csv"]) setDisabled(action, nativeBusy);
  for (const action of ["exports", "export-pdf", "export-dwg"]) setDisabled(action, nativeBusy || !project.devices.length);
  for (const action of ["add-scenario", "edit-scenario"]) setDisabled(action, !enabled);
  setDisabled("run", mode === "running" || mode === "halted" || !project.devices.length || nativeBusy);
  setDisabled("pause", mode !== "running");
  setDisabled("step", mode === "running" || mode === "halted" || !project.devices.length || nativeBusy);
  setDisabled("reset", !sim);
  setDisabled("faults", !sim || mode === "halted" || nativeBusy);
  setDisabled("undo", !enabled || !history.length);
  setDisabled("redo", !enabled || !future.length);
  setDisabled("delete", !enabled || !board.selection.size);
  setDisabled("duplicate", !enabled || !project.devices.some(device => board.selection.has(device.id)));
  setDisabled("copy", nativeBusy || !project.devices.some(device => board.selection.has(device.id)));
  setDisabled("paste", !enabled || !clipboard);
  $("project-tabs").inert = nativeBusy;
  setDisabled("rotate", !enabled || !project.devices.some(device => device.type !== "junction" && board.selection.has(device.id)));
  setDisabled("run-tests", !project.scenarios.length);
  $("document-name").disabled = !enabled;
}

function renderProject() {
  $("document-name").value = project.name;
  $("drawing-empty").hidden = project.devices.length > 0;
  $("drawing-totals").textContent = t`${project.devices.length} thiết bị · ${project.wires.length} dây`;
  $("tests-count").textContent = project.scenarios.length;
  $("log-count").textContent = "0";
  $("log-panel").replaceChildren(html("p", {class: "console-empty"}, t("Chạy mô phỏng để ghi đầu vào và thay đổi trạng thái theo thời gian.")));
  previousLogLength = 0;
  renderWarnings();
  renderScenarios($("scenario-list"), project, results);
  renderInspector();
  updateClock();
  updateButtons();
}

function newField(label, value, callback, options = {}) {
  const {choices, type = "text", options: attrs = {}} = options;
  const disabled = !editable();
  let input = null;
  if (choices) {
    input = html("select", {disabled, ...attrs}, ...choices.map(([key, title]) => html("option", {value: key, selected: String(value) === key}, t(title))));
  } else {
    input = html("input", {type, disabled, ...attrs});
    if (type === "checkbox") input.checked = Boolean(value);
    else input.value = value ?? "";
  }
  input.addEventListener("change", () => {
    if (!input.checkValidity()) {
      input.value = value ?? "";
      status(input.validationMessage || t("Giá trị thiết bị chưa hợp lệ."));
      return;
    }
    const current = type === "number" ? Number(input.value) : type === "checkbox" ? input.checked : input.value;
    callback(current, input);
  });
  return html("label", {class: "field"}, t(label), input);
}

const paramLabels = {
  contactLabel: "Mô tả tiếp điểm", blink: "Đèn nhấp nháy", lampColor: "Màu đèn khi sáng",
  domain: "Miền nguồn", inputDomain: "Miền nguồn AC vào", delayMs: "Thời gian trễ (ms)",
  normalClosed: "Tiếp điểm thường đóng (NC)", masterId: "Thiết bị chủ", masterState: "Trạng thái của thiết bị chủ",
  initial: "Trạng thái ban đầu", commandId: "Thiết bị phát lệnh chạy", feedbackId: "Thiết bị phản hồi chạy",
  note: "Ghi chú", orientation: "Hướng ký hiệu", lampMark: "Ký hiệu trong đèn",
  partNumber: "Hãng / Mã hiệu", ratedCurrentA: "Dòng định mức (A)", ratedPowerKw: "Công suất định mức (kW)",
  motorPoles: "Số cực động cơ", frequencyHz: "Tần số đặt (Hz)", demandPercent: "Mức điều khiển đặt (%)",
};
const masterStateChoices = [["active", "Tác động"], ["closed", "Đóng"], ["tripped", "Trip"], ["powered", "Cuộn có điện"]];
const modeChoices = [["AUTO", "AUTO"], ["MAN", "MAN"], ["OFF", "OFF"]];
const orientationChoices = [["vertical", "Dọc"], ["horizontal", "Ngang"]];
const alternateChoices = [["nc", "NO mở, NC đóng"], ["no", "NO đóng, NC mở"]];

function fieldForParameter(device, key, value) {
  const label = paramLabels[key] ?? key;
  const setValue = current => change(next => {
    const target = next.devices.find(item => item.id === device.id);
    target.params[key] = current;
  });
  if (key === "operatingCurrentA") {
    return newField(t("Dòng làm việc mô phỏng (A)"), value ?? "", (current, input) => {
      setValue(input.value === "" ? null : current);
    }, {type: "number", options: {min: 0, step: "any", maxlength: 16,
      placeholder: t("Theo dữ liệu tải"), title: t("Dòng khi được cấp điện. Với động cơ ba pha, nhập dòng dây mỗi pha."),
      "data-field": "operating-current"}});
  }
  if (key === "motorPoles") return newField(label, value, setValue, {type: "number", options: {min: 2, step: 2, required: true}});
  if (["ratedPowerKw", "ratedCurrentA", "frequencyHz", "demandPercent"].includes(key)) {
    const max = key === "frequencyHz" ? 60 : key === "demandPercent" ? 100 : null;
    return newField(label, value, setValue, {type: "number", options: {min: 0, max, step: "any", required: true}});
  }
  const instrumentField = instrumentParameter(device, key, value, setValue, newField);
  if (instrumentField) return instrumentField;
  if (key === "lampColor") return newField(label, lampColor(device.params), setValue, {type: "color", options: {"data-field": key}});
  if (key === "blink" && device.type === "lamp") return newField(label, value, setValue, {type: "checkbox", options: {"data-field": key}});
  if (["masterId", "commandId", "feedbackId"].includes(key)) {
    const choices = [["", t("Chưa liên kết")], ...project.devices.filter(other => other.id !== device.id &&
      (key !== "masterId" || other.id === value || supportsMasterState(other.type, device.params.masterState ?? "active")))
      .map(other => [other.id, `${other.tag} · ${t(CATALOG[other.type].name)}`])];
    if (value && !choices.some(([id]) => value === id)) choices.push([value, t`${value} · thiếu thiết bị`]);
    return newField(label, value ?? "", current => setValue(current || null), {choices, options: {"data-field": key}});
  }
  if (key === "masterState") {
    const master = project.devices.find(item => item.id === device.params.masterId);
    const choices = [...masterStateChoices, ...(instrumentStates[master?.type] ?? [])
      .filter(state => !masterStateChoices.some(([key]) => key === state)).map(state => [state, stateLabels[state] ?? state])];
    return newField(label, value ?? "active", setValue, {choices: master ? choices.filter(([key]) => key === value || supportsMasterState(master.type, key)) : choices});
  }
  if (key === "orientation") return newField(label, orientationOf(device), setValue, {choices: orientationChoices});
  if (key === "lampMark") return newField(label, value, current => setValue(current.trim().slice(0, 3)), {options: {maxlength: 3, placeholder: "G, R, O…"}});
  if (key === "initial" && device.type === "selector") return newField(label, value, setValue, {choices: modeChoices});
  if (key === "initial" && ALTERNATE_TYPES.has(device.type)) {
    return newField(t("Vị trí trước khi mô phỏng"), value ? "no" : "nc", current => setValue(current === "no"), {choices: alternateChoices});
  }
  if (typeof value === "boolean") return newField(label, value, setValue, {type: "checkbox"});
  if (typeof value === "number") return newField(label, value, setValue, {type: "number", options: {min: 0, step: 1, required: true}});
  return newField(label, value, setValue, {options: {maxlength: key === "note" ? 500 : 48}});
}

function setSimulationInput(device, key, value) {
  if (!sim || mode === "halted") return;
  try {
    showSnapshot(sim.apply(device.id, key, value));
  } catch (error) {
    status(errorMessage(error));
  }
}

function inputControl(device, input, state) {
  const attrs = {"data-input-key": input.key, "data-input-device": device.id, disabled: mode === "halted"};
  const row = html("div", {class: "input-row"}, html("span", {}, t(input.label)));
  if (input.type === "number") {
    const number = html("input", {...attrs, type: "number", required: true, min: input.min, max: input.max,
      step: input.step ?? "any", "aria-label": input.label});
    number.value = state[input.key] ?? "";
    number.addEventListener("change", () => {
      if (number.reportValidity()) setSimulationInput(device, input.key, number.valueAsNumber);
    });
    row.append(number);
    return row;
  }
  if (input.type === "choice") {
    const select = html("select", {...attrs, "aria-label": input.label}, ...(input.options ?? []).map(value => html("option", {value, selected: value === state[input.key]}, value)));
    select.addEventListener("change", () => setSimulationInput(device, input.key, select.value));
    row.append(select);
    return row;
  }
  const current = Boolean(state[input.key === "trip" ? "tripped" : input.key]);
  const label = input.key === "trip" ? current ? "Reset" : "Trip"
    : input.key === "on" ? current ? t("Cắt") : t("Đóng")
      : input.key === "pressed" ? current ? t("Đang nhấn") : t("Nhấn giữ")
        : current ? t("Tắt tín hiệu") : t("Bật tín hiệu");
  const button = html("button", {type: "button", ...attrs, "aria-pressed": String(current)}, label);
  if (input.key === "pressed") {
    function hold(releaseEvents, predicate = () => true) {
      if (current) return;
      const activeSimulation = sim;
      const listeners = new AbortController();
      setSimulationInput(device, input.key, true);
      const release = event => {
        if (event && !predicate(event)) return;
        listeners.abort();
        heldInputs.delete(release);
        if (sim === activeSimulation) setSimulationInput(device, input.key, false);
      };
      heldInputs.add(release);
      for (const name of releaseEvents) globalThis.addEventListener(name, release, {signal: listeners.signal});
      globalThis.addEventListener("blur", release, {signal: listeners.signal});
    }
    button.addEventListener("pointerdown", event => {
      if (event.button === 0) hold(["pointerup", "pointercancel"], next => next.type === "blur" || event.pointerId === next.pointerId);
    });
    button.addEventListener("keydown", event => {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      if (!event.repeat) hold(["keyup"], next => next.type === "blur" || event.key === next.key);
    });
  } else {
    button.addEventListener("click", () => setSimulationInput(device, input.key, !current));
  }
  row.append(button);
  return row;
}

function relayHardware(device, definition) {
  const {model, socket, coil, contactSets, minPulseMs} = definition.hardware;
  const schematicCoil = definition.pins.map(pin => device.params?.pinLabels?.[pin.id] ?? pin.label ?? pin.id).join("–");
  const details = [
    [t("Đế cắm"), socket],
    [t("Cuộn 220 VAC"), coil],
    ...contactSets.map(({common, no, nc}, index) => [t`Cực ${index + 1}`, `COM ${common} · NO ${no} · NC ${nc}`]),
    [t("Xung điều khiển"), t`≥ ${minPulseMs} ms theo Omron`],
  ];
  return html("section", {class: "inspector-section", "data-hardware-model": model},
    html("h3", {}, t("Chân vật lý theo Omron")),
    html("div", {class: "state-list"}, ...details.map(([label, value]) =>
      html("div", {class: "state-row"}, html("span", {}, label), html("span", {}, value)))),
    schematicCoil !== coil ? html("p", {class: "source-note"}, t`Cuộn trên sơ đồ ghi ${schematicCoil}. Trên đế ${socket}, cuộn ở chân ${coil}.`) : null,
  );
}

function deviceInspector(device) {
  const definition = CATALOG[device.type];
  const relay = ALTERNATE_TYPES.has(device.type) && definition.hardware;
  const state = snapshot?.devices?.[device.id];
  const owner = project.devices.find(other => other.id === device.params?.masterId && supportsMasterState(other.type, "active"));
  const fields = html("div", {class: "fields"}, newField(t("Tag thiết bị"), device.tag, (tag, input) => {
    if (owner) return;
    if (!tag.trim()) {
      input.value = device.tag;
      status(t("Tag thiết bị cần có ít nhất một ký tự."));
      return;
    }
    change(next => {
      next.devices.find(item => item.id === device.id).tag = tag.trim();
    });
  }, {options: {maxlength: 64, "data-field": "tag", readonly: Boolean(owner), title: owner ? t("Tag lấy từ thiết bị chủ") : null}}));
  const params = {...definition.defaults, ...device.params};
  if (device.type !== "junction") params.orientation = orientationOf(device);
  if (device.type === "lamp") {
    params.lampMark ??= "";
    params.lampColor ??= lampColor(params);
  }
  if (supportsOperatingCurrent(device.type)) params.operatingCurrentA ??= null;
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "object" && value != null) continue;
    fields.append(fieldForParameter(device, key, value));
  }
  const pins = html("div", {class: "pin-list"}, ...definition.pins.map(pin => {
    const connected = project.wires.filter(wire => [wire.from, wire.to].some(endpoint => endpoint.device === device.id && endpoint.pin === pin.id)).length;
    const pinState = snapshot?.pins?.[pinKey(device.id, pin.id)];
    const info = [connected ? t`${connected} dây` : t("Chưa nối"), pinState?.label].filter(Boolean).join(" · ");
    return html("div", {class: "pin-row"}, html("span", {}, String(device.params?.pinLabels?.[pin.id] ?? pin.label ?? pin.id)), html("span", {}, info));
  }));
  const content = html("div", {class: "inspector-content"},
    html("div", {class: "properties-title"}, html("strong", {}, device.tag), html("small", {}, t(definition.name))), fields,
    html("section", {class: "inspector-section"}, html("h3", {}, relay ? t("Chân trên sơ đồ") : t("Chân đấu")), pins),
  );
  if (relay) content.append(relayHardware(device, definition));
  else if (!params.partNumber && definition.hardware?.model) content.append(html("section", {class: "inspector-section"},
    html("h3", {}, t("Hãng / Mã hiệu")), html("p", {}, definition.hardware.model)));
  const instrument = instrumentInspector(device, {editable: editable(), status, setParam: (key, value) => change(next => {
    next.devices.find(other => other.id === device.id).params[key] = value;
  })});
  if (instrument) content.append(instrument);
  const link = ["masterId", "commandId", "feedbackId"].filter(key => params[key]);
  if (link.length) {
    const links = link.map(key => {
      const master = project.devices.find(item => item.id === params[key]);
      const actual = snapshot?.devices?.[master?.id];
      const important = key === "masterId" ? params.masterState ?? "active" : "active";
      const tag = master?.tag ?? params[key];
      return html("li", {}, `${t(paramLabels[key])} · ${tag}${actual ? ` · ${displayValue(actual[important])}` : ""}`);
    });
    content.append(html("section", {class: "inspector-section"}, html("h3", {}, t("Liên kết")), html("ul", {}, ...links)));
  }
  if (!state) return content;
  const inputs = getDeviceInputs(device);
  if (inputs.length) content.append(html("section", {class: "inspector-section"}, html("h3", {}, t("Đầu vào mô phỏng")), ...inputs.map(input => inputControl(device, input, state))));
  const values = Object.entries(state).filter(([key]) => Object.hasOwn(stateLabels, key));
  if (state.pendingUntil != null) values.push(["pendingUntil", `${(state.pendingUntil / 1000).toFixed(3)} s`]);
  if (values.length) {
    const rows = values.map(([key, value]) => {
      const position = key === "active" && ALTERNATE_TYPES.has(device.type);
      return html("div", {class: "state-row"},
        html("span", {}, position ? t("Vị trí tiếp điểm") : t(stateLabels[key]) ?? t("Mốc timer")),
        html("span", {}, position ? t(alternateChoices[value ? 1 : 0][1]) : displayValue(value)));
    });
    content.append(html("section", {class: "inspector-section"}, html("h3", {}, t("Trạng thái mô phỏng")), html("div", {class: "state-list"}, ...rows)));
  }
  const causes = sim.diagnose(device.id);
  if (causes?.length) {
    const cards = causes.map(cause => {
      const isFault = cause.includes('mất') || cause.includes('trip') || cause.includes('lỗi') || cause.includes('chưa') || cause.includes('Thiếu') || cause.includes('hở');
      const isOk = cause.includes('bình thường') || cause.includes('hợp lệ') || cause.includes('đầy đủ') || cause.includes('Đủ');
      const cls = isFault ? 'cause-card fault' : isOk ? 'cause-card ok' : 'cause-card info';
      const icon = isFault ? '❌' : isOk ? '✔' : 'ℹ';
      return html("div", {class: cls}, html("span", {class: "cause-icon"}, icon), html("span", {}, cause));
    });
    content.append(html("section", {class: "inspector-section"},
      html("h3", {}, t("Truy vết chuỗi nguyên nhân (Root-Cause)")),
      html("div", {class: "cause-chain"}, ...cards)));
  }
  return content;
}

function wireInspector(wire) {
  const end = endpoint => {
    const device = project.devices.find(item => item.id === endpoint.device);
    return `${device?.tag ?? endpoint.device} / ${device?.params?.pinLabels?.[endpoint.pin] ?? endpoint.pin}`;
  };
  const state = snapshot?.wires?.[wire.id];
  const routeClear = html("button", {type: "button", disabled: !wire.points?.length || !editable()}, t("Định tuyến lại"));
  routeClear.addEventListener("click", () => change(next => {
    next.wires.find(item => item.id === wire.id).points = [];
  }));
  const insert = html("button", {type: "button", disabled: !editable()}, t("Chèn nút nối vào dây"));
  insert.addEventListener("click", () => splitWire(wire));
  return html("div", {class: "inspector-content"},
    html("div", {class: "properties-title"}, html("strong", {}, t("Dây nối")), html("small", {}, state?.label ?? "")),
    newField(t("Nhãn dây"), wire.label, value => change(next => {
      next.wires.find(item => item.id === wire.id).label = value.trim();
    }), {options: {maxlength: 64, "data-field": "wire-label"}}),
    html("section", {class: "inspector-section"}, html("h3", {}, t("Hai đầu dây")), html("p", {}, end(wire.from)), html("p", {}, end(wire.to))),
    html("section", {class: "inspector-section"}, html("h3", {}, t("Đường đi")), routeClear, insert,
      html("p", {class: "read-only-note"}, t("Dây giao cắt chỉ liên thông khi cùng nối vào một chân hoặc nút nối."))),
  );
}

function emptyInspector() {
  const metadata = project.metadata;
  const body = html("div", {class: "inspector-content"},
    html("div", {class: "pane-empty"}, icon("pin"), html("strong", {}, t("Chọn thiết bị hoặc dây")),
      html("p", {}, t("Xem chân đấu, sửa tag và kiểm tra trạng thái của phần tử đang chọn."))),
  );
  if (metadata?.verification === "unverified") {
    body.append(html("div", {class: "source-note"}, html("strong", {}, t("Hồ sơ còn phần chưa xác minh")), html("p", {}, metadata.summary ?? t("Một số tín hiệu và trình tự cần xác nhận."))));
  }
  if (Array.isArray(metadata?.references) && metadata.references.length) {
    body.append(html("section", {class: "inspector-section"}, html("h3", {}, t("Hồ sơ tham chiếu")),
      html("ul", {}, ...metadata.references.map(ref => html("li", {}, typeof ref === "string" ? ref : [ref?.file, ref?.pages].filter(Boolean).join(" · "))))));
  }
  if (Array.isArray(metadata?.openIssues) && metadata.openIssues.length) {
    body.append(html("section", {class: "inspector-section"}, html("h3", {}, t("Nội dung cần xác nhận")), html("ul", {}, ...metadata.openIssues.map(issue => html("li", {}, issue)))));
  }
  return body;
}

function renderInspector() {
  const panel = $("inspector");
  const focus = document.activeElement;
  const activeInput = focus?.dataset.inputKey && panel.contains(focus)
    ? {key: focus.dataset.inputKey, device: focus.dataset.inputDevice} : null;
  const selected = [...board.selection];
  const device = selected.length === 1 && project.devices.find(item => item.id === selected[0]);
  const wire = selected.length === 1 && project.wires.find(item => item.id === selected[0]);
  let content;
  if (device) content = deviceInspector(device);
  else if (wire) content = wireInspector(wire);
  else if (selected.length) {
    const count = project.devices.filter(item => board.selection.has(item.id)).length;
    content = html("div", {class: "pane-empty inspector-content"}, html("strong", {}, t`${selected.length} phần tử đã chọn`),
      html("p", {}, t`${count} thiết bị · ${selected.length - count} dây`),
      html("button", {type: "button", "data-action": "duplicate", disabled: !editable() || !count}, icon("duplicate"), t("Nhân bản thiết bị")));
  } else content = emptyInspector();
  panel.replaceChildren(content);
  if (activeInput) {
    panel.querySelector(`[data-input-key="${CSS.escape(activeInput.key)}"][data-input-device="${CSS.escape(activeInput.device)}"]`)?.focus({preventScroll: true});
  }
}

function issueLocation(issue) {
  const device = project.devices.find(item => item.id === issue.device);
  if (device) return `${device.tag}${issue.pin ? ` / ${device.params?.pinLabels?.[issue.pin] ?? issue.pin}` : ""}`;
  const wire = project.wires.find(item => item.id === issue.wire);
  return wire ? wire.label || t("Dây nối") : t("Sơ đồ");
}

function renderWarnings() {
  const keys = new Set();
  const unique = [...modelIssues, ...(snapshot?.issues ?? [])].filter(issue => {
    const key = [issue.severity, issue.code, issue.device, issue.pin, issue.wire, issue.message].join("|");
    if (keys.has(key)) return false;
    keys.add(key);
    return true;
  });
  $("warnings-count").textContent = unique.length;
  if (!unique.length) {
    $("warnings-panel").replaceChildren(html("p", {class: "console-empty"},
      project.devices.length ? t("Chưa ghi nhận lỗi hoặc cảnh báo mô hình.") : t("Cảnh báo hiện ở đây khi mô hình có chân chưa nối, liên kết thiếu hoặc xung đột nguồn.")));
    return;
  }
  unique.sort((a, b) => Number(b.severity === "error") - Number(a.severity === "error"));
  const rows = unique.map(issue => {
    const target = issue.device ?? issue.wire;
    const location = issueLocation(issue);
    const node = target ? html("button", {type: "button", "data-action": "select-issue", "data-target-id": target}, location) : location;
    return html("tr", {}, cell(issue.severity === "error" ? t("Lỗi mô hình") : t("Cảnh báo"), `status-${issue.severity}`), cell(node), cell(translateGenerated(issue.message) ?? issue.code));
  });
  $("warnings-panel").replaceChildren(table([t("Loại"), t("Vị trí"), t("Chi tiết")], rows));
}

function renderLog() {
  const entries = snapshot?.log ?? [];
  $("log-count").textContent = entries.length;
  if (!entries.length) {
    $("log-panel").replaceChildren(html("p", {class: "console-empty"}, t("Chưa có sự kiện trong phiên mô phỏng hiện tại.")));
    return;
  }
  const rows = entries.slice(-250).map(entry => html("tr", {},
    cell(`${(entry.time / 1000).toFixed(3)} s`, "table-time"), cell(entry.tag || "—"), cell(entry.event.split(" · ").map(translateGenerated).join(" · ")), cell(translateGenerated(entry.reason) || "—")));
  const note = entries.length > 250 ? html("p", {class: "console-empty"}, t`Đang hiển thị 250 trong ${entries.length} sự kiện gần nhất.`) : null;
  $("log-panel").replaceChildren(...[note, table([t("Thời điểm"), "Tag", t("Sự kiện"), t("Lý do")], rows)].filter(Boolean));
}

function updateClock() {
  const states = {idle: t("Đang chỉnh sửa"), running: t("Đang chạy"), paused: t("Tạm dừng"), halted: t("Dừng chẩn đoán")};
  $("virtual-time").textContent = `${((snapshot?.time ?? 0) / 1000).toFixed(3)} s`;
  $("sim-status").dataset.mode = mode;
  $("sim-status").textContent = t(states[mode]);
}

function showSnapshot(next = sim.snapshot(), force = false) {
  snapshot = next;
  if (next.halted) {
    if (clock != null) clearInterval(clock);
    clock = null;
    mode = "halted";
    status(t("Mô phỏng đã dừng để chẩn đoán. Xem Cảnh báo rồi đặt lại hoặc chỉnh sơ đồ."));
    showTab("warnings");
  }
  updateClock();
  const signature = JSON.stringify([next.devices, next.wires, next.issues]);
  $("schematic").classList.toggle("lamp-phase-off", Math.floor(next.time / 500) % 2 === 1);
  sounder.sync(mode === "running" && project.devices.some(device => device.type === "buzzer" && next.devices[device.id]?.active));
  if (force || signature !== simViewSignature) {
    simViewSignature = signature;
    board.setContext(project, next);
    refreshMeter();
    renderInspector();
    renderWarnings();
  }
  if (force || previousLogLength !== next.log.length) {
    previousLogLength = next.log.length;
    renderLog();
  }
  updateButtons();
}

function timeTick() {
  try {
    showSnapshot(sim.advance(50));
  } catch (error) {
    simulationError(error);
  }
}

function simulationError(error) {
  stopClock();
  sounder.sync(false);
  mode = "halted";
  status(t`Mô phỏng gặp lỗi. ${errorMessage(error)}`);
  updateClock();
  updateButtons();
}

function stopClock() {
  if (clock != null) clearInterval(clock);
  clock = null;
}

function controlSimulation(action) {
  if (!project.devices.length) return;
  try {
    board.cancelWire();
    if (!sim) sim = new Simulator(project);
    if (action === "run") {
      if (project.devices.some(device => device.type === "buzzer")) unlockBuzzer();
      mode = "running";
      showSnapshot(sim.snapshot(), true);
      if (mode !== "halted") clock = setInterval(timeTick, 50);
      return;
    }
    stopClock();
    mode = "paused";
    const next = action === "step" ? sim.step() : action === "reset" ? sim.reset() : sim.snapshot();
    showSnapshot(next, true);
    if (mode !== "halted") status(action === "reset" ? t("Đã đặt thời gian và đầu vào mô phỏng về trạng thái đầu.") : "");
  } catch (error) {
    simulationError(error);
  }
}

function executeTests(id) {
  const targets = id ? project.scenarios.filter(scenario => scenario.id === id) : project.scenarios;
  for (const scenario of targets) {
    try {
      results.set(scenario.id, runScenario(project, scenario));
    } catch (error) {
      results.set(scenario.id, {status: scenario.verification === "unverified" ? "unverified" : "fail", error: errorMessage(error)});
    }
  }
  renderScenarios($("scenario-list"), project, results);
  updateButtons();
  if (id) $("scenario-list").querySelector(`[data-scenario="${CSS.escape(id)}"] details`)?.setAttribute("open", "");
  status(t`Đã chạy ${targets.length} ca với thời gian mô phỏng độc lập.`);
}

function showTab(tab, {expand = true} = {}) {
  activeTab = tab;
  for (const button of document.querySelectorAll("[data-tab]")) {
    const selected = button.dataset.tab === tab;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
    $(`${button.dataset.tab}-panel`).hidden = !selected;
  }
  if (expand && document.querySelector(".workspace").classList.contains("console-collapsed")) toggleConsole();
}

function toggleConsole() {
  const collapsed = document.querySelector(".workspace").classList.toggle("console-collapsed");
  const title = collapsed ? t("Mở bảng dưới") : t("Thu gọn bảng dưới");
  const button = buttons("toggle-console")[0];
  button.setAttribute("aria-expanded", String(!collapsed));
  button.setAttribute("aria-label", title);
  button.title = title;
}

function setBoardTool(name) {
  board.setTool(name);
  for (const candidate of ["select", "wire", "pan", "voltmeter", "ammeter"]) setPressed(candidate, candidate === name);
}

function tool(name) {
  setBoardTool(name);
  probes = [];
  refreshMeter();
  status(name === "wire" ? t("Chọn một chân hoặc một đoạn dây. Bấm khoảng trống để đặt điểm gấp.") : "");
}

function placeProbe(target) {
  probes = board.tool === "voltmeter" && probes.length === 1 ? [...probes, target] : [target];
  refreshMeter();
}

function refreshMeter() {
  const panel = $("meter-panel");
  const isVoltage = board.tool === "voltmeter";
  panel.hidden = !isVoltage && board.tool !== "ammeter";
  board.markProbes(panel.hidden ? [] : probes);
  if (panel.hidden) return;
  $("meter-name").textContent = isVoltage ? t("Vôn kế") : t("Ampe kế");
  const value = $("meter-value");
  const note = $("meter-note");
  value.textContent = "—";
  if (!probes.length) {
    note.textContent = isVoltage ? t("Bấm một dây hoặc chân cho que (+), sau đó chọn điểm tham chiếu (−).") : t("Bấm một đoạn dây hoặc chân để đo dòng nhánh.");
    return;
  }
  try {
    const circuit = sim ?? (previewMeterSim ??= new Simulator(project));
    const endName = target => {
      const end = probePin(circuit, target);
      const device = circuit.devices.get(end?.device);
      return device ? `${device.tag}/${device.params.pinLabels?.[end.pin] ?? end.pin}` : "?";
    };
    let reference = "";
    let result;
    if (isVoltage) {
      const second = probes[1] ?? referenceFor(circuit, probes[0]);
      if (!second) {
        note.textContent = t`Que (+) tại ${endName(probes[0])}. Chọn điểm (−) để đo điện áp.`;
        return;
      }
      result = measureVoltage(circuit, probes[0], second);
      reference = probes[1] ? `(+) ${endName(probes[0])} · (−) ${endName(second)}. ` : t`So với ${endName(second)}. Bấm điểm (−) để đổi tham chiếu. `;
    } else result = measureCurrent(circuit, probes[0]);
    if (result.value !== null) {
      const milli = !isVoltage && result.value > 0 && result.value < 0.1;
      value.textContent = new Intl.NumberFormat(getLocale(), {maximumSignificantDigits: 6}).format(result.value * (milli ? 1000 : 1)) + " " + (milli ? "mA" : result.unit);
    }
    note.textContent = reference + result.note + (sim ? "" : t(" Đang đo trạng thái ban đầu."));
  } catch (error) {
    note.textContent = errorMessage(error);
  }
}

function unlockBuzzer() {
  sounder.unlock().catch(() => status(t("Chưa phát được âm thanh. Bấm nút loa để bật lại âm thanh còi.")));
}

async function exportProject(format) {
  await fileAction(async () => {
    const output = await exportDrawing(format, board, project.name);
    if (output?.path) status(t`Đã xuất ${format.toUpperCase()} · ${output.path}`);
  });
}

function generateBOM() {
  const dialog = $("bom-dialog");
  const container = $("bom-table-container");
  const summary = $("bom-summary");
  if (!dialog || !container) return;
  showBomExportStatus("");

  const materials = bomMaterials(project);
  const quantity = materials.reduce((sum, material) => sum + material.quantity, 0);
  summary.textContent = t`${quantity} thiết bị · ${materials.length} dòng vật tư`;

  const table = html("table", {class: "bom-table"});
  const thead = html("thead", {},
    html("tr", {},
      html("th", {}, t("STT")),
      html("th", {}, t("Ký hiệu (Tag)")),
      html("th", {}, t("Tên thiết bị")),
      html("th", {}, t("Nhóm")),
      html("th", {}, t("Hãng / Mã hiệu")),
      html("th", {}, t("Thông số")),
      html("th", {}, t("Số chân")),
      html("th", {}, t("Số lượng"))
    )
  );

  const rows = materials.map((material, index) => html("tr", {},
    html("td", {}, String(index + 1)),
    html("td", {class: "bom-tag"}, material.tags.join(", ") || "-"),
    html("td", {}, t(material.name)),
    html("td", {}, t(material.group)),
    html("td", {}, material.model),
    html("td", {}, material.specifications),
    html("td", {}, String(material.pinCount)),
    html("td", {class: "bom-quantity"}, String(material.quantity))));

  table.append(thead, html("tbody", {}, ...rows));
  container.replaceChildren(table);
  dialog.showModal();
}

function showBomExportStatus(message) {
  const feedback = $("bom-export-status");
  feedback.textContent = message;
  feedback.hidden = !message;
}

function exportBOMCSV() {
  return fileAction(async () => {
    showBomExportStatus("");
    try {
      const csv = createBomCsv(project);
      if (desktop) {
        const output = await desktop.exportBomCsv(project.name, csv);
        if (output?.path) showBomExportStatus(t`Đã xuất ${"CSV"} · ${output.path}`);
        return;
      }
      const fileName = (project.name || "DuAn").replace(/[<>:"/\\|?*\u0000-\u001f]/gu, "_");
      const url = URL.createObjectURL(new Blob([csv], {type: "text/csv;charset=utf-8"}));
      html("a", {href: url, download: `BOM_${fileName}.csv`}).click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (error) {
      showBomExportStatus(errorMessage(error));
    }
  });
}

function handleFaultClick(btn) {
  const fault = btn.dataset.fault;
  if (!fault || !sim || mode === "halted" || nativeBusy) return;
  try {
    if (fault === "clear") sim.clearAllFaults();
    else sim.injectFault(fault);
    showSnapshot();
    if (mode !== "halted") {
      const label = btn.querySelector("strong")?.textContent ?? fault;
      status(fault === "clear" ? t("Đã khôi phục trạng thái mạch bình thường (Xóa toàn bộ sự cố).") : t`Đã kích hoạt sự cố: ${label}!`);
    }
  } catch (error) {
    simulationError(error);
  }
}

const actions = {
  about: () => { $("email-copy-status").textContent = ""; $("about-dialog").showModal(); },
  "close-about": () => $("about-dialog").close(),
  "copy-email": async () => {
    try {
      if (desktop?.copyText) await desktop.copyText($("author-email").textContent);
      else await navigator.clipboard.writeText($("author-email").textContent);
      $("email-copy-status").textContent = t("Đã sao chép email.");
    } catch {
      $("email-copy-status").textContent = t("Chọn địa chỉ email để sao chép.");
    }
  },
  "export-pdf": () => exportProject("pdf"),
  "export-dwg": () => exportProject("dwg"),
  sound: button => {
    sounder.enabled = !sounder.enabled;
    setPressed("sound", sounder.enabled);
    button.title = sounder.enabled ? t("Tắt âm thanh còi") : t("Bật âm thanh còi");
    putIcon(button.querySelector("[data-icon]"), sounder.enabled ? "sound" : "mute");
    if (sounder.enabled) unlockBuzzer();
    else sounder.sync(sounder.wanted);
  },
  new: () => fileAction(() => {
    openInTab(createProject(t("Dự án mới")), null, {reuseBlank: false});
    status(t("Đã tạo dự án mới."));
  }),
  "activate-project": button => {
    if (!nativeBusy) switchProject(projects.find(item => item.id === button.dataset.projectId));
  },
  "close-project": button => fileAction(() => closeProject(projects.find(item => item.id === button.dataset.projectId))),
  open: () => fileAction(openProject),
  save: () => fileAction(() => saveProject(false)),
  "save-as": () => fileAction(() => saveProject(true)),
  "sump-pit": () => fileAction(() => chooseExample("sump-pit")),
  "smoke-exhaust": () => fileAction(() => chooseExample("smoke-exhaust")),
  "pressure-control": () => fileAction(() => chooseExample("pressure-control")),
  "ats-panel": () => fileAction(() => chooseExample("ats-panel")),
  bom: generateBOM,
  "close-bom": () => $("bom-dialog")?.close(),
  "export-bom-csv": exportBOMCSV,
  run: () => controlSimulation("run"),
  pause: () => controlSimulation("pause"),
  step: () => controlSimulation("step"),
  reset: () => controlSimulation("reset"),
  select: () => tool("select"),
  wire: () => tool("wire"),
  voltmeter: () => tool("voltmeter"),
  ammeter: () => tool("ammeter"),
  pan: () => tool("pan"),
  rotate: () => change(next => {
    for (const device of next.devices) {
      if (device.type !== "junction" && board.selection.has(device.id)) {
        device.params.orientation = orientationOf(device) === "vertical" ? "horizontal" : "vertical";
      }
    }
  }),
  undo,
  redo,
  copy: copySelection,
  paste: () => pasteSelection().catch(error => status(errorMessage(error))),
  delete: deleteSelection,
  duplicate,
  "zoom-in": () => board.zoom(1.2),
  "zoom-out": () => board.zoom(1 / 1.2),
  fit: () => board.fit(),
  grid: () => {
    board.grid = !board.grid;
    setPressed("grid", board.grid);
    board.updateView();
  },
  snap: () => {
    board.snap = !board.snap;
    setPressed("snap", board.snap);
  },
  "toggle-console": toggleConsole,
  "focus-library": () => $("device-search").focus(),
  "show-examples": () => {
    if (!$("examples").matches(":popover-open")) $("examples").showPopover();
  },
  "select-issue": button => {
    board.select([button.dataset.targetId]);
    board.reveal(button.dataset.targetId);
  },
  "run-tests": () => executeTests(),
  "run-scenario": button => executeTests(button.dataset.scenarioId),
  "edit-scenario": button => scenarioEditor.show(project, project.scenarios.find(scenario => scenario.id === button.dataset.scenarioId)),
  "add-scenario": () => scenarioEditor.show(project),
  "add-step": () => scenarioEditor.addStep(),
  "add-initial": () => scenarioEditor.addInitial(),
  "close-scenario": () => $("scenario-dialog").close(),
  "restore-recovery": () => {
    if (!recovery) return;
    const restored = recovery.map(({model, saved}) => makeProjectTab(model, null, saved));
    storeActiveProject();
    if (activeProject.initialBlank) projects.splice(projects.indexOf(activeProject), 1);
    projects.push(...restored);
    showProjectTab(restored[0]);
    recovery = null;
    $("recovery-dialog").close();
    updateDirty();
    status(t("Đã khôi phục bản tự lưu."));
  },
  "discard-recovery": () => {
    recovery = null;
    writeRecovery(null);
    $("recovery-dialog").close();
  },
};

document.addEventListener("click", event => {
  const faultBtn = event.target.closest("[data-fault]");
  if (faultBtn) {
    handleFaultClick(faultBtn);
    if ($("faults-menu")?.matches(":popover-open")) $("faults-menu").hidePopover();
    return;
  }
  const command = event.target.closest("button[data-action]");
  const tab = event.target.closest("button[data-tab]");
  if (tab) showTab(tab.dataset.tab);
  if (!command || command.disabled) return;
  if (command.closest("#examples") && $("examples").matches(":popover-open")) $("examples").hidePopover();
  if (command.closest("#exports") && $("exports").matches(":popover-open")) $("exports").hidePopover();
  if (command.closest("#faults-menu") && $("faults-menu").matches(":popover-open")) $("faults-menu").hidePopover();
  if (command.dataset.templateId) fileAction(() => openTemplate(command.dataset.templateId));
  else actions[command.dataset.action]?.(command);
});

$("project-tabs").addEventListener("keydown", event => {
  if (!event.target.matches('[role="tab"]')) return;
  const index = projects.indexOf(activeProject);
  const target = {ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: projects.length - 1}[event.key];
  if (target === undefined) return;
  event.preventDefault();
  switchProject(projects[(target + projects.length) % projects.length]);
  focusActiveProjectTab();
});

document.querySelector(".tabs").addEventListener("keydown", event => {
  const direction = {ArrowLeft: -1, ArrowRight: 1}[event.key];
  if (!direction) return;
  const tabs = ["warnings", "log", "tests"];
  const tab = tabs[(tabs.indexOf(activeTab) + direction + tabs.length) % tabs.length];
  event.preventDefault();
  showTab(tab);
  $(`tab-${tab}`).focus();
});

for (const id of ["examples", "exports", "faults-menu"]) {
  const el = $(id);
  if (el) el.addEventListener("beforetoggle", event => {
    if (event.newState !== "open") return;
    const b = buttons(id)[0] || document.querySelector(`[popovertarget="${id}"]`);
    if (!b) return;
    const anchor = b.getBoundingClientRect();
    el.style.left = `${anchor.left}px`;
    el.style.top = `${anchor.bottom + 4}px`;
  });
  el?.addEventListener("toggle", event => {
    if (event.newState !== "open") return;
    const bounds = el.getBoundingClientRect();
    if (bounds.right > window.innerWidth - 8) el.style.left = `${Math.max(8, window.innerWidth - bounds.width - 8)}px`;
  });
}

$("document-name").addEventListener("change", event => {
  const name = event.target.value.trim() || t("Dự án mới");
  change(next => { next.name = name; });
  event.target.value = project.name;
});
$("device-search").addEventListener("input", renderPalette);
$("language-selection").addEventListener("change", async event => {
  setLanguage(event.target.value, globalThis.localStorage);
  document.documentElement.lang = getLanguage();
  translateStaticUI();
  const schedule = $("inspector").querySelector("[data-instrument]")?.captureEditor?.();
  renderPalette();
  renderProjectTabs();
  renderTemplates();
  modelIssues = validateProject(project);
  if (sim) snapshot = sim.advance(0);
  board.setContext(project, snapshot);
  renderInspector();
  if (schedule) $("inspector").querySelector("[data-instrument]")?.restoreEditor?.(schedule);
  refreshMeter();
  renderWarnings();
  renderLog();
  renderScenarios($("scenario-list"), project, results);
  updateClock();
  $("drawing-totals").textContent = t`${project.devices.length} thiết bị · ${project.wires.length} dây`;
  $("status-message").textContent = translateGenerated($("status-message").textContent);
  const sound = buttons("sound")[0];
  sound.title = sounder.enabled ? t("Tắt âm thanh còi") : t("Bật âm thanh còi");
  try { await desktop?.setLanguage?.(getLanguage()); } catch (error) { status(errorMessage(error)); }
});
$("open-file").addEventListener("change", async event => {
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;
  input.value = "";
  await fileAction(async () => {
    const next = parseProject(await file.text());
    openInTab(next);
    status(t`Đã mở “${next.name}”.`);
  });
});
$("recovery-dialog").addEventListener("cancel", event => event.preventDefault());

document.addEventListener("keydown", event => {
  if (event.defaultPrevented || nativeBusy || document.querySelector("dialog[open]")) return;
  const typing = event.target.closest?.("input, select, textarea, [contenteditable]");
  const key = event.key.toLowerCase();
  const modifier = event.ctrlKey || event.metaKey;
  let action;
  if (modifier) {
    action = {s: event.shiftKey ? "save-as" : "save", o: "open", n: "new"}[key];
    if (key === "tab" && !nativeBusy && projects.length > 1) {
      event.preventDefault();
      if (typing) document.activeElement?.blur();
      const index = projects.indexOf(activeProject);
      switchProject(projects[(index + (event.shiftKey ? -1 : 1) + projects.length) % projects.length]);
      focusActiveProjectTab();
      return;
    }
    if (!typing) {
      action ??= {z: event.shiftKey ? "redo" : "undo", y: "redo", d: "duplicate", c: "copy", v: "paste"}[key];
      if (["copy", "paste"].includes(action) && buttons(action)[0]?.disabled) return;
      if (action === "copy" && globalThis.getSelection()?.toString()) return;
      if (key === "a") {
        event.preventDefault();
        board.select([...project.devices, ...project.wires].map(item => item.id));
      }
    }
  } else if (!typing && !event.altKey) {
    action = {v: "select", w: "wire", h: "pan", r: "rotate", delete: "delete"}[key];
    if (key === "escape") {
      board.cancelWire();
      probes = [];
      refreshMeter();
      status("");
    }
    if (key === " " && !event.target.closest?.("button")) {
      board.space = true;
      event.preventDefault();
    }
  }
  if (action) {
    event.preventDefault();
    if (!buttons(action)[0]?.disabled) actions[action]();
  }
});
document.addEventListener("keyup", event => { if (event.key === " ") board.space = false; });
globalThis.addEventListener("pagehide", () => sounder.sync(false));
globalThis.addEventListener("blur", () => { board.space = false; });
if (!desktop) globalThis.addEventListener("beforeunload", event => {
  if (!projects.some(item => item.dirty)) return;
  event.preventDefault();
  event.returnValue = true;
});

renderPalette();
renderTemplates();
const blank = makeProjectTab(project);
blank.initialBlank = true;
projects.push(blank);
showProjectTab(blank);
findRecovery();
