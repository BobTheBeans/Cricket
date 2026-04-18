import { useState, useEffect, useCallback } from 'react';
import MatchCard from './components/MatchCard.jsx';
import { fetchMatches } from './api.js';
import { categorise, todayISO } from './utils/matchHelpers.js';

const CURRENT_YEAR = new Date().getFullYear();
const SEASONS = Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - i);

function EmptyState({ tab }) {
  const messages = {
    live: 'No matches in progress today.',
    fixtures: 'No upcoming fixtures found.',
    results: 'No results found for this season.',
  };
  return <div className="empty-state">{messages[tab]}</div>;
}

function SetupBanner() {
  return (
    <div className="setup-banner">
      <h2>API Token Required</h2>
      <p>
        To display live scores, you need a PlayCricket API token.
      </p>
      <ol>
        <li>Contact <strong>support@play-cricket.com</strong> to request API access for Sparsholt CC</li>
        <li>Copy <code>.env.example</code> to <code>.env</code></li>
        <li>Add your token: <code>PLAYCRICKET_API_TOKEN=your_token_here</code></li>
        <li>Restart the server</li>
      </ol>
    </div>
  );
}

export default function App() {
  const [matches, setMatches] = useState([]);
  const [tab, setTab] = useState('live');
  const [season, setSeason] = useState(CURRENT_YEAR);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unconfigured, setUnconfigured] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMatches(season);
      setMatches(data.matches ?? []);
      setLastRefresh(new Date());
    } catch (e) {
      if (e.unconfigured) setUnconfigured(true);
      else setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [season]);

  useEffect(() => {
    loadMatches();
    // Refresh the match list every 5 minutes
    const interval = setInterval(loadMatches, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadMatches]);

  // Switch to fixtures if no live matches when tab loads
  useEffect(() => {
    if (!loading && tab === 'live' && liveMatches.length === 0 && fixtureMatches.length > 0) {
      setTab('fixtures');
    }
  });

  const liveMatches = matches.filter(m => categorise(m) === 'live');
  const fixtureMatches = matches.filter(m => categorise(m) === 'fixture');
  const resultMatches = matches.filter(m => categorise(m) === 'result').reverse();

  const tabs = [
    { id: 'live', label: 'Live', count: liveMatches.length },
    { id: 'fixtures', label: 'Fixtures', count: fixtureMatches.length },
    { id: 'results', label: 'Results', count: resultMatches.length },
  ];

  const visibleMatches = { live: liveMatches, fixtures: fixtureMatches, results: resultMatches }[tab];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="club-branding">
            <span className="club-icon">🏏</span>
            <div>
              <h1 className="club-name">Sparsholt CC</h1>
              <p className="club-subtitle">Live Scores &amp; Fixtures</p>
            </div>
          </div>
          <div className="header-controls">
            <select
              className="season-select"
              value={season}
              onChange={e => setSeason(+e.target.value)}
              aria-label="Select season"
            >
              {SEASONS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button className="refresh-btn" onClick={loadMatches} disabled={loading} aria-label="Refresh">
              {loading ? '⟳' : '↻'}
            </button>
          </div>
        </div>
      </header>

      <nav className="tab-bar">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count > 0 && <span className="tab-count">{t.count}</span>}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {unconfigured && <SetupBanner />}

        {!unconfigured && loading && matches.length === 0 && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading matches…</p>
          </div>
        )}

        {!unconfigured && error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
            <button onClick={loadMatches} className="retry-btn">Retry</button>
          </div>
        )}

        {!unconfigured && !loading && !error && visibleMatches.length === 0 && (
          <EmptyState tab={tab} />
        )}

        <div className="match-list">
          {visibleMatches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              autoLoadDetail={categorise(match) === 'live'}
            />
          ))}
        </div>

        {lastRefresh && !loading && (
          <p className="last-refresh">
            Updated {lastRefresh.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            {liveMatches.length > 0 && ' · Live scores refresh every 60s'}
          </p>
        )}
      </main>
    </div>
  );
}
