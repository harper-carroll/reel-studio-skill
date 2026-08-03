import { continueRender, delayRender, staticFile } from "remotion";

// Cormorant Italic (variable 300-700) — the closest open font to the reference
// title serif (high-contrast calligraphic italic). Loaded inside the composition
// component, never at module top level (see template gotcha).
let started = false;
export const loadTitleFont = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("load-title-font");
  const serif = new FontFace(
    "TitleSerif",
    `url(${staticFile("fonts/title-italic.ttf")})`,
    { style: "italic", weight: "300 700" }
  );
  const sans = new FontFace(
    "CaptionSans",
    `url(${staticFile("fonts/caption-sans.otf")})`,
    { weight: "400 700" }
  );
  document.fonts.add(serif);
  document.fonts.add(sans);
  Promise.all([serif.load(), sans.load()])
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error("Font load failed", err);
      continueRender(handle);
    });
};
