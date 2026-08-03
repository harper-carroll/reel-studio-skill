// Screenshot real license examples for the licenses beat:
//  - CC BY-NC 4.0 deed (the "research only / non-commercial" side)
//  - Apache-2.0 on choosealicense.com (permissions list includes Commercial use)
import { chromium } from "playwright";

const shots = [
  {
    name: "shot_ccbync",
    url: "https://creativecommons.org/licenses/by-nc/4.0/",
    zoom: "1.5",
    scroll: 120,
  },
  {
    name: "shot_apache",
    url: "https://choosealicense.com/licenses/apache-2.0/",
    zoom: "1.5",
    scroll: 0,
  },
];

const browser = await chromium.launch();
for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1400 } });
  try {
    await page.goto(s.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.evaluate((z) => (document.documentElement.style.zoom = z), s.zoom);
    await page.waitForTimeout(2500);
    if (s.scroll) await page.evaluate((y) => window.scrollTo(0, y), s.scroll);
    await page.waitForTimeout(600);
    await page.screenshot({ path: `public/broll/${s.name}.png` });
    console.log("saved", s.name);
  } catch (e) {
    console.error(s.name, "failed:", e.message);
  }
  await page.close();
}
await browser.close();
