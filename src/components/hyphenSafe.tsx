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
 *
 * Only hyphenated words get a span, and everything between them is coalesced
 * into one string. That matters as much as the wrapping does: React renders
 * each returned element as its own DOM text node, Chrome emits one PDF text
 * run per node, and a parser that re-infers word breaks from x-gaps drops the
 * whitespace-only runs — so returning a node per word turned the summary into
 * "Sixteenyearsacrossbrand". Keeping the prose contiguous keeps real space
 * characters inside the run, where nothing has to guess at them.
 */
export function hyphenSafe(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  // Split on whitespace runs, keeping them, so the text reassembles exactly.
  const chunks = text.split(/(\s+)/)
  let prose = ''

  for (const chunk of chunks) {
    if (!chunk.includes('-')) {
      prose += chunk
      continue
    }
    if (prose) {
      nodes.push(prose)
      prose = ''
    }
    nodes.push(
      <span key={nodes.length} className="nowrap">
        {chunk}
      </span>,
    )
  }
  if (prose) nodes.push(prose)

  return nodes
}
