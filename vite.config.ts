/**
 * @Author:XYH
 * @Date:2025-11-23
 * @Description:
 *  Vite 配置文件，使用 React + SWC 作为前端开发与构建工具。
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
