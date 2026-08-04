import { resolveResume, siteHref } from "./resume-schema";
import { resume } from "./data/resume";
import { letters } from "@letters";
import { Resume } from "./components/Resume";
import { CoverLetter } from "./components/CoverLetter";
import { Toolbar } from "./components/Toolbar";
import { useTrack } from "./useTrack";
import { useDocumentMeta } from "./useDocumentMeta";

function App() {
  const [track, setTrack] = useTrack();
  const resolved = resolveResume(resume, track);

  useDocumentMeta({
    track,
    documentTitle: resolved.documentTitle,
    summary: resolved.summary,
  });

  // ?letter=headway renders a cover letter instead of the resume. Letters are
  // local-only: the production build ships an empty registry, so an unknown
  // slug just falls back to the resume rather than erroring.
  const slug = new URLSearchParams(window.location.search).get("letter");
  const letter = slug ? letters.find((l) => l.slug === slug) : undefined;

  if (letter) {
    const forLetter = resolveResume(resume, letter.track);
    const contact = letter.email
      ? { ...forLetter.contact, email: letter.email }
      : forLetter.contact;
    return (
      <CoverLetter
        letter={letter}
        name={forLetter.name}
        role={forLetter.role}
        contact={contact}
      />
    );
  }

  return (
    <>
      <Toolbar
        track={track}
        onChange={setTrack}
        portfolioUrl={siteHref(resolved.contact)}
      />
      <Resume resume={resolved} />
    </>
  );
}

export default App;
