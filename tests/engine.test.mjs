import assert from 'node:assert/strict';
import test from 'node:test';
import { CATALOG, createDevice, createProject, parseProject, serializeProject, syncContactTags, validateProject } from '../src/model.mjs';
import { runScenario, Simulator } from '../src/simulator.mjs';

function diagram() {
  const project = createProject('Kiểm thử mô hình');
  return {
    project,
    add(id, type, params, tag = id) {
      const device = createDevice(type, project.devices.length * 20, 0, tag, id);
      Object.assign(device.params, params);
      project.devices.push(device);
      syncContactTags(project.devices, true);
      return device;
    },
    wire(a, b, label, points) {
      const from = a.split(':');
      const to = b.split(':');
      const wire = {
        id: `w${project.wires.length + 1}`,
        from: { device: from[0], pin: from[1] },
        to: { device: to[0], pin: to[1] },
        ...(label ? { label } : {}),
        ...(points ? { points } : {}),
      };
      project.wires.push(wire);
      return wire;
    },
  };
}

test('NO, NC theo đầu vào và ID thiết bị chủ khi tag trùng', () => {
  const { project, add, wire } = diagram();
  add('a', 'source-ac');
  add('no', 'push-no');
  add('nc', 'push-nc');
  add('r1', 'relay', {}, 'K');
  add('r2', 'relay', {}, 'K');
  add('r1no', 'contact-no', { masterId: 'r1' });
  add('r1nc', 'contact-nc', { masterId: 'r1' });
  add('r2no', 'contact-no', { masterId: 'r2' });
  add('unbound', 'contact-nc');
  wire('a:L', 'no:13');
  wire('no:14', 'r1:A1');
  wire('a:L', 'nc:21');
  wire('nc:22', 'r2:A1');
  wire('a:N', 'r1:A2');
  wire('a:N', 'r2:A2');
  const sim = new Simulator(project);
  let state = sim.snapshot();
  assert.deepEqual([state.devices.no.closed, state.devices.nc.closed], [false, true]);
  assert.deepEqual([state.devices.r1no.closed, state.devices.r1nc.closed, state.devices.r2no.closed], [false, true, true]);
  assert.equal(state.devices.unbound.closed, false);
  assert.ok(state.issues.some(issue => issue.code === 'missing-master'));
  assert.ok(state.issues.some(issue => issue.code === 'duplicate-tag'));
  state = sim.apply('no', 'pressed', true);
  assert.deepEqual([state.devices.r1no.closed, state.devices.r1nc.closed, state.devices.r2no.closed], [true, false, true]);
  state = sim.apply('nc', 'pressed', true);
  assert.equal(state.devices.r2no.closed, false);
});

test('Cuộn cần đủ đường cấp và đường về từ cùng nguồn, cùng miền', () => {
  const { project, add, wire } = diagram();
  add('a', 'source-ac');
  add('b', 'source-ac');
  add('c', 'source-dc');
  add('r', 'relay');
  wire('a:L', 'r:A1');
  let sim = new Simulator(project);
  assert.equal(sim.snapshot().devices.r.powered, false);
  assert.match(sim.diagnose('r').join(' '), /thiếu đường về/);
  const back = wire('b:N', 'r:A2');
  sim = new Simulator(project);
  assert.equal(sim.snapshot().devices.r.powered, false);
  assert.match(sim.diagnose('r').join(' '), /cùng một nguồn/);
  back.from = { device: 'c', pin: '-' };
  sim = new Simulator(project);
  assert.equal(sim.snapshot().devices.r.powered, false);
  assert.ok(sim.snapshot().issues.some(issue => issue.code === 'domain-mismatch'));
  back.from = { device: 'a', pin: 'N' };
  sim = new Simulator(project);
  assert.equal(sim.snapshot().devices.r.powered, true);
});

test('Tự giữ bằng NO song song và dừng qua NC', () => {
  const { project, add, wire } = diagram();
  add('a', 'source-dc');
  add('start', 'push-no');
  add('stop', 'push-nc');
  add('k', 'contactor', { domain: 'DC24' });
  add('hold', 'contact-no', { masterId: 'k' });
  wire('a:+', 'stop:21');
  wire('stop:22', 'start:13');
  wire('stop:22', 'hold:13');
  wire('hold:14', 'k:A1');
  wire('start:14', 'k:A1');
  wire('a:-', 'k:A2');
  const sim = new Simulator(project);
  assert.equal(sim.snapshot().devices.k.powered, false);
  assert.equal(sim.apply('start', 'pressed', true).devices.k.powered, true);
  assert.equal(sim.apply('start', 'pressed', false).devices.k.powered, true);
  assert.equal(sim.apply('stop', 'pressed', true).devices.k.powered, false);
  assert.match(sim.diagnose('k').join(' '), /stop đang mở/);
  assert.equal(sim.apply('stop', 'pressed', false).devices.k.powered, false);
});

test('Liên động NC chặn cuộn thứ hai', () => {
  const { project, add, wire } = diagram();
  add('a', 'source-ac');
  add('s1', 'push-no');
  add('s2', 'push-no');
  add('k1', 'contactor');
  add('k2', 'contactor');
  add('interlock', 'contact-nc', { masterId: 'k1' });
  wire('a:L', 's1:13');
  wire('a:L', 's2:13');
  wire('s1:14', 'k1:A1');
  wire('s2:14', 'interlock:21');
  wire('interlock:22', 'k2:A1');
  wire('a:N', 'k1:A2');
  wire('a:N', 'k2:A2');
  const sim = new Simulator(project);
  sim.apply('s1', 'pressed', true);
  let state = sim.apply('s2', 'pressed', true);
  assert.equal(state.devices.k1.powered, true);
  assert.equal(state.devices.k2.powered, false);
  assert.match(sim.diagnose('k2').join(' '), /interlock đang mở \(thiết bị chủ k1\)/);
  state = sim.apply('s1', 'pressed', false);
  assert.equal(state.devices.k1.powered, false);
  assert.equal(state.devices.k2.powered, true);
});

test('Timer ON/OFF delay theo đồng hồ ảo và hủy chuyển tiếp đang chờ', () => {
  const { project, add, wire } = diagram();
  add('a', 'source-ac');
  add('s', 'push-no');
  add('ton', 'timer-on', { delayMs: 250 });
  add('tof', 'timer-off', { delayMs: 500 });
  add('c', 'contact-no', { masterId: 'ton' });
  wire('a:L', 's:13');
  wire('s:14', 'ton:A1');
  wire('s:14', 'tof:A1');
  wire('a:N', 'ton:A2');
  wire('a:N', 'tof:A2');
  const sim = new Simulator(project);
  let state = sim.apply('s', 'pressed', true);
  assert.deepEqual([state.devices.ton.powered, state.devices.ton.active, state.devices.tof.active], [true, false, true]);
  state = sim.advance(249);
  assert.equal(state.devices.c.closed, false);
  state = sim.step();
  assert.equal(state.time, 250);
  assert.equal(state.devices.c.closed, true);
  state = sim.apply('s', 'pressed', false);
  assert.deepEqual([state.devices.ton.active, state.devices.tof.powered, state.devices.tof.active], [false, false, true]);
  sim.advance(499);
  sim.apply('s', 'pressed', true);
  state = sim.advance(1);
  assert.equal(state.devices.tof.active, true);
  sim.apply('s', 'pressed', false);
  state = sim.advance(500);
  assert.equal(state.devices.ton.active, false);
  assert.equal(state.devices.tof.active, false);
  assert.ok(state.log.some(entry => entry.time === 250 && entry.tag === 'ton'));
  assert.ok(state.log.some(entry => entry.time === 1250 && entry.tag === 'tof'));
});

test('Trip/reset, truy nguyên mất nguồn và phân biệt lệnh chạy, tải chạy, phản hồi', () => {
  const { project, add, wire } = diagram();
  add('ac', 'source-ac');
  add('p', 'source-3ph');
  add('cb', 'breaker-3ph');
  add('k', 'contactor');
  add('main', 'main-3ph', { masterId: 'k' });
  add('ol', 'overload');
  add('olnc', 'contact-nc', { masterId: 'ol', masterState: 'tripped' });
  add('fb', 'dry-contact');
  add('m', 'motor', { commandId: 'k', feedbackId: 'fb' });
  wire('ac:L', 'olnc:21');
  wire('olnc:22', 'k:A1');
  wire('ac:N', 'k:A2');
  for (const [index, pin] of ['U', 'V', 'W'].entries()) {
    const n = index + 1;
    wire(`p:L${n}`, `cb:L${n}`);
    wire(`cb:T${n}`, `main:L${n}`);
    wire(`main:T${n}`, `ol:L${n}`);
    wire(`ol:T${n}`, `m:${pin}`);
  }
  const sim = new Simulator(project);
  assert.deepEqual([sim.state.m.command, sim.state.m.running, sim.state.m.feedback], [true, true, false]);
  sim.apply('cb', 'trip', true);
  assert.deepEqual([sim.state.m.command, sim.state.m.running], [true, false]);
  assert.match(sim.diagnose('m').join(' '), /cb đang trip/);
  sim.apply('cb', 'on', true);
  assert.equal(sim.state.cb.closed, false);
  sim.apply('cb', 'trip', false);
  assert.equal(sim.state.cb.closed, false);
  sim.apply('cb', 'on', true);
  assert.equal(sim.state.m.running, true);
  sim.apply('fb', 'signal', true);
  sim.apply('ol', 'trip', true);
  assert.deepEqual([sim.state.m.command, sim.state.m.running, sim.state.m.feedback], [false, false, true]);
  sim.apply('ol', 'trip', false);
  assert.equal(sim.state.m.running, true);
  sim.apply('ac', 'on', false);
  assert.equal(sim.state.p.on, true);
  assert.deepEqual([sim.state.m.command, sim.state.m.running, sim.state.m.feedback], [false, false, true]);
  assert.match(sim.diagnose('m').join(' '), /main đang mở \(thiết bị chủ k\) vì k:.*ac mất nguồn/);
  project.wires = project.wires.filter(wire => !(wire.to.device === 'k' && wire.to.pin === 'A2'));
  const missingReturn = new Simulator(project);
  assert.match(missingReturn.diagnose('m').join(' '), /main đang mở \(thiết bị chủ k\) vì k: Chân A2 thiếu đường về/);
});

test('Dừng và chỉ ra phần tử gây dao động khi NC nối tiếp cuộn của chính nó', () => {
  const { project, add, wire } = diagram();
  add('a', 'source-ac');
  add('r', 'relay');
  add('nc', 'contact-nc', { masterId: 'r' });
  wire('a:L', 'nc:21');
  wire('nc:22', 'r:A1');
  wire('a:N', 'r:A2');
  const sim = new Simulator(project);
  const state = sim.snapshot();
  assert.equal(state.halted, true);
  const issue = state.issues.find(issue => issue.code === 'oscillation');
  assert.ok(issue.devices.includes('nc'));
  assert.ok(issue.devices.includes('r'));
  assert.equal(sim.advance(1000).time, 0);
});

test('Phát hiện đối nghịch nguồn qua terminal và giữ tách biệt dây giao nhau', () => {
  const { project, add, wire } = diagram();
  add('a', 'source-dc');
  add('l', 'terminal');
  add('r', 'terminal');
  const x = wire('a:+', 'l:1', 'mạng cấp', [{ x: 100, y: 100 }]);
  const y = wire('a:-', 'r:1', 'mạng về', [{ x: 100, y: 100 }]);
  let sim = new Simulator(project);
  assert.equal(sim.snapshot().wires[x.id].kind, 'live');
  assert.equal(sim.snapshot().wires[y.id].kind, 'return');
  add('j', 'junction');
  wire('l:2', 'j:J');
  wire('r:2', 'j:J');
  sim = new Simulator(project);
  assert.ok(sim.snapshot().issues.some(issue => issue.code === 'opposed-sources'));
  assert.equal(sim.snapshot().wires[x.id].kind, 'conflict');
});

test('CB hai cực cắt bộ nguồn DC và relay luân phiên đổi đầu ra theo cạnh tác động', () => {
  const { project, add, wire } = diagram();
  add('a', 'source-ac', { domain: 'AC220' });
  add('cb', 'mcb-2p');
  add('ps', 'power-supply-dc');
  add('fl', 'float');
  add('alt', 'relay-alternate', { domain: 'DC24' });
  add('no', 'contact-no', { masterId: 'alt' });
  add('nc', 'contact-nc', { masterId: 'alt' });
  wire('a:L', 'cb:L');
  wire('a:N', 'cb:N');
  wire('cb:LC', 'ps:L');
  wire('cb:NC', 'ps:N');
  wire('ps:+', 'fl:13');
  wire('fl:14', 'alt:A1');
  wire('ps:-', 'alt:A2');
  const sim = new Simulator(project);
  assert.equal(sim.state.ps.powered, true);
  assert.deepEqual([sim.state.no.closed, sim.state.nc.closed], [false, true]);
  assert.equal(sim.apply('fl', 'signal', true).devices.no.closed, true);
  assert.equal(sim.apply('fl', 'signal', false).devices.no.closed, true);
  sim.apply('cb', 'trip', true);
  assert.equal(sim.state.ps.powered, false);
  assert.equal(sim.state.alt.active, true);
  const fault = sim.apply('fl', 'signal', true);
  assert.equal(fault.devices.alt.powered, false);
  assert.match(sim.diagnose('alt').join(' '), /cb đang trip/);
  sim.apply('cb', 'trip', false);
  assert.equal(sim.apply('cb', 'on', true).devices.no.closed, false);
});

test('Omron G4Q-212S giữ vị trí khi mất điện và đảo tiếp điểm ở lần cấp kế tiếp', () => {
  const { project, add, wire } = diagram();
  const type = 'relay-alternate-g4q';
  const hardware = CATALOG[type].hardware;
  assert.equal(hardware.coil, '2–7');
  assert.equal(hardware.minPulseMs, 100);
  add('a', 'source-ac', { domain: 'AC220', initial: false });
  const alt = add('alt', type);
  assert.deepEqual(alt.params.pinLabels, { A1: '2', A2: '7' });
  alt.params.pinLabels.A1 = '13';
  alt.params.pinLabels.A2 = '14';
  assert.deepEqual(createDevice(type).params.pinLabels, { A1: '2', A2: '7' });
  add('no', 'contact-no', { masterId: 'alt' });
  add('nc', 'contact-nc', { masterId: 'alt' });
  wire('a:L', 'alt:A1');
  wire('a:N', 'alt:A2');

  const opened = parseProject(serializeProject(project));
  assert.deepEqual(opened, project);
  const sim = new Simulator(opened);
  const position = () => [sim.state.alt.powered, sim.state.no.closed, sim.state.nc.closed];
  assert.deepEqual(position(), [false, false, true]);
  sim.apply('a', 'on', true);
  assert.deepEqual(position(), [true, true, false]);
  sim.advance(500);
  assert.deepEqual(position(), [true, true, false]);
  sim.apply('a', 'on', false);
  assert.deepEqual(position(), [false, true, false]);
  sim.apply('a', 'on', true);
  assert.deepEqual(position(), [true, false, true]);
});

test('Lưu/mở giữ chân, liên kết, tuyến dây, ca kiểm thử và kết quả tái lập', () => {
  const { project, add, wire } = diagram();
  add('a', 'source-ac');
  add('k', 'contactor');
  add('t', 'contact-no', { masterId: 'k' }, 'Tiếp điểm');
  wire('a:L', 'k:A1', 'Dây cấp', [{ x: 10, y: 20 }, { x: 10, y: 40 }]);
  wire('a:N', 'k:A2');
  project.metadata = { status: 'unverified', title: 'Ví dụ' };
  const scenario = {
    id: 'sequence', name: 'Dừng sau cắt nguồn', reference: 'Trang A',
    initial: [{ device: 'a', key: 'on', value: false }],
    steps: [
      { label: 'Ban đầu', expect: [{ device: 'k', key: 'active', value: false }] },
      { label: 'Đóng', atMs: 200, actions: [{ device: 'a', key: 'on', value: true }],
        expect: [{ device: 't', key: 'closed', value: true }] },
      { label: 'Cắt', advanceMs: 100, actions: [{ device: 'a', key: 'on', value: false }],
        expect: [{ device: 'k', key: 'active', value: false }] },
    ],
  };
  project.scenarios.push(scenario);
  const opened = parseProject(serializeProject(project));
  assert.deepEqual(opened, project);
  const result = runScenario(opened, opened.scenarios[0]);
  assert.deepEqual(result, runScenario(opened, opened.scenarios[0]));
  assert.equal(result.status, 'pass');
  assert.deepEqual(result.steps.map(step => step.time), [0, 200, 300]);
  assert.equal(result.initialState.devices.k.active, false);
  assert.equal(runScenario(opened, { ...scenario, verification: 'unverified' }).status, 'unverified');
  assert.equal(runScenario(opened, {
    ...scenario, verification: 'unverified',
    steps: [{ expect: [{ device: 'k', key: 'active', value: true }] }],
  }).status, 'fail');
  assert.ok(validateProject(opened).some(issue => issue.code === 'unconnected-pin'));
  assert.throws(() => parseProject(JSON.stringify({ ...project, version: 2 })), /Phiên bản/);
});
