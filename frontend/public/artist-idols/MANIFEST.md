# Idol Artist Image Generation Manifest

Generated Image 2.0 assets for admin-managed artist profiles.

These files are staging assets for administrator upload/selection only. Frontend pages should not hard-code these paths; artist images should come from the admin page, database, or Supabase Storage records.

## Reference Images

- `hiena/reference.png`: lemon-mint short bob, aqua eyes, bright compact idol silhouette.
- `rikane/reference.png`: ivory high ponytail, aqua eyes, clean sharp facial impression.
- `manase/reference.png`: lavender short bob, violet eyes, quiet violet-toned impression.

## Final Generated Images

| Character | File | Concept | Review |
| --- | --- | --- | --- |
| Hiena | `hiena/hiena-01-desert-archive-v5.png` | geo desert archive field camp | top/bottom/boots visible, lemon-mint identity preserved, no stage costume |
| Hiena | `hiena/hiena-02-autumn-bakery-v5.png` | autumn brick bakery morning | cozy workwear silhouette, bread basket prop, distinct from archive theme |
| Rikane | `rikane/rikane-01-autumn-courier-v5.png` | autumn hilltop courier stop | courier jacket/culotte/boots visible, blank parcels, no logo or readable text |
| Rikane | `rikane/rikane-02-desert-observatory-v5.png` | desert observatory archivist | longline vest/travel pants/boots visible, chart tube prop, no stage costume |
| Manase | `manase/manase-01-violet-rain-lantern-v5.png` | rainy violet lantern alley | rain jacket/skirt/boots visible, umbrella prop, rainy scene theme is clear |
| Manase | `manase/manase-02-porcelain-atelier-v5.png` | porcelain atelier terrace | blouse/vest/apron skirt/work shoes visible, ceramic studio theme is clear |

## Prompt Review Notes

- One subagent reviewed each character's prompt before generation.
- The final set intentionally avoids the user's originally listed themes where possible and uses more varied concepts: desert archive, autumn bakery, courier stop, observatory, rainy lantern alley, and porcelain atelier.
- The revised slot rules were applied: top, bottom, and shoes are mandatory; optional accessories are sparse; no readable text, logo, weapon, armor, animal ears, wings, or horns.
