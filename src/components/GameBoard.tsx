/**
 * @Author:XYH
 * @Date:2025-11-23
 * @Description:
 *  游戏棋盘组件，负责渲染 4x4 的方块矩阵以及 Game Over 遮罩。
 */
import React from "react";
import { Tile } from "./Tile";

interface GameBoardProps {
  board: number[][];
  newTiles: Set<string>;
  mergedTiles: Set<string>;
  gameOver: boolean;
  gameOverReason: string | null;
  ratingText: string;
  modeLabel: string;
  moves: number;
  highestLabel: string;
  onRestart: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  newTiles,
  mergedTiles,
  gameOver,
  gameOverReason,
  ratingText,
  modeLabel,
  moves,
  highestLabel,
  onRestart
}) => {
  return (
    <div className="board-wrapper">
      <div className="board">
        {board.map((row, rIdx) =>
          row.map((value, cIdx) => {
            const key = `${rIdx},${cIdx}`;
            const isNew = newTiles.has(key);
            const isMerged = mergedTiles.has(key);
            return (
              <Tile
                key={key}
                value={value}
                row={rIdx}
                col={cIdx}
                isNew={isNew}
                isMerged={isMerged}
              />
            );
          })
        )}
        {gameOver && (
          <div className="game-over-mask">
            <div className="game-over-title">Game Over</div>
            <div className="game-over-text">
              {gameOverReason === "limited"
                ? "The move limit has been reached."
                : gameOverReason === "time"
                ? "Time is up."
                : "No more moves are available. Your animals cannot evolve further."}
            </div>
            <div className="game-over-summary">
              <div>Mode: {modeLabel}</div>
              <div>Highest animal: {highestLabel}</div>
              <div>Moves: {moves}</div>
              <div className="rating-text">{ratingText}</div>
            </div>
            <button className="btn btn-primary" onClick={onRestart}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
