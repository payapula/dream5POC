## SpecStory

## Excluding .specstory from Vite HMR (06/04/2025, 13:24:24)

_**User**_

I am noticing a issue where I have a folder `.specstory` in the directory, whenever anything in this folder is updated, I am noticing that HMR is kicking in by vite and vite updates the app

`1:21:09 PM [vite] page reload .specstory/history/.what-is-this.md (x3)`

I don't want this behavior, as nothing inside .specstory is related to app code. How do fix this issue?

---

_**Assistant**_

I'll help you exclude the `.specstory` directory from Vite's HMR watching. You need to add the `server.watch.ignored` configuration to your vite config file.

Let me update your vite.config.ts:

```vite.config.ts
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
      ignored: ["**/.specstory/**"]
    }
  },
  build: {
    rollupOptions: {
      external: ["@prisma/client-generated"],
    },
  },
}));
```

This configuration tells Vite to ignore the `.specstory` directory and all its contents during development, preventing HMR from triggering when files in that directory change.

---



---

