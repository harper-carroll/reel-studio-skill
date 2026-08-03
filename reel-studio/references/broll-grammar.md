# B-roll grammar — when to cut away, what to, and for how long

From a line-by-line mapping of a sample two-speaker episode ("What does AI mean for my job?", Frame.io)
script against its visuals. This is the editors' decision system; apply it when planning
any episode's shot list.

## The mapping (what kind of line gets what kind of visual)

| The line is… | Visual | Speaker visible? |
|---|---|---|
| a hook / thesis / punchline / opinion | talking head, full attention | YES — always |
| a personal-credibility claim ("I'm a Stanford scientist…") | REAL archival footage of the speaker (stage talks, interviews) with a credential chip | herself, in the archive |
| a definition ("AI is by definition a tool") | pinned definition card over the talking head | yes, below the card |
| a noun list ("fire, farming, the printing press…") | full-screen object cards (polaroids/cutouts), one per noun, cut ON the noun | no, for the whole list |
| historical / story narration | full-screen archival Ken Burns sweep, 5–15s | no |
| a number or stat | chart or source-article card drawing on as spoken | no (or below card) |
| a software demo / "here's how" | floating screen-recording card | yes, dimmed/blurred behind |
| abstract concept worth an image | short full-screen generated B-roll (matched grade) | no, ≤4s |
| the CTA | talking head (+ a proof card if promising something concrete) | YES |

## Rhythm rules

- Never more than ~10–15s in any one visual mode; b-roll runs are bookended by
  talking-head thesis lines. Roughly: 40% talking head, 40% b-roll/archival,
  20% graphics/cards in ep02.
- Cut INTO b-roll on the noun/claim, cut BACK on the punchline. The speaker owns
  every sentence that carries an opinion.
- Split a long EDL segment (contiguous source) into punch → b-roll → punch; the
  audio stays continuous, only visuals change. Word timestamps give the cut points.

## Sourcing (in preference order)

1. **Real footage of the speaker** for credibility beats — never generate this.
2. **Real screen recordings / screenshots** for anything software: Playwright,
   1080×1920 viewport + CSS `zoom: 2` (mobile layout at full sharpness), scripted
   slow scroll, `recordVideo` → mp4; or `page.screenshot()` for a still with a
   Ken Burns push. Real pages only (Hugging Face model cards, actual modeling_*.py
   architecture code) — authenticity reads instantly. Components:
   `ShotCard` / `ScreenRecCard` in assets/podcast-components (floating card over
   the blurred+dimmed speaker).
3. **Generated B-roll (Higgsfield)** ONLY for abstract/atmospheric beats no real
   asset covers, in the episode's grade (warm window light, cream palette, shallow
   DOF, filmic grain, "no text no watermark no faces"). Kling 3.0 pro ~7cr/4s.
   Keep it scarce — 1-3 clips per episode. **Metaphors must not be literal**
   (we killed a prism clip for "a spectrum" as too on-the-nose; the hands-on-
   keyboard clip for "customize it" survived). Prefer texture over illustration.
   ALWAYS get_cost first, tell the user what you're generating and where it goes,
   and warn that `show_generations` pops their account's gallery (old projects
   included) in their UI — otherwise it looks like you generated things you didn't.
