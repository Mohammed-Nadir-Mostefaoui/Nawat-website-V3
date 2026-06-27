# Nawat Studio — Design QA Report
**Date:** May 28, 2026  
**Reviewer role:** Senior Product Designer · Senior UX/UI Designer · Senior Brand Designer  
**Method:** Full source-code design audit (HTML + CSS) — all tokens, components, layout systems, typography scales, colour contracts, and motion budgets reviewed line-by-line  

---

## Executive Summary

Nawat Studio's website has a clear, distinctive brand concept — the "seed" metaphor is well-executed through the concentric rings, logo mark dividers, and Arabic calligraphy as the hero centrepiece. The design system bones are solid: a tight token system, good responsive skeleton, and a consistent typographic voice. However, there are meaningful issues across hierarchy, contrast accessibility, motion budget, and structural redundancy that should be addressed before launch.

**20 issues total:** 4 critical · 6 high · 6 medium · 4 low

---

## 🔴 Critical — Affects Communication or Brand Integrity

### 1. Hero Hierarchy Is Inverted
**Location:** `.hero-brand-display`, `.hero-headline`, `.hero-sub-new`

The hero centres a calligraphy SVG at `clamp(260px, 52vw, 700px)` wide alongside a headline capped at `clamp(20px, 2.8vw, 38px)`. At a 1440px viewport, the calligraphy renders at 700px wide while the headline is 38px tall — an 18:1 size ratio between a decorative brand mark and the product's value proposition.

This inverts the communication hierarchy. The calligraphy is beautiful but is brand decoration; the headline ("The Seed of Every Exceptional Digital Product") is the actual message. A visitor's eye lands on the calligraphy, then struggles to find the value prop text at 38px below it.

**Recommendation:**
- Increase `hero-headline` to `clamp(28px, 3.8vw, 52px)` — closer to the h2 scale
- Shrink the calligraphy to `clamp(200px, 38vw, 520px)` so it reads as a brand mark, not the headline itself
- Or: position calligraphy as a background watermark at 15-20% opacity and bring the headline forward as the primary element

---

### 2. Body Copy Contrast Failures (WCAG AA)
**Location:** Multiple components

Several text colours fail WCAG 2.1 AA contrast requirements:

| Element | Token Used | Approx. Colour | Contrast on Light bg | Status |
|---------|-----------|----------------|---------------------|--------|
| `.hero-meta-item` (11px) | `--c-text-30` | `#b5b5b8` | ~2.2:1 | ❌ Fails |
| `.scroll-label` (10px) | `--c-text-30` | `#b5b5b8` | ~2.2:1 | ❌ Fails |
| `.pipeline-label` (11px) | `--c-text-30` | `#b5b5b8` | ~2.2:1 | ❌ Fails |
| `.pull-quote-author` (13px) | `--c-text-30` | `#b5b5b8` | ~2.2:1 | ❌ Fails |
| `.hero-sub-new` (13-16px, wt 300) | `--c-text-60` | `#717174` | ~4.7:1 | ⚠️ Borderline |
| `.footer-col-title` (11px) | `--white-30` | `rgba(245,245,245,0.3)` | ~2.8:1 on dark | ❌ Fails |
| `.footer-copy` (12px) | `--white-30` | similar | ~2.8:1 on dark | ❌ Fails |

The `--c-text-30` token is used aesthetically to create a subtle layered look, which is valid for large decorative elements, but should not be applied to any text that communicates information.

**Recommendation:** Replace `--c-text-30` on informational text with `--c-text-60` as a minimum. For small (≤13px) text, aim for `--c-text-85`. Raise footer secondary text to `--white-60`.

---

### 3. Pipeline Section Has Stray Structural HTML
**Location:** `index.html` lines ~600-607, `.services-pipeline`

The pipeline block wraps its label in an erroneous outer `<div>` that also contains a stray `<div class="service-num">07</div>` and a compass SVG icon:

```html
<div class="services-pipeline reveal">
  <div>
    <div class="service-num">07</div>
    <div class="service-icon-wrap"><!-- compass icon --></div>
    <p class="pipeline-label">Full Spectrum · الطيف الكامل</p>
  </div>
  <div class="pipeline-track">...
```

This renders a blue "07" label and a compass icon floating above the pipeline track — content that is not part of the design intent and will visually confuse users. It appears to be copy-pasted from a service card.

**Recommendation:** Remove the outer `<div>`, the `.service-num` element, and the `.service-icon-wrap` entirely. The `.pipeline-label` should be a direct child of `.services-pipeline`.

---

### 4. Two Redundant "Full Spectrum" Sections in Services
**Location:** `.services-pipeline` + `.spectrum-band`

The Services section contains two consecutive components that both show the same 5-step service flow (Identity → Library → UX → Prototype → Testing):

1. **Pipeline** — a connected dot track with numbered steps
2. **Spectrum Band** — a 5-column grid showing the same 5 services

Presenting the same information twice in sequence creates confusion about their purpose and breaks the narrative flow. A visitor will assume one of them is interactive or that they convey different information — and they don't.

**Recommendation:** Choose one of these components and remove the other. The spectrum band is more polished and includes the CTA — keep that. Remove the pipeline, or repurpose it to show client onboarding stages (Briefing → Discovery → Design → Review → Handoff) which would be genuinely distinct.

---

## 🟠 High Severity — Affects Usability or Brand Perception

### 5. `hero-sub-new` Weight 300 at Small Size Creates Illegibility
**Location:** `.hero-sub-new` — `font-weight: 300; font-size: clamp(13px, 1.2vw, 16px)`

The sub-headline uses `font-weight: 300` (light) at a maximum of 16px with 60% opacity. IBM Plex Sans at 300 weight renders thin strokes that are already low-contrast; combined with the 60% opacity reduction, this text will be nearly illegible on lower-quality screens and for users with mild visual impairments. The Arabic text at this weight and size is particularly hard to read.

**Recommendation:** Raise to `font-weight: 400` (regular). The visual difference between 300 and 400 at 13-16px is significant for legibility.

---

### 6. Stats Section "1" Reads as a Broken Number
**Location:** `.stats-row` — third stat item with `data-count="1"`

The stats row presents three values: **100%**, **5+**, and **1**. The "1" stat animates from 0 to 1 and represents "full commitment to your single project." While this is intentionally a positioning statement, visually it reads like a bug — a counting animation that resolves to the number one, next to 100% and 5+ years, deflates the section's impact significantly.

**Recommendation:** Either remove this stat and replace with something compelling ("3 languages", "MENA + Global", "∞ iterations") or present it differently — e.g., as `1:1` (one client, full focus) or with a context label that frames it before the number animates.

---

### 7. `manifesto-layout` Fixed 340px Column Cramps on Tablet
**Location:** `.manifesto-layout` — `grid-template-columns: 1fr 340px`

Between 768px and 1024px (tablet), the manifesto grid gives the aside a fixed 340px column. At 800px viewport, with `--gutter` of ~40px, the container is 720px — leaving only 380px for the manifesto text column (minus the 40px gap). The manifesto lines at `clamp(28px, 4vw, 56px)` (32px at 800px) will overflow or cause very tight line wrapping across 4-5 words per line in Arabic.

**Recommendation:** Change to `grid-template-columns: 1fr minmax(280px, 340px)` and add a tablet breakpoint at 1024px that collapses to a single column (`grid-template-columns: 1fr`).

---

### 8. Hero Gap System Is Uniform — Needs Hierarchy
**Location:** `.hero-inner` — `gap: clamp(20px, 3.5vw, 36px)`

All five hero elements (brand display, divider, text, actions, meta strip) share a single `gap` value. This creates visually equal spacing between them, which undermines hierarchy — the gap between the calligraphy and the divider should be different from the gap between the headline and the body copy, which should differ from the gap before the CTA.

**Recommendation:** Replace the single `gap` with `margin` on individual elements:
```css
.hero-brand-display { margin-bottom: clamp(24px, 4vw, 48px); }
.hero-divider       { margin-bottom: clamp(20px, 3vw, 32px); }
.hero-text          { margin-bottom: clamp(16px, 2vw, 24px); }
.hero-actions-new   { margin-bottom: clamp(24px, 3.5vw, 40px); }
```
This gives the headline-to-body-copy a tighter relationship, and creates breathing room before and after the CTA.

---

### 9. Motion Budget Is Too High — Risk of Perceived Jank
**Location:** Multiple sections

The page runs the following concurrent animations at initial load:

- 5× `blurIn` animations in the hero (staggered 0.1–0.9s), each using `filter: blur(16px)` — GPU-heavy
- 16× `floatUp` particle animations (infinite)
- `tickerScroll` marquee (infinite)
- Cursor glow `requestAnimationFrame` loop
- `manifesto-ring-pulse` (3× infinite rings) once manifesto enters view
- `scrollDrop` scroll indicator (infinite)

`filter: blur()` is one of the most GPU-expensive CSS properties. Running 5 simultaneous blur-based entrance animations on page load will cause frame drops on mid-range Android devices and older MacBook Pros.

**Recommendation:**
- Replace the blur entrance with a simple `opacity` + `translateY` for 3 of the 5 hero elements; keep blur only on the calligraphy (the centrepiece)
- Reduce particles from 16 to 8
- The scroll indicator animation is decorative — apply `prefers-reduced-motion` guard specifically to it and the particles (already done for all, which is good, but be explicit)

---

### 10. Arabic Quotation Mark Is Wrong for RTL Layout
**Location:** `.pull-quote-mark` — `"` character at 120px

The pull-quote uses a left-opening quotation mark (`"`) at 120px as a decorative element. In Arabic RTL layout, this mark appears on the left side of the quote text (which flows RTL), making it semantically and visually an opening mark in the wrong position. Arabic quotation convention uses `«` (guillemets) or places `"` on the right side.

**Recommendation:**
```css
html[dir="rtl"] .pull-quote-mark { content: '«'; /* or flip position to end */ }
```
Or use a CSS variable: define `--quote-mark: '"'` and override for RTL with `--quote-mark: '«'`.

---

## 🟡 Medium Severity — Affects Polish and Coherence

### 11. Section Label Inconsistency — Two Styles in Use
**Location:** Multiple sections

Two different section label patterns are in use:
- **Pattern A:** `.section-label` with a `::before` pseudo-element (24px blue line + gap 10px) — used in Services, Work, Founder, Process
- **Pattern B:** `.manifesto-label-text` — text-only, no decorative line, no `::before`

The manifesto breaks the pattern established by all other sections. This inconsistency is small but breaks the visual rhythm that makes a page feel designed rather than assembled.

**Recommendation:** Replace `.manifesto-label-text` with the standard `.section-label` class and pattern.

---

### 12. Service Card "Learn More" Arrow Has No Destination
**Location:** `.service-card-arrow` — all 6 service cards

The "Learn more / اكتشف أكثر" arrow appears on hover of each service card, strongly implying interactivity and a link to a service detail page. But the cards are `cursor: default` and wrap no `<a>` tag. This is a false affordance — users expect to click and land somewhere.

This was flagged in the technical QA as issue #22. It remains a design issue: the affordance has no interaction behind it.

**Recommendation:** Either remove the arrow entirely (cleanest solution for a page with no sub-pages yet), or make each card an anchor linking to `#contact` with a pre-filled subject (`?subject=Visual Identity inquiry`).

---

### 13. Seed Divider Is Underutilised as a Section Break
**Location:** `.seed-divider` — appears between Services and Work

The seed divider (a horizontal line with the 80px logo mark at centre) is an elegant brand element — but it only appears once on the page. Other sections transition through background colour change (`--c-bg` ↔ `--c-bg-alt`) without a visual marker. This makes the single divider feel arbitrary rather than systematic.

**Recommendation:** Use the seed divider consistently — either between every major section, or define a clear rule for when it appears (e.g., every time the background colour changes). Currently: Work has a background transition but no divider, Process has a background transition but no divider.

---

### 14. Founder Section Name and Role Are Placeholder in Two Places
**Location:** `index.html` — founder section and team cards

The founder's name appears as a placeholder (likely "اسم المؤسس" or similar empty state), and the team member cards below still show placeholder silhouettes with the `.founder-img-instruction` overlay visible on-screen (z-index 10, renders above the photo background). This is noted in the technical QA but deserves emphasis from a brand perspective: **a design studio's own website must present the human behind it credibly.** An empty founder section damages trust more than having no founder section at all.

**Recommendation:** Either populate with real content before launch, or replace with a "Studio Story" narrative section that doesn't require a photo — e.g., a timeline or values list.

---

### 15. Work Cards Use Only Placeholder Content With No Indication of Real Projects
**Location:** `.work-card` — all 3 cards

All three work cards show CSS-drawn mockup illustrations, not real screenshots. The featured card is labelled "ERP · SaaS" and the body text suggests a real client engagement ("منتج ERP — رحلة من الهوية إلى الاختبار"), but the imagery is entirely synthetic. The secondary cards have `work-coming-badge` "Coming Soon" overlays.

For a design studio, the work section is the primary trust signal. Showing CSS wireframe placeholders with "Coming Soon" reduces credibility.

**Recommendation:**
- If real work cannot be shown (NDA, incomplete), replace the Work section temporarily with a "Studio Capabilities" section that shows process and methodology instead
- Or: show one real case study (even personal/concept work) with genuine screenshots

---

### 16. Manifesto Line Spacing Is Inconsistent with the Grid
**Location:** `.manifesto-line` — `margin-bottom: 0.2em`

The manifesto lines have `margin-bottom: 0.2em` set on the `.manifesto-line` element. At `clamp(28px, 4vw, 56px)` font size, 0.2em = 5.6–11.2px. This collapses the space between lines almost to zero — the manifesto reads as a dense block rather than a sequence of powerful individual statements. The intent seems to be for tight-leading poetry-style text, but 0.2em is too tight for this effect to read as intentional spacing.

**Recommendation:** Increase to `margin-bottom: 0.5em` to let each line breathe as a distinct thought. Or consider `margin-bottom: 0` but increase `line-height` from 1.2 to 1.4 for the same visual result.

---

## 🔵 Low / Polish

### 17. `hero-latin-track` Separator Dot `·` vs. `•` Consistency
**Location:** `index.html` hero, `.hero-latin-dot`

The hero wordmark uses the middle dot `·` (U+00B7) as a separator between NAWAT and STUDIO. The ticker uses `•` (U+2022 bullet). The hero-meta strip uses a rendered `.hero-meta-dot` span (CSS 5px circle). Three different bullet styles across one screen — the middle dot and the CSS dot in the meta strip are fine, but the ticker bullet creates a visual inconsistency with the brand's wordmark separator.

**Recommendation:** Replace the ticker `<span class="ticker-dot">` CSS circles with the `·` character to match the wordmark, or standardise all three to the CSS circle approach.

---

### 18. Dark Mode Hero Calligraphy Filter Is Harsh
**Location:** `[data-theme="dark"] .hero-calligraphy-main` — `filter: invert(1) opacity(0.9)`

`filter: invert(1)` converts a black SVG to white in dark mode. This technically works but destroys any tonal variation in the calligraphy artwork — it becomes a flat white silhouette. If the calligraphy SVG has any gradient or stroke weight variation, it is lost. The 90% opacity slightly reduces the harshness but not meaningfully.

**Recommendation:** Provide a separate dark-mode version of the calligraphy SVG asset (`Nawat Studio Dark.svg`) with the strokes pre-set to white/near-white. This gives art direction control over dark mode rendering, similar to how the logo marks use separate `logo-dark-mode` / `logo-light-mode` assets.

---

### 19. Ticker Is English-only When Language Is Arabic
**Location:** `index.html` — `.ticker-track` content

The ticker contains a mix of English, Arabic, and French service terms in a fixed order. This is a design choice that could work as a bilingual brand statement — but the Arabic terms (`الهوية البصرية`, `مكتبة التصميم`, etc.) are surrounded by English terms in a fixed sequence regardless of the active language. In Arabic mode, a visitor sees: "Visual Identity · Design System · UX Design · الهوية البصرية · مكتبة التصميم". Having both `Visual Identity` and `الهوية البصرية` in the same ticker reads as redundant.

**Recommendation:** Make the ticker content language-aware. In Arabic mode, show Arabic terms first (or exclusively). The ticker is declared `aria-hidden="true"` so there's no accessibility risk in reordering.

---

### 20. Back-to-Top Button Colour Is High Contrast Against Page
**Location:** `.back-to-top` — `background: var(--c-text); color: var(--c-bg)`

The back-to-top button uses `--c-text` (black #0E0E11 in light mode) as its background. This is visually correct for contrast, but creates a harsh floating element against the light page. Most contemporary design studio sites use a more subtle pill — the same ghost/surface treatment used elsewhere on the page, or the brand blue. Using the maximum-contrast black circle makes it feel like a utility widget from a different design language.

**Recommendation:** Change to `background: var(--blue); color: #fff` — consistent with the CTA language, visually lighter, and maintains strong contrast against both light and dark backgrounds.

---

## Summary Table

| # | Issue | Severity | Section |
|---|-------|----------|---------|
| 1 | Hero hierarchy inverted — calligraphy dominates headline | 🔴 Critical | Hero |
| 2 | Body copy contrast failures (WCAG AA) — `--c-text-30` on small text | 🔴 Critical | Global |
| 3 | Stray `07` label + icon in pipeline HTML | 🔴 Critical | Services |
| 4 | Pipeline + Spectrum Band are identical redundant components | 🔴 Critical | Services |
| 5 | `hero-sub-new` weight 300 at 13-16px is illegible | 🟠 High | Hero |
| 6 | Stats "1" reads as a broken/placeholder number | 🟠 High | Services |
| 7 | Manifesto aside fixed 340px cramps tablet text column | 🟠 High | Manifesto |
| 8 | Hero gap uniform across all elements — no hierarchy | 🟠 High | Hero |
| 9 | Motion budget too high — 5× blur() animations on load | 🟠 High | Global |
| 10 | Arabic quotation mark wrong for RTL context | 🟠 High | Manifesto |
| 11 | Section label style inconsistency (manifesto breaks pattern) | 🟡 Medium | Manifesto |
| 12 | "Learn more" arrow is a false affordance with no link | 🟡 Medium | Services |
| 13 | Seed divider appears only once — underutilised as system element | 🟡 Medium | Layout |
| 14 | Founder section is placeholder — damages trust for a design studio | 🟡 Medium | Founder |
| 15 | Work section is all placeholder — primary trust signal is empty | 🟡 Medium | Work |
| 16 | Manifesto line `margin-bottom: 0.2em` collapses breathing room | 🟡 Medium | Manifesto |
| 17 | Three different separator dot styles on same screen | 🔵 Low | Hero/Ticker |
| 18 | Dark mode calligraphy `invert(1)` loses tonal art direction | 🔵 Low | Hero |
| 19 | Ticker mixes both languages redundantly (Visual Identity + الهوية البصرية) | 🔵 Low | Ticker |
| 20 | Back-to-top button colour is off-system | 🔵 Low | Global |

---

## Priority Fix Order

**Ship-blockers** (must fix before launch): Issues 1, 2, 3, 4, 14, 15  
**Pre-launch polish** (should fix): Issues 5, 6, 7, 8, 10, 12, 16  
**Post-launch improvements**: Issues 9, 11, 13, 17, 18, 19, 20  

---

## What Is Working Well

The design has genuine strengths worth preserving:

- **Brand concept is distinctive** — the seed/nawat metaphor is coherent and well-executed in the manifesto rings, seed dividers, and calligraphy centrepiece
- **Token system is clean** — the CSS custom property architecture is well-structured; light/dark theming is thorough
- **RTL implementation is careful** — `inset-inline`, `inset-inline-start/end`, direction-aware animations, and font switching all work correctly
- **Typography pairing is strong** — IBM Plex Sans Arabic + IBM Plex Sans is an excellent bilingual pairing; both fonts share visual DNA and render consistently at all sizes
- **Manifesto section has real voice** — the copy is confident, specific, and not generic agency-speak
- **Service card grid layout** — the 3-column grid with 1px gap borders is a clean, modern pattern
- **Form design** — well-considered: sticky info column, proper field sizing, focus states, and success handling
- **Footer architecture** — the always-dark footer with 2fr/1fr/1fr column layout is structurally sound

---

*Design QA conducted via full source-code analysis of `index.html` (1,644 lines) and `styles.css` (~2,800 lines). Recommend validating contrast ratios using a browser accessibility inspector (e.g. Chrome DevTools > Accessibility tab) and testing all three language states (AR/EN/FR) in both light and dark modes.*
