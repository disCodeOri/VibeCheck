# Sidebar decoration assets

Generated with the built-in imagegen tool, 2026-09-21. Originals retained under the tool-generated image directory.

- `public/assets/sidebar-soft.png`: 1024 × 1536, RGBA, verified transparent pixels. Soft rounded two-lobed blue logo motif. Reference: `visuals/mobile/soft-style.png`, far-left decoration, x0–277/y469–862.
- `public/assets/sidebar-sharp.png`: 1024 × 1536, RGBA, verified transparent pixels. Three angular, diagonally rising blue ribbon plates. Reference: `visuals/female-before-soft-sidebar/06-chicfit.png`, far-left decoration, x0–250/y510–900.

Both are decorative assets: use empty alt text and hide from accessibility tree. Keep the native aspect ratio; clip at the sidebar’s left edge as required. They include gentle transparent edge falloff. Do not flatten the production files.

## Prompt specifications

Soft: background-extraction; reproduce only the giant rounded blue motif in the far-left reference margin. Two overlapping organic blue lobes tilted diagonally up-right, pale ice-blue top-right, cobalt lower-left centre, light-blue front lobe. Preserve reference shapes, gradients, orientation. Portrait 1024×1536, transparent alpha, no text/handwriting/hearts/UI/phones/people/frame/checkerboard. No angular ribbons.

Sharp: background-extraction; reproduce only the giant layered ribbon motif in the far-left reference sidebar. Three diagonally rising plates with slanted straight edges and rounded right corners: large pale rear, shorter cobalt middle, pale front lower-right. Preserve reference palette, geometry and overlap. Portrait 1024×1536, transparent alpha, left-edge bleed permitted. No text/UI/people/frame/background/glow/haze/checkerboard; no organic cloud shapes.

QA previews on the site’s pale surface: `artifacts/sidebar-soft-preview.png`, `artifacts/sidebar-sharp-preview.png`. Production alpha min 0, max 254 for each image.
