import { useEffect } from 'react'
import type { ResolvedResume } from '../resume-schema'
import { Masthead } from './Masthead'
import { Section } from './Section'
import { EmployerItem } from './EmployerItem'
import { SkillGroup } from './SkillGroup'
import { hyphenSafe } from './hyphenSafe'

// I keep markup order header > summary > highlights > experience > skills >
// education so a PDF text extractor reads it logically. I place the sidebar
// left with CSS grid, not markup order.
export function Resume({ resume }: { resume: ResolvedResume }) {
  useEffect(() => {
    document.title = resume.documentTitle
    // I set it on <body> so per-track token overrides cascade to body
    // padding and line-height, not just the grid subtree.
    document.body.dataset.track = resume.track
  }, [resume.documentTitle, resume.track])

  return (
    <>
      <Masthead name={resume.name} role={resume.role} contact={resume.contact} />

      <div className="page-grid">
        <main className="main">
          <Section title="Summary">
            <p className="intro">{hyphenSafe(resume.summary)}</p>
          </Section>

          <Section title="Career Highlights">
            <ul>
              {resume.highlights.map((item, i) => (
                <li key={i}>{hyphenSafe(item)}</li>
              ))}
            </ul>
          </Section>

          <Section title="Experience">
            {resume.experience.map((employer, i) => (
              <EmployerItem key={i} employer={employer} />
            ))}
          </Section>
        </main>

        <aside className="sidebar">
          <Section title={resume.skills.heading}>
            {resume.skills.groups.map((group, i) => (
              <SkillGroup key={i} group={group} />
            ))}
          </Section>

          <Section title="Education">
            <div className="skill-group">
              <h3>{resume.education.degree}</h3>
              <p>{resume.education.focus}</p>
              <p>{resume.education.school}</p>
            </div>
          </Section>
        </aside>
      </div>
    </>
  )
}
