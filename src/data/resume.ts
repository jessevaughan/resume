import { perTrack, type ResumeData } from "../resume-schema";

export const resume: ResumeData = {
  name: "Jesse Vaughan",

  role: perTrack("Creative & Brand Leader", "Design Engineer · Web Architect"),

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
    `Sixteen years across brand, web, and campaigns, the last 9+ in creative leadership roles for a global SaaS marketing org. I've built and led distributed teams, directed three company-wide brand transformations, and ran campaigns through the company's strongest growth periods. That work runs on a design and development background I still use daily, from the martech stack to the website itself.`,
    // engineering
    `Design engineer and web architect with sixteen years building and owning production web properties end to end, across frontend, CMS architecture and migration, localization, and the infrastructure behind them. I owned AdRoll's site for twelve years. I also led creative for the same global SaaS org, so I move easily between writing the code, setting technical direction, and defending it to non-technical partners.`,
  ),

  highlights: perTrack(
    // creative
    [
      `Directed three company-wide brand transformations, including a full 2018 rebrand developed directly with the CEO and C-suite, a 2019 refresh and website rebuild, and the 2025 consolidation of two brands into one. Defined the visual and messaging systems used across all of marketing.`,
      `Led creative direction on #DareToGrow, AdRoll's largest brand campaign, with 15 documentary-style customer videos across a global omnichannel program. It ran during a period when the company saw +65% account signups and +95% site traffic.`,
      `Promoted from web designer to Head of Creative across twelve years at AdRoll, and stayed hands-on in the web platform I architected and owned.`,
    ],
    // engineering
    [
      `Rebuilt three companies' websites from the ground up: Selectica on ExpressionEngine (2013), OneLogin on Statamic (2014), and AdRoll on Statamic (2015–16). At AdRoll, extended front-end ownership into twelve years of running the full stack and infrastructure.`,
      `Migrated AdRoll from Drupal/Pantheon to a flat-file Statamic build in 2015–16. Owned the content model, the editorial system that let non-engineers ship site edits without dev tickets, and localization across ten locales in seven regions via Smartling. Cut hosting and deployment costs 80%, to $3,600 a year.`,
      `Owned the full production web stack, from Fastly, Cloudflare, DigitalOcean, and Laravel Forge through provisioning, scaling, server-upgrade decisions, and CI/CD via GitHub Actions.`,
    ],
  ),

  experience: [
    {
      company: "AdRoll (NextRoll)",
      roles: [
      {
        title: "Head of Creative - Marketing",
        start: { year: 2022, month: 2 },
        end: { year: 2026, month: 6 },
        lede: perTrack(
          // creative
          `Owned creative and brand strategy for a global SaaS marketing organization, from vision and narrative to the design systems that let it scale.`,
          // engineering
          `Owned and architected the web platform for a global SaaS marketing org, and led the creative and brand behind it.`,
        ),
        // It was dumb to keep these different so temporarily placing them in the same place before re-wiring
        note: {
          text: "Functional title. Title of record is Senior Manager, Creative.",
          placement: perTrack("top", "top"),
        },
        bullets: perTrack(
          // creative
          [
            `Directed the 2025 consolidation of AdRoll and RollWorks into a single brand, from identity and messaging systems through a full site migration. In the first 60 days, +87% first-time visitors, +42% homepage traffic, zero brand-confusion tickets.`,
            `Built and led a distributed creative team of up to seven across the US, spanning design, web, video, and copy.`,
            `Set creative and brand strategy with the CMO, VP of Marketing, and brand leadership. Shaped company-wide direction with the executive team.`,
            `Owned web platform performance and reliability, resolving a live DDoS attack on production.`,
            `Built an AI-assisted workflow with Claude Code to turn templated site sections into CMS-editable entries. It retired a standing queue of copy/paste tickets and moved routine edits to self-serve.`,
            `Founding board member of RollAsia (2018–2026), the company's Asian and Pacific Islander employee resource group. Built and hosted company-wide programming and speaker events.`,
          ],
          // engineering
          [
            `Owned the architecture and ongoing development of adroll.com, a flat-file Statamic build with page templates, reusable modules, and an editorial system that let marketing ship edits without engineering.`,
            `Built an AI-assisted workflow with Claude Code to convert hardcoded template sections into CMS-editable entries. It retired a standing queue of copy/paste tickets and moved routine content edits to self-serve.`,
            `Led the site migration behind the 2025 AdRoll–RollWorks brand consolidation. First-time visitors rose 87% and homepage traffic 42% in the first 60 days.`,
            `Led incident response during a Super Bowl traffic surge and DDoS attack, scaling servers to absorb the load while devops blocked the attacking IP ranges. Then built a standing bot blocklist into Fastly with devops so the next one ran without a scramble.`,
            `Led creative for the marketing org and a team of up to seven.`,
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
            `Directed creative across integrated brand and acquisition campaigns.`,
            `Built brand systems that held up as the company grew. Strengthened the creative-review culture, unifying brand expression across product marketing and web.`,
          ],
          // engineering
          [
            `Maintained and evolved the core Statamic build and web design system, and set the front-end standard for the team, while directing creative.`,
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
            `Took over the full creative team after the head of creative departed, becoming hiring manager and leading direction across design, web, and video.`,
            `Hired and mentored across design and web, coaching a designer/developer who has since built a UI/UX career.`,
          ],
          // engineering
          [
            `Took over the full creative team as hiring manager while continuing to own the web build. Mentored a designer/developer through technical projects and review, and they have since built a career in UI/UX design.`,
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
          ["First direct report while still owning the web platform hands-on."],
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
            "Smartling (10 locales, 7 regions)",
            "HubSpot (HubL, CLI)",
            "GA4 (Google Analytics 4) / GTM (Google Tag Manager)",
          ],
        },
        {
          heading: "Design & Creative",
          items: [
            "creative direction",
            "design systems",
            "Figma",
            "Adobe Creative Suite",
            "creative team leadership",
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
};
