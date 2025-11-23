/**
 * @Author:XYH
 * @Date:2025-11-23
 * @Description:
 *  游戏使用说明与 FAQ 页面组件，可直接嵌入首页或作为单独路由页面使用。
 *  支持英文与简体中文，根据 lang 参数显示不同文案。
 */
import React from "react";
import type { Lang } from "../i18n";

interface HelpPageProps {
  lang: Lang;
}

export const HelpPage: React.FC<HelpPageProps> = ({ lang }) => {
  if (lang === "zh") {
    return (
      <div className="help-page">
        <h2 className="help-title">如何游玩 Animal Merge Journey</h2>
        <p className="help-subtitle">
          合并可爱的小动物，规划你的每一步，一路进化到传说中的巨龙！
        </p>

        <section className="help-section">
          <h3>基础规则</h3>
          <ul>
            <li>游戏在 4×4 的方格棋盘上进行。</li>
            <li>
              使用键盘上的 <b>方向键</b>（↑ ← ↓ →）将所有方块向某一方向滑动。
            </li>
            <li>
              当两个相同动物的方块碰撞时，会合并成更高一级的动物。
            </li>
            <li>
              每次移动后，会在随机的空格中生成一个新的低级动物（老鼠或小猫）。
            </li>
          </ul>
        </section>

        <section className="help-section">
          <h3>进化链</h3>
          <p>动物的进化顺序如下：</p>
          <ul className="help-list-two-cols">
            <li>2 → 老鼠 🐭</li>
            <li>4 → 小猫 🐱</li>
            <li>8 → 小狗 🐶</li>
            <li>16 → 兔子 🐰</li>
            <li>32 → 狐狸 🦊</li>
            <li>64 → 棕熊 🐻</li>
            <li>128 → 老虎 🐯</li>
            <li>256 → 熊猫 🐼</li>
            <li>512 → 考拉 🐨</li>
            <li>1024 → 狮子 🦁</li>
            <li>最高等级 → 巨龙 🐲</li>
          </ul>
          <p>你的目标是进化到巨龙，并不断刷新自己的最高分。</p>
        </section>

        <section className="help-section">
          <h3>游戏结束</h3>
          <p>
            当棋盘上<b>没有空格</b>，并且<b>再也没有可以合并的方块</b>时，本局游戏结束。
          </p>
        </section>

        <section className="help-section">
          <h3>小技巧与策略</h3>
          <ul>
            <li>尽量让最高等级的动物固定在某一个角落。</li>
            <li>不要频繁改变移动方向，建议优先使用 2～3 个主方向。</li>
            <li>提前思考两三步，避免棋盘很快被填满。</li>
          </ul>
        </section>

        <section className="help-section">
          <h3>常见问题</h3>

          <h4>这款游戏和经典数字消除类游戏一样吗？</h4>
          <p>
            逻辑很相似，都是通过合并相同的格子来升级。区别是这里使用了动物进化主题，而不是纯数字。
          </p>

          <h4>手机上可以玩吗？</h4>
          <p>
            可以。在手机上，你可以使用手势滑动（上、下、左、右）来操作，而不是键盘方向键。
          </p>

          <h4>游戏是免费的吗？</h4>
          <p>
            是的，Animal Merge Journey 完全免费。页面上可能会展示少量广告，用于支持服务器与后续开发。
          </p>

          <h4>这款游戏适合谁？</h4>
          <p>
            任何喜欢休闲益智游戏、可爱动物或合并类玩法的玩家。很适合碎片时间、通勤途中或下班后稍微放松一下。
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="help-page">
      <h2 className="help-title">How to Play Animal Merge Journey</h2>
      <p className="help-subtitle">
        Merge cute animals, plan your moves, and reach the legendary dragon!
      </p>

      <section className="help-section">
        <h3>Basic Rules</h3>
        <ul>
          <li>The game is played on a 4×4 grid.</li>
          <li>
            Use the keyboard <b>Arrow keys</b> (↑ ← ↓ →) to move all tiles in
            that direction.
          </li>
          <li>
            When two tiles with the <b>same animal</b> collide, they merge into
            a higher-level animal.
          </li>
          <li>
            After each move, a new low-level animal (Mouse or Cat) appears at a
            random empty cell.
          </li>
        </ul>
      </section>

      <section className="help-section">
        <h3>Evolution Chain</h3>
        <p>The animals evolve in the following order:</p>
        <ul className="help-list-two-cols">
          <li>2 → Mouse 🐭</li>
          <li>4 → Cat 🐱</li>
          <li>8 → Dog 🐶</li>
          <li>16 → Rabbit 🐰</li>
          <li>32 → Fox 🦊</li>
          <li>64 → Bear 🐻</li>
          <li>128 → Tiger 🐯</li>
          <li>256 → Panda 🐼</li>
          <li>512 → Koala 🐨</li>
          <li>1024 → Lion 🦁</li>
          <li>Max level → Dragon 🐲</li>
        </ul>
        <p>Your goal is to reach the dragon and beat your high score.</p>
      </section>

      <section className="help-section">
        <h3>Game Over</h3>
        <p>
          The game ends when there are <b>no empty cells</b> left and{" "}
          <b>no more merges</b> can be made in any direction.
        </p>
      </section>

      <section className="help-section">
        <h3>Tips & Strategy</h3>
        <ul>
          <li>Try to keep your highest animal tile in one corner.</li>
          <li>
            Avoid moving in all four directions randomly. Stick to 2–3 primary
            directions.
          </li>
          <li>
            Think ahead and prevent the board from filling up too quickly.
          </li>
        </ul>
      </section>

      <section className="help-section">
        <h3>FAQ</h3>

        <h4>Is this the same as the classic number puzzle game?</h4>
        <p>
          Yes, the core logic is similar to a classic merge puzzle game. We
          simply use a cute animal evolution theme instead of plain numbers.
        </p>

        <h4>Can I play this on mobile?</h4>
        <p>
          Yes. On mobile, you can use swipe gestures (up, down, left, right)
          instead of keyboard arrows.
        </p>

        <h4>Is this game free?</h4>
        <p>
          Absolutely. Animal Merge Journey is free to play. You might see ads that help
          support hosting and further development.
        </p>

        <h4>Who is this game for?</h4>
        <p>
          Anyone who enjoys casual puzzle games, cute animals, or classic merge
          gameplay. It is perfect for short breaks, commuting, or relaxing after
          work.
        </p>
      </section>
    </div>
  );
};
