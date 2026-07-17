import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  server: {
    port: 3000,
  },
  base: process.env.NODE_ENV === "production" ? "/static/frontend/" : "/",
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
