/**
 * @Author:XYH
 * @Date:2025-11-23
 * @Description:
 *  游戏头部信息组件，展示标题、描述、分数、难度选择、模式切换、最高动物与步数。
 *  文案支持英文与简体中文，根据 lang 参数切换。
 */
import React from "react";
import type { Difficulty, GameMode } from "../hooks/useAnimalMergeGame";
import type { Lang } from "../i18n";

interface GameHeaderProps {
  score: number;
  bestScore: number;
  moves: number;
  highestValue: number;
  highestLabel: string;
  difficulty: Difficulty;
  difficultyDescription: string;
  mode: GameMode;
  lang: Lang;
  onNewGame: () => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onModeChange: (mode: GameMode) => void;
}

/**
 * 不同语言下的模式文案
 */
const getModeLabels = (lang: Lang): Record<GameMode, string> => {
  if (lang === "zh") {
    return {
      classic: "经典模式",
      limited: "步数挑战",
      time: "限时冲刺",
      daily: "每日挑战"
    };
  }
  return {
    classic: "Classic",
    limited: "50 Moves",
    time: "60s Rush",
    daily: "Daily"
  };
};

const getModeDescriptions = (lang: Lang): Record<GameMode, string> => {
  if (lang === "zh") {
    return {
      classic: "无回合限制，轻松体验合并进化。",
      limited: "只有 50 步，每一步都很关键。",
      time: "60 秒内冲击更高等级的动物。",
      daily: "今天的所有玩家都是同一局面。"
    };
  }
  return {
    classic: "No limits, just relax and merge.",
    limited: "You only have 50 moves. Make every swipe count.",
    time: "60 seconds to reach your best animal.",
    daily: "Same challenge for everyone today."
  };
};

export const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  bestScore,
  moves,
  highestValue,
  highestLabel,
  difficulty,
  difficultyDescription,
  mode,
  lang,
  onNewGame,
  onDifficultyChange,
  onModeChange
}) => {
  const modeLabels = getModeLabels(lang);
  const modeDescriptions = getModeDescriptions(lang);

  const titleText =
    lang === "zh" ? "动物进化合并之旅" : "Animal Merge Journey";
  const subtitleText =
    lang === "zh"
      ? "可爱的动物进化合并小游戏。滑动、合并，一路进化到神秘巨龙。"
      : "Cute animal evolution swipe puzzle. Merge, evolve, and reach the mythical dragon.";

  const highestLabelText = lang === "zh" ? "最高等级动物" : "Highest animal";
  const movesLabelText = lang === "zh" ? "步数" : "Moves";
  const difficultyLabelText = lang === "zh" ? "难度" : "Difficulty";
  const newGameText = lang === "zh" ? "重新开始" : "New Game";

  return (
    <header className="game-header">
      <div className="game-title-block">
        <h1 className="game-title">{titleText}</h1>
        <p className="game-subtitle">{subtitleText}</p>

        <div className="game-meta-row">
          <div className="high-animal-pill">
            <span className="meta-label">{highestLabelText}</span>
            <span className="meta-value">
              {highestLabel} {highestValue > 0 ? " " : ""}
            </span>
          </div>
          <div className="moves-pill">
            <span className="meta-label">{movesLabelText}</span>
            <span className="meta-value">{moves}</span>
          </div>
        </div>

        <div className="mode-tabs">
          {(Object.keys(modeLabels) as GameMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={
                "mode-tab" + (m === mode ? " mode-tab-active" : "")
              }
              onClick={() => onModeChange(m)}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>
        <div className="mode-description">
          {modeDescriptions[mode]}
        </div>
      </div>
      <div className="game-header-right">
        <div className="score-board">
          <div className="score-box">
            <span className="score-label">SCORE</span>
            <span className="score-value">{score}</span>
          </div>
          <div className="score-box">
            <span className="score-label">BEST</span>
            <span className="score-value">{bestScore}</span>
          </div>
        </div>

        <div className="difficulty-select">
          <label className="difficulty-label" htmlFor="difficulty-select">
            {difficultyLabelText}
          </label>
          <select
            id="difficulty-select"
            className="difficulty-control"
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
          >
            <option value="easy">{lang === "zh" ? "简单" : "Easy"}</option>
            <option value="normal">{lang === "zh" ? "普通" : "Normal"}</option>
            <option value="hard">{lang === "zh" ? "困难" : "Hard"}</option>
          </select>
          <div className="difficulty-desc">{difficultyDescription}</div>
        </div>

        <button className="btn btn-primary" onClick={onNewGame}>
          {newGameText}
        </button>
      </div>
    </header>
  );
};
