import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import nitro from "nitro/vite"; // adjust import path to your Nitro plugin

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },

  vite: {
    plugins: [
      nitro(),
    ],
  },
});