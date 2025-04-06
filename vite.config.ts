import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => ({
  ssr: {
    noExternal: command === "build" ? true : undefined,
    optimizeDeps: {
      include: ["@prisma/client-generated"],
    },
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    host: true,
    watch: {
      ignored: ["**/.specstory/**"],
    },
  },
  build: {
    rollupOptions: {
      external: ["@prisma/client-generated"],
    },
  },
}));
