import {t} from "./i18n.mjs";
import {createId, getDeviceInputs} from "./model.mjs";
import {html, icon} from "./ui-elements.mjs";
import {instrumentStateLabels} from "./instrument-ui.mjs";

export const stateLabels = {
  ...instrumentStateLabels,
  active: "Tác động", powered: "Cuộn có điện", closed: "Tiếp điểm đóng",
  command: "Lệnh chạy", running: "Tải nhận 3 pha", feedback: "Phản hồi",
  tripped: "Trip", mode: "Chế độ", signal: "Tín hiệu", on: "Đóng / bật", pressed: "Đang nhấn",
  controlPowered: "Có nguồn điều khiển", autoInput: "Đầu vào P5", frequency: "Tần số đầu ra (Hz)", speedRpm: "Tốc độ đồng bộ ước tính (rpm)",
  demandPercent: "Mức yêu cầu SCR (%)", outputPercent: "Mức cho phép SCR (%)", heating: "Đang gia nhiệt",
};
const verdicts = {pass: "Đạt", fail: "Không đạt", unverified: "Chưa xác minh"};
const inputLabels = {...instrumentStateLabels, on: "Nguồn / CB", trip: "Trip", pressed: "Nút nhấn", mode: "Chế độ", signal: "Tín hiệu",
  frequencyHz: "Tần số đặt (Hz)", demandPercent: "Mức yêu cầu SCR (%)"};
const testStates = Object.keys(stateLabels);
const numericStates = new Set(["pressureBar", "temperatureC", "currentMa", "resistanceOhm", "pv", "waterLevel", "frequency", "speedRpm", "demandPercent", "outputPercent"]);

export function displayValue(value) {
  if (value === true) return t("Có / ON");
  if (value === false) return t("Không / OFF");
  if (value === undefined) return "—";
  if (value === null) return t("Chưa mô hình hóa");
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function cell(children, cls) {
  return html("td", {class: cls}, children);
}

export function table(headings, rows) {
  return html("table", {class: "console-table"},
    html("thead", {}, html("tr", {}, ...headings.map(heading => html("th", {scope: "col"}, t(heading))))),
    html("tbody", {}, ...rows),
  );
}

function targetText(device, key, value, tags, labels) {
  return `${tags.get(device) ?? device} · ${t(labels[key]) ?? key} = ${displayValue(value)}`;
}

function items(values) {
  if (!values.length) return "—";
  return html("ul", {}, ...values.map(value => html("li", {}, value)));
}

function preserveDetails(container) {
  return new Set([...container.querySelectorAll("details[open]")].map(detail => detail.dataset.detail));
}

export function renderScenarios(container, project, results) {
  const open = preserveDetails(container);
  const tags = new Map(project.devices.map(device => [device.id, device.tag]));
  const blocks = project.scenarios.map(scenario => {
    const result = results.get(scenario.id);
    const initial = (scenario.initial ?? []).map(action => targetText(action.device, action.key, action.value, tags, inputLabels));
    const rows = scenario.steps.map((step, index) => {
      const actualStep = result?.steps?.[index];
      const expected = (step.expect ?? []).map(({device, key, value, label}) => label
        ? `${label} = ${displayValue(value)}` : targetText(device, key, value, tags, stateLabels));
      const actual = (actualStep?.checks ?? []).map(({device, key, actual, label, pass}) => {
        const labelText = label ? `${label} = ${displayValue(actual)}` : targetText(device, key, actual, tags, stateLabels);
        return `${labelText} · ${pass ? t("khớp") : t("lệch")}`;
      });
      const actions = (step.actions ?? []).map(({device, key, value}) => targetText(device, key, value, tags, inputLabels));
      return html("tr", {},
        cell(actualStep ? `${(actualStep.time / 1000).toFixed(3)} s` : step.atMs != null ? `${step.atMs} ms` : step.advanceMs ? `+${step.advanceMs} ms` : "—", "table-time"),
        cell(html("div", {}, html("strong", {}, step.label || t`Bước ${index + 1}`), items(actions), actualStep?.error ? html("p", {class: "status-error"}, actualStep.error) : null)),
        cell(step.reference || scenario.reference || "—"), cell(items(expected)), cell(items(actual)),
        cell(t(verdicts[actualStep?.status]) ?? t("Chưa chạy"), actualStep ? `status-${actualStep.status}` : ""),
      );
    });
    const status = result?.status ?? (scenario.verification === "unverified" ? "unverified" : null);
    const summary = scenario.initialDescription ?? scenario.initialNote;
    return html("article", {class: "scenario", "data-scenario": scenario.id},
      html("div", {class: "scenario-header"},
        html("div", {}, html("strong", {}, scenario.name), html("div", {}, html("small", {}, scenario.reference || t("Nguồn chưa ghi")))),
        html("div", {class: "scenario-title"},
          html("span", {class: status ? `status-${status}` : ""}, t(verdicts[status]) ?? t("Chưa chạy")),
          html("button", {type: "button", "data-action": "run-scenario", "data-scenario-id": scenario.id}, icon("play"), t("Chạy ca")),
          html("button", {type: "button", "data-action": "edit-scenario", "data-scenario-id": scenario.id}, t("Sửa")),
        ),
      ),
      html("details", {class: "scenario-steps", "data-detail": scenario.id, open: open.has(scenario.id) || Boolean(result && results.size === 1)},
        html("summary", {}, t`${scenario.steps.length} bước · ${scenario.verification === "unverified" ? t("Chưa xác minh theo hồ sơ") : t("Chi tiết kiểm thử")}`),
        html("p", {}, summary || t("Trạng thái đầu theo cấu hình mặc định của thiết bị.")),
        initial.length ? items(initial) : null,
        result?.error ? html("p", {class: "status-error"}, result.error) : null,
        table([t("Thời điểm"), t("Thao tác"), t("Nguồn"), t("Dự kiến"), t("Thực tế"), t("Kết quả")], rows),
      ),
    );
  });
  container.replaceChildren(...(blocks.length ? blocks : [html("p", {class: "console-empty"}, t("Thêm ca để ghi lại thao tác và trạng thái dự kiến."))]));
}

function editorLabel(label, input) {
  return html("label", {}, t(label), input);
}

function makeOptions(options, selected, translate = true) {
  return options.map(([id, label]) => html("option", {value: id, selected: id === selected}, translate ? t(label) : label));
}

function makeInput(attrs, value) {
  const field = html("input", attrs);
  field.value = value ?? "";
  return field;
}

function parseValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  return value;
}

function targetRow(project, entry, expectation) {
  const deviceSelect = html("select", {required: true, "data-test-field": "device"},
    ...makeOptions([["", t("Chọn thiết bị")], ...project.devices.map(device => [device.id, device.params.masterId
      ? `${device.tag} · ${device.params.contactLabel || device.type} · ${device.x},${device.y}` : device.tag])], entry?.device, false));
  if (entry?.device && !project.devices.some(device => device.id === entry.device)) {
    deviceSelect.append(html("option", {value: entry.device, selected: true}, t`${entry.device} · thiếu thiết bị`));
  }
  const keySelect = html("select", {required: true, "data-test-field": "key"});
  const valueHolder = html("div");
  let valueField;
  function setValues(wanted) {
    const device = project.devices.find(item => item.id === deviceSelect.value);
    const meta = getDeviceInputsFor(device).find(item => item.key === keySelect.value);
    const key = keySelect.value;
    const numeric = meta?.type === "number" || typeof wanted === "number" || numericStates.has(key);
    if (numeric) {
      valueField = makeInput({type: "number", min: meta?.min, max: meta?.max, step: meta?.step ?? "any",
        required: !expectation, "data-test-field": "value", placeholder: expectation ? t("Trống = chưa có giá trị") : undefined}, wanted);
      valueHolder.replaceChildren(editorLabel(t("Giá trị"), valueField));
      return;
    }
    const displayChoices = {bank: ["A", "B"], supplyTap: ["S1", "S2", "null"]};
    if (key === "clockText" && expectation) {
      valueField = makeInput({"data-test-field": "value", required: true}, wanted);
      valueHolder.replaceChildren(editorLabel(t("Giá trị"), valueField));
      return;
    }
    const options = key === "mode" && expectation ? ["AUTO", "MAN", "OFF"] : meta?.options ?? (expectation ? displayChoices[key] : null);
    const values = options ? options.map(value => [String(value), String(value)])
      : [["true", t("Có / ON")], ["false", t("Không / OFF")], ...(expectation ? [["null", t("Chưa mô hình hóa")]] : [])];
    if (wanted !== undefined && wanted !== null && !values.some(([value]) => value === String(wanted))) {
      valueField = makeInput({"data-test-field": "value", required: true}, wanted);
    } else {
      valueField = html("select", {"data-test-field": "value", required: true}, ...makeOptions(values, String(wanted)));
    }
    valueHolder.replaceChildren(editorLabel(t("Giá trị"), valueField));
  }
  function refresh(currentKey, currentValue) {
    const device = project.devices.find(item => item.id === deviceSelect.value);
    const choice = expectation ? testStates.map(key => [key, stateLabels[key]]) : getDeviceInputsFor(device).map(input => [input.key, input.label]);
    if (currentKey && !choice.some(([key]) => key === currentKey)) choice.push([currentKey, currentKey]);
    keySelect.replaceChildren(...makeOptions(choice.length ? choice : [["", t("Chọn thiết bị có đầu vào")]], currentKey));
    setValues(currentValue);
  }
  deviceSelect.addEventListener("change", () => refresh());
  keySelect.addEventListener("change", () => setValues());
  refresh(entry?.key, entry?.value);
  const remove = html("button", {type: "button", class: "tool", "aria-label": t("Xóa dòng")}, icon("trash"));
  const node = html("div", {class: "editor-grid"}, editorLabel(t("Thiết bị"), deviceSelect), editorLabel(t("Trạng thái"), keySelect), valueHolder, remove);
  remove.addEventListener("click", () => node.remove());
  node.read = () => {
    if (!deviceSelect.value || !keySelect.value) throw new Error(t("Chọn đầy đủ thiết bị và trạng thái cho mỗi dòng."));
    const value = valueField.type === "number" ? valueField.value === "" ? null : valueField.valueAsNumber : parseValue(valueField.value);
    return {...entry, device: deviceSelect.value, key: keySelect.value, value};
  };
  return node;
}

function getDeviceInputsFor(device) {
  return device ? getDeviceInputs(device) : [];
}

function stepEditor(project, step) {
  const label = makeInput({required: true, maxlength: 200}, step.label);
  const absolute = step.atMs != null;
  const time = makeInput({type: "number", min: 0, step: 1, required: true}, step.atMs ?? step.advanceMs ?? 0);
  const reference = makeInput({maxlength: 300}, step.reference);
  const remove = html("button", {type: "button", class: "tool", "aria-label": t("Xóa bước")}, icon("trash"));
  const actions = html("div", {class: "editor-rows"}, ...(step.actions ?? []).map(action => targetRow(project, action, false)));
  const expectations = html("div", {class: "editor-rows"}, ...(step.expect ?? []).map(expect => targetRow(project, expect, true)));
  const addAction = html("button", {type: "button"}, icon("plus"), t("Thêm thao tác"));
  const addExpect = html("button", {type: "button"}, icon("plus"), t("Thêm dự kiến"));
  const box = html("section", {class: "scenario-editor-step"},
    html("div", {class: "step-heading"}, editorLabel(t("Tên bước"), label), editorLabel(absolute ? t("Thời điểm (ms)") : t("Tiến thêm (ms)"), time), remove),
    editorLabel(t("Nguồn riêng của bước"), reference),
    html("span", {class: "editor-subtitle"}, t("Thao tác")), actions,
    html("span", {class: "editor-subtitle"}, t("Dự kiến")), expectations,
    html("div", {class: "step-buttons"}, addAction, addExpect),
  );
  remove.addEventListener("click", () => box.remove());
  addAction.addEventListener("click", () => actions.append(targetRow(project, null, false)));
  addExpect.addEventListener("click", () => expectations.append(targetRow(project, null, true)));
  box.read = () => ({
    ...step,
    label: label.value.trim(),
    reference: reference.value.trim(),
    [absolute ? "atMs" : "advanceMs"]: Number(time.value),
    actions: [...actions.children].map(row => row.read()),
    expect: [...expectations.children].map(row => row.read()),
  });
  return box;
}

export class ScenarioEditor {
  constructor(dialog, onSave) {
    this.dialog = dialog;
    this.onSave = onSave;
    this.form = dialog.querySelector("form");
    for (const key of ["name", "source", "initial", "verification", "steps", "error", "initial-actions"]) {
      this[key] = dialog.querySelector(`#scenario-${key}`);
    }
    this.form.addEventListener("submit", event => {
      event.preventDefault();
      try {
        const steps = [...this.steps.children].map(step => step.read());
        if (!steps.length || !steps.some(step => step.expect.length)) throw new Error(t("Ca kiểm thử cần ít nhất một bước và một kết quả dự kiến."));
        this.onSave({
          ...this.scenario,
          id: this.scenario?.id ?? createId(),
          name: this.name.value.trim(),
          reference: this.source.value.trim(),
          initialDescription: this.initial.value.trim(),
          verification: this.verification.value,
          initial: [...this["initial-actions"].children].map(row => row.read()),
          steps,
        });
        this.dialog.close();
      } catch (error) {
        this.error.textContent = error.message;
      }
    });
  }

  show(project, scenario) {
    this.project = project;
    this.scenario = scenario;
    this.name.value = scenario?.name ?? "";
    this.source.value = scenario?.reference ?? "";
    this.initial.value = scenario?.initialDescription ?? scenario?.initialNote ?? "";
    this.verification.value = scenario?.verification ?? (scenario ? "verified" : "unverified");
    this.error.textContent = "";
    this["initial-actions"].replaceChildren(...(scenario?.initial ?? []).map(row => targetRow(project, row, false)));
    this.steps.replaceChildren(...(scenario?.steps ?? [{label: "", advanceMs: 0}]).map(step => stepEditor(project, step)));
    this.dialog.showModal();
  }

  addStep() {
    this.steps.append(stepEditor(this.project, {label: "", advanceMs: 0}));
  }

  addInitial() {
    this["initial-actions"].append(targetRow(this.project, null, false));
  }
}
