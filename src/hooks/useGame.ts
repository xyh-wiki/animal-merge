/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description:
 *  动物合成核心棋盘逻辑 Hook，负责：
 *   1）维护棋盘 / 分数 / 步数 / 当前模式等游戏状态
 *   2）实现 2048 风格的「滑动 + 合并 + 旋转」核心算法
 *   3）对外提供 move / resetGame / setModeKey / getHighestAnimalName 等接口
 *
 *  方向约定（非常重要，保证与键盘方向一致）：
 *   - slideRow() 的基础方向是「向左合并」
 *   - moveOnce() 中通过顺时针旋转棋盘，让「任意方向移动」都转化为「向左合并」
 *     · left  ：旋转 0 次 → 本身就是向左
 *     · up    ：旋转 1 次 → 原来的“上”变成“左”
 *     · right ：旋转 2 次 → 原来的“右”变成“左”
 *     · down  ：旋转 3 次 → 原来的“下”变成“左”
 *   - 合并完成后再旋转 (4 - rotated) % 4 次，把棋盘转回原始方向
 */
import { useState, useRef } from "react";
import { GameModeKey, getMode } from "../data/modes";
import { animalMap } from "../data/animals";

// 最终动物对应的数值（取 animalMap 中最大的 key 作为最终进化目标）
const FINAL_VALUE: number = Math.max(
  ...Object.keys(animalMap).map((v) => Number(v))
);

/**
 * 支持的移动方向类型
 */
export type Direction = "up" | "down" | "left" | "right";

/**
 * 棋盘类型：size × size 的二维数组
 */
type Board = number[][];

/**
 * 撤销使用的快照结构：记录一次移动前的完整局面
 */
interface GameSnapshot {
  board: Board;
  score: number;
  moves: number;
  highestValue: number;
  gameOver: boolean;
  gameWin: boolean;
}

/**
 * 游戏整体状态
 */
export interface GameState {
  /** 棋盘数值（每个格子对应一个动物等级：0 代表空） */
  board: Board;
  /** 当前得分 */
  score: number;
  /** 累计步数 */
  moves: number;
  /** 当前棋盘上出现过的最高数值（用于映射最高动物） */
  highestValue: number;
  /** 当前游戏模式 key（classic / fast / hard 等） */
  modeKey: GameModeKey;
  /** 是否已经无路可走（游戏失败） */
  gameOver: boolean;
  /** 是否已经到达最终动物（游戏胜利） */
  gameWin: boolean;
  /** 剩余撤销次数（每局最多 3 次） */
  remainingUndo: number;
  /** 剩余提示次数（每局最多 3 次） */
  remainingHint: number;
  /** 最近一次提示推荐的方向（用于 UI 高亮），可能为 null */
  lastHintDirection: Direction | null;
}

/**
 * 创建一个空棋盘（全部填 0）
 * @param size 棋盘边长
 */
function createEmptyBoard(size: number): Board {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

/**
 * 单行「向左」滑动与合并逻辑
 *
 * 核心规则：
 *  1）先去掉所有 0（视为“挤到最左边”）
 *  2）从左到右遍历，如果遇到相邻两个数相等，则合并为其 2 倍，并累加得分
 *  3）被合并掉的格子设置为 0，后续再统一压缩
 *  4）最后再补齐为原长度（右侧补 0）
 *
 * @param row 原始行（不会被直接修改）
 * @returns { row, gained } 处理后的新行与本次合并获得的得分
 */
function slideRow(row: number[]): { row: number[]; gained: number } {
  // 过滤掉 0，相当于把所有非零元素向左挤
  const arr = row.filter((v) => v > 0);
  let gained = 0;

  // 合并相邻相同元素（只合并一次：2 2 2 -> 4 2，而不是 8）
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] !== 0 && arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      gained += arr[i];
      arr[i + 1] = 0; // 被合并的格子清零，后面再压缩
    }
  }

  // 再次压缩，把中间产生的 0 去掉
  const compressed: number[] = arr.filter((v) => v > 0);
  // 右侧补 0，补足为原行长度
  while (compressed.length < row.length) {
    compressed.push(0);
  }

  return { row: compressed, gained };
}

/**
 * 顺时针旋转棋盘 90°
 *
 * 用途：
 *  - 把任意方向的移动，统一转换成「向左移动」来处理
 */
function rotate(board: Board): Board {
  const size = board.length;
  const res: Board = Array.from({ length: size }, () =>
    Array(size).fill(0)
  );

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // 顺时针旋转：原来的 (i, j) -> 新的 (j, size - 1 - i)
      res[j][size - 1 - i] = board[i][j];
    }
  }

  return res;
}

/**
 * 执行一次「某个方向」的移动（不包含生成新动物）
 *
 * 步骤：
 *  1）根据方向确定需要旋转几次，让「该方向移动」转化为「向左移动」
 *  2）对每一行调用 slideRow() 实现合并，累计得分，并记录是否真的发生了移动
 *  3）把棋盘旋转回原始方向
 *
 * @param board 当前棋盘
 * @param dir   移动方向（上 / 下 / 左 / 右）
 */
function moveOnce(
  board: Board,
  dir: Direction
): { board: Board; gained: number; moved: boolean } {
  // 复制一份棋盘，避免直接修改入参
  let b: Board = board.map((r) => [...r]);

  /**
   * rotated 表示「顺时针旋转次数」
   * 注意：这里的映射关系对“方向是否反了”非常关键
   */
  let rotated = 0;
  switch (dir) {
    case "left":
      rotated = 0; // 向左：不旋转
      break;
    case "up":
      rotated = 3; // 向上：逆时针 90° = 顺时针 3 次
      break;
    case "right":
      rotated = 2; // 向右：旋转 180°
      break;
    case "down":
      rotated = 1; // 向下：顺时针 90°
      break;
    default:
      rotated = 0;
  }

  // 先旋转到“向左”的坐标系
  for (let i = 0; i < rotated; i++) {
    b = rotate(b);
  }

  let totalGained = 0;
  let moved = false;
  const size = b.length;

  // 对每一行做「向左滑动 + 合并」
  for (let i = 0; i < size; i++) {
    const before = [...b[i]];
    const { row, gained } = slideRow(before);
    b[i] = row;
    totalGained += gained;

    // 只要有任意一行发生变化，就认为本次操作有效
    if (!moved && before.some((v, idx) => v !== row[idx])) {
      moved = true;
    }
  }

  // 再把棋盘旋回原始方向
  const rollback = (4 - rotated) % 4;
  for (let i = 0; i < rollback; i++) {
    b = rotate(b);
  }

  return { board: b, gained: totalGained, moved };
}

/**
 * 在随机空格生成一个新动物（数值 2 或 4）
 *
 * 说明：
 *  - 这里直接在传入的 board 上进行原地修改（性能更好）
 *  - 调用方如果需要 immutable，可以先 copy 再传入
 */
function spawnRandom(board: Board): Board {
  const empties: [number, number][] = [];

  board.forEach((row, i) =>
    row.forEach((v, j) => {
      if (v === 0) {
        empties.push([i, j]);
      }
    })
  );

  // 没有空格时，不生成新动物
  if (empties.length === 0) return board;

  const [i, j] = empties[Math.floor(Math.random() * empties.length)];
  // 90% 概率生成 2，10% 概率生成 4
  const val = Math.random() > 0.9 ? 4 : 2;
  board[i][j] = val;

  return board;
}

/**
 * 获取当前棋盘上的最大数值
 */
function getHighest(board: Board): number {
  let max = 0;
  board.forEach((r) =>
    r.forEach((v) => {
      if (v > max) {
        max = v;
      }
    })
  );
  return max;
}

/**
 * 判断当前棋盘是否已经无路可走（没有空格且不存在可合并的相邻格子）
 */
function isGameOver(board: Board): boolean {
  const size = board.length;

  // 1) 有空格就没结束
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (board[i][j] === 0) {
        return false;
      }
    }
  }

  // 2) 没空格，再看是否还有可以合并的一对
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const v = board[i][j];
      // 右侧相邻
      if (j + 1 < size && board[i][j + 1] === v) {
        return false;
      }
      // 下方相邻
      if (i + 1 < size && board[i + 1][j] === v) {
        return false;
      }
    }
  }

  // 没有空格、也没有可合并的相邻格子，说明游戏结束
  return true;
}

/**
 * 行级别向右移动调试函数（用于验证 2048 合并规则）
 * 例如输入 [0, 1, 1, 1]，输出 [0, 0, 1, 2]
 */
export function debugMoveRowRight(row: number[]): number[] {
  const original = [...row];
  // 向右挤 + 合并 等价于：反转 → 调用 slideRow 向左合并 → 再反转回来
  const reversed = [...original].reverse();
  const { row: leftMerged } = slideRow(reversed);
  const result = [...leftMerged].reverse();
  return result;
}

/**
 * 核心导出 Hook：管理整局游戏的状态与操作
 *
 * @param initialMode 初始模式 key，默认 classic
 */
export function useGame(initialMode: GameModeKey = "classic") {
  const modeCfg = getMode(initialMode);

  /** 撤销用历史栈，只保留最近 3 步 */
  const historyRef = useRef<GameSnapshot[]>([]);

  /**
   * 使用 lazy initializer 初始化游戏状态：
   *  - 创建空棋盘
   *  - 随机生成两个初始动物
   */
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
      gameOver: false,
      gameWin: false,
      remainingUndo: 3,
      remainingHint: 3,
      lastHintDirection: null,
    };
  });

  /**
   * 执行一次移动（会自动：
   *  1）调用 moveOnce 完成滑动与合并
   *  2）如果发生移动，则生成一个新的随机动物
   *  3）更新分数 / 步数 / 最高值
   *
   * 这里使用 setState 的函数式写法，避免连续快速操作导致的状态闭包问题。
   */
  function move(dir: Direction) {
    setState((prev) => {
      // 如果已经结束游戏（失败或胜利），则不再响应移动
      if (prev.gameOver || prev.gameWin) {
        return prev;
      }

      const { board: movedBoard, gained, moved } = moveOnce(prev.board, dir);

      // 如果没有任何格子发生变化，则不产生新动物，也不更新状态
      if (!moved) {
        return prev;
      }

      // 将“移动前”的局面压入撤销栈（最多保留 3 步）
      const history = historyRef.current.slice();
      history.push({
        board: prev.board.map((r) => [...r]),
        score: prev.score,
        moves: prev.moves,
        highestValue: prev.highestValue,
        gameOver: prev.gameOver,
        gameWin: prev.gameWin,
      });
      if (history.length > 3) {
        history.shift();
      }
      historyRef.current = history;

      // 复制一份棋盘，再在其上生成随机动物，避免对 moveOnce 的结果产生副作用
      const withSpawn: Board = movedBoard.map((r) => [...r]);
      spawnRandom(withSpawn);

      const highestValue = getHighest(withSpawn);
      const gameOver = isGameOver(withSpawn);
      // 如果之前已经是胜利状态，则保持；否则当本次达到或超过最终 value 时标记胜利
      const gameWin = prev.gameWin || highestValue >= FINAL_VALUE;

      return {
        ...prev,
        board: withSpawn,
        score: prev.score + gained,
        moves: prev.moves + 1,
        highestValue,
        gameOver,
        gameWin,
        // 发生实际移动后，重置提示方向（防止 UI 一直高亮旧提示）
        lastHintDirection: null,
      };
    });
  }

  /**
   * 重新开始当前模式的游戏
   */
  function resetGame() {
    const cfg = getMode(state.modeKey);
    const board = createEmptyBoard(cfg.boardSize);
    spawnRandom(board);
    spawnRandom(board);

    // 清空撤销历史
    historyRef.current = [];

    setState({
      board,
      score: 0,
      moves: 0,
      highestValue: getHighest(board),
      modeKey: state.modeKey,
      gameOver: false,
      gameWin: false,
      remainingUndo: 3,
      remainingHint: 3,
      lastHintDirection: null,
    });
  }

  /**
   * 切换模式（会重置棋盘）
   */
  function setModeKey(modeKey: GameModeKey) {
    const cfg = getMode(modeKey);
    const board = createEmptyBoard(cfg.boardSize);
    spawnRandom(board);
    spawnRandom(board);

    // 切换模式时也清空历史
    historyRef.current = [];

    setState({
      board,
      score: 0,
      moves: 0,
      highestValue: getHighest(board),
      modeKey,
      gameOver: false,
      gameWin: false,
      remainingUndo: 3,
      remainingHint: 3,
      lastHintDirection: null,
    });
  }

  /**
   * 获取当前最高动物的名称（用于展示文案）
   */
  function getHighestAnimalName(): string {
    const info = animalMap[state.highestValue];
    return info ? info.name : "Mouse";
  }

  /**
   * 撤销最近一步（最多撤销 3 步）
   */
  function undo() {
    setState((prev) => {
      const history = historyRef.current.slice();
      if (!history.length || prev.remainingUndo <= 0) {
        return prev;
      }
      const last = history.pop() as GameSnapshot;
      historyRef.current = history;

      return {
        ...prev,
        board: last.board.map((r) => [...r]),
        score: last.score,
        moves: last.moves,
        highestValue: last.highestValue,
        gameOver: last.gameOver,
        gameWin: last.gameWin,
        remainingUndo: prev.remainingUndo - 1,
        // 撤销后清空提示方向
        lastHintDirection: null,
      };
    });
  }

  /**
   * 计算当前局面下比较“推荐”的移动方向，并消耗一次提示次数
   * 简单策略：在四个方向中尝试 moveOnce，选择 gained 最大且有实际移动的方向
   */
  function hint() {
    setState((prev) => {
      if (prev.remainingHint <= 0 || prev.gameOver) {
        return prev;
      }

      let bestDir: Direction | null = null;
      let bestGain = -1;
      const dirs: Direction[] = ["up", "down", "left", "right"];

      for (const d of dirs) {
        const { gained, moved } = moveOnce(prev.board, d);
        if (moved && gained > bestGain) {
          bestGain = gained;
          bestDir = d;
        }
      }

      return {
        ...prev,
        remainingHint: prev.remainingHint - 1,
        lastHintDirection: bestDir,
      };
    });
  }

  // 对外暴露的操作与状态
  return {
    state,
    move,
    resetGame,
    setModeKey,
    getHighestAnimalName,
    undo,
    hint,
  };
}

// 方便在浏览器控制台直接调试
if (typeof window !== "undefined") {
  // @ts-ignore
  window.debugMoveRowRight = debugMoveRowRight;
}
