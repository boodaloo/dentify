# Orisios Color Palette

> Official color system for Orisios brand
> Last updated: January 2026

---

## Brand Colors (Primary)

| Name | HEX | RGB | Usage |
|------|-----|-----|-------|
| **Deep Teal** | `#0D7377` | 13, 115, 119 | Main brand color, navigation, primary buttons, headers |
| **Coral** | `#FF6B6B` | 255, 107, 107 | Accent, CTAs, important notifications, "ify" in logo |
| **Light Teal** | `#14919B` | 20, 145, 155 | Hover states, gradients, secondary buttons |
| **Soft Teal** | `#E8F6F6` | 232, 246, 246 | Card backgrounds, subtle fills, alternating rows |
| **Mint** | `#45B7A0` | 69, 183, 160 | Success states, positive metrics, confirmations |

---

## Neutrals

| Name | HEX | RGB | Usage |
|------|-----|-----|-------|
| **Near Black** | `#1A1A2E` | 26, 26, 46 | Primary text, headings (has slight blue undertone) |
| **Dark Gray** | `#4A4A68` | 74, 74, 104 | Secondary text, labels, placeholders |
| **Medium Gray** | `#9393A8` | 147, 147, 168 | Borders, dividers, inactive icons |
| **Light Gray** | `#E8E8ED` | 232, 232, 237 | Backgrounds, disabled states |
| **Off-White** | `#F8F9FC` | 248, 249, 252 | Page background |
| **White** | `#FFFFFF` | 255, 255, 255 | Cards, inputs, content areas |

---

## Semantic Colors

| Purpose | Primary | Light (Background) |
|---------|---------|-------------------|
| **Success** | `#22C55E` | `#DCFCE7` |
| **Warning** | `#F59E0B` | `#FEF3C7` |
| **Error** | `#EF4444` | `#FEE2E2` |
| **Info** | `#3B82F6` | `#DBEAFE` |

---

## Schedule / Appointment Colors

| Appointment Type | HEX | Example |
|------------------|-----|---------|
| Checkup | `#0D7377` (Teal) | Regular visits |
| Treatment | `#FF6B6B` (Coral) | Active treatment |
| Surgery | `#8B5CF6` (Purple) | Extractions, implants |
| Hygiene | `#45B7A0` (Mint) | Cleaning, prevention |
| Orthodontics | `#3B82F6` (Blue) | Braces, aligners |
| Pediatric | `#F97316` (Orange) | Children's appointments |
| Emergency | `#EF4444` (Red) | Acute pain |

---

## Dark Mode

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page background | `#F8F9FC` | `#0F0F1A` |
| Card background | `#FFFFFF` | `#1A1A2E` |
| Primary text | `#1A1A2E` | `#E8E8ED` |
| Secondary text | `#4A4A68` | `#9393A8` |
| Deep Teal | `#0D7377` | `#14919B` (lighter) |
| Coral | `#FF6B6B` | `#FF8585` (lighter) |
| Borders | `#E8E8ED` | `#2D2D44` |

---

## Accessibility Notes

All color combinations meet WCAG 2.1 AA standards:

| Combination | Contrast Ratio | Level |
|-------------|----------------|-------|
| Deep Teal on White | 4.8:1 | AA (large text) |
| Near Black on White | 16.2:1 | AAA |
| Coral on Near Black | 5.1:1 | AA |
| White on Deep Teal | 4.8:1 | AA (large text) |

**Rules:**
- For small text on teal background → use White
- For buttons with coral background → use White text
- Never use color alone to convey information (add icons/text)

---

## CSS Variables

```css
:root {
  /* Brand */
  --color-deep-teal: #0D7377;
  --color-coral: #FF6B6B;
  --color-light-teal: #14919B;
  --color-soft-teal: #E8F6F6;
  --color-mint: #45B7A0;

  /* Neutrals */
  --color-near-black: #1A1A2E;
  --color-dark-gray: #4A4A68;
  --color-medium-gray: #9393A8;
  --color-light-gray: #E8E8ED;
  --color-off-white: #F8F9FC;
  --color-white: #FFFFFF;

  /* Semantic */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
}
```

---

## Tailwind Config

```javascript
colors: {
  teal: {
    DEFAULT: '#0D7377',
    light: '#14919B',
    soft: '#E8F6F6',
  },
  coral: {
    DEFAULT: '#FF6B6B',
    light: '#FF8585',
  },
  mint: '#45B7A0',
  // ... neutrals and semantic
}
```
