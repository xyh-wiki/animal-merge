/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description: 应用入口，挂载 React 根组件
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import "./styles/themes.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
