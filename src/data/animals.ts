/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description: 定义动物进化链及相关工具方法（用于棋盘和进化图示）
 */

export type AnimalLevel =
    | 2
    | 4
    | 8
    | 16
    | 32
    | 64
    | 128
    | 256
    | 512
    | 1024
    | 2048
    | 4096;

export interface AnimalInfo {
  value: AnimalLevel;
  emoji: string;
  name: string;
}

/** 动物进化链（棋盘 & 展示公用） */
export const animalChain: AnimalInfo[] = [
  { value: 2, emoji: "🐭", name: "Mouse" },
  { value: 4, emoji: "🐱", name: "Cat" },
  { value: 8, emoji: "🐶", name: "Dog" },
  { value: 16, emoji: "🐰", name: "Rabbit" },
  { value: 32, emoji: "🦊", name: "Fox" },
  { value: 64, emoji: "🐻", name: "Bear" },
  { value: 128, emoji: "🐯", name: "Tiger" },
  { value: 256, emoji: "🐼", name: "Panda" },
  { value: 512, emoji: "🐨", name: "Koala" },
  { value: 1024, emoji: "🦁", name: "Lion" },
  { value: 2048, emoji: "🐲", name: "Dragon" },
  { value: 4096, emoji: "🦄", name: "Unicorn" }
];

/** value → 动物信息 映射 */
export const animalMap: Record<number, AnimalInfo> = animalChain.reduce(
    (acc, a) => {
      acc[a.value] = a;
      return acc;
    },
    {} as Record<number, AnimalInfo>
);

/** 右侧“进化示意图”两行布局用 */
export const evolutionLines: AnimalInfo[][] = [
  animalChain.slice(0, 8),
  animalChain.slice(8)
];
