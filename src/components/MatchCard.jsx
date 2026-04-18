import { useState, useEffect } from 'react';
import LiveBadge from './LiveBadge.jsx';
import ScoreCard from './ScoreCard.jsx';
import { fetchMatchDetail } from '../api.js';
import { formatDate, formatTime, inningsScore, categorise } from '../utils/matchHelpers.js';

function InningsSummary({ detail }) {
  const match = detail?.match_details?.[0];
  if (!match?.innings?.length) return null;
  return (
    <div className="innings-summary">
      {match.innings.map((inn, i) => (
        <div key={i} className="innings-line">
          <span className="inn-team">{inn.team_batting_name}</span>
          <span className="inn-score">{inningsScore(inn)}</span>
        </div>
      ))}
    </div>
  );
}

export default function MatchCard({ match, autoLoadDetail }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const category = categorise(match);
  const isLive = category === 'live';

  useEffect(() => {
    if (!autoLoadDetail && !isLive) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchMatchDetail(match.id);
        if (!cancelled) setDetail(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }

    load();
    if (isLive) {
      const interval = setInterval(load, 60000);
      return () => { cancelled = true; clearInterval(interval); };
    }
    return () => { cancelled = true; };
  }, [match.id, isLive, autoLoadDetail]);

  async function handleExpand() {
    setExpanded(v => !v);
    if (!detail && !loading) {
      setLoading(true);
      try {
        const data = await fetchMatchDetail(match.id);
        setDetail(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
  }

  const homeTeam = match.home_team_name;
  const awayTeam = match.away_team_name;
  const competition = [match.league_name, match.league_division_name].filter(Boolean).join(' – ');

  return (
    <div className={`match-card ${category}`}>
      <div className="match-card-header" onClick={handleExpand} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleExpand()}>
        <div className="match-meta">
          <span className="match-competition">{competition || match.competition_type}</span>
          {isLive && <LiveBadge />}
        </div>

        <div className="match-teams">
          <span className="team home">{homeTeam}</span>
          <span className="vs">v</span>
          <span className="team away">{awayTeam}</span>
        </div>

        {(isLive || category === 'result') && detail && (
          <InningsSummary detail={detail} />
        )}

        {category === 'result' && match.result_description && !detail && (
          <div className="result-desc">{match.result_description}</div>
        )}

        <div className="match-info">
          <span>{formatDate(match.match_date)}</span>
          {match.match_time && <span> · {formatTime(match.match_time)}</span>}
          {match.ground_name && <span> · {match.ground_name}</span>}
        </div>

        <button className="expand-btn" aria-expanded={expanded}>
          {expanded ? '▲ Hide scorecard' : '▼ Show scorecard'}
        </button>
      </div>

      {expanded && (
        <div className="match-card-body">
          {loading && <p className="loading-text">Loading scorecard…</p>}
          {error && <p className="error-text">{error}</p>}
          {detail && <ScoreCard detail={detail} />}
        </div>
      )}
    </div>
  );
}
