/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description:
 *  Animal Merge Evolution 韩文文案配置
 */

import type { GameLocaleMessages } from "./ja"; // 复用类型，如果不想依赖可复制一份 interface

export const koMessages: GameLocaleMessages = {
    title: "Animal Merge Evolution",
    subtitle:
        "귀여운 동물들을 합치며 진화시키는 편안한 퍼즐 게임입니다. 간단하지만 중독성 있는 플레이를 즐겨보세요.",

    btnNewGame: "새 게임",
    btnUndo: "한 수 되돌리기",
    btnHint: "힌트",

    winTitle: "클리어!",
    winDesc:
        "최종 동물까지 진화했습니다. 새로 시작하거나 다른 모드를 시도해 보세요.",

    labelScore: "점수",
    labelMoves: "이동 횟수",
    labelHighest: "최고 등급",
    labelUndoLeft: "남은 되돌리기",
    labelHintLeft: "남은 힌트",

    labelTheme: "테마",
    language: "언어",

    hintBannerPrefix: "추천 방향",
};

export default koMessages;