# Tughra Royale — brand redesign changelog

Branch `redesign/brand-application`, on top of a baseline commit of the in-progress recolour (`9ade9549`).
Every page, route, menu entry and piece of copy is kept. The home page (hero) is unchanged: its computed
styles, logo bitmap and button match the baseline exactly (checked side by side with the panorama hidden).

## Across the app
- **Tokens.** One colour layer in `src/styles/tokens.css` (espresso, cocoa, bronze, bronze-deep, gold, gold-pale,
  cream, parchment, ink), mapped into Tailwind (`bg-espresso`, `border-bronze/30` …) and mirrored in
  `src/theme/tokens.js` for the map. No raw colour remains in any page; the only literals left are inside the
  frozen hero. `theme-color` is `#1C130D`.
- **Motion.** All animation is GSAP (`src/motion`): power2/power3 eases only, heading mask wipes, fade-rises,
  bronze hairlines drawing on, gliding indicators, ScrollTrigger reveals in the grids, a reduced-motion
  fallback. Framer Motion is removed. Hover and press are short CSS transitions.
- **Route changes.** Every route change uses the same curtain: espresso settles, a gold hairline draws across,
  the page reveals.
- **Full screen only.** A tap-anywhere screen on load (the preloader waits for it) and whenever full screen is
  left; one tap returns to the same page. Browsers without full-screen support (iPhone Safari) skip it, so the
  site still opens. Gallery and Amenities "picture only" modes no longer exit browser full screen.
- **Shared controls.** Circular bronze-outline buttons with gold icons (Back, Home, Close, arrows) in the same
  place on every page, a segmented control, corner marks, one icon set, one filled gold button per view.
- **Removed as decoration.** Drifting gold specks, cursor-following glows, mouse parallax, the spinning
  auto-rotate icon, the 360° gold flash, pulsing map rings, the decorative waves, the birds and fishing boats on
  the map.
- **Contrast.** All text passes WCAG AA. Secondary text on cream uses `--ink-soft` (5.6:1), because parchment on
  cream is 1.16:1. Gold-pale labels on espresso are 12.1:1.

## Per page
| Page | What changed |
|---|---|
| Menu | Framed cocoa column with numbered serif entries; a gold underline glides to the entry being pointed at; framed preview on the right crossfades each entry's picture (tower and three facts at rest). Phones: full-height list with a thumbnail beside each entry. |
| Gallery | Viewer kept; crossfade with a 3% drift, thumbnail strip, segmented Exterior/Amenities, gold-pale captions. New editorial grid of every render (bronze hairline gutters); a tile opens that render. |
| Amenities | Viewer and autoplay kept; caption is a cocoa card with a bronze icon tile; autoplay shown as a drawing line. New card grid; a card opens that amenity. |
| Floor Plans | Same layout. Gold floor pill glides along a bronze rail; cream residence card cross-fades instead of re-mounting; segmented unit switch; gold "View floor plan"; plan in a parchment frame. |
| Neighborhood | Map recoloured from the tokens; solid cocoa location table with segmented categories; quiet bronze pins; styled zoom controls; the table appears even if the map is slow. |
| 360° View | Cocoa dock, gliding time-of-day ring, bronze floor slider, espresso dip between scenes, no spinning; logo, Home and Back match other pages; adds a step-up button. |
| Enquire | Cocoa inputs, bronze-deep borders, gold focus ring, one gold submit; bronze rule draws along the slanted cut; accessible labels and errors. |
| Features | Framed placeholder (title, Coming soon, the menu's line, theatre picture). |
| Preloader | Same sequence in espresso and gold. |

## Content to confirm
- **Features** has no content yet.
- **Floor Plans:** carpet area and facing are "To be confirmed"; the **Status** cell shows an instruction
  ("Choose a floor on the tower…") rather than a status.
- **Enquire is not connected:** `ENQUIRY_ENDPOINT` in `src/sections/Enquiry.jsx` is empty, so submissions go
  nowhere (the thank-you screen says so).
- The renders carry a "Brainwing" watermark.
- The full-size original renders in `public/assets/{Amenties,galleryexteriorrender,galleryinteriorrender,iso}`
  (233 MB) are git-ignored; the app uses the WebP copies.
