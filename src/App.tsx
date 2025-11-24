/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description: 应用根组件
 */
import React from "react";
import GameBoard from "./components/GameBoard";

const App: React.FC = () => {
  return (
    <div className="app-root">
      <GameBoard />
      <footer className="footer">
        Animal Merge Journey · A cute animal evolution swipe puzzle.
      </footer>
    </div>
  );
};

export default App;
