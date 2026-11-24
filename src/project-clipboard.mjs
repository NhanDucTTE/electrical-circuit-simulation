import {createId, LINKED_TYPES, normalizeComponentTag, supportsMasterState} from "./model.mjs";

const deviceReferences = ["masterId", "commandId", "feedbackId"];

function otherEnd(wire, id) {
  return wire.from.device === id ? wire.to.device : wire.from.device;
}

function internalConnections(project, selected) {
  const connections = new Map();
  for (const device of project.devices) {
    if (selected.has(device.id) || device.type === "junction") connections.set(device.id, new Set());
  }
  for (const wire of project.wires) {
    if (!connections.has(wire.from.device) || !connections.has(wire.to.device)) continue;
    connections.get(wire.from.device).add(wire);
    connections.get(wire.to.device).add(wire);
  }

  // Keep implicit branch nodes on the selected wiring and trim loose ends leading outward.
  const loose = [...connections].filter(([id, wires]) => !selected.has(id) && wires.size === 1);
  for (const [id, wires] of loose) {
    const [wire] = wires;
    if (!wire) continue;
    const neighbor = otherEnd(wire, id);
    const adjacent = connections.get(neighbor);
    wires.delete(wire);
    if (adjacent.delete(wire) && adjacent.size === 1 && !selected.has(neighbor)) loose.push([neighbor, adjacent]);
  }

  const included = new Set(selected);
  const wires = new Set();
  for (const id of included) {
    for (const wire of connections.get(id)) {
      wires.add(wire);
      included.add(otherEnd(wire, id));
    }
  }
  return {devices: project.devices.filter(device => included.has(device.id)), wires: project.wires.filter(wire => wires.has(wire))};
}

export function captureProjectClipboard(project, selectedIds) {
  const selection = new Set(selectedIds);
  const selected = new Set(project.devices.filter(device => selection.has(device.id)).map(device => device.id));
  return selected.size ? structuredClone(internalConnections(project, selected)) : null;
}

function tagGroups(devices, byId, targetDevices) {
  const groups = new Map();
  for (const device of devices) {
    const masterId = LINKED_TYPES.has(device.type) && device.params.masterId;
    const copiedMaster = byId.get(masterId);
    const master = copiedMaster ?? targetDevices.get(masterId);
    const owner = master && supportsMasterState(master.type, "active") ? master : device;
    if (owner !== device) device.tag = owner.tag;
    if (!byId.has(owner.id)) continue;
    if (!groups.has(owner.id)) groups.set(owner.id, {tag: owner.tag, devices: []});
    groups.get(owner.id).devices.push(device);
  }
  return [...groups.values()];
}

function renameConflicts(groups, targetDevices) {
  const assigned = new Set(targetDevices.map(device => normalizeComponentTag(device.tag)));
  const reserved = new Set([...assigned, ...groups.map(group => normalizeComponentTag(group.tag))]);
  const nextSuffix = new Map();
  const conflicts = [];
  for (const {tag, devices} of groups) {
    const key = normalizeComponentTag(tag);
    if (!key) continue;
    if (!assigned.has(key)) {
      assigned.add(key);
      continue;
    }
    const originalTag = tag.trim();
    let number = nextSuffix.get(key) ?? 2;
    let replacementTag = `${originalTag}-${number}`;
    while (reserved.has(normalizeComponentTag(replacementTag))) replacementTag = `${originalTag}-${++number}`;
    nextSuffix.set(key, number + 1);
    reserved.add(normalizeComponentTag(replacementTag));
    for (const device of devices) device.tag = replacementTag;
    conflicts.push({originalTag, replacementTag, deviceIds: devices.map(device => device.id)});
  }
  return conflicts;
}

export function planProjectPaste(project, clipboard, {sameProject = false, offset = {x: 40, y: 40}} = {}) {
  const {devices, wires} = structuredClone(clipboard);
  const targetDevices = new Map(project.devices.map(device => [device.id, device]));
  const usedIds = new Set([...project.devices, ...project.wires, ...devices, ...wires].map(item => item.id));
  const freshId = () => {
    let id = createId();
    while (usedIds.has(id)) id = createId();
    usedIds.add(id);
    return id;
  };
  const ids = new Map(devices.map(device => [device.id, freshId()]));
  let disconnected = 0;
  for (const device of devices) {
    device.id = ids.get(device.id);
    device.x += offset.x;
    device.y += offset.y;
    for (const key of deviceReferences) {
      const sourceId = device.params[key];
      if (!sourceId) continue;
      if (ids.has(sourceId)) device.params[key] = ids.get(sourceId);
      else if (!sameProject || !targetDevices.has(sourceId)) {
        device.params[key] = "";
        disconnected++;
      }
    }
  }
  for (const wire of wires) {
    wire.id = freshId();
    wire.from.device = ids.get(wire.from.device);
    wire.to.device = ids.get(wire.to.device);
    for (const point of wire.points ?? []) {
      point.x += offset.x;
      point.y += offset.y;
    }
  }

  const byId = new Map(devices.map(device => [device.id, device]));
  const groups = tagGroups(devices, byId, targetDevices);
  return {devices, wires, disconnected, conflicts: renameConflicts(groups, project.devices)};
}
