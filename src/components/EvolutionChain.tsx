/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description: 动物进化链可视化组件
 */
import React from "react";
import { animalChain } from "../data/animals";

/**
 * 为了更贴近示例截图，这里只展示到 Dragon，分两行布局
 */
const firstRow = animalChain.slice(0, 7);
const secondRow = animalChain.slice(7, 10); // Koala, Lion, Dragon

const EvolutionChain: React.FC = () => {
  return (
    <div className="panel">
      <h3>Evolution chain</h3>
      <p className="panel-subtext">Merge animals to evolve along this path.</p>
      <div className="evo-chain">
        <div className="evo-row">
          {firstRow.map((info, idx) => (
            <React.Fragment key={info.value}>
              <div className="evo-chip">
                <span className="evo-emoji">{info.emoji}</span>
                <span className="evo-name">{info.name}</span>
              </div>
              {idx < firstRow.length - 1 && (
                <span className="evo-arrow">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="evo-row">
          {secondRow.map((info, idx) => (
            <React.Fragment key={info.value}>
              <div className="evo-chip">
                <span className="evo-emoji">{info.emoji}</span>
                <span className="evo-name">{info.name}</span>
              </div>
              {idx < secondRow.length - 1 && (
                <span className="evo-arrow">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvolutionChain;
