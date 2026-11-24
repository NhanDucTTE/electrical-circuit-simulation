import test from "node:test";
import assert from "node:assert/strict";
import {createDevice, createProject, parseProject, serializeProject, syncContactTags, validateProject} from "../src/model.mjs";
import {lampColor, BuzzerAudio} from "../src/signals.mjs";

test("Các tiếp điểm mang tag của chủ, giữ mô tả cũ và kiểm tra trùng giữa hai thiết bị độc lập", () => {
  const p = createProject();
  const relay = createDevice("relay", 0, 0, "K1", "relay");
  const first = createDevice("contact-no", 30, 0, "K1 · tự giữ", "hold");
  const second = createDevice("contact-nc", 60, 0, "K3", "interlock");
  first.params.masterId = second.params.masterId = relay.id;
  p.devices.push(first, relay, second);
  const restored = parseProject(JSON.stringify(p));
  assert.deepEqual(restored.devices.map(d => d.tag), ["K1", "K1", "K1"]);
  assert.equal(restored.devices[0].params.contactLabel, "K1 · tự giữ");
  assert.equal(validateProject(restored).filter(i => i.code === "duplicate-tag").length, 0);
  restored.devices[1].tag = "KM-02";
  syncContactTags(restored.devices);
  assert.ok(restored.devices.every(d => d.tag === "KM-02"));
  const other = createDevice("relay", 90, 0, "KM-02", "relay2");
  restored.devices.push(other);
  assert.ok(validateProject(restored).some(i => i.code === "duplicate-tag" && i.device === other.id));
  other.tag = "KM-03";
  restored.devices[2].params.masterId = other.id;
  syncContactTags(restored.devices);
  assert.deepEqual(parseProject(serializeProject(restored)).devices.map(d => d.tag), ["KM-02", "KM-02", "KM-03", "KM-03"]);
});

test("Đèn dùng màu đã chọn hoặc màu từ ký hiệu bản vẽ cũ", () => {
  assert.equal(lampColor({lampMark: "R"}), "#f45c59");
  assert.equal(lampColor({lampMark: "O"}), "#ffa234");
  assert.equal(lampColor({lampColor: "#6550ce", lampMark: "R"}), "#6550ce");
});

test("Còi bắt đầu một lần, dừng khi tắt tiếng hoặc mất điện và kêu trở lại khi cho phép", () => {
  const buzzer = new BuzzerAudio();
  let started = 0, stopped = 0;
  const param = {setValueAtTime() {}, cancelScheduledValues() {}, linearRampToValueAtTime() {}};
  buzzer.context = {state: "running", currentTime: 0, createOscillator: () => ({
    frequency: {}, connect: node => node, start: () => started++, stop: () => stopped++,
  }), createGain: () => ({gain: param, connect() {}})};
  buzzer.sync(true);
  buzzer.sync(true);
  assert.deepEqual([started, stopped], [1, 0]);
  buzzer.enabled = false;
  buzzer.sync(true);
  assert.deepEqual([started, stopped], [1, 1]);
  buzzer.enabled = true;
  buzzer.sync(true);
  buzzer.sync(false);
  assert.deepEqual([started, stopped], [2, 2]);
});
