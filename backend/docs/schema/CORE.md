# Schema: Core Entities

> Основные сущности системы: клиники, пользователи, филиалы, пациенты.

---

## База: dentify_internal (Админка Dentify)

Управление компанией, клиентами, биллинг, поддержка.

```sql
-- Сотрудники Dentify
adm_staff
├── id
├── name
├── email
├── password_hash
├── role (admin | manager | support)
├── is_active
├── created_at
└── updated_at

-- Клиники (мастер-данные, источник clinic_id для dentify_app)
adm_clinics
├── id                        -- используется как clinic_id в dentify_app
├── name
├── legal_name
├── inn
├── address
├── contact_email
├── contact_phone
├── status (trial | active | suspended | cancelled)
├── subscription_plan_id
├── assigned_manager_id       -- FK → adm_staff
├── trial_ends_at
├── created_at
└── updated_at

-- Тарифные планы
adm_subscription_plans
├── id
├── name (Solo | Clinic | Enterprise)
├── price_monthly
├── price_yearly
├── max_users
├── max_patients
├── features (JSON)           -- какие фичи включены
├── is_active
└── created_at

-- Счета клиникам
adm_invoices
├── id
├── clinic_id
├── invoice_number
├── amount
├── currency
├── status (draft | pending | paid | overdue | cancelled)
├── issued_at
├── due_date
├── paid_at
└── created_at

-- Платежи
adm_payments
├── id
├── invoice_id
├── amount
├── method (card | bank_transfer | stripe)
├── external_id              -- ID в платёжной системе
├── paid_at
└── created_at

-- Feature flags для клиник
adm_clinic_features
├── clinic_id
├── feature_key
├── enabled
└── updated_at

-- Тикеты поддержки (Helpdesk)
adm_tickets
├── id
├── clinic_id
├── created_by_user_id       -- кто из клиники создал
├── assigned_to_staff_id     -- наш сотрудник
├── subject
├── priority (low | medium | high | critical)
├── status (open | in_progress | waiting | resolved | closed)
├── category_id
├── created_at
├── first_response_at        -- для SLA
├── resolved_at              -- для SLA
└── sla_breached (0 | 1)

-- Переписка по тикетам
adm_ticket_messages
├── id
├── ticket_id
├── author_type (staff | client)
├── author_id
├── message
├── attachments (JSON)       -- ссылки на S3
└── created_at

-- Категории тикетов
adm_ticket_categories
├── id
├── name (Billing | Technical | Feature request | Bug)
└── default_priority

-- Правила SLA
adm_sla_rules
├── id
├── priority
├── first_response_hours     -- 1ч для critical
├── resolution_hours         -- 4ч для critical
└── subscription_plan_id     -- разный SLA для разных тарифов

-- Аудит действий
adm_audit_logs
├── id
├── staff_id
├── action
├── entity_type
├── entity_id
├── old_value (JSON)
├── new_value (JSON)
└── created_at

-- Аналитика (события)
adm_analytics_events
├── id
├── clinic_id
├── event_type
├── payload (JSON)
└── created_at
```

---

## База: dentify_app — Филиалы

Клиника может иметь несколько филиалов. Каждый филиал — это физическая локация с адресом, кабинетами и расписанием.

### UI: Переключатель филиалов

```
┌─────────────────────────────────────────────────────────────┐
│  🦷 Dentify    [■ ЛЕН Филиал на Ленина ▼]    🔔  👤 Иванов │
├─────────────────────────────────────────────────────────────┤
│                                                             │
```

**При клике — dropdown:**
```
┌──────────────────────────────┐
│ ■ ЛЕН  Филиал на Ленина   ✓  │  ← текущий (цвет филиала)
│ ■ ЦНТ  Центральный           │
│ ■ ТЦ1  Филиал в ТЦ           │
├──────────────────────────────┤
│ ◉ Все филиалы                │  ← если есть доступ ко всем
└──────────────────────────────┘
```

### Визуальные индикаторы

- **Цветная плашка** в header с названием филиала
- **Короткий код** (3-4 буквы) для компактности
- При переключении можно **подсветить sidebar** цветом филиала
- Цвет настраивается владельцем

### Режим "Все филиалы"

Для владельцев и управляющих с доступом ко всем филиалам:

| Функция | Поведение |
|---------|-----------|
| Расписание | Показывает все филиалы (цветовая маркировка) |
| Список пациентов | Общий список с колонкой "Филиал" |
| Аналитика | Сводная по всем + разбивка по филиалам |
| Создание записи | Обязательно выбрать филиал |
| Создание пациента | Можно указать "домашний" филиал |

### Таблицы филиалов

```sql
-- Филиалы клиники [SOFT DELETE]
core_branches
├── id
├── clinic_id                -- ← RLS
├── name                     -- "Филиал на Ленина", "Центральный"
├── short_code               -- "ЛЕН", "ЦНТ" (для UI)
├── address
├── phone
├── color                    -- #FF6B6B для визуального различия
├── is_main (0 | 1)          -- главный филиал
├── is_active
├── is_deleted (0 | 1)       -- soft delete
├── deleted_at
└── created_at

-- Доступ пользователей к филиалам
core_user_branches
├── user_id
├── branch_id
├── is_default (0 | 1)       -- филиал по умолчанию при входе
└── access_level (full | read_only)

-- Кабинеты / кресла (для крупных клиник)
core_rooms
├── id
├── clinic_id                -- ← RLS
├── branch_id
├── name                     -- "Кабинет 1", "Кресло 3"
├── is_active
└── created_at
```

---

## База: dentify_app — Пользователи

```sql
-- Справочник специализаций врачей
core_specializations
├── id
├── clinic_id                -- ← RLS
├── name                     -- "Терапевт", "Хирург", "Ортодонт", "Ортопед"
├── sort_order
├── is_active
└── created_at

-- Пользователи клиники [SOFT DELETE]
core_users
├── id
├── clinic_id                -- ← RLS
├── email (UNIQUE globally)  -- для логина
├── password_hash
├── name
├── phone
├── role (doctor | admin)
├── is_owner (0 | 1)         -- владелец клиники (макс. 2)
├── specialization_id        -- FK → core_specializations (для врачей)
├── is_active
├── failed_attempts          -- для rate limiting
├── locked_until
├── last_login_at
├── is_deleted (0 | 1)       -- soft delete
├── deleted_at
├── created_at
└── updated_at
```

### Управление пользователями

- **Владелец (is_owner=1)** получает мастер-аккаунт при регистрации клиники
- Можно назначить **двух владельцев** (резерв на случай форс-мажора)
- Владелец создаёт пользователей в своей БД
- Владелец может разрешить/запретить вход каждому пользователю
- Передача владения — через поддержку Dentify

---

## База: dentify_app — Пациенты

```sql
-- Пациенты [SOFT DELETE]
core_patients
├── id
├── clinic_id                -- ← RLS
├── first_name
├── last_name
├── middle_name
├── birth_date
├── gender
├── allergies
├── notes
├── home_branch_id           -- "домашний" филиал (nullable)
├── created_by_user_id
├── is_deleted (0 | 1)       -- soft delete
├── deleted_at
├── created_at
└── updated_at

-- Контактные данные пациента (телефоны, email, адреса)
core_patient_contacts
├── id
├── clinic_id                -- ← RLS
├── patient_id
├── type (phone | email | address)
├── value                    -- "+79161234567", "ivan@mail.ru", "г. Москва, ул. Ленина 10-5"
├── label                    -- "Личный", "Рабочий", "Дом", "Родственник"
├── is_primary (0 | 1)       -- основной контакт этого типа
└── created_at

-- Примеры:
-- type=phone:   value="+79161234567", label="Личный", is_primary=1
-- type=phone:   value="+79031112233", label="Жена", is_primary=0
-- type=email:   value="ivan@mail.ru", label="Рабочий", is_primary=0
-- type=address: value="г. Москва, ул. Ленина, д. 10, кв. 5", label="Дом", is_primary=1

-- Комментарии по пациенту (в карточке)
core_patient_comments
├── id
├── clinic_id                -- ← RLS
├── patient_id
├── author_id                -- FK → core_users (кто написал)
├── content (TEXT)           -- текст комментария
├── is_pinned (0 | 1)        -- закреплённый комментарий (показывать первым)
├── created_at
└── updated_at

-- Лечащие врачи пациента
core_patient_doctors
├── id
├── clinic_id                -- ← RLS
├── patient_id
├── doctor_id                -- FK → core_users (role=doctor)
├── specialization_id        -- FK → core_specializations (специализация врача)
├── is_active (0 | 1)        -- активный лечащий врач
├── assigned_at              -- когда назначен
└── created_at

-- Ограничение: только один активный врач на специализацию
CREATE UNIQUE INDEX idx_core_patient_doctors_one_active_per_spec
ON core_patient_doctors (clinic_id, patient_id, specialization_id)
WHERE is_active = 1;

-- Пример: пациент Иванов
-- doctor_id=5, specialization=Терапевт,  is_active=1  ✓
-- doctor_id=7, specialization=Терапевт,  is_active=0  ✓ (лечил раньше)
-- doctor_id=8, specialization=Ортодонт,  is_active=1  ✓
-- doctor_id=9, specialization=Ортодонт,  is_active=1  ✗ ошибка!
```

---

## Настройки клиники

```sql
-- Настройки виджета онлайн-записи
core_widget_settings
├── clinic_id
├── api_key                  -- публичный ключ
├── allowed_domains
├── enabled
├── theme (JSON)
├── show_doctors
├── available_service_ids
└── updated_at

-- Настройки клиники
core_clinic_settings
├── id
├── timezone                 -- 'Europe/Moscow'
├── currency                 -- 'RUB'
├── date_format              -- 'DD.MM.YYYY'
├── time_format              -- '24h' | '12h'
├── appointment_duration_default  -- 30 (минут)
├── working_hours_start      -- '09:00'
├── working_hours_end        -- '21:00'
└── updated_at
```

---

## Поиск пациентов

### Проблема масштабирования

| Клиника | Пациентов | Решение |
|---------|-----------|---------|
| Маленькая | до 5,000 | PostgreSQL LIKE |
| Средняя | 5,000 - 50,000 | PostgreSQL + pg_trgm |
| Крупная сеть | 50,000 - 200,000 | PostgreSQL + pg_trgm (оптимизированный) |
| 200,000+ | Meilisearch | Отложено, пока не понадобится |

### Решение: pg_trgm (триграммы)

Расширение PostgreSQL для fuzzy search — находит совпадения даже с опечатками.

```sql
-- Включаем расширение
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Составной индекс для поиска по ФИО
CREATE INDEX idx_core_patients_fullname_trgm
ON core_patients USING gin (
  (lower(last_name || ' ' || first_name || ' ' || COALESCE(middle_name, '')))
  gin_trgm_ops
);

-- Индекс для поиска по телефону
CREATE INDEX idx_core_patients_phone_trgm
ON core_patients USING gin (phone gin_trgm_ops);
```

### Поисковый запрос

```sql
-- Поиск с опечатками и ранжированием
SELECT
  id, first_name, last_name, phone,
  similarity(lower(last_name || ' ' || first_name), lower(:query)) AS rank
FROM core_patients
WHERE
  clinic_id = :clinic_id
  AND is_deleted = 0
  AND (
    -- Fuzzy поиск по ФИО (порог 0.3)
    (lower(last_name || ' ' || first_name || ' ' || COALESCE(middle_name, ''))) % lower(:query)
    -- ИЛИ поиск по телефону (частичное совпадение)
    OR phone LIKE '%' || :phone_query || '%'
  )
ORDER BY rank DESC
LIMIT 20;
```

### Примеры fuzzy search

| Запрос | Найдёт |
|--------|--------|
| "Иванов Серге" | Иванов Сергей |
| "Петрова Ана" | Петрова Анна |
| "Сидоров" | Сидоров, Сидорова, Сидорович |
| "9161234567" | +7 (916) 123-45-67 |

### Поля для поиска

```
core_patients
├── last_name + first_name + middle_name  -- fuzzy (pg_trgm)
├── phone                                  -- fuzzy + exact
├── email                                  -- exact (ILIKE)
└── id                                     -- exact (номер карты)
```

### Настройки pg_trgm

```sql
-- Порог схожести (по умолчанию 0.3)
-- Меньше = больше результатов, но менее точных
SET pg_trgm.similarity_threshold = 0.3;

-- Проверить similarity между строками
SELECT similarity('Иванов', 'Иванова');  -- 0.7
SELECT similarity('Иванов', 'Петров');   -- 0.0
```

### Масштабирование (если понадобится)

Если pg_trgm станет узким местом (200k+ записей, медленные запросы):

```
Этап 2: Добавить Meilisearch
├── Отдельный сервис для поиска
├── Синхронизация через events/triggers
├── ~50ms на миллионах записей
└── Typo-tolerance из коробки
```
