# Image sourcing — read before publishing

## What the images are
Every product/equipment/hero photo on this site (boilers, chillers, cooling towers,
pumps, PLC panels, etc.) is an **AI-generated illustrative render**, not a real
photograph of Dexterous Engineering's own equipment, staff, or premises. They were
supplied as part of the rebuild brief's asset ZIP, already containing a generated
"Dexterous Engineering" wordmark and, in a few cases, other companies' real trademarks
(DAIKIN, SIEMENS, Schneider Electric) baked into the scene.

## What I did to them
Before use, every image was cleaned:
- All instances of the generated Dexterous Engineering mark/wordmark were removed
  (cloned/inpainted from surrounding texture), since that is not your real logo and
  presenting it as if photographed would misrepresent your brand identity.
- All identified third-party trademarks (DAIKIN badge on the chiller image, SIEMENS
  branding on the PLC panel, Schneider Electric wordmarks on the breaker bank) were
  removed for the same reason — they are real companies' marks and Dexterous
  Engineering has no confirmed relationship with them in the verified content.
- Images were then cropped, converted to WebP, and exported at 640/1024/1600(/1920)px
  widths for responsive `srcset` delivery. Total image payload is about 5.3 MB across
  all 11 pages.

## What this means for you
These renders are suitable as **illustrative placeholders** — consistent in style,
free of any misappropriated branding — but they are not real photographs of your
plant, staff, or projects. Nothing on the site claims otherwise; captions on the
single-news article page explicitly say "placeholder image."

**Before this goes live**, swap in real photography wherever you have it, especially:
- The Home and About hero images (currently the supplied renders)
- Product category images on the Products page
- Any image used near a specific brand name (OZMAKSAN, YORK, GENIUS, TRANTER,
  HYUNDAI ELECTRIC, BUCKMAN) — using a generic render next to a named brand risks
  implying it depicts that brand's actual equipment, which it does not.

## How to swap an image
Images live in `assets/images/photos/`, named `<slug>-<width>.webp` (e.g.
`boiler-1024.webp`). To replace one:
1. Add your real photo to `assets/images/photos/` at the same widths (or just the
   widths you have) using the same slug.
2. Re-export or hand-resize to `640`, `1024`, `1600` px wide (and `1920` for full-width
   heroes) as WebP or JPEG.
3. No HTML changes are needed if you keep the same filenames — the `srcset` already
   points at that slug's set.

The **logo** (`assets/images/logo/logo.png`, `logo1.png`, `logo-white.png`) is your
original, supplied file, used unmodified throughout — nothing to change there.
