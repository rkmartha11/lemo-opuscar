# Answered. — "What happens if the Moon disappears tomorrow?" (Variation C)

Separate 9:16 shots (1080x1920, 30 fps, H.264 + AAC 48 kHz) for intercutting.
Lemo Opuscar renders S01 S02 S07 S09 S10 (code-drawn); OpenMontage renders S03 S04 S05 S06 S08 (real footage).
Both tools draw captions, tags and note cards with the same `engine/kit.js` + `engine/brand.js`, so the type matches exactly.

- Narration: Epidemic Sound AI voice "Mia" (no WAVs were supplied). Shot length = narration + 0.3 s, except S10 = 5.0 s (end card needs time to be read).
- Music: one Epidemic track ("Expansion"), sliced across S01→S10 in story order: cut in that order and the bed runs continuously.
- Mix: −16 LUFS integrated per shot, peaks ≤ −1 dBFS.
- Brand colours are PLACEHOLDERS in `engine/brand.js` until the final hex codes are supplied; re-render is one command per shot.
- Sources and licences: `credits.txt`.
