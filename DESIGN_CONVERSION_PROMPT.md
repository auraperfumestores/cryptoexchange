# DESIGN CONVERSION PROMPT — PREMIUM FINTECH UI
## Reference: Onramp Money (onramp.money) Design Language
### Instructions for Claude Code

---

## OBJECTIVE

You are a senior frontend engineer and UI designer. Your task is to take my **existing website layout and content** and re-skin it with a **premium fintech aesthetic** extracted from the Onramp Money website (onramp.money). Do NOT redesign the layout structure or change the content — only convert the visual design: colors, typography, spacing, components, shadows, borders, and motion. The output must look and feel indistinguishable from a world-class, VC-backed crypto/fintech product.

---

## DESIGN PHILOSOPHY

This design system follows a **"Clinical Confidence"** aesthetic — clean white surfaces, bold blue authority, structured whitespace, and micro-interactions that signal trust and speed. Every design decision communicates: fast, secure, globally available, and easy to use. Nothing is decorative. Nothing is accidental.

**Core principles:**
- White space is a feature, not wasted space. Be generous.
- Blue is the only accent color. Use it consistently and intentionally.
- Typography does the heavy lifting — weight contrast over color contrast.
- Cards float. Content breathes. Buttons are decisive.
- Every interactive element gives tactile feedback.

---

## DESIGN TOKEN SYSTEM

Implement these as CSS custom properties at `:root`. Use them everywhere — no hardcoded values allowed.

### Color Palette

```css
:root {
  /* Primary Brand */
  --color-primary:           #2D55FF;   /* Core blue — CTA buttons, stat numbers, links */
  --color-primary-hover:     #1A3FE0;   /* Darkened on hover */
  --color-primary-light:     #EEF2FF;   /* Tinted card backgrounds, pill badges */
  --color-primary-lighter:   #F5F7FF;   /* Section backgrounds, subtle fills */
  --color-primary-border:    #C7D2FE;   /* Card borders with blue tint */

  /* Text Hierarchy */
  --color-text-primary:      #0A0F1C;   /* Headings, hero text — near black with blue undertone */
  --color-text-secondary:    #64748B;   /* Body copy, descriptions */
  --color-text-muted:        #94A3B8;   /* Placeholders, disabled, meta text */
  --color-text-on-dark:      #FFFFFF;
  --color-text-blue:         #2D55FF;   /* Body text in blue (used sparingly for hero descriptions) */

  /* Surfaces */
  --color-surface:           #FFFFFF;   /* Main page background */
  --color-surface-raised:    #FFFFFF;   /* Cards, modals */
  --color-surface-subtle:    #F8FAFF;   /* Section alternating backgrounds */
  --color-surface-dark:      #0A0A0A;   /* Announcement bar, dark sections */

  /* UI Elements */
  --color-border:            #E2E8F0;   /* Default borders */
  --color-border-blue:       #BFCFFE;   /* Selected/active states */
  --color-badge-bg:          #F1F5F9;   /* Stat badges, pill backgrounds */
  --color-badge-text:        #475569;

  /* Status Colors */
  --color-success:           #10B981;   /* Green for verified/secure badges */
  --color-success-light:     #D1FAE5;

  /* Shadows */
  --shadow-card:             0 2px 16px rgba(45, 85, 255, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04);
  --shadow-card-hover:       0 8px 32px rgba(45, 85, 255, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-widget:           0 4px 32px rgba(45, 85, 255, 0.10), 0 1px 6px rgba(0, 0, 0, 0.05);
  --shadow-button:           0 4px 12px rgba(45, 85, 255, 0.30);
  --shadow-nav:              0 1px 0 rgba(0, 0, 0, 0.06);
}
```

### Typography Scale

```css
:root {
  /* Font Families */
  --font-primary:   'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:      'JetBrains Mono', 'Fira Code', monospace; /* for numbers/values */

  /* Font Weights */
  --fw-regular:  400;
  --fw-medium:   500;
  --fw-semibold: 600;
  --fw-bold:     700;
  --fw-extrabold:800;

  /* Type Scale — Desktop */
  --text-hero-stat:   clamp(56px, 6vw, 80px);   /* "1,551,643+ users" */
  --text-hero:        clamp(36px, 4vw, 52px);    /* Hero headline */
  --text-h1:          clamp(32px, 3.5vw, 48px);
  --text-h2:          clamp(28px, 2.8vw, 40px);  /* Section headings */
  --text-h3:          clamp(20px, 2vw, 26px);    /* Card headings */
  --text-h4:          18px;
  --text-body-lg:     18px;
  --text-body:        16px;
  --text-body-sm:     14px;
  --text-caption:     12px;
  --text-eyebrow:     11px;                      /* ALL-CAPS labels above headings */

  /* Line Heights */
  --lh-tight:   1.1;   /* Hero numbers */
  --lh-heading: 1.25;  /* Section headings */
  --lh-body:    1.65;  /* Body paragraphs */

  /* Letter Spacing */
  --ls-eyebrow:  0.12em;   /* Eyebrow caps labels */
  --ls-button:   0.02em;
  --ls-heading:  -0.02em;  /* Tight for large headings */
  --ls-stat:     -0.04em;  /* Very tight for hero numbers */
}
```

### Spacing & Layout

```css
:root {
  /* Spacing Scale */
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;
  --space-20:  80px;
  --space-24:  96px;
  --space-32: 128px;

  /* Section Vertical Padding */
  --section-padding-y: clamp(64px, 8vw, 120px);

  /* Container */
  --container-max:     1200px;
  --container-px:      clamp(20px, 4vw, 48px);

  /* Grid */
  --grid-gap:          24px;
  --grid-gap-lg:       32px;

  /* Border Radius */
  --radius-sm:    6px;
  --radius-md:    10px;
  --radius-lg:    16px;     /* Cards */
  --radius-xl:    24px;     /* Large cards, widget */
  --radius-pill:  999px;    /* Buttons, tags, badges */

  /* Transitions */
  --transition-fast:   150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base:   250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow:   400ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 350ms cubic-bezier(0.34, 1.56, 0.64, 1); /* Bounce for micro-interactions */
}
```

---

## FONT IMPORT

Add this to the `<head>` of every HTML file (or at the top of your global CSS):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

---

## GLOBAL BASE STYLES

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  font-family: var(--font-primary);
  font-size: var(--text-body);
  font-weight: var(--fw-regular);
  line-height: var(--lh-body);
  color: var(--color-text-primary);
  background-color: var(--color-surface);
  overflow-x: hidden;
}

.container {
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-px);
}
```

---

## COMPONENT SPECIFICATIONS

### 1. Announcement Bar

A thin, full-width sticky strip pinned above the navigation.

```css
.announcement-bar {
  background: var(--color-surface-dark);
  color: var(--color-text-on-dark);
  text-align: center;
  padding: var(--space-2) var(--container-px);
  font-size: var(--text-body-sm);
  font-weight: var(--fw-medium);
  letter-spacing: 0.01em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.announcement-bar a {
  color: inherit;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  transition: opacity var(--transition-fast);
}

.announcement-bar a:hover { opacity: 0.8; }

.announcement-bar .icon {
  width: 16px;
  height: 16px;
  opacity: 0.8;
}
```

---

### 2. Navigation Bar

Sticky, white background, subtle bottom border on scroll.

```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--color-surface);
  border-bottom: 1px solid transparent;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  height: 68px;
  display: flex;
  align-items: center;
}

.navbar.scrolled {
  border-bottom-color: var(--color-border);
  box-shadow: var(--shadow-nav);
}

.navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-px);
}

/* Logo */
.navbar__logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 17px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  text-decoration: none;
  letter-spacing: -0.01em;
}

.navbar__logo svg { width: 28px; height: 28px; }

/* Primary Links (left-center) */
.navbar__links-primary {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  list-style: none;
  margin-left: var(--space-8);
}

.navbar__links-primary a {
  font-size: var(--text-body);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: color var(--transition-fast), background var(--transition-fast);
}

.navbar__links-primary a:hover,
.navbar__links-primary a.active {
  color: var(--color-text-primary);
  background: var(--color-primary-light);
}

/* Secondary Links (center) */
.navbar__links-secondary {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  list-style: none;
}

.navbar__links-secondary a {
  font-size: var(--text-body-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: var(--space-2) var(--space-3);
  transition: color var(--transition-fast);
}

.navbar__links-secondary a:hover { color: var(--color-text-primary); }

/* Action Pill Buttons (right) */
.navbar__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.btn-nav-pill {
  display: inline-flex;
  align-items: center;
  padding: 7px 18px;
  font-size: var(--text-body-sm);
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
  background: var(--color-primary-light);
  border: 1.5px solid var(--color-primary-border);
  border-radius: var(--radius-pill);
  text-decoration: none;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.btn-nav-pill:hover {
  background: var(--color-primary);
  color: var(--color-text-on-dark);
  border-color: var(--color-primary);
}

.btn-nav-pill.active {
  background: var(--color-primary);
  color: var(--color-text-on-dark);
  border-color: var(--color-primary);
}
```

---

### 3. Hero Section

Split layout — large typographic left, interactive widget right.

```css
.hero {
  padding: var(--space-20) 0 var(--space-24);
  overflow: hidden;
}

.hero__grid {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: var(--space-16);
  align-items: center;
}

/* Left Column */
.hero__content { display: flex; flex-direction: column; gap: var(--space-6); }

.hero__stat {
  font-size: var(--text-hero-stat);
  font-weight: var(--fw-extrabold);
  letter-spacing: var(--ls-stat);
  line-height: var(--lh-tight);
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}

.hero__headline {
  font-size: var(--text-hero);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-heading);
  line-height: var(--lh-heading);
  color: var(--color-text-primary);
  margin-top: calc(-1 * var(--space-2));
}

.hero__description {
  font-size: var(--text-body-lg);
  font-weight: var(--fw-regular);
  color: var(--color-primary);   /* Blue body text — intentional brand choice */
  line-height: var(--lh-body);
  max-width: 480px;
}

/* Stat Badges Row */
.hero__badges {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-top: var(--space-2);
}

.badge-stat {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-badge-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: var(--text-body-sm);
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
}

.badge-stat .badge-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.badge-highlight {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: var(--color-badge-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: var(--text-body-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  margin-top: var(--space-2);
}
```

---

### 4. Buy/Sell/Swap Widget Card

The core interactive card on the hero's right side.

```css
.widget-card {
  background: var(--color-surface-raised);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-widget);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Tab Switcher */
.widget-tabs {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  gap: 0;
}

.widget-tab {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-body);
  font-weight: var(--fw-medium);
  color: var(--color-text-muted);
  text-align: center;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: -1px;
}

.widget-tab:hover { color: var(--color-text-primary); }

.widget-tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: var(--fw-semibold);
}

/* Crypto Selection Grid */
.crypto-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

/* Allow BTC to span full width (first item) */
.crypto-grid .crypto-btn:first-child {
  grid-column: 1 / -1;
}

/* Or a 3-column variant for more tokens */
.crypto-grid--3col {
  grid-template-columns: repeat(3, 1fr);
}

.crypto-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-3);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.crypto-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.crypto-btn.selected {
  border-color: var(--color-primary);
  border-width: 2px;
  background: var(--color-primary-lighter);
  color: var(--color-primary);
}

.crypto-btn .crypto-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
}

/* Primary CTA Button */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-4) var(--space-8);
  background: var(--color-primary);
  color: var(--color-text-on-dark);
  border: none;
  border-radius: var(--radius-pill);
  font-size: var(--text-body-lg);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-button);
  cursor: pointer;
  box-shadow: var(--shadow-button);
  transition: all var(--transition-base);
  text-decoration: none;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  box-shadow: 0 6px 20px rgba(45, 85, 255, 0.40);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-button);
}

.btn-primary .btn-arrow {
  width: 20px;
  height: 20px;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Security Badge below button */
.widget-security {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-size: var(--text-caption);
  font-weight: var(--fw-medium);
  color: var(--color-text-muted);
}

.widget-security .security-icon {
  color: var(--color-success);
  width: 14px;
  height: 14px;
}
```

---

### 5. Live Activity Toast

The bottom notification card showing recent user transactions.

```css
.activity-toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-card);
  animation: slideUp 0.5s var(--transition-spring) forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.activity-toast__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid var(--color-border);
}

.activity-toast__content {
  flex: 1;
  min-width: 0;
}

.activity-toast__text {
  font-size: var(--text-body-sm);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.activity-toast__text strong {
  color: var(--color-text-primary);
  font-weight: var(--fw-semibold);
}

.activity-toast__time {
  font-size: var(--text-caption);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}
```

---

### 6. Partner Logo Strip

Greyscale, single-row ticker of partner logos.

```css
.logo-strip {
  padding: var(--space-10) 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  overflow: hidden;
}

.logo-strip__track {
  display: flex;
  align-items: center;
  gap: var(--space-12);
  animation: logoScroll 30s linear infinite;
  width: max-content;
}

.logo-strip__track:hover { animation-play-state: paused; }

@keyframes logoScroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.logo-strip__item {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.logo-strip__item img,
.logo-strip__item svg {
  height: 24px;
  width: auto;
  filter: grayscale(100%) opacity(0.55);
  transition: filter var(--transition-base);
}

.logo-strip__item:hover img,
.logo-strip__item:hover svg {
  filter: grayscale(0%) opacity(1);
}
```

---

### 7. Feature Cards (Section Grid)

Used for "Super-charge your crypto transactions" and similar feature lists.

```css
.features-section {
  padding: var(--section-padding-y) 0;
  background: var(--color-surface);
}

.section-heading {
  font-size: var(--text-h2);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-heading);
  line-height: var(--lh-heading);
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: var(--space-16);
}

/* Underline accent on key phrase in heading */
.section-heading .underline-accent {
  position: relative;
  display: inline-block;
}

.section-heading .underline-accent::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-primary);
  border-radius: 2px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--grid-gap);
}

.feature-card {
  background: var(--color-primary-light);
  border: 1.5px solid var(--color-primary-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  transition: all var(--transition-base);
}

.feature-card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.feature-card__icon-wrap {
  width: 48px;
  height: 48px;
  background: var(--color-primary-light);
  border: 1.5px solid var(--color-primary-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-card__icon-wrap svg,
.feature-card__icon-wrap img {
  width: 24px;
  height: 24px;
  color: var(--color-primary);
}

.feature-card__title {
  font-size: var(--text-h4);
  font-weight: var(--fw-bold);
  color: var(--color-primary);
  line-height: var(--lh-heading);
}

.feature-card__body {
  font-size: var(--text-body);
  color: var(--color-text-secondary);
  line-height: var(--lh-body);
}
```

---

### 8. Integration/Partner Cards (Horizontal Scroll Carousel)

Cards that highlight individual integrations (e.g., "We've integrated with BingX").

```css
.integrations-section {
  padding: var(--space-12) 0;
  overflow: hidden;
}

.integrations-track {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: var(--space-4) var(--container-px);
  cursor: grab;
}

.integrations-track::-webkit-scrollbar { display: none; }
.integrations-track:active { cursor: grabbing; }

.integration-card {
  flex-shrink: 0;
  width: 260px;
  scroll-snap-align: start;
  background: var(--color-primary-lighter);
  border: 1px solid var(--color-primary-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: box-shadow var(--transition-base);
  position: relative;
  overflow: hidden;
}

.integration-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(45,85,255,0.06) 0%, transparent 70%);
  pointer-events: none;
}

.integration-card:hover { box-shadow: var(--shadow-card); }

.integration-card__eyebrow {
  font-size: var(--text-eyebrow);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: var(--color-primary);
}

.integration-card__logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.integration-card__logo img,
.integration-card__logo svg { height: 28px; width: auto; }

.integration-card__description {
  font-size: var(--text-body-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.integration-card__arrow {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 28px;
  height: 28px;
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font-size: 14px;
}
```

---

### 9. Section Eyebrow Label

Small uppercase badge above section headings.

```css
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary-border);
  border-radius: var(--radius-pill);
  font-size: var(--text-eyebrow);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: var(--space-4);
}
```

---

## SCROLL-TRIGGERED ANIMATIONS

Apply these via JavaScript `IntersectionObserver`. Add `data-animate` attributes to elements you want to animate on scroll.

```javascript
// In your main JS file
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
```

```css
/* Default hidden state */
[data-animate] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

[data-animate="fade-up"].is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children */
[data-animate-stagger] > * {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

[data-animate-stagger].is-visible > *:nth-child(1) { opacity:1; transform:translateY(0); transition-delay: 0ms; }
[data-animate-stagger].is-visible > *:nth-child(2) { opacity:1; transform:translateY(0); transition-delay: 80ms; }
[data-animate-stagger].is-visible > *:nth-child(3) { opacity:1; transform:translateY(0); transition-delay: 160ms; }
[data-animate-stagger].is-visible > *:nth-child(4) { opacity:1; transform:translateY(0); transition-delay: 240ms; }

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  [data-animate], [data-animate-stagger] > * {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

---

## STICKY NAV SCROLL BEHAVIOR (JavaScript)

```javascript
const navbar = document.querySelector('.navbar');
const SCROLL_THRESHOLD = 10;

window.addEventListener('scroll', () => {
  if (window.scrollY > SCROLL_THRESHOLD) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });
```

---

## RESPONSIVE BREAKPOINTS

```css
/* Mobile first. Breakpoints: */
/* sm  — 640px  */
/* md  — 768px  */
/* lg  — 1024px */
/* xl  — 1200px */

@media (max-width: 1024px) {
  .hero__grid {
    grid-template-columns: 1fr;
    max-width: 560px;
    margin: 0 auto;
    text-align: center;
  }

  .hero__badges { justify-content: center; }
  .hero__description { margin: 0 auto; }

  .widget-card { max-width: 420px; margin: 0 auto; }

  .features-grid { grid-template-columns: 1fr; }

  .navbar__links-secondary { display: none; }
}

@media (max-width: 768px) {
  .navbar__links-primary { display: none; }

  .hero__stat   { font-size: clamp(40px, 10vw, 56px); }
  .hero__headline { font-size: clamp(28px, 7vw, 40px); }

  .navbar__actions .btn-nav-pill:not(.active):not(:first-child) { display: none; }

  .section-heading { font-size: clamp(24px, 6vw, 32px); }

  .logo-strip__track { gap: var(--space-8); }
}
```

---

## IMPLEMENTATION INSTRUCTIONS FOR CLAUDE CODE

**Follow these rules strictly:**

1. **Use the token system exclusively.** No hardcoded colors, sizes, or font values anywhere in the codebase. Every value must reference a CSS custom property defined above.

2. **Do NOT change content.** Keep all existing text, headings, CTAs, and copy exactly as they are. Only apply visual styles.

3. **Preserve existing HTML structure.** Add or rename CSS classes, update stylesheets — do not restructure the DOM unless a component pattern above explicitly requires it (e.g., wrapping a button's arrow icon).

4. **Inter font is mandatory.** Import it as specified. Apply `font-family: var(--font-primary)` to the `body` element.

5. **Every interactive element gets a transition.** Buttons, cards, links, tabs — all must have `transition: all var(--transition-fast)` minimum.

6. **Cards must have the exact shadow specified.** Use `var(--shadow-card)` for resting state, `var(--shadow-card-hover)` on hover. No other shadow values.

7. **The primary CTA button** (`btn-primary`) must have: full-width within its container, pill border-radius, `var(--shadow-button)`, and a hover `translateY(-1px)` lift effect.

8. **Add `data-animate="fade-up"` and `data-animate-stagger`** attributes to sections and card grids respectively, then implement the IntersectionObserver script.

9. **Mobile is non-negotiable.** Test at 375px, 768px, and 1280px. The layout must be fully functional at each breakpoint using the responsive rules defined above.

10. **Replace any existing placeholder or low-quality icons** with clean SVG icons from `lucide.dev` or equivalent outlined icon set in `var(--color-primary)`.

11. **The logo strip must auto-scroll.** Implement the `logoScroll` CSS animation. Duplicate the logo list in HTML (two identical sets) so the animation loops seamlessly.

12. **Navbar must become sticky** after `10px` of scroll and add the `.scrolled` class to gain its shadow and border.

13. **Quality bar:** The finished product should be indistinguishable from a production fintech website. If something looks rough — spacing feels cramped, a card lacks depth, a button lacks weight — fix it. The design token system gives you everything you need.

---

## CHECKLIST BEFORE MARKING COMPLETE

- [ ] `Inter` font loaded and applied globally
- [ ] All CSS tokens defined at `:root`
- [ ] Zero hardcoded color or spacing values in CSS
- [ ] Announcement bar renders correctly at top
- [ ] Navbar is sticky with scroll behavior
- [ ] Hero stat number is blue, large, and tabular-numeric
- [ ] Widget card has correct shadow, border, tabs, and CTA
- [ ] Partner logo strip scrolls infinitely and pauses on hover
- [ ] Feature cards have blue tint background and hover lift
- [ ] All `data-animate` scroll triggers are wired up
- [ ] Mobile layout correct at 375px
- [ ] All buttons have hover transitions and shadow
- [ ] `prefers-reduced-motion` is respected for animations
- [ ] No visible layout shifts or FOUC on load

---

*Prompt crafted from design analysis of onramp.money — Premium Fintech UI Design System v1.0*
