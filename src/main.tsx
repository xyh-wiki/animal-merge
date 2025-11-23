/**
 * @Author:XYH
 * @Date:2025-11-23
 * @Description:
 *  React 应用入口文件，将根组件 App 挂载到页面中的 #root 容器。
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
