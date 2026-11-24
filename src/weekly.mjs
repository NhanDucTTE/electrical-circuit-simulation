import {t} from "./i18n.mjs";
const minute = 60000;
const dayLength = 1440 * minute;
const weekLength = 7 * dayLength;
export const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
export const programCosts = {timer: 2, pulse: 1, cycle: 4};

export function clockMinutes(clock) {
  if (typeof clock !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(clock)) return NaN;
  const [hours, minutes] = clock.split(':').map(Number);
  return hours * 60 + minutes;
}

export function weeklyClock(params, elapsed) {
  const start = clockMinutes(params.clockStart);
  const day = weekDays.indexOf(params.clockDay);
  if (!Number.isFinite(start) || day < 0) return '—';
  const wholeMinutes = day * 1440 + start + Math.floor(elapsed / minute);
  const n = wholeMinutes % 1440;
  const pad = v => String(v).padStart(2,'0');
  return weekDays[Math.floor(wholeMinutes / 1440) % 7] + ' ' + pad(Math.floor(n / 60)) + ':' + pad(n % 60);
}

export function checkSchedule(rows) {
  if (!Array.isArray(rows)) return t('Lịch tuần phải là danh sách chương trình.');
  const counts = [0, 0];
  for (const [index, row] of rows.entries()) {
    const error = label => t`Chương trình ${index + 1} · ${label}`;
    if (!row || ![1, 2].includes(row.channel) || !Object.hasOwn(programCosts, row.mode)
        || !['A', 'B'].includes(row.bank ?? 'A')) return error(t('chọn kênh, nhóm lịch và chế độ hợp lệ.'));
    if (!Array.isArray(row.days) || !row.days.length || row.days.some(day => !Number.isInteger(day) || day < 0 || day > 6)
        || new Set(row.days).size !== row.days.length) return error(t('chọn ít nhất một ngày trong tuần.'));
    if (!Number.isFinite(clockMinutes(row.start)) || (row.mode !== 'pulse' && !Number.isFinite(clockMinutes(row.end)))) {
      return error(t('giờ phải theo định dạng HH:MM.'));
    }
    if (row.mode === 'pulse' && (!Number.isInteger(row.pulseSeconds) || row.pulseSeconds < 1
        || row.pulseSeconds > 3600 || (row.pulseSeconds >= 60 && row.pulseSeconds % 60 !== 0))) {
      return error(t('xung phải từ 1 đến 59 giây hoặc từ 1 đến 60 phút nguyên.'));
    }
    if (row.mode === 'cycle' && [row.onMinutes, row.offMinutes].some(n => !Number.isInteger(n) || n < 1 || n > 719)) {
      return error(t('độ dài ON và OFF phải từ 1 đến 719 phút.'));
    }
    counts[row.channel - 1] += programCosts[row.mode];
    if (counts[row.channel - 1] > 40) return error(t`kênh ${row.channel} vượt quá 40 bước.`);
  }
  return '';
}

export function weeklyAt(params, elapsed, bank) {
  const rows = params.schedule;
  const start = clockMinutes(params.clockStart);
  const day = weekDays.indexOf(params.clockDay);
  if (checkSchedule(rows) || !Number.isFinite(start) || day < 0) return {ch1: false, ch2: false, due: null};
  const offset = start * minute + day * dayLength;
  const now = offset + elapsed;
  const weekStart = Math.floor(now / weekLength) * weekLength;
  const active = [false, false];
  let next = Infinity;
  for (const row of rows) {
    if ((row.bank ?? 'A') !== bank) continue;
    const begin = clockMinutes(row.start);
    const end = clockMinutes(row.end);
    const duration = row.mode === 'pulse' ? row.pulseSeconds * 1000 : ((end - begin + 1440) % 1440 || 1440) * minute;
    for (const weekday of row.days) {
      const weeklyStart = weekStart + weekday * dayLength + begin * minute;
      const since = ((now - weeklyStart) % weekLength + weekLength) % weekLength;
      next = Math.min(next, now + weekLength - since);
      if (since >= duration) continue;
      next = Math.min(next, now + duration - since);
      if (row.mode === 'cycle') {
        const onTime = row.onMinutes * minute;
        const period = onTime + row.offMinutes * minute;
        const phase = since % period;
        active[row.channel - 1] ||= phase < onTime;
        next = Math.min(next, now + (phase < onTime ? onTime : period) - phase);
      } else active[row.channel - 1] = true;
    }
  }
  return {ch1: active[0], ch2: active[1], due: Number.isFinite(next) ? next - offset : null};
}
