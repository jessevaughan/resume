import type { Track } from './tracks'

// ============================================================
//  Cover letter schema
//
//  One letter per application. The old template's [SWAP] zones are
//  fields here, so writing a new letter means filling a typed object
//  instead of hunting through markup.
//
//  Rules that carry over from the resumes:
//   - Voice guardrails: no em dashes, verb-led, no self-grading,
//     specificity over adjectives.
//   - Same claims discipline: anything here must be a subset of what
//     the resume and LinkedIn can back.
//   - One page, always. The measure fits roughly 420 words; past that,
//     cut, don't shrink.
//   - After every export, skim `pdftotext letter.pdf -`.
// ============================================================

export interface CoverLetter {
  /** Company name, used in the meta line and the PDF filename. */
  company: string
  /** The posting's exact role title. */
  roleTitle: string
  /** Display date, e.g. "July 14, 2026". */
  date: string
  /** Which resume track ships with this letter; drives the masthead role. */
  track: Track
  /** e.g. "Hi Headway team," */
  greeting: string
  /**
   * Body paragraphs. Keep the four-paragraph shape: thesis, proof,
   * differentiator, honest why. Tune 1 and 4 per company; 2 and 3 travel.
   */
  paragraphs: string[]
  /** Optional contact email override for the masthead. */
  email?: string
}

/**
 * A letter with its slug filled in. The slug always comes from the filename
 * (letters/new-relic.ts -> ?letter=new-relic), so the URL and the file can
 * never disagree. Don't author a slug by hand.
 */
export interface ResolvedCoverLetter extends CoverLetter {
  slug: string
}
