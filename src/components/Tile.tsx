/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description: 单个棋盘格子组件，支持高阶动物闪光效果
 */

import React from "react";
import { animalMap } from "../data/animals";

// 动态注入呼吸式光效动画（仅在浏览器环境执行一次）
if (typeof document !== "undefined") {
    const styleId = "tile-glow-pulse-style";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
          @keyframes tileGlowPulse {
            0% {
              transform: scale(1);
              filter: brightness(1);
            }
            50% {
              transform: scale(1.08);
              filter: brightness(1.25);
            }
            100% {
              transform: scale(1);
              filter: brightness(1);
            }
          }
        `;
        document.head.appendChild(style);
    }
}

// 计算当前配置中最高等级动物的数值，用于分级光效强度计算
const MAX_ANIMAL_VALUE: number = Math.max(
    ...Object.keys(animalMap).map((v) => Number(v))
);

interface TileProps {
    value: number;
    /** 是否需要高亮闪光（由外层控制） */
    highlight?: boolean;
}

const Tile: React.FC<TileProps> = ({ value, highlight }) => {
    // 空格子
    if (value === 0) {
        return <div className="tile tile-empty" />;
    }

    const info = animalMap[value];

    // 基础样式 className
    const className = `tile tile-filled${highlight ? " tile-highlight" : ""}`;

    /**
     * 分级光效逻辑说明：
     *  - 以 MAX_ANIMAL_VALUE 作为最高等级基准，将当前 value 映射到 0~1 的进度值 progress
     *  - 当 progress 小于 0.6 时，不附加光效（普通动物）
     *  - 当 progress 大于等于 0.6 时，认为是 Panda 及之后的高阶动物，progress 越接近 1 光效越强
     */
    const progress = value / MAX_ANIMAL_VALUE;
    let glowStyle: React.CSSProperties = {};

    if (progress >= 0.6) {
        // 将 [0.6, 1] 映射到 [0, 1]，用于控制光效强度
        const levelRaw = (progress - 0.6) / 0.4;
        const level = Math.max(0, Math.min(1, levelRaw));

        // 根据等级计算光晕参数：等级越高，模糊越大、扩散越强、透明度越高
        const blur = 8 + level * 18;        // 模糊半径
        const spread = 2 + level * 6;       // 扩散范围
        const alpha = 0.3 + level * 0.4;    // 透明度

        glowStyle = {
            boxShadow: `
                0 0 ${blur}px ${spread}px rgba(250, 204, 21, ${alpha}),
                0 0 ${blur + 10}px ${spread + 4}px rgba(59, 130, 246, ${alpha * 0.8})
            `,
            transform: highlight ? "scale(1.06)" : "scale(1.03)",
            transition: "box-shadow 0.25s ease, transform 0.25s ease",
            animation: "tileGlowPulse 2.2s ease-in-out infinite",
        };
    }

    return (
        <div className={className} style={glowStyle}>
            <div className="tile-emoji">{info?.emoji ?? "?"}</div>
            <div className="tile-name">{info?.name ?? value}</div>
        </div>
    );
};

export default Tile;
