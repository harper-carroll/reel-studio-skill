// Brand palette + font family. The skill fills these from the user's brand assets
// during onboarding. Components import `BRAND.text` / `BRAND.accent` / `BRAND.bg`
// and `FONT`, so keep these keys stable — just change the values.
export const BRAND = {
  bg: "#0A0E16", // dark backdrop behind B-roll (kept near-black neutral)
  text: "#FBF6EA", // caption text — an off-white/bone reads on varied footage
  accent: "#D97706", // active-word highlight + split-screen divider (brand accent)
} as const;

// Font family name. fonts.ts registers this family from the .ttf files the skill
// copies into public/fonts/ during onboarding.
export const FONT = "Brand Sans";
