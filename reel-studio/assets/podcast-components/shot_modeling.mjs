// Screenshot real model-architecture code from huggingface.co (DeepSeek-V3
// modeling file — attention block region), crisp at 1080 wide via zoom 2.
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
try {
  await page.goto(
    "https://huggingface.co/deepseek-ai/DeepSeek-V3/blob/main/modeling_deepseek.py#L655",
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.evaluate(() => (document.documentElement.style.zoom = "1.6"));
  await page.waitForTimeout(3500);
  await page.screenshot({ path: "public/broll/shot_modeling.png" });
  console.log("saved shot_modeling.png");
} catch (e) {
  console.error("hf failed:", e.message);
  // fallback: transformers llama modeling on GitHub (also Hugging Face's code)
  await page.goto(
    "https://github.com/huggingface/transformers/blob/main/src/transformers/models/llama/modeling_llama.py#L250",
    { waitUntil: "domcontentloaded", timeout: 60000 }
  );
  await page.evaluate(() => (document.documentElement.style.zoom = "1.6"));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "public/broll/shot_modeling.png" });
  console.log("saved fallback shot_modeling.png");
}
await browser.close();
