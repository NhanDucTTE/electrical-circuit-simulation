import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {messages} from "../src/translations.mjs";
import {t, getLanguage, restoreLanguage, setLanguage, translateGenerated} from "../src/i18n.mjs";
import {parseProject, serializeProject} from "../src/model.mjs";
import {Simulator} from "../src/simulator.mjs";

test("Ngôn ngữ mặc định, lưu lựa chọn và phục hồi cả khi bộ nhớ bị chặn", () => {
  assert.equal(restoreLanguage({getItem: () => null}), "vi");
  let saved;
  setLanguage("ja", {setItem: (key, value) => { saved = value; }});
  assert.equal(saved, "ja");
  assert.equal(restoreLanguage({getItem: () => saved}), "ja");
  assert.equal(restoreLanguage({getItem() { throw Error("blocked"); }}), "vi");
  assert.equal(setLanguage("unknown"), "vi");
});

test("Ba ngôn ngữ giữ nguyên nội dung nội suy của người dùng và đủ bản dịch", () => {
  const tag = "K1 Việt 日本 {0} <&>";
  setLanguage("vi");
  const message = t`Đã lưu “${tag}”.`;
  setLanguage("en");
  assert.equal(translateGenerated(message), `Saved “${tag}”.`);
  assert.equal(t("Tạm dừng"), "Paused");
  setLanguage("ja");
  assert.equal(t`Đã lưu “${tag}”.`, `「${tag}」を保存しました。`);
  for (const [key, pair] of Object.entries(messages)) {
    assert.equal(pair.length, 2, key);
    for (const translation of pair) {
      assert.ok(translation.trim(), key);
      assert.deepEqual([...translation.matchAll(/\{\d+\}/g)].map(m => m[0]).sort(),
        [...key.matchAll(/\{\d+\}/g)].map(m => m[0]).sort(), key);
    }
  }
  setLanguage("vi");
});

test("Đổi ngôn ngữ giữ dữ liệu dự án và trạng thái điện của mạch đang mô phỏng", () => {
  const project = parseProject(readFileSync(new URL("../examples/pressure-control.td2d.json", import.meta.url), "utf8"));
  project.name = "Dự án 日本 English";
  project.devices.find(d => d.id === "pt").tag = "PT1 · Áp suất 水圧";
  const before = serializeProject(project);
  const sim = new Simulator(project);
  sim.apply("pt", "pressureBar", 7.5);
  sim.advance(2750);
  for (const language of ["en", "ja", "vi"]) {
    setLanguage(language);
    const state = sim.advance(0);
    assert.equal(state.time, 2750);
    assert.equal(state.devices.pt.currentMa, 16);
    assert.equal(state.devices.light.active, true);
    assert.equal(serializeProject(project), before);
  }
  assert.equal(getLanguage(), "vi");
});
