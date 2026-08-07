---
name: resume-tailor
description: Tailor the resume's wording to a specific job posting by filling in that application's tailored/<slug>.txt override file, working through the keyword report's partial matches one at a time. Use when asked to tailor, optimize, or adapt the resume for a posting or company.
---

# Tailoring the resume to one posting

Instructions for a coding agent.
The work is filling in `tailored/<slug>.txt`, the per-application override file, from the **partial matches** in `npm run keywords -- <slug>`, where the resume already has the substance and the posting uses different words.

You can also just follow this yourself; it's a checklist, not magic.

## using it with your agent

This file is plain markdown with a small YAML header, so most agents can take it as-is.
Pick whichever fits yours:

- **Point at the file.** "Follow the instructions in RESUME-TAILOR.md for the okta posting." Works with anything that can read a repo file.
- **Paste it.** Drop the contents into the chat with the slug you're working on.
  Nothing here depends on the file living at a particular path.
- **Install it as a reusable command.** Agents that support project-local instructions read them from a directory of their own, so check yours for the path and drop a copy there:

  ```bash
  cp RESUME-TAILOR.md <your-agent's-instructions-dir>/resume-tailor.md
  ```

  The YAML header above is the metadata those formats want: a name, and a description of when the instructions apply.
  Agents that don't read it ignore it.
  Keep that directory out of the repo, whether by ignoring it or just never staging it.

## two rules that don't bend

**Never edit `src/data/resume.ts`.**
That file is the core resume and stays canonical.
Everything application-specific goes in `tailored/<slug>.txt`, which layers on at render time.
That's what makes tailoring reversible: deleting one file reverts the application completely.

**Propose, never batch-apply.**
Every reword is shown as a before/after and approved individually.
The failure mode is quiet: a resume that scores well and no longer sounds like the person who wrote it.
Don't offer a "just apply them all" option.

## steps

### 1. read the current state

```bash
npm run keywords -- <slug>
```

If the posting is missing or malformed the command says so and prints the required format; relay that and stop.
Note the **Top-10** number, which is the before figure.

### 2. scaffold the file

```bash
npm run keywords -- <slug> --write
```

This writes `tailored/<slug>.txt` with every suggestion commented out and inert.
If the file already exists, read it first and preserve what's there.
The user may have hand-edited it, and their edits win over your suggestions.

### 3. filter the partials hard

Most partials aren't worth acting on.
Keep one only if **all** of these hold:

- It appears **2 or more times** in the posting.
  Single-occurrence phrases are that posting's marketing voice, not vocabulary the field uses.
- It's a **concrete noun or skill**, like "digital design" or "event marketing".
  Never an adjective or a self-assessment.
  Terms like "extraordinary digital design skills" are disqualified outright: the voice rules for this resume are *no self-grading, specificity over adjectives* (see the header of `src/cover-letter-schema.ts`).
- The resume text it would replace **already means this**.
  If adopting the phrase changes what's being claimed, drop it.

Say how many you filtered out and why.
Proposing 4 of 46 is correct; proposing 40 is not.

### 4. propose each pair, one at a time

For each survivor, find the exact phrase in the resume it should replace.
Show the posting's term and its count, the current resume wording (the `-` side), the proposed wording (the `+` side), and one line on why it's the same claim in different words.

Then ask.
Write approved pairs into `tailored/<slug>.txt`; drop rejected ones without argument.
If no phrase is a natural home for a term, say so and move on rather than forcing it.

Both sides are **literal text, replaced everywhere they appear**.
Prefer a distinctive phrase over a common word: replacing "design" would hit every occurrence on the resume.

### 5. the title is the user's call

The file's `title:` line carries the posting's exact title in the header for this application only.
Recruiters do filter on titles, but a header that doesn't match someone's title of record can read as a stretch, and Work Experience shows real titles either way.
**Offer it, explain both sides, never assume.**

### 6. verify in both directions

```bash
npm run docx
```

The run reports how many rewords landed and flags any whose `-` side isn't in the resume.
**A pair reported as unmatched did not apply.**
Fix it or drop it, never leave it.

Then re-run the keyword check and give the before/after Top-10 number.
If it didn't move, say so plainly.

Page fit only matters for the PDF, which tailoring never touches.
If the user asks for a tailored PDF, run `npm run pdf` and check both tracks with `pdfinfo`, since the creative track is the binding one-page constraint.

### 7. report

What you added, what you skipped and why, the coverage delta, and the reminder that `rm tailored/<slug>.txt` reverts everything.

## scope

- Write only `tailored/<slug>.txt`.
  Never the core resume, the schema, the components, or the scripts.
- Never add a skill, tool, or claim the resume doesn't already support.
- Never edit a cover letter here; `npm run letter -- <slug>` owns those.
- **Never change the role line.**
  Carrying a posting's job title in the header is a deliberate call the user makes, weighing a search benefit against a header that may not match their title of record.
  It isn't part of a wording pass, and nothing should fold it in quietly.
