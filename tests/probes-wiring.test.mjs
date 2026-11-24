import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import {createDevice, createProject, parseProject, serializeProject, validateProject} from "../src/model.mjs";
import {Simulator} from "../src/simulator.mjs";
import {measureCurrent, measureVoltage, referenceFor} from "../src/probes.mjs";
import {nearestTap, connectTargets} from "../src/wire-branches.mjs";
import {Schematic, wireRoute} from "../src/schematic.mjs";

const pin = (device, pin) => ({device, pin});
const wire = (id, from, to, points = []) => ({id, from, to, points, label: "201"});
const target = (wire, tap) => ({wire, tap, point: tap.point});

function parallelLamps() {
  const project = createProject();
  project.devices = ["source-ac", "junction", "relay", "lamp", "push-nc"].map((type, i) =>
    createDevice(type, i * 120, i < 3 ? 120 : 0, "D" + i, "d" + i));
  project.devices[2].params.operatingCurrentA = 0.12;
  project.devices[3].params.operatingCurrentA = 0.03;
  project.wires = [
    wire("feed", pin("d0","L"), pin("d1","J")),
    wire("coil", pin("d1","J"), pin("d2","A1")),
    wire("beforeSwitch", pin("d1","J"), pin("d4","21")),
    wire("afterSwitch", pin("d4","22"), pin("d3","A1")),
    wire("ret", pin("d0","N"), pin("d2","A2")),
    wire("retLamp", pin("d2","A2"), pin("d3","A2")),
  ];
  return project;
}

test("Ampe kế phân biệt dòng tổng, dòng nhánh, chân tải và dòng khi hở tiếp điểm", () => {
  const sim = new Simulator(parallelLamps());
  const at = id => measureCurrent(sim, {wire: id}).value;
  assert.equal(at("feed"), 0.15);
  assert.equal(at("ret"), 0.15);
  assert.equal(at("coil"), 0.12);
  assert.equal(at("afterSwitch"), 0.03);
  assert.equal(measureCurrent(sim, pin("d2","A2")).value, 0.12);
  assert.equal(measureCurrent(sim, pin("d0","L")).value, 0.15);
  assert.equal(measureCurrent(sim, pin("d1","J")).value, null);
  sim.apply("d4", "pressed", true);
  assert.equal(at("feed"), 0.12);
  assert.equal(at("beforeSwitch"), 0);
  assert.equal(at("afterSwitch"), 0);
  assert.equal(measureVoltage(sim, {wire:"beforeSwitch"}, {wire:"afterSwitch"}).value, 230);
});

test("Dòng chưa khai báo, dòng trong dây song song và miền xung đột được phân biệt", () => {
  const project = parallelLamps();
  delete project.devices[3].params.operatingCurrentA;
  let sim = new Simulator(project);
  assert.match(measureCurrent(sim, {wire:"feed"}).note, /Chưa khai báo/);
  assert.equal(measureCurrent(sim, {wire:"coil"}).value, 0.12);
  project.wires.push(wire("parallel", pin("d0","L"), pin("d1","J")));
  sim = new Simulator(project);
  assert.match(measureCurrent(sim, {wire:"feed"}).note, /song song/);
  project.wires.push(wire("short", pin("d0","N"), pin("d1","J")));
  sim = new Simulator(project);
  assert.equal(measureCurrent(sim, {wire:"feed"}).value, null);
  assert.equal(measureVoltage(sim, {wire:"feed"}, {wire:"ret"}).value, null);
});

test("Vôn kế giữ đúng cực DC, đo giữa pha, từ chối điểm trôi và nguồn độc lập", () => {
  const project = createProject();
  project.devices = ["source-dc", "source-3ph", "source-dc", "terminal"].map((type, i) => createDevice(type, 0, 0, type + i, "d" + i));
  const sim = new Simulator(project);
  assert.deepEqual(referenceFor(sim, pin("d0","+")), pin("d0","-"));
  assert.equal(measureVoltage(sim, pin("d0","-"), pin("d0","+")).value, -24);
  assert.equal(measureVoltage(sim, pin("d1","L1"), pin("d1","L3")).value, 400);
  assert.equal(measureVoltage(sim, pin("d0","-"), pin("d2","-")).value, null);
  assert.equal(measureVoltage(sim, pin("d3","1"), pin("d0","-")).value, null);
  assert.equal(measureVoltage(sim, pin("d3","1"), pin("d3","2")).value, 0);
});

test("Nối hai dây trong một thao tác, giữ đường dây, nhãn và kết nối khi mở lại", () => {
  const project = createProject();
  project.devices = [[0,0], [120,0], [0,80], [150,80]].map(([x,y], i) => createDevice("junction", x, y, "J" + (i+1), "j" + i));
  project.wires = [wire("row1", pin("j0", "J"), pin("j1", "J")), wire("row2", pin("j2","J"), pin("j3","J"))];
  let devices = new Map(project.devices.map(device => [device.id, device]));
  const tap = (index, x, y) => nearestTap(wireRoute(project.wires[index], devices), {x, y});
  const from = target("row1", tap(0,40,1));
  const to = target("row2", tap(1,100,79));
  assert.deepEqual(from.point, {x:40, y:0});
  assert.deepEqual(to.point, {x:100,y:80});
  const result = connectTargets(project, from, to, [{x:40, y:60}]);
  const loaded = parseProject(serializeProject(project));
  assert.equal(loaded.devices.length, 6);
  assert.equal(loaded.wires.length, 5);
  assert.equal(loaded.wires.filter(w => w.label === "201").length, 4);
  assert.equal(loaded.wires.at(-1).id, result.selected);
  assert.deepEqual(loaded.wires.at(-1).points,[{x:40,y:60}]);
  devices = new Map(loaded.devices.map(d => [d.id,d]));
  assert.ok(loaded.wires.slice(0,4).every(w => wireRoute(w, devices).every(p => p.y === (w.from.device === "j0" || w.to.device === "j1" ? 0 : 80))));
  assert.equal(validateProject(loaded).filter(i => i.severity === "error").length,0);
  assert.equal(measureVoltage(new Simulator(loaded), pin("j0","J"), pin("j3","J")).value, 0);
});

test("Tạo đúng một nút tại giao điểm; hủy trường hợp chạm lại cùng dây", () => {
  const p = createProject();
  p.devices = [[0,0],[100,0],[50,-50],[50,50]].map(([x,y],i) => createDevice("junction",x,y,"J"+i,"j"+i));
  p.wires = [wire("h",pin("j0","J"),pin("j1","J")),wire("v",pin("j2","J"),pin("j3","J"))];
  const map = new Map(p.devices.map(d => [d.id,d]));
  const ts = p.wires.map(w => target(w.id,nearestTap(wireRoute(w,map),{x:50,y:0})));
  assert.equal(nearestTap(wireRoute(p.wires[0],map),{x:0,y:0}).end,"from");
  assert.equal(connectTargets(p,ts[0],ts[0],[]).selected,undefined);
  assert.equal(connectTargets(p,ts[0],pin("j0","J"),[]).selected,undefined);
  assert.equal(p.devices.length,4);
  const board = {project:p, devices:map, waypoints:[], pending:ts[1]};
  const hidden = Schematic.prototype.wireTarget.call(board,"v",{x:52,y:1});
  assert.equal(hidden.wire,"h");
  connectTargets(p,board.pending,hidden,[]);
  assert.equal(p.devices.length,5);
  assert.equal(p.wires.length,4);
  assert.equal(p.wires.filter(w => [w.from,w.to].some(e => e.device === p.devices.at(-1).id)).length,4);
});

test("Hai đầu dây trùng tọa độ vẫn cần liên kết hai chân độc lập", () => {
  const p = createProject();
  p.devices = [[0,0], [50,0], [50,0], [50,50]].map(([x,y],i) => createDevice("junction",x,y,"J"+i,"j"+i));
  p.wires = [wire("h",pin("j0","J"),pin("j1","J")), wire("v",pin("j2","J"),pin("j3","J"))];
  const map = new Map(p.devices.map(d => [d.id,d]));
  const hits = p.wires.map(w => target(w.id, nearestTap(wireRoute(w,map),{x:50,y:0})));
  connectTargets(p,...hits,[]);
  assert.equal(p.devices.length,4);
  assert.equal(p.wires.length,3);
  assert.equal(measureVoltage(new Simulator(p),pin("j0","J"),pin("j3","J")).value,0);
});

test("Mẫu áp suất đo 4–20 mA ở mọi đoạn vòng 2 dây, điện áp sơ/thứ cấp cách ly", () => {
  const path = new URL("../examples/pressure-control.td2d.json", import.meta.url);
  const circuit = parseProject(readFileSync(path,"utf8"));
  const sim = new Simulator(circuit);
  const at = id => measureCurrent(sim, {wire:id}).value;
  for (const [bar,mA] of [[0,4],[5,12],[7.5,16],[10,20]]) {
    sim.apply("pt", "pressureBar", bar);
    for (const id of ["w5","w6","w7"]) assert.equal(at(id),mA/1000);
  }
  assert.equal(measureVoltage(sim,pin("isolated","X1"),pin("isolated","X2")).value,110);
  assert.equal(measureVoltage(sim,pin("primary","L"),pin("isolated","X2")).value,null);
  sim.apply("primary","on",false);
  assert.ok(!sim.state.pic.powered);
  assert.equal(at("w7"),0.02);
  sim.apply("supply","on",false);
  for (const id of ["w5","w6","w7"]) assert.equal(at(id),0);
});
