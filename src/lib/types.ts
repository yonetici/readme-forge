export interface ProfileData {
  name: string;
  tagline: string;
  githubUsername: string;
  currentWork: string;
  currentWorkLink: string;
  learning: string;
  askMeAbout: string;
  email: string;
  portfolio: string;
  blog: string;
  funFact: string;
  skills: string[];
  socials: Record<string, string>;
  addons: AddonConfig;
}

export interface AddonConfig {
  visitorBadge: boolean;
  githubStats: boolean;
  streak: boolean;
  topLangs: boolean;
  trophies: boolean;
  /** Emit a GitHub Actions workflow that renders stats to committed SVGs
   *  instead of hotlinking shared third-party services. */
  staticStatsWorkflow: boolean;
  statsTheme: string;
}

export interface Skill {
  id: string;
  label: string;
  iconUrl: string;
  docUrl: string;
}

export interface SkillCategory {
  id: string;
  label: string;
  skills: Skill[];
}

export interface SocialPlatform {
  id: string;
  label: string;
  urlPrefix: string;
  badgeColor: string;
  badgeLogo: string;
  placeholder: string;
}

export interface LinkReport {
  url: string;
  status: number | null;
  ok: boolean;
  suggestion: string | null;
  reason: string | null;
  /** Static build only: cross-origin link that can't be probed from a browser. */
  skipped?: boolean;
}

export const DEFAULT_PROFILE: ProfileData = {
  name: "",
  tagline: "",
  githubUsername: "",
  currentWork: "",
  currentWorkLink: "",
  learning: "",
  askMeAbout: "",
  email: "",
  portfolio: "",
  blog: "",
  funFact: "",
  skills: [],
  socials: {},
  addons: {
    visitorBadge: true,
    githubStats: true,
    streak: true,
    topLangs: true,
    trophies: false,
    staticStatsWorkflow: true,
    statsTheme: "tokyonight",
  },
};
