export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function categorise(match) {
  const today = todayISO();
  const date = match.match_date;
  if (date > today) return 'fixture';
  if (date < today) return 'result';
  // Today — check if it's finished
  if (match.result_description) return 'result';
  return 'live';
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(+h, +m);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function inningsScore(innings) {
  if (!innings) return null;
  const { runs, wickets, overs, declared } = innings;
  if (runs == null) return null;
  const wkts = wickets === 10 ? 'ao' : `/${wickets}`;
  const dec = declared ? 'd' : '';
  return `${runs}${wkts}${dec}${overs ? ` (${overs} ov)` : ''}`;
}

export function teamShortName(fullName) {
  return fullName?.replace(/Cricket Club|CC|C\.C\./gi, '').trim() || fullName;
}
