import type { SocialPlatform } from "@/lib/types";

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: "linkedin", label: "LinkedIn", urlPrefix: "https://linkedin.com/in/", badgeColor: "0A66C2", badgeLogo: "linkedin", placeholder: "username" },
  { id: "twitter", label: "X / Twitter", urlPrefix: "https://x.com/", badgeColor: "000000", badgeLogo: "x", placeholder: "handle" },
  { id: "instagram", label: "Instagram", urlPrefix: "https://instagram.com/", badgeColor: "E4405F", badgeLogo: "instagram", placeholder: "username" },
  { id: "youtube", label: "YouTube", urlPrefix: "https://youtube.com/@", badgeColor: "FF0000", badgeLogo: "youtube", placeholder: "channel" },
  { id: "devto", label: "Dev.to", urlPrefix: "https://dev.to/", badgeColor: "0A0A0A", badgeLogo: "devdotto", placeholder: "username" },
  { id: "medium", label: "Medium", urlPrefix: "https://medium.com/@", badgeColor: "12100E", badgeLogo: "medium", placeholder: "username" },
  { id: "stackoverflow", label: "Stack Overflow", urlPrefix: "https://stackoverflow.com/users/", badgeColor: "F58025", badgeLogo: "stackoverflow", placeholder: "user id" },
  { id: "kaggle", label: "Kaggle", urlPrefix: "https://kaggle.com/", badgeColor: "20BEFF", badgeLogo: "kaggle", placeholder: "username" },
  { id: "leetcode", label: "LeetCode", urlPrefix: "https://leetcode.com/u/", badgeColor: "FFA116", badgeLogo: "leetcode", placeholder: "username" },
  { id: "hackerrank", label: "HackerRank", urlPrefix: "https://www.hackerrank.com/profile/", badgeColor: "00EA64", badgeLogo: "hackerrank", placeholder: "username" },
  { id: "codepen", label: "CodePen", urlPrefix: "https://codepen.io/", badgeColor: "000000", badgeLogo: "codepen", placeholder: "username" },
  { id: "discord", label: "Discord", urlPrefix: "https://discord.com/users/", badgeColor: "5865F2", badgeLogo: "discord", placeholder: "user id" },
];
