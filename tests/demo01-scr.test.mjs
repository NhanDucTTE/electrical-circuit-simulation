import assert from 'node:assert/strict';
import test from 'node:test';
import {createCircuitTemplate} from '../src/circuit-templates.mjs';
import {Simulator} from '../src/simulator.mjs';

test('OU-101 SCR preserves the 1201 seal branch and loses local control power with the main bus', () => {
  const simulator = new Simulator(createCircuitTemplate('ou101-scr'));
  simulator.apply('ac4-scr', 'demandPercent', 60);
  simulator.apply('ac4-mode', 'mode', 'AUTO');
  assert.equal(simulator.apply('ac4-remote', 'signal', true).devices['ac4-heater'].heating, true);
  assert.equal(simulator.apply('ac4-remote', 'signal', false).devices['ac4-heater'].heating, true);
  assert.equal(simulator.apply('ac4-mode', 'mode', 'OFF').devices['ac4-heater'].heating, true);
  assert.equal(simulator.apply('ac4-off-pb', 'pressed', true).devices['ac4-heater'].heating, false);
  assert.equal(simulator.apply('ac4-off-pb', 'pressed', false).devices['ac4-heater'].heating, false);

  const outage = simulator.apply('main-bus', 'on', false);
  for (const branch of ['ac4', 'ac5']) {
    assert.equal(outage.devices[`${branch}-scr`].controlPowered, false);
    assert.equal(outage.devices[`${branch}-off-lamp`].powered, false);
  }
  assert.deepEqual(outage.issues, []);
});
