# Reel Studio — a Claude Code skill

Turn a talking-head or podcast clip into a **cinematic vertical brand reel**: generate AI
B-roll, cut it over the speaker with word-synced captions and split-screen, and edit it all
in [Remotion](https://www.remotion.dev). You talk to Claude Code; it runs the pipeline.

**The pipeline:**
`onboard → transcript → propose styles → sample each → you pick → shot list → generate clips → edit → render`

**What comes out:** a 1080×1920 (9:16) `.mp4` — your speaker's audio driving the whole thing,
moody AI B-roll on top, real word-by-word captions in your brand font, split-screen on the
beats where seeing the speaker adds weight, and a film-grain pass that unifies everything.

See [`demo.md`](demo.md) for a full worked example (input → styles → shot list → render).

---

## ⚡ Install by pasting into Claude Code

The fastest way — paste this to Claude Code and it installs itself:

```
Install the "reel-studio" skill from https://github.com/harper-carroll/reel-studio-skill —
clone the repo to a temp folder and copy its `reel-studio/` directory into ~/.claude/skills/,
then confirm the skill is available. After it's installed, help me make a reel.
```

Then **restart Claude Code** (skills load at startup). That's it — ask for a reel and it takes
over. Requires that you can access the repo (it's cloned with your GitHub credentials; if the
repo is private, you need access to it).

---

## Requirements

| Need | Why | 
|---|---|
| **[Claude Code](https://claude.com/claude-code)** (skills-capable) | This is a Claude skill — Claude drives it |
| **Node.js 18+ & npm** | Remotion (the video editor/renderer) |
| **ffmpeg** | source prep, frame checks (`brew install ffmpeg`) |
| **Python 3 + `faster-whisper`** | real caption sync (`pip install faster-whisper`) |
| **A [Higgsfield](https://higgsfield.ai) account with an active plan** | AI B-roll generation via its MCP (uses your plan credits) |

**You bring:** your own **brand fonts** (`.ttf`) and **brand colors**, and the **source
video** you want to reel-ify. Fonts and footage are *not* included — use assets you have the
rights to.

---

## Install

**Option A — one command:**
```bash
./install.sh
```

**Option B — manual:** copy the `reel-studio/` folder into your Claude skills directory:
```bash
cp -R reel-studio ~/.claude/skills/
```

Then start (or restart) Claude Code. Verify it's loaded by asking Claude *"what skills do you
have?"* — you should see **reel-studio**. It also auto-triggers when you ask for a reel.

---

## Use it

In your project, just ask — e.g.:

> "Make a vertical reel from this podcast clip with cinematic B-roll and captions."

or invoke it by name: `/reel-studio`.

Claude will walk the phases: onboard your brand/fonts/source, connect the Higgsfield MCP,
pitch you a few visual styles, generate cheap samples so you can pick, write the shot list,
generate the clips, and render — previewing cheaply and confirming before it spends credits.

### First-run notes
- **Higgsfield MCP** is a remote HTTP+OAuth server added to your project's `.mcp.json`
  (`https://mcp.higgsfield.ai/mcp`) — you complete a one-time OAuth login (needs an active
  plan). Full setup + model notes are in `reel-studio/references/higgsfield.md`.
- **Costs:** the only thing that spends money is *your* Higgsfield generation (plan credits).
  The skill previews with stills and checks cost before batch-generating.

---

## What's inside

```
reel-studio/
├── SKILL.md                     # the workflow Claude follows (phases 0–7 + principles)
├── references/
│   ├── higgsfield.md            # MCP setup, models, and hard-won gotchas
│   ├── remotion-template.md     # how the composition works + every tweak point
│   └── captions.md              # caption alignment + styles
└── assets/remotion-template/    # the Remotion project Claude copies into your repo
    ├── src/                     # Reel/BrollTrack/SplitOverlay/Captions/GrainOverlay …
    └── scripts/                 # prep_source.sh (ffmpeg) + align_words.py (whisper sync)
```

The template ships with **placeholder** brand colors, a `"Brand Sans"` font name, an empty
caption file, and an example shot list — the skill fills these in from your assets during
onboarding.

---

## Credits & license

Created by **Harper Carroll** ([@harpercarrollai](https://www.instagram.com/harpercarrollai)).
Released under the **MIT License** — see `LICENSE`. Fonts, footage, and Higgsfield usage are
yours to supply and are not covered by this license.
