// Record real training-data browsing on Hugging Face for the "look at the
// training data" beat. Tries Dolma (OLMo's open training data — AI2, who the
// episode name-checks), falls back to FineWeb's dataset viewer.
import { chromium } from "playwright";

const targets = [
  { name: "rec_dolma", url: "https://huggingface.co/datasets/allenai/dolma" },
  { name: "rec_fineweb", url: "https://huggingface.co/datasets/HuggingFaceFW/fineweb" },
];

const browser = await chromium.launch();
for (const t of targets) {
  const ctx = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    recordVideo: { dir: "out/screenrec", size: { width: 1080, height: 1920 } },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  });
  const page = await ctx.newPage();
  try {
    await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.evaluate(() => (document.documentElement.style.zoom = "2"));
    await page.waitForTimeout(3000);
    await page.evaluate(async () => {
      const t0 = performance.now();
      const dur = 8000;
      await new Promise((res) => {
        const step = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          window.scrollTo(0, 5200 * ease);
          if (p < 1) requestAnimationFrame(step);
          else res();
        };
        requestAnimationFrame(step);
      });
    });
    await page.waitForTimeout(500);
  } catch (e) {
    console.error(t.name, "failed:", e.message);
  }
  await ctx.close();
  console.log(t.name, "->", await page.video()?.path());
}
await browser.close();
console.log("DONE");
