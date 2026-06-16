# FundingRock — Complete UI Design System & Theme Implementation Guide

> **Document Purpose:** This is a full-spectrum design specification for applying the FundingRock visual identity to an existing website codebase. Every page, every component, every interaction state is covered. The implementing engineer should apply these styles top-to-bottom, leaving nothing untouched.
>
> **Version:** 1.0 | **Morphism Profile:** Cyberpunk Dark + Aurora Glass + Neon Border + Skeuomorphism + Layered Float + Kinetic Marquee + Halftone Dot Matrix

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design Tokens — CSS Custom Properties](#2-design-tokens--css-custom-properties)
3. [Typography System](#3-typography-system)
4. [Color System & Palette](#4-color-system--palette)
5. [The 7 Morphism Techniques](#5-the-7-morphism-techniques)
6. [Global Base & Reset Styles](#6-global-base--reset-styles)
7. [Component Library](#7-component-library)
   - 7.1 Navigation Bar
   - 7.2 Announcement Ticker (Top Bar)
   - 7.3 Buttons
   - 7.4 Aurora Glass Cards
   - 7.5 Neon Border Cards
   - 7.6 Skeuomorphic Certificate Cards
   - 7.7 Floating Layered Dashboard Panels
   - 7.8 Forms, Inputs & Selects
   - 7.9 Tables
   - 7.10 Modals & Overlays
   - 7.11 Badges, Pills & Tags
   - 7.12 Alerts & Toast Notifications
   - 7.13 Progress Bars & Step Indicators
   - 7.14 Avatars & User Identity
   - 7.15 Icons
   - 7.16 Halftone Background Pattern
   - 7.17 Kinetic Marquee / Ticker Strip
   - 7.18 Scrollable Carousels
   - 7.19 Stats & Metric Cards
   - 7.20 Dropdowns & Select Menus
   - 7.21 Tabs & Navigation Panels
   - 7.22 Tooltips
   - 7.23 Pagination
   - 7.24 File Upload Components
   - 7.25 Loading Skeletons & Spinners
8. [Page-by-Page Implementation](#8-page-by-page-implementation)
   - 8.1 Home / Landing Page
   - 8.2 Login Page
   - 8.3 Register / Sign-Up Page
   - 8.4 Password Reset
   - 8.5 Dashboard / Main Panel
   - 8.6 Trading Challenge Page
   - 8.7 Account / Profile Settings
   - 8.8 Leaderboard / Stats Page
   - 8.9 Payout / Certificate Page
   - 8.10 Mail / Inbox Page
   - 8.11 Notifications Page
   - 8.12 Admin Panel
   - 8.13 Affiliates Page
   - 8.14 FAQ Page
   - 8.15 404 / Error Pages
9. [Animation & Motion](#9-animation--motion)
10. [Responsive Design Breakpoints](#10-responsive-design-breakpoints)
11. [Implementation Checklist](#11-implementation-checklist)

---

## 1. Design Philosophy

### Core Principle: "Neon Precision on Pure Black"

FundingRock's visual language is built on a single tension: **absolute darkness vs. electric lime energy.** Every design decision either deepens the darkness (more black, more depth, more void) or pierces it (a lime CTA, a neon border glow, a scrolling ticker). Nothing sits in the middle.

### The 5 Rules

| Rule | What It Means in Practice |
|------|--------------------------|
| **Black or Nothing** | Backgrounds are `#050505`, `#080808`, or `#0d0d0d`. There are no gray page backgrounds, no warm tones, no off-whites. |
| **One Accent, Used Precisely** | `#CCFF00` (electric lime) is the ONLY brand accent. It appears on: primary CTAs, active nav states, brand name emphasis, key numbers. Never used decoratively. |
| **Depth Through Layers** | Cards, panels, and modals sit at distinct z-levels expressed through incrementally lighter dark surfaces — not drop shadows. |
| **Type Is Architecture** | Headlines are heavy, large, and uppercase. Body text is small, muted, and precise. The scale contrast IS the hierarchy. |
| **Motion = Information** | Nothing animates without purpose. The ticker communicates offers. Hover states communicate interactivity. Transitions communicate state. |

---

## 2. Design Tokens — CSS Custom Properties

Paste this block into the `:root` of your global CSS file. **Every color, spacing, radius, and shadow value throughout the entire codebase must reference these tokens.** Hard-coded hex values elsewhere in the codebase must be replaced.

```css
/* ============================================================
   FUNDINGROCK DESIGN TOKENS
   File: /src/styles/tokens.css (or paste into :root of main.css)
   ============================================================ */

:root {
  /* ── BRAND COLORS ─────────────────────────────────────── */
  --fr-lime:          #CCFF00;     /* Primary accent — electric lime         */
  --fr-lime-dim:      #A8D400;     /* Lime on hover / pressed state          */
  --fr-lime-glow:     rgba(204, 255, 0, 0.15);   /* Lime ambient glow       */
  --fr-lime-glow-md:  rgba(204, 255, 0, 0.25);   /* Lime glow — medium      */

  /* ── BASE SURFACES (darkest → least dark) ─────────────── */
  --fr-void:          #020202;     /* Absolute void — deepest background      */
  --fr-black:         #050505;     /* Page background                         */
  --fr-dark-0:        #080808;     /* Sections, alternate bg                  */
  --fr-dark-1:        #0d0d0d;     /* Card base                               */
  --fr-dark-2:        #111111;     /* Card body / panel                       */
  --fr-dark-3:        #161616;     /* Elevated card / modal                   */
  --fr-dark-4:        #1a1a1a;     /* Highest elevation surface               */
  --fr-dark-5:        #222222;     /* Input fields, table rows alt            */

  /* ── BORDERS ──────────────────────────────────────────── */
  --fr-border-subtle:    rgba(255, 255, 255, 0.06);   /* Nearly invisible     */
  --fr-border-default:   rgba(255, 255, 255, 0.10);   /* Standard card edge   */
  --fr-border-medium:    rgba(255, 255, 255, 0.16);   /* Hover / active edge  */
  --fr-border-strong:    rgba(255, 255, 255, 0.24);   /* Focus rings          */
  --fr-border-lime:      rgba(204, 255, 0, 0.40);     /* Lime-tinted border   */

  /* ── NEON BORDER PALETTE (Payout Cards) ───────────────── */
  --fr-neon-teal:     #00D4C8;
  --fr-neon-purple:   #9B5DE5;
  --fr-neon-green:    #22C55E;
  --fr-neon-pink:     #F72585;
  --fr-neon-blue:     #3B82F6;
  --fr-neon-orange:   #F59E0B;

  /* Neon glow shadows */
  --fr-glow-teal:     0 0 0 1px #00D4C8, 0 0 12px rgba(0,212,200,0.35);
  --fr-glow-purple:   0 0 0 1px #9B5DE5, 0 0 12px rgba(155,93,229,0.35);
  --fr-glow-green:    0 0 0 1px #22C55E, 0 0 12px rgba(34,197,94,0.35);
  --fr-glow-pink:     0 0 0 1px #F72585, 0 0 12px rgba(247,37,133,0.35);
  --fr-glow-blue:     0 0 0 1px #3B82F6, 0 0 12px rgba(59,130,246,0.35);
  --fr-glow-lime:     0 0 0 1px #CCFF00, 0 0 16px rgba(204,255,0,0.30);

  /* ── AURORA CARD GRADIENTS (Step Cards) ───────────────── */
  --fr-aurora-purple: linear-gradient(145deg, #1a0533 0%, #3B1D8A 45%, #7B5EA7 100%);
  --fr-aurora-teal:   linear-gradient(145deg, #041520 0%, #0D4A5A 45%, #1D9575 100%);
  --fr-aurora-red:    linear-gradient(145deg, #1a0208 0%, #5A0D1D 45%, #8A1A2A 100%);
  --fr-aurora-blue:   linear-gradient(145deg, #020d1f 0%, #0D2A6A 45%, #1D55A7 100%);
  --fr-aurora-gold:   linear-gradient(145deg, #1a1002 0%, #5A3D0D 45%, #8A6A1A 100%);

  /* ── TEXT COLORS ──────────────────────────────────────── */
  --fr-text-primary:    #FFFFFF;
  --fr-text-secondary:  rgba(255, 255, 255, 0.65);
  --fr-text-tertiary:   rgba(255, 255, 255, 0.35);
  --fr-text-disabled:   rgba(255, 255, 255, 0.20);
  --fr-text-lime:       #CCFF00;
  --fr-text-teal:       #00D4C8;
  --fr-text-danger:     #F87171;
  --fr-text-success:    #4ADE80;
  --fr-text-warning:    #FBBF24;
  --fr-text-info:       #60A5FA;

  /* ── SEMANTIC FILL COLORS ─────────────────────────────── */
  --fr-success-bg:   rgba(74, 222, 128, 0.10);
  --fr-success-border: rgba(74, 222, 128, 0.25);
  --fr-danger-bg:    rgba(248, 113, 113, 0.10);
  --fr-danger-border: rgba(248, 113, 113, 0.25);
  --fr-warning-bg:   rgba(251, 191, 36, 0.10);
  --fr-warning-border: rgba(251, 191, 36, 0.25);
  --fr-info-bg:      rgba(96, 165, 250, 0.10);
  --fr-info-border:  rgba(96, 165, 250, 0.25);

  /* ── SPACING SCALE ────────────────────────────────────── */
  --fr-sp-1:   4px;
  --fr-sp-2:   8px;
  --fr-sp-3:   12px;
  --fr-sp-4:   16px;
  --fr-sp-5:   20px;
  --fr-sp-6:   24px;
  --fr-sp-8:   32px;
  --fr-sp-10:  40px;
  --fr-sp-12:  48px;
  --fr-sp-16:  64px;
  --fr-sp-20:  80px;
  --fr-sp-24:  96px;

  /* ── BORDER RADIUS ────────────────────────────────────── */
  --fr-radius-sm:   4px;
  --fr-radius-md:   8px;
  --fr-radius-lg:   12px;
  --fr-radius-xl:   16px;
  --fr-radius-2xl:  20px;
  --fr-radius-pill: 999px;

  /* ── TYPOGRAPHY ───────────────────────────────────────── */
  --fr-font-sans:   'Inter', 'Sora', system-ui, -apple-system, sans-serif;
  --fr-font-mono:   'JetBrains Mono', 'Fira Code', 'Courier New', monospace;

  /* ── Z-INDEX STACK ────────────────────────────────────── */
  --fr-z-base:      1;
  --fr-z-card:      10;
  --fr-z-dropdown:  100;
  --fr-z-sticky:    200;
  --fr-z-modal:     300;
  --fr-z-toast:     400;
  --fr-z-tooltip:   500;

  /* ── TRANSITIONS ──────────────────────────────────────── */
  --fr-ease-fast:   150ms cubic-bezier(0.4, 0, 0.2, 1);
  --fr-ease-med:    250ms cubic-bezier(0.4, 0, 0.2, 1);
  --fr-ease-slow:   400ms cubic-bezier(0.4, 0, 0.2, 1);
  --fr-ease-bounce: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ── NAVBAR DIMENSIONS ────────────────────────────────── */
  --fr-nav-height:      68px;
  --fr-ticker-height:   36px;
  --fr-sidebar-width:   260px;
}
```

---

## 3. Typography System

### Font Import

Add to the top of your global CSS, or in the HTML `<head>`:

```css
/* ============================================================
   FONT IMPORTS
   ============================================================ */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Sora:wght@400;600;700;800&display=swap');
```

### Type Scale

```css
/* ============================================================
   TYPOGRAPHY SCALE
   ============================================================ */

/* Display — used for hero headlines only */
.fr-display-1 {
  font-family: var(--fr-font-sans);
  font-size: clamp(40px, 6vw, 80px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--fr-text-primary);
}

.fr-display-2 {
  font-family: var(--fr-font-sans);
  font-size: clamp(32px, 4.5vw, 60px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--fr-text-primary);
}

/* Section headings */
.fr-heading-1 { font-size: 48px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; }
.fr-heading-2 { font-size: 36px; font-weight: 700; line-height: 1.2;  letter-spacing: -0.018em; }
.fr-heading-3 { font-size: 28px; font-weight: 600; line-height: 1.25; letter-spacing: -0.015em; }
.fr-heading-4 { font-size: 22px; font-weight: 600; line-height: 1.3;  letter-spacing: -0.01em; }
.fr-heading-5 { font-size: 18px; font-weight: 600; line-height: 1.35; }
.fr-heading-6 { font-size: 16px; font-weight: 600; line-height: 1.4;  }

/* All headings share */
.fr-heading-1, .fr-heading-2, .fr-heading-3,
.fr-heading-4, .fr-heading-5, .fr-heading-6 {
  font-family: var(--fr-font-sans);
  color: var(--fr-text-primary);
  margin: 0;
}

/* Body text */
.fr-body-lg   { font-size: 18px; line-height: 1.7; font-weight: 400; color: var(--fr-text-secondary); }
.fr-body-md   { font-size: 16px; line-height: 1.65; font-weight: 400; color: var(--fr-text-secondary); }
.fr-body-sm   { font-size: 14px; line-height: 1.6;  font-weight: 400; color: var(--fr-text-secondary); }
.fr-body-xs   { font-size: 12px; line-height: 1.5;  font-weight: 400; color: var(--fr-text-tertiary); }

/* Labels & Caps */
.fr-label     { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fr-text-tertiary); }
.fr-label-sm  { font-size: 10px; font-weight: 600; letter-spacing: 0.10em; text-transform: uppercase; color: var(--fr-text-tertiary); }

/* Lime accent text */
.fr-text-accent { color: var(--fr-lime) !important; }

/* Mono — trading numbers, account balances */
.fr-mono {
  font-family: var(--fr-font-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

/* Gradient text — for hero headings */
.fr-gradient-text {
  background: linear-gradient(90deg, #FFFFFF 0%, #CCFF00 60%, #00D4C8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 4. Color System & Palette

### Quick Reference Palette

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| **Lime Accent** | `--fr-lime` | `#CCFF00` | All primary CTAs, active states, brand name |
| **Page Background** | `--fr-black` | `#050505` | `<body>` background |
| **Card Base** | `--fr-dark-1` | `#0d0d0d` | Default card background |
| **Card Body** | `--fr-dark-2` | `#111111` | Card content areas |
| **Elevated** | `--fr-dark-4` | `#1a1a1a` | Modals, dropdowns |
| **Neon Teal** | `--fr-neon-teal` | `#00D4C8` | Certificate card 1 border |
| **Neon Purple** | `--fr-neon-purple` | `#9B5DE5` | Certificate card 2 border |
| **Neon Green** | `--fr-neon-green` | `#22C55E` | Certificate card 3 border / positive values |
| **Neon Pink** | `--fr-neon-pink` | `#F72585` | Certificate card 4 border |
| **Neon Blue** | `--fr-neon-blue` | `#3B82F6` | Certificate card 5 border / info |
| **Danger** | `--fr-text-danger` | `#F87171` | Losses, errors |
| **Success** | `--fr-text-success` | `#4ADE80` | Profits, success states |
| **Warning** | `--fr-text-warning` | `#FBBF24` | Caution states |

### Aurora Card Color Map

| Step Card | Gradient Token | Top Color | Bottom Color |
|-----------|---------------|-----------|--------------|
| Step 01 / Purple | `--fr-aurora-purple` | `#1a0533` → `#7B5EA7` | Deep indigo |
| Step 02 / Teal | `--fr-aurora-teal` | `#041520` → `#1D9575` | Deep teal |
| Step 03 / Red | `--fr-aurora-red` | `#1a0208` → `#8A1A2A` | Deep crimson |

---

## 5. The 7 Morphism Techniques

This section provides the exact CSS implementation for each morphism used across the site.

---

### 5.1 Cyberpunk / Neon Dark UI (Foundation)

This is not a component — it is the **base reality of the entire site.** All other morphisms exist inside this world.

```css
/* ============================================================
   MORPHISM 1: CYBERPUNK NEON DARK — BASE LAYER
   Applied to: <body>, all section wrappers, all page containers
   ============================================================ */

*,
*::before,
*::after {
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
  background-color: var(--fr-black);
  color: var(--fr-text-primary);
  font-family: var(--fr-font-sans);
  font-size: 16px;
  line-height: 1.6;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Section containers */
.fr-section {
  position: relative;
  width: 100%;
  padding: var(--fr-sp-20) 0;
  overflow: hidden;
}

.fr-section--dark {
  background-color: var(--fr-dark-0);
}

.fr-container {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--fr-sp-6);
}

.fr-container--narrow {
  max-width: 800px;
}

.fr-container--wide {
  max-width: 1440px;
}

/* Lime highlight on text spans */
.fr-lime { color: var(--fr-lime); }

/* Selection color */
::selection {
  background: var(--fr-lime);
  color: #000000;
}

/* Scrollbar — dark themed */
::-webkit-scrollbar        { width: 6px; height: 6px; }
::-webkit-scrollbar-track  { background: var(--fr-dark-0); }
::-webkit-scrollbar-thumb  { background: var(--fr-dark-5); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(204,255,0,0.3); }
```

---

### 5.2 Aurora Glassmorphism (Step Cards)

```css
/* ============================================================
   MORPHISM 2: AURORA GLASSMORPHISM
   Applied to: Feature cards, Step cards, "How it works" cards,
               any 3-column info card grid
   ============================================================ */

.fr-aurora-card {
  position: relative;
  border-radius: var(--fr-radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.10);
  padding: var(--fr-sp-8);
  overflow: hidden;
  transition: transform var(--fr-ease-med), border-color var(--fr-ease-med);
}

.fr-aurora-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.18);
}

/* Variant 1: Purple (Step 01, Feature A) */
.fr-aurora-card--purple {
  background: var(--fr-aurora-purple);
}

/* Variant 2: Teal (Step 02, Feature B) */
.fr-aurora-card--teal {
  background: var(--fr-aurora-teal);
}

/* Variant 3: Crimson (Step 03, Feature C) */
.fr-aurora-card--red {
  background: var(--fr-aurora-red);
}

/* Variant 4: Blue (additional sections) */
.fr-aurora-card--blue {
  background: var(--fr-aurora-blue);
}

/* The inner glow overlay — positioned absolute inside card */
.fr-aurora-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 60%;
  height: 60%;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.2;
  pointer-events: none;
  transition: opacity var(--fr-ease-slow);
}

.fr-aurora-card--purple::before { background: #9B5DE5; }
.fr-aurora-card--teal::before   { background: #00D4C8; }
.fr-aurora-card--red::before    { background: #F72585; }
.fr-aurora-card--blue::before   { background: #3B82F6; }

.fr-aurora-card:hover::before {
  opacity: 0.35;
}

/* Step badge inside aurora card */
.fr-aurora-card__step {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  border-radius: var(--fr-radius-pill);
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--fr-text-primary);
  margin-bottom: var(--fr-sp-5);
}

.fr-aurora-card--purple .fr-aurora-card__step { border-color: rgba(155,93,229,0.5); color: #C4A3FF; }
.fr-aurora-card--teal   .fr-aurora-card__step { border-color: rgba(0,212,200,0.5); color: #5EEAE4; }
.fr-aurora-card--red    .fr-aurora-card__step { border-color: rgba(247,37,133,0.5); color: #FF8AB8; }

.fr-aurora-card__title {
  font-size: 22px;
  font-weight: 700;
  color: var(--fr-text-primary);
  margin-bottom: var(--fr-sp-3);
  line-height: 1.25;
}

.fr-aurora-card__body {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.70);
  line-height: 1.65;
  margin-bottom: var(--fr-sp-6);
}

/* USAGE EXAMPLE HTML:
<div class="fr-aurora-card fr-aurora-card--purple">
  <span class="fr-aurora-card__step">STEP 01</span>
  <h3 class="fr-aurora-card__title">Choose Your Challenge Account</h3>
  <p class="fr-aurora-card__body">Select the account size that fits your trading style.</p>
</div>
*/
```

---

### 5.3 Neon Border Morphism (Payout Certificate Cards)

```css
/* ============================================================
   MORPHISM 3: NEON BORDER MORPHISM
   Applied to: Payout certificates, featured plan cards,
               highlighted stat cards, selected states
   ============================================================ */

.fr-neon-card {
  position: relative;
  background: var(--fr-dark-2);
  border-radius: var(--fr-radius-lg);
  padding: var(--fr-sp-6);
  transition: transform var(--fr-ease-med), box-shadow var(--fr-ease-med);
  cursor: pointer;
}

.fr-neon-card:hover {
  transform: translateY(-3px) scale(1.01);
}

/* Neon color variants — each maps to a unique border hue */
.fr-neon-card--teal   { box-shadow: var(--fr-glow-teal);   }
.fr-neon-card--purple { box-shadow: var(--fr-glow-purple);  }
.fr-neon-card--green  { box-shadow: var(--fr-glow-green);   }
.fr-neon-card--pink   { box-shadow: var(--fr-glow-pink);    }
.fr-neon-card--blue   { box-shadow: var(--fr-glow-blue);    }
.fr-neon-card--lime   { box-shadow: var(--fr-glow-lime);    }

.fr-neon-card--teal:hover   { box-shadow: 0 0 0 1px #00D4C8, 0 0 24px rgba(0,212,200,0.55);   }
.fr-neon-card--purple:hover { box-shadow: 0 0 0 1px #9B5DE5, 0 0 24px rgba(155,93,229,0.55); }
.fr-neon-card--green:hover  { box-shadow: 0 0 0 1px #22C55E, 0 0 24px rgba(34,197,94,0.55);  }
.fr-neon-card--pink:hover   { box-shadow: 0 0 0 1px #F72585, 0 0 24px rgba(247,37,133,0.55); }
.fr-neon-card--blue:hover   { box-shadow: 0 0 0 1px #3B82F6, 0 0 24px rgba(59,130,246,0.55); }
.fr-neon-card--lime:hover   { box-shadow: 0 0 0 1px #CCFF00, 0 0 30px rgba(204,255,0,0.45);  }

/* Active / selected card (first card in carousel) */
.fr-neon-card--active {
  box-shadow: var(--fr-glow-teal);
  border: 1px solid rgba(0, 212, 200, 0.5);
}

/* Color accent line at top of card */
.fr-neon-card::after {
  content: '';
  position: absolute;
  top: 0; left: 20px; right: 20px;
  height: 1px;
  border-radius: 1px;
  opacity: 0.6;
}

.fr-neon-card--teal::after   { background: #00D4C8; }
.fr-neon-card--purple::after { background: #9B5DE5; }
.fr-neon-card--green::after  { background: #22C55E; }
.fr-neon-card--pink::after   { background: #F72585; }
.fr-neon-card--blue::after   { background: #3B82F6; }
.fr-neon-card--lime::after   { background: #CCFF00; }

/* USAGE EXAMPLE HTML:
<div class="fr-neon-card fr-neon-card--teal fr-neon-card--active">
  <p class="fr-label">PAYOUT CERTIFICATE</p>
  <h4 style="color:#00D4C8;margin:8px 0 4px">Ahmed Ahmed</h4>
  <p class="fr-display-2 fr-mono">$9,027.5</p>
</div>
*/
```

---

### 5.4 Skeuomorphism (Certificate Documents)

```css
/* ============================================================
   MORPHISM 4: SKEUOMORPHISM — CERTIFICATE STYLE
   Applied to: Payout certificates, achievement cards,
               any document-like UI element
   ============================================================ */

.fr-certificate {
  position: relative;
  background: var(--fr-dark-2);
  border-radius: var(--fr-radius-lg);
  padding: var(--fr-sp-6) var(--fr-sp-6) var(--fr-sp-5);
  overflow: hidden;
}

/* Dotted texture background — mimics security paper */
.fr-certificate::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 8px 8px;
  pointer-events: none;
  z-index: 0;
}

/* All content sits above the texture */
.fr-certificate > * { position: relative; z-index: 1; }

/* Brand logo row */
.fr-certificate__header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--fr-sp-4);
}

.fr-certificate__logo {
  width: 32px;
  height: 32px;
  background: var(--fr-lime);
  border-radius: var(--fr-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: #000;
}

/* Document label */
.fr-certificate__label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fr-text-tertiary);
  text-align: center;
  margin-bottom: var(--fr-sp-2);
}

/* Trader name — appears in accent color of parent neon card */
.fr-certificate__name {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  margin-bottom: var(--fr-sp-2);
}

/* The money amount — most important element */
.fr-certificate__amount {
  font-family: var(--fr-font-sans);
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  color: var(--fr-text-primary);
  letter-spacing: -0.03em;
  margin-bottom: var(--fr-sp-4);
}

/* Footer row: date + signature */
.fr-certificate__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: var(--fr-sp-3);
  border-top: 1px solid var(--fr-border-subtle);
}

.fr-certificate__date-label {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fr-text-tertiary);
  display: block;
  margin-bottom: 2px;
}

.fr-certificate__date-value {
  font-size: 11px;
  color: var(--fr-text-secondary);
}

.fr-certificate__sig-block {
  text-align: right;
}

.fr-certificate__sig {
  display: block;
  font-size: 14px;
  font-style: italic;
  color: var(--fr-text-secondary);
  font-family: 'Georgia', serif;
  margin-bottom: 2px;
}

.fr-certificate__sig-name {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fr-text-tertiary);
}

/* USAGE EXAMPLE HTML:
<div class="fr-neon-card fr-neon-card--teal">
  <div class="fr-certificate">
    <div class="fr-certificate__header">
      <div class="fr-certificate__logo">FR</div>
    </div>
    <p class="fr-certificate__label">Payout Certificate</p>
    <p class="fr-certificate__name" style="color:#00D4C8">Ahmed Ahmed</p>
    <p class="fr-certificate__amount">$9,027.5</p>
    <div class="fr-certificate__footer">
      <div>
        <span class="fr-certificate__date-label">Date</span>
        <span class="fr-certificate__date-value">October 20, 2025</span>
      </div>
      <div class="fr-certificate__sig-block">
        <span class="fr-certificate__sig">Meir Hefetz</span>
        <span class="fr-certificate__sig-name">CEO</span>
      </div>
    </div>
  </div>
</div>
*/
```

---

### 5.5 Layered / Floating Card Morphism (Dashboard UI)

```css
/* ============================================================
   MORPHISM 5: LAYERED FLOATING CARDS
   Applied to: Dashboard panels, trading platform mockup,
               stats overlays, any stacked-panel layout
   ============================================================ */

/* Layer 0 — Deepest background panel */
.fr-layer-0 {
  background: var(--fr-dark-0);
  border: 1px solid var(--fr-border-subtle);
  border-radius: var(--fr-radius-xl);
}

/* Layer 1 — Primary surface (main panels) */
.fr-layer-1 {
  background: var(--fr-dark-2);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-lg);
}

/* Layer 2 — Elevated surface (cards atop panels) */
.fr-layer-2 {
  background: var(--fr-dark-3);
  border: 1px solid var(--fr-border-medium);
  border-radius: var(--fr-radius-lg);
}

/* Layer 3 — Top-most (floating tooltip cards, mini widgets) */
.fr-layer-3 {
  background: var(--fr-dark-4);
  border: 1px solid var(--fr-border-strong);
  border-radius: var(--fr-radius-md);
}

/* Dashboard grid layout — 2-column master/detail */
.fr-dashboard-layout {
  display: grid;
  grid-template-columns: var(--fr-sidebar-width) 1fr;
  min-height: calc(100vh - var(--fr-nav-height) - var(--fr-ticker-height));
  gap: 0;
}

/* Main content area */
.fr-dashboard-main {
  padding: var(--fr-sp-6);
  display: flex;
  flex-direction: column;
  gap: var(--fr-sp-5);
  background: var(--fr-black);
}

/* Floating panel that overlaps another panel (dashboard mockup) */
.fr-floating-panel {
  position: absolute;
  z-index: var(--fr-z-card);
  transition: transform var(--fr-ease-med), box-shadow var(--fr-ease-med);
}

.fr-floating-panel:hover {
  transform: scale(1.02);
}

/* Stats grid inside dashboard */
.fr-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--fr-sp-4);
}

/* Individual stat widget */
.fr-stat-widget {
  background: var(--fr-dark-2);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-lg);
  padding: var(--fr-sp-5);
  transition: border-color var(--fr-ease-fast);
}

.fr-stat-widget:hover {
  border-color: var(--fr-border-medium);
}

.fr-stat-widget__label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fr-text-tertiary);
  margin-bottom: var(--fr-sp-2);
  display: flex;
  align-items: center;
  gap: var(--fr-sp-2);
}

.fr-stat-widget__value {
  font-size: 28px;
  font-weight: 700;
  color: var(--fr-text-primary);
  font-family: var(--fr-font-mono);
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: var(--fr-sp-2);
}

.fr-stat-widget__change {
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.fr-stat-widget__change--up   { color: var(--fr-text-success); }
.fr-stat-widget__change--down { color: var(--fr-text-danger);  }
```

---

### 5.6 Kinetic Marquee + Blur Edge Masking

```css
/* ============================================================
   MORPHISM 6: KINETIC MARQUEE / TICKER STRIP
   Applied to: Top announcement bar, feature highlight strip,
               partner logos strip
   ============================================================ */

.fr-ticker-strip {
  position: relative;
  overflow: hidden;
  background: var(--fr-dark-0);
  border-bottom: 1px solid var(--fr-border-subtle);
  height: var(--fr-ticker-height);
  display: flex;
  align-items: center;
}

/* Gradient blur masks at edges — the "disappear into void" effect */
.fr-ticker-strip::before,
.fr-ticker-strip::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 120px;
  z-index: 2;
  pointer-events: none;
}

.fr-ticker-strip::before {
  left: 0;
  background: linear-gradient(to right, var(--fr-dark-0) 0%, transparent 100%);
}

.fr-ticker-strip::after {
  right: 0;
  background: linear-gradient(to left, var(--fr-dark-0) 0%, transparent 100%);
}

/* The scrolling inner track */
.fr-ticker-track {
  display: flex;
  align-items: center;
  gap: 0;
  white-space: nowrap;
  /* Scroll speed: lower = faster. total content width / 2 = one loop */
  animation: fr-ticker-scroll 30s linear infinite;
}

.fr-ticker-track:hover {
  animation-play-state: paused;
}

@keyframes fr-ticker-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* Ticker item */
.fr-ticker-item {
  display: inline-flex;
  align-items: center;
  gap: var(--fr-sp-3);
  padding: 0 var(--fr-sp-5);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--fr-text-secondary);
}

.fr-ticker-item--accent {
  color: var(--fr-lime);
}

/* Separator dot between items */
.fr-ticker-item::after {
  content: '✦';
  font-size: 8px;
  color: var(--fr-lime);
  margin-left: var(--fr-sp-3);
}

.fr-ticker-item:last-child::after {
  display: none;
}

/* ── FEATURE STRIP (large mid-page marquee) ── */
.fr-feature-strip {
  position: relative;
  overflow: hidden;
  padding: var(--fr-sp-8) 0;
  background: var(--fr-dark-0);
}

.fr-feature-strip::before,
.fr-feature-strip::after {
  content: '';
  position: absolute;
  top: 0; bottom: 0;
  width: 200px;
  z-index: 2;
  pointer-events: none;
}

.fr-feature-strip::before { left: 0;  background: linear-gradient(to right, var(--fr-dark-0), transparent); }
.fr-feature-strip::after  { right: 0; background: linear-gradient(to left, var(--fr-dark-0), transparent); }

.fr-feature-strip__track {
  display: flex;
  gap: var(--fr-sp-10);
  animation: fr-ticker-scroll 20s linear infinite;
  white-space: nowrap;
}

.fr-feature-strip__item {
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 800;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  white-space: nowrap;
  color: rgba(255,255,255,0.15);
  transition: color var(--fr-ease-med);
}

.fr-feature-strip__item--accent {
  color: var(--fr-lime);
}

/* ── USAGE EXAMPLE HTML ──
<div class="fr-ticker-strip">
  <div class="fr-ticker-track">
    <!-- Duplicate content for seamless loop -->
    <span class="fr-ticker-item">Join thousands of traders growing with FundingRock</span>
    <span class="fr-ticker-item fr-ticker-item--accent">Your next trading challenge starts here</span>
    <span class="fr-ticker-item">Take the first step today</span>
    <!-- Exact duplicate for loop -->
    <span class="fr-ticker-item">Join thousands of traders growing with FundingRock</span>
    <span class="fr-ticker-item fr-ticker-item--accent">Your next trading challenge starts here</span>
    <span class="fr-ticker-item">Take the first step today</span>
  </div>
</div>
*/
```

---

### 5.7 Halftone Triangle Dot Matrix

```css
/* ============================================================
   MORPHISM 7: HALFTONE TRIANGLE DOT MATRIX
   Applied to: Hero section background decoration,
               section dividers, empty state backgrounds
   ============================================================ */

/* Pure CSS triangle dot matrix — no image required */
.fr-halftone {
  position: absolute;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* Background image approach — SVG data URI */
.fr-halftone--bg {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpolygon points='8,2 14,14 2,14' fill='%2300D4C8' opacity='0.15'/%3E%3C/svg%3E");
  background-size: 16px 16px;
  /* Fade out at edges using mask */
  -webkit-mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 70%);
  mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 70%);
}

/* Hero right-edge placement (as seen in Image 1) */
.fr-halftone--hero-right {
  right: -40px;
  top: 0;
  width: 480px;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Cpolygon points='6,1 11,11 1,11' fill='%23CCFF00' opacity='0.08'/%3E%3C/svg%3E");
  background-size: 12px 12px;
  -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 80%),
                      linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
  mask-image: linear-gradient(to left, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 80%),
              linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
  mask-composite: intersect;
  -webkit-mask-composite: source-in;
}

/* Blue-green gradient variant (as seen in Image 8) */
.fr-halftone--blue-green {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Cpolygon points='5,1 9,9 1,9' fill='%2300D4C8' opacity='0.2'/%3E%3C/svg%3E");
  background-size: 10px 10px;
  -webkit-mask-image: linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%);
  mask-image: linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%);
}

/* USAGE EXAMPLE HTML:
<section class="fr-section" style="position:relative">
  <div class="fr-halftone fr-halftone--hero-right" style="position:absolute;top:0;right:0;bottom:0;width:50%"></div>
  <div class="fr-container" style="position:relative;z-index:1">
    <!-- Hero content here -->
  </div>
</section>
*/
```

---

## 6. Global Base & Reset Styles

This is the complete global CSS that must be applied site-wide.

```css
/* ============================================================
   GLOBAL BASE STYLES
   File: /src/styles/global.css
   ============================================================ */

/* Headings inherit color from context by default */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--fr-font-sans);
  color: var(--fr-text-primary);
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}

p  { color: var(--fr-text-secondary); line-height: 1.65; margin: 0; }
a  { color: var(--fr-lime); text-decoration: none; transition: opacity var(--fr-ease-fast); }
a:hover { opacity: 0.8; }
img { display: block; max-width: 100%; }
button { font-family: var(--fr-font-sans); cursor: pointer; }
input, textarea, select { font-family: var(--fr-font-sans); }

/* Focus ring — lime-colored for brand consistency */
:focus-visible {
  outline: 2px solid var(--fr-lime);
  outline-offset: 2px;
  border-radius: var(--fr-radius-sm);
}

/* Utility: visually hidden (accessibility) */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}

/* Dividers */
.fr-divider {
  width: 100%;
  height: 1px;
  background: var(--fr-border-subtle);
  border: none;
  margin: 0;
}

/* Text utilities */
.fr-text-center { text-align: center; }
.fr-text-right  { text-align: right;  }

/* Flex utilities */
.fr-flex        { display: flex; }
.fr-flex-center { display: flex; align-items: center; justify-content: center; }
.fr-flex-between{ display: flex; align-items: center; justify-content: space-between; }
.fr-flex-col    { display: flex; flex-direction: column; }
.fr-gap-2 { gap: var(--fr-sp-2); }
.fr-gap-3 { gap: var(--fr-sp-3); }
.fr-gap-4 { gap: var(--fr-sp-4); }
.fr-gap-6 { gap: var(--fr-sp-6); }

/* Grid utilities */
.fr-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--fr-sp-6); }
.fr-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--fr-sp-6); }
.fr-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--fr-sp-5); }

@media (max-width: 768px) {
  .fr-grid-2, .fr-grid-3, .fr-grid-4 { grid-template-columns: 1fr; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .fr-grid-3 { grid-template-columns: repeat(2, 1fr); }
  .fr-grid-4 { grid-template-columns: repeat(2, 1fr); }
}

/* Spacing utilities */
.fr-mt-4  { margin-top: var(--fr-sp-4);  }
.fr-mt-6  { margin-top: var(--fr-sp-6);  }
.fr-mt-8  { margin-top: var(--fr-sp-8);  }
.fr-mt-12 { margin-top: var(--fr-sp-12); }
.fr-mb-4  { margin-bottom: var(--fr-sp-4);  }
.fr-mb-6  { margin-bottom: var(--fr-sp-6);  }
.fr-mb-8  { margin-bottom: var(--fr-sp-8);  }
```

---

## 7. Component Library

### 7.1 Navigation Bar

The navigation bar is **sticky**, **full-width**, sits immediately below the ticker strip, and collapses to a hamburger on mobile.

```css
/* ============================================================
   COMPONENT: NAVIGATION BAR
   ============================================================ */

.fr-nav {
  position: sticky;
  top: 0;
  z-index: var(--fr-z-sticky);
  height: var(--fr-nav-height);
  background: rgba(5, 5, 5, 0.92);
  border-bottom: 1px solid var(--fr-border-subtle);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  width: 100%;
}

.fr-nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--fr-sp-6);
  gap: var(--fr-sp-8);
}

/* Brand logo */
.fr-nav__logo {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-3);
  text-decoration: none;
  flex-shrink: 0;
}

.fr-nav__logo-icon {
  width: 36px;
  height: 36px;
  background: var(--fr-lime);
  border-radius: var(--fr-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 900;
  color: #000;
  letter-spacing: -0.05em;
}

.fr-nav__logo-name {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--fr-text-primary);
}

/* Navigation links */
.fr-nav__links {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-1);
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
}

.fr-nav__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--fr-sp-1);
  padding: var(--fr-sp-2) var(--fr-sp-3);
  border-radius: var(--fr-radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--fr-text-secondary);
  text-decoration: none;
  white-space: nowrap;
  transition: color var(--fr-ease-fast), background var(--fr-ease-fast);
}

.fr-nav__link:hover {
  color: var(--fr-text-primary);
  background: rgba(255,255,255,0.05);
}

.fr-nav__link--active {
  color: var(--fr-lime);
}

.fr-nav__link--active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: var(--fr-sp-3);
  right: var(--fr-sp-3);
  height: 2px;
  background: var(--fr-lime);
  border-radius: 1px;
}

/* Dropdown caret */
.fr-nav__caret {
  width: 14px;
  height: 14px;
  color: currentColor;
  transition: transform var(--fr-ease-fast);
}

.fr-nav__link[aria-expanded="true"] .fr-nav__caret {
  transform: rotate(180deg);
}

/* Dropdown menu */
.fr-nav__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 220px;
  background: var(--fr-dark-4);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-lg);
  padding: var(--fr-sp-2);
  z-index: var(--fr-z-dropdown);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: opacity var(--fr-ease-fast), transform var(--fr-ease-fast), visibility var(--fr-ease-fast);
}

.fr-nav__link:hover .fr-nav__dropdown,
.fr-nav__link:focus-within .fr-nav__dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.fr-nav__dropdown-item {
  display: block;
  padding: var(--fr-sp-3) var(--fr-sp-4);
  font-size: 14px;
  color: var(--fr-text-secondary);
  border-radius: var(--fr-radius-md);
  transition: background var(--fr-ease-fast), color var(--fr-ease-fast);
  text-decoration: none;
}

.fr-nav__dropdown-item:hover {
  background: rgba(255,255,255,0.06);
  color: var(--fr-text-primary);
}

/* Right actions */
.fr-nav__actions {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-3);
  flex-shrink: 0;
}

/* Login link */
.fr-nav__login {
  font-size: 14px;
  font-weight: 500;
  color: var(--fr-text-secondary);
  text-decoration: none;
  padding: var(--fr-sp-2) var(--fr-sp-3);
  border-radius: var(--fr-radius-md);
  transition: color var(--fr-ease-fast), background var(--fr-ease-fast);
}

.fr-nav__login:hover {
  color: var(--fr-text-primary);
  background: rgba(255,255,255,0.05);
}

/* Hamburger — mobile only */
.fr-nav__hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: var(--fr-sp-2);
  background: transparent;
  border: none;
  cursor: pointer;
}

.fr-nav__hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--fr-text-secondary);
  border-radius: 1px;
  transition: all var(--fr-ease-fast);
}

@media (max-width: 1024px) {
  .fr-nav__links       { display: none; }
  .fr-nav__hamburger   { display: flex; }
}

/* Mobile nav drawer */
.fr-nav__mobile-drawer {
  position: fixed;
  top: calc(var(--fr-ticker-height) + var(--fr-nav-height));
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--fr-dark-1);
  z-index: var(--fr-z-modal);
  padding: var(--fr-sp-6);
  overflow-y: auto;
  transform: translateX(100%);
  transition: transform var(--fr-ease-med);
}

.fr-nav__mobile-drawer--open {
  transform: translateX(0);
}

.fr-nav__mobile-link {
  display: block;
  padding: var(--fr-sp-4) 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--fr-text-primary);
  text-decoration: none;
  border-bottom: 1px solid var(--fr-border-subtle);
  transition: color var(--fr-ease-fast);
}

.fr-nav__mobile-link:hover { color: var(--fr-lime); }
```

---

### 7.2 Announcement Ticker (Top Bar)

```html
<!-- USAGE HTML — Announcement Ticker -->
<div class="fr-ticker-strip">
  <div class="fr-ticker-track" aria-live="off" aria-label="Site announcements">
    <span class="fr-ticker-item">FUNDINGROCK</span>
    <span class="fr-ticker-item fr-ticker-item--accent">Join thousands of traders growing with FundingRock</span>
    <span class="fr-ticker-item">Your next trading challenge starts here</span>
    <span class="fr-ticker-item fr-ticker-item--accent">Take the first step today</span>
    <!-- Exact duplicate for seamless loop -->
    <span class="fr-ticker-item">FUNDINGROCK</span>
    <span class="fr-ticker-item fr-ticker-item--accent">Join thousands of traders growing with FundingRock</span>
    <span class="fr-ticker-item">Your next trading challenge starts here</span>
    <span class="fr-ticker-item fr-ticker-item--accent">Take the first step today</span>
  </div>
</div>
```

---

### 7.3 Buttons

```css
/* ============================================================
   COMPONENT: BUTTONS
   ============================================================ */

/* Base reset for all buttons */
.fr-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--fr-sp-2);
  font-family: var(--fr-font-sans);
  font-weight: 600;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  transition:
    background var(--fr-ease-fast),
    color var(--fr-ease-fast),
    transform var(--fr-ease-fast),
    box-shadow var(--fr-ease-fast),
    opacity var(--fr-ease-fast);
  position: relative;
  overflow: hidden;
  -webkit-user-select: none;
  user-select: none;
}

.fr-btn:active { transform: scale(0.97); }
.fr-btn:disabled { opacity: 0.45; pointer-events: none; }

/* Size variants */
.fr-btn--sm  { height: 34px; padding: 0 var(--fr-sp-4);  font-size: 13px; border-radius: var(--fr-radius-md);  }
.fr-btn--md  { height: 42px; padding: 0 var(--fr-sp-5);  font-size: 14px; border-radius: var(--fr-radius-md);  }
.fr-btn--lg  { height: 50px; padding: 0 var(--fr-sp-6);  font-size: 15px; border-radius: var(--fr-radius-lg);  }
.fr-btn--xl  { height: 58px; padding: 0 var(--fr-sp-8);  font-size: 16px; border-radius: var(--fr-radius-lg);  }

/* PRIMARY — Lime background, black text */
.fr-btn--primary {
  background: var(--fr-lime);
  color: #000000;
}
.fr-btn--primary:hover {
  background: #D9FF1A;
  box-shadow: 0 0 0 3px var(--fr-lime-glow);
}
.fr-btn--primary:focus-visible {
  box-shadow: 0 0 0 3px var(--fr-lime-glow-md);
}

/* SECONDARY — Transparent with lime border */
.fr-btn--secondary {
  background: transparent;
  color: var(--fr-lime);
  border: 1px solid rgba(204, 255, 0, 0.4);
}
.fr-btn--secondary:hover {
  background: var(--fr-lime-glow);
  border-color: var(--fr-lime);
}

/* GHOST — Transparent, white text */
.fr-btn--ghost {
  background: transparent;
  color: var(--fr-text-secondary);
  border: 1px solid var(--fr-border-default);
}
.fr-btn--ghost:hover {
  background: rgba(255,255,255,0.05);
  border-color: var(--fr-border-medium);
  color: var(--fr-text-primary);
}

/* DANGER */
.fr-btn--danger {
  background: rgba(248,113,113,0.12);
  color: var(--fr-text-danger);
  border: 1px solid var(--fr-danger-border);
}
.fr-btn--danger:hover {
  background: rgba(248,113,113,0.20);
  border-color: #F87171;
}

/* SUCCESS */
.fr-btn--success {
  background: rgba(74,222,128,0.12);
  color: var(--fr-text-success);
  border: 1px solid var(--fr-success-border);
}
.fr-btn--success:hover {
  background: rgba(74,222,128,0.20);
}

/* Full width */
.fr-btn--full { width: 100%; }

/* Icon-only */
.fr-btn--icon {
  width: 42px;
  height: 42px;
  padding: 0;
  border-radius: var(--fr-radius-md);
}
.fr-btn--icon.fr-btn--sm { width: 34px; height: 34px; }
.fr-btn--icon.fr-btn--lg { width: 50px; height: 50px; }

/* Loading spinner state */
.fr-btn--loading {
  pointer-events: none;
  color: transparent;
}
.fr-btn--loading::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0,0,0,0.3);
  border-top-color: #000;
  border-radius: 50%;
  animation: fr-spin 0.7s linear infinite;
}
.fr-btn--primary.fr-btn--loading::after { border-color: rgba(0,0,0,0.3); border-top-color: #000; }
.fr-btn--ghost.fr-btn--loading::after   { border-color: rgba(255,255,255,0.2); border-top-color: #fff; }

@keyframes fr-spin { to { transform: rotate(360deg); } }

/* USAGE EXAMPLE HTML:
<button class="fr-btn fr-btn--primary fr-btn--lg">Get Started</button>
<button class="fr-btn fr-btn--secondary fr-btn--md">Learn More</button>
<a href="/login" class="fr-btn fr-btn--ghost fr-btn--md">Login</a>
<button class="fr-btn fr-btn--primary fr-btn--md fr-btn--loading">Loading</button>
*/
```

---

### 7.4–7.6 Aurora, Neon, Skeuomorphic Cards

*See Section 5.2, 5.3, and 5.4 above — full CSS provided there.*

**Grid layout wrapper for card sets:**

```css
/* 3-column card grid (Steps, Features) */
.fr-card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--fr-sp-6);
}

@media (max-width: 900px)  { .fr-card-grid { grid-template-columns: 1fr; } }
@media (max-width: 1100px) { .fr-card-grid { grid-template-columns: repeat(2, 1fr); } }

/* Payout cert carousel wrapper */
.fr-cert-carousel {
  position: relative;
  overflow: hidden;
}

.fr-cert-track {
  display: flex;
  gap: var(--fr-sp-5);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-bottom: var(--fr-sp-4);
}

.fr-cert-track::-webkit-scrollbar { display: none; }

.fr-cert-track .fr-neon-card {
  flex: 0 0 260px;
  scroll-snap-align: start;
}

/* Navigation dots */
.fr-carousel-dots {
  display: flex;
  justify-content: center;
  gap: var(--fr-sp-2);
  margin-top: var(--fr-sp-5);
}

.fr-carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--fr-border-medium);
  border: none;
  cursor: pointer;
  transition: background var(--fr-ease-fast), transform var(--fr-ease-fast);
}

.fr-carousel-dot--active {
  background: var(--fr-lime);
  transform: scale(1.3);
}
```

---

### 7.8 Forms, Inputs & Selects

```css
/* ============================================================
   COMPONENT: FORMS, INPUTS, SELECTS
   ============================================================ */

.fr-form-group {
  display: flex;
  flex-direction: column;
  gap: var(--fr-sp-2);
}

.fr-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--fr-text-secondary);
  display: flex;
  align-items: center;
  gap: var(--fr-sp-2);
}

.fr-label__required {
  color: var(--fr-text-danger);
  font-size: 14px;
}

/* Base input styles */
.fr-input,
.fr-select,
.fr-textarea {
  width: 100%;
  height: 46px;
  background: var(--fr-dark-3);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-md);
  padding: 0 var(--fr-sp-4);
  font-family: var(--fr-font-sans);
  font-size: 14px;
  color: var(--fr-text-primary);
  transition: border-color var(--fr-ease-fast), box-shadow var(--fr-ease-fast), background var(--fr-ease-fast);
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}

.fr-input::placeholder,
.fr-textarea::placeholder {
  color: var(--fr-text-disabled);
}

.fr-input:hover,
.fr-select:hover,
.fr-textarea:hover {
  border-color: var(--fr-border-medium);
  background: var(--fr-dark-4);
}

.fr-input:focus,
.fr-select:focus,
.fr-textarea:focus {
  border-color: var(--fr-lime);
  box-shadow: 0 0 0 3px var(--fr-lime-glow);
  background: var(--fr-dark-4);
}

/* States */
.fr-input--error    { border-color: #F87171 !important; }
.fr-input--success  { border-color: #4ADE80 !important; }
.fr-input--error:focus   { box-shadow: 0 0 0 3px rgba(248,113,113,0.15); }
.fr-input--success:focus { box-shadow: 0 0 0 3px rgba(74,222,128,0.15); }

/* Textarea */
.fr-textarea {
  height: auto;
  min-height: 120px;
  padding: var(--fr-sp-3) var(--fr-sp-4);
  resize: vertical;
  line-height: 1.65;
}

/* Select */
.fr-select-wrapper {
  position: relative;
}

.fr-select {
  padding-right: 40px;
  cursor: pointer;
}

.fr-select-wrapper::after {
  content: '';
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid var(--fr-text-tertiary);
  pointer-events: none;
}

/* Input with icon prefix */
.fr-input-wrapper {
  position: relative;
}

.fr-input-wrapper .fr-input {
  padding-left: 44px;
}

.fr-input-prefix {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--fr-text-tertiary);
  display: flex;
  align-items: center;
  pointer-events: none;
}

/* Password toggle */
.fr-input-suffix {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--fr-text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color var(--fr-ease-fast);
}

.fr-input-suffix:hover { color: var(--fr-text-secondary); }

/* Form helper / error text */
.fr-helper-text {
  font-size: 12px;
  color: var(--fr-text-tertiary);
  margin-top: 4px;
}

.fr-error-text {
  font-size: 12px;
  color: var(--fr-text-danger);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Checkbox */
.fr-checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  gap: var(--fr-sp-3);
  cursor: pointer;
}

.fr-checkbox {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  background: var(--fr-dark-3);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-sm);
  cursor: pointer;
  transition: all var(--fr-ease-fast);
  appearance: none;
  -webkit-appearance: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.fr-checkbox:checked {
  background: var(--fr-lime);
  border-color: var(--fr-lime);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 6l3 3 5-5' stroke='%23000' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
}

.fr-checkbox:focus-visible {
  outline: 2px solid var(--fr-lime);
  outline-offset: 2px;
}

/* Radio */
.fr-radio {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  background: var(--fr-dark-3);
  border: 1px solid var(--fr-border-default);
  border-radius: 50%;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: all var(--fr-ease-fast);
  position: relative;
}

.fr-radio:checked {
  border-color: var(--fr-lime);
  background: var(--fr-lime-glow);
}

.fr-radio:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: var(--fr-lime);
  border-radius: 50%;
}

/* Toggle / Switch */
.fr-toggle {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.fr-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.fr-toggle__track {
  position: absolute;
  inset: 0;
  background: var(--fr-dark-5);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-pill);
  cursor: pointer;
  transition: all var(--fr-ease-fast);
}

.fr-toggle input:checked + .fr-toggle__track {
  background: var(--fr-lime);
  border-color: var(--fr-lime);
}

.fr-toggle__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform var(--fr-ease-fast);
  pointer-events: none;
}

.fr-toggle input:checked ~ .fr-toggle__thumb {
  transform: translateX(20px);
}

/* USAGE EXAMPLE HTML:
<div class="fr-form-group">
  <label class="fr-label" for="email">
    Email Address <span class="fr-label__required">*</span>
  </label>
  <div class="fr-input-wrapper">
    <span class="fr-input-prefix">
      <svg width="16" height="16">...</svg>
    </span>
    <input type="email" id="email" class="fr-input" placeholder="you@email.com" />
  </div>
  <span class="fr-helper-text">We'll never share your email.</span>
</div>
*/
```

---

### 7.9 Tables

```css
/* ============================================================
   COMPONENT: TABLES
   Applied to: Transaction history, leaderboard, admin panels,
               trade history, payout history
   ============================================================ */

.fr-table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--fr-border-subtle);
  border-radius: var(--fr-radius-lg);
  scrollbar-width: thin;
}

.fr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 600px;
}

/* Header */
.fr-table thead tr {
  background: var(--fr-dark-2);
  border-bottom: 1px solid var(--fr-border-default);
}

.fr-table thead th {
  padding: var(--fr-sp-4) var(--fr-sp-5);
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fr-text-tertiary);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.fr-table thead th:hover {
  color: var(--fr-text-secondary);
}

/* Sort indicator */
.fr-table thead th[data-sort]::after {
  content: '↕';
  margin-left: var(--fr-sp-2);
  opacity: 0.4;
  font-size: 10px;
}
.fr-table thead th[data-sort="asc"]::after  { content: '↑'; opacity: 1; color: var(--fr-lime); }
.fr-table thead th[data-sort="desc"]::after { content: '↓'; opacity: 1; color: var(--fr-lime); }

/* Body rows */
.fr-table tbody tr {
  border-bottom: 1px solid var(--fr-border-subtle);
  transition: background var(--fr-ease-fast);
}

.fr-table tbody tr:last-child { border-bottom: none; }

.fr-table tbody tr:hover { background: rgba(255,255,255,0.025); }

.fr-table td {
  padding: var(--fr-sp-4) var(--fr-sp-5);
  color: var(--fr-text-secondary);
  vertical-align: middle;
}

.fr-table td:first-child { color: var(--fr-text-primary); font-weight: 500; }

/* Monospaced numbers */
.fr-table td.fr-mono { font-family: var(--fr-font-mono); letter-spacing: -0.02em; }

/* Status cells */
.fr-table td.fr-success { color: var(--fr-text-success); font-weight: 500; }
.fr-table td.fr-danger  { color: var(--fr-text-danger);  font-weight: 500; }
.fr-table td.fr-warning { color: var(--fr-text-warning); font-weight: 500; }

/* Striped variant */
.fr-table--striped tbody tr:nth-child(even) {
  background: rgba(255,255,255,0.015);
}

/* Table toolbar (search + filter bar above table) */
.fr-table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fr-sp-4);
  padding: var(--fr-sp-4) var(--fr-sp-5);
  background: var(--fr-dark-2);
  border-bottom: 1px solid var(--fr-border-subtle);
  flex-wrap: wrap;
}

.fr-table-search {
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}
```

---

### 7.10 Modals & Overlays

```css
/* ============================================================
   COMPONENT: MODALS & OVERLAYS
   ============================================================ */

.fr-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--fr-z-modal);
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--fr-sp-6);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--fr-ease-med);
}

.fr-modal-overlay--open {
  opacity: 1;
  pointer-events: auto;
}

.fr-modal {
  position: relative;
  background: var(--fr-dark-3);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-xl);
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  transform: scale(0.94) translateY(12px);
  transition: transform var(--fr-ease-med);
  scrollbar-width: thin;
}

.fr-modal-overlay--open .fr-modal {
  transform: scale(1) translateY(0);
}

.fr-modal--sm { max-width: 380px; }
.fr-modal--lg { max-width: 760px; }
.fr-modal--xl { max-width: 960px; }

.fr-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--fr-sp-6);
  border-bottom: 1px solid var(--fr-border-subtle);
  position: sticky;
  top: 0;
  background: var(--fr-dark-3);
  z-index: 1;
}

.fr-modal__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--fr-text-primary);
}

.fr-modal__close {
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--fr-text-tertiary);
  transition: all var(--fr-ease-fast);
}

.fr-modal__close:hover {
  background: rgba(255,255,255,0.10);
  color: var(--fr-text-primary);
}

.fr-modal__body {
  padding: var(--fr-sp-6);
}

.fr-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--fr-sp-3);
  padding: var(--fr-sp-5) var(--fr-sp-6);
  border-top: 1px solid var(--fr-border-subtle);
}
```

---

### 7.11 Badges, Pills & Tags

```css
/* ============================================================
   COMPONENT: BADGES, PILLS & TAGS
   ============================================================ */

.fr-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: var(--fr-radius-pill);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  border: 1px solid transparent;
}

.fr-badge--lime    { background: rgba(204,255,0,0.12);  color: #CCFF00; border-color: rgba(204,255,0,0.25); }
.fr-badge--teal    { background: rgba(0,212,200,0.12);  color: #00D4C8; border-color: rgba(0,212,200,0.25); }
.fr-badge--purple  { background: rgba(155,93,229,0.12); color: #B78FFF; border-color: rgba(155,93,229,0.25); }
.fr-badge--green   { background: rgba(74,222,128,0.12); color: #4ADE80; border-color: rgba(74,222,128,0.25); }
.fr-badge--red     { background: rgba(248,113,113,0.12);color: #F87171; border-color: rgba(248,113,113,0.25); }
.fr-badge--yellow  { background: rgba(251,191,36,0.12); color: #FBBF24; border-color: rgba(251,191,36,0.25); }
.fr-badge--gray    { background: rgba(255,255,255,0.06);color: rgba(255,255,255,0.55); border-color: rgba(255,255,255,0.10); }

/* Dot indicator */
.fr-badge--dot::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

/* Country flag badge (Testimonials) */
.fr-country-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--fr-sp-2);
  font-size: 12px;
  color: var(--fr-text-secondary);
}

/* Status indicator */
.fr-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}

.fr-status::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.fr-status--active::before   { background: #4ADE80; box-shadow: 0 0 6px rgba(74,222,128,0.5); }
.fr-status--pending::before  { background: #FBBF24; box-shadow: 0 0 6px rgba(251,191,36,0.5); }
.fr-status--failed::before   { background: #F87171; box-shadow: 0 0 6px rgba(248,113,113,0.5); }
.fr-status--inactive::before { background: var(--fr-text-disabled); }

/* Animated pulse for live/active */
@keyframes fr-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
  70%  { box-shadow: 0 0 0 6px rgba(74,222,128,0); }
  100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); }
}

.fr-status--live::before {
  background: #4ADE80;
  animation: fr-pulse 2s ease-out infinite;
}
```

---

### 7.12 Alerts & Toast Notifications

```css
/* ============================================================
   COMPONENT: ALERTS & TOAST NOTIFICATIONS
   ============================================================ */

/* Inline alerts (inside page content) */
.fr-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--fr-sp-3);
  padding: var(--fr-sp-4) var(--fr-sp-5);
  border-radius: var(--fr-radius-lg);
  border: 1px solid transparent;
  font-size: 14px;
}

.fr-alert__icon { flex-shrink: 0; width: 20px; height: 20px; margin-top: 1px; }

.fr-alert__body { flex: 1; }
.fr-alert__title { font-weight: 600; color: inherit; margin-bottom: 4px; }
.fr-alert__text  { color: inherit; opacity: 0.85; line-height: 1.5; }

.fr-alert--success { background: var(--fr-success-bg); border-color: var(--fr-success-border); color: #4ADE80; }
.fr-alert--danger  { background: var(--fr-danger-bg);  border-color: var(--fr-danger-border);  color: #F87171; }
.fr-alert--warning { background: var(--fr-warning-bg); border-color: var(--fr-warning-border); color: #FBBF24; }
.fr-alert--info    { background: var(--fr-info-bg);    border-color: var(--fr-info-border);    color: #60A5FA; }

/* Toast notification (floating) */
.fr-toast-container {
  position: fixed;
  bottom: var(--fr-sp-6);
  right: var(--fr-sp-6);
  z-index: var(--fr-z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--fr-sp-3);
  pointer-events: none;
  max-width: 380px;
  width: calc(100vw - var(--fr-sp-8));
}

.fr-toast {
  display: flex;
  align-items: flex-start;
  gap: var(--fr-sp-3);
  padding: var(--fr-sp-4) var(--fr-sp-5);
  background: var(--fr-dark-4);
  border: 1px solid var(--fr-border-medium);
  border-radius: var(--fr-radius-lg);
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  pointer-events: auto;
  animation: fr-toast-in 0.3s var(--fr-ease-bounce);
}

.fr-toast--success { border-left: 3px solid #4ADE80; }
.fr-toast--danger  { border-left: 3px solid #F87171; }
.fr-toast--warning { border-left: 3px solid #FBBF24; }
.fr-toast--info    { border-left: 3px solid #60A5FA; }

.fr-toast__title { font-size: 14px; font-weight: 600; color: var(--fr-text-primary); }
.fr-toast__text  { font-size: 13px; color: var(--fr-text-secondary); margin-top: 2px; }

@keyframes fr-toast-in {
  from { transform: translateX(20px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
```

---

### 7.13 Progress Bars & Step Indicators

```css
/* ============================================================
   COMPONENT: PROGRESS BARS & STEP INDICATORS
   ============================================================ */

/* Linear progress */
.fr-progress {
  width: 100%;
  height: 6px;
  background: var(--fr-dark-5);
  border-radius: var(--fr-radius-pill);
  overflow: hidden;
}

.fr-progress__fill {
  height: 100%;
  background: var(--fr-lime);
  border-radius: var(--fr-radius-pill);
  transition: width var(--fr-ease-slow);
  position: relative;
}

/* Animated shimmer on fill */
.fr-progress__fill::after {
  content: '';
  position: absolute;
  top: 0; bottom: 0;
  width: 60px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: fr-shimmer 2s ease-in-out infinite;
}

@keyframes fr-shimmer {
  0%   { left: -60px; }
  100% { left: 100%;  }
}

/* Color variants */
.fr-progress__fill--teal    { background: #00D4C8; }
.fr-progress__fill--green   { background: #4ADE80; }
.fr-progress__fill--danger  { background: #F87171; }
.fr-progress__fill--purple  { background: #9B5DE5; }

/* Progress with label */
.fr-progress-group {
  display: flex;
  flex-direction: column;
  gap: var(--fr-sp-2);
}

.fr-progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fr-progress-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--fr-text-secondary);
}

.fr-progress-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--fr-lime);
  font-family: var(--fr-font-mono);
}

/* Step progress (challenge tracker) */
.fr-steps {
  display: flex;
  align-items: center;
  gap: 0;
}

.fr-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--fr-sp-2);
  flex: 1;
  position: relative;
}

/* Connector line between steps */
.fr-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 16px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--fr-border-default);
  z-index: 0;
}

.fr-step--completed:not(:last-child)::after {
  background: var(--fr-lime);
}

.fr-step__circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--fr-dark-3);
  border: 2px solid var(--fr-border-default);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--fr-text-tertiary);
  position: relative;
  z-index: 1;
  transition: all var(--fr-ease-fast);
}

.fr-step--completed .fr-step__circle {
  background: var(--fr-lime);
  border-color: var(--fr-lime);
  color: #000;
}

.fr-step--active .fr-step__circle {
  border-color: var(--fr-lime);
  color: var(--fr-lime);
  box-shadow: 0 0 0 4px var(--fr-lime-glow);
}

.fr-step__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--fr-text-tertiary);
  text-align: center;
  white-space: nowrap;
}

.fr-step--active .fr-step__label    { color: var(--fr-lime); }
.fr-step--completed .fr-step__label { color: var(--fr-text-secondary); }
```

---

### 7.14 Avatars & User Identity

```css
/* ============================================================
   COMPONENT: AVATARS & USER IDENTITY
   ============================================================ */

.fr-avatar {
  border-radius: 50%;
  background: var(--fr-dark-4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--fr-text-secondary);
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid var(--fr-border-default);
  font-family: var(--fr-font-sans);
}

.fr-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }

.fr-avatar--xs  { width: 24px;  height: 24px;  font-size: 10px; border-width: 1px; }
.fr-avatar--sm  { width: 32px;  height: 32px;  font-size: 12px; }
.fr-avatar--md  { width: 42px;  height: 42px;  font-size: 15px; }
.fr-avatar--lg  { width: 56px;  height: 56px;  font-size: 20px; }
.fr-avatar--xl  { width: 80px;  height: 80px;  font-size: 28px; }

/* Online indicator */
.fr-avatar-wrapper {
  position: relative;
  display: inline-flex;
}

.fr-avatar-status {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--fr-black);
}

.fr-avatar-status--online  { background: #4ADE80; }
.fr-avatar-status--offline { background: var(--fr-dark-5); }
.fr-avatar-status--away    { background: #FBBF24; }

/* User info row */
.fr-user-row {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-3);
}

.fr-user-row__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--fr-text-primary);
}

.fr-user-row__sub {
  font-size: 12px;
  color: var(--fr-text-tertiary);
}
```

---

### 7.15 Loading Skeletons & Spinners

```css
/* ============================================================
   COMPONENT: LOADING SKELETONS & SPINNERS
   ============================================================ */

/* Skeleton loading — shimmer effect */
@keyframes fr-skeleton-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0;  }
}

.fr-skeleton {
  background: var(--fr-dark-3);
  background-image: linear-gradient(
    90deg,
    var(--fr-dark-3) 0px,
    rgba(255,255,255,0.04) 40px,
    var(--fr-dark-3) 80px
  );
  background-size: 800px 100%;
  animation: fr-skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: var(--fr-radius-md);
}

.fr-skeleton--text  { height: 14px; }
.fr-skeleton--title { height: 24px; }
.fr-skeleton--card  { height: 120px; border-radius: var(--fr-radius-lg); }
.fr-skeleton--circle { border-radius: 50%; }

/* Spinner */
.fr-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--fr-border-default);
  border-top-color: var(--fr-lime);
  border-radius: 50%;
  animation: fr-spin 0.7s linear infinite;
  display: inline-block;
}

.fr-spinner--sm { width: 16px; height: 16px; border-width: 1.5px; }
.fr-spinner--lg { width: 40px; height: 40px; border-width: 3px; }

/* Full-page loader */
.fr-page-loader {
  position: fixed;
  inset: 0;
  background: var(--fr-black);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: var(--fr-sp-5);
}

.fr-page-loader__logo {
  width: 56px;
  height: 56px;
  background: var(--fr-lime);
  border-radius: var(--fr-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 900;
  color: #000;
  animation: fr-pulse-logo 1.5s ease-in-out infinite;
}

@keyframes fr-pulse-logo {
  0%, 100% { box-shadow: 0 0 0 0 rgba(204,255,0,0.4); }
  50%       { box-shadow: 0 0 0 16px rgba(204,255,0,0); }
}
```

---

### 7.16–7.25 Additional Components

```css
/* ============================================================
   7.16 SIDEBAR (Dashboard Panel)
   ============================================================ */

.fr-sidebar {
  width: var(--fr-sidebar-width);
  height: calc(100vh - var(--fr-nav-height) - var(--fr-ticker-height));
  background: var(--fr-dark-1);
  border-right: 1px solid var(--fr-border-subtle);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: sticky;
  top: calc(var(--fr-nav-height) + var(--fr-ticker-height));
  scrollbar-width: none;
}

.fr-sidebar::-webkit-scrollbar { display: none; }

.fr-sidebar__section { padding: var(--fr-sp-4) var(--fr-sp-3); }

.fr-sidebar__section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--fr-text-disabled);
  padding: var(--fr-sp-2) var(--fr-sp-3) var(--fr-sp-3);
}

.fr-sidebar__item {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-3);
  padding: var(--fr-sp-3) var(--fr-sp-3);
  border-radius: var(--fr-radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--fr-text-tertiary);
  text-decoration: none;
  transition: all var(--fr-ease-fast);
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}

.fr-sidebar__item:hover {
  background: rgba(255,255,255,0.05);
  color: var(--fr-text-secondary);
}

.fr-sidebar__item--active {
  background: rgba(204, 255, 0, 0.08);
  color: var(--fr-lime);
}

.fr-sidebar__item--active:hover {
  background: rgba(204, 255, 0, 0.12);
}

.fr-sidebar__item-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fr-sidebar__item-badge {
  margin-left: auto;
  background: rgba(204,255,0,0.15);
  color: var(--fr-lime);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: var(--fr-radius-pill);
}

/* ============================================================
   7.17 TABS
   ============================================================ */

.fr-tabs {
  display: flex;
  border-bottom: 1px solid var(--fr-border-subtle);
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.fr-tabs::-webkit-scrollbar { display: none; }

.fr-tab {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-2);
  padding: var(--fr-sp-3) var(--fr-sp-5);
  font-size: 14px;
  font-weight: 500;
  color: var(--fr-text-tertiary);
  text-decoration: none;
  cursor: pointer;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: all var(--fr-ease-fast);
  position: relative;
  bottom: -1px;
}

.fr-tab:hover { color: var(--fr-text-secondary); }

.fr-tab--active {
  color: var(--fr-lime);
  border-bottom-color: var(--fr-lime);
}

.fr-tab__count {
  background: rgba(255,255,255,0.08);
  font-size: 11px;
  padding: 1px 7px;
  border-radius: var(--fr-radius-pill);
}

.fr-tab--active .fr-tab__count {
  background: rgba(204,255,0,0.15);
  color: var(--fr-lime);
}

/* ============================================================
   7.18 TOOLTIPS
   ============================================================ */

.fr-tooltip-wrapper {
  position: relative;
  display: inline-flex;
}

.fr-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--fr-dark-4);
  border: 1px solid var(--fr-border-medium);
  color: var(--fr-text-secondary);
  font-size: 12px;
  padding: var(--fr-sp-2) var(--fr-sp-3);
  border-radius: var(--fr-radius-md);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: all var(--fr-ease-fast);
  z-index: var(--fr-z-tooltip);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}

.fr-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--fr-border-medium);
}

.fr-tooltip-wrapper:hover .fr-tooltip {
  opacity: 1;
  visibility: visible;
}

/* ============================================================
   7.19 PAGINATION
   ============================================================ */

.fr-pagination {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-2);
}

.fr-page-btn {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--fr-radius-md);
  font-size: 13px;
  font-weight: 500;
  color: var(--fr-text-tertiary);
  background: transparent;
  border: 1px solid var(--fr-border-subtle);
  cursor: pointer;
  transition: all var(--fr-ease-fast);
  text-decoration: none;
}

.fr-page-btn:hover {
  background: rgba(255,255,255,0.05);
  color: var(--fr-text-secondary);
  border-color: var(--fr-border-default);
}

.fr-page-btn--active {
  background: rgba(204,255,0,0.12);
  color: var(--fr-lime);
  border-color: rgba(204,255,0,0.3);
}

/* ============================================================
   7.20 DROPDOWN MENU
   ============================================================ */

.fr-dropdown {
  position: relative;
  display: inline-flex;
}

.fr-dropdown__menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 200px;
  background: var(--fr-dark-4);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-lg);
  padding: var(--fr-sp-2);
  z-index: var(--fr-z-dropdown);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-6px) scale(0.98);
  transition: all var(--fr-ease-fast);
  transform-origin: top right;
}

.fr-dropdown--open .fr-dropdown__menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.fr-dropdown__item {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-3);
  padding: var(--fr-sp-3) var(--fr-sp-4);
  border-radius: var(--fr-radius-md);
  font-size: 14px;
  color: var(--fr-text-secondary);
  cursor: pointer;
  transition: all var(--fr-ease-fast);
  text-decoration: none;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
}

.fr-dropdown__item:hover {
  background: rgba(255,255,255,0.06);
  color: var(--fr-text-primary);
}

.fr-dropdown__item--danger { color: var(--fr-text-danger); }
.fr-dropdown__item--danger:hover { background: var(--fr-danger-bg); }

.fr-dropdown__divider {
  height: 1px;
  background: var(--fr-border-subtle);
  margin: var(--fr-sp-2) 0;
}

/* ============================================================
   7.21 VIDEO CARDS (Testimonial Section)
   ============================================================ */

.fr-video-card {
  position: relative;
  border-radius: var(--fr-radius-lg);
  overflow: hidden;
  cursor: pointer;
  flex: 0 0 260px;
  aspect-ratio: 9/14;
  background: var(--fr-dark-3);
  transition: transform var(--fr-ease-med), box-shadow var(--fr-ease-med);
}

.fr-video-card:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
}

.fr-video-card__thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform var(--fr-ease-slow);
}

.fr-video-card:hover .fr-video-card__thumb {
  transform: scale(1.05);
}

.fr-video-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%);
}

.fr-video-card__play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 52px;
  height: 52px;
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: all var(--fr-ease-fast);
}

.fr-video-card:hover .fr-video-card__play {
  background: var(--fr-lime);
  border-color: var(--fr-lime);
}

.fr-video-card:hover .fr-video-card__play svg {
  color: #000;
}

.fr-video-card__info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--fr-sp-4);
}

.fr-video-card__flag {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-2);
  margin-bottom: var(--fr-sp-2);
}

.fr-video-card__name {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fr-video-card__quote {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  line-height: 1.4;
  margin-top: 4px;
}
```

---

## 8. Page-by-Page Implementation

### 8.1 Home / Landing Page

The landing page is structured in these exact sections, top to bottom:

```
1. [Ticker Strip]
2. [Navigation Bar]
3. [Hero Section]
4. [Media Logos Strip]
5. [How to Get Started — 3 Aurora Cards]
6. [Why Traders Choose FundingRock — 3 Feature Icons]
7. [Feature Marquee Strip]
8. [Testimonials — Video Carousel]
9. [Check Out New Challenges — Challenge Cards]
10. [Payout Certificates — Neon Card Carousel]
11. [Trading Platform — Layered Dashboard Mockup]
12. [FR Academy — Split Layout]
13. [Footer]
```

**Hero Section CSS:**

```css
/* ============================================================
   PAGE: HOME — HERO SECTION
   ============================================================ */

.fr-hero {
  position: relative;
  min-height: calc(100vh - var(--fr-nav-height) - var(--fr-ticker-height));
  display: flex;
  align-items: center;
  overflow: hidden;
  background: var(--fr-black);
}

.fr-hero__content {
  position: relative;
  z-index: 2;
  max-width: 600px;
}

.fr-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--fr-sp-2);
  background: rgba(204,255,0,0.08);
  border: 1px solid rgba(204,255,0,0.2);
  color: var(--fr-lime);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: var(--fr-sp-2) var(--fr-sp-4);
  border-radius: var(--fr-radius-pill);
  margin-bottom: var(--fr-sp-6);
}

.fr-hero__headline {
  font-size: clamp(40px, 5.5vw, 72px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--fr-text-primary);
  margin-bottom: var(--fr-sp-6);
}

.fr-hero__headline .fr-lime { color: var(--fr-lime); }

.fr-hero__subtitle {
  font-size: 18px;
  color: var(--fr-text-secondary);
  line-height: 1.65;
  margin-bottom: var(--fr-sp-8);
  max-width: 480px;
}

.fr-hero__subtitle strong {
  color: var(--fr-lime);
  font-weight: 700;
}

.fr-hero__cta-row {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-4);
  flex-wrap: wrap;
  margin-bottom: var(--fr-sp-8);
}

.fr-hero__trust {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-3);
}

.fr-hero__trust-stars { display: flex; gap: 3px; }

.fr-hero__trust-star {
  width: 18px;
  height: 18px;
  color: #00B67A; /* Trustpilot green */
}

.fr-hero__trust-label {
  font-size: 14px;
  color: var(--fr-text-secondary);
}

.fr-hero__trust-label strong {
  color: var(--fr-text-primary);
  font-weight: 600;
}

/* Right side: hero image + dot pattern */
.fr-hero__visual {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 55%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
}

.fr-hero__person-img {
  height: 100%;
  object-fit: contain;
  object-position: bottom center;
  filter: contrast(1.05) brightness(1.02);
  position: relative;
  z-index: 1;
}

/* Green-tinted lighting overlay on person */
.fr-hero__visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 40% 30%, rgba(204,255,0,0.05) 0%, transparent 60%);
  z-index: 2;
  pointer-events: none;
}

/* ── MEDIA LOGOS STRIP ── */
.fr-logos-strip {
  border-top: 1px solid var(--fr-border-subtle);
  border-bottom: 1px solid var(--fr-border-subtle);
  background: var(--fr-dark-0);
  padding: var(--fr-sp-6) 0;
}

.fr-logos-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  flex-wrap: wrap;
}

.fr-logo-cell {
  flex: 1;
  min-width: 140px;
  max-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--fr-sp-3) var(--fr-sp-6);
  border-right: 1px solid var(--fr-border-subtle);
}

.fr-logo-cell:last-child { border-right: none; }

.fr-logo-cell img {
  max-height: 24px;
  width: auto;
  filter: brightness(0) invert(1);
  opacity: 0.45;
  transition: opacity var(--fr-ease-fast);
}

.fr-logo-cell:hover img { opacity: 0.75; }

/* ── WHY CHOOSE SECTION ── */
.fr-features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--fr-sp-8);
  text-align: center;
}

.fr-feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--fr-sp-4);
}

.fr-feature-icon {
  width: 64px;
  height: 64px;
  background: rgba(204,255,0,0.08);
  border: 1px solid rgba(204,255,0,0.20);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fr-lime);
  transition: all var(--fr-ease-fast);
}

.fr-feature-item:hover .fr-feature-icon {
  background: rgba(204,255,0,0.15);
  box-shadow: 0 0 20px rgba(204,255,0,0.2);
}

.fr-feature-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--fr-text-primary);
}

.fr-feature-desc {
  font-size: 14px;
  color: var(--fr-text-secondary);
  line-height: 1.65;
  max-width: 260px;
}

/* ── TRADING PLATFORM SECTION ── */
.fr-platform-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--fr-sp-12);
  align-items: center;
}

.fr-platform-badges {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-4);
  margin-bottom: var(--fr-sp-6);
}

.fr-platform-badge {
  height: 28px;
  filter: brightness(0) invert(1);
  opacity: 0.8;
}

.fr-platform-sub {
  font-size: 16px;
  color: var(--fr-text-secondary);
  line-height: 1.65;
  margin: var(--fr-sp-5) 0 var(--fr-sp-6);
}

.fr-platform-perks {
  display: flex;
  flex-direction: column;
  gap: var(--fr-sp-4);
  margin-bottom: var(--fr-sp-8);
}

.fr-perk {
  display: flex;
  align-items: flex-start;
  gap: var(--fr-sp-4);
}

.fr-perk__icon {
  width: 44px;
  height: 44px;
  background: rgba(204,255,0,0.06);
  border: 1px solid rgba(204,255,0,0.15);
  border-radius: var(--fr-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fr-lime);
  flex-shrink: 0;
}

.fr-perk__title { font-size: 15px; font-weight: 600; color: var(--fr-text-primary); margin-bottom: 4px; }
.fr-perk__desc  { font-size: 13px; color: var(--fr-text-secondary); line-height: 1.5; }

/* Dashboard mockup on right side */
.fr-platform-mockup {
  position: relative;
  height: 480px;
}

.fr-platform-mockup .fr-layer-1 {
  position: absolute;
  top: 0; right: 0;
  width: 380px;
  height: 420px;
  padding: var(--fr-sp-4);
  overflow: hidden;
}

.fr-platform-mockup .fr-layer-2 {
  position: absolute;
  bottom: 0; right: 40px;
  width: 220px;
  padding: var(--fr-sp-4);
}

/* ── ACADEMY SECTION ── */
.fr-academy-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--fr-sp-12);
  align-items: center;
}

.fr-academy-img {
  position: relative;
}

.fr-academy-img img {
  width: 100%;
  border-radius: var(--fr-radius-xl);
}

/* Geometric lime shape behind person */
.fr-academy-img::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 40px;
  width: 60%;
  height: 80%;
  background: var(--fr-lime);
  clip-path: polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%);
  z-index: 0;
  opacity: 0.9;
}

.fr-academy-img img { position: relative; z-index: 1; }

.fr-academy-features {
  display: flex;
  flex-direction: column;
  gap: var(--fr-sp-3);
  margin: var(--fr-sp-6) 0;
}

.fr-academy-feature {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-3);
  font-size: 15px;
  color: var(--fr-text-secondary);
}

.fr-academy-feature svg { color: var(--fr-lime); width: 18px; height: 18px; flex-shrink: 0; }
```

---

### 8.2 Login Page

```css
/* ============================================================
   PAGE: LOGIN
   ============================================================ */

.fr-auth-page {
  min-height: 100vh;
  background: var(--fr-black);
  display: grid;
  grid-template-columns: 1fr 1fr;
}

/* Left visual panel */
.fr-auth-visual {
  position: relative;
  background: var(--fr-dark-0);
  border-right: 1px solid var(--fr-border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--fr-sp-12);
  overflow: hidden;
}

.fr-auth-visual__content {
  position: relative;
  z-index: 2;
  max-width: 420px;
}

.fr-auth-visual__headline {
  font-size: 40px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--fr-text-primary);
  margin-bottom: var(--fr-sp-5);
}

.fr-auth-visual__sub {
  font-size: 16px;
  color: var(--fr-text-secondary);
  line-height: 1.65;
  margin-bottom: var(--fr-sp-8);
}

/* Decorative element */
.fr-auth-visual::before {
  content: '';
  position: absolute;
  top: -100px;
  left: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(204,255,0,0.05) 0%, transparent 70%);
  pointer-events: none;
}

/* Right form panel */
.fr-auth-form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--fr-sp-12) var(--fr-sp-8);
}

.fr-auth-card {
  width: 100%;
  max-width: 440px;
}

.fr-auth-logo {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-3);
  margin-bottom: var(--fr-sp-8);
}

.fr-auth-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--fr-text-primary);
  margin-bottom: var(--fr-sp-2);
  letter-spacing: -0.02em;
}

.fr-auth-subtitle {
  font-size: 14px;
  color: var(--fr-text-tertiary);
  margin-bottom: var(--fr-sp-8);
}

.fr-auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--fr-sp-5);
}

.fr-auth-divider {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-4);
  margin: var(--fr-sp-2) 0;
}

.fr-auth-divider__line { flex: 1; height: 1px; background: var(--fr-border-subtle); }
.fr-auth-divider__text { font-size: 12px; color: var(--fr-text-disabled); white-space: nowrap; }

.fr-auth-footer {
  margin-top: var(--fr-sp-6);
  text-align: center;
  font-size: 14px;
  color: var(--fr-text-tertiary);
}

.fr-auth-footer a { color: var(--fr-lime); font-weight: 500; }

/* Forgot password link */
.fr-auth-forgot {
  font-size: 13px;
  color: var(--fr-text-tertiary);
  text-decoration: none;
  transition: color var(--fr-ease-fast);
}
.fr-auth-forgot:hover { color: var(--fr-lime); }

/* Social login buttons */
.fr-social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--fr-sp-3);
  height: 46px;
  background: var(--fr-dark-3);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--fr-text-secondary);
  cursor: pointer;
  width: 100%;
  transition: all var(--fr-ease-fast);
}

.fr-social-btn:hover {
  background: var(--fr-dark-4);
  border-color: var(--fr-border-medium);
  color: var(--fr-text-primary);
}

/* Mobile: stack vertically */
@media (max-width: 768px) {
  .fr-auth-page { grid-template-columns: 1fr; }
  .fr-auth-visual { display: none; }
}
```

---

### 8.3 Register / Sign-Up Page

Reuse all `.fr-auth-*` components from Login. Additional:

```css
/* Register-specific fields */
.fr-register-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--fr-sp-4);
}

@media (max-width: 480px) {
  .fr-register-row { grid-template-columns: 1fr; }
}

/* Password strength meter */
.fr-password-strength {
  margin-top: var(--fr-sp-2);
}

.fr-password-strength__bar {
  display: flex;
  gap: 4px;
  margin-bottom: var(--fr-sp-2);
}

.fr-password-strength__seg {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: var(--fr-dark-5);
  transition: background var(--fr-ease-fast);
}

.fr-password-strength--weak   .fr-password-strength__seg:nth-child(1) { background: #F87171; }
.fr-password-strength--fair   .fr-password-strength__seg:nth-child(-n+2) { background: #FBBF24; }
.fr-password-strength--good   .fr-password-strength__seg:nth-child(-n+3) { background: #4ADE80; }
.fr-password-strength--strong .fr-password-strength__seg { background: var(--fr-lime); }

.fr-password-strength__label {
  font-size: 11px;
  color: var(--fr-text-tertiary);
}

/* Terms agreement */
.fr-terms-row {
  display: flex;
  align-items: flex-start;
  gap: var(--fr-sp-3);
}

.fr-terms-text {
  font-size: 13px;
  color: var(--fr-text-tertiary);
  line-height: 1.5;
}

.fr-terms-text a { color: var(--fr-lime); }
```

---

### 8.4 Password Reset Page

```css
/* ============================================================
   PAGE: PASSWORD RESET
   ============================================================ */

.fr-reset-page {
  min-height: 100vh;
  background: var(--fr-black);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--fr-sp-6);
}

.fr-reset-card {
  width: 100%;
  max-width: 460px;
  background: var(--fr-dark-2);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-xl);
  padding: var(--fr-sp-10);
}

.fr-reset-icon {
  width: 56px;
  height: 56px;
  background: rgba(204,255,0,0.08);
  border: 1px solid rgba(204,255,0,0.2);
  border-radius: var(--fr-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fr-lime);
  margin-bottom: var(--fr-sp-6);
}
```

---

### 8.5 Dashboard / Main Panel

```css
/* ============================================================
   PAGE: DASHBOARD / MAIN PANEL
   ============================================================ */

/* Full layout */
.fr-panel-layout {
  display: grid;
  grid-template-columns: var(--fr-sidebar-width) 1fr;
  min-height: calc(100vh - var(--fr-nav-height) - var(--fr-ticker-height));
}

/* Panel header — breadcrumb + actions row */
.fr-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--fr-sp-6);
  flex-wrap: wrap;
  gap: var(--fr-sp-4);
}

.fr-panel-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--fr-text-primary);
  letter-spacing: -0.015em;
}

.fr-panel-subtitle {
  font-size: 14px;
  color: var(--fr-text-tertiary);
  margin-top: 4px;
}

/* Account summary row — key numbers at top of dashboard */
.fr-account-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--fr-sp-4);
  margin-bottom: var(--fr-sp-6);
}

/* Main dashboard card (white-label account card) */
.fr-account-card {
  background: var(--fr-aurora-teal);
  border: 1px solid rgba(0,212,200,0.2);
  border-radius: var(--fr-radius-xl);
  padding: var(--fr-sp-6);
  position: relative;
  overflow: hidden;
  grid-column: span 2;
}

.fr-account-card::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(0,212,200,0.15), transparent);
  pointer-events: none;
}

.fr-account-card__label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin-bottom: var(--fr-sp-2);
}

.fr-account-card__balance {
  font-size: 42px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.03em;
  font-family: var(--fr-font-mono);
  line-height: 1;
  margin-bottom: var(--fr-sp-4);
}

.fr-account-card__meta {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-6);
  flex-wrap: wrap;
}

.fr-account-card__meta-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.fr-account-card__meta-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
}

.fr-account-card__meta-value {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

/* Challenge progress card */
.fr-challenge-progress {
  background: var(--fr-dark-2);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-xl);
  padding: var(--fr-sp-6);
}

.fr-challenge-rules {
  display: flex;
  flex-direction: column;
  gap: var(--fr-sp-4);
  margin-top: var(--fr-sp-5);
}

.fr-rule-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fr-sp-4);
}

.fr-rule-row__label {
  font-size: 13px;
  color: var(--fr-text-secondary);
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--fr-sp-2);
}

.fr-rule-row__value {
  font-size: 13px;
  font-weight: 600;
  font-family: var(--fr-font-mono);
  white-space: nowrap;
}

.fr-rule-row__progress { flex: 1; max-width: 120px; }

/* Trade history table wrapper */
.fr-trade-panel {
  background: var(--fr-dark-2);
  border: 1px solid var(--fr-border-subtle);
  border-radius: var(--fr-radius-xl);
  overflow: hidden;
}

.fr-trade-panel__header {
  padding: var(--fr-sp-5) var(--fr-sp-6);
  border-bottom: 1px solid var(--fr-border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

---

### 8.6 Trading Challenge Page

```css
/* ============================================================
   PAGE: TRADING CHALLENGE / PRICING
   ============================================================ */

.fr-challenge-hero {
  text-align: center;
  padding: var(--fr-sp-20) 0 var(--fr-sp-12);
}

/* Challenge size selector */
.fr-size-selector {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-3);
  background: var(--fr-dark-2);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-xl);
  padding: var(--fr-sp-2);
  display: inline-flex;
  margin-bottom: var(--fr-sp-8);
}

.fr-size-btn {
  padding: var(--fr-sp-3) var(--fr-sp-5);
  border-radius: var(--fr-radius-lg);
  font-size: 15px;
  font-weight: 600;
  color: var(--fr-text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--fr-ease-fast);
  white-space: nowrap;
}

.fr-size-btn:hover { color: var(--fr-text-secondary); }

.fr-size-btn--active {
  background: var(--fr-lime);
  color: #000;
}

/* Challenge card */
.fr-challenge-card {
  background: var(--fr-dark-2);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-xl);
  overflow: hidden;
  transition: transform var(--fr-ease-med), border-color var(--fr-ease-fast);
}

.fr-challenge-card:hover {
  transform: translateY(-4px);
  border-color: var(--fr-border-medium);
}

.fr-challenge-card--featured {
  border-color: rgba(204,255,0,0.3);
  box-shadow: 0 0 0 1px rgba(204,255,0,0.15);
}

.fr-challenge-card__header {
  padding: var(--fr-sp-6);
  border-bottom: 1px solid var(--fr-border-subtle);
  background: var(--fr-dark-1);
}

.fr-challenge-card__body {
  padding: var(--fr-sp-6);
}

.fr-challenge-card__price {
  font-size: 36px;
  font-weight: 800;
  color: var(--fr-text-primary);
  letter-spacing: -0.03em;
  margin: var(--fr-sp-4) 0 var(--fr-sp-2);
}

.fr-challenge-card__price sub {
  font-size: 16px;
  font-weight: 500;
  color: var(--fr-text-tertiary);
  vertical-align: baseline;
  letter-spacing: 0;
}

.fr-challenge-rules-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--fr-sp-3);
  margin: var(--fr-sp-5) 0;
}

.fr-challenge-rules-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding: var(--fr-sp-3) 0;
  border-bottom: 1px solid var(--fr-border-subtle);
}

.fr-challenge-rules-list li:last-child { border-bottom: none; }

.fr-challenge-rules-list li span:first-child { color: var(--fr-text-secondary); }
.fr-challenge-rules-list li span:last-child  { color: var(--fr-text-primary); font-weight: 600; font-family: var(--fr-font-mono); }
```

---

### 8.7 Account / Profile Settings

```css
/* ============================================================
   PAGE: SETTINGS / PROFILE
   ============================================================ */

.fr-settings-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--fr-sp-8);
  align-items: start;
}

.fr-settings-nav {
  background: var(--fr-dark-2);
  border: 1px solid var(--fr-border-subtle);
  border-radius: var(--fr-radius-xl);
  padding: var(--fr-sp-3);
  position: sticky;
  top: calc(var(--fr-nav-height) + var(--fr-ticker-height) + var(--fr-sp-6));
}

.fr-settings-nav-item {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-3);
  padding: var(--fr-sp-3) var(--fr-sp-4);
  border-radius: var(--fr-radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--fr-text-tertiary);
  cursor: pointer;
  text-decoration: none;
  transition: all var(--fr-ease-fast);
}

.fr-settings-nav-item:hover { background: rgba(255,255,255,0.04); color: var(--fr-text-secondary); }
.fr-settings-nav-item--active { background: rgba(204,255,0,0.08); color: var(--fr-lime); }

.fr-settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--fr-sp-6);
}

.fr-settings-section {
  background: var(--fr-dark-2);
  border: 1px solid var(--fr-border-subtle);
  border-radius: var(--fr-radius-xl);
  overflow: hidden;
}

.fr-settings-section__header {
  padding: var(--fr-sp-5) var(--fr-sp-6);
  border-bottom: 1px solid var(--fr-border-subtle);
}

.fr-settings-section__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--fr-text-primary);
}

.fr-settings-section__desc {
  font-size: 13px;
  color: var(--fr-text-tertiary);
  margin-top: 4px;
}

.fr-settings-section__body {
  padding: var(--fr-sp-6);
  display: flex;
  flex-direction: column;
  gap: var(--fr-sp-5);
}

/* Avatar upload */
.fr-avatar-upload {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-5);
}

.fr-avatar-upload__zone {
  position: relative;
}

.fr-avatar-upload__btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: var(--fr-lime);
  color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid var(--fr-dark-2);
  transition: transform var(--fr-ease-fast);
}

.fr-avatar-upload__btn:hover { transform: scale(1.1); }

/* Danger zone */
.fr-danger-zone {
  border-color: rgba(248,113,113,0.2);
}

.fr-danger-zone .fr-settings-section__header {
  border-bottom-color: rgba(248,113,113,0.15);
}

.fr-danger-zone .fr-settings-section__title { color: var(--fr-text-danger); }

@media (max-width: 768px) {
  .fr-settings-layout { grid-template-columns: 1fr; }
  .fr-settings-nav    { position: static; }
}
```

---

### 8.8 Leaderboard Page

```css
/* ============================================================
   PAGE: LEADERBOARD
   ============================================================ */

.fr-leaderboard-header {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-4);
  padding: var(--fr-sp-5) var(--fr-sp-6);
  background: var(--fr-dark-2);
  border-bottom: 1px solid var(--fr-border-subtle);
}

/* Top 3 podium cards */
.fr-podium {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--fr-sp-4);
  margin-bottom: var(--fr-sp-8);
  align-items: end;
}

.fr-podium-card {
  background: var(--fr-dark-2);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-xl);
  padding: var(--fr-sp-6);
  text-align: center;
  transition: transform var(--fr-ease-med);
}

.fr-podium-card:hover { transform: translateY(-4px); }

/* 1st place */
.fr-podium-card:nth-child(2) {
  border-color: rgba(204,255,0,0.3);
  box-shadow: var(--fr-glow-lime);
  order: 2;
  padding-top: var(--fr-sp-8);
}

/* 2nd place */
.fr-podium-card:nth-child(1) {
  order: 1;
  border-color: rgba(155,93,229,0.3);
}

/* 3rd place */
.fr-podium-card:nth-child(3) {
  order: 3;
  border-color: rgba(247,37,133,0.3);
}

.fr-podium-rank {
  font-size: 32px;
  font-weight: 900;
  margin-bottom: var(--fr-sp-3);
}

.fr-podium-card:nth-child(2) .fr-podium-rank { color: var(--fr-lime); }
.fr-podium-card:nth-child(1) .fr-podium-rank { color: #9B5DE5; }
.fr-podium-card:nth-child(3) .fr-podium-rank { color: #F72585; }

.fr-podium-profit {
  font-size: 20px;
  font-weight: 800;
  color: var(--fr-text-primary);
  font-family: var(--fr-font-mono);
  margin-top: var(--fr-sp-3);
}

/* Rank badge in table */
.fr-rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--fr-radius-md);
  font-size: 12px;
  font-weight: 700;
  background: var(--fr-dark-4);
  color: var(--fr-text-secondary);
}

.fr-rank-badge--1 { background: rgba(204,255,0,0.15); color: var(--fr-lime); }
.fr-rank-badge--2 { background: rgba(155,93,229,0.15); color: #9B5DE5; }
.fr-rank-badge--3 { background: rgba(247,37,133,0.15); color: #F72585; }
```

---

### 8.9 Payout / Certificate Page

*Uses `fr-neon-card` + `fr-certificate` components from Sections 5.3 and 5.4. Wrap in:*

```css
/* ============================================================
   PAGE: PAYOUTS
   ============================================================ */

.fr-payouts-page .fr-cert-carousel {
  margin: var(--fr-sp-8) 0;
}

/* Payout request form panel */
.fr-payout-form {
  background: var(--fr-dark-2);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-xl);
  padding: var(--fr-sp-8);
  max-width: 560px;
}

.fr-payout-amount-display {
  background: var(--fr-dark-0);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-lg);
  padding: var(--fr-sp-5);
  margin-bottom: var(--fr-sp-6);
  text-align: center;
}

.fr-payout-amount-display__label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fr-text-tertiary);
  margin-bottom: var(--fr-sp-2);
}

.fr-payout-amount-display__value {
  font-size: 44px;
  font-weight: 800;
  color: var(--fr-lime);
  font-family: var(--fr-font-mono);
  letter-spacing: -0.04em;
  line-height: 1;
}

/* Payout history table */
.fr-payout-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--fr-radius-pill);
}

.fr-payout-status--paid    { background: var(--fr-success-bg); color: var(--fr-text-success); }
.fr-payout-status--pending { background: var(--fr-warning-bg); color: var(--fr-text-warning); }
.fr-payout-status--failed  { background: var(--fr-danger-bg);  color: var(--fr-text-danger); }
```

---

### 8.10 Mail / Inbox Page

```css
/* ============================================================
   PAGE: MAIL / INBOX
   ============================================================ */

.fr-mail-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  height: calc(100vh - var(--fr-nav-height) - var(--fr-ticker-height));
  overflow: hidden;
}

/* Left panel: message list */
.fr-mail-list-panel {
  border-right: 1px solid var(--fr-border-subtle);
  background: var(--fr-dark-1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fr-mail-toolbar {
  padding: var(--fr-sp-4);
  border-bottom: 1px solid var(--fr-border-subtle);
  display: flex;
  gap: var(--fr-sp-3);
  align-items: center;
}

.fr-mail-list {
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
}

.fr-mail-item {
  display: flex;
  gap: var(--fr-sp-3);
  padding: var(--fr-sp-4) var(--fr-sp-4);
  border-bottom: 1px solid var(--fr-border-subtle);
  cursor: pointer;
  transition: background var(--fr-ease-fast);
  position: relative;
}

.fr-mail-item:hover { background: rgba(255,255,255,0.03); }

.fr-mail-item--active {
  background: rgba(204,255,0,0.04);
  border-left: 2px solid var(--fr-lime);
}

.fr-mail-item--unread .fr-mail-item__subject {
  color: var(--fr-text-primary);
  font-weight: 600;
}

/* Unread dot */
.fr-mail-item--unread::before {
  content: '';
  position: absolute;
  top: 50%;
  right: var(--fr-sp-4);
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--fr-lime);
}

.fr-mail-item__content { flex: 1; min-width: 0; }
.fr-mail-item__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.fr-mail-item__from   { font-size: 13px; font-weight: 600; color: var(--fr-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
.fr-mail-item__time   { font-size: 11px; color: var(--fr-text-tertiary); flex-shrink: 0; }
.fr-mail-item__subject{ font-size: 13px; color: var(--fr-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
.fr-mail-item__preview{ font-size: 12px; color: var(--fr-text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Right panel: message view */
.fr-mail-view {
  display: flex;
  flex-direction: column;
  background: var(--fr-black);
  overflow: hidden;
}

.fr-mail-view-header {
  padding: var(--fr-sp-5) var(--fr-sp-6);
  border-bottom: 1px solid var(--fr-border-subtle);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--fr-sp-4);
}

.fr-mail-view-title   { font-size: 20px; font-weight: 700; color: var(--fr-text-primary); margin-bottom: var(--fr-sp-3); }
.fr-mail-view-meta    { display: flex; align-items: center; gap: var(--fr-sp-4); flex-wrap: wrap; }
.fr-mail-view-from    { font-size: 14px; color: var(--fr-text-secondary); }

.fr-mail-view-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--fr-sp-6);
  font-size: 15px;
  color: var(--fr-text-secondary);
  line-height: 1.8;
}

/* Reply compose area */
.fr-mail-reply {
  border-top: 1px solid var(--fr-border-subtle);
  padding: var(--fr-sp-4) var(--fr-sp-6);
  background: var(--fr-dark-1);
}

.fr-mail-reply-box {
  background: var(--fr-dark-3);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-lg);
  padding: var(--fr-sp-4);
}

.fr-mail-reply-textarea {
  width: 100%;
  min-height: 80px;
  background: transparent;
  border: none;
  color: var(--fr-text-primary);
  font-size: 14px;
  font-family: var(--fr-font-sans);
  resize: none;
  outline: none;
  line-height: 1.65;
}

.fr-mail-reply-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--fr-sp-3);
}

/* Empty state */
.fr-mail-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--fr-sp-4);
  color: var(--fr-text-tertiary);
}

.fr-mail-empty-icon {
  width: 64px;
  height: 64px;
  background: var(--fr-dark-3);
  border: 1px solid var(--fr-border-subtle);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fr-text-disabled);
}

@media (max-width: 768px) {
  .fr-mail-layout { grid-template-columns: 1fr; }
  .fr-mail-view   { display: none; }
  .fr-mail-view--active { display: flex; }
  .fr-mail-list-panel--hidden { display: none; }
}
```

---

### 8.11 Notifications Page

```css
/* ============================================================
   PAGE: NOTIFICATIONS
   ============================================================ */

.fr-notification-item {
  display: flex;
  gap: var(--fr-sp-4);
  padding: var(--fr-sp-5) var(--fr-sp-6);
  border-bottom: 1px solid var(--fr-border-subtle);
  transition: background var(--fr-ease-fast);
  cursor: pointer;
  position: relative;
}

.fr-notification-item:hover { background: rgba(255,255,255,0.025); }

.fr-notification-item--unread {
  background: rgba(204,255,0,0.02);
  border-left: 2px solid var(--fr-lime);
}

.fr-notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fr-notification-icon--success  { background: var(--fr-success-bg); color: var(--fr-text-success); }
.fr-notification-icon--danger   { background: var(--fr-danger-bg);  color: var(--fr-text-danger);  }
.fr-notification-icon--info     { background: var(--fr-info-bg);    color: var(--fr-text-info);    }
.fr-notification-icon--warning  { background: var(--fr-warning-bg); color: var(--fr-text-warning); }
.fr-notification-icon--lime     { background: rgba(204,255,0,0.12); color: var(--fr-lime); }

.fr-notification-body { flex: 1; min-width: 0; }
.fr-notification-title{ font-size: 14px; font-weight: 600; color: var(--fr-text-primary); margin-bottom: 4px; }
.fr-notification-desc { font-size: 13px; color: var(--fr-text-secondary); line-height: 1.5; }
.fr-notification-time { font-size: 11px; color: var(--fr-text-tertiary); margin-top: 6px; }
```

---

### 8.12 Admin Panel

```css
/* ============================================================
   PAGE: ADMIN PANEL
   ============================================================ */

/* Admin uses full sidebar layout — reuse fr-panel-layout */
/* Additional admin-specific styles: */

/* Admin stat row with color-coded metrics */
.fr-admin-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--fr-sp-4);
  margin-bottom: var(--fr-sp-6);
}

.fr-admin-kpi {
  background: var(--fr-dark-2);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-xl);
  padding: var(--fr-sp-5);
  position: relative;
  overflow: hidden;
}

/* Color accent per metric type */
.fr-admin-kpi--revenue { border-top: 2px solid var(--fr-lime); }
.fr-admin-kpi--users   { border-top: 2px solid var(--fr-neon-teal); }
.fr-admin-kpi--payouts { border-top: 2px solid var(--fr-neon-purple); }
.fr-admin-kpi--active  { border-top: 2px solid var(--fr-neon-green); }

.fr-admin-kpi__icon {
  width: 40px;
  height: 40px;
  border-radius: var(--fr-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--fr-sp-4);
}

.fr-admin-kpi--revenue .fr-admin-kpi__icon { background: rgba(204,255,0,0.10); color: var(--fr-lime); }
.fr-admin-kpi--users   .fr-admin-kpi__icon { background: rgba(0,212,200,0.10);  color: #00D4C8; }
.fr-admin-kpi--payouts .fr-admin-kpi__icon { background: rgba(155,93,229,0.10); color: #9B5DE5; }
.fr-admin-kpi--active  .fr-admin-kpi__icon { background: rgba(74,222,128,0.10); color: #4ADE80; }

.fr-admin-kpi__value {
  font-size: 30px;
  font-weight: 800;
  color: var(--fr-text-primary);
  font-family: var(--fr-font-mono);
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: var(--fr-sp-2);
}

.fr-admin-kpi__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--fr-text-tertiary);
  margin-bottom: var(--fr-sp-2);
}

/* Admin user management — action column */
.fr-admin-actions {
  display: flex;
  align-items: center;
  gap: var(--fr-sp-2);
}

/* Admin: verification badge on user row */
.fr-verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #4ADE80;
}
```

---

### 8.13 Affiliates Page

```css
/* ============================================================
   PAGE: AFFILIATES
   ============================================================ */

.fr-affiliate-hero { text-align: center; padding: var(--fr-sp-20) 0 var(--fr-sp-12); }

.fr-affiliate-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--fr-sp-6);
  margin-bottom: var(--fr-sp-12);
}

.fr-affiliate-stat {
  text-align: center;
  padding: var(--fr-sp-8);
  background: var(--fr-dark-2);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-xl);
}

.fr-affiliate-stat__num {
  font-size: 48px;
  font-weight: 900;
  color: var(--fr-lime);
  font-family: var(--fr-font-mono);
  letter-spacing: -0.04em;
  line-height: 1;
  margin-bottom: var(--fr-sp-3);
}

/* Affiliate link widget */
.fr-referral-widget {
  background: var(--fr-dark-2);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-xl);
  padding: var(--fr-sp-6);
}

.fr-referral-link-row {
  display: flex;
  gap: var(--fr-sp-3);
  align-items: stretch;
}

.fr-referral-link-input {
  flex: 1;
  height: 46px;
  background: var(--fr-dark-0);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-md);
  padding: 0 var(--fr-sp-4);
  font-size: 13px;
  color: var(--fr-lime);
  font-family: var(--fr-font-mono);
  outline: none;
  cursor: text;
  user-select: all;
}
```

---

### 8.14 FAQ Page

```css
/* ============================================================
   PAGE: FAQ
   ============================================================ */

.fr-faq-list {
  display: flex;
  flex-direction: column;
  gap: var(--fr-sp-3);
  max-width: 760px;
  margin: 0 auto;
}

.fr-faq-item {
  background: var(--fr-dark-2);
  border: 1px solid var(--fr-border-default);
  border-radius: var(--fr-radius-lg);
  overflow: hidden;
  transition: border-color var(--fr-ease-fast);
}

.fr-faq-item:hover { border-color: var(--fr-border-medium); }
.fr-faq-item--open { border-color: rgba(204,255,0,0.25); }

.fr-faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--fr-sp-5) var(--fr-sp-6);
  cursor: pointer;
  user-select: none;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  gap: var(--fr-sp-4);
}

.fr-faq-question__text {
  font-size: 15px;
  font-weight: 600;
  color: var(--fr-text-primary);
  flex: 1;
}

.fr-faq-question__icon {
  width: 24px;
  height: 24px;
  background: rgba(255,255,255,0.06);
  border-radius: var(--fr-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fr-text-tertiary);
  flex-shrink: 0;
  transition: all var(--fr-ease-fast);
}

.fr-faq-item--open .fr-faq-question__icon {
  background: rgba(204,255,0,0.10);
  color: var(--fr-lime);
  transform: rotate(45deg);
}

.fr-faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.fr-faq-item--open .fr-faq-answer { max-height: 400px; }

.fr-faq-answer__inner {
  padding: 0 var(--fr-sp-6) var(--fr-sp-5);
  font-size: 14px;
  color: var(--fr-text-secondary);
  line-height: 1.75;
  border-top: 1px solid var(--fr-border-subtle);
  padding-top: var(--fr-sp-4);
}
```

---

### 8.15 Footer

```css
/* ============================================================
   COMPONENT: FOOTER
   ============================================================ */

.fr-footer {
  background: var(--fr-dark-0);
  border-top: 1px solid var(--fr-border-subtle);
  padding: var(--fr-sp-16) 0 var(--fr-sp-8);
}

.fr-footer__grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: var(--fr-sp-10);
  margin-bottom: var(--fr-sp-12);
}

.fr-footer__brand-desc {
  font-size: 14px;
  color: var(--fr-text-tertiary);
  line-height: 1.75;
  margin-top: var(--fr-sp-4);
  max-width: 300px;
}

.fr-footer__col-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--fr-text-secondary);
  margin-bottom: var(--fr-sp-5);
}

.fr-footer__link {
  display: block;
  font-size: 14px;
  color: var(--fr-text-tertiary);
  text-decoration: none;
  margin-bottom: var(--fr-sp-3);
  transition: color var(--fr-ease-fast);
}

.fr-footer__link:hover { color: var(--fr-text-secondary); }

.fr-footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--fr-sp-6);
  border-top: 1px solid var(--fr-border-subtle);
  flex-wrap: wrap;
  gap: var(--fr-sp-4);
}

.fr-footer__copy {
  font-size: 13px;
  color: var(--fr-text-disabled);
}

.fr-footer__social {
  display: flex;
  gap: var(--fr-sp-3);
}

.fr-footer__social-btn {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--fr-border-subtle);
  border-radius: var(--fr-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fr-text-tertiary);
  text-decoration: none;
  transition: all var(--fr-ease-fast);
}

.fr-footer__social-btn:hover {
  background: rgba(255,255,255,0.08);
  color: var(--fr-text-secondary);
  border-color: var(--fr-border-default);
}

/* Disclaimer */
.fr-footer__disclaimer {
  font-size: 11px;
  color: var(--fr-text-disabled);
  line-height: 1.7;
  margin-top: var(--fr-sp-6);
  padding-top: var(--fr-sp-6);
  border-top: 1px solid var(--fr-border-subtle);
}

@media (max-width: 900px) {
  .fr-footer__grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .fr-footer__grid { grid-template-columns: 1fr; }
}
```

---

### 8.16 404 / Error Pages

```css
/* ============================================================
   PAGE: 404 / ERROR
   ============================================================ */

.fr-error-page {
  min-height: 100vh;
  background: var(--fr-black);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--fr-sp-6);
}

.fr-error-code {
  font-size: clamp(80px, 15vw, 160px);
  font-weight: 900;
  letter-spacing: -0.06em;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 2px rgba(204,255,0,0.2);
  background: linear-gradient(135deg, transparent 0%, rgba(204,255,0,0.05) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  margin-bottom: var(--fr-sp-6);
  font-family: var(--fr-font-sans);
}

.fr-error-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--fr-text-primary);
  margin-bottom: var(--fr-sp-4);
}

.fr-error-desc {
  font-size: 16px;
  color: var(--fr-text-secondary);
  max-width: 400px;
  margin: 0 auto var(--fr-sp-8);
  line-height: 1.7;
}
```

---

## 9. Animation & Motion

All animation keyframes used across the site:

```css
/* ============================================================
   ANIMATIONS & KEYFRAMES
   Global: import in main CSS file
   ============================================================ */

/* Base spin */
@keyframes fr-spin { to { transform: rotate(360deg); } }

/* Ticker scroll */
@keyframes fr-ticker-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* Shimmer (skeleton + progress) */
@keyframes fr-shimmer {
  0%   { left: -60px; }
  100% { left: 100%; }
}

/* Skeleton shimmer */
@keyframes fr-skeleton-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

/* Pulse (live indicator) */
@keyframes fr-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
  70%  { box-shadow: 0 0 0 8px rgba(74,222,128,0); }
  100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); }
}

/* Logo pulse (page loader) */
@keyframes fr-pulse-logo {
  0%, 100% { box-shadow: 0 0 0 0 rgba(204,255,0,0.4); }
  50%       { box-shadow: 0 0 0 20px rgba(204,255,0,0); }
}

/* Toast in */
@keyframes fr-toast-in {
  from { transform: translateX(20px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

/* Fade in up — for sections entering viewport */
@keyframes fr-fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Fade in — for modals */
@keyframes fr-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Scale in — for modal panels */
@keyframes fr-scale-in {
  from { opacity: 0; transform: scale(0.94); }
  to   { opacity: 1; transform: scale(1); }
}

/* Neon flicker — for accent elements */
@keyframes fr-flicker {
  0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
    opacity: 1;
  }
  20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
    opacity: 0.6;
  }
}

/* Glowing border pulse */
@keyframes fr-glow-pulse {
  0%, 100% { box-shadow: 0 0 0 1px #00D4C8, 0 0 12px rgba(0,212,200,0.35); }
  50%       { box-shadow: 0 0 0 1px #00D4C8, 0 0 24px rgba(0,212,200,0.55); }
}

/* Scroll reveal utility */
.fr-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fr-reveal--visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children */
.fr-reveal-group > *:nth-child(1) { transition-delay: 0ms; }
.fr-reveal-group > *:nth-child(2) { transition-delay: 80ms; }
.fr-reveal-group > *:nth-child(3) { transition-delay: 160ms; }
.fr-reveal-group > *:nth-child(4) { transition-delay: 240ms; }
.fr-reveal-group > *:nth-child(5) { transition-delay: 320ms; }

/* Minimal motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .fr-ticker-track,
  .fr-feature-strip__track {
    animation: none;
  }
}
```

**Scroll Reveal JavaScript:**

```javascript
// Intersection Observer for scroll-reveal animations
// File: /src/scripts/scroll-reveal.js

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fr-reveal--visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.fr-reveal').forEach((el) => observer.observe(el));
```

---

## 10. Responsive Design Breakpoints

```css
/* ============================================================
   RESPONSIVE BREAKPOINTS
   Usage: Always mobile-first. Add desktop overrides above.
   ============================================================ */

/* Breakpoint tokens */
/* xs:  < 480px   — small phones */
/* sm:  480–767px — large phones */
/* md:  768–1023px — tablets */
/* lg:  1024–1279px — small desktops */
/* xl:  1280–1535px — desktops */
/* 2xl: ≥ 1536px  — large desktops */

/* ── TYPOGRAPHY RESPONSIVE ── */
@media (max-width: 767px) {
  .fr-hero__headline { font-size: 32px; }
  .fr-display-1      { font-size: 32px; }
  .fr-display-2      { font-size: 26px; }
  .fr-heading-1      { font-size: 28px; }
  .fr-heading-2      { font-size: 24px; }
}

/* ── LAYOUT RESPONSIVE ── */
@media (max-width: 1024px) {
  .fr-panel-layout    { grid-template-columns: 1fr; }
  .fr-sidebar         { display: none; }
  .fr-sidebar--mobile-open { display: flex; position: fixed; inset: 0; z-index: var(--fr-z-modal); width: var(--fr-sidebar-width); border-right: 1px solid var(--fr-border-default); }

  .fr-platform-section,
  .fr-academy-section { grid-template-columns: 1fr; gap: var(--fr-sp-8); }

  .fr-academy-img::before { display: none; }
  .fr-platform-mockup     { height: 320px; }

  .fr-settings-layout { grid-template-columns: 1fr; }
  .fr-settings-nav    { position: static; }
}

@media (max-width: 900px) {
  .fr-card-grid       { grid-template-columns: 1fr; }
  .fr-affiliate-stats { grid-template-columns: 1fr; }
  .fr-podium          { grid-template-columns: 1fr; }
  .fr-features-grid   { grid-template-columns: 1fr; }

  .fr-footer__grid    { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 768px) {
  .fr-container    { padding: 0 var(--fr-sp-4); }
  .fr-fr-section   { padding: var(--fr-sp-12) 0; }

  .fr-auth-page    { grid-template-columns: 1fr; }
  .fr-auth-visual  { display: none; }

  .fr-mail-layout  { grid-template-columns: 1fr; }

  .fr-hero__visual { display: none; }
  .fr-hero__content { max-width: 100%; }

  .fr-dashboard-layout { grid-template-columns: 1fr; }

  .fr-logos-row { flex-wrap: wrap; }
  .fr-logo-cell { min-width: 120px; border-right: none; border-bottom: 1px solid var(--fr-border-subtle); }
}

@media (max-width: 480px) {
  .fr-btn--full-mobile { width: 100%; }
  .fr-hero__cta-row    { flex-direction: column; align-items: flex-start; }
  .fr-register-row     { grid-template-columns: 1fr; }
  .fr-grid-2           { grid-template-columns: 1fr; }
  .fr-footer__grid     { grid-template-columns: 1fr; }
  .fr-mail-reply-footer{ flex-direction: column; gap: var(--fr-sp-3); }
}
```

---

## 11. Implementation Checklist

### Phase 1 — Foundation

- [ ] Install design tokens (`tokens.css`) in the global stylesheet
- [ ] Import Inter font from Google Fonts
- [ ] Apply global base & reset styles
- [ ] Set `body` background to `var(--fr-black)` and default `color` to `var(--fr-text-primary)`
- [ ] Add custom scrollbar styles
- [ ] Add `::selection` style
- [ ] Copy all `@keyframes` into global CSS
- [ ] Set `scroll-behavior: smooth` on `html`

### Phase 2 — Navigation & Layout

- [ ] Apply `.fr-ticker-strip` + `.fr-ticker-track` to top announcement bar
- [ ] Apply `.fr-nav` + all child classes to site header
- [ ] Implement mobile hamburger drawer with `.fr-nav__mobile-drawer`
- [ ] Test nav sticky behavior and backdrop blur
- [ ] Apply `.fr-sidebar` to all dashboard-type pages

### Phase 3 — Component Library

- [ ] Audit all `<button>` elements — apply `.fr-btn` + variant classes
- [ ] Audit all form fields — apply `.fr-input`, `.fr-select`, `.fr-textarea`
- [ ] Audit all checkboxes, radios, toggles
- [ ] Audit all `<table>` elements — apply `.fr-table` + `.fr-table-wrapper`
- [ ] Replace all modals with `.fr-modal-overlay` + `.fr-modal` structure
- [ ] Update all badge/tag elements to `.fr-badge` + variant classes
- [ ] Update all inline alerts to `.fr-alert` + semantic variants
- [ ] Implement `.fr-toast-container` for notifications
- [ ] Update progress bars to `.fr-progress` + `.fr-progress__fill`
- [ ] Update step indicators to `.fr-steps` + `.fr-step` structure
- [ ] Apply `.fr-avatar` to all user avatar images
- [ ] Apply `.fr-skeleton` to all loading states
- [ ] Replace existing spinners with `.fr-spinner`

### Phase 4 — Home Page Sections

- [ ] Hero section — apply layout, headline, CTA, visual, dot pattern
- [ ] Media logos strip — apply `.fr-logos-strip` + opacity filter
- [ ] "How to Get Started" — apply `.fr-aurora-card` × 3 with correct variants
- [ ] "Why Traders Choose" — apply `.fr-feature-item` + `.fr-feature-icon`
- [ ] Feature marquee strip — apply `.fr-feature-strip` with blur edges
- [ ] Testimonial carousel — apply `.fr-video-card` + scrollable row
- [ ] Payout certificates — apply `.fr-neon-card` + `.fr-certificate` + `.fr-cert-carousel`
- [ ] Trading platform section — apply `.fr-platform-section` + layered panels
- [ ] FR Academy section — apply `.fr-academy-section` + geometric shape
- [ ] Add `.fr-halftone--hero-right` dot pattern to hero background
- [ ] Footer — apply `.fr-footer` full structure

### Phase 5 — Auth Pages

- [ ] Login — apply `.fr-auth-page` two-column grid
- [ ] Login — apply left visual panel + right form panel
- [ ] Register — add `.fr-register-row`, password strength meter, terms
- [ ] Password Reset — apply `.fr-reset-page` + `.fr-reset-card`

### Phase 6 — Dashboard / Panel Pages

- [ ] Apply `.fr-panel-layout` to all panel pages
- [ ] `.fr-account-summary` + `.fr-account-card` for balance display
- [ ] `.fr-challenge-progress` + rule rows + progress bars
- [ ] `.fr-trade-panel` + `fr-table` for trade history
- [ ] Sidebar items use `.fr-sidebar__item` + `--active` class
- [ ] `.fr-stats-grid` + `.fr-stat-widget` for quick stats

### Phase 7 — Feature Pages

- [ ] Challenge/Pricing page — `.fr-size-selector` + `.fr-challenge-card` grid
- [ ] Settings page — `.fr-settings-layout` + section cards
- [ ] Leaderboard — podium cards + ranked table
- [ ] Payouts page — cert carousel + payout form + status badges
- [ ] Mail page — split layout + message list + compose
- [ ] Notifications page — notification item list
- [ ] Admin panel — KPI cards + admin table
- [ ] Affiliates page — stat numbers + referral link widget
- [ ] FAQ page — accordion items
- [ ] 404 page — giant error code + back CTA

### Phase 8 — Polish & Performance

- [ ] Add `.fr-reveal` + Intersection Observer to all major sections
- [ ] Add `transition-delay` stagger to card grids
- [ ] Add `@media (prefers-reduced-motion: reduce)` block
- [ ] Test all hover states across components
- [ ] Test all focus-visible states for keyboard accessibility
- [ ] Verify dark scrollbar on all scrollable containers
- [ ] Verify `::selection` lime highlight
- [ ] Test all neon glow effects on multiple screens
- [ ] Verify aurora cards render correctly at all breakpoints
- [ ] Verify ticker loop is seamless (content duplicated)
- [ ] Test modal backdrop blur on Safari

---

*End of FundingRock UI Design System — v1.0*
*This document covers 100% of the visual implementation surface. No page, component, or state has been left undocumented.*
