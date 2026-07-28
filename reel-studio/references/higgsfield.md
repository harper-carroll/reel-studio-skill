# Higgsfield MCP — models, generation, and gotchas

Higgsfield is an aggregator: one MCP over many video/image models, billed against the
user's Higgsfield **plan credits**. This is how the reel's B-roll (and style samples)
get generated.

## Connecting (one-time, user action)

It's a remote MCP over HTTP + OAuth — not in the connector registry, so it's added
manually. Write this to the project's `.mcp.json`:

```json
{ "mcpServers": { "higgsfield": { "type": "http", "url": "https://mcp.higgsfield.ai/mcp" } } }
```

Then the user reloads the client and completes the **OAuth login** to Higgsfield (needs
an active plan). Tools appear as `mcp__<uuid>__<tool>`. You can't do the OAuth for them.

## The tools you'll use

- `models_explore` — `action: "list"|"search"|"get"|"recommend"`. **Always call `get`/`search`
  before generating** to read a model's exact params (duration set, resolution key name,
  media roles). Constraints vary a lot between models.
- `generate_video` / `generate_image` — `{ params: { model, prompt, aspect_ratio, duration,
  resolution|quality, medias:[{role,value}], count, get_cost } }`. Returns a **pending job**.
  `get_cost: true` returns credit cost WITHOUT generating — preflight before batches.
- `job_display(id)` / `show_generations` — poll status; when `completed`, `results.rawUrl`
  is the mp4/png. Download with `curl` into `public/broll/clipN.mp4`.
- `media_upload` → `curl -X PUT` the bytes to the presigned URL → `media_confirm` — to
  upload a local still/frame and get a `media_id` for seeding (image_references/start_image).
- `media_import_url` — import an https media URL → media_id.
- `balance` — remaining credits + plan. `presets_show` — cinematic camera/style presets.

## Model cheat-sheet (verify with models_explore — these move)

| model id | res | duration | media role (i2v) | notes |
|---|---|---|---|---|
| `gemini_omni` (Gemini Omni Flash) | 720p only | 4–10s | `image_references` | native audio; cheap-ish but 720p ceiling |
| `wan2_7` (Wan 2.7) | 720p/1080p | **2–15s continuous** | `start_image`,`end_image` | 1080p, tight first-frame seeding |
| `wan2_6` (Wan 2.6) | 720p/1080p | fixed 5/10/15 | `image_references` | stylized/experimental |
| `kling3_0` (Kling v3.0) | up to 4K | **3–15s continuous** | `start_image`,`end_image` | cheapest (~6 cr), 4K mode |
| `kling3_0_turbo` | 720p/1080p | 3–15s | `start_image` | fast/budget |
| `cinematic_studio_video_v2` | — | 3–12s | `image/start/end` | camera+genre control, presets |
| `veo3_1` (Veo 3.1) | 1080p/4k | fixed 4/6/8 | `start_image` | top-tier, priciest in credits |

**Duration matters for this workflow:** continuous-range models (Wan 2.7, Kling 3.0)
let you request each clip at ~exactly its timeline window; fixed-set models (Veo, Wan 2.6)
force you to over-generate and trim. Prefer a continuous model, and always generate
**≥ window + ~0.5s** so the editor trims rather than freezes.

**Resolution key name differs by model** (`resolution` vs `quality`) — read
`models_explore` params, don't assume. Passing the wrong key silently falls back to default.

## Consistency: seed vs. text-to-video

Two strategies — pick per style:
- **All clips share one look** (e.g. all cosmic): generate one "style still", upload it,
  and pass it as `start_image`/`image_references` to every clip. Tightest cohesion. But
  DON'T reuse one identical `start_image` across clips whose *compositions* differ — every
  clip then opens on the same frame. Seed per-clip stills instead, or…
- **Varied scenes** (study, hands, cityscape, cosmos): use **text-to-video** with a shared
  `STYLE` block appended to every prompt, and unify in post (the template's grain/vignette +
  a consistent palette). This is usually right for a rotating-subject shot list.

## Gotchas (learned the hard way)

- **False NSFW flags.** Dark, silhouette, or abstract clips get auto-moderation "NSFW"
  labels in the UI even when the pixels are completely clean (a boxer silhouette, a lone
  figure). **Always verify the actual frames** (`ffmpeg -ss T -i clip.mp4 -frames:v 1 out.png`
  then look) before reacting. Don't discard on the label alone, and reassure the user.
- **Preset interception.** A moody/dark prompt can return a `preset_recommendation` notice
  (e.g. "IN THE DARK") *instead of* submitting a job. To generate your literal prompt,
  resend the same call adding `declined_preset_id: "<the id from the notice>"`.
- **429 rate limits.** Firing more than ~5 `generate_video` calls at once → `429
  rate_limit_reached`. Submit in small batches (or accept partial success and retry the
  failed ones singly after a short pause). Record job ids as you go.
- **Async, minutes-long.** Clips take ~1–3 min. Poll `job_display`/`show_generations`;
  don't block. `show_generations` lists recently completed jobs with `rawUrl`.
- **Credits.** `balance` to check, `get_cost` to preflight. Rough: Omni ~21 cr/7s (720p),
  Wan 2.7 ~9 cr/6s (1080p), Kling 3.0 ~6 cr (4K). All plan-billed; warn before big batches.
- **Local files aren't readable by the MCP.** To seed from a local frame, `media_upload`
  → PUT bytes → `media_confirm`, then pass the returned `media_id` (never an https URL) as
  the media value.
