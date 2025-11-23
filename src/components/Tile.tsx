/**
 * @Author:XYH
 * @Date:2025-11-23
 * @Description:
 *  单个棋盘格子组件，根据数值渲染不同动物以及动画效果。
 */
import React from "react";

export interface TileProps {
  value: number;
  row: number;
  col: number;
  isNew: boolean;
  isMerged: boolean;
}

/**
 * 将不同数值映射到对应动物 emoji 与名称。
 */
const getAnimalInfo = (value: number): { emoji: string; name: string } | null => {
  const map: Record<number, { emoji: string; name: string }> = {
    2: { emoji: "🐭", name: "Mouse" },
    4: { emoji: "🐱", name: "Cat" },
    8: { emoji: "🐶", name: "Dog" },
    16: { emoji: "🐰", name: "Rabbit" },
    32: { emoji: "🦊", name: "Fox" },
    64: { emoji: "🐻", name: "Bear" },
    128: { emoji: "🐯", name: "Tiger" },
    256: { emoji: "🐼", name: "Panda" },
    512: { emoji: "🐨", name: "Koala" },
    1024: { emoji: "🦁", name: "Lion" },
    [2 ** 11]: { emoji: "🐲", name: "Dragon" }
  };
  return map[value] || null;
};

export const Tile: React.FC<TileProps> = ({
  value,
  row,
  col,
  isNew,
  isMerged
}) => {
  const animal = value > 0 ? getAnimalInfo(value) : null;
  const classes = ["cell"];
  if (value > 0) {
    // 数值较大的动物统一使用最高级配色，避免在代码中直接写出具体最大数值
    if (value >= 1024) {
      classes.push("tile-1024");
    } else {
      classes.push(`tile-${value}`);
    }
  }
  if (isNew) {
    classes.push("tile-new");
  }
  if (isMerged) {
    classes.push("tile-merged");
  }

  const key = `${row},${col},${value}`;

  return (
    <div className={classes.join(" ")} data-key={key}>
      {value > 0 && animal && (
        <>
          <div className="animal-emoji">{animal.emoji}</div>
          <div className="animal-name">{animal.name}</div>
        </>
      )}
      {value > 0 && !animal && (
        <div className="animal-name">{value}</div>
      )}
    </div>
  );
};
