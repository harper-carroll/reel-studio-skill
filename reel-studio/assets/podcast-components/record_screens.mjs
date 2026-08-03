// Record realistic browser screen recordings for B-roll (ep02-style phone cards).
// Trick: 1080x1920 viewport + CSS zoom 2 => sites serve their mobile layout but
// render at full 1080p sharpness. Slow programmatic scroll, ~10s each.
import { chromium } from "playwright";

const RECS = [
  {
    name: "rec_modeling",
    url: "https://github.com/huggingface/transformers/blob/main/src/transformers/models/llama/modeling_llama.py",
    prep: async (page) => {
      // jump into the meat of the file before recording the scroll
      await page.evaluate(() => window.scrollTo(0, 3000));
      await page.waitForTimeout(800);
    },
    scrollTo: 9000,
  },
  {
    name: "rec_hfpage",
    url: "https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF",
    prep: async (page) => {
      await page.waitForTimeout(1200);
    },
    scrollTo: 4200,
  },
];

const browser = await chromium.launch();
for (const rec of RECS) {
  const ctx = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    recordVideo: { dir: "out/screenrec", size: { width: 1080, height: 1920 } },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  });
  const page = await ctx.newPage();
  try {
    await page.goto(rec.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.evaluate(() => {
      document.documentElement.style.zoom = "2";
    });
    await page.waitForTimeout(2500);
    await rec.prep(page);
    // smooth scroll over ~8s
    await page.evaluate(async (target) => {
      const start = window.scrollY;
      const t0 = performance.now();
      const dur = 8000;
      await new Promise((res) => {
        const step = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          window.scrollTo(0, start + (target - start) * ease);
          if (p < 1) requestAnimationFrame(step);
          else res();
        };
        requestAnimationFrame(step);
      });
    }, rec.scrollTo);
    await page.waitForTimeout(600);
  } catch (e) {
    console.error(rec.name, "failed:", e.message);
  }
  await ctx.close(); // flushes the video
  const video = await page.video()?.path();
  console.log(rec.name, "->", video);
}
await browser.close();
console.log("RECORDINGS_DONE");
