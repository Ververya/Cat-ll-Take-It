const KEY = 'bad-mood-recycling-v1';
const day = () => new Date().toLocaleDateString('en-CA');
let memory;
export function readStats() {
  try {
    const data = memory || JSON.parse(localStorage.getItem(KEY) || '{}');
    const count = Number.isSafeInteger(data.count) && data.count >= 0 ? data.count : 0;
    return { count, debt: count, today: data.date === day() && Number.isSafeInteger(data.today) && data.today >= 0 ? data.today : 0, date: day(), easterSeen: data.easterSeen === true };
  } catch { return memory || { count: 0, debt: 0, today: 0, date: day(), easterSeen: false }; }
}
export function recycle() {
  const stats = readStats();
  stats.count++; stats.debt++; stats.today++;
  const easter = stats.count >= 100 && !stats.easterSeen;
  if (easter) stats.easterSeen = true;
  memory = stats;
  let persisted = true;
  try { localStorage.setItem(KEY, JSON.stringify(stats)); } catch { persisted = false; }
  return { stats, easter, persisted };
}
