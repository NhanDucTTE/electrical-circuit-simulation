import assert from 'node:assert/strict';
import test from 'node:test';
import {createDevice, createProject, LS_H100, THREE_PHASE_HEATER, TPR_3SL, validateProject} from '../src/model.mjs';
import {Simulator} from '../src/simulator.mjs';
import {measureVoltage} from '../src/probes.mjs';

function driveFixture(type, driveParams = {}) {
  const project = createProject();
  function device(id, type, params = {}) {
    const component = createDevice(type, 0, 0, id, id);
    Object.assign(component.params, params);
    project.devices.push(component);
  }
  function wire(from, to) {
    const endpoint = value => {
      const [device, pin] = value.split(':');
      return {device, pin};
    };
    project.wires.push({id: `w${project.wires.length + 1}`, from: endpoint(from), to: endpoint(to)});
  }
  function lamp(id, common, terminal) {
    device(id, 'lamp', {domain: 'AC220'});
    wire('aux:L', `drive:${common}`);
    wire(`drive:${terminal}`, `${id}:A1`);
    wire(`${id}:A2`, 'aux:N');
  }
  device('mains', 'source-3ph');
  device('aux', 'source-ac', {domain: 'AC220'});
  device('drive', type, driveParams);
  device('load', type === TPR_3SL ? THREE_PHASE_HEATER : 'motor');
  device('run', 'dry-contact');
  for (const [index, phase] of ['U', 'V', 'W'].entries()) {
    wire(`mains:L${index + 1}`, `drive:L${index + 1}`);
    wire(`drive:${phase}`, `load:${phase}`);
  }
  return {project, device, wire, lamp};
}

test('Biến tần LS H100 chỉ chạy theo P1, hiển thị Hz/rpm và đổi đúng các tiếp điểm phản hồi', () => {
  const {project, device, wire, lamp} = driveFixture(LS_H100, {motorPoles: 6});
  wire('run:13', 'drive:CM');
  wire('run:14', 'drive:P1');
  device('auto', 'dry-contact');
  wire('auto:13', 'drive:CM');
  wire('auto:14', 'drive:P5');
  lamp('fault', 'C1', 'A1');
  lamp('feedback', 'C2', 'A2');
  const sim = new Simulator(project);
  assert.deepEqual(validateProject(project), []);
  let state = sim.apply('auto', 'signal', true).devices;
  assert.equal(state.drive.autoInput, true);
  assert.equal(state.drive.command, false);
  assert.equal(state.drive.speedRpm, 0);
  assert.equal(state.load.running, false);
  state = sim.apply('run', 'signal', true).devices;
  assert.equal(state.drive.frequency, 50);
  assert.equal(state.drive.speedRpm, 1000);
  assert.equal(state.feedback.active, true);
  assert.equal(state.load.running, true);
  state = sim.apply('drive', 'frequencyHz', 35).devices;
  assert.equal(state.drive.speedRpm, 700);
  state = sim.apply('drive', 'frequencyHz', 0).devices;
  assert.equal(state.drive.command, true);
  assert.equal(state.drive.running, false);
  assert.equal(state.drive.speedRpm, 0);
  assert.equal(state.feedback.active, false);
  sim.apply('drive', 'frequencyHz', 35);
  state = sim.apply('drive', 'trip', true).devices;
  assert.equal(state.drive.frequency, 0);
  assert.equal(state.drive.speedRpm, 0);
  assert.equal(state.load.running, false);
  assert.equal(state.fault.active, true);
  assert.equal(state.feedback.active, false);
});

test('Biến tần chung dùng bốn cực mặc định và vẫn chạy khi cấu hình cực nhập sai', () => {
  const {project, wire} = driveFixture('vfd', {motorPoles: 3});
  wire('run:13', 'drive:CM');
  wire('run:14', 'drive:FWD');
  const sim = new Simulator(project);
  assert.ok(sim.snapshot().issues.some(issue => issue.code === 'invalid-motor-poles'));
  sim.apply('run', 'signal', true);
  const state = sim.apply('drive', 'frequencyHz', 35).devices;
  assert.equal(state.drive.frequency, 35);
  assert.equal(state.drive.speedRpm, 1050);
  assert.equal(state.load.running, true);
});

test('SCR cần nguồn điều khiển, nguồn động lực và lệnh 4–6 trước khi cấp tải sấy', () => {
  const {project, wire, lamp} = driveFixture(TPR_3SL);
  wire('aux:L', 'drive:3');
  wire('aux:N', 'drive:4');
  wire('run:13', 'drive:4');
  wire('run:14', 'drive:6');
  lamp('fault', '8', '9');
  const sim = new Simulator(project);
  assert.deepEqual(validateProject(project), []);
  let state = sim.apply('run', 'signal', true).devices;
  assert.equal(state.drive.controlPowered, true);
  assert.equal(state.drive.command, true);
  assert.equal(state.drive.outputPercent, 0);
  assert.equal(state.load.heating, false);
  state = sim.apply('drive', 'demandPercent', 45).devices;
  assert.equal(state.drive.outputPercent, 45);
  assert.equal(state.load.heating, true);
  assert.equal(measureVoltage(sim, {device: 'load', pin: 'U'}, {device: 'load', pin: 'V'}).value, null);
  assert.equal(measureVoltage(sim, {device: 'mains', pin: 'L1'}, {device: 'mains', pin: 'L2'}).value, 400);
  state = sim.apply('aux', 'on', false).devices;
  assert.equal(state.drive.controlPowered, false);
  assert.equal(state.drive.outputPercent, 0);
  assert.equal(state.load.heating, false);
  sim.apply('aux', 'on', true);
  state = sim.apply('run', 'signal', false).devices;
  assert.equal(state.drive.command, false);
  assert.equal(state.load.heating, false);
  sim.apply('run', 'signal', true);
  state = sim.apply('drive', 'trip', true).devices;
  assert.equal(state.fault.active, true);
  assert.equal(state.drive.outputPercent, 0);
  assert.equal(state.load.heating, false);
  state = sim.apply('mains', 'on', false).devices;
  assert.equal(state.drive.powered, false);
  assert.equal(state.drive.controlPowered, true);
  assert.equal(state.fault.active, true);
  assert.equal(sim.snapshot().halted, false);
});
