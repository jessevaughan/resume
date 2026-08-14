import type { SkillGroup as SkillGroupData } from '../resume-schema'
import { hyphenSafe } from './hyphenSafe'

// NBSP · space, matching the skill-group separator in my hand-built source.
// The leading space is non-breaking so the middot stays with the item it
// follows; the trailing space is the only break opportunity, which keeps a
// wrapped line from opening on a separator. Presentation only — the docx
// joins the raw items with commas and never sees this.
const SKILL_SEP = '\u00A0· '

export function SkillGroup({ group }: { group: SkillGroupData }) {
  return (
    <div className="skill-group">
      <h3>{group.heading}</h3>
      <p>{hyphenSafe(group.items.join(SKILL_SEP))}</p>
    </div>
  )
}
