/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description: 单个棋盘格子组件，支持高阶动物闪光效果
 */

import React from "react";
import { animalMap } from "../data/animals";

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
    const className = `tile tile-filled${highlight ? " tile-highlight" : ""}`;

    return (
        <div className={className}>
            <div className="tile-emoji">{info?.emoji ?? "?"}</div>
            <div className="tile-name">{info?.name ?? value}</div>
        </div>
    );
};

export default Tile;
