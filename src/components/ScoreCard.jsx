import { inningsScore } from '../utils/matchHelpers.js';

function BattingTable({ batters }) {
  const played = batters?.filter(b => b.how_out !== 'did not bat') ?? [];
  if (!played.length) return null;
  return (
    <table className="scorecard-table">
      <thead>
        <tr><th>Batter</th><th>How out</th><th>R</th><th>B</th><th>4s</th><th>6s</th></tr>
      </thead>
      <tbody>
        {played.map((b, i) => (
          <tr key={i}>
            <td className="name-cell">{b.batsman_name}</td>
            <td className="dimmed">{b.how_out || 'not out'}</td>
            <td className="num bold">{b.runs ?? '-'}</td>
            <td className="num dimmed">{b.balls ?? '-'}</td>
            <td className="num">{b.fours ?? '-'}</td>
            <td className="num">{b.sixes ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BowlingTable({ bowlers }) {
  const active = bowlers?.filter(b => b.overs) ?? [];
  if (!active.length) return null;
  return (
    <table className="scorecard-table">
      <thead>
        <tr><th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th></tr>
      </thead>
      <tbody>
        {active.map((b, i) => (
          <tr key={i}>
            <td className="name-cell">{b.bowler_name}</td>
            <td className="num">{b.overs}</td>
            <td className="num">{b.maidens ?? '-'}</td>
            <td className="num">{b.runs ?? '-'}</td>
            <td className="num bold">{b.wickets ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ScoreCard({ detail }) {
  const match = detail?.match_details?.[0];
  if (!match) return <p className="no-detail">Scorecard not available.</p>;

  const innings = match.innings ?? [];

  return (
    <div className="scorecard">
      {innings.length === 0 && <p className="no-detail">No scorecard data yet.</p>}
      {innings.map((inn, i) => (
        <div key={i} className="innings-block">
          <div className="innings-header">
            <span className="innings-team">{inn.team_batting_name}</span>
            <span className="innings-score">{inningsScore(inn)}</span>
          </div>
          {inn.bat?.length > 0 && (
            <details open={i === 0}>
              <summary>Batting</summary>
              <BattingTable batters={inn.bat} />
              <div className="extras-row">
                Extras: {inn.extras?.total ?? 0}
                {inn.extras && (
                  <span className="dimmed">
                    {' '}(b {inn.extras.b}, lb {inn.extras.lb}, w {inn.extras.w}, nb {inn.extras.nb})
                  </span>
                )}
              </div>
            </details>
          )}
          {inn.bowl?.length > 0 && (
            <details>
              <summary>Bowling</summary>
              <BowlingTable bowlers={inn.bowl} />
            </details>
          )}
        </div>
      ))}
    </div>
  );
}
