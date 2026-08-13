import { perTrack, type ResumeData } from "../resume-schema";

export const resume: ResumeData = {
  name: "Jesse Vaughan",

  role: perTrack(
    "Creative & Brand Leader",
    "Creative Technologist · Web Architect",
  ),

  contact: {
    site: "jessevaughan.com",
    siteUrl: "https://www.jessevaughan.com",
    email: "hello@jessevaughan.com",
    phone: "410-707-4274",
    linkedin: "in/jessesvaughan",
    linkedinUrl: "https://www.linkedin.com/in/jessesvaughan",
    location: "Joshua Tree, CA",
  },

  summary: perTrack(
    // creative
    `Sixteen years across brand, web, and campaigns, the last nine-plus in creative leadership for a global SaaS marketing org. I've built and led distributed teams and run creative through three company-wide brand transformations. That work runs on a design and development background I still use daily, from the martech stack to the website itself.`,
    // engineering
    `Creative technologist and web architect with sixteen years building production web properties end to end, plus the tooling the teams behind them run on, across frontend, CMS architecture and migration, localization, and the infrastructure underneath. I owned AdRoll's site for twelve years and led creative for its marketing org, so the tooling I built solved problems I was also accountable for, and I can defend the technical direction to people who don't write code.`,
  ),

  highlights: perTrack(
    // creative
    [
      `Led creative through three company-wide brand transformations, including a 2018 rebrand developed with the CEO and C-suite, a 2019 refresh and website rebuild, and the 2025 consolidation of two brands into one. Credited as Creative Director on the 2019 and 2025 work. Defined the visual and messaging systems marketing ran on.`,
      `Led creative direction on #DareToGrow, a brand campaign with fifteen documentary-style customer videos and over 170 assets across ten channels. It ran during a period when the company saw +65% account signups and +95% site traffic, measured 35 days after launch against the 35 days prior, with per-account spend flat.`,
      `Promoted from web designer to Head of Creative across twelve years at AdRoll, and stayed hands-on in the web platform I architected and owned.`,
    ],
    // engineering
    [
      `Built a Claude Code workflow that converted hardcoded template sections into CMS-editable entries and retired a standing copy/paste ticket queue, plus a set of skills carrying brand voice into the team's AI assistants with standards for where AI belonged.`,
      `Designed three companies' websites and built two, Selectica on ExpressionEngine in 2013 and AdRoll on Statamic in 2015–16. Statamic was my call at OneLogin, where I designed the site and oversaw the build, so AdRoll ran on a platform I'd chosen. AdRoll's only web designer and developer until 2017.`,
      `Argued for the rebuild from inside the growth team, pitches and justifications included, then migrated AdRoll from Drupal/Pantheon to a flat-file Statamic build in 2015–16. Owned the content model, the editorial system, and localization into ten locales across seven regions via Smartling. Cut hosting and deploy costs 80%, to $3,600 a year.`,
      `Owned the production web stack, from Fastly, Cloudflare, DigitalOcean, and Laravel Forge through provisioning, scaling, server upgrades, and CI/CD on GitHub Actions.`,
    ],
  ),

  experience: [
    {
      company: "AdRoll (NextRoll)",
      roles: [
        {
          title: "Head of Creative - Marketing",
          start: { year: 2022, month: 2 },
          end: { year: 2026, month: 8 },
          lede: perTrack(
            // creative
            ``,
            // engineering
            // none
            ``,
          ),
          // It was dumb to keep these different so temporarily placing them in the same place before re-wiring
          note: {
            text: "Functional title. Title of record is Senior Manager, Creative.",
            placement: perTrack("top", "top"),
          },
          bullets: perTrack(
            // creative
            [
              `Directed the 2025 consolidation of AdRoll and RollWorks into a single brand, from the Organic Intelligence brand mood through brand architecture, messaging systems, and a full site migration. The guidelines became the company's source of truth for brand decisions.`,
              `Grew a distributed creative team of up to seven across the US, spanning design, web, video, and copy.`,
              `Set creative strategy with the CMO, VP of Marketing, and brand leadership.`,
              `Built an AI-assisted workflow with Claude Code to turn templated site sections into CMS-editable entries. It retired a standing copy/paste ticket queue and moved routine edits to self-serve.`,
              `Wrote AI skills carrying the brand voice for the team, and set standards for where AI belonged.`,
              `Founding board member of RollAsia (2018–2026), the company's Asian and Pacific Islander employee resource group. Organized and hosted company-wide programming and speaker events.`,
            ],
            // engineering
            [
              `Ran adroll.com on a flat-file Statamic build with page templates, reusable modules, and an editorial system that let marketing ship edits without engineering. Two outages in twelve years.`,
              `Led the site migration behind the 2025 AdRoll–RollWorks brand consolidation, porting RollWorks content into the existing adroll.com build and retiring rollworks.com to a redirect.`,
              `Responded to a DDoS in 2024 alongside security and devops, scaling servers to absorb the flood before they blocked the offending IP ranges. Then built a standing bot blocklist into Fastly with the same team.`,
              `Hired web designers and developers for day-to-day site work; kept platform ownership and my hands in the code.`,
            ],
          ),
        },
        {
          title: "Manager II, Creative - Marketing",
          start: { year: 2020, month: 2 },
          end: { year: 2022, month: 1 },
          bullets: perTrack(
            // creative
            [
              `Designed the team's creative review and critique system, and kept brand expression consistent across marketing.`,
            ],
            // engineering
            [
              `Maintained and evolved the core Statamic build and web design system, and set the front-end standard for the team, while directing creative. Oversaw three sites across the two businesses after the 2018 brand split.`,
            ],
          ),
        },
        {
          title: "Manager, Creative - Marketing",
          start: { year: 2018, month: 2 },
          end: { year: 2020, month: 1 },
          bullets: perTrack(
            // creative
            [
              `Inherited the full creative team in late 2017 when the head of creative departed, then led direction across design, web, video, and copy as hiring manager.`,
              `Mentored a graphic designer into web development. After the 2018 split they took the RollWorks site independently and built a UI/UX career from it.`,
            ],
            // engineering
            [
              `Inherited the full creative team in late 2017 while continuing to own the web build. Mentored a graphic designer into web development, and after the split they took the RollWorks site on their own.`,
              `Led the 2019 refresh and site rebuild as Creative Director, with the page builds moved in-house onto the Statamic build. Six agency-built pages had taken about ten weeks; fourteen in-house pages took about five.`,
            ],
          ),
        },
        {
          title: "Team Lead, Web Design - Marketing",
          start: { year: 2017, month: 2 },
          end: { year: 2018, month: 1 },
          // Creative is the space-constrained track at one page, so this role goes
          // title-only there (its neighbors already are). Engineering has the room
          // and keeps the line.
          bullets: perTrack(
            [],
            [
              "First direct report while still owning the web platform hands-on.",
            ],
          ),
        },
        // The early IC years, split into real dated entries rather than one
        // lumped "Earlier" block. Titles are the ones on LinkedIn. Kept
        // title-only: the substance (the Statamic/ExpressionEngine rebuilds, the
        // Drupal migration, Smartling) already lives in Career Highlights, so
        // bullets here would just duplicate it.
        {
          title: "Web Designer - Marketing",
          // Months here (and on OneLogin below) disambiguate the Nov 2014 handoff
          // so the two don't both read as a bare, overlapping "2014".
          start: { year: 2014, month: 11 },
          end: { year: 2017, month: 1 },
          bullets: perTrack([], []),
        },
      ],
    },
    {
      company: "OneLogin",
      roles: [
        {
          title: "Web Developer & Designer - Marketing",
          start: { year: 2014, month: 1 },
          end: { year: 2014, month: 11 },
          bullets: perTrack([], []),
        },
      ],
    },
    {
      company: "Selectica",
      roles: [
        {
          title: "Web Developer & Designer - Marketing",
          start: { year: 2013, month: 3 },
          end: { year: 2013, month: 12 },
          bullets: perTrack([], []),
        },
      ],
    },
    {
      company: "Visual Data Systems",
      roles: [
        {
          title: "Senior Web Designer & Developer",
          start: { year: 2011, month: 2 },
          end: { year: 2013, month: 2 },
          bullets: perTrack([], []),
        },
      ],
      // Tenure only: these keep the earliest date at Dec 2009, which is what
      // makes the "sixteen years" claim add up to a parser doing the math.
      earlier: [
        {
          title: "Web Designer & Developer",
          start: { year: 2010, month: 3 },
          end: { year: 2011, month: 1 },
        },
        {
          title: "Web Design & Development Intern",
          start: { year: 2009, month: 12 },
          end: { year: 2010, month: 2 },
        },
      ],
    },
  ],

  skills: {
    heading: perTrack("Skills", "Core Skills"),
    groups: perTrack(
      // creative
      [
        {
          heading: "Brand & Creative Strategy",
          items: [
            "brand evolution",
            "creative direction",
            "brand systems",
            "messaging",
          ],
        },
        {
          heading: "Creative Leadership",
          items: [
            "team building",
            "mentorship",
            "creative operations",
            "player-coach",
          ],
        },
        {
          heading: "Campaign Direction",
          items: [
            "integrated",
            "digital & web",
            "video",
            "experiential",
            "visual storytelling",
          ],
        },
        {
          heading: "Technical Fluency",
          items: [
            "design systems",
            "CMS architecture and migration",
            "HTML/CSS/JS",
            "Figma",
            "Adobe CC",
            "HubSpot",
            "Marketo",
            "Klaviyo",
            "GA4",
            "GTM",
            "Core Web Vitals",
            "AI-assisted design & dev workflows",
          ],
        },
      ],
      // engineering
      [
        {
          heading: "Web Architecture & Development",
          items: [
            "HTML / Sass / JavaScript",
            "Statamic / Laravel",
            "Astro",
            "CMS architecture and migration (content modeling, editorial systems)",
            "component & design systems",
            "React / Next.js (working knowledge)",
            "AI-assisted design & dev workflows (Claude Code)",
          ],
        },
        {
          heading: "Infrastructure & Ops",
          items: [
            "Fastly",
            "Cloudflare",
            "DigitalOcean",
            "Laravel Forge",
            "DNS",
            "CI/CD (GitHub Actions)",
            "Core Web Vitals",
            "incident response",
          ],
        },
        {
          heading: "Localization & Martech",
          items: [
            "Smartling",
            "HubSpot (HubL, CLI)",
            "Marketo",
            "Klaviyo",
            "GA4",
            "GTM",
          ],
        },
        {
          heading: "Design & Creative",
          items: [
            "creative direction",
            "campaign direction",
            "design systems",
            "Figma",
            "Adobe Creative Suite",
            "creative team leadership",
          ],
        },
        {
          heading: "Independent Work",
          items: [
            "Resume built as a React and TypeScript app, print-first with PDF and DOCX builds. A public system map and dated changelog documenting the AI stack behind this work, including what got cut and why. Local model inference and a self-hosted memory layer running on hardware in my house.",
          ],
        },
      ],
    ),
  },

  education: {
    degree: "B.A., Visual & Performing Arts",
    focus: "Graphic Design & Photography",
    school: "University of Maryland, Baltimore County",
  },
  recognition: perTrack(
    // creative
    [
      {
        program: "Transform Awards North America 2026",
        level: "Finalist",
        category: "Best Brand Consolidation",
        project: "2025 AdRoll rebrand",
      },
    ],
    // engineering
    [
      {
        program: "Transform Awards North America 2026",
        level: "Finalist",
        category: "Best Brand Consolidation",
        project: "2025 AdRoll rebrand",
      },
    ],
  ),
};
