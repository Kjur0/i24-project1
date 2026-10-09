import path from "path"
import { defineConfig } from "lint-staged/config"

const buildEslintCommand = (filename) =>
  `eslint --fix ${filename
    .map((f) => `"${path.relative(process.cwd(), f)}"`)
    .join(" ")}`

export default defineConfig({
  "*.{js,jsx,ts,tsx}": [buildEslintCommand],
})
