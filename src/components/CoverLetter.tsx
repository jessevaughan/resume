import { useEffect } from 'react'
import type { CoverLetter as CoverLetterData } from '../cover-letter-schema'
import type { Contact } from '../resume-schema'
import { Masthead } from './Masthead'
import { hyphenSafe } from './hyphenSafe'

// en-space · en-space, matching the meta line in my hand-built template.
const META_SEP = ' · '

export function CoverLetter({
  letter,
  name,
  role,
  contact,
}: {
  letter: CoverLetterData
  name: string
  role: string
  contact: Contact
}) {
  useEffect(() => {
    document.title = `${name} — Cover Letter`
    // The PDF script reads this to name the export per company.
    document.body.dataset.company = letter.company
    // Scopes the letter-only masthead variant (see letter.css). Same mechanism
    // as data-track, so the resume's header styles are left untouched.
    document.body.dataset.doc = 'letter'
    // Letters use the baseline tokens, as the original template did, so clear
    // any per-track spacing left on <body> by the resume view.
    delete document.body.dataset.track
    return () => {
      delete document.body.dataset.company
      delete document.body.dataset.doc
    }
  }, [name, letter.company])

  return (
    <>
      <Masthead name={name} role={role} contact={contact} />

      <main className="letter">
        <p className="letter-meta">
          {letter.date}
          {META_SEP}
          {letter.company} - {letter.roleTitle}
        </p>

        <p>{letter.greeting}</p>

        {letter.paragraphs.map((paragraph, i) => (
          <p key={i}>{hyphenSafe(paragraph)}</p>
        ))}

        <p className="signoff">
          <span className="name-line">{name}</span>
        </p>
      </main>
    </>
  )
}
