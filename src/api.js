export async function fetchMatches(season) {
  const params = season ? `?season=${season}` : '';
  const res = await fetch(`/api/matches${params}`);
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || 'Failed to fetch matches'), data);
  return data;
}

export async function fetchMatchDetail(matchId) {
  const res = await fetch(`/api/match/${matchId}`);
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || 'Failed to fetch match detail'), data);
  return data;
}
