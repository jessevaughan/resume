import { resolveResume } from './resume-schema'
import { resume } from './data/resume'
import { letters } from '@letters'
import { Resume } from './components/Resume'
import { CoverLetter } from './components/CoverLetter'
import { TrackSwitcher } from './components/TrackSwitcher'
import { useTrack } from './useTrack'

function App() {
  const [track, setTrack] = useTrack()

  // ?letter=headway renders a cover letter instead of the resume. Letters are
  // local-only: the production build ships an empty registry, so an unknown
  // slug just falls back to the resume rather than erroring.
  const slug = new URLSearchParams(window.location.search).get('letter')
  const letter = slug ? letters.find((l) => l.slug === slug) : undefined

  if (letter) {
    const resolved = resolveResume(resume, letter.track)
    const contact = letter.email
      ? { ...resolved.contact, email: letter.email }
      : resolved.contact
    return (
      <CoverLetter
        letter={letter}
        name={resolved.name}
        role={resolved.role}
        contact={contact}
      />
    )
  }

  return (
    <>
      <TrackSwitcher track={track} onChange={setTrack} />
      <Resume resume={resolveResume(resume, track)} />
    </>
  )
}

export default App
