import assert from 'node:assert/strict';
import test from 'node:test';
import { circuitTemplates, createCircuitTemplate } from '../src/circuit-templates.mjs';
import { parseProject, serializeProject, validateProject } from '../src/model.mjs';
import { runScenario, Simulator } from '../src/simulator.mjs';

test('The circuit library opens independent, localized projects that pass their built-in scenarios', () => {
  for (const { id, title, description } of circuitTemplates) {
    for (const language of ['vi', 'en', 'ja']) {
      assert.ok(description[language]);
      assert.equal(createCircuitTemplate(id, language).name, title[language]);
    }
    const first = createCircuitTemplate(id);
    const originalTag = first.devices[0].tag;
    first.devices[0].tag = 'Changed';
    const project = parseProject(serializeProject(createCircuitTemplate(id)));
    assert.equal(project.devices[0].tag, originalTag);
    const issues = validateProject(project);
    assert.deepEqual(id.startsWith('demo01-') ? issues.filter(issue => issue.severity === 'error') : issues, [], id);
    for (const scenario of project.scenarios) {
      const result = runScenario(project, scenario);
      assert.equal(result.status, 'pass', `${id}: ${scenario.name}`);
    }
  }
  assert.throws(() => createCircuitTemplate('missing'), RangeError);
});

test('The direct starter latches, stops on overload and does not restart by resetting the overload', () => {
  const sim = new Simulator(createCircuitTemplate('motor-dol'));
  assert.equal(sim.snapshot().devices.load.running, false);
  assert.equal(sim.apply('start', 'pressed', true).devices.load.running, true);
  assert.equal(sim.apply('start', 'pressed', false).devices.load.running, true);
  const trip = sim.apply('overload', 'trip', true);
  assert.equal(trip.devices.line.powered, false);
  assert.equal(trip.devices.load.running, false);
  assert.equal(sim.apply('overload', 'trip', false).devices.load.running, false);
  assert.equal(sim.apply('start', 'pressed', true).devices.load.running, true);
  sim.apply('start', 'pressed', false);
  assert.equal(sim.apply('stop', 'pressed', true).devices.load.running, false);
  assert.equal(sim.apply('stop', 'pressed', false).devices.load.running, false);
});

test('The star–delta starter keeps an open transition and electrically interlocks both contactors', () => {
  const sim = new Simulator(createCircuitTemplate('motor-star-delta'));
  const start = sim.apply('start', 'pressed', true);
  sim.apply('start', 'pressed', false);
  const star = sim.advance(2999);
  const open = sim.advance(1);
  const beforeDelta = sim.advance(249);
  const delta = sim.advance(1);
  const trip = sim.apply('overload', 'trip', true);
  const reset = sim.apply('overload', 'trip', false);
  const expected = [
    [start, 'star', true, false],
    [star, 'star', true, false],
    [open, null, false, false],
    [beforeDelta, null, false, false],
    [delta, 'delta', false, true],
    [trip, null, false, false],
    [reset, null, false, false],
  ];
  for (const [snapshot, connection, starClosed, deltaClosed] of expected) {
    const { devices } = snapshot;
    assert.equal(devices.load.connection, connection);
    assert.equal(devices.load.running, Boolean(connection));
    assert.equal(devices['star-poles'].closed, starClosed);
    assert.equal(devices['delta-poles'].closed, deltaClosed);
    assert.equal(devices['star-interlock'].closed, !starClosed);
    assert.equal(devices['delta-interlock'].closed, !deltaClosed);
    assert.equal(snapshot.halted, false);
    assert.deepEqual(snapshot.issues, []);
  }
  assert.equal(open.devices.line.powered, true);
  assert.equal(sim.apply('start', 'pressed', true).devices.load.connection, 'star');
});

test('A stop during the star–delta transition cancels the pending delta switch', () => {
  const sim = new Simulator(createCircuitTemplate('motor-star-delta'));
  sim.apply('start', 'pressed', true);
  sim.apply('start', 'pressed', false);
  sim.advance(3100);
  sim.apply('stop', 'pressed', true);
  sim.apply('stop', 'pressed', false);
  const snapshot = sim.advance(1000);
  assert.equal(snapshot.devices['transfer-timer'].pendingUntil, null);
  assert.equal(snapshot.devices.delta.powered, false);
  assert.equal(snapshot.devices.load.running, false);
});

test('The six-terminal motor detects incomplete winding connections even when its line has three phases', () => {
  const project = createCircuitTemplate('motor-star-delta');
  const lostConnection = project.wires.findIndex(wire => wire.from.device === 'delta-poles'
    && wire.from.pin === 'T1');
  project.wires.splice(lostConnection, 1);
  const sim = new Simulator(project);
  sim.apply('start', 'pressed', true);
  assert.equal(sim.apply('start', 'pressed', false).devices.load.connection, 'star');
  const delta = sim.advance(3250).devices;
  assert.equal(delta['delta-poles'].closed, true);
  assert.equal(delta.load.command, true);
  assert.equal(delta.load.connection, null);
  assert.equal(delta.load.running, false);
});
