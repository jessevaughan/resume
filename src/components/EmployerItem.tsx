import type { ResolvedEmployer, ResolvedRole } from '../resume-schema'
import { hyphenSafe } from './hyphenSafe'

// ensp · ensp, matching the job-meta separator in my hand-built source.
const META_SEP = ' · '

function Note({ text }: { text: string }) {
  return <p className="job-note">{text}</p>
}

/**
 * The titles that only establish tenure, on one line. They carry the earliest
 * date, which is what makes the years-of-experience arithmetic come out right.
 */
function Earlier({ employer }: { employer: ResolvedEmployer }) {
  if (!employer.earlier) return null
  return (
    <p className="job-earlier">
      Earlier: {employer.earlier.map((role) => role.title).join('; ')}{' '}
      <span className="job-meta">{employer.earlierDates}</span>
    </p>
  )
}

/** Everything below a title: the note, the lede, and the bullets. */
function RoleBody({ role }: { role: ResolvedRole }) {
  return (
    <>
      {role.note?.placement === 'top' && <Note text={role.note.text} />}
      {role.lede && <p className="job-lede">{hyphenSafe(role.lede)}</p>}
      {role.bullets.length > 0 && (
        <ul className="job-list">
          {role.bullets.map((bullet, i) => (
            <li key={i}>{hyphenSafe(bullet)}</li>
          ))}
        </ul>
      )}
      {role.note?.placement === 'bottom' && <Note text={role.note.text} />}
    </>
  )
}

export function EmployerItem({ employer }: { employer: ResolvedEmployer }) {
  // A single role with nothing earlier keeps the original one-line shape.
  // Giving a four-month contract its own company heading spends two lines to
  // say what one already said.
  if (employer.single) {
    const role = employer.roles[0]
    return (
      <article className="job">
        <h3 className="job-title">
          {role.title}{' '}
          <span className="job-meta">
            {employer.company}
            {META_SEP}
            {role.dates}
          </span>
        </h3>
        <RoleBody role={role} />
        <Earlier employer={employer} />
      </article>
    )
  }

  return (
    <article className="job">
      <h3 className="employer">
        {employer.company} <span className="job-meta">{employer.dates}</span>
      </h3>
      {employer.roles.map((role, i) => (
        <div className="employer-role" key={i}>
          <h4 className="job-title">
            {role.title} <span className="job-meta">{role.dates}</span>
          </h4>
          <RoleBody role={role} />
        </div>
      ))}
      <Earlier employer={employer} />
    </article>
  )
}
