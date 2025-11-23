/**
 * @Author:XYH
 * @Date:2025-11-23
 * @Description:
 *  动物进化展示组件，用于在页面上展示本游戏从 Mouse 到 Dragon 的进化链。
 */
import React from "react";

const ANIMAL_CHAIN = [
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
  { value: 2 ** 11, emoji: "🐲", name: "Dragon" }
];

export const AnimalEvolutionBar: React.FC = () => {
  return (
    <div className="evolution-bar">
      {ANIMAL_CHAIN.map((item, index) => (
        <React.Fragment key={item.value}>
          <div className="evolution-item">
            <div className="evolution-emoji">{item.emoji}</div>
            <div className="evolution-name">{item.name}</div>
          </div>
          {index < ANIMAL_CHAIN.length - 1 && (
            <div className="evolution-arrow">→</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
