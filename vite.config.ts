import adapter from "@hono/vite-dev-server/cloudflare";
import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import autoprefixer from "autoprefixer";
import serverAdapter from "hono-react-router-adapter/vite";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  build: {
    assetsInlineLimit: 1024,
    rollupOptions: {
      external: /.+\.wasm?url$/i,
    },
  },
  plugins: [
    cloudflareDevProxy(),
    reactRouter(),
    serverAdapter({
      adapter,
      entry: "server/index.ts",
    }),
    tsconfigPaths(),
  ],
  ssr: {
    noExternal: ["react-use"],
  },
  assetsInclude: ["**/*.wasm?module"],
});
