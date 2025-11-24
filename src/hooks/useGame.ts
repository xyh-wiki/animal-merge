/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description: 核心棋盘逻辑 Hook
 */
import { useState } from "react";
import { GameModeKey, getMode } from "../data/modes";
import { animalMap } from "../data/animals";

export type Direction = "up" | "down" | "left" | "right";

export interface GameState {
  board: number[][];
  score: number;
  moves: number;
  highestValue: number;
  modeKey: GameModeKey;
}

function createEmptyBoard(size: number): number[][] {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

/**
 * 单行滑动与合并
 */
function slideRow(row: number[]): { row: number[]; gained: number } {
  const arr = row.filter((v) => v > 0);
  let gained = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      gained += arr[i];
      arr[i + 1] = 0;
    }
  }
  const compressed = arr.filter((v) => v > 0);
  while (compressed.length < row.length) compressed.push(0);
  return { row: compressed, gained };
}

/**
 * 顺时针旋转棋盘 90°
 */
function rotate(board: number[][]): number[][] {
  const size = board.length;
  const res: number[][] = Array.from({ length: size }, () =>
    Array(size).fill(0)
  );
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      res[j][size - 1 - i] = board[i][j];
    }
  }
  return res;
}

/**
 * 执行一次移动
 */
function moveOnce(
  board: number[][],
  dir: Direction
): { board: number[][]; gained: number; moved: boolean } {
  let b = board.map((r) => [...r]);
  let rotated = 0;
  if (dir === "up") rotated = 1;
  if (dir === "right") rotated = 2;
  if (dir === "down") rotated = 3;
  for (let i = 0; i < rotated; i++) b = rotate(b);
  let totalGained = 0;
  let moved = false;
  const size = b.length;
  for (let i = 0; i < size; i++) {
    const before = [...b[i]];
    const { row, gained } = slideRow(b[i]);
    b[i] = row;
    totalGained += gained;
    if (!moved && before.some((v, idx) => v !== row[idx])) {
      moved = true;
    }
  }
  for (let i = 0; i < (4 - rotated) % 4; i++) b = rotate(b);
  return { board: b, gained: totalGained, moved };
}

/**
 * 在随机空格生成一个新动物（2 或 4）
 */
function spawnRandom(board: number[][]): number[][] {
  const empties: [number, number][] = [];
  board.forEach((row, i) =>
    row.forEach((v, j) => {
      if (v === 0) empties.push([i, j]);
    })
  );
  if (empties.length === 0) return board;
  const [i, j] = empties[Math.floor(Math.random() * empties.length)];
  const val = Math.random() > 0.9 ? 4 : 2;
  board[i][j] = val;
  return board;
}

function getHighest(board: number[][]): number {
  let max = 0;
  board.forEach((r) =>
    r.forEach((v) => {
      if (v > max) max = v;
    })
  );
  return max;
}

/**
 * 对外导出的 Hook
 */
export function useGame(initialMode: GameModeKey = "classic") {
  const modeCfg = getMode(initialMode);
  const [state, setState] = useState<GameState>(() => {
    const board = createEmptyBoard(modeCfg.boardSize);
    spawnRandom(board);
    spawnRandom(board);
    return {
      board,
      score: 0,
      moves: 0,
      highestValue: getHighest(board),
      modeKey: initialMode,
    };
  });

  function move(dir: Direction) {
    const { board: movedBoard, gained, moved } = moveOnce(state.board, dir);
    if (!moved) return;
    const withSpawn = movedBoard.map((r) => [...r]);
    spawnRandom(withSpawn);
    const highestValue = getHighest(withSpawn);
    setState((s) => ({
      ...s,
      board: withSpawn,
      score: s.score + gained,
      moves: s.moves + 1,
      highestValue,
    }));
  }

  function resetGame() {
    const cfg = getMode(state.modeKey);
    const board = createEmptyBoard(cfg.boardSize);
    spawnRandom(board);
    spawnRandom(board);
    setState({
      board,
      score: 0,
      moves: 0,
      highestValue: getHighest(board),
      modeKey: state.modeKey,
    });
  }

  function setModeKey(modeKey: GameModeKey) {
    const cfg = getMode(modeKey);
    const board = createEmptyBoard(cfg.boardSize);
    spawnRandom(board);
    spawnRandom(board);
    setState({
      board,
      score: 0,
      moves: 0,
      highestValue: getHighest(board),
      modeKey,
    });
  }

  function getHighestAnimalName(): string {
    const info = animalMap[state.highestValue];
    return info ? info.name : "Mouse";
  }

  return {
    state,
    move,
    resetGame,
    setModeKey,
    getHighestAnimalName,
  };
}
