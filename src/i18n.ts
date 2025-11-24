/**
 * @Author:XYH
 * @Date:2025-11-23
 * @Description:
 */
export type Lang = "en" | "zh" | "ja" | "ko" | "fr" | "es" | "de";

import React from "react";

interface Game {
  state: {
    remainingUndo: number;
    remainingHint: number;
  };
  messages: {
    language: string;
    btnUndo: string;
    btnHint: string;
    btnNewGame: string;
  };
  undo: () => void;
  hint: () => void;
}

interface GameBoardProps {
    game: Game;
    lang: string;
    setLang: (lang: string) => void;
    handleNewGameClick: () => void;
}

export function GameBoard({ game, lang, setLang, handleNewGameClick }: GameBoardProps) {

    return (
        <div className="game-board">
        <div className="top-right">
        <div className="language-switch">
            <span>{game.messages.language}</span>
            <button
    className={`pill ${lang === "en" ? "pill-active" : ""}`}
    onClick={() => setLang("en")}
>
    EN
    </button>
    <button
    className={`pill ${lang === "zh" ? "pill-active" : ""}`}
    onClick={() => setLang("zh")}
>
    中文
    </button>
    <button
    className={`pill ${lang === "ja" ? "pill-active" : ""}`}
    onClick={() => setLang("ja")}
>
    日本語
    </button>
    <button
    className={`pill ${lang === "ko" ? "pill-active" : ""}`}
    onClick={() => setLang("ko")}
>
    한국어
    </button>
    <button
    className={`pill ${lang === "fr" ? "pill-active" : ""}`}
    onClick={() => setLang("fr")}
>
    FR
    </button>
    <button
    className={`pill ${lang === "es" ? "pill-active" : ""}`}
    onClick={() => setLang("es")}
>
    ES
    </button>
    <button
    className={`pill ${lang === "de" ? "pill-active" : ""}`}
    onClick={() => setLang("de")}
>
    DE
    </button>
    </div>
    <div className="top-actions">
    <button
        className="pill"
    onClick={game.undo}
    disabled={game.state.remainingUndo <= 0}
        >
            ⏪ {game.messages.btnUndo} ({game.state.remainingUndo})
    </button>
    <button
    className="pill"
    onClick={game.hint}
    disabled={game.state.remainingHint <= 0}
        >
            💡 {game.messages.btnHint} ({game.state.remainingHint})
    </button>
    <button className="btn-primary" onClick={handleNewGameClick}>
        {game.messages.btnNewGame}
        </button>
        </div>
        </div>
    {/* other game board content */}
    </div>
);
}
