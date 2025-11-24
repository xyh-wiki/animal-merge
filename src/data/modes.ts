/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description: 模式配置
 */
export type GameModeKey =
  | "classic"
  | "endless"
  | "survival"
  | "frenzy"
  | "moves50"
  | "rush60"
  | "daily";

export interface ModeConfig {
  key: GameModeKey;
  label: string;
  boardSize: number;
}

export const MODES: ModeConfig[] = [
  { key: "classic", label: "Classic", boardSize: 4 },
  { key: "endless", label: "Endless", boardSize: 5 },
  { key: "survival", label: "Survival", boardSize: 4 },
  { key: "frenzy", label: "Frenzy", boardSize: 4 },
  { key: "moves50", label: "50 Moves", boardSize: 4 },
  { key: "rush60", label: "60s Rush", boardSize: 4 },
  { key: "daily", label: "Daily", boardSize: 4 }
];

export function getMode(key: GameModeKey): ModeConfig {
  return MODES.find((m) => m.key === key)!;
}
