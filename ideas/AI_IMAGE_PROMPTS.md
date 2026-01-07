# DentApp: Промпты для генерации UI изображений

> Промпты оптимизированы для Midjourney, DALL-E 3, Stable Diffusion и Leonardo AI

---

## 1. Главный Dashboard (Desktop)

### Промпт (English):

```
Modern dental clinic management software dashboard UI design, desktop web application,
clean and professional interface with warm color palette.

Layout: Left sidebar navigation (dark cobalt blue #3D5A80) with icons and labels,
main content area with cream/sand background (#F4F1DE).

Header: Logo "DentApp" on the left, search bar in center, notification bell and
user avatar on the right.

Main content includes:
- Top row: 4 metric cards showing revenue (45,600₽), patients count (12),
  appointments (8/12), average time (42 min) - white cards with subtle shadows
- Middle section: "Upcoming Appointments" list with patient names, times,
  and coral (#E07A5F) status indicators on the left edge of each row
- Right sidebar: "Tasks" checklist and "Quick Actions" buttons
- Bottom: Weekly revenue chart with coral accent line

Color palette "Marina at Sunset":
- Primary accent: Coral/Terracotta #E07A5F (buttons, active states, CTAs)
- Secondary: Cobalt blue #3D5A80 (sidebar, headers)
- Background: Warm sand #F4F1DE
- Cards: Pure white #FFFFFF
- Text: Charcoal #3D405B
- Accent details: Saffron yellow #F2CC8F

Style: Modern SaaS dashboard, Figma-quality, clean typography (Inter or SF Pro),
rounded corners (8px), subtle shadows, plenty of whitespace, professional but friendly.

NO: stock photos, realistic people, 3D renders
YES: flat design, vector style, UI mockup, high fidelity, dribbble quality

--ar 16:9 --v 6 --style raw
```

### Промпт (Русский вариант для русскоязычных генераторов):

```
Дизайн интерфейса современного веб-приложения для управления стоматологической клиникой,
desktop версия, dashboard главная страница.

Левая боковая панель навигации тёмно-синего цвета (cobalt #3D5A80) с иконками меню.
Основная область с тёплым кремовым фоном (#F4F1DE).

Верхняя панель: логотип "DentApp", строка поиска, иконка уведомлений, аватар пользователя.

Контент:
- 4 карточки метрик: выручка, пациенты, записи, среднее время приёма
- Список ближайших записей с коралловыми индикаторами (#E07A5F)
- Блок задач и быстрых действий справа
- График выручки за неделю

Цветовая палитра: коралловый акцент #E07A5F, синий sidebar #3D5A80,
песочный фон #F4F1DE, белые карточки.

Стиль: современный SaaS дашборд, плоский дизайн, качество Dribbble/Behance,
скруглённые углы, мягкие тени, профессионально но дружелюбно.
```

---

## 2. Расписание (Calendar View)

### Промпт:

```
Dental clinic appointment scheduling interface, weekly calendar view,
modern web application UI design.

Layout:
- Left sidebar: dark cobalt blue (#3D5A80) navigation with calendar icon active
- Top bar: week selector with arrows, "Today" button, view toggles (Day/Week/Month)
- Main area: 7-column calendar grid showing Monday to Sunday
- Time slots on the left (08:00 - 20:00)

Calendar appointments shown as colored blocks:
- Coral (#E07A5F) for confirmed appointments
- Saffron (#F2CC8F) for pending
- Sage green (#81B29A) for completed
- Each block shows: time, patient name, procedure type

Right panel: Selected appointment details card with patient info,
"Start Visit" coral button, "Reschedule" secondary button.

Background: warm sand (#F4F1DE), cards: white,
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
detailed patient record interface.

Layout:
- Left sidebar: cobalt blue (#3D5A80) navigation, "Patients" section active
- Main content split into sections:

Top section - Patient header:
- Large avatar placeholder (circle)
- Patient name "Иванов Петр Алексеевич"
- Age, phone number, email
- Tags: "VIP", "Аллергия" in saffron (#F2CC8F) badges
- "Edit" button (secondary), "New Visit" button (coral #E07A5F primary)

Middle section - Tabs:
- "Overview" | "Dental Chart" | "Visits" | "Documents" | "Billing"
- Active tab underlined with coral

Content area:
- Left column: Visit history timeline with dates and procedures
- Right column: Current treatment plan card, upcoming appointment card
- Medical notes section with text

Dental chart preview: Small interactive tooth diagram (32 teeth schematic)

Color palette: Coral accents #E07A5F, Cobalt sidebar #3D5A80,
Sand background #F4F1DE, White cards, Charcoal text #3D405B

Style: Medical SaaS interface, clean and organized, HIPAA-compliant feel,
professional healthcare design, high fidelity UI mockup.

--ar 16:9 --v 6 --style raw
```

---

## 4. Зубная формула (Dental Chart)

### Промпт:

```
Interactive dental chart interface, tooth diagram UI for dentist software,
modern web application design.

Central element: Adult teeth diagram showing all 32 teeth in anatomical layout,
upper jaw (16 teeth) and lower jaw (16 teeth) in arch formation.
Clean vector illustration style, each tooth clickable/selectable.

Tooth status colors:
- Healthy: light gray outline
- Selected: coral highlight (#E07A5F)
- Cavity: orange marker
- Filled: blue marker (#3D5A80)
- Crown: gold/saffron (#F2CC8F)
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

Background: warm sand (#F4F1DE), panels: white with subtle shadows,
accent color: coral (#E07A5F) for selections and CTAs.

Style: Clean medical interface, vector tooth illustration,
modern healthcare UX, similar to Dentrix or Curve Dental but more modern.

--ar 16:9 --v 6 --style raw
```

---

## 5. AI-Ассистент (Chat Panel)

### Промпт:

```
AI assistant chat interface for dental software, floating chat panel UI,
modern conversational interface design.

Main screen: Dashboard with slight blur/dim overlay on left side

Right side: Chat panel (400px width) with:
- Header: "DentAI" title with robot icon, minimize and close buttons
- Chat area with message bubbles:
  - AI messages: light sand background, left-aligned
  - User messages: coral (#E07A5F) background, right-aligned, white text

Example conversation:
- AI: "Чем могу помочь?"
- User: "Кто записан на завтра?"
- AI: "На завтра записано 8 пациентов:" followed by a formatted list

- Quick action chips below: "Расписание", "Найти пациента", "Отчёт"
- Input field at bottom with microphone icon and send button (coral)

Panel styling: White background, subtle shadow on left edge,
rounded top-left corner (16px), smooth slide-in animation implied.

Color accents: Coral for user messages and send button,
Cobalt (#3D5A80) for AI icon, Saffron (#F2CC8F) for quick action chips.

Style: Modern chat UI like Intercom or ChatGPT, friendly and professional,
clean typography, high-fidelity mockup.

--ar 9:16 --v 6 --style raw
```

---

## 6. Мобильная версия (Mobile App)

### Промпт:

```
Mobile app UI design for dental clinic management, iOS/Android smartphone interface,
companion app for dental software.

Phone frame: Modern smartphone mockup (iPhone 15 style)

Screen content - Home/Dashboard:
- Top: "Добрый день, Доктор!" greeting, notification bell icon
- Today's summary cards (horizontal scroll):
  - "8 записей" with calendar icon
  - "45,600₽" revenue
  - "3 задачи" pending

- "Ближайшая запись" card:
  - "10:00 - Петров И.А."
  - "Первичный осмотр"
  - Coral "Открыть" button

- "Записи на сегодня" list:
  - Time slots with patient names
  - Color-coded status dots (coral, saffron, sage)

Bottom navigation bar (5 items):
- Home (active, coral), Calendar, Patients, Chat (AI), Profile
- Dark cobalt background (#3D5A80)

Color palette: Coral accents #E07A5F, warm sand background #F4F1DE,
white cards, cobalt navigation bar.

Style: Clean mobile UI, iOS design guidelines, rounded corners,
native feel, high-fidelity mockup, app store quality.

--ar 9:19 --v 6 --style raw
```

---

## 7. Login / Авторизация

### Промпт:

```
Login page UI design for dental clinic software, web application sign-in screen,
modern authentication interface.

Split layout:
- Left side (60%): Decorative illustration area
  - Abstract dental/medical themed illustration
  - Soft coral (#E07A5F) and cobalt (#3D5A80) gradient shapes
  - Subtle tooth icons pattern in background
  - "DentApp" logo large and centered
  - Tagline: "Управление клиникой просто"

- Right side (40%): Login form on white background
  - "Вход в систему" heading (charcoal #3D405B)
  - Email input field with icon
  - Password input field with show/hide toggle
  - "Запомнить меня" checkbox
  - "Войти" button - full width, coral (#E07A5F)
  - "Забыли пароль?" link below
  - Divider: "или"
  - "Войти через Google" secondary button
  - Bottom: "Нет аккаунта? Регистрация" link

Input fields: Rounded corners (8px), light gray border,
focus state with coral border.

Overall: Clean, trustworthy, professional healthcare login,
warm color palette, welcoming feel.

--ar 16:9 --v 6 --style raw
```

---

## 8. Полный набор экранов (UI Kit Preview)

### Промпт:

```
Dental clinic management software UI kit preview, multiple screens showcase,
modern SaaS application design system.

Artboard showing 6 screens arranged in 2 rows of 3:
Row 1: Dashboard, Calendar/Schedule, Patient List
Row 2: Patient Profile, Dental Chart, Invoice/Billing

All screens sharing consistent design system:
- Color palette "Marina at Sunset": Coral #E07A5F, Cobalt #3D5A80,
  Sand #F4F1DE, Saffron #F2CC8F, Charcoal #3D405B
- Left sidebar navigation (cobalt blue) consistent across all screens
- White content cards with subtle shadows
- Coral primary buttons and accents
- Inter/SF Pro typography
- Rounded corners (8px)
- Consistent spacing and grid

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

### Dashboard (короткий):
```
Modern dental SaaS dashboard, coral #E07A5F and cobalt #3D5A80 color scheme,
warm sand background, metric cards, appointment list, clean UI, Figma quality --ar 16:9 --v 6
```

### Calendar (короткий):
```
Dental appointment calendar UI, weekly view, coral status indicators,
cobalt sidebar, warm cream background, modern healthcare design --ar 16:9 --v 6
```

### Mobile (короткий):
```
Dental clinic mobile app UI, iOS design, coral accents,
appointment list, bottom navigation, clean modern interface --ar 9:19 --v 6
```

---

*Документ создан: 7 января 2026*
*Палитра: Marina at Sunset*
