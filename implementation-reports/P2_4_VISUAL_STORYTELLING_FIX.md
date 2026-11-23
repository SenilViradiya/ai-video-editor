# P2.4 Visual Storytelling Fix

## Audit result

The inspected P2.3 preview frames (`hindi-preview-03`, `hindi-preview-09`,
`hindi-preview-20`, and `hindi-preview-26`) contain a full-screen dark gradient,
one rounded lower-third card, and a single symbolic diary/card graphic. There
are no characters, station architecture, platform perspective, departing train,
lighting progression, or object action. The 9 PM label is also incorrect; the
provided story specifies 9:30 PM.

The recursive asset audit found three reference MP4s, the narration MP3, and no
2D character, environment, PNG, SVG, PSD, sprite, rig, or pose assets. The
reference videos were not copied into the edit.

## Implemented preview

`HindiCinematicPreview` is a separate Remotion composition so P2.3 remains
available. It renders 18 seconds at 1080x1920/30 with the original narration.
The first three measured candidate spans are represented:

1. `0.00–7.44`: night station, 9:30 clock, teacher with diary, departing train.
2. `7.44–13.14`: diary close-up with a page-opening perspective transform.
3. `13.14–18.00`: the train has gone; the teacher remains on the platform.

The reusable renderer is in
`src/compositions/CinematicStorytelling.tsx`; structured scene data is in
`src/storytelling/cinematicStoryData.ts`.

Implemented motion includes train translation, camera push-in, perspective
diary opening, star twinkle, character sway, platform rails, and a saturation
change for the waiting beat. The preview has no repeated caption cards; text is
limited to the story label, 9:30 PM, station sign, and diary/waiting beats.

Evidence frames were manually opened and reviewed:

- `analysis/export-review/p2.4-frame-02.jpg`
- `analysis/export-review/p2.4-frame-06.jpg`
- `analysis/export-review/p2.4-frame-09.jpg`
- `analysis/export-review/p2.4-frame-16.jpg`

## Transcript and alignment status

The supplied attachment provides the authoritative opening and ending lines and
the narrative requirements, but it does not contain a complete importable
sentence-by-sentence transcript. The automatic transcript remains unreliable.
Therefore the three preview spans remain `review_required`; no full-story
timestamps or dialogue were fabricated. The opening is corrected to 9:30 PM.

The watchman, five children, tea-selling, three-month montage, disappearance,
and `शाम की पाठशाला` scenes are storyboarded but blocked until the complete
Devanagari script is imported and aligned against the MP3.

## Asset and quality limitations

The preview uses explicitly named procedural 2D layers because no supplied
visual models exist. This is a meaningful improvement over P2.3's symbolic
cards, but it is not a substitute for authored cinematic character artwork:
the teacher is a consistent silhouette, with no lip sync or pose library, and
there is no watchman or child model. A production-quality 79-second version
requires a station environment pack, teacher/watchman/child identity sheets,
poses or a rig, and a classroom/tea-stall environment.

## Validation

Passed:

- `npm run typecheck`
- `npm run test`
- 18-second Remotion render
- Manual review of four representative preview frames
- Original narration retained in the preview composition
- Output composition is 1080x1920 at 30 FPS, H.264/AAC by the Remotion render

Not completed:

- Full 79-second render (blocked by transcript verification and missing authored
  visual assets)
- Full storyboard timing alignment
- Character continuity validation for watchman and five children
- Final visual approval for the complete story
