/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description: FAQ / 基本玩法说明面板
 */
import React from "react";

const FAQPanel: React.FC = () => {
  return (
    <div className="panel">
      <h3>FAQ</h3>

      <div className="panel-section">
        <div className="panel-section-title">
          Is this the same as the classic number puzzle?
        </div>
        <p className="panel-text">
          The core logic is similar to a classic merge puzzle, but we use a cute
          animal evolution theme instead of plain numbers.
        </p>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">How do I move animals?</div>
        <p className="panel-text">
          On desktop, use the arrow keys. On mobile, swipe in four directions
          (up, down, left, right).
        </p>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">What is the goal?</div>
        <p className="panel-text">
          Merge and evolve animals as high as you can. Try to reach Dragon,
          Phoenix, or even Unicorn in longer modes.
        </p>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">Is the game free?</div>
        <p className="panel-text">
          Yes. Animal Merge Journey is free to play. It is perfect for short
          breaks, commuting, or relaxing after work.
        </p>
      </div>
    </div>
  );
};

export default FAQPanel;
