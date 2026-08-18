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
    `Sixteen years across brand, web, and campaigns, the last nine-plus in creative leadership for a global SaaS marketing org. I've hired and led the creative teams on three company-wide brand transformations. That work runs on design and development I still do, from the martech stack to the website itself.`,
    // engineering
    `Creative technologist and web architect with sixteen years building production web properties end to end, plus the tooling the teams behind them run on, across frontend, CMS architecture and migration, localization, and the infrastructure underneath. I owned AdRoll's site for twelve years and led creative for its marketing org, so the tooling I built solved problems I was also accountable for, and I can defend the technical direction to people who don't write code.`,
  ),

  highlights: perTrack(
    // creative
    [
      `Ran creative on the 2018 rebrand with the CEO and C-suite, the 2019 refresh and website rebuild, and the 2025 consolidation of two brands into one, with Creative Director credit on the last two.`,
      `Led creative direction on #DareToGrow, a brand campaign with fifteen documentary-style customer videos and over 170 assets across ten channels. It ran during a period when the company saw +23% activations, +65% account signups, and +95% site traffic, with per-account spend flat, all measured 35 days after launch against the 35 days prior.`,
      `Built creative operations across five and a half years without a dedicated project manager, working out SLAs with brand leadership so scope and timing were decided before requests came in.`,
    ],
    // engineering
    [
      `Built a Claude Code workflow that converted hardcoded template sections into CMS-editable entries and retired a standing copy/paste ticket queue, plus AI skills carrying brand voice and standards for where AI belonged.`,
      `Designed and built the Selectica site on ExpressionEngine in 2013, then designed OneLogin's and chose Statamic there, which is why AdRoll ran on Statamic when I rebuilt it. AdRoll's only web designer and developer until 2017.`,
      `Carried search and discovery through three site rebuilds, including redirect maps, canonicals, hreflang, and sitemap generation I debugged down to manual indexing submissions.`,
      `Pitched the AdRoll rebuild during a year on the growth team, then migrated the site from Drupal/Pantheon to a flat-file Statamic build in 2015–16 and cut hosting and deploy costs 80%, to $3,600 a year.`,
      `Owned the production web stack, from provisioning and scaling through server upgrades and CI/CD.`,
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
              `Directed the 2025 AdRoll and RollWorks consolidation, from the Organic Intelligence mood through brand architecture, messaging systems, and a full site migration. The brand guidelines became the company's source of truth.`,
              `Led and hired into a distributed creative team of up to seven across the US, spanning design, web, video, and copy.`,
              `Worked with the CMO and VP of Marketing on creative direction for the org.`,
              `Built an AI-assisted workflow with Claude Code to turn hardcoded site sections into CMS-editable entries, retiring a standing copy/paste ticket queue, plus AI skills carrying brand voice and standards for where AI belonged.`,
              `Founding board member of RollAsia (2018–2026), AdRoll's Asian and Pacific Islander employee resource group.`,
            ],
            // engineering
            [
              `Ran adroll.com with page templates, reusable modules, and an editorial system that let marketing ship edits without engineering. Two outages in twelve years.`,
              `Led the site migration for the 2025 AdRoll–RollWorks brand consolidation, porting RollWorks content into the existing adroll.com build and retiring rollworks.com to a redirect.`,
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
              `Moved the creative team onto project management tooling, then the rest of marketing by 2022.`,
            ],
            // engineering
            [
              `Maintained the build and design system across three sites after the 2018 brand split.`,
              `Moved the creative team onto Asana, then the rest of marketing by 2022.`,
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
              `Inherited the full creative team mid-2017 when the head of creative departed, then took over direction and hiring.`,
              `Art directed photo and video shoots for campaigns and the site.`,
              `Ran localization for the site into ten locales across seven regions through Smartling.`,
              `Directed print, swag, direct mail, and office environmental design with outside vendors.`,
              `Mentored a graphic designer into web development. After the 2018 split they took the RollWorks site independently and built a UI/UX career from it.`,
            ],
            // engineering
            [
              `Kept the web build while inheriting the full creative team mid-2017.`,
              `Led the 2019 refresh and site rebuild as Creative Director, with the page builds moved in-house onto the Statamic build. Six agency-built pages had taken about ten weeks; fourteen in-house pages took about five.`,
            ],
          ),
        },
        {
          title: "Team Lead, Web Design - Marketing",
          start: { year: 2017, month: 2 },
          end: { year: 2018, month: 1 },
          // Creative goes title-only here (its neighbors already are).
          // Engineering keeps the line: it is the only place on that track
          // that dates the first direct report.
          bullets: perTrack(
            [],
            [
              "First direct report while still owning the web platform hands-on.",
            ],
          ),
        },
        // The early IC years, split into real dated entries rather than one
        // lumped "Earlier" block. Titles are the ones on LinkedIn. Near
        // title-only: the substance (the Statamic/ExpressionEngine rebuilds,
        // the Drupal migration) already lives in Career Highlights, so bullets
        // here carry only what the highlights don't. Smartling is the one
        // exception, moved down off engineering highlight four to shorten it.
        {
          title: "Web Designer - Marketing",
          // Months here (and on OneLogin below) disambiguate the Nov 2014 handoff
          // so the two don't both read as a bare, overlapping "2014".
          start: { year: 2014, month: 11 },
          end: { year: 2017, month: 1 },
          bullets: perTrack(
            [],
            [
              `Owned the content model and localization into ten locales across seven regions via Smartling.`,
            ],
          ),
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
          bullets: perTrack(
            [],
            [
              `Designed and hand-coded about a dozen client sites, front ends integrated with property and booking systems.`,
            ],
          ),
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
    heading: perTrack("Skills", "Skills"),
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
            "CMS architecture and migration (Drupal, ExpressionEngine)",
            "agent-facing site structure",
            "HTML/CSS/JS",
            "Figma",
            "Adobe CC",
            "accessibility (color and contrast)",
            "AI-assisted design & dev workflows",
          ],
        },
        {
          heading: "Search & Martech",
          items: [
            "technical SEO",
            "structured data",
            "Core Web Vitals",
            "AEO & LLM visibility",
            "HubSpot",
            "Marketo",
            "Klaviyo",
            "GA4",
            "GTM",
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
            "information architecture (content modeling, taxonomy, URL structure)",
            "CMS architecture and migration (Drupal, ExpressionEngine)",
            "accessibility (color and contrast)",
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
            "incident response",
          ],
        },
        {
          heading: "Search & Discovery",
          items: [
            "technical SEO",
            "structured data & schema (JSON-LD)",
            "redirects & canonicals",
            "hreflang",
            "Search Console",
            "Core Web Vitals",
            "AEO & LLM visibility",
          ],
        },
        {
          heading: "Localization & Martech",
          items: ["Smartling", "HubSpot", "Marketo", "Klaviyo", "GA4", "GTM"],
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
        {
          heading: "Independent Work",
          items: [
            "React and TypeScript resume app with print-first PDF and DOCX builds",
            "llms.txt and agent-facing structure on my own site",
            "public system map and dated changelog for my AI stack including what got cut",
            "model inference and a self-hosted memory layer running on hardware at home",
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
        level: "Shortlisted",
        category: "Best Brand Consolidation",
        project: "2025 AdRoll rebrand",
      },
    ],
    // engineering
    [
      {
        program: "Transform Awards North America 2026",
        level: "Shortlisted",
        category: "Best Brand Consolidation",
        project: "2025 AdRoll rebrand",
      },
    ],
  ),
};
