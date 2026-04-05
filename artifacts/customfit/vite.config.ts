import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

const apiProxyTarget = process.env.VITE_DEV_API_PROXY ?? "http://127.0.0.1:8080";
const apiProxy = {
  "/api": {
    target: apiProxyTarget,
    changeOrigin: true,
    secure: false,
  },
} as const;

/** Skip sign-in UI unless `VITE_DISABLE_AUTH=false` (e.g. production with real accounts). */
function viteDisableAuth(env: Record<string, string>): boolean {
  return env.VITE_DISABLE_AUTH !== "false";
}

export default defineConfig(async ({ command, mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname), "");
  const fromFile = env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
  const apiBaseForClient =
    fromFile ||
    (!process.env.REPL_ID && command === "serve" ? apiProxyTarget.replace(/\/$/, "") : "");
  const disableAuth = viteDisableAuth(env);

  const replitPlugins =
    process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : [];

  return {
    base: basePath,
    define: {
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(apiBaseForClient),
      "import.meta.env.VITE_DISABLE_AUTH": JSON.stringify(
        disableAuth ? "true" : "false",
      ),
    },
    plugins: [
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),
      ...replitPlugins,
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      proxy: apiProxy,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      proxy: apiProxy,
    },
  };
});
