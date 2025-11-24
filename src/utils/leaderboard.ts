/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description: 本地排行榜工具（Classic 总排行 + Daily 每日排行）
 */
import { GameModeKey } from "../data/modes";

export interface GameRecord {
  mode: GameModeKey;
  score: number;
  moves: number;
  highestAnimal: string;
  timestamp: number;
  dateKey: string; // 形如 2025-11-24
}

export interface LeaderboardEntry {
  rank: number;
  score: number;
  moves: number;
  highestAnimal: string;
  dateKey: string;
}

const STORAGE_KEY = "amj_v6_records";

/**
 * 是否在浏览器环境中
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/**
 * 从 localStorage 读取所有记录
 */
export function loadRecords(): GameRecord[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GameRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/**
 * 写回 localStorage
 */
export function saveRecords(records: GameRecord[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // 忽略本地存储异常
  }
}

/**
 * 获取某天的 key（YYYY-MM-DD）
 */
export function getTodayKey(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/**
 * 构建 Classic 模式的总排行
 */
export function buildClassicAllTime(
  records: GameRecord[],
  limit = 10
): LeaderboardEntry[] {
  const filtered = records.filter((r) => r.mode === "classic");
  // 分数降序，如果分数一样，步数少的排前
  filtered.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.moves - b.moves;
  });
  return filtered.slice(0, limit).map((r, idx) => ({
    rank: idx + 1,
    score: r.score,
    moves: r.moves,
    highestAnimal: r.highestAnimal,
    dateKey: r.dateKey,
  }));
}

/**
 * 构建 Daily 模式当日排行
 */
export function buildDailyToday(
  records: GameRecord[],
  todayKey: string,
  limit = 10
): LeaderboardEntry[] {
  const filtered = records.filter(
    (r) => r.mode === "daily" && r.dateKey === todayKey
  );
  filtered.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.moves - b.moves;
  });
  return filtered.slice(0, limit).map((r, idx) => ({
    rank: idx + 1,
    score: r.score,
    moves: r.moves,
    highestAnimal: r.highestAnimal,
    dateKey: r.dateKey,
  }));
}

/**
 * 简单日期展示（目前直接返回 YYYY-MM-DD）
 */
export function formatDateKey(dateKey: string): string {
  return dateKey;
}
