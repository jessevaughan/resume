import type { ResolvedCoverLetter } from '../cover-letter-schema'

// Production stand-in for letters.ts. The deploy build aliases the letter
// registry here so no company-specific letter is bundled into the public
// site (see vite.config.ts). ?letter=… simply falls back to the resume.
export const letters: ResolvedCoverLetter[] = []
