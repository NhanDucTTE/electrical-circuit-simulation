import {CATALOG, LINKED_TYPES, supportsMasterState} from "./model.mjs";

const headers = ["STT", "Tag", "Tên thiết bị", "Nhóm", "Hãng / Mã hiệu", "Thông số", "Số chân", "Số lượng"];

export function bomMaterials(project) {
  const devices = new Map(project.devices.map(device => [device.id, device]));
  const materials = new Map();
  for (const device of project.devices) {
    if (device.type === "junction") continue;
    const {params = {}} = device;
    const owner = LINKED_TYPES.has(device.type) ? devices.get(params.masterId) : null;
    if (owner && owner !== device && supportsMasterState(owner.type, "active")) continue;

    const definition = CATALOG[device.type];
    const model = params.partNumber || definition?.hardware?.model || definition?.hardware?.display || "-";
    const specifications = [params.domain ?? params.inputDomain,
      Number.isFinite(params.ratedPowerKw) ? `${params.ratedPowerKw} kW` : null,
      Number.isFinite(params.ratedCurrentA) ? `${params.ratedCurrentA} A` : null]
      .filter(value => value != null && value !== "").join(" · ") || "-";
    const key = JSON.stringify([device.type, model, specifications]);
    if (!materials.has(key)) materials.set(key, {tags: [], name: definition?.name ?? device.type,
      group: definition?.group ?? "", model, specifications, pinCount: definition?.pins?.length ?? 0, quantity: 0});
    const material = materials.get(key);
    if (device.tag) material.tags.push(device.tag);
    material.quantity += 1;
  }
  return [...materials.values()];
}

function spreadsheetText(value) {
  const text = String(value);
  // A quoted CSV field can still be interpreted as a formula by a spreadsheet.
  return text !== "-" && /^[\t\r\n]|^\s*[=+\-@＝＋－＠]/u.test(text) ? `'${text}` : text;
}

function csvField(value) {
  const text = String(value);
  return /[",\r\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createBomCsv(project) {
  const rows = bomMaterials(project).map((material, index) => [index + 1, spreadsheetText(material.tags.join(", ")),
    material.name, material.group, spreadsheetText(material.model), spreadsheetText(material.specifications),
    material.pinCount, material.quantity]);
  return `\uFEFF${[headers, ...rows].map(row => row.map(csvField).join(",")).join("\r\n")}\r\n`;
}
