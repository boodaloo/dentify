# Orisios: Спецификации UI для Figma Make

> Детальные описания интерфейса для генерации дизайна в Figma Make
>
> **Проект:** Orisios — система управления стоматологическими клиниками
> **Создано:** 16 января 2026
> **Версия:** 1.0

---

## 🎨 Дизайн-система

### Цветовая палитра

| Название | HEX | RGB | Использование |
|----------|-----|-----|---------------|
| **Deep Teal** | `#0D7377` | 13, 115, 119 | Primary: sidebar, заголовки, основные элементы |
| **Light Teal** | `#14919B` | 20, 145, 155 | Secondary: градиенты, hover states |
| **Seafoam** | `#45B7A0` | 69, 183, 160 | Success: подтверждения, успешные статусы |
| **Coral** | `#FF6B6B` | 255, 107, 107 | Accent: CTA кнопки, активные элементы, алерты |
| **Coral Light** | `#FF8585` | 255, 133, 133 | Accent Light: hover для coral, dark mode |
| **Near Black** | `#1A1A2E` | 26, 26, 46 | Text Primary: основной текст |
| **Dark Gray** | `#5A5A72` | 90, 90, 114 | Text Secondary: вторичный текст |
| **Light Gray** | `#E8E8ED` | 232, 232, 237 | Borders: разделители, границы |
| **Off White** | `#F8F9FC` | 248, 249, 252 | Background: основной фон страниц |
| **White** | `#FFFFFF` | 255, 255, 255 | Surface: карточки, панели |
| **Saffron** | `#F2CC8F` | 242, 204, 143 | Warning: предупреждения, pending статусы |

### Типографика

**Шрифт:** Inter (основной) / Satoshi (альтернатива)

| Уровень | Size | Weight | Line Height | Letter Spacing | Использование |
|---------|------|--------|-------------|----------------|---------------|
| **H1** | 32px | SemiBold (600) | 40px | -0.5% | Приветствие, главные заголовки |
| **H2** | 24px | SemiBold (600) | 32px | -0.5% | Заголовки секций |
| **H3** | 18px | SemiBold (600) | 24px | 0% | Подзаголовки, табы |
| **Body Large** | 16px | Regular (400) | 24px | 0% | Основной текст |
| **Body** | 14px | Regular (400) | 20px | 0% | Вторичный текст, списки |
| **Body Small** | 12px | Regular (400) | 16px | 0% | Метки, timestamps |
| **Button** | 14px | Medium (500) | 20px | 0% | Кнопки |
| **Caption** | 11px | Medium (500) | 16px | 0.5% | Badges, labels |

### Spacing System (8px Grid)

```
4px   — Micro spacing (внутри компонентов)
8px   — XS: иконка к тексту, tight elements
12px  — S: между связанными элементами
16px  — M: стандартный отступ между элементами
24px  — L: между секциями
32px  — XL: между крупными блоками
48px  — XXL: major sections
64px  — XXXL: page sections
```

### Радиусы скругления

```
4px   — Small: badges, tags
8px   — Medium: buttons, inputs, small cards
12px  — Large: cards, panels
16px  — XL: modals, large containers
24px  — XXL: decorative elements
```

### Shadows (Elevation)

```
Level 1 (Cards):
box-shadow: 0px 1px 3px rgba(26, 26, 46, 0.08), 0px 1px 2px rgba(26, 26, 46, 0.06);

Level 2 (Hover):
box-shadow: 0px 4px 8px rgba(26, 26, 46, 0.10), 0px 2px 4px rgba(26, 26, 46, 0.06);

Level 3 (Modals):
box-shadow: 0px 12px 24px rgba(26, 26, 46, 0.15), 0px 4px 8px rgba(26, 26, 46, 0.08);

Level 4 (Dropdowns):
box-shadow: 0px 24px 48px rgba(26, 26, 46, 0.20), 0px 8px 16px rgba(26, 26, 46, 0.10);
```

---

## 1. 🏠 Dashboard (Главная страница)

### Общая структура (1440px viewport)

```
┌─────────────┬──────────────────────────────────────────────┬──────────────┐
│   Sidebar   │              Main Content Area                │ Right Panel  │
│   240px     │                  880px                        │   320px      │
│             │                                               │              │
│  Deep Teal  │      Off White Background #F8F9FC             │  Off White   │
│  #0D7377    │                                               │              │
│             │                                               │              │
│  Always     │  [Header Bar]                                 │ [Tasks]      │
│  Visible    │  [Greeting Section]                           │ [Actions]    │
│             │  [KPI Cards Row]                              │              │
│             │  [Appointments List]                          │              │
│             │  [Chart Section]                              │              │
└─────────────┴──────────────────────────────────────────────┴──────────────┘
```

### 1.1 Sidebar Navigation (240px width, full height)

**Background:** Deep Teal `#0D7377`
**Padding:** 24px horizontal, 32px vertical

#### Logo Area (top)
- **Height:** 64px
- **Content:** Orisios logo (D-fingerprint icon) + "Orisios" wordmark
  - Icon: 32x32px, white lines
  - Text: "Oris" в Light Teal `#14919B`, "ios" в Coral `#FF6B6B`
  - Font: 20px SemiBold
- **Margin Bottom:** 40px

#### Navigation Items

**Structure:** 10 items в ОСНОВНОЕ секции

```
🏠 Главная          ← Active
📅 Расписание
📥 Заявки
✓  Задачи
👤 Пациенты
📋 Шаблоны
🏥 ОМС/ДМС
🧪 Лаборатории

[divider - 1px white at 20% opacity, margin 16px vertical]

📦 Склад
📊 Аналитика
📈 Отчёты
🔗 Интеграции

[divider]

⚙️ Настройки
```

**Item Specifications:**
- **Height:** 44px
- **Padding:** 12px horizontal
- **Border Radius:** 8px
- **Gap between icon and text:** 12px
- **Icon Size:** 20x20px
- **Font:** 14px Medium

**States:**

*Inactive (default):*
- Background: transparent
- Icon: White at 70% opacity
- Text: White at 70% opacity

*Hover:*
- Background: `rgba(255, 255, 255, 0.10)`
- Icon: White at 90% opacity
- Text: White at 90% opacity
- Transition: 150ms ease-in-out

*Active:*
- Background: Light Teal `#14919B` at 30% opacity
- Border Left: 3px solid Coral `#FF6B6B`
- Icon: White at 100% opacity
- Text: White at 100% opacity

#### Bottom Section (User Profile)
- **Position:** Bottom of sidebar, 24px from bottom
- **Content:** Avatar (40px circle) + Name + Role
- **Background:** `rgba(255, 255, 255, 0.10)`
- **Padding:** 12px
- **Border Radius:** 8px

---

### 1.2 Main Content Area (880px width)

**Padding:** 32px all sides
**Background:** Off White `#F8F9FC`

#### Header Bar (Top, 72px height)

**Layout:** 3 columns - Left | Center | Right

**Left Section:**
- **Clinic Weather Icon** (40x40px)
  - Circle background: Seafoam `#45B7A0` at 15% opacity
  - Icon: ☀️ (or ⛅🌧️⚡ based on status)
  - Text: "All Clear" / "Busy" / "Critical"
  - Font: 14px Medium, color Near Black
  - Gap: 12px between icon and text

**Center Section:**
- **Search Bar** (400px width)
  - Height: 40px
  - Background: White `#FFFFFF`
  - Border: 1px solid Light Gray `#E8E8ED`
  - Border Radius: 20px (pill shape)
  - Padding: 0 16px
  - Placeholder: "Поиск пациента, процедуры..." (Dark Gray `#5A5A72`)
  - Icon: 🔍 16x16px left side
  - Font: 14px Regular

**Right Section:** (flex, gap 12px)
1. **OrisAI Button**
   - Width: auto, Height: 40px
   - Background: Coral `#FF6B6B`
   - Color: White
   - Padding: 0 20px
   - Border Radius: 8px
   - Icon: ✨ 16x16px + Text: "OrisAI"
   - Font: 14px Medium
   - Shadow: Level 1

2. **Notification Bell**
   - Size: 40x40px circle
   - Background: White
   - Border: 1px solid Light Gray
   - Icon: 🔔 20x20px
   - Badge: Red dot (8px) if unread

3. **User Avatar**
   - Size: 40x40px circle
   - Border: 2px solid Light Teal `#14919B`

---

#### Greeting Section (margin-top 32px)

**Layout:** Left-aligned text + Right-aligned AI insight

**Left:**
- **Greeting:** "Good morning, Dr. Johnson!"
  - Font: H1 (32px SemiBold), Color: Near Black `#1A1A2E`
- **Subtext:** "Friday, January 10, 2026 | 6 patients today"
  - Font: Body (14px Regular), Color: Dark Gray `#5A5A72`
  - Gap: 8px vertical

**Right:**
- **AI Insight Chip** (auto width)
  - Background: Light Teal `#14919B` at 10% opacity
  - Padding: 8px 16px
  - Border Radius: 8px
  - Icon: 💡 16x16px + Text: "Tip: Schedule is light tomorrow"
  - Font: Body Small (12px Regular), Color: Near Black
  - Style: italic

**Margin Bottom:** 32px

---

#### Live Timeline Section (margin-bottom 32px)

**Container:**
- Height: 120px
- Background: White `#FFFFFF`
- Border Radius: 12px
- Padding: 24px
- Shadow: Level 1

**Timeline Bar:**
- **Hours:** 08:00 — 20:00 (horizontal axis)
- **Hour markers:** Every 2 hours, Light Gray `#E8E8ED` vertical lines
- **Time labels:** 12px Regular, Dark Gray `#5A5A72`

**Appointment Blocks:**
- **Height:** 48px
- **Border Radius:** 6px
- **Position:** По временной шкале пропорционально
- **Gap:** 4px vertical if overlapping

**Block Types:**
1. Checkup: Background Deep Teal `#0D7377`, Text White
2. Treatment: Background Coral `#FF6B6B`, Text White
3. Cleaning: Background Seafoam `#45B7A0`, Text White

**Block Content:**
- **Top line:** Patient name (12px Medium, White)
- **Bottom line:** Procedure (11px Regular, White at 90% opacity)

**"NOW" Marker:**
- **Line:** 2px dashed Coral `#FF6B6B`
- **Label:** "NOW" in white chip (background Coral, 16px height)
- **Animation:** Subtle pulse (opacity 100% → 70% → 100%, 2s infinite)

**Past appointments:** Opacity 50%

---

#### KPI Cards Row (4 cards, gap 16px)

**Card Specifications:**
- **Width:** Each card = (880 - 32*2 - 16*3) / 4 = 196px
- **Height:** 120px
- **Background:** White `#FFFFFF`
- **Border Radius:** 12px
- **Padding:** 20px
- **Shadow:** Level 1
- **Hover:** Shadow Level 2, transform scale(1.02), transition 200ms

**Card Structure:**

```
┌─────────────────┐
│ [Icon 40x40]    │  ← Top left
│                 │
│ $45,600         │  ← Value: 24px SemiBold, Near Black
│ Today's Revenue │  ← Label: 12px Regular, Dark Gray
│                 │
│ +8.2% ↑         │  ← Trend: 12px Medium, Seafoam (positive) or Coral (negative)
└─────────────────┘
```

**4 Cards:**

1. **Today's Revenue**
   - Icon background: Seafoam `#45B7A0` at 15% opacity
   - Icon: 💰 (or money symbol) 20x20px in Seafoam
   - Value: "45,600₽"
   - Label: "Today's Revenue"
   - Trend: "+8.2% ↑" in Seafoam

2. **Total Patients Today**
   - Icon background: Coral `#FF6B6B` at 15% opacity
   - Icon: 👤 20x20px in Coral
   - Value: "12"
   - Label: "Total Patients"
   - Trend: "+2 vs yesterday" in Dark Gray

3. **Appointments**
   - Icon background: Deep Teal `#0D7377` at 15% opacity
   - Icon: 📅 20x20px in Deep Teal
   - Value: "8/12"
   - Label: "Appointments"
   - Progress bar: 8px height, Light Teal background, Coral fill (66.7%)

4. **Average Visit Time**
   - Icon background: Saffron `#F2CC8F` at 20% opacity
   - Icon: ⏱️ 20x20px in Saffron
   - Value: "42 min"
   - Label: "Average Time"
   - Trend: "-5 min" in Seafoam (faster is good)

**Margin Bottom:** 24px

---

#### Appointments List Section

**Container:**
- Background: White `#FFFFFF`
- Border Radius: 12px
- Padding: 24px
- Shadow: Level 1

**Header:**
- **Left:** "Upcoming Appointments" (H2: 24px SemiBold, Near Black)
- **Right:** "View All" link (14px Medium, Light Teal, hover underline)
- **Margin Bottom:** 20px

**List Items:** 5 appointments, gap 12px

**Item Structure (Height: 72px):**

```
┌─┬────────────────────────────────────────────────────────────┐
│▌│ [Avatar 48px] Emma Wilson                         09:00 AM  │
│▌│               Regular Checkup                     [Chip]    │
│▌│                                                              │
└─┴────────────────────────────────────────────────────────────┘
 ↑
Left color strip (4px width)
```

**Left Color Strip:**
- Width: 4px
- Border Radius: 2px (left side only)
- Colors:
  - Seafoam `#45B7A0` = Confirmed
  - Coral `#FF6B6B` = In Progress
  - Saffron `#F2CC8F` = Pending

**Avatar:**
- Size: 48x48px circle
- Style: Generative fingerprint pattern (NOT initials)
- Colors: Unique teal/coral gradient per patient
- Margin: 0 16px (left and right)

**Content Layout:**
- **Line 1:** Patient name (16px Medium, Near Black) + Time (14px Regular, Dark Gray) right-aligned
- **Line 2:** Procedure name (14px Regular, Dark Gray) + Status chip right-aligned
- **Gap:** 4px vertical between lines

**Status Chip:**
- Padding: 4px 12px
- Border Radius: 12px (pill)
- Font: 11px Medium, uppercase
- Variants:
  - Confirmed: Background Seafoam at 15%, Text Seafoam
  - In Progress: Background Coral at 15%, Text Coral
  - Pending: Background Saffron at 25%, Text Near Black

**Hover State:**
- Background: Off White `#F8F9FC`
- Cursor: pointer
- Transition: 150ms

**Margin Bottom:** 24px

---

### 1.3 Right Sidebar Panel (320px width)

**Padding:** 32px vertical, 24px horizontal
**Background:** Off White `#F8F9FC`

#### Tasks Checklist Card

**Container:**
- Background: White `#FFFFFF`
- Border Radius: 12px
- Padding: 20px
- Shadow: Level 1
- Margin Bottom: 24px

**Header:**
- Text: "Tasks Today" (H3: 18px SemiBold, Near Black)
- Badge: "3" (count of active tasks) - 20px circle, Coral background, white text
- Margin Bottom: 16px

**Task Items:** (gap 12px)

**Structure:**
```
☐ Call patient about appointment
☑ Review lab results          ← Checked
☐ Update patient records
```

**Checkbox:**
- Size: 20x20px
- Border: 2px solid Light Gray (unchecked) or Seafoam (checked)
- Border Radius: 4px
- Background: White (unchecked) or Seafoam (checked)
- Checkmark: White icon 12x12px

**Task Text:**
- Font: 14px Regular
- Color: Near Black (active) or Dark Gray with strikethrough (completed)
- Hover: Light Teal underline

**Add Task Button:**
- Margin Top: 16px
- Text: "+ Add Task" (14px Medium, Light Teal)
- Hover: underline

---

#### Quick Actions Card

**Container:**
- Background: White `#FFFFFF`
- Border Radius: 12px
- Padding: 20px
- Shadow: Level 1

**Header:**
- Text: "Quick Actions" (H3: 18px SemiBold, Near Black)
- Margin Bottom: 16px

**Buttons:** (2 buttons, gap 12px)

1. **New Appointment** (Primary)
   - Width: 100%
   - Height: 44px
   - Background: Coral `#FF6B6B`
   - Color: White
   - Border Radius: 8px
   - Icon: ➕ 16x16px + Text: "New Appointment"
   - Font: 14px Medium
   - Shadow: Level 1
   - Hover: Background Coral Light `#FF8585`, Shadow Level 2

2. **Add Patient** (Secondary)
   - Width: 100%
   - Height: 44px
   - Background: White
   - Border: 1.5px solid Light Gray `#E8E8ED`
   - Color: Near Black
   - Border Radius: 8px
   - Icon: 👤 16x16px + Text: "Add Patient"
   - Font: 14px Medium
   - Hover: Border color Light Teal, Background Off White

---

## 2. 📅 Расписание (Calendar View)

### Общая структура (1440px viewport)

```
┌─────────────┬──────────────────────────────────────────────────────────┐
│   Sidebar   │              Calendar Area + Detail Panel                 │
│   240px     │                      1200px                               │
│             │   ┌──────────────────────────┬────────────────────┐      │
│  (same as   │   │   Calendar Grid          │  Appointment       │      │
│  Dashboard) │   │   800px                  │  Details           │      │
│             │   │                          │  368px             │      │
│             │   │                          │                    │      │
│             │   │   [Week View 7 columns]  │  [Selected Card]   │      │
│             │   │   [Time slots 08-20]     │  [Actions]         │      │
│             │   └──────────────────────────┴────────────────────┘      │
└─────────────┴──────────────────────────────────────────────────────────┘
```

### 2.1 Calendar Toolbar (Top Bar, height 72px)

**Background:** White `#FFFFFF`
**Border Bottom:** 1px solid Light Gray `#E8E8ED`
**Padding:** 0 32px
**Display:** flex, space-between, align-center

**Left Section:**
- **Week Range:** "Jan 8 — Jan 14, 2026" (H2: 24px SemiBold, Near Black)
- **Navigation Arrows:**
  - Buttons: 40x40px, Border Radius 8px
  - Border: 1px solid Light Gray
  - Icons: ← → 20x20px
  - Gap: 8px
  - Hover: Background Off White

**Center Section:**
- **"Today" Button:**
  - Height: 40px, Padding: 0 20px
  - Background: Light Teal `#14919B` at 10% opacity
  - Color: Light Teal
  - Border Radius: 8px
  - Font: 14px Medium
  - Hover: Background at 20% opacity

**Right Section (gap 12px):**

1. **View Toggle Group** (segmented control)
   - Width: 200px, Height: 40px
   - Background: Off White `#F8F9FC`
   - Border Radius: 8px
   - Padding: 4px
   - Items: "Day" | "Week" | "Month"
   - Active: Background White, Shadow Level 1, Color Near Black
   - Inactive: Color Dark Gray
   - Font: 14px Medium

2. **Filters Button**
   - Size: 40x40px
   - Border: 1px solid Light Gray
   - Border Radius: 8px
   - Icon: ⚙️ 20x20px
   - Hover: Background Off White

3. **New Appointment Button** (Primary CTA)
   - Height: 40px, Padding: 0 20px
   - Background: Coral `#FF6B6B`
   - Color: White
   - Border Radius: 8px
   - Icon: ➕ 16x16px + Text: "New"
   - Font: 14px Medium
   - Shadow: Level 1
   - Hover: Background Coral Light `#FF8585`, Shadow Level 2

---

### 2.2 Calendar Grid (Week View)

**Background:** Off White `#F8F9FC`
**Padding:** 32px

#### Grid Structure

**Layout:** 8 columns (Time labels + 7 days)

```
       │ Mon 8  │ Tue 9  │ Wed 10 │ Thu 11 │ Fri 12 │ Sat 13 │ Sun 14
       │        │        │        │        │        │ (light │ (light
       │        │        │  TODAY │        │        │  gray) │  gray)
───────┼────────┼────────┼────────┼────────┼────────┼────────┼────────
08:00  │        │        │  [apt] │        │        │        │
09:00  │  [apt] │        │  [apt] │  [apt] │        │        │
10:00  │        │  [apt] │        │        │  [apt] │        │
...
20:00  │        │        │        │        │        │        │
```

**Column Widths:**
- Time labels column: 80px
- Each day column: (800 - 80) / 7 ≈ 103px

**Day Header:**
- Height: 64px
- Background: White (weekdays) or Light Gray at 50% (weekend)
- Border Bottom: 2px solid Light Teal (today) or 1px solid Light Gray (others)
- **Content:**
  - Day name: 12px Medium, uppercase, Dark Gray
  - Date number: 24px SemiBold, Near Black (today in Light Teal)
  - Appointment count: 11px Regular, "3 appts" in Dark Gray

**Time Slots:**
- Height: 60px per hour
- Border Bottom: 1px solid Light Gray `#E8E8ED`
- Background: White (weekdays) or Off White (weekends)

**Hour Labels:**
- Position: Left column, 80px width
- Font: 12px Regular, Dark Gray `#5A5A72`
- Alignment: Right, padding-right 12px
- Format: "08:00", "09:00", etc.

**Current Time Indicator:**
- Horizontal line: 2px solid Coral `#FF6B6B`
- With small circle (8px) on the left edge
- Z-index above appointment blocks

---

#### Appointment Blocks

**Dimensions:**
- Width: 100% of column (with 8px padding horizontal)
- Height: Proportional to duration (1 hour = 60px)
- Minimum height: 30px (for 30-min appointments)

**Positioning:**
- Top: Calculated from start time
- If overlapping: Stack with 4px horizontal offset

**Appearance:**
- Border Radius: 6px
- Padding: 8px
- Border Left: 3px solid (status color)
- Shadow: Level 1
- Cursor: pointer

**Color Coding:**

1. **Confirmed** (Seafoam `#45B7A0`)
   - Background: Seafoam at 15% opacity
   - Border: Seafoam solid
   - Text: Near Black

2. **In Progress** (Coral `#FF6B6B`)
   - Background: Coral at 15% opacity
   - Border: Coral solid
   - Text: Near Black

3. **Pending** (Saffron `#F2CC8F`)
   - Background: Saffron at 20% opacity
   - Border: Saffron solid
   - Text: Near Black

4. **Completed** (Deep Teal `#0D7377`)
   - Background: Deep Teal at 10% opacity
   - Border: Deep Teal solid
   - Text: Dark Gray
   - Opacity: 60%

**Content Structure:**
```
┌─────────────────┐
│ 09:00 - 10:00   │  ← Time (11px Medium)
│ Emma Wilson     │  ← Name (14px Medium, Near Black)
│ Regular Checkup │  ← Procedure (12px Regular, Dark Gray)
└─────────────────┘
```

**Hover State:**
- Shadow: Level 2
- Transform: scale(1.02)
- Z-index: 10
- Transition: 150ms ease-out

**Selected State:**
- Border: 2px solid Coral `#FF6B6B` (all sides)
- Shadow: Level 3
- Background: slightly darker (at 25% opacity)

---

### 2.3 Appointment Details Panel (Right, 368px)

**Container:**
- Width: 368px
- Height: 100% (full viewport height minus header)
- Background: White `#FFFFFF`
- Border Left: 1px solid Light Gray `#E8E8ED`
- Padding: 32px 24px
- Position: sticky top 0

**Empty State** (when no appointment selected):
- **Icon:** 📅 64x64px, Light Gray
- **Text:** "Select an appointment to view details"
- **Font:** 14px Regular, Dark Gray
- **Alignment:** Center vertical and horizontal

---

**Active State** (appointment selected):

#### Patient Info Section

**Avatar:**
- Size: 80x80px circle
- Generative fingerprint pattern
- Margin bottom: 16px
- Center-aligned

**Name:**
- Font: H2 (24px SemiBold), Near Black
- Center-aligned
- Margin bottom: 4px

**Contact Info:**
- Phone: 📞 +7 (999) 123-45-67
- Email: ✉️ email@example.com
- Font: 14px Regular, Dark Gray
- Gap: 8px vertical
- Icons: 16x16px, left-aligned

**Tags Row** (margin top 12px):
- Badges: "VIP", "Allergy", etc.
- Height: 24px
- Padding: 0 12px
- Border Radius: 12px
- Font: 11px Medium, uppercase
- Background: Saffron at 25%, Text Near Black
- Gap: 8px horizontal

**Divider:** 1px solid Light Gray, margin 24px vertical

---

#### Appointment Details Section

**Info Grid:**

| Label (12px Regular, Dark Gray) | Value (14px Medium, Near Black) |
|---------------------------------|----------------------------------|
| **Date:**                       | Monday, Jan 8, 2026              |
| **Time:**                       | 09:00 — 10:00 (1 hour)           |
| **Doctor:**                     | Dr. Johnson                      |
| **Procedure:**                  | Regular Checkup                  |
| **Status:**                     | [Chip: Confirmed]                |
| **Room:**                       | Room 3                           |

**Layout:**
- Each row: 40px height
- Label left, Value right
- Gap: 8px vertical

**Status Chip:**
- Same styling as in Appointments List
- Inline with label

**Divider:** 1px solid Light Gray, margin 24px vertical

---

#### Notes Section

**Header:**
- Text: "Notes" (H3: 18px SemiBold, Near Black)
- Margin bottom: 12px

**Content:**
- Textarea-style box (read-only for now)
- Min height: 80px
- Padding: 12px
- Background: Off White `#F8F9FC`
- Border: 1px solid Light Gray
- Border Radius: 8px
- Font: 14px Regular, Near Black
- Text: "Patient mentioned sensitivity in lower left molar..."

**Margin Bottom:** 24px

---

#### Action Buttons

**Button Stack** (gap 12px, vertical):

1. **Start Visit** (Primary)
   - Width: 100%
   - Height: 48px
   - Background: Coral `#FF6B6B`
   - Color: White
   - Border Radius: 8px
   - Icon: ▶️ 16x16px + Text: "Start Visit"
   - Font: 14px Medium
   - Shadow: Level 1
   - Hover: Background Coral Light, Shadow Level 2

2. **Reschedule** (Secondary)
   - Width: 100%
   - Height: 48px
   - Background: White
   - Border: 1.5px solid Light Gray
   - Color: Near Black
   - Border Radius: 8px
   - Icon: 🔄 16x16px + Text: "Reschedule"
   - Font: 14px Medium
   - Hover: Border Light Teal, Background Off White

3. **Cancel Appointment** (Tertiary/Danger)
   - Width: 100%
   - Height: 48px
   - Background: transparent
   - Color: Coral `#FF6B6B`
   - Border Radius: 8px
   - Text only: "Cancel Appointment"
   - Font: 14px Medium
   - Hover: Background Coral at 10%

---

## 3. 👤 Карточка пациента (Patient Profile)

### Общая структура (1440px viewport)

```
┌─────────────┬─────────────────────────────────────────────────────────┐
│   Sidebar   │              Patient Profile Content Area                │
│   240px     │                      1200px                              │
│             │                                                          │
│  (same as   │  [Patient Header with Avatar & Info]                    │
│  Dashboard) │  [Horizontal Tabs: 9 tabs]                              │
│             │  [Active Tab Content]                                   │
│             │                                                          │
└─────────────┴─────────────────────────────────────────────────────────┘
```

### 3.1 Patient Header Section (height: 240px)

**Container:**
- Background: White `#FFFFFF`
- Border Bottom: 1px solid Light Gray `#E8E8ED`
- Padding: 40px 32px

**Layout:** Flex row, space-between

#### Left Section (Patient Info)

**Avatar:**
- Size: 120x120px circle
- Generative fingerprint pattern (unique per patient)
- Border: 4px solid Light Teal `#14919B`
- Margin right: 32px

**Info Column:**

**Name:**
- Font: H1 (32px SemiBold), Near Black `#1A1A2E`
- Margin bottom: 8px
- Example: "Иванов Петр Алексеевич"

**Metadata Row 1:** (flex, gap 24px)
- **Age:** "42 года" | Icon: 🎂 16x16px
- **Gender:** "Мужской" | Icon: 👤 16x16px
- **Blood Type:** "A+ (II)" | Icon: 💉 16x16px
- Font: 14px Regular, Dark Gray `#5A5A72`

**Metadata Row 2:** (flex, gap 24px, margin-top 8px)
- **Phone:** "+7 (999) 123-45-67" | Icon: 📞 16x16px
- **Email:** "ivanov@email.com" | Icon: ✉️ 16x16px
- Font: 14px Regular, Dark Gray
- Links: clickable, hover underline in Light Teal

**Tags Row:** (margin-top 16px, gap 8px)
- **Badges:**
  - "VIP" — Background Gold at 20%, Text Near Black
  - "Аллергия" — Background Coral at 15%, Text Coral
  - "Постоянный" — Background Seafoam at 15%, Text Seafoam
- Height: 28px
- Padding: 0 16px
- Border Radius: 14px
- Font: 12px Medium, uppercase

---

#### Right Section (Actions)

**Button Group:** (flex column, gap 12px, align-end)

1. **Edit Profile** (Secondary)
   - Width: 160px, Height: 44px
   - Background: White
   - Border: 1.5px solid Light Gray
   - Color: Near Black
   - Border Radius: 8px
   - Icon: ✏️ 16x16px + Text: "Edit Profile"
   - Font: 14px Medium

2. **New Visit** (Primary)
   - Width: 160px, Height: 44px
   - Background: Coral `#FF6B6B`
   - Color: White
   - Border Radius: 8px
   - Icon: ➕ 16x16px + Text: "New Visit"
   - Font: 14px Medium
   - Shadow: Level 1

**Stats Mini-cards** (below buttons, margin-top 24px):

**3 horizontal cards** (gap 12px):
- Width: 100px, Height: 64px
- Background: Off White `#F8F9FC`
- Border Radius: 8px
- Padding: 12px
- Center-aligned

**Content:**
- **Value:** 16px SemiBold, Near Black
- **Label:** 11px Regular, Dark Gray
- Examples:
  - "24" — "Visits"
  - "156,000₽" — "Spent"
  - "4.8⭐" — "Rating"

---

### 3.2 Tabs Navigation (height: 64px)

**Container:**
- Background: White `#FFFFFF`
- Border Bottom: 2px solid Light Gray `#E8E8ED`
- Padding: 0 32px

**Tab Items:** 9 tabs, horizontal scroll if needed

```
[Обзор] [Зубная формула] [Визиты] [Лечение] [Документы] [Анамнез] [Файлы] [Финансы] [История изменений]
```

**Tab Specifications:**
- Height: 64px (full container height)
- Padding: 0 20px
- Gap: 8px between tabs
- Font: 14px Medium
- Cursor: pointer

**States:**

*Inactive:*
- Color: Dark Gray `#5A5A72`
- Border Bottom: 2px solid transparent
- Background: transparent

*Hover:*
- Color: Near Black `#1A1A2E`
- Background: Off White `#F8F9FC`

*Active:*
- Color: Coral `#FF6B6B`
- Border Bottom: 2px solid Coral `#FF6B6B` (extends below tab)
- Background: transparent
- Font Weight: SemiBold (600)

**Scroll Indicators:**
- If tabs overflow: Show gradient fade on edges + arrow buttons
- Arrows: 32x32px, Light Gray, appear on hover

---

### 3.3 Tab Content Area

**Container:**
- Background: Off White `#F8F9FC`
- Padding: 32px
- Min height: calc(100vh - header - patient header - tabs)

---

#### Tab 1: Обзор (Overview)

**Layout:** 2 columns (2:1 ratio)

**Left Column (66%):** Main content

##### Upcoming Appointment Card
- Background: White
- Border Radius: 12px
- Padding: 24px
- Shadow: Level 1
- Margin bottom: 24px

**Header:**
- Text: "Ближайший визит" (H3: 18px SemiBold)
- Badge: "Tomorrow" (Coral background, white text)

**Content:**
- **Date & Time:** "Monday, Jan 8, 2026 • 09:00 - 10:00"
  - Font: 16px Medium, Near Black
- **Doctor:** "Dr. Johnson"
  - Icon: 👨‍⚕️ 16x16px
  - Font: 14px Regular, Dark Gray
- **Procedure:** "Regular Checkup"
  - Icon: 🦷 16x16px
- **Room:** "Room 3"

**Action Button:**
- "View Details" link (14px Medium, Light Teal)
- Hover: underline

---

##### Visit History Timeline

**Container:**
- Background: White
- Border Radius: 12px
- Padding: 24px
- Shadow: Level 1

**Header:**
- Text: "История визитов" (H3: 18px SemiBold)
- Filter: "Last 12 months ▼" dropdown (right-aligned)
- Margin bottom: 20px

**Timeline Structure:** Vertical line (2px, Light Gray) on left

**Timeline Item:** (5 recent visits, gap 20px)

```
  ●─── Jan 5, 2026
  │    Cleaning & Checkup
  │    Dr. Johnson • 45 min
  │    Status: ✓ Completed
  │
  ●─── Dec 10, 2025
  │    Filling (Tooth #16)
  │    ...
```

**Dot:**
- Size: 12px circle
- Colors based on visit type:
  - Seafoam = Checkup
  - Coral = Treatment
  - Deep Teal = Cleaning
- Border: 2px solid white (for contrast)

**Item Content:**
- **Date:** 14px Medium, Near Black
- **Procedure:** 14px Regular, Dark Gray
- **Meta:** 12px Regular, Dark Gray (doctor + duration)
- **Status:** Chip (same styling as appointments)

**"View All" Button:**
- Margin top: 16px
- Text link: "View all 24 visits" (14px Medium, Light Teal)

---

**Right Column (33%):** Sidebar panels

##### Current Treatment Plan Card

- Background: White
- Border Radius: 12px
- Padding: 20px
- Shadow: Level 1
- Margin bottom: 24px

**Header:**
- Text: "Текущий план лечения" (H3: 18px SemiBold)
- Margin bottom: 16px

**Plan Items:** (3 items, gap 12px)

**Structure:**
```
☐ Root canal treatment (#24)
   Next: Jan 15, 2026

☑ Tooth filling (#16)
   Completed: Jan 5, 2026

☐ Crown placement (#24)
   Scheduled: Jan 22, 2026
```

**Checkbox:**
- Size: 20x20px
- Same styling as tasks

**Text:**
- Procedure: 14px Medium, Near Black
- Date: 12px Regular, Dark Gray
- Completed items: strikethrough, opacity 60%

---

##### Medical Alerts Card

- Background: Saffron `#F2CC8F` at 10%
- Border: 1px solid Saffron
- Border Radius: 12px
- Padding: 20px

**Icon:** ⚠️ 24x24px (top-left)

**Header:**
- Text: "Медицинские уведомления" (16px SemiBold, Near Black)
- Margin bottom: 12px

**Alerts List:**
- "Аллергия на лидокаин" (14px Medium, Near Black)
- "Сахарный диабет 2 типа" (14px Regular, Dark Gray)

**Link:**
- "View full medical history" (12px Medium, Saffron, underline on hover)

---

##### Quick Stats Panel

- Background: White
- Border Radius: 12px
- Padding: 20px
- Shadow: Level 1

**Header:**
- Text: "Статистика" (H3: 18px SemiBold)
- Margin bottom: 16px

**Stats Grid:** (2 columns, gap 16px)

**Stat Item:**
- **Value:** 20px SemiBold, Near Black
- **Label:** 12px Regular, Dark Gray
- Vertical layout, center-aligned

**Items:**
- "24" — "Total Visits"
- "8" — "This Year"
- "156,000₽" — "Total Spent"
- "12,000₽" — "Outstanding"

---

#### Tab 2: Зубная формула (Dental Chart)

**Full-width layout** (single column)

##### Interactive Dental Chart (Center)

**Container:**
- Background: White
- Border Radius: 12px
- Padding: 40px
- Shadow: Level 1
- Margin bottom: 24px

**Tooth Diagram:**
- Layout: 32 teeth in anatomical arch formation
- Upper jaw: 16 teeth (arc from #18 to #28)
- Lower jaw: 16 teeth (arc from #48 to #38)

**Tooth Representation:**
- Size: 48x48px each
- Style: Clean vector illustration
- Gap: 8px between teeth
- Hover: Scale(1.1), shadow, cursor pointer

**Tooth States & Colors:**

1. **Healthy** (default)
   - Fill: White
   - Stroke: 2px Light Gray `#E8E8ED`

2. **Selected** (active)
   - Fill: Coral `#FF6B6B` at 20% opacity
   - Stroke: 2px Coral `#FF6B6B`
   - Shadow: Level 2

3. **Cavity** (treatment needed)
   - Fill: Saffron `#F2CC8F` at 30% opacity
   - Stroke: 2px Saffron
   - Icon: Small ⚠️ overlay

4. **Filled** (restoration)
   - Fill: Deep Teal `#0D7377` at 15% opacity
   - Stroke: 2px Deep Teal
   - Icon: Small ✓ overlay

5. **Crown**
   - Fill: Light Teal `#14919B` at 20% opacity
   - Stroke: 2px Light Teal
   - Icon: Crown symbol ♛

6. **Missing**
   - Fill: transparent
   - Stroke: 2px dashed Light Gray
   - Center: ✕ symbol (16px, Light Gray)

7. **Implant**
   - Fill: gradient (white to light gray)
   - Stroke: 2px Deep Teal
   - Icon: Implant symbol ⚡

**Tooth Numbers:**
- Position: Below each tooth
- Font: 10px Regular, Dark Gray
- Format: ISO notation (#18, #17, ...)

**Legend Panel** (below diagram):
- Horizontal row of status indicators
- Each: Icon + Label (12px Regular)
- Gap: 24px
- Example: "🟩 Healthy | 🟨 Cavity | 🟦 Filled | ❌ Missing"

---

##### Tooth Details Panel (Right side, 368px, sticky)

**Appears when tooth is selected**

**Container:**
- Background: White
- Border Radius: 12px
- Padding: 24px
- Shadow: Level 2

**Header:**
- Text: "Tooth #16" (H2: 24px SemiBold)
- Subtitle: "Upper Right First Molar"
- Margin bottom: 20px

**Status Section:**

**Current Status:**
- Badge: "Filled" (Seafoam background at 15%)
- Date: "Last treated: Jan 5, 2026"
- Font: 14px Regular, Dark Gray

**Condition Details:**
- **Treatment:** "Amalgam filling"
- **Surface:** "Occlusal"
- **Doctor:** "Dr. Johnson"
- Grid layout, label + value

**Divider:** margin 20px vertical

---

**History Section:**

**Header:** "Treatment History" (16px SemiBold)

**Timeline:** (vertical, 3 most recent)
- Jan 5, 2026 — Amalgam filling
- Sep 12, 2025 — Checkup (healthy)
- Feb 3, 2024 — Cavity detected

**Format:**
- Date: 12px Medium, Dark Gray
- Treatment: 14px Regular, Near Black

---

**Action Section:**

**Add Treatment Button:**
- Width: 100%, Height: 44px
- Background: Coral `#FF6B6B`
- Color: White
- Border Radius: 8px
- Text: "Add Treatment"
- Icon: ➕ 16x16px

**Notes Textarea:**
- Margin top: 16px
- Placeholder: "Add notes for this tooth..."
- Min height: 80px
- Styling: same as previous textareas

---

#### Tab 3-9: Other Tabs (Brief Specs)

**Tab 3: Визиты (Visits)**
- Full visit history table
- Columns: Date, Doctor, Procedure, Duration, Cost, Status
- Filters: Date range, Doctor, Procedure type
- Pagination: 20 per page

**Tab 4: Лечение (Treatment)**
- Active treatment plans
- Treatment timeline (Gantt-style)
- Prescription history
- Recommendations

**Tab 5: Документы (Documents)**
- Document grid (cards)
- Types: Consent forms, Prescriptions, Lab reports, X-rays
- Upload zone (drag & drop)
- Document viewer modal

**Tab 6: Анамнез (Medical History)**
- Medical conditions list
- Allergies (prominent alerts)
- Medications
- Family history
- Habits (smoking, etc.)

**Tab 7: Файлы (Files)**
- File manager interface
- Categories: Photos, X-rays, Scans, Documents
- Grid/List view toggle
- Preview modal

**Tab 8: Финансы (Finances)**
- Financial summary cards
- Invoices table (sortable)
- Payment history
- Outstanding balance (prominent if > 0)
- Payment methods on file

**Tab 9: История изменений (Change Log)**
- Audit trail table
- Columns: Date/Time, User, Action, Details
- Filters: Date range, User, Action type
- Read-only

---

## 🎯 Общие UI Patterns

### Buttons

**Primary (Coral):**
```css
background: #FF6B6B
color: white
height: 40px / 44px / 48px
padding: 0 20px / 24px
border-radius: 8px
font: 14px Medium
shadow: Level 1
hover: background #FF8585, shadow Level 2
active: background #E55555
```

**Secondary (Outline):**
```css
background: white
border: 1.5px solid #E8E8ED
color: #1A1A2E
height: same as primary
padding: same as primary
border-radius: 8px
hover: border #14919B, background #F8F9FC
```

**Tertiary (Text only):**
```css
background: transparent
color: #14919B
padding: 8px 16px
hover: background rgba(20, 145, 155, 0.10)
```

### Input Fields

**Text Input:**
```css
height: 40px / 44px
padding: 0 16px
border: 1px solid #E8E8ED
border-radius: 8px
background: white
font: 14px Regular
placeholder: #5A5A72

focus:
  border: 1.5px solid #14919B
  outline: none
  shadow: 0 0 0 3px rgba(20, 145, 155, 0.15)

error:
  border: 1.5px solid #FF6B6B
  shadow: 0 0 0 3px rgba(255, 107, 107, 0.15)
```

**Textarea:**
```css
min-height: 80px
padding: 12px 16px
/* other properties same as text input */
resize: vertical
```

### Modals

**Overlay:**
```css
background: rgba(26, 26, 46, 0.50)
backdrop-filter: blur(4px)
```

**Modal Container:**
```css
background: white
border-radius: 16px
padding: 32px
max-width: 600px / 800px
shadow: Level 4
```

**Modal Header:**
```css
margin-bottom: 24px
H2: 24px SemiBold
Close button: 32x32px, top-right, Light Gray icon
```

### Tooltips

```css
background: #1A1A2E
color: white
padding: 8px 12px
border-radius: 6px
font: 12px Regular
shadow: Level 3
arrow: 6px triangle
max-width: 200px
```

### Notifications/Toasts

**Success:**
```css
background: #45B7A0 at 15%
border-left: 4px solid #45B7A0
icon: ✓ 20x20px in Seafoam
```

**Error:**
```css
background: #FF6B6B at 15%
border-left: 4px solid #FF6B6B
icon: ✕ 20x20px in Coral
```

**Warning:**
```css
background: #F2CC8F at 20%
border-left: 4px solid #F2CC8F
icon: ⚠️ 20x20px in Saffron
```

**Info:**
```css
background: #14919B at 15%
border-left: 4px solid #14919B
icon: ℹ️ 20x20px in Light Teal
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Description |
|------------|-------|-------------|
| Desktop XL | 1920px+ | Large monitors |
| Desktop | 1440px - 1919px | Standard desktop (primary) |
| Desktop SM | 1200px - 1439px | Small desktop / laptop |
| Tablet | 768px - 1199px | Tablet landscape |
| Mobile | < 768px | Mobile devices |

**Note:** Figma Make should prioritize Desktop (1440px) viewport as primary design target.

---

## ✅ Checklist для генерации

### Dashboard ✓
- [ ] Sidebar navigation with all 14 items
- [ ] Header bar with Clinic Weather, search, OrisAI, notifications
- [ ] Greeting section with AI insight
- [ ] Live Timeline with NOW marker
- [ ] 4 KPI cards with icons and trends
- [ ] Appointments list with 5 items
- [ ] Right panel: Tasks + Quick Actions

### Calendar ✓
- [ ] Toolbar with week navigation and view toggles
- [ ] 7-column week grid (Mon-Sun)
- [ ] Time slots 08:00-20:00
- [ ] Color-coded appointment blocks
- [ ] Current time indicator (if today is visible)
- [ ] Appointment details panel (right sidebar)
- [ ] Patient info with avatar
- [ ] Action buttons (Start Visit, Reschedule, Cancel)

### Patient Profile ✓
- [ ] Patient header with 120px avatar
- [ ] Contact info and metadata
- [ ] Tags (VIP, Allergy, etc.)
- [ ] 9 horizontal tabs
- [ ] Overview tab with upcoming appointment
- [ ] Visit history timeline
- [ ] Treatment plan card
- [ ] Medical alerts panel
- [ ] Dental chart with 32 teeth
- [ ] Tooth detail panel (when selected)

---

*Документ создан: 16 января 2026*
*Версия: 1.0*
*Для использования в Figma Make при генерации UI дизайнов Orisios*
