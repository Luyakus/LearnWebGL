import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [glsl(), react()],
  assetsInclude: ["**/*.obj", "**/*.mtl", "**/*.blend", "**/*.wasm", "**/*.dae"],
  server: {
    host: "0.0.0.0"
  }
});
