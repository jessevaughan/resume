import type { SkillGroup as SkillGroupData } from '../resume-schema'
import { hyphenSafe } from './hyphenSafe'

// space · space, matching the skill-group separator in my hand-built source.
const SKILL_SEP = ' · '

export function SkillGroup({ group }: { group: SkillGroupData }) {
  return (
    <div className="skill-group">
      <h3>{group.heading}</h3>
      <p>{hyphenSafe(group.items.join(SKILL_SEP))}</p>
    </div>
  )
}
