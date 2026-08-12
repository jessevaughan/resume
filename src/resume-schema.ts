// ============================================================
//  Resume schema — the PerTrack model
//
//  A "track" is one positioning of the resume. Most people want exactly one,
//  which is the default path: author plain values and never call perTrack().
//
//  This copy ships two that share a layout family but diverge bullet by
//  bullet — "creative" and "engineering" — which is what perTrack() is for.
//  Every field is authored once: either shared (a plain value) or split per
//  track (wrapped with perTrack()).
//  resolveResume(data, track) collapses the authoring shape into a flat
//  ResolvedResume the components render. Nothing in the component tree
//  knows about tracks; it only ever sees resolved values.
// ============================================================

import { TRACKS, type Track } from "./tracks";
export { TRACKS, DEFAULT_TRACK, type Track } from "./tracks";

/**
 * A value that differs by track. Tagged with `_perTrack` so resolve()
 * can distinguish it from a plain object of the same shape (e.g. a
 * SkillGroup) without guesswork. The per-track keys derive from Track, so
 * renaming a track in tracks.ts updates this type automatically.
 */
export type PerTrack<T> = { readonly [K in Track]: T } & {
  readonly _perTrack: true;
};

/**
 * Author a value that differs by track, in TRACKS order.
 *
 * Built from TRACKS rather than from a fixed pair, so the app works with one
 * track (the common case — two positionings is a personal choice, not a
 * requirement) and would work with three. Extra values are ignored; a short
 * list reuses its last value, so a single-track resume can call this or skip
 * it entirely and author plain values, which `resolve()` passes straight
 * through.
 */
export function perTrack<T>(...values: [T, ...T[]]): PerTrack<T> {
  const byTrack = Object.fromEntries(
    TRACKS.map((track, i) => [track, values[Math.min(i, values.length - 1)]]),
  ) as { readonly [K in Track]: T };
  return { ...byTrack, _perTrack: true };
}

/** An authored value: shared across tracks, or split with perTrack(). */
export type Tracked<T> = T | PerTrack<T>;

function isPerTrack<T>(value: Tracked<T>): value is PerTrack<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as PerTrack<T>)._perTrack === true
  );
}

/** Collapse one authored value down to the given track. */
export function resolve<T>(value: Tracked<T>, track: Track): T {
  return isPerTrack(value) ? value[track] : value;
}

// ---- authoring shape (what src/data/resume.ts fills in) ----

export interface Contact {
  /** Display text for the site, e.g. "jessevaughan.com". */
  site: string;
  /**
   * Where the site link actually points. Lets the printed text stay short
   * while the href carries the full canonical URL (www, https). Defaults to
   * https:// + `site` when omitted.
   */
  siteUrl?: string;
  email: string;
  phone: string;
  /** Optional display text, e.g. "in/jessesvaughan". */
  linkedin?: string;
  /**
   * Where the LinkedIn link points. Same display/href split as siteUrl, so the
   * printed text can be short while the href stays a real profile URL.
   * Defaults to https:// + `linkedin` when omitted.
   */
  linkedinUrl?: string;
  location: string;
}

/** Values are stored bare ("jessevaughan.com"), so add a scheme for the href. */
const withScheme = (value: string) =>
  /^https?:\/\//.test(value) ? value : `https://${value}`;

/**
 * Where the site link points. `siteUrl` wins when set; otherwise the bare
 * `site` value gets a scheme. Every consumer goes through this so the
 * fallback documented on Contact.siteUrl lives in exactly one place.
 */
export const siteHref = (contact: Contact) =>
  contact.siteUrl ?? withScheme(contact.site);

/**
 * Same display/href split for LinkedIn. Unlike `site`, the display value is
 * itself optional, so this returns undefined when there's no profile to point
 * at — the case Masthead already guards on before rendering the link.
 */
export const linkedinHref = (contact: Contact) =>
  contact.linkedinUrl ??
  (contact.linkedin ? withScheme(contact.linkedin) : undefined);

/**
 * The "Functional title. Title of record is Senior Manager, Creative."
 * disclaimer. The text is identical across tracks; only where I place it
 * relative to the bullets differs — above them on Track A, below them
 * on Track B. That divergence is placement, not copy, so it lives here.
 */
export interface JobNote {
  text: string;
  placement: Tracked<"top" | "bottom">;
}

/**
 * A point on a role's timeline. Dates are authored structurally, never as free
 * text, so every artifact renders one format. Mixed formats ("Jan 2019",
 * "2019-01", "January '19") make an ATS miscalculate total experience.
 */
export interface YearMonth {
  year: number;
  /** 1-12. */
  month: number;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "Feb 2022". */
export const formatMonth = (at: YearMonth) =>
  `${MONTHS[at.month - 1]} ${at.year}`;

/**
 * "Feb 2022 – Jun 2026". `dash` is a parameter because the site and PDF want
 * the en dash the rest of the design uses, while the .docx upload copy takes a
 * plain hyphen — the form ATS date parsers are built around.
 */
export function formatRange(
  start: YearMonth,
  end: YearMonth | "present",
  dash = "–",
): string {
  const to = end === "present" ? "Present" : formatMonth(end);
  return `${formatMonth(start)} ${dash} ${to}`;
}

export interface Role {
  /** Title of record line. Diverges only on the earliest (IC) role. */
  title: Tracked<string>;
  start: YearMonth;
  /** "present" for a current role. */
  end: YearMonth | "present";
  /** One-line role framing. Only the current role carries one. */
  lede?: Tracked<string>;
  note?: JobNote;
  /** On engineering I leave some roles title-only, hence a possibly empty list. */
  bullets: Tracked<string[]>;
}

/**
 * A title that only establishes tenure. It counts toward the employer's date
 * span but renders as one compressed line instead of spending a block each —
 * the early Visual Data Systems roles are what keep the earliest date at 2009,
 * which is what makes "sixteen years" true to a parser doing the arithmetic.
 */
export interface EarlierRole {
  title: string;
  start: YearMonth;
  end: YearMonth | "present";
}

/**
 * One employer, with its roles newest first. Internal promotions group under a
 * single company rather than reading as separate jobs: it's the shape ATS
 * parsers expect, and five AdRoll entries in a row scan as job-hopping.
 */
export interface Employer {
  company: string;
  roles: Role[];
  earlier?: EarlierRole[];
}

export interface SkillGroup {
  heading: string;
  /** Rendered joined by a middot; I keep it structured so it stays typed. */
  items: string[];
}

export interface Education {
  degree: string;
  focus: string;
  school: string;
}

/**
 * An award or a placement on a shortlist. `level` is its own field rather than
 * part of a display string, because it's the part that changes when a
 * shortlist resolves. "Finalist" becomes "Silver" and no punctuation moves.
 * `project` is optional because only the .docx prints it; in the app the
 * sidebar sits beside the experience that already names the work.
 */
export interface Recognition {
  program: string;
  level: string;
  category: string;
  project?: string;
}

export interface ResumeData {
  name: string;
  role: Tracked<string>;
  contact: Contact;
  summary: Tracked<string>;
  highlights: Tracked<string[]>;
  experience: Employer[];
  skills: {
    heading: Tracked<string>;
    groups: Tracked<SkillGroup[]>;
  };
  education: Education;
  /**
   * Optional in the authoring shape, since a resume with nothing to list
   * shouldn't have to author an empty array and the template ships without
   * one. Resolves to [] so components test length instead of existence.
   */
  recognition?: Tracked<Recognition[]>;
}

// ---- resolved shape (what components consume) ----

export interface ResolvedRole {
  title: string;
  start: YearMonth;
  end: YearMonth | "present";
  /** Preformatted with the display dash, so components stay presentational. */
  dates: string;
  lede?: string;
  note?: { text: string; placement: "top" | "bottom" };
  bullets: string[];
}

export interface ResolvedEarlierRole {
  title: string;
  start: YearMonth;
  end: YearMonth | "present";
  dates: string;
}

export interface ResolvedEmployer {
  company: string;
  /** Full span across every role, earlier ones included. */
  dates: string;
  start: YearMonth;
  end: YearMonth | "present";
  roles: ResolvedRole[];
  earlier?: ResolvedEarlierRole[];
  /** Span across the earlier titles alone, e.g. "Dec 2009 – Jan 2011". */
  earlierDates?: string;
  /**
   * True when there's one role and nothing earlier, so the renderer can
   * collapse company and title onto a single line and not spend a heading on
   * a four-month contract.
   */
  single: boolean;
}

export interface ResolvedResume {
  track: Track;
  name: string;
  role: string;
  /** Browser <title>, e.g. "Jesse Vaughan — Design Engineer · Web Architect". */
  documentTitle: string;
  contact: Contact;
  summary: string;
  highlights: string[];
  experience: ResolvedEmployer[];
  skills: {
    heading: string;
    groups: SkillGroup[];
  };
  education: Education;
  recognition: Recognition[];
}

/** Sortable key, so span math never parses a formatted string. */
const ordinal = (at: YearMonth) => at.year * 12 + at.month;
const isPresent = (at: YearMonth | "present"): at is "present" =>
  at === "present";

/** Collapse the full authoring model down to a single track. */
export function resolveResume(data: ResumeData, track: Track): ResolvedResume {
  const role = resolve(data.role, track);
  return {
    track,
    name: data.name,
    role,
    documentTitle: `${data.name} — ${role}`,
    contact: data.contact,
    summary: resolve(data.summary, track),
    highlights: resolve(data.highlights, track),
    experience: data.experience.map((employer) => {
      const spans = [...employer.roles, ...(employer.earlier ?? [])];
      const start = spans.reduce((earliest, at) =>
        ordinal(at.start) < ordinal(earliest.start) ? at : earliest,
      ).start;
      // "present" outranks any dated end.
      const end = spans.some((at) => isPresent(at.end))
        ? ("present" as const)
        : spans.reduce((latest, at) =>
            ordinal(at.end as YearMonth) > ordinal(latest.end as YearMonth)
              ? at
              : latest,
          ).end;

      return {
        company: employer.company,
        start,
        end,
        dates: formatRange(start, end),
        single: employer.roles.length === 1,
        earlier: employer.earlier?.map((role) => ({
          ...role,
          dates: formatRange(role.start, role.end),
        })),
        earlierDates: employer.earlier?.length
          ? formatRange(
              employer.earlier.reduce((a, b) =>
                ordinal(a.start) < ordinal(b.start) ? a : b,
              ).start,
              employer.earlier.reduce((a, b) =>
                ordinal(a.end as YearMonth) > ordinal(b.end as YearMonth)
                  ? a
                  : b,
              ).end,
            )
          : undefined,
        roles: employer.roles.map((role) => ({
          title: resolve(role.title, track),
          start: role.start,
          end: role.end,
          dates: formatRange(role.start, role.end),
          lede: role.lede === undefined ? undefined : resolve(role.lede, track),
          note:
            role.note === undefined
              ? undefined
              : {
                  text: role.note.text,
                  placement: resolve(role.note.placement, track),
                },
          bullets: resolve(role.bullets, track),
        })),
      };
    }),
    skills: {
      heading: resolve(data.skills.heading, track),
      groups: resolve(data.skills.groups, track),
    },
    education: data.education,
    recognition:
      data.recognition === undefined ? [] : resolve(data.recognition, track),
  };
}
