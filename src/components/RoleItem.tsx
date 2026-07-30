import type { ResolvedJob } from '../resume-schema'
import { hyphenSafe } from './hyphenSafe'

// ensp · ensp, matching the job-meta separator in my hand-built source.
const META_SEP = ' · '

function Note({ text }: { text: string }) {
  return <p className="job-note">{text}</p>
}

export function RoleItem({ job }: { job: ResolvedJob }) {
  const noteOnTop = job.note?.placement === 'top'
  const noteOnBottom = job.note?.placement === 'bottom'
  return (
    <article className="job">
      <h3 className="job-title">
        {job.title}{' '}
        <span className="job-meta">
          {job.company}
          {META_SEP}
          {job.dates}
        </span>
      </h3>
      {noteOnTop && job.note && <Note text={job.note.text} />}
      {job.lede && <p className="job-lede">{hyphenSafe(job.lede)}</p>}
      {job.bullets.length > 0 && (
        <ul className="job-list">
          {job.bullets.map((bullet, i) => (
            <li key={i}>{hyphenSafe(bullet)}</li>
          ))}
        </ul>
      )}
      {noteOnBottom && job.note && <Note text={job.note.text} />}
    </article>
  )
}
