import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const entry = (path) => fileURLToPath(new URL(path, import.meta.url));
const pageRoutes = new Set([
  "/product",
  "/remote",
  "/founders",
  "/support",
  "/terms",
  "/privacy",
  "/assumption-of-risk",
  "/health-safety",
]);

function routeHtml() {
  const servePageHtml = (server) => {
    server.middlewares.use((req, _res, next) => {
      if (req.method === "GET" && req.url) {
        const url = new URL(req.url, "http://localhost");
        if (pageRoutes.has(url.pathname)) {
          req.url = `${url.pathname}/index.html${url.search}`;
        }
      }
      next();
    });
  };

  return {
    name: "mycombine-route-html",
    configureServer: servePageHtml,
    configurePreviewServer: servePageHtml,
  };
}

export default defineConfig({
  plugins: [react(), routeHtml()],
  appType: "mpa",
  build: {
    rollupOptions: {
      input: {
        home: entry("./index.html"),
        product: entry("./product/index.html"),
        remote: entry("./remote/index.html"),
        founders: entry("./founders/index.html"),
        support: entry("./support/index.html"),
        terms: entry("./terms/index.html"),
        privacy: entry("./privacy/index.html"),
        assumptionOfRisk: entry("./assumption-of-risk/index.html"),
        healthSafety: entry("./health-safety/index.html"),
      },
    },
  },
});
