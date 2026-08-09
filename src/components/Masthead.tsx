import { Fragment, type ReactNode } from "react";
import { siteHref, linkedinHref, type Contact } from "../resume-schema";

// Middot, spaced. Plain spaces on both sides so pdftotext still sees word gaps.
const CONTACT_SEP = " · ";

/**
 * External links open in a new tab so a recruiter reading the web version
 * doesn't lose the resume. Not applied to mailto: — handing that to a new tab
 * just leaves an empty window behind once the mail client takes over.
 * (Irrelevant in the PDF, where a link is only ever a /URI annotation.)
 */
const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

export function Masthead({
  name,
  role,
  contact,
}: {
  name: string;
  role: string;
  contact: Contact;
}) {
  // The visible text is unchanged; the site, email, and LinkedIn are wrapped in
  // anchors so they're clickable on the web and in the PDF (Chrome turns them
  // into link annotations). Styling keeps them looking like plain text.
  // linkedin is optional, so the line closes up cleanly when it isn't set.
  const parts: { key: string; node: ReactNode }[] = [
    {
      key: "site",
      node: (
        <a href={siteHref(contact)} {...EXTERNAL}>
          {contact.site}
        </a>
      ),
    },
    ...(contact.linkedin
      ? [
          {
            key: "linkedin",
            node: (
              <a href={linkedinHref(contact)} {...EXTERNAL}>
                {contact.linkedin}
              </a>
            ),
          },
        ]
      : []),
    {
      key: "email",
      node: <a href={`mailto:${contact.email}`}>{contact.email}</a>,
    },
    { key: "phone", node: contact.phone },
    { key: "location", node: contact.location },
  ];

  return (
    <header className="masthead">
      <img className="avatar" src="/avatar-plated.png" alt="" />
      <div className="masthead-row">
        <h1 className="name">{name}</h1>
        <p className="role">{role}</p>
      </div>
      <p className="contact">
        {parts.map((part, i) => (
          <Fragment key={part.key}>
            {i > 0 && CONTACT_SEP}
            {part.node}
          </Fragment>
        ))}
      </p>
    </header>
  );
}
