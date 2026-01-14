# Orisios - Logo and Brand Identity

> **Brand:** Orisios
> **Etymology:** From Latin "os, oris" (mouth) - the gateway to oral health
> **Values:** Modern, Technological, Personalized, Trustworthy, Professional
>
> **Updated:** January 2026 - Complete rebrand from Dentify to Orisios

---

## CURRENT STATUS: New Logo Required

The previous Dentify logo (D + Fingerprint + Tooth) was excellent but is fundamentally tied to the old brand name. For Orisios, we need a fresh concept that:

1. References "os/oris" (mouth) etymology
2. Works as full logo and app icon
3. Maintains Teal + Coral color heritage
4. Feels modern, tech-forward, trustworthy

**See full brand identity documentation:** `design/brand/ORISIOS_BRAND_IDENTITY.md`

---

## RECOMMENDED LOGO CONCEPT: "The Smile Arc"

### Concept Overview

The letter "O" from Orisios transforms into a stylized smile arc - the universal symbol of oral health outcome. Not a tooth (clinical), but the result of good dental care (emotional).

```
Visual Description:

       ╭──────────╮
      ╱            ╲
     │   ╭──────╮   │     Outer O: Brand letter
     │   ╰──────╯   │     Inner arc: The smile
      ╲            ╱
       ╰──────────╯

Full wordmark: [O-smile] risios
App icon: Just the O with inner arc
```

### Why This Works

| Criterion | Score | Comment |
|-----------|-------|---------|
| Semantic Depth | 5/5 | O = Orisios + Smile = Dental outcome |
| Uniqueness | 5/5 | No competitors have this concept |
| Memorability | 5/5 | "An O with a smile inside" |
| Scalability | 5/5 | Works from 16px to billboard |
| Color Palette | 5/5 | Teal + Coral perfectly integrated |
| Typography | 5/5 | Natural wordmark completion |

### Symbolism

1. **Letter O** - First letter of Orisios, instant brand recognition

2. **Smile Arc** - The goal of all dental work:
   - Universal positive symbol
   - Human, emotional connection
   - Not a tooth (avoiding clinical cliche)
   - The outcome patients seek

3. **Circle** - Completeness:
   - Complete practice management
   - Continuous care cycle
   - Wholeness, trust

---

## Alternative Concepts

### Concept 2: "The Oral Gateway"

Two elegant curved lines suggesting an opening mouth/gateway - abstract representation of "oris" (mouth) without being literal.

```
        ╭─────╮
       ╱       ╲          Upper curve
      ╱         ╲
       ╲       ╱          Lower curve
        ╰─────╯
```

**Pros:** Elegant, architectural, premium
**Cons:** Less immediately recognizable, more abstract

### Concept 3: "The Orbis"

Concentric circles representing the cycle of care - prevention, treatment, maintenance, health.

```
      ╭──────────────╮
     ╱    ╭──────╮    ╲
    │    │    ●   │    │
     ╲    ╰──────╯    ╱
      ╰──────────────╯
```

**Pros:** Geometric, tech-forward, philosophical
**Cons:** Weaker dental connection, more generic

---

## Color Palette (Evolution)

We keep the proven Deep Teal + Coral foundation with refined naming.

### Primary Colors

| Color | HEX | RGB | Role |
|-------|-----|-----|------|
| **Oris Teal** | `#0D7377` | 13, 115, 119 | Primary brand color |
| **Oris Coral** | `#FF6B6B` | 255, 107, 107 | Accent, warmth, CTAs |

### Secondary Colors

| Color | HEX | Role |
|-------|-----|------|
| **Ocean Teal** | `#14919B` | Gradients, hover |
| **Seafoam** | `#45B7A0` | Success states |
| **Soft Teal** | `#E8F6F6` | Light backgrounds |
| **Night** | `#1A1A2E` | Primary text |
| **Pearl** | `#F8F9FC` | Page backgrounds |

### Gradient

```css
--gradient-oris: linear-gradient(135deg, #0D7377 0%, #14919B 100%);
--gradient-coral: linear-gradient(135deg, #FF6B6B 0%, #FF8585 100%);
```

---

## Typography

### Primary: Inter
- Designed for screens
- Excellent readability
- Modern, professional
- Free (Google Fonts)

### Display: Satoshi
- Geometric warmth
- Premium headings
- Free (Fontshare)

### Wordmark Style

```
[O-symbol] risios

Symbol: Oris Teal gradient
Text: Inter or Satoshi, Semibold
Color: Night (#1A1A2E) or White (on dark)
```

---

## Logo Versions Required

| Version | Use Case | Notes |
|---------|----------|-------|
| **Full Horizontal** | Headers, marketing | Symbol + wordmark |
| **Full Stacked** | Square formats | Symbol above wordmark |
| **Symbol Only** | App icons, favicons | Just the O-smile |
| **Wordmark Only** | When symbol nearby | Just "Orisios" text |
| **Inverted** | Dark backgrounds | White on Teal |
| **Monochrome** | Print, watermarks | Single color |

---

## Logo Files to Create

| Asset | Format | Sizes |
|-------|--------|-------|
| Logo Full (H) | SVG, PNG | Original, @2x |
| Logo Stacked | SVG, PNG | Original, @2x |
| Symbol | SVG, PNG | 24, 48, 96, 192, 512 |
| Favicon | ICO, PNG | 16, 32, 48 |
| Apple Touch | PNG | 180 |
| Android | PNG | 48, 72, 96, 144, 192, 512 |
| iOS App Store | PNG | 1024 |
| Open Graph | PNG | 1200x630 |

---

## AI Generation Prompts

**See full prompt library:** `design/brand/ORISIOS_LOGO_PROMPTS.md`

### Quick Start Prompt (Smile Arc)

```
Minimalist logo design for dental technology company "Orisios".

Concept: The letter "O" contains a stylized smile arc inside it.
- Clean circular outer shape (the letter O)
- Inside: a curved arc representing a smile, positioned in the lower half
- Negative space between outer circle and inner arc

Color: Deep teal gradient from #0D7377 to #14919B
Style: Vector logo, flat design, minimal, tech startup aesthetic
Background: Pure white
No text, just the symbol

--ar 1:1 --v 6.1 --style raw
```

### App Icon Prompt

```
App icon, O with smile symbol, white on deep teal gradient #0D7377 to #14919B, dental tech brand Orisios, iOS style rounded square, minimal clean --ar 1:1 --v 6.1 --style raw
```

---

## Implementation Checklist

### Phase 1: Design (Current)
- [x] Brand philosophy defined
- [x] Logo concepts developed
- [x] Color palette confirmed
- [x] Typography selected
- [x] AI prompts created
- [ ] Generate logo variations
- [ ] Select final direction
- [ ] Vector artwork in Figma

### Phase 2: Production
- [ ] Export all logo versions
- [ ] Create favicon set
- [ ] Create app icons (iOS, Android)
- [ ] Brand guidelines PDF

### Phase 3: Implementation
- [ ] Update all documentation
- [ ] Configure design tokens in code
- [ ] Replace Dentify references
- [ ] Update marketing materials

---

## Archive: Dentify Logo (Previous Brand)

> **Note:** The content below documents the previous Dentify logo.
> This is archived for reference only. The new Orisios brand
> requires a fresh logo concept as outlined above.

### D + Fingerprint + Tooth (Archived)

**Files:** `design/logo/dentify_logo_variant_*.jpg`

The Dentify logo was a clever combination of:
1. Letter D - Brand initial
2. Fingerprint pattern - "Identify" in the name
3. Hidden tooth silhouette - Dental industry

**Why we're moving on:**
- "D" no longer represents the brand (Orisios starts with O)
- "Fingerprint" referenced "identify" which is no longer in the name
- The triple-meaning concept doesn't translate to Orisios

**What we keep:**
- Deep Teal + Coral color palette (proven, distinctive)
- Modern, tech-forward aesthetic
- Hidden meaning philosophy (smile in the O)
- Quality and attention to detail

---

## Related Documents

- `design/brand/ORISIOS_BRAND_IDENTITY.md` - Complete brand identity guide
- `design/brand/ORISIOS_LOGO_PROMPTS.md` - AI generation prompts
- `design/colors/palette.md` - Full color system
- `design/ideas/ux-sparkle-ideas.md` - UI micro-interactions

---

> "The best logos are the ones you can describe in a sentence.
> Orisios: an O with a smile inside."
>
> -- Leo, Design Director

---

*Document: BrandLogo.md*
*Status: Ready for logo generation*
*Last updated: January 2026*
