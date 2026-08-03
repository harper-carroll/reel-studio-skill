// Grab official logos by element-screenshotting the sites' own headers.
import { chromium } from "playwright";

const jobs = [
  {
    name: "logo_nvidia",
    url: "https://www.nvidia.com/en-us/",
    sels: ["a[aria-label*='NVIDIA' i] img", "header img[alt*='NVIDIA' i]", "header img", "header svg"],
  },
  {
    name: "logo_ai2",
    url: "https://allenai.org/",
    sels: ["header a[href='/'] svg", "header a[href='/'] img", "header svg", "header img"],
  },
];

const browser = await chromium.launch();
for (const j of jobs) {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 3,
  });
  try {
    await page.goto(j.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(3000);
    let done = false;
    for (const sel of j.sels) {
      const el = page.locator(sel).first();
      try {
        if ((await el.count()) > 0 && (await el.isVisible())) {
          await el.screenshot({ path: `public/broll/${j.name}.png` });
          console.log(j.name, "via", sel);
          done = true;
          break;
        }
      } catch {}
    }
    if (!done) {
      await page.screenshot({ path: `out/${j.name}_full.png` });
      console.log(j.name, "FALLBACK full-page saved");
    }
  } catch (e) {
    console.error(j.name, "failed:", e.message);
  }
  await page.close();
}
await browser.close();
