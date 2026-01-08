# Dentify: Промпты для генерации UI изображений

> Промпты оптимизированы для Midjourney, DALL-E 3, Stable Diffusion и Leonardo AI
>
> **Бренд:** Dentify | **Обновлено:** 8 января 2026

---

## Цветовая палитра Dentify

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
Modern dental clinic management software dashboard UI design, desktop web application,
clean and professional interface with teal and coral color palette.

Layout: Left sidebar navigation (deep teal #0D7377) with icons and labels,
main content area with light gray background (#F8FAFB).

Header: "Dentify" logo with D-fingerprint icon on the left, search bar in center,
AI assistant button, notification bell and user avatar on the right.

Main content includes:
- Greeting: "Good morning, Dr. Johnson!" with date
- Top row: 4 metric cards showing revenue (45,600₽), patients count (12),
  appointments (8/12), average time (42 min) - white cards with subtle shadows
- Middle section: "Upcoming Appointments" list with patient names, times,
  and coral (#FF6B6B) status indicators on the left edge of each row
- Right sidebar: "Tasks" checklist and "Quick Actions" buttons
- Bottom: Weekly revenue mini-chart with teal accent line

Color palette Dentify:
- Primary: Deep Teal #0D7377 (sidebar, headers)
- Accent: Coral #FF6B6B (buttons, active states, CTAs)
- Secondary: Light Teal #45B7A0 (success, hover)
- Background: Light Gray #F8FAFB
- Cards: Pure white #FFFFFF
- Text: Near Black #1A1A2E

Style: Modern SaaS dashboard, Figma-quality, clean typography (Inter or Satoshi),
rounded corners (8px), subtle shadows, plenty of whitespace, professional but friendly.

NO: stock photos, realistic people, 3D renders
YES: flat design, vector style, UI mockup, high fidelity, dribbble quality

--ar 16:9 --v 6 --style raw
```

---

## 2. Расписание (Calendar View)

### Промпт:

```
Dental clinic appointment scheduling interface, weekly calendar view,
modern web application UI design for Dentify software.

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
detailed patient record interface for Dentify software.

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
Interactive dental chart interface, tooth diagram UI for Dentify dentist software,
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

## 5. AI-Ассистент DentAI (Chat Panel)

### Промпт:

```
AI assistant chat interface for Dentify dental software, floating chat panel UI,
modern conversational interface design.

Main screen: Dashboard with slight blur/dim overlay on left side

Right side: Chat panel (400px width) with:
- Header: "DentAI" title with brain/AI icon in teal, minimize and close buttons
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
Mobile app UI design for Dentify dental clinic management, iOS/Android smartphone interface,
companion app for dental software.

Phone frame: Modern smartphone mockup (iPhone 15 style)

Screen content - Home/Dashboard:
- Top: "Good morning, Doctor!" greeting, notification bell icon
- Dentify logo with D-fingerprint icon
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
- Home (active, coral), Calendar, Patients, DentAI, Profile
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
Login page UI design for Dentify dental clinic software, web application sign-in screen,
modern authentication interface.

Split layout:
- Left side (60%): Decorative illustration area
  - Abstract dental/medical themed illustration
  - Soft teal (#0D7377) and coral (#FF6B6B) gradient shapes
  - D-fingerprint logo pattern in background
  - "Dentify" logo large and centered
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
Billing and invoicing interface for Dentify dental software,
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
Settings page UI design for Dentify dental software,
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
Analytics dashboard for Dentify dental software, data visualization interface,
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
Dentify dental clinic management software UI kit preview, multiple screens showcase,
modern SaaS application design system.

Artboard showing 8 screens arranged in 2 rows of 4:
Row 1: Dashboard, Calendar/Schedule, Patient List, Patient Profile
Row 2: Dental Chart, Billing/Invoices, Analytics, Settings

All screens sharing consistent design system:
- Color palette Dentify: Deep Teal #0D7377, Coral #FF6B6B,
  Light Teal #45B7A0, Saffron #F2CC8F, Near Black #1A1A2E
- Left sidebar navigation (deep teal) consistent across all screens
- White content cards with subtle shadows
- Coral primary buttons and accents
- Inter/Satoshi typography
- Rounded corners (8px)
- Consistent spacing and grid
- Dentify logo with D-fingerprint icon in header

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
Dentify dental SaaS dashboard, teal #0D7377 sidebar, coral #FF6B6B accents,
metric cards, appointment list, AI button, clean modern UI --ar 16:9 --v 6
```

### Calendar:
```
Dentify dental appointment calendar, weekly view, coral status indicators,
teal sidebar, light gray background, modern healthcare design --ar 16:9 --v 6
```

### Mobile:
```
Dentify dental clinic mobile app, iOS design, coral accents, teal navigation,
appointment list, DentAI button, clean modern interface --ar 9:19 --v 6
```

### Patient Profile:
```
Dentify patient profile page, dental chart preview, visit history,
teal sidebar, coral CTA buttons, medical records interface --ar 16:9 --v 6
```

### Billing:
```
Dentify billing dashboard, invoice table, payment status badges,
financial metrics cards, teal and coral color scheme --ar 16:9 --v 6
```

### Analytics:
```
Dentify analytics dashboard, revenue charts, patient statistics,
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
| 5 | DentAI Chat | 9:16 | |
| 6 | Mobile App | 9:19 | |
| 7 | Login | 16:9 | |
| 8 | Billing | 16:9 | |
| 9 | Settings | 16:9 | |
| 10 | Analytics | 16:9 | |
| 11 | UI Kit Preview | 4:3 | |

---

*Документ обновлён: 8 января 2026*
*Бренд: Dentify*
*Палитра: Deep Teal + Coral*
