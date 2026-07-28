// Media conventions for the reel. The skill fills these during setup.
// Keep the file paths relative to public/ (Remotion serves static assets from there).

// The talking-head / podcast source, downscaled to the composition size and muted,
// placed at public/source/speaker.mp4. Used full-frame for a "speaker" opener and
// as the TOP pane of every split-screen beat.
export const SOURCE_VIDEO = "source/speaker.mp4";

// The spoken audio track (extracted from the source) at public/audio.m4a.
// This is the reel's soundtrack and what the captions are aligned to.
export const AUDIO = "audio.m4a";
