# Orisios: Промпты для генерации UI изображений

> Промпты оптимизированы для Midjourney, DALL-E 3, Stable Diffusion и Leonardo AI
>
> **Бренд:** Orisios | **Обновлено:** 8 января 2026

---

## Цветовая палитра Orisios

| Цвет | HEX | Использование |
|------|-----|---------------|
| **Deep Teal** | #0D7377 | Основной цвет, sidebar, заголовки |
| **Coral** | #FF6B6B | Акцент, кнопки CTA, активные элементы |
| **Light Teal** | #45B7A0 | Градиенты, hover, успех |
| **White** | #FFFFFF | Фон карточек |
| **Near Black** | #1A1A2E | Текст, dark mode |
| **Light Gray** | #F8FAFB | Фон страниц |
| **Saffron** | #F2CC8F | Warning, badges |

---

## 1. Главный Dashboard (Desktop)

### Промпт:

```
Modern dental clinic management software dashboard UI design for Orisios,
desktop web application at 1440px viewport, clean two-column layout.

Layout Structure:
- Left sidebar: 240px width, static, deep teal #0D7377 background
  Navigation items: Главная (active), Расписание, Заявки, Задачи, Пациенты,
  Шаблоны, ОМС/ДМС, Лаборатории, Склад, Аналитика, Отчёты, Интеграции, Настройки

- Main content area: 1200px width, scrollable, light gray background #F8FAFB
  All content scrolls together as unified flow

Header Section (72px height):
- Left: "Clinic Weather" indicator with sun icon and "All Clear" status
- Center: Search bar (400px pill shape, white background)
- Right: "OrisAI" button (coral), notification bell with badge, user avatar

Content Flow (top to bottom):
1. Greeting: "Good morning, Dr. Johnson!" (32px SemiBold) + date/patient count
   AI insight chip on right with lightbulb icon

2. Live Timeline (120px height card):
   Horizontal bar 08:00-20:00 with color-coded appointment blocks
   "NOW" marker as coral dashed line with pulse animation

3. KPI Cards Row (4 cards, 277px each, gap 16px):
   - Revenue: 45,600₽ with +8.2% trend (seafoam icon)
   - Patients: 12 total (coral icon)
   - Appointments: 8/12 with progress bar (teal icon)
   - Average Time: 42 min (saffron icon)

4. Grid Layout (2 columns: 66% + 33%, gap 24px):
   LEFT COLUMN (66%): "Upcoming Appointments" card
   - 5 appointment rows with generative fingerprint avatars
   - Each row: 4px left color strip (seafoam/coral/saffron), patient name, time, status chip

   RIGHT COLUMN (33%): Stacked cards
   - "Tasks Today" card: 3 checkboxes with tasks, coral badge count
   - "Quick Actions" card: "New Appointment" (coral button), "Add Patient" (outline button)

5. Weekly Revenue Chart (full width 1136px):
   Line chart with teal line, coral data points, 240px height

Color Palette:
- Deep Teal #0D7377: sidebar, primary
- Coral #FF6B6B: CTAs, accents, active states
- Light Teal #14919B: gradients, hover
- Seafoam #45B7A0: success, confirmed status
- Saffron #F2CC8F: warnings, pending status
- Near Black #1A1A2E: text
- Off White #F8FAFB: page background
- White #FFFFFF: cards

Typography: Inter, 32px/24px/18px/16px/14px/12px hierarchy

Style: Modern SaaS aesthetic like Linear or Notion, clean grid-based layout,
subtle shadows (Level 1), 12px border radius on cards, generous whitespace,
professional yet friendly, two-column flow with unified scroll.

NO: three-column layout, fixed right sidebar, stock photos, 3D renders, cluttered design
YES: two-column layout, unified scroll, flat design, vector UI, high fidelity mockup

--ar 16:9 --v 6 --style raw
```

---

## 2. Расписание (Calendar View)

### Промпт:

```
Dental clinic appointment scheduling interface, weekly calendar view,
modern web application UI design for Orisios software.

Layout:
- Left sidebar: deep teal (#0D7377) navigation with calendar icon active
- Top bar: week selector with arrows, "Today" button, view toggles (Day/Week/Month)
- Main area: 7-column calendar grid showing Monday to Sunday
- Time slots on the left (08:00 - 20:00)

Calendar appointments shown as colored blocks:
- Coral (#FF6B6B) for confirmed appointments
- Saffron (#F2CC8F) for pending
- Light Teal (#45B7A0) for completed
- Each block shows: time, patient name, procedure type

Right panel: Selected appointment details card with patient info,
"Start Visit" coral button, "Reschedule" secondary button.

Background: light gray (#F8FAFB), cards: white,
shadows: subtle, corners: rounded 8px.

Style: Clean SaaS calendar UI, similar to Calendly or Cal.com aesthetic,
high-fidelity mockup, Figma quality, Inter font.

--ar 16:9 --v 6 --style raw
```

---

## 3. Карточка пациента (Patient Profile)

### Промпт:

```
Dental patient profile page UI design, modern healthcare web application,
detailed patient record interface for Orisios software.

Layout:
- Left sidebar: deep teal (#0D7377) navigation, "Patients" section active
- Main content split into sections:

Top section - Patient header:
- Large avatar placeholder (circle with initials)
- Patient name "Иванов Петр Алексеевич"
- Age, phone number, email
- Tags: "VIP", "Allergy" in saffron (#F2CC8F) badges
- "Edit" button (secondary), "New Visit" button (coral #FF6B6B primary)

Middle section - Tabs:
- "Overview" | "Dental Chart" | "Visits" | "Documents" | "Billing"
- Active tab underlined with coral

Content area:
- Left column: Visit history timeline with dates and procedures
- Right column: Current treatment plan card, upcoming appointment card
- Medical notes section with text

Dental chart preview: Small interactive tooth diagram (32 teeth schematic)

Color palette: Coral accents #FF6B6B, Deep Teal sidebar #0D7377,
Light gray background #F8FAFB, White cards, Near Black text #1A1A2E

Style: Medical SaaS interface, clean and organized, HIPAA-compliant feel,
professional healthcare design, high fidelity UI mockup.

--ar 16:9 --v 6 --style raw
```

---

## 4. Зубная формула (Dental Chart)

### Промпт:

```
Interactive dental chart interface, tooth diagram UI for Orisios dentist software,
modern web application design.

Central element: Adult teeth diagram showing all 32 teeth in anatomical layout,
upper jaw (16 teeth) and lower jaw (16 teeth) in arch formation.
Clean vector illustration style, each tooth clickable/selectable.

Tooth status colors:
- Healthy: light gray outline
- Selected: coral highlight (#FF6B6B)
- Cavity: orange marker
- Filled: teal marker (#0D7377)
- Crown: saffron (#F2CC8F)
- Missing: empty outline with X
- Implant: special icon

Left panel: Condition selector
- Checkboxes: Caries, Fracture, Wear levels (Mild/Moderate/Severe)
- Treatment options dropdown

Right panel: "Current Diagnosis" card
- Selected teeth numbers
- Condition description
- "Add to Treatment Plan" coral button

Top toolbar: Patient name, document tabs, save/cancel buttons

Background: light gray (#F8FAFB), panels: white with subtle shadows,
accent color: coral (#FF6B6B) for selections and CTAs.

Style: Clean medical interface, vector tooth illustration,
modern healthcare UX, similar to Dentrix or Curve Dental but more modern.

--ar 16:9 --v 6 --style raw
```

---

## 5. AI-Ассистент OrisAI (Chat Panel)

### Промпт:

```
AI assistant chat interface for Orisios dental software, floating chat panel UI,
modern conversational interface design.

Main screen: Dashboard with slight blur/dim overlay on left side

Right side: Chat panel (400px width) with:
- Header: "OrisAI" title with brain/AI icon in teal, minimize and close buttons
- Chat area with message bubbles:
  - AI messages: light gray background, left-aligned, teal icon
  - User messages: coral (#FF6B6B) background, right-aligned, white text

Example conversation:
- AI: "Hi! How can I help you today?"
- User: "Who is scheduled for tomorrow?"
- AI: "You have 8 patients scheduled for tomorrow:" followed by a formatted list

- Quick action chips below: "Schedule", "Find Patient", "Report", "Analytics"
- Input field at bottom with microphone icon and send button (coral)

Panel styling: White background, subtle shadow on left edge,
rounded top-left corner (16px), smooth slide-in animation implied.

Color accents: Coral #FF6B6B for user messages and send button,
Deep Teal #0D7377 for AI icon, Light Teal #45B7A0 for quick action chips.

Style: Modern chat UI like Intercom or ChatGPT, friendly and professional,
clean typography, high-fidelity mockup.

--ar 9:16 --v 6 --style raw
```

---

## 6. Мобильная версия (Mobile App)

### Промпт:

```
Mobile app UI design for Orisios dental clinic management, iOS/Android smartphone interface,
companion app for dental software.

Phone frame: Modern smartphone mockup (iPhone 15 style)

Screen content - Home/Dashboard:
- Top: "Good morning, Doctor!" greeting, notification bell icon
- Orisios logo with D-fingerprint icon
- Today's summary cards (horizontal scroll):
  - "8 appointments" with calendar icon
  - "45,600₽" revenue
  - "3 tasks" pending

- "Next Appointment" card:
  - "10:00 - Petrov I.A."
  - "Initial consultation"
  - Coral "Open" button

- "Today's Schedule" list:
  - Time slots with patient names
  - Color-coded status dots (coral, saffron, light teal)

Bottom navigation bar (5 items):
- Home (active, coral), Calendar, Patients, OrisAI, Profile
- Deep teal background (#0D7377)

Color palette: Coral accents #FF6B6B, light gray background #F8FAFB,
white cards, deep teal navigation bar.

Style: Clean mobile UI, iOS design guidelines, rounded corners,
native feel, high-fidelity mockup, app store quality.

--ar 9:19 --v 6 --style raw
```

---

## 7. Login / Авторизация

### Промпт:

```
Login page UI design for Orisios dental clinic software, web application sign-in screen,
modern authentication interface.

Split layout:
- Left side (60%): Decorative illustration area
  - Abstract dental/medical themed illustration
  - Soft teal (#0D7377) and coral (#FF6B6B) gradient shapes
  - D-fingerprint logo pattern in background
  - "Orisios" logo large and centered
  - Tagline: "Smart dental practice management"

- Right side (40%): Login form on white background
  - "Sign In" heading (near black #1A1A2E)
  - Email input field with icon
  - Password input field with show/hide toggle
  - "Remember me" checkbox
  - "Sign In" button - full width, coral (#FF6B6B)
  - "Forgot password?" link below
  - Divider: "or"
  - "Sign in with Google" secondary button
  - Bottom: "Don't have an account? Sign up" link

Input fields: Rounded corners (8px), light gray border,
focus state with coral border.

Overall: Clean, trustworthy, professional healthcare login,
teal and coral color palette, welcoming feel.

--ar 16:9 --v 6 --style raw
```

---

## 8. Биллинг и Счета (Billing)

### Промпт:

```
Billing and invoicing interface for Orisios dental software,
financial management dashboard, modern web application UI.

Layout:
- Left sidebar: deep teal (#0D7377) navigation, "Billing" active
- Top section: Financial summary cards
  - "Monthly Revenue: 1,250,000₽" with growth indicator
  - "Outstanding: 45,600₽"
  - "Paid This Month: 890,000₽"

Main content:
- Tab navigation: "Invoices" | "Payments" | "Insurance Claims" | "Reports"
- Invoices table with columns:
  - Invoice #, Patient Name, Date, Amount, Status, Actions
  - Status badges: Paid (light teal), Pending (saffron), Overdue (coral)

- Right panel: "Create Invoice" quick form
  - Patient selector dropdown
  - Services checklist with prices
  - Total calculation
  - "Generate Invoice" coral button

Filter bar: Date range picker, status filter, search

Color palette: Deep Teal #0D7377, Coral #FF6B6B for overdue/CTA,
Light Teal #45B7A0 for paid status, Saffron #F2CC8F for pending.

Style: Clean financial dashboard, spreadsheet-like data presentation,
professional and trustworthy, high-fidelity mockup.

--ar 16:9 --v 6 --style raw
```

---

## 9. Настройки (Settings)

### Промпт:

```
Settings page UI design for Orisios dental software,
configuration and preferences interface, modern web application.

Layout:
- Left sidebar: deep teal (#0D7377) navigation, "Settings" active with gear icon
- Settings sidebar (secondary): Category list
  - Profile, Clinic Info, Team Members, Notifications,
  - Integrations, Security, Billing Plan, API

Main content - "Clinic Information" selected:
- Section: Clinic Details
  - Logo upload area
  - Clinic name input
  - Address fields
  - Phone, Email

- Section: Working Hours
  - Day-by-day schedule toggles
  - Time range selectors

- Section: Appointment Settings
  - Default duration dropdown
  - Buffer time between appointments
  - Online booking toggle (with coral switch when ON)

Bottom: "Save Changes" coral button, "Cancel" secondary button

Color palette: Deep Teal sidebar, Coral for active toggles and save button,
Light gray background, White form cards.

Style: Clean settings interface like Stripe or Linear,
organized sections, clear hierarchy, high-fidelity mockup.

--ar 16:9 --v 6 --style raw
```

---

## 10. Аналитика и Отчёты (Analytics)

### Промпт:

```
Analytics dashboard for Orisios dental software, data visualization interface,
business intelligence view, modern web application UI.

Layout:
- Left sidebar: deep teal (#0D7377) navigation, "Analytics" active
- Top bar: Date range selector, Compare toggle, Export button

Main content - Grid of charts:
Row 1:
- Revenue trend line chart (teal line, coral for comparison period)
- Patient acquisition funnel (horizontal bar chart)

Row 2:
- Appointments by procedure type (donut chart with teal/coral segments)
- Doctor performance table (visits, revenue, avg rating)

Row 3:
- Peak hours heatmap (calendar-style, teal gradient intensity)
- Patient retention rate (big number with trend arrow)

Sidebar panel: "Key Insights"
- AI-generated bullet points with icons
- "Revenue up 15% vs last month"
- "Most popular: Teeth Cleaning"
- "Busiest day: Tuesday"

Color palette: Deep Teal #0D7377 for primary data,
Coral #FF6B6B for highlights/alerts, Light Teal #45B7A0 for positive trends,
Saffron #F2CC8F for warnings.

Style: Modern analytics dashboard like Amplitude or Mixpanel,
clean data visualization, professional charts, high-fidelity mockup.

--ar 16:9 --v 6 --style raw
```

---

## 11. Полный набор экранов (UI Kit Preview)

### Промпт:

```
Orisios dental clinic management software UI kit preview, multiple screens showcase,
modern SaaS application design system.

Artboard showing 8 screens arranged in 2 rows of 4:
Row 1: Dashboard, Calendar/Schedule, Patient List, Patient Profile
Row 2: Dental Chart, Billing/Invoices, Analytics, Settings

All screens sharing consistent design system:
- Color palette Orisios: Deep Teal #0D7377, Coral #FF6B6B,
  Light Teal #45B7A0, Saffron #F2CC8F, Near Black #1A1A2E
- Left sidebar navigation (deep teal) consistent across all screens
- White content cards with subtle shadows
- Coral primary buttons and accents
- Inter/Satoshi typography
- Rounded corners (8px)
- Consistent spacing and grid
- Orisios logo with D-fingerprint icon in header

Style: Figma/Sketch UI kit presentation, portfolio quality,
dribbble shot layout, clean arrangement with subtle background,
high-fidelity mockups, professional SaaS design showcase.

--ar 4:3 --v 6 --style raw
```

---

## Советы по генерации

### Для Midjourney:
- Добавляйте `--ar 16:9` для desktop, `--ar 9:16` для mobile
- Используйте `--v 6` для последней версии
- `--style raw` для более точного следования промпту
- `--no realistic photos, 3d render` чтобы избежать фотореализма

### Для DALL-E 3:
- Начинайте с "UI design" или "Interface design"
- Указывайте "flat design, vector style"
- Добавляйте "Figma mockup quality"

### Для Stable Diffusion / Leonardo:
- Используйте модели, обученные на UI (например, ui_design_xl)
- Negative prompt: "realistic, 3d, photo, blurry, low quality"
- CFG scale: 7-9 для UI работает лучше

### Общие рекомендации:
1. Генерируйте несколько вариантов и комбинируйте лучшие элементы
2. Используйте результат как референс для Figma, не как финальный дизайн
3. Цвета могут отличаться — корректируйте в редакторе
4. Текст на изображениях часто генерируется с ошибками — это нормально

---

## Быстрые промпты (Short versions)

### Dashboard:
```
Orisios dental SaaS dashboard, two-column layout, teal #0D7377 sidebar (240px),
main area (1200px) with KPI cards, live timeline, grid layout: appointments 66% + tasks/actions 33%,
weekly chart bottom, coral #FF6B6B accents, unified scroll, Linear-style modern UI --ar 16:9 --v 6
```

### Calendar:
```
Orisios dental appointment calendar, weekly view, coral status indicators,
teal sidebar, light gray background, modern healthcare design --ar 16:9 --v 6
```

### Mobile:
```
Orisios dental clinic mobile app, iOS design, coral accents, teal navigation,
appointment list, OrisAI button, clean modern interface --ar 9:19 --v 6
```

### Patient Profile:
```
Orisios patient profile page, dental chart preview, visit history,
teal sidebar, coral CTA buttons, medical records interface --ar 16:9 --v 6
```

### Billing:
```
Orisios billing dashboard, invoice table, payment status badges,
financial metrics cards, teal and coral color scheme --ar 16:9 --v 6
```

### Analytics:
```
Orisios analytics dashboard, revenue charts, patient statistics,
data visualization, teal primary, coral highlights --ar 16:9 --v 6
```

---

## Экраны для генерации (Checklist)

| # | Экран | Формат | Статус |
|---|-------|--------|--------|
| 1 | Dashboard | 16:9 | ✅ Сгенерирован |
| 2 | Calendar/Schedule | 16:9 | |
| 3 | Patient Profile | 16:9 | |
| 4 | Dental Chart | 16:9 | |
| 5 | OrisAI Chat | 9:16 | |
| 6 | Mobile App | 9:19 | |
| 7 | Login | 16:9 | |
| 8 | Billing | 16:9 | |
| 9 | Settings | 16:9 | |
| 10 | Analytics | 16:9 | |
| 11 | UI Kit Preview | 4:3 | |

---

*Документ обновлён: 8 января 2026*
*Бренд: Orisios*
*Палитра: Deep Teal + Coral*
