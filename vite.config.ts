import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Cover letters are per-application and must never reach the public site, so
// the letter registry is only bundled when INCLUDE_LETTERS=1 (npm run dev and
// npm run pdf). The deploy build (npm run build) resolves it to an empty stub
// instead, and ?letter=… falls back to the resume.
const includeLetters = process.env.INCLUDE_LETTERS === '1'
const lettersModule = includeLetters
  ? './src/data/letters.ts'
  : './src/data/letters.empty.ts'

// base defaults to "/" (subdomain deploy). For a subpath deploy
// (example.com/resume/), set VITE_BASE=/resume/ at build time. Note that
// the font @font-face URLs and the avatar are absolute /… paths; a
// subpath deploy would also need those made base-relative.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@letters': fileURLToPath(new URL(lettersModule, import.meta.url)),
    },
  },
})
