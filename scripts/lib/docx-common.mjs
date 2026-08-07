// Shared .docx primitives for the resume and cover-letter generators.
//
// Both documents follow the same rules: single column, no tables, no images,
// and no Word header/footer. Most ATS ignore header/footer content outright,
// so anything that matters goes in the body.

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { Document, Packer, Paragraph, TextRun } from "docx";

/** Ubiquitous and metrically boring. A font the ATS host may not have is a
 *  needless parsing variable; the brand face lives in the PDF. */
const FONT = "Calibri";

export const text = (value, opts = {}) =>
  new TextRun({ text: value, font: FONT, ...opts });

export const body = (runs, opts = {}) =>
  new Paragraph({ children: runs, spacing: { after: 100 }, ...opts });

/** Filename-safe slug, matching the PDF naming convention. */
export const slugify = (value) =>
  value
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/**
 * Contact details as one line. URLs are spelled out rather than using the
 * site's short display forms: "in/jessesvaughan" is a design abbreviation,
 * "linkedin.com/in/jessesvaughan" is what a parser recognises as a profile.
 */
export function contactLine(contact, { email } = {}) {
  const parts = [contact.site];
  if (contact.linkedin) {
    parts.push(
      contact.linkedin.startsWith("in/")
        ? `linkedin.com/${contact.linkedin}`
        : contact.linkedin,
    );
  }
  parts.push(email ?? contact.email, contact.phone, contact.location);
  return parts.join("  |  ");
}

/**
 * Letter-size, no header or footer, one-inch margins (1440 twips).
 *
 * One inch rather than a half: the only reason to crowd the margins is fitting
 * more per page, and page count doesn't apply here (below). Half-inch margins
 * set a 7.5in measure, about 108 characters a line at this size, well past
 * the 45-90 that reads comfortably. An inch brings it to roughly 94 and makes
 * the file look like a normal Word document to whoever opens it.
 *
 * There is no page-count check anywhere for the .docx, on purpose: a .docx has
 * no pages until something lays it out, and Word, Google Docs, and each ATS
 * preview paginate it differently depending on which fonts they have. Any
 * count this pipeline produced would be one renderer's guess dressed up as a
 * fact. Page fit is a PDF concern; see scripts/pdf.mjs.
 */
export const makeDocument = (children) =>
  new Document({
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: [
      {
        properties: {
          page: {
            // US Letter, stated explicitly: the docx library defaults to A4,
            // which silently hands a US applicant a European page size.
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children,
      },
    ],
  });

export async function writeDocx(doc, dir, filename) {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), await Packer.toBuffer(doc));
  return filename;
}
