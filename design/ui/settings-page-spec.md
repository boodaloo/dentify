# Settings Page - Figma Design Specification

> Detailed specifications for designing the Settings page in Figma

---

## Overview

**Page:** `/settings`
**Layout:** Vertical tabs (sidebar) + content area
**Recommended Figma Frame Size:** 1440 × 1024 (Desktop)

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Header (64px height)                                            │
│  🦷 Orisios    [■ ЛЕН Филиал Ленина ▼]    🔔  👤 Иванов         │
├────────────┬────────────────────────────────────────────────────┤
│            │                                                     │
│  Sidebar   │  Settings Content Area                             │
│  (240px)   │  (Rest of width)                                   │
│            │                                                     │
│  Main      │                                                     │
│  Menu      │                                                     │
│  Items     │                                                     │
│            │                                                     │
└────────────┴────────────────────────────────────────────────────┘
```

**Grid:**
- Left sidebar: Fixed 240px
- Settings tabs sidebar: Fixed 240px
- Content area: Fluid (remaining width)
- Total with main sidebar: 240px + 240px + content

---

## Color Palette (Design System)

### Primary Colors
```
Primary Blue:     #2563EB  (buttons, links, active states)
Primary Dark:     #1E40AF  (hover states)
Primary Light:    #DBEAFE  (backgrounds, highlights)
```

### Neutral Colors
```
Gray 50:          #F9FAFB  (page background)
Gray 100:         #F3F4F6  (card backgrounds)
Gray 200:         #E5E7EB  (borders, dividers)
Gray 300:         #D1D5DB  (disabled states)
Gray 400:         #9CA3AF  (placeholder text)
Gray 500:         #6B7280  (secondary text)
Gray 600:         #4B5563  (body text)
Gray 700:         #374151  (headings)
Gray 800:         #1F2937  (dark headings)
Gray 900:         #111827  (black text)
```

### Semantic Colors
```
Success Green:    #10B981  (success messages)
Success Light:    #D1FAE5  (success backgrounds)
Warning Orange:   #F59E0B  (warnings)
Warning Light:    #FEF3C7  (warning backgrounds)
Error Red:        #EF4444  (errors, destructive actions)
Error Light:      #FEE2E2  (error backgrounds)
Info Blue:        #3B82F6  (info messages)
Info Light:       #DBEAFE  (info backgrounds)
```

### Brand Colors
```
Dental Blue:      #0EA5E9  (dental theme accent)
Dental Teal:      #14B8A6  (secondary accent)
```

---

## Typography

### Font Family
**Primary:** Inter (Google Fonts)
**Fallback:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

### Text Styles

| Style | Size | Weight | Line Height | Use Case |
|-------|------|--------|-------------|----------|
| H1 | 32px | 700 (Bold) | 40px | Page titles |
| H2 | 24px | 600 (Semibold) | 32px | Section headers |
| H3 | 20px | 600 (Semibold) | 28px | Subsection headers |
| H4 | 18px | 600 (Semibold) | 24px | Card headers |
| Body Large | 16px | 400 (Regular) | 24px | Main content |
| Body | 14px | 400 (Regular) | 20px | Standard text |
| Body Small | 13px | 400 (Regular) | 18px | Helper text |
| Caption | 12px | 400 (Regular) | 16px | Captions, labels |
| Label | 14px | 500 (Medium) | 20px | Form labels |
| Button | 14px | 500 (Medium) | 20px | Button text |

**Colors:**
- Primary text: Gray 900 (#111827)
- Secondary text: Gray 600 (#4B5563)
- Disabled text: Gray 400 (#9CA3AF)
- Link text: Primary Blue (#2563EB)

---

## Component Specifications

### 1. Page Container

```
Background: Gray 50 (#F9FAFB)
Padding: 32px
Max-width: 1440px
```

### 2. Page Header

```
┌─────────────────────────────────────────────────┐
│  Настройки                                       │
│  Управление клиникой, сотрудниками и интеграциями│
└─────────────────────────────────────────────────┘

Height: 80px
Padding: 0 32px
Background: White
Border-bottom: 1px solid Gray 200

Title:
  Text: "Настройки"
  Style: H1 (32px, Bold, Gray 900)
  Margin-bottom: 4px

Subtitle:
  Text: "Управление клиникой, сотрудниками и интеграциями"
  Style: Body (14px, Regular, Gray 600)
```

### 3. Settings Tabs Sidebar (Vertical)

```
┌──────────────────┐
│ 📋 Клиника       │ ← active
│ 🏢 Филиалы       │
│ 👥 Сотрудники    │
│ 💊 Услуги        │
│ 🔔 Уведомления   │
│ 🌐 Виджет записи │
│ 📄 Документы     │
│ 🔗 Интеграции    │
│                  │
│ ──────────────── │
│ 💳 Подписка *    │
│ 🔌 Доп. фичи *   │
└──────────────────┘

Width: 240px
Background: White
Border-right: 1px solid Gray 200
Padding: 16px 0

Tab Item (Default):
  Height: 40px
  Padding: 8px 16px
  Background: Transparent
  Border-left: 3px solid Transparent

  Icon: 20px, Gray 500
  Text: Body (14px, Medium, Gray 700)

  Spacing: 12px between icon and text

Tab Item (Hover):
  Background: Gray 50
  Icon: Gray 700
  Text: Gray 900

Tab Item (Active):
  Background: Primary Light (#DBEAFE)
  Border-left: 3px solid Primary Blue (#2563EB)
  Icon: Primary Blue (#2563EB)
  Text: Primary Blue (#2563EB, Medium)

Divider:
  Height: 1px
  Background: Gray 200
  Margin: 12px 16px

Owner-only Tabs:
  Caption below divider: "* только Owner"
  Style: Caption (12px, Regular, Gray 500)
  Padding: 8px 16px
```

### 4. Content Area

```
Padding: 32px
Background: Transparent (shows Gray 50 page background)
```

### 5. Content Card

```
┌────────────────────────────────────────────┐
│  📋 Основные данные клиники                 │
│  ─────────────────────────────────────────  │
│                                             │
│  [Form fields here]                         │
│                                             │
└────────────────────────────────────────────┘

Background: White
Border: 1px solid Gray 200
Border-radius: 8px
Padding: 24px
Margin-bottom: 24px
Box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)

Card Title:
  Style: H3 (20px, Semibold, Gray 900)
  Icon: 24px (if present)
  Spacing: 12px between icon and text
  Margin-bottom: 16px

Card Divider:
  Height: 1px
  Background: Gray 200
  Margin: 16px 0
```

### 6. Form Elements

#### Text Input
```
Height: 40px
Padding: 10px 12px
Border: 1px solid Gray 300
Border-radius: 6px
Font: Body (14px, Regular, Gray 900)

States:
  Default: Border Gray 300
  Hover: Border Gray 400
  Focus: Border Primary Blue, Ring 3px Primary Light
  Error: Border Error Red, Ring 3px Error Light
  Disabled: Background Gray 100, Text Gray 400

Label (above input):
  Style: Label (14px, Medium, Gray 700)
  Margin-bottom: 6px

Helper Text (below input):
  Style: Caption (12px, Regular, Gray 500)
  Margin-top: 4px

Error Text:
  Style: Caption (12px, Regular, Error Red)
  Icon: ! (circle) 14px
  Margin-top: 4px
```

#### Select Dropdown
```
Same as Text Input, but with:
  Icon: Chevron Down (16px, Gray 500) on right
  Padding-right: 36px
```

#### Button - Primary
```
Height: 40px
Padding: 10px 16px
Background: Primary Blue (#2563EB)
Border-radius: 6px
Font: Button (14px, Medium, White)
Box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05)

States:
  Hover: Background Primary Dark (#1E40AF)
  Active: Background #1E3A8A (pressed)
  Disabled: Background Gray 300, Text Gray 500
  Loading: Show spinner (16px) + "Сохранение..."
```

#### Button - Secondary
```
Same as Primary, but:
  Background: White
  Border: 1px solid Gray 300
  Text: Gray 700

States:
  Hover: Background Gray 50, Border Gray 400
  Active: Background Gray 100
```

#### Button - Danger
```
Same as Primary, but:
  Background: Error Red (#EF4444)

States:
  Hover: Background #DC2626
```

#### File Upload
```
┌─────────────────────────────────────────┐
│  ┌──────────┐                            │
│  │          │  [Загрузить логотип]       │
│  │   LOGO   │                            │
│  │          │  PNG, JPG, SVG до 2 МБ    │
│  └──────────┘                            │
└─────────────────────────────────────────┘

Preview Box:
  Width/Height: 120px
  Border: 2px dashed Gray 300
  Border-radius: 8px
  Background: Gray 50

Upload Button:
  Height: 36px
  Style: Secondary Button

Helper Text:
  Style: Caption (12px, Regular, Gray 500)
  Margin-top: 4px
```

#### Toggle Switch
```
Width: 44px
Height: 24px
Border-radius: 12px

Off State:
  Background: Gray 300
  Circle: 20px diameter, White, left position

On State:
  Background: Primary Blue (#2563EB)
  Circle: 20px diameter, White, right position

Transition: 200ms ease
```

### 7. Action Bar (Bottom of content)

```
┌────────────────────────────────────────────┐
│              [Отмена]  [Сохранить]         │
└────────────────────────────────────────────┘

Position: Sticky bottom OR fixed at bottom of card
Padding: 16px 24px
Background: White
Border-top: 1px solid Gray 200
Justify: Right

Button spacing: 12px
```

---

## Tab Content Examples

### Tab 1: Клиника (General Settings)

```
┌────────────────────────────────────────────────────┐
│  📋 Основные данные клиники                         │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Название клиники                                   │
│  [Стоматология "Белая улыбка"                  ]    │
│                                                     │
│  Юридическое название                               │
│  [ООО "Дентал-Сервис"                          ]    │
│                                                     │
│  ИНН                                                │
│  [7701234567            ]                           │
│                                                     │
│  Контактный email                                   │
│  [info@smile-dental.ru                         ]    │
│                                                     │
│  Телефон                                            │
│  [+7 (495) 123-45-67                           ]    │
│                                                     │
│  Адрес                                              │
│  [г. Москва, ул. Ленина, д. 10                 ]    │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  🎨 Логотип клиники                                 │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  ┌──────────┐                                       │
│  │          │  [Загрузить новый логотип]            │
│  │   LOGO   │                                       │
│  │          │  Формат: PNG, JPG, SVG. Макс. 2 МБ   │
│  └──────────┘  Рекомендуемый размер: 400×400 px    │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  🌍 Региональные настройки                          │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Часовой пояс                                       │
│  [Europe/Moscow                               ▼]    │
│                                                     │
│  Валюта                                             │
│  [RUB - Российский рубль                      ▼]    │
│                                                     │
│  Формат даты                                        │
│  [DD.MM.YYYY                                  ▼]    │
│                                                     │
│  Формат времени                                     │
│  [24 часа                                     ▼]    │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  ⏰ Рабочие часы по умолчанию                       │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Начало рабочего дня                                │
│  [09:00                                       ▼]    │
│                                                     │
│  Конец рабочего дня                                 │
│  [21:00                                       ▼]    │
│                                                     │
│  Длительность приёма                                │
│  [30 минут                                    ▼]    │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  📁 Локальное хранение документов                   │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  ⚠️ Папки на вашем компьютере для сохранения       │
│     документов (счета, медкарты, снимки)           │
│                                                     │
│  Папка для счетов и договоров                       │
│  [C:\Documents\Clinic\Invoices          ] [...]    │
│                                                     │
│  Папка для медицинских карт                         │
│  [C:\Documents\Clinic\Records           ] [...]    │
│                                                     │
│  Папка для снимков и фотографий                     │
│  [C:\Documents\Clinic\Images            ] [...]    │
│                                                     │
│  Папка для резервных копий                          │
│  [C:\Documents\Clinic\Backups           ] [...]    │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│                     [Отмена]  [Сохранить изменения]│
└────────────────────────────────────────────────────┘
```

**Spacing:**
- Between cards: 24px
- Card padding: 24px
- Between form fields: 20px
- Label to input: 6px
- Input to helper text: 4px

---

## Responsive Breakpoints

### Desktop (1440px+)
- Full layout as described
- Sidebar: 240px
- Settings tabs: 240px
- Content: Remaining width

### Tablet (768px - 1439px)
- Main sidebar: Collapsed to 72px (icons only)
- Settings tabs: 200px
- Content: Remaining width

### Mobile (< 768px)
- Main sidebar: Drawer (hidden by default)
- Settings tabs: Horizontal scrollable tabs at top
- Content: Full width
- Stack form fields vertically

---

## Interactive States

### Hover Effects
```
Duration: 150ms
Timing: ease-in-out

Tab hover: Background fade
Button hover: Background color change
Input hover: Border color change
```

### Focus States
```
Focus ring: 3px
Ring color: Primary Light (#DBEAFE)
Ring offset: 2px
Outline: 2px solid Primary Blue
```

### Loading States
```
Spinner: 16px, Primary Blue
Opacity: 0.6 on disabled elements
Cursor: not-allowed on disabled
```

---

## Icons

**Icon Set:** Lucide Icons (https://lucide.dev)
**Size:** 20px for tabs, 24px for section headers, 16px for inputs

**Tab Icons:**
- 📋 Клиника: `Settings` icon
- 🏢 Филиалы: `Building2` icon
- 👥 Сотрудники: `Users` icon
- 💊 Услуги: `Package` icon
- 🔔 Уведомления: `Bell` icon
- 🌐 Виджет: `Globe` icon
- 📄 Документы: `FileText` icon
- 🔗 Интеграции: `Link` icon
- 💳 Подписка: `CreditCard` icon
- 🔌 Доп. фичи: `Puzzle` icon

---

## Figma Setup Instructions

### 1. Create New File
```
File → New Design File
Name: "Orisios - Settings Page"
```

### 2. Setup Design System

**Colors:**
1. Create color styles for all colors listed above
2. Name convention: `Color/Primary/Blue`, `Color/Gray/500`

**Text Styles:**
1. Create text styles for all typography listed
2. Name convention: `Text/Heading/H1`, `Text/Body/Regular`

**Components:**
1. Create components for:
   - Input field (with variants: default, hover, focus, error)
   - Button (variants: primary, secondary, danger, sizes)
   - Tab item (variants: default, hover, active)
   - Card container
   - Toggle switch

### 3. Create Main Frame
```
Frame size: 1440 × 1024
Background: Gray 50 (#F9FAFB)
```

### 4. Build Layout
1. Add main sidebar (240px) - use existing component if available
2. Add settings tabs sidebar (240px) with all tabs
3. Add content area with cards
4. Use Auto Layout for responsive behavior

### 5. Add Content
1. Start with "Клиника" tab content
2. Add all form fields with proper spacing
3. Add action buttons at bottom

### 6. Create Variants
1. Create separate pages/frames for each tab
2. Show active state for current tab
3. Add filled form examples

---

## Accessibility

### Keyboard Navigation
- Tab order: Top to bottom, left to right
- Focus indicators: Visible 3px ring
- Escape key: Close modals/dialogs
- Enter key: Submit forms

### Color Contrast
- Minimum contrast ratio: 4.5:1 for text
- Minimum contrast ratio: 3:1 for UI elements
- Test with tools like Stark plugin

### Screen Reader Labels
- All inputs have labels
- Icons have aria-labels
- Buttons have descriptive text

---

## Next Steps

1. Create base components first (inputs, buttons, cards)
2. Setup design tokens (colors, typography)
3. Build one tab completely (Клиника)
4. Duplicate and modify for other tabs
5. Add interactive prototyping
6. Share for review

---

*Created: 15 January 2026*
*For: Orisios Dental Management System*
