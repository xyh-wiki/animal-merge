/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description:
 *  游戏主界面：
 *   1）左侧：模式、统计、主题切换、棋盘
 *   2）右侧：玩法说明、进化图示、FAQ、排行榜
 *  本文件额外实现：
 *   - 排行榜中显示最高动物 emoji
 *   - 进化到高阶动物时闪光提示
 *   - 全局键盘控制（无需点击棋盘即可用方向键）
 *   - EN / 中文 文案切换
 */

import React, { useEffect, useRef, useState } from "react";
import Tile from "./Tile";
import { useGame, Direction } from "../hooks/useGame";
import { MODES, GameModeKey, getMode } from "../data/modes";
import { attachSwipeListener } from "../utils/touch";
import { evolutionLines, animalMap } from "../data/animals";

/** 排行榜记录结构 */
interface LeaderboardRecord {
  id: string;
  mode: GameModeKey;
  score: number;
  moves: number;
  highestName: string;
  highestEmoji: string;
  /** YYYY-MM-DD */
  date: string;
}

/** Classic 总榜存储 key */
const CLASSIC_KEY = "amj_classic_records";
/** Daily 当日榜 key 前缀 */
const DAILY_KEY_PREFIX = "amj_daily_records_";

type Lang = "en" | "zh" | "ja" | "ko" | "fr" | "es" | "de";

/** 多语言文案 */
const TEXTS: Record<Lang, any> = {
  en: {
    language: "Language",
    title: "Animal Merge Journey",
    subtitle: "A light-weight animal evolution swipe puzzle with multiple modes and themes.",
    btnNewGame: "New Game",
    btnUndo: "Undo",
    btnHint: "Hint",
    winTitle: "You win!",
    winDesc:
        "You have reached the final animal. Start a new journey or try another mode.",
    labelScore: "Score",
    labelMoves: "Moves",
    labelHighest: "Highest",
    labelTheme: "Theme",
    labelUndoLeft: "Undo left",
    labelHintLeft: "Hints left",
    howToPlay: "How to play?",
    howBullets: [
      "Use arrow keys or swipe to move all animals.",
      "Same animals merge and evolve into a higher level.",
      "Try to reach Dragon, Phoenix and Unicorn."
    ],
    evoDesc: "Merge two of the same animal to evolve into the next one in the chain.",
    faqTitle: "FAQ",
    faq1Q: "Is this the same as the classic number puzzle game?",
    faq1A:
        "The core logic is similar, but we use cute animals instead of plain numbers, plus extra modes and themes.",
    faq2Q: "Can I play this on mobile?",
    faq2A:
        "Yes. Swipe on the board (up, down, left, right) to move the animals. The page will not scroll while you are swiping.",
    faq3Q: "Is this game free?",
    faq3A:
        "Absolutely. Animal Merge Journey is free to play. You might see some ads in the future to help support hosting.",
    lbTitle: "Leaderboards",
    lbClassic: "Classic – All time",
    lbClassicEmpty:
        "No classic records yet. Play a Classic game and click New Game to save your score.",
    lbDailyPrefix: "Daily challenge",
    lbDailyEmpty:
        "No record for today’s Daily challenge yet. Finish a run and click New Game to save it."
  },
  zh: {
    language: "语言",
    title: "Animal Merge Journey",
    subtitle: "轻量级动物进化消除小游戏，支持多种模式与主题皮肤。",
    btnNewGame: "新开一局",
    btnUndo: "撤销一步",
    btnHint: "提示一步",
    winTitle: "通关啦！",
    winDesc: "你已经进化到最终动物，可以重新开局或尝试其他模式。",
    labelScore: "得分",
    labelMoves: "步数",
    labelHighest: "最高动物",
    labelTheme: "主题",
    labelUndoLeft: "剩余撤销",
    labelHintLeft: "剩余提示",
    howToPlay: "怎么玩？",
    howBullets: [
      "使用方向键或滑动操作，让所有动物一起移动。",
      "相同动物会合并并进化到更高一级。",
      "尽量进化到 Dragon、Phoenix 和 Unicorn。"
    ],
    evoDesc: "合并两个相同动物即可进化为下一阶段动物。",
    faqTitle: "常见问题",
    faq1Q: "这是不是那个数字消除类经典游戏？",
    faq1A:
        "核心规则相似，但这里全部换成了小动物，并增加了多种模式和主题皮肤。",
    faq2Q: "手机上能玩吗？",
    faq2A:
        "可以。直接在棋盘上向上 / 下 / 左 / 右滑动即可移动动物。滑动时页面不会跟着滚动。",
    faq3Q: "这个游戏收费吗？",
    faq3A:
        "完全免费。未来可能会加入少量广告，用来支持服务器和后续开发。",
    lbTitle: "排行榜",
    lbClassic: "经典模式 - 总排行",
    lbClassicEmpty: "当前还没有经典模式记录，玩一局后点击“新开一局”即可保存成绩。",
    lbDailyPrefix: "每日挑战",
    lbDailyEmpty:
        "今天的每日挑战还没有任何记录，完成一局后点击“新开一局”即可保存。"
  },
  ja: {
    language: "言語",
    title: "Animal Merge Journey",
    subtitle:
      "かわいい動物を合体させて進化させる、シンプルでリラックスできるパズルゲームです。",
    btnNewGame: "新しいゲーム",
    btnUndo: "一手戻す",
    btnHint: "ヒント",
    winTitle: "クリア！",
    winDesc:
      "最終の動物まで進化しました。もう一度遊ぶか、別のモードを試してみましょう。",
    labelScore: "スコア",
    labelMoves: "手数",
    labelHighest: "最高ランク",
    labelTheme: "テーマ",
    labelUndoLeft: "残りアンドゥ",
    labelHintLeft: "残りヒント",
    howToPlay: "遊び方",
    howBullets: [
      "矢印キーまたはスワイプで全ての動物を動かします。",
      "同じ動物同士が重なると、1段階上の動物に進化します。",
      "できるだけ Dragon、Phoenix、Unicorn を目指しましょう。"
    ],
    evoDesc: "同じ動物を2つ重ねると、次の進化段階の動物になります。",
    faqTitle: "よくある質問",
    faq1Q: "これはあの有名な数字パズルゲームと同じですか？",
    faq1A:
      "基本ルールは似ていますが、数字の代わりに動物を使い、複数のモードとテーマを追加しています。",
    faq2Q: "スマホでも遊べますか？",
    faq2A:
      "はい。盤面の上で上下左右にスワイプすることで動物を動かせます。スワイプ中にページはスクロールしません。",
    faq3Q: "このゲームは無料ですか？",
    faq3A:
      "完全無料です。今後、サーバー維持のために少量の広告が表示される可能性があります。",
    lbTitle: "ランキング",
    lbClassic: "クラシックモード - 通算",
    lbClassicEmpty:
      "クラシックモードの記録はまだありません。1回プレイして「新しいゲーム」を押すと保存されます。",
    lbDailyPrefix: "デイリーチャレンジ",
    lbDailyEmpty:
      "今日のデイリーチャレンジにはまだ記録がありません。1回クリアして「新しいゲーム」を押すと保存されます。"
  },
  ko: {
    language: "언어",
    title: "Animal Merge Journey",
    subtitle:
      "귀여운 동물들을 합치며 진화시키는 편안한 퍼즐 게임입니다. 단순하지만 중독성 있는 플레이를 즐겨보세요.",
    btnNewGame: "새 게임",
    btnUndo: "한 수 되돌리기",
    btnHint: "힌트",
    winTitle: "클리어!",
    winDesc:
      "최종 동물까지 진화했습니다. 새로 시작하거나 다른 모드를 시도해 보세요.",
    labelScore: "점수",
    labelMoves: "이동 횟수",
    labelHighest: "최고 등급",
    labelTheme: "테마",
    labelUndoLeft: "남은 되돌리기",
    labelHintLeft: "남은 힌트",
    howToPlay: "플레이 방법",
    howBullets: [
      "방향키 또는 스와이프로 모든 동물을 한 번에 이동시킵니다.",
      "같은 동물이 만나면 합쳐져서 더 높은 단계의 동물로 진화합니다.",
      "가능한 한 Dragon, Phoenix, Unicorn까지 진화시켜 보세요."
    ],
    evoDesc: "같은 동물 두 마리를 합치면 다음 단계의 동물로 진화합니다.",
    faqTitle: "자주 묻는 질문",
    faq1Q: "클래식 숫자 퍼즐 게임과 같은 게임인가요?",
    faq1A:
      "핵심 규칙은 비슷하지만, 숫자 대신 귀여운 동물을 사용하고 다양한 모드와 테마를 추가했습니다。",
    faq2Q: "모바일에서도 플레이할 수 있나요?",
    faq2A:
      "네. 보드 위에서 위/아래/왼쪽/오른쪽으로 스와이프하면 동물이 움직입니다. 스와이프하는 동안 페이지는 스크롤되지 않습니다。",
    faq3Q: "이 게임은 무료인가요?",
    faq3A:
      "완전 무료입니다. 추후 서버 운영을 위해 소량의 광고가 추가될 수 있습니다。",
    lbTitle: "리더보드",
    lbClassic: "클래식 모드 - 전체",
    lbClassicEmpty:
      "아직 클래식 모드 기록이 없습니다. 한 판 플레이 후 \"새 게임\"을 누르면 기록이 저장됩니다。",
    lbDailyPrefix: "일일 챌린지",
    lbDailyEmpty:
      "오늘의 일일 챌린지 기록이 없습니다. 한 판 클리어 후 \"새 게임\"을 누르면 저장됩니다。"
  },
  fr: {
    language: "Langue",
    title: "Animal Merge Journey",
    subtitle:
      "Un jeu de puzzle relaxant où vous fusionnez des animaux pour les faire évoluer vers des formes toujours plus puissantes.",
    btnNewGame: "Nouvelle partie",
    btnUndo: "Annuler le coup",
    btnHint: "Indice",
    winTitle: "Victoire !",
    winDesc:
      "Vous avez atteint l'animal final. Lancez une nouvelle partie ou essayez un autre mode.",
    labelScore: "Score",
    labelMoves: "Coups joués",
    labelHighest: "Niveau maximal",
    labelTheme: "Thème",
    labelUndoLeft: "Annulations restantes",
    labelHintLeft: "Indices restants",
    howToPlay: "Comment jouer ?",
    howBullets: [
      "Utilisez les flèches du clavier ou faites glisser pour déplacer tous les animaux.",
      "Deux animaux identiques fusionnent et évoluent vers un niveau supérieur.",
      "Essayez d'atteindre Dragon, Phoenix et Unicorn."
    ],
    evoDesc:
      "Fusionnez deux animaux identiques pour obtenir le suivant dans la chaîne d'évolution.",
    faqTitle: "FAQ",
    faq1Q: "Est-ce le même jeu que le célèbre puzzle de nombres ?",
    faq1A:
      "La logique de base est similaire, mais nous utilisons des animaux mignons à la place des nombres, avec des modes et des thèmes supplémentaires.",
    faq2Q: "Puis-je y jouer sur mobile ?",
    faq2A:
      "Oui. Faites glisser sur le plateau vers le haut, le bas, la gauche ou la droite pour déplacer les animaux. La page ne défilera pas pendant le geste.",
    faq3Q: "Le jeu est-il gratuit ?",
    faq3A:
      "Oui, Animal Merge Journey est entièrement gratuit. Il se peut que quelques publicités soient ajoutées plus tard pour soutenir l'hébergement.",
    lbTitle: "Classements",
    lbClassic: "Classique – Tous les temps",
    lbClassicEmpty:
      "Aucun score en mode classique pour le moment. Jouez une partie classique puis cliquez sur \"Nouvelle partie\" pour l'enregistrer.",
    lbDailyPrefix: "Défi du jour",
    lbDailyEmpty:
      "Aucun score pour le défi du jour. Terminez une partie puis cliquez sur \"Nouvelle partie\" pour l'enregistrer."
  },
  es: {
    language: "Idioma",
    title: "Animal Merge Journey",
    subtitle:
      "Un juego de rompecabezas relajante donde fusionas animales para hacerlos evolucionar hasta la criatura final.",
    btnNewGame: "Nueva partida",
    btnUndo: "Deshacer jugada",
    btnHint: "Pista",
    winTitle: "¡Has ganado!",
    winDesc:
      "Has alcanzado el animal final. Empieza una nueva partida o prueba otro modo.",
    labelScore: "Puntuación",
    labelMoves: "Movimientos",
    labelHighest: "Nivel máximo",
    labelTheme: "Tema",
    labelUndoLeft: "Deshacer restantes",
    labelHintLeft: "Pistas restantes",
    howToPlay: "¿Cómo se juega?",
    howBullets: [
      "Usa las teclas de flecha o desliza para mover todos los animales.",
      "Dos animales iguales se fusionan y evolucionan a un nivel superior.",
      "Intenta llegar a Dragon, Phoenix y Unicorn."
    ],
    evoDesc:
      "Fusiona dos animales iguales para evolucionar al siguiente en la cadena.",
    faqTitle: "Preguntas frecuentes",
    faq1Q: "¿Es lo mismo que el clásico juego de números?",
    faq1A:
      "La lógica básica es similar, pero usamos animales adorables en lugar de números, y añadimos modos y temas extra.",
    faq2Q: "¿Puedo jugar en el móvil?",
    faq2A:
      "Sí. Desliza sobre el tablero (arriba, abajo, izquierda, derecha) para mover los animales. La página no se desplazará mientras deslizas.",
    faq3Q: "¿Este juego es gratuito?",
    faq3A:
      "Totalmente. Animal Merge Journey es gratis. En el futuro podríamos mostrar algunos anuncios para mantener el servidor.",
    lbTitle: "Clasificaciones",
    lbClassic: "Clásico – Historial",
    lbClassicEmpty:
      "Todavía no hay puntuaciones en modo clásico. Juega una partida y haz clic en «Nueva partida» para guardarla.",
    lbDailyPrefix: "Desafío diario",
    lbDailyEmpty:
      "Todavía no hay puntuaciones para el desafío diario de hoy. Completa una partida y haz clic en «Nueva partida» para guardarla."
  },
  de: {
    language: "Sprache",
    title: "Animal Merge Journey",
    subtitle:
      "Ein entspannendes Puzzlespiel, in dem du Tiere kombinierst und sie bis zur finalen Evolution weiterentwickelst.",
    btnNewGame: "Neues Spiel",
    btnUndo: "Zug zurücknehmen",
    btnHint: "Hinweis",
    winTitle: "Gewonnen!",
    winDesc:
      "Du hast das letzte Tier erreicht. Starte eine neue Runde oder probiere einen anderen Modus aus.",
    labelScore: "Punkte",
    labelMoves: "Züge",
    labelHighest: "Höchste Stufe",
    labelTheme: "Thema",
    labelUndoLeft: "Rücknahmen übrig",
    labelHintLeft: "Hinweise übrig",
    howToPlay: "Wie wird gespielt?",
    howBullets: [
      "Bewege alle Tiere mit den Pfeiltasten oder durch Wischen.",
      "Gleiche Tiere verschmelzen und entwickeln sich zu einer höheren Stufe.",
      "Versuche, Dragon, Phoenix und Unicorn zu erreichen."
    ],
    evoDesc:
      "Kombiniere zwei gleiche Tiere, um das nächste in der Evolutionskette zu erhalten.",
    faqTitle: "FAQ",
    faq1Q: "Ist das dasselbe wie das klassische Zahlenpuzzle?",
    faq1A:
      "Die Grundlogik ist ähnlich, aber wir verwenden niedliche Tiere statt Zahlen und bieten zusätzliche Modi und Themen.",
    faq2Q: "Kann ich das Spiel auf dem Handy spielen?",
    faq2A:
      "Ja. Wische auf dem Spielfeld nach oben, unten, links oder rechts, um die Tiere zu bewegen. Währenddessen scrollt die Seite nicht.",
    faq3Q: "Ist dieses Spiel kostenlos?",
    faq3A:
      "Ja, Animal Merge Journey ist kostenlos spielbar. Möglicherweise fügen wir später ein paar Anzeigen hinzu, um den Betrieb zu finanzieren.",
    lbTitle: "Bestenlisten",
    lbClassic: "Klassisch – Alle Zeiten",
    lbClassicEmpty:
      "Es gibt noch keine Einträge im klassischen Modus. Spiele eine Runde und klicke auf „Neues Spiel“, um deinen Score zu speichern.",
    lbDailyPrefix: "Tages-Challenge",
    lbDailyEmpty:
      "Für die heutige Tages-Challenge gibt es noch keine Einträge. Beende eine Runde und klicke auf „Neues Spiel“, um deinen Score zu speichern."
  }
};

const GameBoard: React.FC = () => {
  /** 当前模式 */
  const [modeKey, setModeKey] = useState<GameModeKey>("classic");
  /** 当前主题皮肤 */
  const [theme, setTheme] = useState<"forest" | "desert" | "snow" | "galaxy">(
      "forest"
  );
  /** 当前语言（默认英文） */
  const [lang, setLang] = useState<Lang>("en");
  const t = TEXTS[lang];

  /** 游戏核心逻辑 */
  const game = useGame(modeKey);
  const boardRef = useRef<HTMLDivElement | null>(null);

  /** Classic 总榜 */
  const [classicRecords, setClassicRecords] = useState<LeaderboardRecord[]>(
      []
  );
  /** Daily 当日榜 */
  const [dailyRecords, setDailyRecords] = useState<LeaderboardRecord[]>([]);

  /** 今日日期字符串 */
  const todayStrRef = useRef<string>(new Date().toISOString().slice(0, 10));

  /** 最高动物闪光用：当前需要高亮的数值 */
  const [highlightValue, setHighlightValue] = useState<number | null>(null);
  const prevHighestRef = useRef<number>(game.state.highestValue);

  /** 主题皮肤写入 body data-theme */
  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  /** 监听最高值变化，进化到更高动物时触发闪光 */
  useEffect(() => {
    const prev = prevHighestRef.current;
    const curr = game.state.highestValue;
    prevHighestRef.current = curr;

    if (curr > prev && curr >= 256) {
      // 认为 256 以上算“高阶动物”，触发闪光
      setHighlightValue(curr);
      const timer = setTimeout(() => setHighlightValue(null), 450);
      return () => clearTimeout(timer);
    }
  }, [game.state.highestValue]);

  /** 全局键盘监听（不需要点击棋盘） */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right"
      };
      const dir = keyMap[e.key];
      if (!dir) return;
      e.preventDefault();
      game.move(dir);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [game]);

  /** 触摸滑动监听（阻止页面滚动） */
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const detach = attachSwipeListener(el, {
      onSwipe: (dir) => {
        if (!dir) return;
        game.move(dir as Direction);
      }
    });
    return detach;
  }, [boardRef.current, game]);

  /** 初始化读取排行榜数据 */
  useEffect(() => {
    try {
      const classicRaw = localStorage.getItem(CLASSIC_KEY);
      if (classicRaw) {
        setClassicRecords(JSON.parse(classicRaw));
      }
      const dailyKey = DAILY_KEY_PREFIX + todayStrRef.current;
      const dailyRaw = localStorage.getItem(dailyKey);
      if (dailyRaw) {
        setDailyRecords(JSON.parse(dailyRaw));
      }
    } catch {
      // 忽略本地异常
    }
  }, []);

  /** 保存当前局到排行榜（Classic 总榜 / Daily 当日榜） */
  function saveCurrentRunToLeaderboard() {
    if (game.state.score <= 0 && game.state.moves <= 0) return;

    const highestValue = game.state.highestValue;
    const info = animalMap[highestValue];
    const highestName = info?.name ?? "Mouse";
    const highestEmoji = info?.emoji ?? "";

    const record: LeaderboardRecord = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      mode: modeKey,
      score: game.state.score,
      moves: game.state.moves,
      highestName,
      highestEmoji,
      date: todayStrRef.current
    };

    if (modeKey === "classic") {
      setClassicRecords((prev) => {
        const merged = [...prev, record].sort((a, b) => b.score - a.score);
        const clipped = merged.slice(0, 10);
        try {
          localStorage.setItem(CLASSIC_KEY, JSON.stringify(clipped));
        } catch {}
        return clipped;
      });
    }

    if (modeKey === "daily") {
      const dailyKey = DAILY_KEY_PREFIX + todayStrRef.current;
      setDailyRecords((prev) => {
        const merged = [...prev, record].sort((a, b) => b.score - a.score);
        const clipped = merged.slice(0, 10);
        try {
          localStorage.setItem(dailyKey, JSON.stringify(clipped));
        } catch {}
        return clipped;
      });
    }
  }

  /** 点击 New Game：保存当前局成绩 + 重开 */
  function handleNewGameClick() {
    saveCurrentRunToLeaderboard();
    game.resetGame();
  }

  const modeCfg = getMode(modeKey);
  const highestInfoForWin = animalMap[game.state.highestValue] || null;
  const highestEmojiForWin = highestInfoForWin?.emoji ?? "";
  const highestNameForWin = highestInfoForWin?.name ?? "";

  return (
      <div className="layout-root">
        {/* 左侧主区域 */}
        <div className="layout-main">
          {/* 标题 + 语言 + 新开一局 */}
          <header className="top-bar">
            <div>
              <h1 className="title">{t.title}</h1>
              <p className="subtitle">{t.subtitle}</p>
            </div>
            <div className="top-right">
              <div className="language-switch">
                <span>{t.language}</span>
                <select
                  className="language-select"
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Lang)}
                >
                  <option value="en">EN</option>
                  <option value="zh">中文</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                  <option value="fr">FR</option>
                  <option value="es">ES</option>
                  <option value="de">DE</option>
                </select>
              </div>
              <div className="top-actions">
                <button
                  className="pill"
                  onClick={game.undo}
                  disabled={game.state.remainingUndo <= 0}
                >
                  ⏪ {t.btnUndo} ({game.state.remainingUndo})
                </button>
                <button
                  className="pill"
                  onClick={game.hint}
                  disabled={game.state.remainingHint <= 0}
                >
                  💡 {t.btnHint} ({game.state.remainingHint})
                </button>
                <button className="btn-primary" onClick={handleNewGameClick}>
                  {t.btnNewGame}
                </button>
              </div>
            </div>
          </header>

          {/* 模式切换 */}
          <div className="mode-tabs">
            {MODES.map((m) => (
                <button
                    key={m.key}
                    className={`pill ${modeKey === m.key ? "pill-active" : ""}`}
                    onClick={() => {
                      setModeKey(m.key);
                      game.setModeKey(m.key);
                    }}
                >
                  {m.label}
                </button>
            ))}
          </div>

          {/* 统计信息 */}
          <div className="stats-bar">
            <div className="stat-box">
              <div className="stat-label">{t.labelScore}</div>
              <div className="stat-value">{game.state.score}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">{t.labelMoves}</div>
              <div className="stat-value">{game.state.moves}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">{t.labelHighest}</div>
              <div className="stat-value">{game.getHighestAnimalName()}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">{t.labelUndoLeft}</div>
              <div className="stat-value">{game.state.remainingUndo}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">{t.labelHintLeft}</div>
              <div className="stat-value">{game.state.remainingHint}</div>
            </div>
            <div className="mode-chip">{modeCfg.label}</div>
          </div>

          {/* 主题切换 */}
          <div className="theme-row">
            <span className="theme-label">{t.labelTheme}</span>
            <div className="theme-tabs">
              {["forest", "desert", "snow", "galaxy"].map((themeKey) => (
                  <button
                      key={themeKey}
                      className={`pill ${theme === themeKey ? "pill-active" : ""}`}
                      onClick={() => setTheme(themeKey as any)}
                  >
                    {themeKey[0].toUpperCase() + themeKey.slice(1)}
                  </button>
              ))}
            </div>
          </div>

          {/* 棋盘（键盘+滑动控制） */}
          <div className="board-wrapper" ref={boardRef}>
            <div
                className="board-grid"
                style={{
                  gridTemplateColumns: `repeat(${game.state.board.length}, 1fr)`
                }}
            >
              {game.state.board.map((row, i) =>
                  row.map((v, j) => (
                      <Tile
                          key={`${i}-${j}`}
                          value={v}
                          highlight={highlightValue !== null && v === highlightValue}
                      />
                  ))
              )}
            </div>
          </div>
          {game.state.lastHintDirection && (
            <div className="hint-banner">
              {/* 简单英文 / 中文通用提示文案 */}
              Recommended move: {game.state.lastHintDirection.toUpperCase()}
            </div>
          )}
        </div>

        {/* 右侧信息区 */}
        <aside className="layout-side">
          {/* 玩法说明 */}
          <div className="panel">
            <h3>{t.howToPlay}</h3>
            <ul className="bullet-list">
              {t.howBullets.map((txt: string, idx: number) => (
                  <li key={idx}>{txt}</li>
              ))}
            </ul>
          </div>

          {/* 动物进化图示 */}
          <div className="panel">
            <h3>Evolution chain</h3>
            <p className="panel-desc">{t.evoDesc}</p>
            <div className="evolution-chain">
              {evolutionLines.map((line, idx) => (
                  <div key={idx} className="evolution-line">
                    {line.map((animal, i) => (
                        <React.Fragment key={animal.value}>
                          <div className="evo-item">
                            <div className="evo-emoji">{animal.emoji}</div>
                            <div className="evo-name">{animal.name}</div>
                          </div>
                          {i < line.length - 1 && (
                              <div className="evo-arrow">→</div>
                          )}
                        </React.Fragment>
                    ))}
                  </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="panel">
            <h3>{t.faqTitle}</h3>
            <div className="panel-section">
              <div className="panel-section-title">{t.faq1Q}</div>
              <p className="panel-text">{t.faq1A}</p>
            </div>
            <div className="panel-section">
              <div className="panel-section-title">{t.faq2Q}</div>
              <p className="panel-text">{t.faq2A}</p>
            </div>
            <div className="panel-section">
              <div className="panel-section-title">{t.faq3Q}</div>
              <p className="panel-text">{t.faq3A}</p>
            </div>
          </div>

          {/* 排行榜 */}
          <div className="panel">
            <h3>{t.lbTitle}</h3>

            {/* Classic 总榜 */}
            <div className="panel-section">
              <div className="panel-section-title">{t.lbClassic}</div>
              {classicRecords.length === 0 ? (
                  <div className="panel-empty">{t.lbClassicEmpty}</div>
              ) : (
                  <ol className="lb-list">
                    {classicRecords.map((r, idx) => (
                        <li key={r.id} className="lb-row">
                          <span className="lb-rank">#{idx + 1}</span>
                          <span className="lb-main">
                      <span className="lb-emoji">{r.highestEmoji}</span>
                            {r.score} pts · {r.highestName}
                    </span>
                          <span className="lb-sub">{r.moves} moves</span>
                        </li>
                    ))}
                  </ol>
              )}
            </div>

            {/* Daily 当日榜 */}
            <div className="panel-section">
              <div className="panel-section-title">
                {t.lbDailyPrefix} ({todayStrRef.current})
              </div>
              {dailyRecords.length === 0 ? (
                  <div className="panel-empty">{t.lbDailyEmpty}</div>
              ) : (
                  <ol className="lb-list">
                    {dailyRecords.map((r, idx) => (
                        <li key={r.id} className="lb-row">
                          <span className="lb-rank">#{idx + 1}</span>
                          <span className="lb-main">
                      <span className="lb-emoji">{r.highestEmoji}</span>
                            {r.score} pts · {r.highestName}
                    </span>
                          <span className="lb-sub">{r.moves} moves</span>
                        </li>
                    ))}
                  </ol>
              )}
            </div>
          </div>
        </aside>

        {/* 游戏胜利遮罩提示：达到最终动物时显示 */}
        {game.state.gameWin && (
          <div
            className="game-win-mask"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000
            }}
          >
            <div
              className="game-over-dialog"
              style={{
                backgroundColor: "#111827",
                color: "#fff",
                padding: "24px 28px",
                borderRadius: 16,
                maxWidth: 420,
                width: "90%",
                boxShadow: "0 22px 60px rgba(0,0,0,0.7)",
                textAlign: "center",
                border: "1px solid rgba(250, 204, 21, 0.6)"
              }}
            >
              <h2 style={{ fontSize: "22px", marginBottom: 12 }}>
                {t.winTitle}
              </h2>
              <div
                style={{
                  fontSize: "40px",
                  marginBottom: 12
                }}
              >
                {highestEmojiForWin}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: 8
                }}
              >
                {highestNameForWin}
              </div>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.6,
                  marginBottom: 20
                }}
              >
                {t.winDesc}
              </p>
              <button
                className="btn-primary"
                style={{ padding: "8px 18px", borderRadius: 999 }}
                onClick={handleNewGameClick}
              >
                🏆 {t.btnNewGame}
              </button>
            </div>
          </div>
        )}
        {/* 游戏失败遮罩提示：没有可用移动时显示 */}
        {game.state.gameOver && (
          <div
            className="game-over-mask"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999
            }}
          >
            <div
              className="game-over-dialog"
              style={{
                backgroundColor: "#1f2933",
                color: "#fff",
                padding: "24px 28px",
                borderRadius: 12,
                maxWidth: 360,
                width: "90%",
                boxShadow: "0 18px 45px rgba(0,0,0,0.55)",
                textAlign: "center"
              }}
            >
              <h2 style={{ fontSize: "20px", marginBottom: 12 }}>
                Game Over
              </h2>
              <p style={{ fontSize: "14px", lineHeight: 1.6, marginBottom: 20 }}>
                No more valid moves on the board.
                <br />
              </p>
              <button
                className="btn-primary"
                style={{ padding: "8px 18px", borderRadius: 999 }}
                onClick={handleNewGameClick}
              >
                🔁 New Game
              </button>
            </div>
          </div>
        )}
      </div>
  );
};

export default GameBoard;
