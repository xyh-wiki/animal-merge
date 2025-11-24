/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description:
 *  游戏主界面：
 *   1）左侧：模式、统计、主题切换、棋盘
 *   2）右侧：玩法说明、进化图示、FAQ、排行榜
 *  本文件额外实现：
 *   - 排行榜中显示最高动物 emoji
 *   - 进化到高阶动物时闪光提示
 *   - 全局键盘控制（无需点击棋盘即可用方向键）
 *   - EN / 中文 文案切换
 */

import React, { useEffect, useRef, useState } from "react";
import Tile from "./Tile";
import { useGame, Direction } from "../hooks/useGame";
import { MODES, GameModeKey, getMode } from "../data/modes";
import { attachSwipeListener } from "../utils/touch";
import { evolutionLines, animalMap } from "../data/animals";

/** 排行榜记录结构 */
interface LeaderboardRecord {
  id: string;
  mode: GameModeKey;
  score: number;
  moves: number;
  highestName: string;
  highestEmoji: string;
  /** YYYY-MM-DD */
  date: string;
}

/** Classic 总榜存储 key */
const CLASSIC_KEY = "amj_classic_records";
/** Daily 当日榜 key 前缀 */
const DAILY_KEY_PREFIX = "amj_daily_records_";

type Lang = "en" | "zh";

/** 多语言文案 */
const TEXTS: Record<Lang, any> = {
  en: {
    language: "Language",
    title: "Animal Merge Journey",
    subtitle: "A light-weight animal evolution swipe puzzle with multiple modes and themes.",
    btnNewGame: "New Game",
    labelScore: "Score",
    labelMoves: "Moves",
    labelHighest: "Highest",
    labelTheme: "Theme",
    howToPlay: "How to play?",
    howBullets: [
      "Use arrow keys or swipe to move all animals.",
      "Same animals merge and evolve into a higher level.",
      "Try to reach Dragon, Phoenix and Unicorn."
    ],
    evoDesc: "Merge two of the same animal to evolve into the next one in the chain.",
    faqTitle: "FAQ",
    faq1Q: "Is this the same as the classic number puzzle game?",
    faq1A:
        "The core logic is similar, but we use cute animals instead of plain numbers, plus extra modes and themes.",
    faq2Q: "Can I play this on mobile?",
    faq2A:
        "Yes. Swipe on the board (up, down, left, right) to move the animals. The page will not scroll while you are swiping.",
    faq3Q: "Is this game free?",
    faq3A:
        "Absolutely. Animal Merge Journey is free to play. You might see some ads in the future to help support hosting.",
    lbTitle: "Leaderboards",
    lbClassic: "Classic – All time",
    lbClassicEmpty:
        "No classic records yet. Play a Classic game and click New Game to save your score.",
    lbDailyPrefix: "Daily challenge",
    lbDailyEmpty:
        "No record for today’s Daily challenge yet. Finish a run and click New Game to save it."
  },
  zh: {
    language: "语言",
    title: "Animal Merge Journey",
    subtitle: "轻量级动物进化消除小游戏，支持多种模式与主题皮肤。",
    btnNewGame: "新开一局",
    labelScore: "得分",
    labelMoves: "步数",
    labelHighest: "最高动物",
    labelTheme: "主题",
    howToPlay: "怎么玩？",
    howBullets: [
      "使用方向键或滑动操作，让所有动物一起移动。",
      "相同动物会合并并进化到更高一级。",
      "尽量进化到 Dragon、Phoenix 和 Unicorn。"
    ],
    evoDesc: "合并两个相同动物即可进化为下一阶段动物。",
    faqTitle: "常见问题",
    faq1Q: "这是不是那个数字消除类经典游戏？",
    faq1A:
        "核心规则相似，但这里全部换成了小动物，并增加了多种模式和主题皮肤。",
    faq2Q: "手机上能玩吗？",
    faq2A:
        "可以。直接在棋盘上向上 / 下 / 左 / 右滑动即可移动动物。滑动时页面不会跟着滚动。",
    faq3Q: "这个游戏收费吗？",
    faq3A:
        "完全免费。未来可能会加入少量广告，用来支持服务器和后续开发。",
    lbTitle: "排行榜",
    lbClassic: "经典模式 - 总排行",
    lbClassicEmpty: "当前还没有经典模式记录，玩一局后点击“新开一局”即可保存成绩。",
    lbDailyPrefix: "每日挑战",
    lbDailyEmpty:
        "今天的每日挑战还没有任何记录，完成一局后点击“新开一局”即可保存。"
  }
};

const GameBoard: React.FC = () => {
  /** 当前模式 */
  const [modeKey, setModeKey] = useState<GameModeKey>("classic");
  /** 当前主题皮肤 */
  const [theme, setTheme] = useState<"forest" | "desert" | "snow" | "galaxy">(
      "forest"
  );
  /** 当前语言（默认英文） */
  const [lang, setLang] = useState<Lang>("en");
  const t = TEXTS[lang];

  /** 游戏核心逻辑 */
  const game = useGame(modeKey);
  const boardRef = useRef<HTMLDivElement | null>(null);

  /** Classic 总榜 */
  const [classicRecords, setClassicRecords] = useState<LeaderboardRecord[]>(
      []
  );
  /** Daily 当日榜 */
  const [dailyRecords, setDailyRecords] = useState<LeaderboardRecord[]>([]);

  /** 今日日期字符串 */
  const todayStrRef = useRef<string>(new Date().toISOString().slice(0, 10));

  /** 最高动物闪光用：当前需要高亮的数值 */
  const [highlightValue, setHighlightValue] = useState<number | null>(null);
  const prevHighestRef = useRef<number>(game.state.highestValue);

  /** 主题皮肤写入 body data-theme */
  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  /** 监听最高值变化，进化到更高动物时触发闪光 */
  useEffect(() => {
    const prev = prevHighestRef.current;
    const curr = game.state.highestValue;
    prevHighestRef.current = curr;

    if (curr > prev && curr >= 256) {
      // 认为 256 以上算“高阶动物”，触发闪光
      setHighlightValue(curr);
      const timer = setTimeout(() => setHighlightValue(null), 450);
      return () => clearTimeout(timer);
    }
  }, [game.state.highestValue]);

  /** 全局键盘监听（不需要点击棋盘） */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right"
      };
      const dir = keyMap[e.key];
      if (!dir) return;
      e.preventDefault();
      game.move(dir);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [game]);

  /** 触摸滑动监听（阻止页面滚动） */
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const detach = attachSwipeListener(el, {
      onSwipe: (dir) => {
        if (!dir) return;
        game.move(dir as Direction);
      }
    });
    return detach;
  }, [boardRef.current, game]);

  /** 初始化读取排行榜数据 */
  useEffect(() => {
    try {
      const classicRaw = localStorage.getItem(CLASSIC_KEY);
      if (classicRaw) {
        setClassicRecords(JSON.parse(classicRaw));
      }
      const dailyKey = DAILY_KEY_PREFIX + todayStrRef.current;
      const dailyRaw = localStorage.getItem(dailyKey);
      if (dailyRaw) {
        setDailyRecords(JSON.parse(dailyRaw));
      }
    } catch {
      // 忽略本地异常
    }
  }, []);

  /** 保存当前局到排行榜（Classic 总榜 / Daily 当日榜） */
  function saveCurrentRunToLeaderboard() {
    if (game.state.score <= 0 && game.state.moves <= 0) return;

    const highestValue = game.state.highestValue;
    const info = animalMap[highestValue];
    const highestName = info?.name ?? "Mouse";
    const highestEmoji = info?.emoji ?? "";

    const record: LeaderboardRecord = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      mode: modeKey,
      score: game.state.score,
      moves: game.state.moves,
      highestName,
      highestEmoji,
      date: todayStrRef.current
    };

    if (modeKey === "classic") {
      setClassicRecords((prev) => {
        const merged = [...prev, record].sort((a, b) => b.score - a.score);
        const clipped = merged.slice(0, 10);
        try {
          localStorage.setItem(CLASSIC_KEY, JSON.stringify(clipped));
        } catch {}
        return clipped;
      });
    }

    if (modeKey === "daily") {
      const dailyKey = DAILY_KEY_PREFIX + todayStrRef.current;
      setDailyRecords((prev) => {
        const merged = [...prev, record].sort((a, b) => b.score - a.score);
        const clipped = merged.slice(0, 10);
        try {
          localStorage.setItem(dailyKey, JSON.stringify(clipped));
        } catch {}
        return clipped;
      });
    }
  }

  /** 点击 New Game：保存当前局成绩 + 重开 */
  function handleNewGameClick() {
    saveCurrentRunToLeaderboard();
    game.resetGame();
  }

  const modeCfg = getMode(modeKey);

  return (
      <div className="layout-root">
        {/* 左侧主区域 */}
        <div className="layout-main">
          {/* 标题 + 语言 + 新开一局 */}
          <header className="top-bar">
            <div>
              <h1 className="title">{t.title}</h1>
              <p className="subtitle">{t.subtitle}</p>
            </div>
            <div className="top-right">
              <div className="language-switch">
                <span>{t.language}</span>
                <button
                    className={`pill ${lang === "en" ? "pill-active" : ""}`}
                    onClick={() => setLang("en")}
                >
                  EN
                </button>
                <button
                    className={`pill ${lang === "zh" ? "pill-active" : ""}`}
                    onClick={() => setLang("zh")}
                >
                  中文
                </button>
              </div>
              <button className="btn-primary" onClick={handleNewGameClick}>
                {t.btnNewGame}
              </button>
            </div>
          </header>

          {/* 模式切换 */}
          <div className="mode-tabs">
            {MODES.map((m) => (
                <button
                    key={m.key}
                    className={`pill ${modeKey === m.key ? "pill-active" : ""}`}
                    onClick={() => {
                      setModeKey(m.key);
                      game.setModeKey(m.key);
                    }}
                >
                  {m.label}
                </button>
            ))}
          </div>

          {/* 统计信息 */}
          <div className="stats-bar">
            <div className="stat-box">
              <div className="stat-label">{t.labelScore}</div>
              <div className="stat-value">{game.state.score}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">{t.labelMoves}</div>
              <div className="stat-value">{game.state.moves}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">{t.labelHighest}</div>
              <div className="stat-value">{game.getHighestAnimalName()}</div>
            </div>
            <div className="mode-chip">{modeCfg.label}</div>
          </div>

          {/* 主题切换 */}
          <div className="theme-row">
            <span className="theme-label">{t.labelTheme}</span>
            <div className="theme-tabs">
              {["forest", "desert", "snow", "galaxy"].map((themeKey) => (
                  <button
                      key={themeKey}
                      className={`pill ${theme === themeKey ? "pill-active" : ""}`}
                      onClick={() => setTheme(themeKey as any)}
                  >
                    {themeKey[0].toUpperCase() + themeKey.slice(1)}
                  </button>
              ))}
            </div>
          </div>

          {/* 棋盘（键盘+滑动控制） */}
          <div className="board-wrapper" ref={boardRef}>
            <div
                className="board-grid"
                style={{
                  gridTemplateColumns: `repeat(${game.state.board.length}, 1fr)`
                }}
            >
              {game.state.board.map((row, i) =>
                  row.map((v, j) => (
                      <Tile
                          key={`${i}-${j}`}
                          value={v}
                          highlight={highlightValue !== null && v === highlightValue}
                      />
                  ))
              )}
            </div>
          </div>
        </div>

        {/* 右侧信息区 */}
        <aside className="layout-side">
          {/* 玩法说明 */}
          <div className="panel">
            <h3>{t.howToPlay}</h3>
            <ul className="bullet-list">
              {t.howBullets.map((txt: string, idx: number) => (
                  <li key={idx}>{txt}</li>
              ))}
            </ul>
          </div>

          {/* 动物进化图示 */}
          <div className="panel">
            <h3>Evolution chain</h3>
            <p className="panel-desc">{t.evoDesc}</p>
            <div className="evolution-chain">
              {evolutionLines.map((line, idx) => (
                  <div key={idx} className="evolution-line">
                    {line.map((animal, i) => (
                        <React.Fragment key={animal.value}>
                          <div className="evo-item">
                            <div className="evo-emoji">{animal.emoji}</div>
                            <div className="evo-name">{animal.name}</div>
                          </div>
                          {i < line.length - 1 && (
                              <div className="evo-arrow">→</div>
                          )}
                        </React.Fragment>
                    ))}
                  </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="panel">
            <h3>{t.faqTitle}</h3>
            <div className="panel-section">
              <div className="panel-section-title">{t.faq1Q}</div>
              <p className="panel-text">{t.faq1A}</p>
            </div>
            <div className="panel-section">
              <div className="panel-section-title">{t.faq2Q}</div>
              <p className="panel-text">{t.faq2A}</p>
            </div>
            <div className="panel-section">
              <div className="panel-section-title">{t.faq3Q}</div>
              <p className="panel-text">{t.faq3A}</p>
            </div>
          </div>

          {/* 排行榜 */}
          <div className="panel">
            <h3>{t.lbTitle}</h3>

            {/* Classic 总榜 */}
            <div className="panel-section">
              <div className="panel-section-title">{t.lbClassic}</div>
              {classicRecords.length === 0 ? (
                  <div className="panel-empty">{t.lbClassicEmpty}</div>
              ) : (
                  <ol className="lb-list">
                    {classicRecords.map((r, idx) => (
                        <li key={r.id} className="lb-row">
                          <span className="lb-rank">#{idx + 1}</span>
                          <span className="lb-main">
                      <span className="lb-emoji">{r.highestEmoji}</span>
                            {r.score} pts · {r.highestName}
                    </span>
                          <span className="lb-sub">{r.moves} moves</span>
                        </li>
                    ))}
                  </ol>
              )}
            </div>

            {/* Daily 当日榜 */}
            <div className="panel-section">
              <div className="panel-section-title">
                {t.lbDailyPrefix} ({todayStrRef.current})
              </div>
              {dailyRecords.length === 0 ? (
                  <div className="panel-empty">{t.lbDailyEmpty}</div>
              ) : (
                  <ol className="lb-list">
                    {dailyRecords.map((r, idx) => (
                        <li key={r.id} className="lb-row">
                          <span className="lb-rank">#{idx + 1}</span>
                          <span className="lb-main">
                      <span className="lb-emoji">{r.highestEmoji}</span>
                            {r.score} pts · {r.highestName}
                    </span>
                          <span className="lb-sub">{r.moves} moves</span>
                        </li>
                    ))}
                  </ol>
              )}
            </div>
          </div>
        </aside>
      </div>
  );
};

export default GameBoard;
