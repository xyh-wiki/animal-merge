/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description: Classic 总排行 + Daily 当日排行 展示面板
 */
import React from "react";
import { LeaderboardEntry, formatDateKey } from "../utils/leaderboard";

interface Props {
  classic: LeaderboardEntry[];
  daily: LeaderboardEntry[];
  todayKey: string;
}

const LeaderboardsPanel: React.FC<Props> = ({ classic, daily, todayKey }) => {
  return (
    <div className="panel">
      <h3>Leaderboards</h3>

      <div className="panel-section">
        <div className="panel-section-title">Classic – All time</div>
        {classic.length === 0 ? (
          <div className="panel-empty">
            No classic records yet. Play Classic mode to set your score.
          </div>
        ) : (
          <div className="lb-list">
            {classic.map((r) => (
              <div className="lb-row" key={`c-${r.rank}-${r.score}-${r.moves}`}>
                <div className="lb-rank">#{r.rank}</div>
                <div className="lb-main">
                  <div className="lb-line">
                    <span className="lb-score">{r.score}</span>
                    <span className="lb-tag">{r.highestAnimal}</span>
                  </div>
                  <div className="lb-meta">
                    {r.moves} moves · {formatDateKey(r.dateKey)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel-section">
        <div className="panel-section-title">
          Daily challenge ({formatDateKey(todayKey)})
        </div>
        {daily.length === 0 ? (
          <div className="panel-empty">
            No record for today&apos;s daily challenge yet. Play one run!
          </div>
        ) : (
          <div className="lb-list">
            {daily.map((r) => (
              <div className="lb-row" key={`d-${r.rank}-${r.score}-${r.moves}`}>
                <div className="lb-rank">#{r.rank}</div>
                <div className="lb-main">
                  <div className="lb-line">
                    <span className="lb-score">{r.score}</span>
                    <span className="lb-tag">{r.highestAnimal}</span>
                  </div>
                  <div className="lb-meta">{r.moves} moves</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardsPanel;
