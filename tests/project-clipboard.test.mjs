import test from "node:test";
import assert from "node:assert/strict";
import {createDevice, createProject, validateProject} from "../src/model.mjs";
import {captureProjectClipboard, planProjectPaste} from "../src/project-clipboard.mjs";

function fixture() {
  const project = createProject();
  project.devices.push(
    createDevice("source-ac", 20, 40, "AC1", "source"),
    createDevice("contactor", 180, 60, "KM 1", "coil"),
    createDevice("contact-no", 180, 180, "KM 1", "hold"),
    createDevice("lamp", 350, 40, "HL1", "lamp"),
    createDevice("junction", 120, 40, "J1", "branch"),
    createDevice("junction", 120, 240, "J2", "external-branch"),
    createDevice("push-no", 350, 240, "PB1", "outside"),
  );
  const contact = project.devices.find(device => device.id === "hold");
  Object.assign(contact.params, {masterId: "coil", contactLabel: "Tự giữ", pinLabels: {"13": "NO1"}});
  const wire = (id, from, fromPin, to, toPin, extras) => ({
    id, from: {device: from, pin: fromPin}, to: {device: to, pin: toPin}, ...extras,
  });
  project.wires.push(
    wire("feed", "source", "L", "branch", "J", {points: [{x: 100, y: 40}]}),
    wire("coil-live", "branch", "J", "coil", "A1", {label: "L1", points: [{x: 120, y: 60}]}),
    wire("lamp-live", "branch", "J", "lamp", "A1"),
    wire("outward", "branch", "J", "external-branch", "J"),
    wire("outside-live", "external-branch", "J", "outside", "13"),
    wire("coil-return", "coil", "A2", "source", "N"),
  );
  return project;
}

test("Cross-project paste preserves internal wiring, implicit junctions, and linked devices", () => {
  const source = fixture();
  const target = createProject();
  const clipboard = captureProjectClipboard(source, new Set(["source", "coil", "hold", "lamp", "outside-live"]));
  assert.deepEqual(clipboard.devices.map(device => device.id), ["source", "coil", "hold", "lamp", "branch"]);
  assert.deepEqual(clipboard.wires.map(wire => wire.id), ["feed", "coil-live", "lamp-live", "coil-return"]);

  const offset = {x: -60, y: 80};
  const paste = planProjectPaste(target, clipboard, {offset});
  const [supply, coil, contact, lamp, branch] = paste.devices;
  assert.deepEqual([coil.x, coil.y], [120, 140]);
  assert.equal(contact.params.masterId, coil.id);
  assert.equal(contact.params.contactLabel, "Tự giữ");
  assert.deepEqual(contact.params.pinLabels, {"13": "NO1"});
  assert.deepEqual(paste.wires.map(({from, to}) => [from.device, to.device]), [
    [supply.id, branch.id], [branch.id, coil.id], [branch.id, lamp.id], [coil.id, supply.id],
  ]);
  assert.equal(paste.wires[1].label, "L1");
  assert.deepEqual(paste.wires[1].points, [{x: 60, y: 140}]);
  assert.equal(paste.wires[1].to.pin, "A1");
  assert.deepEqual(paste.conflicts, []);
  assert.equal(paste.disconnected, 0);
  assert.equal(target.devices.length, 0);
  assert.equal(target.wires.length, 0);
  assert.equal(source.devices[2].params.masterId, "coil");
  assert.deepEqual(source.wires[1].points, [{x: 120, y: 60}]);
  assert.deepEqual(clipboard.wires[1].points, [{x: 120, y: 60}]);
  const oldIds = new Set([...source.devices, ...source.wires].map(item => item.id));
  const newIds = [...paste.devices, ...paste.wires].map(item => item.id);
  assert.equal(new Set(newIds).size, newIds.length);
  assert.ok(newIds.every(id => !oldIds.has(id)));
  const repeated = planProjectPaste(target, clipboard, {offset});
  assert.ok([...repeated.devices, ...repeated.wires].every(item => !newIds.includes(item.id)));
});

test("Conflicts are reported per owner and renamed without colliding with destination or untouched tags", () => {
  const source = fixture();
  source.devices.push(createDevice("relay", 240, 40, "km 1", "duplicate"),
    createDevice("relay", 240, 160, "KM 1-3", "reserved"));
  const target = createProject();
  target.devices.push(createDevice("relay", 0, 0, " km\t 1 "), createDevice("relay", 0, 0, "KM 1-2"));
  const clipboard = captureProjectClipboard(source, ["coil", "hold", "duplicate", "reserved"]);
  const paste = planProjectPaste(target, clipboard);
  const [coil, contact, duplicate, reserved] = paste.devices;
  assert.equal(coil.tag, "KM 1-4");
  assert.equal(contact.tag, coil.tag);
  assert.equal(contact.params.masterId, coil.id);
  assert.equal(duplicate.tag, "km 1-5");
  assert.equal(reserved.tag, "KM 1-3");
  assert.deepEqual(paste.conflicts, [
    {originalTag: "KM 1", replacementTag: "KM 1-4", deviceIds: [coil.id, contact.id]},
    {originalTag: "km 1", replacementTag: "km 1-5", deviceIds: [duplicate.id]},
  ]);
  assert.deepEqual(target.devices.map(device => device.tag), [" km\t 1 ", "KM 1-2"]);
  assert.deepEqual(clipboard.devices.map(device => device.tag), ["KM 1", "KM 1", "km 1", "KM 1-3"]);
  const combined = {...target, devices: [...target.devices, ...paste.devices]};
  assert.ok(validateProject(combined).every(issue => issue.code !== "duplicate-tag"));

  const emptyTargetPaste = planProjectPaste(createProject(), clipboard);
  assert.equal(emptyTargetPaste.conflicts.length, 1);
  assert.equal(emptyTargetPaste.devices[0].tag, "KM 1");
  assert.equal(emptyTargetPaste.devices[1].tag, "KM 1");
  assert.equal(emptyTargetPaste.devices[2].tag, "km 1-2");
});

test("External references only survive a paste in the same project and preserve intentional tag sharing", () => {
  const source = fixture();
  const motor = createDevice("motor", 160, 320, "M1", "motor");
  Object.assign(motor.params, {commandId: "coil", feedbackId: "lamp"});
  source.devices.push(motor);
  const clipboard = captureProjectClipboard(source, ["hold", "motor", "lamp"]);
  const target = createProject();
  target.devices.push(createDevice("contactor", 0, 0, "km 1", "coil"));
  const crossProject = planProjectPaste(target, clipboard);
  const [contact, lamp, copiedMotor] = crossProject.devices;
  assert.equal(crossProject.disconnected, 2);
  assert.equal(contact.params.masterId, "");
  assert.equal(contact.tag, "KM 1-2");
  assert.equal(copiedMotor.params.commandId, "");
  assert.equal(copiedMotor.params.feedbackId, lamp.id);

  const sameProject = planProjectPaste(source, clipboard, {sameProject: true});
  const [localContact, localLamp, localMotor] = sameProject.devices;
  assert.equal(sameProject.disconnected, 0);
  assert.equal(localContact.params.masterId, "coil");
  assert.equal(localContact.tag, "KM 1");
  assert.equal(localMotor.params.commandId, "coil");
  assert.equal(localMotor.params.feedbackId, localLamp.id);
  assert.deepEqual(sameProject.conflicts.map(conflict => conflict.originalTag), ["HL1", "M1"]);

  source.devices = source.devices.filter(device => device.id !== "coil");
  const removedMaster = planProjectPaste(source, clipboard, {sameProject: true});
  assert.equal(removedMaster.disconnected, 2);
  assert.equal(removedMaster.devices[0].params.masterId, "");
});

test("Copy requires a device and retains explicitly selected junctions", () => {
  const source = fixture();
  assert.equal(captureProjectClipboard(source, ["feed"]), null);
  const clipboard = captureProjectClipboard(source, ["source", "external-branch"]);
  assert.deepEqual(clipboard.devices.map(device => device.id), ["source", "branch", "external-branch"]);
  assert.deepEqual(clipboard.wires.map(wire => wire.id), ["feed", "outward"]);
});
