# Design QA

- Source: `figma-reference.png` (Figma node `11206:52359`)
- Implementation: `implementation-final.png`
- Original reference viewport: 1920 x 1737
- Current product viewport: 1920 x 1080 with global proportional scaling
- State: default page with files, knowledge base, two chat rounds, result tools, and generated records

## Comparison Evidence

- Full view: `design-comparison-final.png`
- Focused right panel: `design-comparison-right.png`

## Iteration History

1. Rebuilt the page around the exact 1920 x 1737 Figma canvas and restored the three fixed panel dimensions and source copy.
2. Replaced approximate upload, checkbox, refresh, note, and menu graphics with source-node assets; corrected record spacing and vertical baselines.
3. Matched the active record state, business icon colors, tool arrows, responsive scaling, and hover/click behavior.
4. Adapted the approved long-page design to the requested 1920 x 1080 product viewport: fixed composer, independently scrolling conversation and records, balanced title metadata spacing, and animated generating icons.

## Verification

- Panel geometry: 450 / 940 / 450 px with 20 px gutters.
- All image assets load successfully.
- No page overflow at 1920 x 1080 or the proportionally scaled 1280 x 720 viewport.
- Conversation scroll does not move the bottom composer.
- Generating record icons run a continuous 0.9 s rotation.
- Prompt selection fills the composer; sending clears it.
- Tool, tab, file, record, profile, upload, note, and more-action controls provide hover/click feedback.
- Remaining differences are limited to minor browser font antialiasing and subpixel rendering.

passed
