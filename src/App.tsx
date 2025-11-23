/**
 * @Author:XYH
 * @Date:2025-11-23
 * @Description:
 *  应用根组件，布局包含游戏区域、动物进化条以及帮助 / FAQ 信息。
 *  默认展示英文文案，并提供简体中文切换。
 *  本版本增加：
 *   - 移动端手势滑动支持（触摸上下左右滑动）
 *   - 难度选择（Easy / Normal / Hard），通过生成方块概率控制游戏难度
 *   - 多种模式（Classic / 50 Moves / 60s Rush / Daily）
 *   - 显示最高等级动物、步数与简单表现评价
 *   - Undo（悔棋）与 Hint（推荐移动方向）
 *   - 顶部语言切换（EN / 中文）
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  useAnimalMergeGame,
  type Difficulty,
  type GameMode,
  type Direction
} from "./hooks/useAnimalMergeGame";
import { GameHeader } from "./components/GameHeader";
import { GameBoard } from "./components/GameBoard";
import { AnimalEvolutionBar } from "./components/AnimalEvolutionBar";
import { HelpPage } from "./pages/HelpPage";
import type { Lang } from "./i18n";

/**
 * 限制模式与限时模式参数
 */
const LIMITED_MOVES = 50;
const TIME_LIMIT_SECONDS = 60;

/**
 * 将数值映射为动物名称与 emoji，用于顶部展示最高等级动物
 */
const getAnimalLabel = (value: number, lang: Lang): string => {
  const mapEn: Record<number, string> = {
    2: "Mouse 🐭",
    4: "Cat 🐱",
    8: "Dog 🐶",
    16: "Rabbit 🐰",
    32: "Fox 🦊",
    64: "Bear 🐻",
    128: "Tiger 🐯",
    256: "Panda 🐼",
    512: "Koala 🐨",
    1024: "Lion 🦁"
  };
  const mapZh: Record<number, string> = {
    2: "老鼠 🐭",
    4: "小猫 🐱",
    8: "小狗 🐶",
    16: "兔子 🐰",
    32: "狐狸 🦊",
    64: "棕熊 🐻",
    128: "老虎 🐯",
    256: "熊猫 🐼",
    512: "考拉 🐨",
    1024: "狮子 🦁"
  };
  if (value === 0) return lang === "zh" ? "暂无" : "None";
  if (value >= 2 ** 11) return lang === "zh" ? "巨龙 🐲" : "Dragon 🐲";
  const map = lang === "zh" ? mapZh : mapEn;
  return map[value] || `${value}`;
};

/**
 * 根据难度返回描述文本
 */
const getDifficultyDescription = (difficulty: Difficulty, lang: Lang): string => {
  if (lang === "zh") {
    switch (difficulty) {
      case "easy":
        return "更高概率出现低级动物，适合轻松体验。";
      case "hard":
        return "更高概率出现高级动物，棋盘更容易被填满。";
      case "normal":
      default:
        return "生成概率均衡，接近经典体验。";
    }
  }
  switch (difficulty) {
    case "easy":
      return "More low-level animals. Relax and learn the game.";
    case "hard":
      return "More high-level animals spawn. The board fills up faster.";
    case "normal":
    default:
      return "Balanced spawn rates for a classic experience.";
  }
};

/**
 * 根据最高等级与步数给出简单表现评价
 */
const getRatingText = (highest: number, moves: number, lang: Lang): string => {
  if (lang === "zh") {
    if (highest >= 2 ** 11 && moves < 150) {
      return "传说级进化！你在很少的步数内就到达了巨龙。";
    }
    if (highest >= 256 && moves < 80) {
      return "高效的进化规划者——用很少的步数达成了不错的进化。";
    }
    if (highest >= 128 && moves < 150) {
      return "表现很棒，动物已经进化得很不错了。";
    }
    if (moves > 200 && highest < 128) {
      return "悠闲的探索者——玩得很放松，不妨下局多做一点规划。";
    }
    return "不错的尝试，继续尝试不同的滑动节奏和策略吧。";
  }

  if (highest >= 2 ** 11 && moves < 150) {
    return "Legendary evolution! You reached the dragon with impressive efficiency.";
  }
  if (highest >= 256 && moves < 80) {
    return "Efficient strategist – strong evolution in very few moves.";
  }
  if (highest >= 128 && moves < 150) {
    return "Great job – your animals evolved nicely.";
  }
  if (moves > 200 && highest < 128) {
    return "Relaxed explorer – take your time and try planning a bit more.";
  }
  return "Nice try – keep experimenting with different swipe patterns.";
};

export const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [mode, setMode] = useState<GameMode>("classic");
  const [lang, setLang] = useState<Lang>("en");

  const {
    board,
    score,
    bestScore,
    canMove,
    lastDirection,
    newTiles,
    mergedTiles,
    moves,
    highestValue,
    lastUnlockedValue,
    justUnlockedDragon,
    undoLeft,
    move,
    reset,
    undo,
    getHintDirection
  } = useAnimalMergeGame(difficulty, mode);

  const [hintDirection, setHintDirection] = useState<Direction | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(TIME_LIMIT_SECONDS);

  // 当模式变为 time 时重置计时器；其它模式使用满值但不启用
  useEffect(() => {
    if (mode === "time") {
      setTimeLeft(TIME_LIMIT_SECONDS);
    } else {
      setTimeLeft(TIME_LIMIT_SECONDS);
    }
  }, [mode]);

  // time 模式计时逻辑
  useEffect(() => {
    if (mode !== "time") return;
    if (!canMove) return;
    if (timeLeft <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [mode, canMove, timeLeft]);

  // 难度或模式变化时重开一局以应用新配置
  useEffect(() => {
    reset();
  }, [difficulty, reset, mode]);

  // 计算不同模式下是否已达到结束条件
  const limitedOver = mode === "limited" && moves >= LIMITED_MOVES;
  const timeOver = mode === "time" && timeLeft <= 0;
  const gameOver = !canMove || limitedOver || timeOver;

  const highestLabel = useMemo(
    () => getAnimalLabel(highestValue, lang),
    [highestValue, lang]
  );
  const difficultyDescription = useMemo(
    () => getDifficultyDescription(difficulty, lang),
    [difficulty, lang]
  );

  const ratingText = useMemo(
    () => getRatingText(highestValue, moves, lang),
    [highestValue, moves, lang]
  );

  // 键盘方向键控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          move("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          move("down");
          break;
        case "ArrowLeft":
          e.preventDefault();
          move("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          move("right");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, move]);

  // 触摸滑动控制（移动端）
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isTouching = false;
    const threshold = 30; // 触发滑动的最小位移像素

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      isTouching = true;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isTouching || gameOver) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (Math.max(absX, absY) < threshold) {
        isTouching = false;
        return;
      }

      if (absX > absY) {
        // 水平方向滑动
        move(dx > 0 ? "right" : "left");
      } else {
        // 垂直方向滑动
        move(dy > 0 ? "down" : "up");
      }
      isTouching = false;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gameOver, move]);

  // 当点击 Hint 按钮时计算推荐方向
  const handleHint = () => {
    const dir = getHintDirection();
    setHintDirection(dir);
  };

  // 新游戏时重置 hint 和计时逻辑
  const handleNewGame = () => {
    reset();
    setHintDirection(null);
    if (mode === "time") {
      setTimeLeft(TIME_LIMIT_SECONDS);
    }
  };

  // 根据模式返回 Game Over 详情类型
  const gameOverReason: string | null = !gameOver
    ? null
    : timeOver
    ? "time"
    : limitedOver
    ? "limited"
    : "board";

  // 显示当前模式标签
  const modeLabel: string = (() => {
    switch (mode) {
      case "limited":
        return lang === "zh" ? "步数挑战" : "50 Moves Challenge";
      case "time":
        return lang === "zh" ? "限时冲刺" : "60s Rush";
      case "daily":
        return lang === "zh" ? "每日挑战" : "Daily Challenge";
      case "classic":
      default:
        return lang === "zh" ? "经典模式" : "Classic";
    }
  })();

  // 顶部模式切换
  const handleModeChange = (nextMode: GameMode) => {
    setMode(nextMode);
    setHintDirection(null);
  };

  // 顶部显示的时间 / 步数附加信息
  const secondaryInfo = (() => {
    if (mode === "limited") {
      const remaining = Math.max(0, LIMITED_MOVES - moves);
      return lang === "zh"
        ? `剩余步数：${remaining}`
        : `Moves left: ${remaining}`;
    }
    if (mode === "time") {
      return lang === "zh"
        ? `剩余时间：${timeLeft} 秒`
        : `Time left: ${timeLeft}s`;
    }
    if (mode === "daily") {
      return lang === "zh"
        ? "今天所有玩家都是同一局面。"
        : "Same board for all players today.";
    }
    return "";
  })();

  const tipText =
    lang === "zh"
      ? "使用键盘方向键或手机滑动来移动方块，合并相同动物进行进化，你能到达巨龙吗？"
      : "Use your Arrow keys or swipe (on mobile) to move tiles. Merge the same animals to evolve. Can you reach the dragon?";

  const undoText =
    lang === "zh" ? "悔棋" : "Undo";
  const hintButtonText =
    lang === "zh" ? "提示" : "Hint";
  const suggestedMoveLabel =
    lang === "zh" ? "推荐移动：" : "Suggested move:";
  const footerText =
    lang === "zh"
      ? "Animal Merge Journey · 一款可爱的动物进化滑动消除游戏。"
      : "Animal Merge Journey · A cute animal evolution swipe puzzle.";

  const langLabelEn = "EN";
  const langLabelZh = "中文";

  return (
    <div className={`app-root lang-${lang}`}>
      <header className="top-header">
        <div className="top-header-inner">
          <div className="brand-block">
            <div className="brand-title">Animal Merge Journey</div>
            <div className="brand-subtitle">
              {lang === "zh"
                ? "轻量级网页小游戏 · 适合碎片时间放松。"
                : "A lightweight web mini game for quick breaks."}
            </div>
          </div>
          <div className="header-actions">
            <div className="lang-switch">
              <span className="lang-label">
                {lang === "zh" ? "语言" : "Language"}
              </span>
              <button
                type="button"
                className={
                  "lang-button" + (lang === "en" ? " lang-button-active" : "")
                }
                onClick={() => setLang("en")}
              >
                {langLabelEn}
              </button>
              <button
                type="button"
                className={
                  "lang-button" + (lang === "zh" ? " lang-button-active" : "")
                }
                onClick={() => setLang("zh")}
              >
                {langLabelZh}
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="app-main">
        <div className="game-panel">
          <GameHeader
            score={score}
            bestScore={bestScore}
            moves={moves}
            highestValue={highestValue}
            highestLabel={highestLabel}
            difficulty={difficulty}
            difficultyDescription={difficultyDescription}
            mode={mode}
            lang={lang}
            onNewGame={handleNewGame}
            onDifficultyChange={setDifficulty}
            onModeChange={handleModeChange}
          />
          <AnimalEvolutionBar />
          <p className="game-tip">{tipText}</p>

          <div className="game-toolbar">
            <div className="toolbar-left">
              <button
                className="btn btn-secondary"
                onClick={undo}
                disabled={undoLeft <= 0 || gameOver}
              >
                {undoText} ({undoLeft})
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleHint}
                disabled={gameOver}
              >
                {hintButtonText}
              </button>
            </div>
            <div className="toolbar-right">
              {secondaryInfo && (
                <span className="toolbar-info">{secondaryInfo}</span>
              )}
              {hintDirection && (
                <span className="toolbar-hint">
                  {suggestedMoveLabel}{" "}
                  {hintDirection === "up"
                    ? "↑"
                    : hintDirection === "down"
                    ? "↓"
                    : hintDirection === "left"
                    ? "←"
                    : "→"}
                </span>
              )}
            </div>
          </div>

          {lastUnlockedValue && (
            <div
              className={
                "unlock-banner" + (justUnlockedDragon ? " unlock-banner-dragon" : "")
              }
            >
              {justUnlockedDragon
                ? lang === "zh"
                  ? "传说级进化！你已经到达巨龙 🐲！"
                  : "Mythical evolution! You reached Dragon 🐲!"
                : lang === "zh"
                ? `新的动物进化解锁：${getAnimalLabel(lastUnlockedValue, lang)}`
                : `New evolution unlocked: ${getAnimalLabel(lastUnlockedValue, lang)}`}
            </div>
          )}

          <GameBoard
            board={board}
            newTiles={newTiles}
            mergedTiles={mergedTiles}
            gameOver={gameOver}
            gameOverReason={gameOverReason}
            ratingText={ratingText}
            modeLabel={modeLabel}
            moves={moves}
            highestLabel={highestLabel}
            onRestart={handleNewGame}
          />
        </div>
        <aside className="side-panel">
          <HelpPage lang={lang} />
        </aside>
      </main>
      <footer className="app-footer">
        <span>{footerText}</span>
      </footer>
    </div>
  );
};
