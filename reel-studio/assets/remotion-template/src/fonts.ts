import { continueRender, delayRender, staticFile } from "remotion";
import { FONT } from "./brand";

// The skill copies the user's brand font files into public/fonts/ during onboarding
// and maps weights here. Keep the `family` = FONT so components resolve it.
const WEIGHTS: { weight: string; file: string }[] = [
  { weight: "500", file: "fonts/brand-medium.ttf" },
  { weight: "600", file: "fonts/brand-semibold.ttf" },
  { weight: "700", file: "fonts/brand-bold.ttf" },
  { weight: "800", file: "fonts/brand-extrabold.ttf" },
];

let started = false;
export const loadBrandFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("load-brand-fonts");
  Promise.all(
    WEIGHTS.map((w) => {
      const face = new FontFace(FONT, `url(${staticFile(w.file)})`, {
        weight: w.weight,
      });
      document.fonts.add(face);
      return face.load();
    })
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error("Font load failed", err);
      continueRender(handle);
    });
};
