import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// IMPORTANT for GitHub Pages project sites:
// Set base to "/<your-repo-name>/" (with leading & trailing slash).
// Example: if repo is github.com/Htet-2aung/portfolio -> base: "/portfolio/"
// For a user/org site (username.github.io) or custom domain, use "/".
const base = process.env.VITE_BASE ?? "/Htet-2aung.github.io/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    host: "::",
    port: 8080,
  },
});
