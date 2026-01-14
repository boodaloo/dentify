# Orisios: Ключевые экраны для первого прототипа (Desktop)

## Приоритет разработки

Экраны разделены на три уровня приоритета:
- **P0** — Критичные (MVP, без них приложение не имеет смысла)
- **P1** — Важные (нужны для полноценной работы)
- **P2** — Желательные (улучшают UX, но можно отложить)

---

## P0: Критичные экраны (MVP)

### 1. Авторизация и вход
- **Login Screen** — вход по email/телефону + пароль
- **Password Recovery** — восстановление пароля

### 2. Главный дашборд
- Обзор дня: количество пациентов, записи, задачи
- Быстрые действия: новая запись, поиск пациента
- Уведомления и напоминания
- Статистика за период (выручка, количество приёмов)

### 3. Расписание (Calendar/Schedule)
- Календарь на день/неделю/месяц
- Визуализация записей по врачам (если несколько)
- Создание/редактирование записи
- Drag-and-drop для переноса записей
- Цветовая кодировка типов приёмов

### 4. Список пациентов (Patient List)
- Таблица с поиском и фильтрацией
- Быстрый поиск по имени, телефону, ID
- Сортировка по дате последнего визита
- Кнопка добавления нового пациента

### 5. Карточка пациента (Patient Profile)
- **Основная информация**: ФИО, контакты, дата рождения, аллергии
- **История визитов**: список всех приёмов с датами
- **Зубная формула** (Dental Chart): интерактивная схема 32 зубов
- **План лечения**: текущий и завершённые
- **Документы**: загруженные файлы, снимки
- **Финансы**: баланс, история оплат

### 6. Зубная формула (Dental Chart)
- Интерактивная схема взрослых/детских зубов
- Отметки состояния каждого зуба (кариес, пломба, удалён, имплант и т.д.)
- История изменений по каждому зубу
- Возможность добавить заметку к зубу

### 7. Форма приёма (Appointment/Visit Form)
- Выбор пациента (или создание нового)
- Выбор врача и кабинета
- Выбор услуг из прайс-листа
- Заметки врача
- Прикрепление файлов (рентген, фото)
- Итоговая сумма и оплата

---

## P1: Важные экраны

### 8. Прайс-лист услуг (Services/Pricing)
- Категории услуг (терапия, хирургия, ортодонтия и т.д.)
- Название, код, цена, длительность
- Редактирование и добавление услуг

### 9. Сотрудники (Staff Management)
- Список врачей и администраторов
- Профиль сотрудника: специализация, график работы
- Назначение ролей и прав доступа

### 10. Финансы и отчёты (Finance/Reports)
- Отчёт по выручке за период
- Отчёт по врачам
- Отчёт по услугам
- Дебиторская задолженность пациентов

### 11. Настройки клиники (Clinic Settings)
- Информация о клинике (название, адрес, реквизиты)
- Рабочие часы
- Кабинеты
- Шаблоны уведомлений (SMS, email)

---

## P2: Желательные экраны

### 12. Уведомления (Notifications Center)
- История всех уведомлений
- Настройка типов уведомлений

### 13. Склад/Материалы (Inventory)
- Учёт расходных материалов
- Уведомления о низком остатке

### 14. Документы и шаблоны (Documents)
- Шаблоны договоров, согласий
- Генерация документов для пациента

### 15. Интеграции (Integrations)
- Подключение онлайн-кассы
- Интеграция с лабораториями
- SMS/Email провайдеры

---

## Wireframe Flow (порядок проектирования)

```
1. Login → 2. Dashboard → 3. Schedule (Calendar)
                              ↓
                         4. Patient List → 5. Patient Profile
                                                ↓
                                           6. Dental Chart
                                                ↓
                                           7. Appointment Form
```

---

## Примеры для вдохновения

### Figma Community (бесплатные UI Kit)

| Название | Описание | Ссылка |
|----------|----------|--------|
| **Free UI Dental App Kit** | Готовый UI Kit для стоматологического приложения | [Figma](https://www.figma.com/community/file/1052564559032616008) |
| **Preclinic - Medical Dashboard** | Бесплатный UI Kit для клиник: пациенты, врачи, расписание | [Figma](https://www.figma.com/community/file/1539596225682349141) |
| **Dental App** | Дизайн стоматологического приложения | [Figma](https://www.figma.com/community/file/1309229401500242249) |
| **Dental Medical Website Kit** | 30 страниц + style guide | [Figma](https://www.figma.com/community/file/1264182352719298610) |
| **DentalPro UI Kit** | 15+ экранов, светлая и тёмная тема | [Figma](https://www.figma.com/community/file/1520495923831851392) |
| **Dental Clinic Application** | Полное приложение для клиники | [Figma](https://www.figma.com/community/file/1251815090393340953) |

### Dribbble и Behance (вдохновение)

| Платформа | Описание | Ссылка |
|-----------|----------|--------|
| **Dribbble** | Коллекция Dental App дизайнов (78+ работ) | [Dribbble](https://dribbble.com/tags/dental-app) |
| **Dribbble** | Dental UI дизайны | [Dribbble](https://dribbble.com/tags/dental-ui) |
| **Dribbble** | Dental Clinic App UI Design | [Dribbble](https://dribbble.com/search/dental-clinic-app-ui-design) |
| **Behance** | Dental UI Design проекты | [Behance](https://www.behance.net/search/projects/dental%20ui%20design) |
| **Behance** | Dental App Design проекты | [Behance](https://www.behance.net/search/projects/dental%20app%20design) |
| **Behance** | Dental Clinic Web UI/UX Design | [Behance](https://www.behance.net/gallery/127189541/Dental-Clinic-Web-UIUX-Design) |

### UX Case Studies (полезно для понимания логики)

| Название | Описание | Ссылка |
|----------|----------|--------|
| **TDO Software Redesign** | Детальный разбор редизайна ПО для эндодонтии | [Medium](https://medium.com/@sdb.j/tdo-software-redesign-a-ux-case-study-61b4582e21c8) |
| **Bloom Dental** | Создание масштабируемого решения с нуля | [Medium](https://medium.com/design-bootcamp/bloom-dental-a-ux-ui-case-study-33f7c413b8f8) |
| **EM Dental** | Процесс создания продукта для управления практикой | [Fuselab](https://www.fuselabcreative.com/work/em-dental/) |
| **E-doctor Appointment App** | Полный путь проектирования: от исследования до финальных экранов | [Behance](https://www.behance.net/gallery/125243355/E-doctor-Appointment-App-UX-Case-Study) |
| **7healthPro** | Создание простой в навигации системы управления клиникой | [Revival Pixel](https://www.revivalpixel.com/blog/7healthpro-a-clinic-management-system-with-multiple-modules-and-features/) |
| **Appointment Scheduling App** | UX/UI Case Study для клиник | [Case Study](https://dupovacemir.com/appointment-scheduling-app-for-clinics-ux-ui-case-study/) |
| **Doctor Easy App** | UX Case Study: приложение для записи к врачу | [Medium](https://medium.com/design-bootcamp/ux-case-study-doctor-easy-doctors-appointment-booking-app-a2bd7042dc66) |
| **50 Healthcare UX/UI Trends** | 50 примеров трендов в медицинском UI | [KoruUX](https://www.koruux.com/50-examples-of-healthcare-UI/) |

### Конкретные примеры UI (Dribbble)

| Название | Описание | Ссылка |
|----------|----------|--------|
| **Medical Dashboard** | Чистый дашборд для управления пациентами | [Dribbble](https://dribbble.com/shots/17208075-Medical-Dashboard-for-Effective-Patient-Management) |
| **Circledoc CRM** | Дашборд в стиле CRM для клиники | [Dribbble](https://dribbble.com/shots/15839213-Circledoc-Medical-CRM-Dashboard) |
| **Doctor's Schedule** | Интуитивный интерфейс календаря врача | [Dribbble](https://dribbble.com/shots/20215483-Doctor-s-schedule-Calendar-view-Clinic-management-app) |
| **Patient Dashboard** | Персонализированный дашборд для пациента | [Dribbble](https://dribbble.com/shots/16768972-Patient-Dashboard-UI-for-Personalized-Digital-Healthcare) |
| **Dental Dashboard Concept** | Яркий дашборд для стоматологии | [Dribbble](https://dribbble.com/shots/15382607-Dental-Dashboard-Concept) |
| **Medical Invoice** | Простой интерфейс для счетов и оплаты | [Dribbble](https://dribbble.com/shots/19932145-Medical-invoice-Billing-Payment-Patient-management-app) |
| **Patient Card** | Минималистичный дизайн карточки пациента | [Dribbble](https://dribbble.com/shots/16520935-Patient-Card-Medical-Dashboard) |
| **Dental App Mobile** | Современное мобильное приложение для стоматологии | [Dribbble](https://dribbble.com/shots/19999636-Dental-App-Mobile-Design) |

### Дополнительные UI Kit

| Название | Описание | Ссылка |
|----------|----------|--------|
| **HealthMate UI Kit** | 40+ экранов для записи к врачу | [UI8](https://ui8.net/ak-studio/products/healthmate---doctor-appointment-booking-app-ui-kit) |
| **HealHub Figma Kit** | Хорошо структурированные компоненты и экраны | [Figma](https://www.figma.com/community/file/1123519864213593361) |
| **Doctor Appointment UI Kit** | 22+ мобильных экранов | [UI8](https://ui8.net/uix-arafat/products/doctor-appointment--mobile-app-uiux-design-kit) |
| **Dentino Figma Template** | Шаблон для стоматологической клиники | [ThemeForest](https://themeforest.net/item/dentino-dental-clinic-template-for-figma/28356067) |

### Статьи и лучшие практики

| Название | Описание | Ссылка |
|----------|----------|--------|
| **Healthcare App UI/UX Best Practices** | Принципы простоты, доступности и безопасности | [Procreator](https://procreator.design/blog/best-practices-for-healthcare-app-ui-ux-design/) |
| **User-Friendly Patient Portal** | Ключевые функции и дизайн пациентских порталов | [Koru UX](https://koruux.com/blog/designing-a-user-friendly-patient-portal/) |
| **HIPAA Compliant App Guide** | Безопасность медицинских данных в дизайне | [Tateeda](https://tateeda.com/blog/hipaa-compliant-app-development-guide/) |
| **UI/UX Design for SaaS** | Руководство по дизайну SaaS-платформ | [Fuselab](https://www.fuselabcreative.com/blog/ui-ux-design-for-saas-a-complete-guide/) |
| **Ultimate Dashboard Design Guide** | Принципы эффективных информационных панелей | [Proto.io](https://blog.proto.io/the-ultimate-guide-to-dashboard-design/) |

---

## Рекомендации по дизайну

### Цветовая палитра
- **Основной цвет**: оттенки синего или бирюзового (ассоциация с медициной, чистотой)
- **Акцентный цвет**: для кнопок действий и важных элементов
- **Нейтральные**: серые оттенки для фона и текста
- **Семантические**: зелёный (успех), красный (ошибка/срочно), жёлтый (предупреждение)

### Типографика
- Чистый sans-serif шрифт (Inter, Nunito, Open Sans)
- Хорошая читаемость для длительной работы
- Чёткая иерархия заголовков

### Компоненты UI Kit
- Кнопки (primary, secondary, danger)
- Инпуты и формы
- Таблицы с сортировкой
- Модальные окна
- Карточки
- Навигация (sidebar)
- Календарь/Date picker
- Зубная формула (кастомный компонент)

---

## Следующие шаги

1. [ ] Изучить примеры из ссылок выше
2. [ ] Создать moodboard в Figma
3. [ ] Определить цветовую палитру и типографику
4. [ ] Создать базовый UI Kit (кнопки, инпуты, карточки)
5. [ ] Спроектировать wireframes для P0 экранов
6. [ ] Создать hi-fi дизайн для P0 экранов
7. [ ] Сделать кликабельный прототип
