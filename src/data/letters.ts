import type { ResolvedCoverLetter } from '../cover-letter-schema'
import type { CoverLetter } from '../cover-letter-schema'

// Every letter in src/data/letters/ is picked up automatically, so adding a
// new application is just dropping in a file. That directory is gitignored:
// letters are per-application and stay out of the repo.
//
// The slug comes from the filename (letters/new-relic.ts -> ?letter=new-relic)
// so the URL and the file can never drift apart.
//
// This module is only bundled when INCLUDE_LETTERS=1 (npm run dev / npm run
// pdf). The production build aliases it to letters.empty.ts so nothing
// company-specific ever ships to the public site. See vite.config.ts.
const modules = import.meta.glob<{ letter: CoverLetter }>('./letters/*.ts', {
  eager: true,
})

export const letters: ResolvedCoverLetter[] = Object.entries(modules)
  .filter(([, m]) => Boolean(m?.letter))
  .map(([path, m]) => ({
    ...m.letter,
    slug: path.split('/').pop()!.replace(/\.ts$/, ''),
  }))
