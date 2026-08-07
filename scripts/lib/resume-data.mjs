// Load the authored TypeScript resume data from a plain Node script.
//
// The data is TypeScript with extensionless imports, so Node can't import it
// directly. rolldown is already a dependency (vite 8 builds with it), so bundle
// to memory rather than adding a transpiler or duplicating the data into JSON
// that would drift.

import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { rolldown } from "rolldown";

export const root = resolve(
  fileURLToPath(new URL("..", import.meta.url)),
  "..",
);

async function importBundle(options) {
  const bundle = await rolldown({ logLevel: "silent", ...options });
  const { output } = await bundle.generate({ format: "esm" });
  const b64 = Buffer.from(output[0].code).toString("base64");
  return import(`data:text/javascript;base64,${b64}`);
}

/** `{ resume, resolveResume, formatRange, TRACKS }` from src/. */
export function loadResumeModule() {
  const entry = "\0resume-entry";
  return importBundle({
    input: entry,
    plugins: [
      {
        name: "resume-entry",
        resolveId: (id) => (id === entry ? id : null),
        load: (id) =>
          id === entry
            ? [
                `export { resume } from ${JSON.stringify(join(root, "src/data/resume.ts"))}`,
                `export { resolveResume, formatRange } from ${JSON.stringify(join(root, "src/resume-schema.ts"))}`,
                `export { TRACKS } from ${JSON.stringify(join(root, "src/tracks.ts"))}`,
              ].join("\n")
            : null,
      },
    ],
  });
}

/** One application's letter file, for its exact role title and track. */
function loadLetter(slug) {
  return importBundle({ input: join(root, "src/data/letters", `${slug}.ts`) });
}

/** The letter slugs that actually exist, sorted. Empty if the dir is absent. */
export async function letterSlugs() {
  const files = await readdir(join(root, "src/data/letters")).catch(() => []);
  return files
    .filter((file) => file.endsWith(".ts"))
    .map((file) => file.replace(/\.ts$/, ""))
    .sort();
}

/**
 * The letter for a slug, or null when there isn't one yet. Checked by name
 * first: an absent file otherwise surfaces as a rolldown UNRESOLVED_ENTRY
 * stack, which buries the one thing you need to know. Callers that can work
 * without a letter (checking a posting before you've written one) treat null
 * as fine; callers that can't turn it into a real message.
 */
export async function tryLoadLetter(slug) {
  const slugs = await letterSlugs();
  if (!slugs.includes(slug)) return null;
  const { letter } = await loadLetter(slug);
  return letter;
}

/**
 * Every phrase on the resume, as one lowercase blob. This is what a recruiter's
 * keyword search actually sees, so coverage is measured against it rather than
 * against the authored fields.
 */
export function resumeCorpus(resolved, roleTitle = resolved.role) {
  const parts = [resolved.name, roleTitle, resolved.summary, ...resolved.highlights];
  for (const employer of resolved.experience) {
    parts.push(employer.company);
    for (const role of employer.roles) {
      parts.push(role.title, role.lede ?? "", role.note?.text ?? "", ...role.bullets);
    }
    for (const role of employer.earlier ?? []) parts.push(role.title);
  }
  for (const group of resolved.skills.groups) {
    parts.push(group.heading, ...group.items);
  }
  const { degree, focus, school } = resolved.education;
  parts.push(degree, focus, school);
  return parts.join("\n").toLowerCase();
}
