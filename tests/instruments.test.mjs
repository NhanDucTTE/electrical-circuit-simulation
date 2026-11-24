import test from 'node:test';
import assert from 'node:assert/strict';
import {createDevice, createProject, pinKey, serializeProject, parseProject, validateProject} from '../src/model.mjs';
import {Simulator} from '../src/simulator.mjs';
import {weeklyAt,checkSchedule} from '../src/weekly.mjs';

function circuit() {
  const p = createProject('Thiết bị đo và điều khiển');
  const add = (id,type,params={}) => {
    const d = createDevice(type,0,0,id,id);
    Object.assign(d.params,params);
    p.devices.push(d);
    return d;
  };
  const wire = (id,pin,id2,pin2) => p.wires.push({id:'w'+p.wires.length,from:{device:id,pin},to:{device:id2,pin:pin2}});
  const mains = id => {wire('ac','L',id,'L');wire('ac','N',id,'N');};
  add('ac','source-ac',{domain:'AC220'});
  return {p,add,wire,mains,sim:() => new Simulator(p)};
}

test('Biến áp cách ly có nguồn riêng ở thứ cấp, cắt sơ cấp làm ngắt tải',() => {
  const {add,wire,mains,sim} = circuit();
  add('tr','transformer-ac'); mains('tr');
  add('l','lamp',{domain:'AC110'});
  wire('tr','X1','l','A1');wire('tr','X2','l','A2');
  const run = sim();
  assert.equal(run.state.l.active,true);
  assert.equal(run.snapshot().pins[pinKey('l','A2')].source,'tr');
  assert.notEqual(run.network.networks.find(pinKey('ac','N')),run.network.networks.find(pinKey('tr','X2')));
  run.apply('ac','on',false);
  assert.equal(run.state.tr.powered,false);
  assert.equal(run.state.l.active,false);
});

test('Sensys và E5EC đo áp suất trong vòng hai dây, OUT1 và hai relay phụ riêng biệt',() => {
  const {add,wire,mains,sim,p} = circuit();
  add('dc','source-dc');add('pt','pressure-sensys');add('pic','controller-e5ec');mains('pic');
  wire('dc','+','pt','+');wire('pt','-','pic','A');wire('pic','B','dc','-');
  for (const [id,a,b] of [['normal','3','4'],['upper','11','12'],['lower','9','10']]) {
    add(id,'lamp',{domain:'AC220'});wire('ac','L','pic',a);wire('pic',b,id,'A1');wire('ac','N',id,'A2');
  }
  const run=sim();
  for (const [bar,mA,out,high,low] of [[0,4,false,false,true],[5,12,false,false,false],[5.5,12.8,true,false,false],
      [5.2,12.32,true,false,false],[5,12,false,false,false],[10,20,true,true,false]]) {
    run.apply('pt','pressureBar',bar);
    assert.equal(run.state.pt.currentMa,mA);assert.equal(run.state.pic.pv,bar);
    assert.deepEqual([run.state.normal.active,run.state.upper.active,run.state.lower.active],[out,high,low]);
  }
  assert.throws(()=>run.apply('pt','pressureBar',11),/không hợp lệ/);
  run.apply('dc','on',false);
  assert.equal(run.state.pic.sensorFault,true);assert.equal(run.state.pt.currentMa,null);
  assert.deepEqual([run.state.normal.active,run.state.upper.active,run.state.lower.active],[false,false,false]);
  assert.equal(new Simulator(parseProject(serializeProject(p))).state.pic.pv,0);
  p.wires=p.wires.filter(w=>!(w.from.device==='pic' && w.from.pin==='B'));assert.equal(sim().state.pic.sensorFault,true);
});

test('Pt100 ba dây, đổi hai B được phép, mất một dây báo S.Err',() => {
  const {add,wire,mains,sim,p}=circuit();
  add('te','rtd-evikon',{temperatureC:0});
  add('tic','controller-e5ec',{inputMode:'Pt100',setpoint:50,hysteresis:1,action:'reverse'});mains('tic');
  wire('te','A','tic','A');wire('te','B2','tic','B');wire('te','B','tic','B2');
  const run=sim();
  assert.equal(run.state.te.resistanceOhm,100);assert.equal(run.state.tic.pv,0);assert.equal(run.state.tic.active,true);
  run.apply('te','temperatureC',100);assert.equal(run.state.te.resistanceOhm,138.5055);assert.equal(run.state.tic.active,false);
  run.apply('te','temperatureC',-50);assert.ok(run.state.te.resistanceOhm<81);assert.equal(run.state.tic.pv,-50);
  p.wires.pop();assert.equal(sim().state.tic.sensorFault,true);
});

test('H5S chạy đúng thời điểm ảo, hai kênh, xung, chuyển nhóm và qua nửa đêm',() => {
  const {add,wire,mains,sim}=circuit();
  const schedule=[{channel:1,days:[0],mode:'timer',start:'23:58',end:'00:01'},
    {channel:2,days:[1],mode:'pulse',start:'00:00',pulseSeconds:3},
    {channel:2,bank:'B',days:[1],mode:'timer',start:'00:00',end:'00:02'}];
  add('ts','weekly-h5s',{clockStart:'23:57',schedule});mains('ts');add('sw','push-no');
  wire('ts','6','sw','13');wire('sw','14','ts','7');
  add('a','lamp',{domain:'AC220'});wire('ac','L','ts','2');wire('ts','3','a','A1');wire('a','A2','ac','N');
  const run=sim();
  assert.equal(run.state.a.active,false);
  assert.equal(run.step().time,60000);assert.equal(run.state.a.active,true);
  run.advance(120000);assert.equal(run.state.ts.ch2,true);assert.equal(run.snapshot().devices.ts.clockText,'T3 00:00');
  run.advance(3000);assert.equal(run.state.ts.ch2,false);
  run.apply('sw','pressed',true);assert.equal(run.state.ts.bank,'B');assert.equal(run.state.a.active,false);assert.equal(run.state.ts.ch2,true);
  run.apply('ac','on',false);run.advance(120000);run.apply('ac','on',true);assert.equal(run.state.ts.ch2,false);
  run.apply('ts','override1','ON');assert.equal(run.state.a.active,true);
});
test('H5S giới hạn 40 bước mỗi kênh và chu kỳ lặp 1 phút khi lập lịch',() => {
  const row={channel:1,days:[0],mode:'cycle',start:'08:00',end:'09:00',onMinutes:1,offMinutes:2};
  const p={clockDay:'T2',clockStart:'08:00',schedule:[row]};
  assert.equal(weeklyAt(p,59000,'A').ch1,true);assert.equal(weeklyAt(p,60000,'A').ch1,false);
  assert.equal(weeklyAt(p,180000,'A').ch1,true);assert.equal(weeklyAt(p,3600000,'A').ch1,false);
  assert.equal(checkSchedule(Array(10).fill(row)),'');
  assert.match(checkSchedule(Array(11).fill(row)),/40/);
  assert.equal(checkSchedule([...Array(10).fill(row), {...row,channel:2}]),'');
});
test('61F-G2 AC110/220 duy trì giữa hai điện cực và báo đầy bằng tiếp điểm',() => {
  const {add,wire,sim,p}=circuit();
  add('lc','level-61f-g2');wire('ac','N','lc','S0');wire('ac','L','lc','S2');
  const run=sim();
  for(const [level,active,high] of [[24,false,false],[30,false,false],[65,true,false],[95,true,true],[30,true,false],[24,false,false]]) {
    run.apply('lc','waterLevel',level);assert.equal(run.state.lc.active,active);assert.equal(run.state.lc.alarmHigh,high);
    assert.equal(run.network.networks.find(pinKey('lc','Tc1'))===run.network.networks.find(pinKey('lc','Ta1')),active);
  }
  p.devices[0].params.domain='AC110';assert.equal(sim().state.lc.powered,false);
  p.wires[1].to.pin='S1';assert.equal(sim().state.lc.powered,true);
});
test('61F-G3 theo điện cực E1–E5, ngõ ra điều khiển, giới hạn cao và thấp',()=>{
  const {add,wire,sim,p}=circuit();
  add('lc','level-61f-g3',{levelInput:'electrodes'});wire('ac','N','lc','S0');wire('ac','L','lc','S2');
  for (const pin of ['E1','E2','E3','E4']) {
    add(pin,'dry-contact');wire('lc',pin,pin,'13');wire(pin,'14','lc','E5');
  }
  const run=sim();
  const check=(a,b)=>run.network.networks.find(pinKey('lc',a))===run.network.networks.find(pinKey('lc',b));
  assert.equal(run.state.lc.alarmLow,true);assert.equal(check('Lc','LL'),true);
  run.apply('E4','signal',true);assert.equal(run.state.lc.alarmLow,false);assert.equal(check('B1','B2'),false);
  run.apply('E3','signal',true);assert.equal(run.state.lc.active,false);
  run.apply('E2','signal',true);assert.equal(run.state.lc.active,true);
  run.apply('E1','signal',true);assert.equal(check('B1','B2'),true);assert.equal(check('Lc','LH'),true);
  run.apply('E2','signal',false);assert.equal(run.state.lc.active,true);
  run.apply('E3','signal',false);assert.equal(run.state.lc.active,false);
  assert.throws(()=>run.apply('lc','waterLevel',80),/không hợp lệ/);
  assert.ok(!validateProject(p).some(i=>i.code==='instrument-config'));
});

