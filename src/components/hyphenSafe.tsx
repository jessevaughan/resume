import type { ReactNode } from 'react'

/**
 * Keep hyphenated terms from breaking across lines.
 *
 * When a line wraps at a hyphen, some PDF text extractors read the trailing
 * hyphen as word-hyphenation and delete it: "AI-assisted" came out of the
 * skills column as "AIassisted", which an ATS searching for "AI-assisted"
 * would miss entirely.
 *
 * The obvious fix, a non-breaking hyphen (U+2011), trades one problem for
 * another: it stops the wrap but is no longer the character an ATS searches
 * for. So the text keeps a standard hyphen-minus and CSS does the work.
 */
export function hyphenSafe(text: string): ReactNode[] {
  // Split on whitespace runs, keeping them, so the text reassembles exactly.
  return text.split(/(\s+)/).map((chunk, i) =>
    chunk.includes('-') ? (
      <span key={i} className="nowrap">
        {chunk}
      </span>
    ) : (
      chunk
    ),
  )
}
