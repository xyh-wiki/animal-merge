/**
 * @Author:XYH
 * @Date:2025-11-23
 * @Description:
 *  Animal Merge Journey 游戏核心逻辑的自定义 Hook（增强版）：
 *   - 维护棋盘上的数值状态
 *   - 执行上下左右移动与合并
 *   - 生成新的随机方块（难度控制生成概率，Daily 模式使用固定种子）
 *   - 记录当前分数、历史最高分、步数与当前最高等级动物
 *   - 支持 Undo（悔棋）、Hint（给出推荐移动方向）
 *   - 标记新生成与刚合并的方块用于动画展示
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * 移动方向类型定义
 */
export type Direction = "up" | "down" | "left" | "right";

/**
 * 游戏难度枚举：
 *  - easy: 更容易出现低级方块
 *  - normal: 默认难度
 *  - hard: 更容易出现高级方块，整体更难
 */
export type Difficulty = "easy" | "normal" | "hard";

/**
 * 游戏模式：
 *  - classic: 经典无限模式
 *  - limited: 步数限制模式（例如 50 步挑战）
 *  - time: 限时模式（例如 60 秒冲刺）
 *  - daily: 每日挑战模式（使用固定随机种子）
 */
export type GameMode = "classic" | "limited" | "time" | "daily";

const BOARD_SIZE = 4;
const MAX_UNDO = 3;
const DRAGON_LEVEL = 2 ** 11; // Dragon 所在数值，仅内部使用，不对外展示为具体数字

/**
 * 从 localStorage 读取历史最高分
 */
const loadBestScore = (): number => {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem("animal-merge-journey-best-score");
  return raw ? Number(raw) || 0 : 0;
};

/**
 * 将历史最高分写入 localStorage
 */
const saveBestScore = (score: number) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("animal-merge-journey-best-score", String(score));
};

/**
 * 生成每日挑战模式的种子，基于当前日期字符串生成一个稳定整数
 */
const makeDailySeed = (): number => {
  const d = new Date();
  const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  const candidate = h >>> 0;
  return candidate === 0 ? 1 : candidate;
};

/**
 * 使用简单 LCG 的伪随机数发生器
 */
const nextRandom = (state: number): number => {
  // 32 bit LCG
  return (state * 1664525 + 1013904223) % 4294967296;
};

interface Snapshot {
  board: number[][];
  score: number;
  moves: number;
  highestValue: number;
}

/**
 * 自定义 Hook 返回的数据结构定义
 */
export interface UseAnimalMergeGameResult {
  board: number[][];
  score: number;
  bestScore: number;
  canMove: boolean;
  lastDirection: Direction | null;
  newTiles: Set<string>;
  mergedTiles: Set<string>;
  moves: number;
  highestValue: number;
  lastUnlockedValue: number | null;
  justUnlockedDragon: boolean;
  undoLeft: number;
  move: (dir: Direction) => void;
  reset: () => void;
  undo: () => void;
  getHintDirection: () => Direction | null;
}

/**
 * 将棋盘坐标 (r, c) 编码为字符串，方便存入 Set 做动画标记
 */
const posKey = (r: number, c: number): string => `${r},${c}`;

/**
 * 判断给定棋盘是否还存在可移动空间或可合并方块
 */
const hasAnyMove = (b: number[][]): boolean => {
  // 1. 任意空格子表示可以继续移动
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (b[r][c] === 0) return true;
    }
  }
  // 2. 检查水平与垂直方向是否存在相同值的相邻方块
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const v = b[r][c];
      if (r < BOARD_SIZE - 1 && b[r + 1][c] === v) return true;
      if (c < BOARD_SIZE - 1 && b[r][c + 1] === v) return true;
    }
  }
  return false;
};

/**
 * 将一行向左压缩并进行合并逻辑：
 *  - 移除 0
 *  - 合并相邻相同数值
 *  - 补齐 0 至固定长度
 */
const compressAndMergeRowLeft = (row: number[]) => {
  // 过滤掉为 0 的元素
  const filtered = row.filter((v) => v !== 0);
  const merged: number[] = [];
  const mergedFlags: boolean[] = [];
  let gained = 0;

  for (let i = 0; i < filtered.length; i++) {
    if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
      const nv = filtered[i] * 2;
      merged.push(nv);
      mergedFlags.push(true); // 该位置是一次合并的结果
      gained += nv;
      i++; // 跳过下一格
    } else {
      merged.push(filtered[i]);
      mergedFlags.push(false);
    }
  }

  // 补齐 0 至 BOARD_SIZE 长度
  while (merged.length < BOARD_SIZE) {
    merged.push(0);
    mergedFlags.push(false);
  }

  return { mergedRow: merged, mergedFlags, gained };
};

/**
 * 用于 Hint 功能的纯模拟函数：给定棋盘与方向，返回是否发生移动与本次可以获得的分数增量。
 * 注意：这里不会生成新的随机方块，仅用于评估潜在收益。
 */
const simulateMove = (board: number[][], dir: Direction): { moved: boolean; gained: number } => {
  let moved = false;
  let totalGain = 0;
  const newBoard = board.map((row) => [...row]);

  if (dir === "left" || dir === "right") {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const originalRow = [...newBoard[r]];
      const workingRow = dir === "left" ? originalRow : [...originalRow].reverse();

      const { mergedRow, gained } = compressAndMergeRowLeft(workingRow);
      totalGain += gained;
      const finalRow = dir === "left" ? mergedRow : [...mergedRow].reverse();

      for (let c = 0; c < BOARD_SIZE; c++) {
        if (finalRow[c] !== originalRow[c]) {
          moved = true;
        }
      }
      newBoard[r] = finalRow;
    }
  } else {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const col: number[] = [];
      for (let r = 0; r < BOARD_SIZE; r++) {
        col.push(newBoard[r][c]);
      }
      const workingCol = dir === "up" ? col : [...col].reverse();
      const { mergedRow, gained } = compressAndMergeRowLeft(workingCol);
      totalGain += gained;
      const finalCol = dir === "up" ? mergedRow : [...mergedRow].reverse();

      for (let r = 0; r < BOARD_SIZE; r++) {
        if (finalCol[r] !== newBoard[r][c]) {
          moved = true;
        }
      }

      for (let r = 0; r < BOARD_SIZE; r++) {
        newBoard[r][c] = finalCol[r];
      }
    }
  }

  return { moved, gained: totalGain };
};

/**
 * 根据难度返回本次新方块的数值：
 *  - easy: 几乎全是 2，偶尔 4
 *  - normal: 主要是 2，少量 4
 *  - hard: 2/4 较为平均，偶尔出现更高等级，局面更难
 */
const getSpawnValueByDifficulty = (difficulty: Difficulty, random: () => number): number => {
  const r = random();
  switch (difficulty) {
    case "easy":
      return r < 0.97 ? 2 : 4;
    case "hard":
      if (r < 0.7) return 2;
      if (r < 0.9) return 4;
      return 8;
    case "normal":
    default:
      return r < 0.9 ? 2 : 4;
  }
};

/**
 * 自定义 Hook：封装完整的 Animal Merge Journey 游戏逻辑
 */
export const useAnimalMergeGame = (
  difficulty: Difficulty = "normal",
  mode: GameMode = "classic"
): UseAnimalMergeGameResult => {
  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => loadBestScore());
  const [canMove, setCanMove] = useState<boolean>(true);
  const [lastDirection, setLastDirection] = useState<Direction | null>(null);

  const [newTiles, setNewTiles] = useState<Set<string>>(new Set());
  const [mergedTiles, setMergedTiles] = useState<Set<string>>(new Set());

  const [moves, setMoves] = useState<number>(0);
  const [highestValue, setHighestValue] = useState<number>(0);
  const [lastUnlockedValue, setLastUnlockedValue] = useState<number | null>(null);
  const [justUnlockedDragon, setJustUnlockedDragon] = useState<boolean>(false);

  const [undoLeft, setUndoLeft] = useState<number>(MAX_UNDO);
  const [history, setHistory] = useState<Snapshot[]>([]);

  // Daily 模式下使用的随机数状态
  const randomStateRef = useRef<number>(1);

  /**
   * 根据模式返回一个随机数（0 ~ 1）
   */
  const random = useCallback((): number => {
    if (mode !== "daily") {
      return Math.random();
    }
    // 使用简单 LCG 生成稳定随机数序列
    const current = randomStateRef.current;
    const next = nextRandom(current);
    randomStateRef.current = next;
    return next / 4294967296;
  }, [mode]);

  /**
   * 创建一个空棋盘（所有格子为 0）
   */
  const createEmptyBoard = useCallback((): number[][] => {
    const arr: number[][] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      const row: number[] = [];
      for (let c = 0; c < BOARD_SIZE; c++) {
        row.push(0);
      }
      arr.push(row);
    }
    return arr;
  }, []);

  /**
   * 在当前棋盘的任意空格中随机放置一个新的方块（值由难度控制）
   */
  const placeRandomTile = useCallback(
    (current: number[][]) => {
      const emptyPositions: Array<{ r: number; c: number }> = [];
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (current[r][c] === 0) {
            emptyPositions.push({ r, c });
          }
        }
      }
      if (emptyPositions.length === 0) {
        return { board: current, newTilePos: null as string | null };
      }

      const idx = Math.floor(random() * emptyPositions.length);
      const pos = emptyPositions[idx];
      const value = getSpawnValueByDifficulty(difficulty, random);
      const newBoard = current.map((row) => [...row]);
      newBoard[pos.r][pos.c] = value;

      return { board: newBoard, newTilePos: posKey(pos.r, pos.c) };
    },
    [difficulty, random]
  );

  /**
   * 计算棋盘上的最大值
   */
  const calcHighestValue = useCallback((b: number[][]): number => {
    let maxVal = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (b[r][c] > maxVal) {
          maxVal = b[r][c];
        }
      }
    }
    return maxVal;
  }, []);

  /**
   * 开始新游戏：重置棋盘、分数与动画标记
   */
  const reset = useCallback(() => {
    // Daily 模式下重置随机种子
    if (mode === "daily") {
      randomStateRef.current = makeDailySeed();
    } else {
      randomStateRef.current = Math.floor(Math.random() * 4294967296) || 1;
    }

    const empty = createEmptyBoard();
    const one = placeRandomTile(empty);
    const two = placeRandomTile(one.board);

    const nextBoard = two.board;
    setBoard(nextBoard);
    setScore(0);
    setCanMove(true);
    setLastDirection(null);

    const nextNew = new Set<string>();
    if (one.newTilePos) nextNew.add(one.newTilePos);
    if (two.newTilePos) nextNew.add(two.newTilePos);
    setNewTiles(nextNew);
    setMergedTiles(new Set());

    setMoves(0);
    const hv = calcHighestValue(nextBoard);
    setHighestValue(hv);
    setLastUnlockedValue(null);
    setJustUnlockedDragon(false);

    setUndoLeft(MAX_UNDO);
    setHistory([]);
  }, [calcHighestValue, createEmptyBoard, mode, placeRandomTile]);

  /**
   * 执行一次移动（上/下/左/右）
   */
  const move = useCallback(
    (dir: Direction) => {
      if (!canMove) return;

      // 记录当前快照，用于 Undo
      const snapshot: Snapshot = {
        board: board.map((row) => [...row]),
        score,
        moves,
        highestValue
      };

      let moved = false;
      let totalGain = 0;
      const newBoard = board.map((row) => [...row]);
      const newMergedTiles = new Set<string>();

      if (dir === "left" || dir === "right") {
        // 行处理：向左合并，向右则反转后再处理
        for (let r = 0; r < BOARD_SIZE; r++) {
          const originalRow = [...newBoard[r]];
          const workingRow =
            dir === "left" ? originalRow : [...originalRow].reverse();

          const { mergedRow, mergedFlags, gained } =
            compressAndMergeRowLeft(workingRow);
          totalGain += gained;
          const finalRow =
            dir === "left" ? mergedRow : [...mergedRow].reverse();

          // 对比是否与原行不同（判断是否发生了移动/合并）
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (finalRow[c] !== originalRow[c]) {
              moved = true;
            }
          }

          // 标记发生合并的位置，用于触发“merge” 动画
          if (dir === "left") {
            for (let c = 0; c < BOARD_SIZE; c++) {
              if (mergedFlags[c] && mergedRow[c] !== 0) {
                newMergedTiles.add(posKey(r, c));
              }
            }
          } else {
            for (let c = 0; c < BOARD_SIZE; c++) {
              const reversedIndex = BOARD_SIZE - 1 - c;
              if (mergedFlags[reversedIndex] && finalRow[c] !== 0) {
                newMergedTiles.add(posKey(r, c));
              }
            }
          }

          newBoard[r] = finalRow;
        }
      } else {
        // 列处理：向上/向下与行类似
        for (let c = 0; c < BOARD_SIZE; c++) {
          const col: number[] = [];
          for (let r = 0; r < BOARD_SIZE; r++) {
            col.push(newBoard[r][c]);
          }
          const workingCol = dir === "up" ? col : [...col].reverse();
          const { mergedRow, mergedFlags, gained } =
            compressAndMergeRowLeft(workingCol);
          totalGain += gained;
          const finalCol =
            dir === "up" ? mergedRow : [...mergedRow].reverse();

          for (let r = 0; r < BOARD_SIZE; r++) {
            if (finalCol[r] !== newBoard[r][c]) {
              moved = true;
            }
          }

          if (dir === "up") {
            for (let r = 0; r < BOARD_SIZE; r++) {
              if (mergedFlags[r] && finalCol[r] !== 0) {
                newMergedTiles.add(posKey(r, c));
              }
            }
          } else {
            for (let r = 0; r < BOARD_SIZE; r++) {
              const reversedIndex = BOARD_SIZE - 1 - r;
              if (mergedFlags[reversedIndex] && finalCol[r] !== 0) {
                newMergedTiles.add(posKey(r, c));
              }
            }
          }

          for (let r = 0; r < BOARD_SIZE; r++) {
            newBoard[r][c] = finalCol[r];
          }
        }
      }

      if (!moved) return;

      // 只有真正移动时才推入历史，用于以后 Undo
      setHistory((prev) => {
        const next = [snapshot, ...prev];
        return next.slice(0, MAX_UNDO);
      });

      const nextScore = score + totalGain;
      setScore(nextScore);
      if (nextScore > bestScore) {
        setBestScore(nextScore);
        saveBestScore(nextScore);
      }

      const withNew = placeRandomTile(newBoard);
      const updatedBoard = withNew.board;

      setBoard(updatedBoard);
      setLastDirection(dir);
      setMergedTiles(newMergedTiles);

      const nextNew = new Set<string>();
      if (withNew.newTilePos) nextNew.add(withNew.newTilePos);
      setNewTiles(nextNew);

      // 步数 +1
      const nextMoves = moves + 1;
      setMoves(nextMoves);

      // 更新最高等级动物及解锁状态
      const newHighest = calcHighestValue(updatedBoard);
      if (newHighest > highestValue) {
        setHighestValue(newHighest);
        setLastUnlockedValue(newHighest);
        setJustUnlockedDragon(newHighest >= DRAGON_LEVEL);
      } else {
        setLastUnlockedValue(null);
        setJustUnlockedDragon(false);
      }

      setCanMove(hasAnyMove(updatedBoard));
    },
    [
      bestScore,
      board,
      calcHighestValue,
      canMove,
      highestValue,
      moves,
      placeRandomTile,
      score
    ]
  );

  /**
   * Undo 功能：回退到上一状态，最多支持 MAX_UNDO 次
   */
  const undo = useCallback(() => {
    if (history.length === 0 || undoLeft <= 0) return;
    const [snapshot, ...rest] = history;
    setHistory(rest);
    setBoard(snapshot.board);
    setScore(snapshot.score);
    setMoves(snapshot.moves);
    setHighestValue(snapshot.highestValue);
    setUndoLeft((prev) => prev - 1);

    setCanMove(true);
    setNewTiles(new Set());
    setMergedTiles(new Set());
    setLastUnlockedValue(null);
    setJustUnlockedDragon(false);
    setLastDirection(null);
  }, [history, undoLeft]);

  /**
   * Hint 功能：尝试四个方向，返回潜在收益最高且有效的一步
   */
  const getHintDirection = useCallback((): Direction | null => {
    const dirs: Direction[] = ["up", "down", "left", "right"];
    let bestDir: Direction | null = null;
    let bestGain = -1;

    for (const d of dirs) {
      const { moved, gained } = simulateMove(board, d);
      if (!moved) continue;
      if (gained > bestGain) {
        bestGain = gained;
        bestDir = d;
      }
    }
    return bestDir;
  }, [board]);

  // 组件挂载或模式 / 难度变更时自动初始化一局游戏
  useEffect(() => {
    reset();
  }, [reset]);

  return useMemo(
    () => ({
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
    }),
    [
      board,
      bestScore,
      canMove,
      getHintDirection,
      highestValue,
      justUnlockedDragon,
      lastDirection,
      mergedTiles,
      move,
      moves,
      newTiles,
      reset,
      score,
      lastUnlockedValue,
      undo,
      undoLeft
    ]
  );
};
