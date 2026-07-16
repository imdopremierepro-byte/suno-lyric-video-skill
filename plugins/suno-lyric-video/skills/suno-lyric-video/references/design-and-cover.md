# Design And Cover Direction

## Album Cover Prompt

Build the image-generation prompt from the actual lyrics:

```text
Use case: stylized-concept
Asset type: square album cover for a lyric video
Primary request: create an original album cover that expresses the song's central lyrical theme
Scene/backdrop: <concrete imagery derived from the lyrics>
Style/medium: premium clean digital illustration or polished editorial artwork
Composition/framing: square, one clear focal point, balanced at thumbnail size
Lighting/mood: <mood inferred from lyrics>
Color palette: <two or three colors inferred from lyrics>
Constraints: no text, no typography, no logo, no watermark, no frame, no mockup
```

Prefer concrete lyrical imagery over generic music symbols. Avoid using people unless the lyrics strongly call for a human subject. Keep the artwork bright enough to support the established lyric-video layout unless the song's meaning clearly requires a darker treatment.

## Video Layout

- Render at 1920x1080 and 30 FPS.
- Place a square cover at left with a restrained shadow and 6px or smaller corner radius.
- Place the title and artist beneath the cover, and repeat the full title prominently at the top center.
- Place lyrics in the right half with generous horizontal padding.
- Keep the active lyric bright white and strongest in weight; use lower opacity for neighboring lines.
- Move the whole lyric stack upward with eased interpolation as lines advance.
- Fade distant lines near the top and bottom edges with a mask.
- Never show section labels, a black moving highlight rectangle, or an in-video progress bar.
- Maintain legibility with subtle text shadows or a soft local scrim; do not use a dark card behind the lyric block.

