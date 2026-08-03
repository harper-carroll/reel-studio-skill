# Fonts (bring your own)

This skill loads a caption/graphic sans-serif from `caption-sans.otf` at this
directory. It is intentionally NOT included in this public repo — the font used
during development is a paid commercial font that cannot be redistributed.

Before running the podcast-components pipeline, drop your brand sans-serif file
here as `caption-sans.otf` (any weight, `.otf` or `.ttf`; rename accordingly if
you also edit `podcast/titleFont.ts`). The font-family it registers as is
`"CaptionSans"` — swap that name in `titleFont.ts` if you prefer a different
family label.

Recommended options if you don't have a licensed brand font:
- Inter (SIL OFL, free): https://rsms.me/inter/
- Manrope (SIL OFL, free): https://manropefont.com/
- IBM Plex Sans (SIL OFL, free): https://www.ibm.com/plex/

If you already own a paid font (any commercial or licensed font) drop that file
in as `caption-sans.otf` and everything else stays the same.
