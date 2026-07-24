/** School website template config — edit via Headmaster → Site settings, or public/school.json */

export type SiteValue = { title: string; text: string };
export type SiteStage = { title: string; ages: string; text: string };
export type SiteNewsPost = { date: string; title: string; excerpt: string };

export type SiteConfig = {
  name: string;
  shortName: string;
  location: string;
  area: string;
  district: string;
  region: string;
  country: string;
  type: string;
  tagline: string;
  academicYear: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  admissionsEmail: string;
  website: string;
  headmasterUser: string;
  headmasterPassword: string;
  brand: {
    primary: string;
    primaryDeep: string;
    accent: string;
    accentSoft: string;
    logoInitials: string;
    navSubtitle: string;
  };
  marketing: {
    homeHeroSupport: string;
    homeAboutTitle: string;
    homeAboutBlurb: string;
    homeExploreTitle: string;
    homeExploreBlurb: string;
    aboutHeroDescription: string;
    aboutStoryTitle: string;
    aboutStoryIntro: string;
    aboutStoryBody1: string;
    aboutStoryBody2: string;
    aboutWelcome: string;
    mission: string;
    vision: string;
    values: SiteValue[];
    academicsHeroTitle: string;
    academicsHeroDescription: string;
    academicsPathwaysTitle: string;
    academicsPathwaysBlurb: string;
    academicsEssenceTitle: string;
    academicsEssenceBody: string;
    stages: SiteStage[];
    admissionsHeroTitle: string;
    admissionsHeroDescription: string;
    admissionsStepsTitle: string;
    admissionsStepsBlurb: string;
    admissionsSteps: string[];
    admissionsDocsTitle: string;
    admissionsDocs: string[];
    newsHeroTitle: string;
    newsHeroDescription: string;
    newsSectionTitle: string;
    newsPosts: SiteNewsPost[];
    contactHeroTitle: string;
    contactHeroDescription: string;
    officeHours: string;
    headerLocationLabel: string;
  };
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  name: "Seat of Wisdom School",
  shortName: "Seat of Wisdom",
  location: "Afrancho, Kumasi",
  area: "Afrancho",
  district: "Afigya Kwabre South",
  region: "Ashanti Region",
  country: "Ghana",
  type: "Basic School",
  tagline: "Nurturing tomorrow's leaders today",
  academicYear: "2025/2026",
  address: "Afrancho, Kumasi, Ashanti Region, Ghana",
  phone: "+233 XX XXX 4451",
  whatsapp: "+233 XX XXX 4451",
  email: "info@seatofwisdomschool.com",
  admissionsEmail: "admissions@seatofwisdomschool.com",
  website: "https://seatofwisdomschool.com.free/",
  headmasterUser: "headmaster",
  headmasterPassword: "SOW-HEAD-2026",
  brand: {
    primary: "#0b3d7a",
    primaryDeep: "#062648",
    accent: "#00adef",
    accentSoft: "#7dd8f7",
    logoInitials: "SW",
    navSubtitle: "Basic School · Afrancho",
  },
  marketing: {
    homeHeroSupport:
      "A caring basic school in Afrancho — Nursery through JHS.",
    homeAboutTitle: "Excellence in education is our essence",
    homeAboutBlurb:
      "We serve families in our community with a child-friendly environment grounded in hard work, respect, and teamwork.",
    homeExploreTitle: "Life at our campus",
    homeExploreBlurb:
      "Learn how we teach, what’s happening this term, and how to join our community.",
    aboutHeroDescription:
      "A basic school committed to educating and developing the young people entrusted to our care.",
    aboutStoryTitle: "Rooted in our community, growing with every child",
    aboutStoryIntro:
      "We serve families across our district with quality Nursery, Kindergarten, Primary, and Junior High education.",
    aboutStoryBody1:
      "Excellence in education is our essence. We provide the resources for academic rigor alongside inquiry, creativity, and initiative — so every learner grows into a well-rounded young person.",
    aboutStoryBody2:
      "Our campus community values hard work, mutual respect, and a child-friendly atmosphere. We welcome all who share our commitment to personal development, responsibility, and service.",
    aboutWelcome: "Akwaaba.",
    mission:
      "To provide quality, inclusive, and holistic basic education that meets the aspirations of our learners — raising a generation who are productive citizens of Ghana and the world.",
    vision:
      "To be a leading basic school in our community, modelling care, academic strength, and character for every pupil we serve.",
    values: [
      {
        title: "Hard work",
        text: "Every pupil is encouraged to give their best in class and beyond.",
      },
      {
        title: "Respect",
        text: "We honour one another — pupils, teachers, and families alike.",
      },
      {
        title: "Child-friendly care",
        text: "A safe, welcoming environment where young learners can thrive.",
      },
      {
        title: "Teamwork",
        text: "Teachers, staff, and parents work together for each child's growth.",
      },
    ],
    academicsHeroTitle: "Training tomorrow’s leaders today",
    academicsHeroDescription:
      "A Ghana Education Service–aligned programme that balances academic rigor with inquiry, creativity, and character.",
    academicsPathwaysTitle: "Our learning pathways",
    academicsPathwaysBlurb:
      "From Nursery through Junior High School, every stage builds confidently on the last.",
    academicsEssenceTitle: "Excellence in education is our essence",
    academicsEssenceBody:
      "Class exercises, continuous assessment, and end-of-term exams help us track growth. Subjects include English, Mathematics, Integrated Science, Social Studies, Asante Twi, RME, Creative Arts, and Computing.",
    stages: [
      {
        title: "Nursery",
        ages: "Early years",
        text: "Play-based foundations in language, number sense, and social skills in a warm, guided setting.",
      },
      {
        title: "Kindergarten",
        ages: "KG 1 – KG 2",
        text: "Ready-for-primary learning through stories, creative arts, outdoor play, and early literacy.",
      },
      {
        title: "Primary",
        ages: "Primary 1 – 6",
        text: "Strong literacy and numeracy, Our World Our People, Creative Arts, Computing, and Asante Twi.",
      },
      {
        title: "Junior High",
        ages: "JHS 1 – 3",
        text: "Integrated Science, Social Studies, Career Technology, and preparation toward BECE.",
      },
    ],
    admissionsHeroTitle: "Join our school family",
    admissionsHeroDescription:
      "Deciding on the right school is an important choice. We welcome new families into our community with open arms.",
    admissionsStepsTitle: "How to join us",
    admissionsStepsBlurb:
      "A clear pathway from first enquiry to first day of school.",
    admissionsSteps: [
      "Complete an online enquiry or visit the school office.",
      "Submit the child's birth certificate and recent passport photograph.",
      "Share previous school report (where applicable).",
      "Attend an assessment / interview as scheduled.",
      "Receive an offer and complete fee payment to confirm the place.",
    ],
    admissionsDocsTitle: "Documents required",
    admissionsDocs: [
      "Birth certificate or baptismal extract",
      "Two passport-size photographs",
      "Last school report (Primary / JHS transfers)",
      "Parent / guardian Ghana Card or ID",
    ],
    newsHeroTitle: "School life",
    newsHeroDescription:
      "Programmes, celebrations, and updates from our basic school community.",
    newsSectionTitle: "Latest from campus",
    newsPosts: [
      {
        date: "15 Sep 2025",
        title: "Welcome to the new academic year",
        excerpt:
          "Pupils and teachers returned for First Term with orientation for new Nursery and KG families.",
      },
      {
        date: "2 Oct 2025",
        title: "Inter-house sports day",
        excerpt:
          "Campus came alive with races, football, and cheer as houses competed in friendly spirit.",
      },
      {
        date: "20 Nov 2025",
        title: "Reading week celebration",
        excerpt:
          "Primary and JHS pupils showcased story performances and a book parade across the school.",
      },
      {
        date: "8 Dec 2025",
        title: "End-of-term awards & speech day",
        excerpt:
          "Excellence, improvement, and service awards celebrated our learners before the Christmas break.",
      },
    ],
    contactHeroTitle: "Visit us",
    contactHeroDescription:
      "Call the office, send a message, or schedule a campus tour — we would love to welcome you.",
    officeHours: "Monday – Friday, 8:00am – 4:00pm",
    headerLocationLabel: "Afrancho, Kumasi",
  },
};

export const SITE_PREVIEW_KEY = "sow-site-config-preview-v1";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merge partial config onto defaults (arrays replace, objects merge). */
export function mergeSiteConfig(
  base: SiteConfig,
  partial: unknown
): SiteConfig {
  if (!isPlainObject(partial)) return base;

  const next: SiteConfig = {
    ...base,
    ...pickStrings(partial, base),
    brand: {
      ...base.brand,
      ...(isPlainObject(partial.brand)
        ? (partial.brand as SiteConfig["brand"])
        : {}),
    },
    marketing: {
      ...base.marketing,
      ...(isPlainObject(partial.marketing)
        ? mergeMarketing(base.marketing, partial.marketing)
        : {}),
    },
  };
  return next;
}

function pickStrings(
  partial: Record<string, unknown>,
  base: SiteConfig
): Partial<SiteConfig> {
  const keys: (keyof SiteConfig)[] = [
    "name",
    "shortName",
    "location",
    "area",
    "district",
    "region",
    "country",
    "type",
    "tagline",
    "academicYear",
    "address",
    "phone",
    "whatsapp",
    "email",
    "admissionsEmail",
    "website",
    "headmasterUser",
    "headmasterPassword",
  ];
  const out: Partial<SiteConfig> = {};
  for (const k of keys) {
    if (typeof partial[k] === "string") {
      (out as Record<string, string>)[k] = partial[k] as string;
    }
  }
  void base;
  return out;
}

function mergeMarketing(
  base: SiteConfig["marketing"],
  partial: Record<string, unknown>
): SiteConfig["marketing"] {
  const next = { ...base };
  for (const [k, v] of Object.entries(partial)) {
    if (k === "values" && Array.isArray(v)) {
      next.values = v as SiteValue[];
    } else if (k === "stages" && Array.isArray(v)) {
      next.stages = v as SiteStage[];
    } else if (k === "newsPosts" && Array.isArray(v)) {
      next.newsPosts = v as SiteNewsPost[];
    } else if (k === "admissionsSteps" && Array.isArray(v)) {
      next.admissionsSteps = v.filter((x) => typeof x === "string") as string[];
    } else if (k === "admissionsDocs" && Array.isArray(v)) {
      next.admissionsDocs = v.filter((x) => typeof x === "string") as string[];
    } else if (typeof v === "string" && k in base) {
      (next as Record<string, unknown>)[k] = v;
    }
  }
  return next;
}

export function applyBrandToDocument(config: SiteConfig) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const { primary, primaryDeep, accent, accentSoft } = config.brand;
  root.style.setProperty("--navy", primary);
  root.style.setProperty("--navy-deep", primaryDeep);
  root.style.setProperty("--blue", primary);
  root.style.setProperty("--cyan", accent);
  root.style.setProperty("--cyan-soft", accentSoft);
  root.style.setProperty("--forest", primary);
  root.style.setProperty("--forest-deep", primaryDeep);
  root.style.setProperty("--gold", accent);
  root.style.setProperty("--gold-soft", accentSoft);
  root.style.setProperty("--moss", primary);
}

/** Identity slice compatible with legacy SCHOOL usage. */
export function schoolIdentity(config: SiteConfig) {
  return {
    name: config.name,
    shortName: config.shortName,
    location: config.location,
    area: config.area,
    district: config.district,
    region: config.region,
    country: config.country,
    type: config.type,
    tagline: config.tagline,
    academicYear: config.academicYear,
    address: config.address,
    phone: config.phone,
    whatsapp: config.whatsapp,
    email: config.email,
    admissionsEmail: config.admissionsEmail,
    website: config.website,
    headmasterUser: config.headmasterUser,
    headmasterPassword: config.headmasterPassword,
  };
}
