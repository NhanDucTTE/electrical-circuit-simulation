import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseProject } from '../src/model.mjs';
import { runScenario } from '../src/simulator.mjs';

const base = new URL('../', import.meta.url);
const desktopResultPath = process.argv[2];
const unitResultPath = process.argv[3];
if (!desktopResultPath || !unitResultPath) throw new Error('Cần đường dẫn JSON kiểm thử Windows và kết quả TAP.');
const desktop = JSON.parse(await readFile(desktopResultPath, 'utf8'));
const units = await readFile(unitResultPath, 'utf8');
const titles = { pass: 'Pass', fail: 'Fail', unverified: 'Chưa xác minh' };
const valueText = (value) => value === undefined ? 'Không có giá trị' :
  value === null ? 'Chưa có liên kết' : value === true ? 'Bật/đúng' : value === false ? 'Tắt/sai' : String(value);
const cell = (value) => String(value ?? '').replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
const row = (items) => `| ${items.map(cell).join(' | ')} |`;
const report = [
  '# Báo cáo kiểm thử Mô phỏng tủ điện 2D',
  '',
  'Bản 1.3.1 · 23/11/2026',
  '',
  'Các ca sau đối chiếu mô hình logic. [Xem bảng đối chiếu và phần hồ sơ còn thiếu](DOI-CHIEU-HO-SO.md).',
  '',
  '## Kiểm thử tự động bộ mô phỏng',
  '',
];

for (const name of ['tests', 'pass', 'fail', 'skipped']) {
  const labels = { tests: 'Số ca', pass: 'Đạt', fail: 'Không đạt', skipped: 'Bỏ qua' };
  const count = units.match(new RegExp(`^# ${name} (\\d+)`, 'm'))?.[1];
  if (count !== undefined) report.push(`- ${labels[name]} ${count}`);
}
for (const line of units.split(/\r?\n/).filter(line => /^(not )?ok \d+ - /.test(line))) {
  const passed = line.startsWith('ok');
  report.push(`- ${passed ? 'Pass' : 'Fail'} · ${line.replace(/^(not )?ok \d+ - /, '')}`);
}
report.push('', '## Giao diện bản Windows đóng gói', '');
report.push('[Kiểm tra nội dung PDF và thực thể trong DWG](XUAT-BAN-VE.md)', '');
report.push(`- Kết quả ${desktop.ok ? 'Pass' : 'Fail'}.`);
if (desktop.windows) report.push(`- Windows ${desktop.windows}, WebView2 ${desktop.webView2}.`);
for (const check of desktop.checks ?? []) report.push(`- Pass · ${check}.`);
if (desktop.error) report.push(`- Chi tiết lỗi ${desktop.error.split('\n')[0]}.`);
report.push('', 'Kiểm tra chạy trên tệp `.exe` của bản portable, với WebView2 ở chế độ offline. Sự kiện kéo thả, nối chân và bấm dùng DOM trong cửa sổ desktop. Kiểm thử thay phần chọn đường dẫn của hộp thoại bằng thư mục QA riêng và thực hiện ghi/mở tệp qua cùng mã lưu trữ của bản phát hành. Kết nối Wi-Fi của Windows giữ nguyên.');

const totals = { pass: 0, fail: 0, unverified: 0 };
let assertions = 0;
let matching = 0;
for (const slug of ['sump-pit', 'smoke-exhaust', 'pressure-control']) {
  const text = await readFile(new URL(`examples/${slug}.td2d.json`, base), 'utf8');
  const project = parseProject(text);
  const deviceTags = new Map(project.devices.map(device => [device.id, device.tag]));
  const tagged = (entry) => `${deviceTags.get(entry.device) ?? entry.device} · ${entry.key}`;
  const actionText = (entries) => entries.map(entry => `${tagged(entry)} = ${valueText(entry.value)}`).join('<br>') || 'Giữ nguyên đầu vào';

  report.push('', `## ${project.name}`, '');
  for (const scenario of project.scenarios) {
    const result = runScenario(project, scenario);
    totals[result.status]++;
    const initialDescription = scenario.initialDescription || scenario.initialSummary || scenario.initialLabel || scenario.initialNote || scenario.initialStateText;
    report.push(`### ${scenario.name} · ${titles[result.status]}`, '');
    report.push(`Tham chiếu ${cell(result.reference || scenario.reference || 'Chưa có trang')}.`, '');
    if (initialDescription) report.push(`Trạng thái đầu ${cell(initialDescription)}.`, '');
    report.push(`Đầu vào ban đầu ${actionText(result.initial ?? [])}.`, '');
    const initialOutputs = new Map();
    for (const step of scenario.steps ?? []) {
      for (const entry of step.expect ?? []) {
        const value = result.initialState?.devices[entry.device]?.[entry.key];
        if (value !== undefined) initialOutputs.set(tagged(entry), value);
      }
    }
    if (initialOutputs.size) report.push(`Trạng thái đầu tại các điểm kiểm tra ${[...initialOutputs].map(([name, value]) => `${name} = ${valueText(value)}`).join(' · ')}.`, '');
    if (result.error) report.push(`Lỗi chạy ca ${cell(result.error)}.`, '');
    report.push(row(['Bước và thời điểm', 'Tham chiếu', 'Thao tác', 'Kỳ vọng', 'Thực tế', 'Kết quả']),
      '| --- | --- | --- | --- | --- | --- |');
    for (const step of result.steps) {
      const checks = step.checks ?? [];
      assertions += checks.length;
      matching += checks.filter(check => check.pass).length;
      const expected = checks.map(entry => `${entry.label || tagged(entry)} = ${valueText(entry.value)}`).join('<br>');
      const actual = checks.map(entry => `${entry.label || tagged(entry)} = ${valueText(entry.actual)}`).join('<br>');
      report.push(row([`${step.label} · ${step.time} ms`, step.reference, actionText(step.actions ?? []),
        expected || 'Chưa quy định', step.error || actual || 'Chưa có giá trị đối chiếu', titles[step.status]]));
    }
    report.push('');
  }
}
report.splice(6, 0, `Ba mạch mẫu có **${totals.pass} Pass**, **${totals.fail} Fail** và **${totals.unverified} Chưa xác minh**. ${matching}/${assertions} kiểm tra trạng thái trong mô hình khớp giá trị kỳ vọng.`, '');
await writeFile(new URL('docs/BAO-CAO-KIEM-THU.md', base), `${report.join('\n')}\n`, 'utf8');
console.log(JSON.stringify({ totals, desktop: desktop.ok, report: fileURLToPath(new URL('docs/BAO-CAO-KIEM-THU.md', base)) }));
if (!desktop.ok || totals.fail || !/^# fail 0$/m.test(units)) process.exitCode = 1;
