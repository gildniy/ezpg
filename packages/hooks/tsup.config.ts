import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: false, // We're handling this separately
  external: ["react", "react-dom", "next"],
  clean: true,
  sourcemap: true,
});
