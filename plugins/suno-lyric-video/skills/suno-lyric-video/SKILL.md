---
name: suno-lyric-video
description: Create a complete Remotion lyric video from a Suno MP3 and matching SRT file, including a newly generated mood-matched album cover, synchronized Korean/English lyrics, title and artist metadata, preview validation, and Remotion dev startup. Use when the user invokes $suno-lyric-video or asks to turn Suno audio plus SRT captions into a polished lyric video.
---

# Suno Lyric Video

Create the finished lyric-video project, not a plan or mockup.

## Workflow

1. Find the input pair.
   - Search the working directory and immediate song subfolders for `*.mp3` and `*.srt`.
   - Ignore `node_modules/`, `public/`, `out/`, build output, and generated previews.
   - Prefer files in the same directory. If multiple valid pairs exist and the user did not identify one, ask which song to process.
   - Treat SRT as the timing source. LRC may be kept as an optional companion but must not override SRT.

2. Derive metadata and mood.
   - Infer title and artist from the MP3 filename. Remove duplicate suffixes such as `(1)` and file extensions.
   - Read the complete SRT and identify lyrical themes, emotional tone, imagery, energy, genre cues, and a suitable two- or three-color palette.
   - Preserve Korean and English lyric text exactly apart from removing standalone section labels such as `[Intro]`, `Verse`, `Hook`, `Bridge`, or `Chorus` from the rendered lyric list.

3. Generate a new album cover.
   - Read [references/design-and-cover.md](references/design-and-cover.md).
   - Use the available image-generation tool for a square, text-free cover based on the lyrics and inferred mood.
   - Do not reuse an unrelated cover. Do not place generated typography, logos, or watermarks in the image.
   - Copy the selected generated image to `public/album-cover.png`; keep the original generated file.

4. Create or update the Remotion project.
   - For a new project, copy the contents of `assets/remotion-template/` into the working directory without overwriting unrelated user files.
   - For an existing Remotion project, preserve its structure and update only the lyric-video implementation and assets needed for this song.
   - Copy the input MP3 to `public/audio.mp3` and SRT to `public/lyrics.srt` using stable names.
   - Set `title` and `subtitle` in `src/Root.tsx` to the inferred title and artist.
   - Keep the established layout: large title centered at the top, album cover on the left, title/artist beneath it, and lyrics on the right.
   - Keep the visual theme bright, premium, and clean. Adapt the palette to the generated cover while retaining strong lyric contrast.
   - Animate the white lyric lines naturally upward. Do not animate a black highlight bar downward and do not add an in-video progress bar.

5. Build and validate.
   - Run `npm install` only when dependencies are absent or incomplete.
   - Run `npm run build:lyrics` after placing the source assets.
   - Run `npx tsc --noEmit`.
   - Render at least one representative still after lyrics begin and inspect it for readability, overlap, missing assets, stray section labels, and correct title/artist.
   - Iterate until the still is visually clean.

6. Start Remotion dev.
   - Start `npm run dev` on port 3000. If occupied, choose another available port.
   - Keep the server running and open the local preview when browser tooling is available.
   - Report the preview URL, generated cover path, representative still path, and validation results.

7. Render only when requested.
   - Run `npm run render` when the user asks for the final MP4.
   - Report the final video path and any renderer limitation clearly.

