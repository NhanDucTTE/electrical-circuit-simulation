import assert from "node:assert/strict";
import test from "node:test";
import {bomMaterials, createBomCsv} from "../src/bom-export.mjs";
import {createDevice} from "../src/model.mjs";

const header = "\uFEFFSTT,Tag,Tên thiết bị,Nhóm,Hãng / Mã hiệu,Thông số,Số chân,Số lượng";

test("BOM CSV preserves its columns and escapes accented tags, quotes, commas, and line breaks", () => {
  const csv = createBomCsv({devices: [
    {type: "junction", tag: "J1"},
    {type: "contactor", tag: 'K,"ĐK"', params: {domain: 'AC,"220"\r\nV'}},
    {type: "source-ac", tag: "AC1", params: {inputDomain: 220}},
    {type: "selector", tag: "SA1"},
  ]});
  assert.equal(csv, [header,
    '1,"K,""ĐK""",Cuộn contactor,Điều khiển,-,"AC,""220""\r\nV",2,1',
    "2,AC1,Nguồn điều khiển AC,Nguồn điện,-,220,2,1",
    "3,SA1,Công tắc AUTO / MAN / OFF,Điều khiển,-,-,3,1", ""].join("\r\n"));
  assert.equal(createBomCsv({devices: []}), `${header}\r\n`);
});

test("BOM CSV marks formula-like tag and domain values as text", () => {
  const csv = createBomCsv({devices: [
    {type: "contactor", tag: "=2+3", params: {domain: "  +1"}},
    {type: "contactor", tag: "＠A1", params: {domain: "\tAC24"}},
  ]});
  assert.equal(csv, [header,
    "1,'=2+3,Cuộn contactor,Điều khiển,-,'  +1,2,1",
    "2,'＠A1,Cuộn contactor,Điều khiển,-,'\tAC24,2,1", ""].join("\r\n"));
});

test("BOM groups matching materials, preserves tags and keeps separate ratings and standalone contacts", () => {
  const make = (type, id, tag, params) => {
    const item = createDevice(type, 0, 0, tag, id);
    Object.assign(item.params, params);
    return item;
  };
  const devices = [make("contactor", "c1", "MC1", {partNumber: "MC-40a", ratedCurrentA: 40}),
    make("contactor", "c2", "MC2", {partNumber: "MC-40a", ratedCurrentA: 40}),
    make("contactor", "c3", "MC3", {partNumber: "MC-130a", ratedCurrentA: 130}),
    make("main-3ph", "m1", "MC1", {masterId: "c1"}),
    make("contact-no", "a1", "MC1", {masterId: "c1"}),
    make("contact-no", "a2", "R1", {masterId: "missing"}),
    make("junction", "j1", "J1")];
  const materials = bomMaterials({devices});
  assert.deepEqual(materials.map(({tags, model, quantity, pinCount}) => [tags, model, quantity, pinCount]), [
    [["MC1", "MC2"], "MC-40a", 2, 2], [["MC3"], "MC-130a", 1, 2], [["R1"], "-", 1, 2],
  ]);
  const csv = createBomCsv({devices});
  assert.match(csv, /"MC1, MC2",[^\r\n]+,2,2\r\n/u);
  assert.doesNotMatch(csv, /J1|Tiếp điểm chính/u);
});
