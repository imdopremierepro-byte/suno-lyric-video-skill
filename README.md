# Suno Lyric Video for Codex

MP3 and SRT files become a complete Remotion lyric video with a newly generated album cover.

## Install

Add this GitHub repository as a Codex plugin marketplace:

```bash
codex plugin marketplace add imdopremierepro-byte/suno-lyric-video-skill
codex plugin add suno-lyric-video@dohyun-lyric-tools
```

Restart Codex after installation if the plugin does not appear immediately.

## Use

1. Create a project folder.
2. Put one Suno `.mp3` file and its matching `.srt` file in the folder.
3. Open the folder in Codex.
4. Invoke the skill:

```text
$suno-lyric-video Create a lyric video from these files.
```

The skill will analyze the lyrics, generate a text-free album cover, create or update the Remotion project, synchronize lyrics, validate the design, and start a local preview. Ask it to render the final MP4 when the preview is ready.

## Requirements

- Codex desktop app, CLI, or IDE extension with plugin support
- Image generation capability available to Codex
- Node.js and npm for local Remotion preview and rendering

Users should only upload or render audio and lyrics they have permission to use.

## Included design

- 1920x1080, 30 FPS Remotion composition
- Large title at the top
- Album cover and metadata on the left
- Synchronized white lyrics moving upward on the right
- Standalone section labels such as Intro, Verse, Hook, and Chorus hidden
- No black moving highlight bar and no in-video progress bar

## License

MIT
