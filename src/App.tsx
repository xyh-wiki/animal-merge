/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description: 应用根组件
 */
import React from "react";
import GameBoard from "./components/GameBoard";

const App: React.FC = () => {
  return (
    <div className="app-root">
      <GameBoard />
      <footer className="footer">
        <div className="footer-main-text">
          Animal Merge Journey · A cute animal evolution swipe puzzle.
        </div>
        <div className="footer-guides">
          <div className="footer-guides-header">
            <h4>Game Guides </h4>
            <p className="footer-guides-sub">
              Learn rules, high-score tricks and daily challenge strategies.
            </p>
          </div>
          <div className="footer-guides-grid">
            <a
              className="footer-guide-link"
              href="/blog/how-to-play-animal-merge-evolution/index.html"
              target="_blank"
              rel="noreferrer"
            >
              <span className="footer-guide-title">Beginner’s Guide</span>
              <span className="footer-guide-desc">Basic rules & controls</span>
            </a>
            <a
              className="footer-guide-link"
              href="/blog/how-to-reach-dragon-fast/index.html"
              target="_blank"
              rel="noreferrer"
            >
              <span className="footer-guide-title">How to Reach Dragon Fast</span>
              <span className="footer-guide-desc">Corner strategy & merge planning</span>
            </a>
            <a
              className="footer-guide-link"
              href="/blog/daily-challenge-guide/index.html"
              target="_blank"
              rel="noreferrer"
            >
              <span className="footer-guide-title">Daily Challenge Guide</span>
              <span className="footer-guide-desc">Make the most of each daily board</span>
            </a>
            <a
              className="footer-guide-link"
              href="/blog/classic-mode-high-score-tips/index.html"
              target="_blank"
              rel="noreferrer"
            >
              <span className="footer-guide-title">Classic Mode Tips</span>
              <span className="footer-guide-desc">Long-run planning for big scores</span>
            </a>
            <a
              className="footer-guide-link"
              href="/blog/animal-evolution-chain-explained/index.html"
              target="_blank"
              rel="noreferrer"
            >
              <span className="footer-guide-title">Evolution Chain Explained</span>
              <span className="footer-guide-desc">From Mouse to Dragon and beyond</span>
            </a>
            <a
              className="footer-guide-link"
              href="/blog/leaderboards-and-scoring-explained/index.html"
              target="_blank"
              rel="noreferrer"
            >
              <span className="footer-guide-title">Scoring & Leaderboards</span>
              <span className="footer-guide-desc">How points and rankings work</span>
            </a>
            <a
              className="footer-guide-link"
              href="/blog/mobile-controls-and-tips/index.html"
              target="_blank"
              rel="noreferrer"
            >
              <span className="footer-guide-title">Mobile Controls & Tips</span>
              <span className="footer-guide-desc">Play better on phone & tablet</span>
            </a>
            <a
              className="footer-guide-link"
              href="/blog/how-to-use-undo-and-hints-effectively/index.html"
              target="_blank"
              rel="noreferrer"
            >
              <span className="footer-guide-title">Undo & Hint Guide</span>
              <span className="footer-guide-desc">Advanced use of limited tools</span>
            </a>
            <a
              className="footer-guide-link"
              href="/blog/benefits-of-casual-puzzle-games/index.html"
              target="_blank"
              rel="noreferrer"
            >
              <span className="footer-guide-title">Benefits of Puzzle Games</span>
              <span className="footer-guide-desc">Relaxation and focus benefits</span>
            </a>
            <a
              className="footer-guide-link"
              href="/blog/animal-merge-evolution-faq-and-troubleshooting/index.html"
              target="_blank"
              rel="noreferrer"
            >
              <span className="footer-guide-title">FAQ & Troubleshooting</span>
              <span className="footer-guide-desc">Common questions & fixes</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
