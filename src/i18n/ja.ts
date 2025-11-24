/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description:
 *  Animal Merge Evolution 日文文案配置
 */

export interface GameLocaleMessages {
    title: string;
    subtitle: string;
    btnNewGame: string;
    btnUndo: string;
    btnHint: string;
    winTitle: string;
    winDesc: string;
    labelScore: string;
    labelMoves: string;
    labelHighest: string;
    labelUndoLeft: string;
    labelHintLeft: string;
    labelTheme: string;
    language: string;
    hintBannerPrefix: string;
}

export const jaMessages: GameLocaleMessages = {
    // 页面主标题
    title: "Animal Merge Evolution",
    // 副标题 / 简介
    subtitle:
        "かわいい動物を合体させて進化させる、シンプルでリラックスできるパズルゲームです。",

    // 顶部按钮
    btnNewGame: "新しいゲーム",
    btnUndo: "一手戻す",
    btnHint: "ヒント",

    // 胜利提示
    winTitle: "クリア！",
    winDesc:
        "最終の動物まで進化しました。もう一度遊ぶか、別のモードを試してみましょう。",

    // 统计信息
    labelScore: "スコア",
    labelMoves: "手数",
    labelHighest: "最高ランク",
    labelUndoLeft: "残りアンドゥ",
    labelHintLeft: "残りヒント",

    // 其他 UI
    labelTheme: "テーマ",
    language: "言語",

    // 提示方向 Banner 前缀
    hintBannerPrefix: "おすすめの方向",
};

export default jaMessages;