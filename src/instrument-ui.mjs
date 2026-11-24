import {t} from "./i18n.mjs";
import {html} from './ui-elements.mjs';
import {INSTRUMENTS} from './instruments.mjs';
import {checkSchedule, programCosts, weekDays} from './weekly.mjs';

export const instrumentStateLabels = {
  pressureBar:'Áp suất (bar)', currentMa:'Dòng vòng (mA)', temperatureC:'Nhiệt độ (°C)', resistanceOhm:'Điện trở Pt100 (Ω)',
  pv:'Giá trị đo PV', sensorFault:'Lỗi ngõ vào S.Err', alarmHigh:'Báo mức cao', alarmLow:'Báo mức thấp',
  waterLevel:'Mức trong bể ảo (%)', supplyTap:'Đầu nguồn đang dùng', ch1:'Ngõ ra kênh 1', ch2:'Ngõ ra kênh 2',
  clockText:'Đồng hồ tuần', bank:'Nhóm lịch đang dùng', override1:'Chế độ kênh 1', override2:'Chế độ kênh 2',
};

const labels = {pressureBar:'Áp suất ban đầu (bar)', temperatureC:'Nhiệt độ ban đầu (°C)', inputMode:'Loại đầu vào',
  scaleMin:'Giá trị tại 4 mA', scaleMax:'Giá trị tại 20 mA', action:'Chiều tác động OUT1', setpoint:'Giá trị đặt SP',
  hysteresis:'Độ trễ ON/OFF', alarmHigh:'Ngưỡng báo cao AUX1', alarmLow:'Ngưỡng báo thấp AUX2',
  clockDay:'Ngày bắt đầu mô phỏng', clockStart:'Giờ bắt đầu mô phỏng', levelInput:'Nguồn tín hiệu mức',
  waterLevel:'Mức ban đầu trong bể ảo (%)'};
const choices = {
  inputMode:[['4–20 mA','Dòng 4–20 mA'],['Pt100','Pt100 ba dây']],
  action:[['direct','Thuận · tác động khi PV cao'],['reverse','Nghịch · tác động khi PV thấp']],
  clockDay:weekDays.map(day => [day,day]),
  levelInput:[['virtual','Bể ảo theo phần trăm'],['electrodes','Đấu điện cực ngoài trên sơ đồ']],
};

export function instrumentParameter(device,key,value,setValue,newField) {
  if (!Object.hasOwn(INSTRUMENTS,device.type) || !Object.hasOwn(labels,key)) return null;
  const attrs = {'data-field':key};
  if (choices[key]) return newField(labels[key],value,setValue,{choices:choices[key],options:attrs});
  if (key === 'clockStart') return newField(labels[key],value,setValue,{type:'time',options:{...attrs,required:true,step:60}});
  const numbers = {pressureBar:[0,10],temperatureC:[-50,200],waterLevel:[0,100],hysteresis:[0]};
  const [min,max] = numbers[key] ?? [];
  return newField(labels[key],value,setValue,{type:'number',options:{...attrs,min,max,step:'any',required:true}});
}

const notes = {
  'pressure-sensys':'Vòng hai dây 9–30 VDC. Nối DC+ vào Loop +, Loop − tới 22 của E5EC, rồi nối 23 về DC−. Tín hiệu tăng từ 4 mA ở 0 bar tới 20 mA ở 10 bar.',
  'rtd-evikon':'Đầu dò Pt100 ba dây, Ø6 × 130 mm, IP68. Nối A vào 22, B và B′ vào 23 và 24 của E5EC. Chọn đầu vào Pt100 trên bộ điều khiển.',
  'controller-e5ec':'Nguồn AC100–240 tại 1–2. OUT1 đóng 3–4 theo SP và độ trễ. AUX1 đóng 11–12 khi PV đạt ngưỡng cao. AUX2 đóng 9–10 khi PV xuống ngưỡng thấp. S.Err mở cả ba ngõ ra.',
  'weekly-h5s':'Cấp AC100–240 vào 4–5. Hai tiếp điểm NO ở 2–3 và 8–9. Chân 6–7 chọn nhóm lịch B khi nối kín bằng tiếp điểm khô. Đồng hồ chạy theo thời gian mô phỏng.',
  'level-61f-g2':'S0–S1 dùng AC110, S0–S2 dùng AC220. E3 là điện cực chung. E1 tác động relay, E2 duy trì, E4 báo tràn. Bể ảo đặt E2 ở 25%, E1 ở 65%, E4 ở 90%. Tc1–Ta1 để xả, Tc1–Tb1 để cấp. Báo tràn ở Tc2–Ta2.',
  'level-61f-g3':'S0–S1 dùng AC110, S0–S2 dùng AC220. E5 là điện cực chung. Bể ảo đặt E4 ở 10% (báo cạn), E3 ở 25%, E2 ở 65%, E1 ở 90% (báo tràn). Tc–Ta để xả, Tc–Tb để cấp. Lc–LH/LL cho đèn báo, B1–B2 cho còi chung.',
  'transformer-ac':'Sơ cấp L–N, thứ cấp cách ly X1–X2. Chọn điện áp bằng tên miền, ví dụ AC220 và AC110. Tải thứ cấp cần dùng cả hai đầu của cùng một cuộn.',
};
const modes = [['timer','Khoảng ON/OFF'],['pulse','Xung'],['cycle','Chu kỳ']];
const dayText = days => days.map(i => t(weekDays[i])).join(', ');
const $select = (values,value,attrs) => html('select',attrs,...values.map(([v,l]) => html('option',{value:v,selected:String(v)===String(value)},t(l))));
const $field = (label,control) => html('label',{class:'field'},t(label),control);
const $button = (label,click,disabled) => {
  const node = html('button',{type:'button',disabled},label);
  node.addEventListener('click', click);
  return node;
};

function scheduleEditor(rows, index, setParam, status, close, draft) {
  const source = draft ?? rows[index] ?? {channel:1,bank:'A',days:[0,1,2,3,4],start:'08:00',end:'17:00',mode:'timer',pulseSeconds:30,onMinutes:5,offMinutes:5};
  const fieldset = html('div',{class:'fields','data-schedule-editor':true});
  const ctl = {};
  function add(key,label,node) {ctl[key] = node; fieldset.append($field(label,node));}
  add('channel',t('Kênh'),$select([[1,'CH1'],[2,'CH2']],source.channel,{}));
  add('bank',t('Nhóm lịch'),$select([['A','A'],['B','B']],source.bank ?? 'A',{}));
  add('mode',t('Kiểu chương trình'),$select(modes,source.mode,{}));
  const days = weekDays.map((d,i) => html('input',{type:'checkbox',checked:source.days.includes(i),'aria-label':d}));
  fieldset.append(html('div',{class:'field'},t('Ngày chạy'),
    html('div',{},...days.map((box,i) => html('label',{},box,t(weekDays[i])+' ')))));
  function typed(key,label,type,defaultValue,limits={}) {
    add(key,label,html('input',{type,value:source[key] ?? defaultValue,required:true,...limits}));
  }
  typed('start',t('Giờ bắt đầu'),'time','08:00');
  typed('end',t('Giờ kết thúc'),'time','17:00');
  typed('pulseSeconds',t('Độ rộng xung (giây)'),'number',30,{min:1,max:3600,step:1});
  typed('onMinutes',t('Thời gian ON (phút)'),'number',5,{min:1,max:719,step:1});
  typed('offMinutes',t('Thời gian OFF (phút)'),'number',5,{min:1,max:719,step:1});
  function refresh() {
    ctl.end.parentElement.hidden = ctl.mode.value === 'pulse';
    ctl.pulseSeconds.parentElement.hidden = ctl.mode.value !== 'pulse';
    ctl.onMinutes.parentElement.hidden = ctl.offMinutes.parentElement.hidden = ctl.mode.value !== 'cycle';
  }
  refresh();
  ctl.mode.addEventListener('change',refresh);
  fieldset.captureEditor = () => ({index, draft: {
    ...Object.fromEntries(Object.entries(ctl).map(([key,node]) => [key,node.value])),
    days: days.flatMap((box,i) => box.checked ? [i] : []),
  }});
  fieldset.append($button(t('Lưu chương trình'),() => {
    const row = {channel:Number(ctl.channel.value),bank:ctl.bank.value,mode:ctl.mode.value,start:ctl.start.value,
      days:days.flatMap((box,i) => box.checked ? [i] : [])};
    if (row.mode !== 'pulse') row.end = ctl.end.value;
    if (row.mode === 'pulse') row.pulseSeconds = Number(ctl.pulseSeconds.value);
    if (row.mode === 'cycle') {row.onMinutes = Number(ctl.onMinutes.value); row.offMinutes = Number(ctl.offMinutes.value);}
    const list = rows.slice();
    list[index] = row;
    const reason = checkSchedule(list);
    if (reason) {status(reason);return;}
    setParam('schedule',list);
  }),$button(t('Hủy chỉnh lịch'),close));
  return fieldset;
}

export function instrumentInspector(device,{editable,setParam,status}) {
  if (!Object.hasOwn(notes,device.type)) return null;
  const panel = html('section',{class:'inspector-section','data-instrument':device.type},
    html('h3',{},t('Đấu nối và vận hành')),html('p',{class:'source-note'},t(notes[device.type])));
  if (device.type !== 'weekly-h5s') return panel;
  const candidate = device.params.schedule;
  if (checkSchedule(candidate)) {
    panel.append(html('p',{},checkSchedule(candidate)), $button(t('Tạo lại lịch trống'),() => setParam('schedule',[]),!editable));
    return panel;
  }
  const list = html('div',{class:'fields'});
  let editor;
  const finish = () => {editor?.remove(); editor=null; list.hidden=false;};
  const edit = (i,draft) => {list.hidden=true;editor = scheduleEditor(candidate,i,setParam,status,finish,draft);panel.append(editor);};
  panel.captureEditor = () => editor?.captureEditor();
  panel.restoreEditor = ({index,draft}) => edit(index,draft);
  const format = row => row.mode === 'pulse' ? `${row.start} +${row.pulseSeconds} s` : `${row.start}–${row.end}`;
  for (const [i,row] of candidate.entries()) {
    list.append(html('div',{class:'field'},html('span',{},`CH${row.channel} · ${row.bank ?? 'A'} · ${format(row)} · ${dayText(row.days)}`),
      html('div',{},$button(t('Sửa'),()=>edit(i),!editable),$button(t('Xóa'),()=>setParam('schedule',candidate.filter((r,j)=>j!==i)),!editable))));
  }
  const count = channel => candidate.filter(row=>row.channel===channel).reduce((sum,row)=>sum+programCosts[row.mode],0);
  list.append($button(t('Thêm chương trình tuần'),()=>edit(candidate.length),!editable));
  panel.append(html('h3',{},t('Lịch tuần')),html('p',{class:'source-note'},t`CH1 dùng ${count(1)}/40 bước · CH2 dùng ${count(2)}/40 bước`),list);
  return panel;
}
