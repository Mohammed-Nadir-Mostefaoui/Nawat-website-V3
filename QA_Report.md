# Nawat Studio — QA Report
**Date:** May 27, 2026  
**Files reviewed:** `index.html` (1,644 lines) · `styles.css` (2,930 lines) · `script.js` (522 lines)  
**Summary:** 3 critical bugs, 6 high-severity issues, 7 medium-severity issues, 9 low/polish items.

---

## 🔴 Critical Bugs

### 1. Footer is invisible in light mode
**File:** `styles.css` lines 1662–1665  
The footer uses `color: var(--white-85)` (pure white `rgba(245,245,245,0.85)`) but its background is `var(--manifesto-bg)`, which in light mode resolves to `var(--white)` = `#F5F5F5`. Result: near-white text on a near-white background — the entire footer content is invisible in light mode. A CSS comment on line 1967 even acknowledges _"Footer is always dark"_ but the token system doesn't enforce it.

**Fix:** Give the footer its own dedicated always-dark background token or hardcode it:
```css
.footer {
  background: #0E0E11; /* always dark, regardless of theme */
  color: var(--white-85);
}
```

---

### 2. Mobile menu CTA doesn't close the overlay
**File:** `script.js` line 102  
The close-on-click handler looks for `.mobile-menu .nav-cta`, but the mobile menu's "Start Your Project" button has classes `btn btn-primary` — it doesn't have the `.nav-cta` class. Clicking it navigates to `#contact` but leaves the full-screen menu open on top of the content.

**Fix:** Add `.nav-cta` class to the mobile CTA anchor, or update the selector:
```javascript
// Change line 102 from:
$$('.mobile-menu .nav-link, .mobile-menu .nav-cta').forEach(...)
// To:
$$('.mobile-menu .nav-link, .mobile-menu a[href]').forEach(...)
```

---

### 3. Contact form never actually sends
**File:** `script.js` lines 314–317  
The form submit handler fakes a send with `setTimeout(1200)` — no backend call, no mailto, no third-party service (Formspree, EmailJS, etc.). Visitors who submit the form receive a success message but the message is never delivered.

**Action needed:** Integrate a real form endpoint before going live. Also add error handling — if the call fails, the button stays permanently disabled with no recovery path.

---

## 🟠 High Severity

### 4. Google Fonts loaded twice
**Files:** `styles.css` line 7 AND `index.html` line 20  
Google Fonts is imported via `@import` in the CSS file AND via a `<link>` tag in the HTML. Both requests fire on every page load, doubling font download time. Remove the `@import` from `styles.css` — the HTML `<link>` is already optimally placed with `preconnect` hints.

---

### 5. Nested `<nav>` inside `<nav>` — invalid HTML
**File:** `index.html` lines 51 and 63  
`<nav class="nav">` contains a second `<nav class="nav-links">`. Nested `<nav>` elements are invalid HTML5 and confuse screen readers (assistive tech announces two separate navigation landmarks). The inner one should be changed to `<div class="nav-links">`.

---

### 6. Missing `<main>` landmark
**File:** `index.html`  
The page has no `<main>` element wrapping the page content. This is a WCAG 2.1 accessibility requirement (Landmark Regions) and also affects how screen reader users and search engines navigate the page. All sections between `<nav>` and `<footer>` should be wrapped in `<main>`.

---

### 7. `initParallax()` is dead code
**File:** `script.js` lines 264–283  
This function targets `.hero-calligraphy` which no longer exists — the current hero design uses `.hero-calligraphy-main`. The function runs on every scroll event and silently returns early on every frame. Safe to remove or update to `.hero-calligraphy-main`.

---

### 8. Cursor glow RAF loop never cancelled
**File:** `script.js` lines 468–477  
`initCursorGlow()` starts an infinite `requestAnimationFrame` loop and stores the ID in `rafId`, but `cancelAnimationFrame(rafId)` is never called. The loop keeps running when the page is hidden, wasting CPU and battery. Add a `visibilitychange` listener to pause it.

---

### 9. Copyright year is 2025
**File:** `index.html` lines 1605, 1608, 1611  
All three language variants of the footer copyright read `© 2025`. Should be `© 2026`.

---

## 🟡 Medium Severity

### 10. Duplicate and dead CSS — needs cleanup
**File:** `styles.css`

Several issues in the stylesheet make it harder to maintain:

- **`@keyframes dotPulse` defined twice** — lines 593–596 and 2023–2026. Last one wins, but the first is dead.
- **`@media (max-width: 480px)` process-step rules duplicated** — lines 1930–1931 and 2001–2003. Identical rules repeated 60 lines apart.
- **`.hero { }` declared twice** — lines 481–489 and 2165–2172. Some properties conflict; should be merged into one rule.
- **`.work-card { display: flex... }` declared twice** — lines 1009 and 2042.
- **`.work-card-image { overflow: hidden }` declared twice** — lines 1031 and 1997.
- **Dead old-hero CSS** — Classes `.hero-calligraphy`, `.hero-bg`, `.hero-content`, `.hero-badge`, `.hero-title`, `.hero-sub`, `.hero-actions` are fully styled in CSS (lines 500–644) but none of these elements exist in the current HTML. The hero was redesigned but the old CSS wasn't removed. This is roughly ~140 lines of dead code.
- **`.hero-glow { display: none }` at line 2116** — There is no `.hero-glow` element in the HTML at all.

---

### 11. Blue-reduction overrides create a maintenance trap
**File:** `styles.css` lines 2054–2160  
A large "BLUE-REDUCTION OVERRIDES" block systematically overrides the blue color tokens established earlier in the file (e.g., buttons, nav CTA, form focus, pipeline dots all revert from `var(--blue)` to dark/neutral). This means the same component is styled in two places — change one, forget the other. The base token definitions for buttons, CTAs, and form elements should be updated directly instead of patched with overrides.

---

### 12. `<select>` options not localized
**File:** `index.html` lines 1440–1457  
Each `<option>` contains all three language versions concatenated (e.g., _"الهوية البصرية / Visual Identity / Identité Visuelle"_). When the user switches from Arabic to English, the dropdown still shows all three versions. This is the only element on the page that doesn't respond to language switching. Fix by using JS to update option text on `applyLang()`.

---

### 13. Mobile menu dialog missing accessible label
**File:** `index.html` line 132  
The mobile menu has `role="dialog" aria-modal="true"` but no `aria-label` or `aria-labelledby`. Screen readers announce it as an unlabelled dialog. Add `aria-label="Main navigation"` or `aria-labelledby` pointing to a heading inside the menu. Also, focus is not trapped inside the dialog when it opens, which is a WCAG 2.1 requirement for modal dialogs.

---

### 14. `no-transitions` class removed on `window.load` (too late)
**File:** `index.html` line 36  
The flash-of-transition prevention removes `no-transitions` on the `load` event, which fires only after all images and fonts have fully downloaded. On slow connections, this could mean transitions are suppressed for several seconds after the page is visible. Should use `DOMContentLoaded` instead, or a short `setTimeout(0)` after DOM is ready.

---

### 15. `initProcess()` — variable shadowing
**File:** `script.js` lines 239 and 246  
```javascript
const steps = $$('.process-step');          // outer — never used after declaration
// ...inside callback:
const steps = $$('.process-step', $('.process-grid'));  // inner — shadows outer
```
The outer `steps` variable is queried but never used. Only the inner re-query inside the callback is ever acted upon. The outer declaration can be removed.

---

### 16. Missing OG image and Twitter card meta tags
**File:** `index.html` lines 9–12  
Open Graph tags are present (`og:title`, `og:description`, `og:url`) but missing:
- `og:image` — without this, link previews on WhatsApp, LinkedIn, Facebook, etc. will show no image
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- `<link rel="canonical" href="https://nawat.studio">`

---

## 🔵 Low / Polish

### 17. Founder section is entirely placeholder
**File:** `index.html` lines 979–1029  
Founder name, photo slot, role title, LinkedIn/Instagram/Behance URLs, and the secondary team member are all placeholder content. The instructions for adding photos are left visible as `<div class="founder-img-instruction">` elements that render on screen. These need to be removed or hidden before launch.

---

### 18. Social links point to `#`
**File:** `index.html` lines 1018–1029 and 1615–1623  
LinkedIn, Instagram, Behance, and footer social icons all have `href="#"`. These should be populated with real URLs before launch.

---

### 19. Card tilt has no touch device guard
**File:** `script.js` lines 408–425  
`initCardTilt()` applies a 3D mousemove effect but — unlike `initCursorGlow()` — doesn't check `(hover: none)` to skip on touch devices. On iOS/Android, synthetic mousemove events can fire and produce unexpected tilt behavior. Add the same guard used in `initCursorGlow()`:
```javascript
if (window.matchMedia('(hover: none)').matches) return;
```

---

### 20. `window._manifestoProcessed` global flag
**File:** `script.js` lines 63 and 208  
State management via `window._manifestoProcessed` is fragile — any other script can accidentally overwrite it. Promote it to a module-level `let` variable at the top of `script.js`.

---

### 21. `role="navigation"` on `<nav>` is redundant
**File:** `index.html` line 51  
`<nav>` has an implicit ARIA role of `navigation`. Explicitly adding `role="navigation"` is redundant per the ARIA spec. The `aria-label="Main navigation"` is valuable and should be kept.

---

### 22. Service card "Learn more" is not interactive
**File:** `index.html` service cards, `styles.css` lines 880–896  
The `.service-card-arrow` span shows "Learn more" text and an arrow icon on hover, implying interactivity — but the card has `cursor: default` and no link or button wrapping it. Either make each card a link (to a service detail page, or `href="#contact"`), or remove the "Learn more" arrow since it creates a false affordance.

---

### 23. No `loading="lazy"` on below-fold images
**File:** `index.html`  
Logo images in seed dividers (lines 726–728, 922–925, 1133–1137, 1306–1310) and the calligraphy watermarks load eagerly. Adding `loading="lazy"` to images below the initial viewport reduces initial page weight.

---

### 24. No favicon ICO fallback
**File:** `index.html` line 43  
Only an SVG favicon is provided. Safari (older versions) and some environments don't support SVG favicons. Adding a 32×32 `.ico` fallback ensures broader compatibility.

---

## Summary Table

| # | Issue | Severity | File |
|---|-------|----------|------|
| 1 | Footer invisible in light mode | 🔴 Critical | styles.css |
| 2 | Mobile menu CTA doesn't close overlay | 🔴 Critical | script.js |
| 3 | Contact form never sends | 🔴 Critical | script.js |
| 4 | Google Fonts loaded twice | 🟠 High | css + html |
| 5 | Nested `<nav>` — invalid HTML | 🟠 High | index.html |
| 6 | Missing `<main>` landmark | 🟠 High | index.html |
| 7 | `initParallax()` is dead code | 🟠 High | script.js |
| 8 | Cursor glow RAF never cancelled | 🟠 High | script.js |
| 9 | Copyright year 2025 | 🟠 High | index.html |
| 10 | Duplicate / dead CSS | 🟡 Medium | styles.css |
| 11 | Blue-reduction override pattern | 🟡 Medium | styles.css |
| 12 | Select options not localized | 🟡 Medium | index.html |
| 13 | Mobile dialog missing a11y label | 🟡 Medium | index.html |
| 14 | `no-transitions` removed too late | 🟡 Medium | index.html |
| 15 | Variable shadowing in initProcess | 🟡 Medium | script.js |
| 16 | Missing og:image & Twitter cards | 🟡 Medium | index.html |
| 17 | Founder section all placeholder | 🔵 Low | index.html |
| 18 | Social links point to `#` | 🔵 Low | index.html |
| 19 | Card tilt — no touch guard | 🔵 Low | script.js |
| 20 | `window._manifestoProcessed` global | 🔵 Low | script.js |
| 21 | Redundant `role="navigation"` | 🔵 Low | index.html |
| 22 | "Learn more" is a false affordance | 🔵 Low | html + css |
| 23 | No `loading="lazy"` on below-fold images | 🔵 Low | index.html |
| 24 | No favicon ICO fallback | 🔵 Low | index.html |

---

*QA review conducted on full source reading — no browser rendering. Recommend visual testing on Chrome/Safari/Firefox in both light and dark modes, desktop and mobile, across AR/EN/FR language states.*
