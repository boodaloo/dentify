# Dentify Backend Architecture

## Технологический стек

| Компонент | Технология |
|-----------|------------|
| API Framework | FastAPI |
| База данных | PostgreSQL |
| Драйвер БД | asyncpg (raw SQL) |
| Connection Pool | PgBouncer |
| **Кэширование** | **Redis** |
| **Очереди задач** | **Redis + Celery/ARQ** |
| Миграции | Alembic |
| Аутентификация | JWT |
| Файловое хранилище | S3 / MinIO |
| Мониторинг | Grafana + Prometheus + Sentry |

---

## Архитектура баз данных

```
┌─────────────────────────────────────────────────────────────┐
│                        FastAPI                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      PgBouncer                               │
│                  (один connection pool)                      │
└─────────┬───────────────────────────────────┬───────────────┘
          │                                   │
          ▼                                   ▼
┌─────────────────────┐         ┌─────────────────────────────┐
│  dentify_internal   │         │       dentify_app           │
│                     │         │                             │
│  • staff            │         │  • clinics                  │
│  • billing          │         │  • users      ← clinic_id   │
│  • subscriptions    │         │  • patients   ← clinic_id   │
│  • tickets          │         │  • appointments             │
│  • analytics        │         │  • ...                      │
│                     │         │                             │
│                     │         │  + Row Level Security       │
│                     │         │  + Partitioning             │
└─────────────────────┘         └─────────────────────────────┘
                                              │
                    ┌─────────────────────────┘
                    ▼
          ┌─────────────────┐
          │   S3 / MinIO    │
          │ (снимки, файлы) │
          └─────────────────┘
```

### Почему две БД, а не отдельная на клинику?

| Критерий | Отдельная БД на клинику | Одна БД + RLS |
|----------|-------------------------|---------------|
| Миграции | На каждую БД отдельно | Одна миграция на всех |
| Connection pool | По пулу на БД | Один пул |
| Бэкап | Отдельно каждую | Один pg_dump |
| Изоляция | Физическая | Логическая (RLS) |
| Масштаб | 500 БД = 500 проблем | 10 млн строк = ок |

**Расчёт:** 1000 клиник × 10,000 пациентов = 10 млн строк. PostgreSQL справляется.

### Принцип изоляции (Row Level Security)

```sql
-- Включаем RLS на таблице
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Политика: видишь только данные своей клиники
CREATE POLICY clinic_isolation ON patients
    USING (clinic_id = current_setting('app.current_clinic_id')::int);

-- Забыл WHERE clinic_id = ? — PostgreSQL сам отфильтрует!
```

### Партиционирование (для производительности)

```sql
-- Партиционирование по clinic_id
CREATE TABLE patients (
    id SERIAL,
    clinic_id INT NOT NULL,
    ...
) PARTITION BY HASH (clinic_id);

-- 16 партиций
CREATE TABLE patients_p0 PARTITION OF patients FOR VALUES WITH (MODULUS 16, REMAINDER 0);
CREATE TABLE patients_p1 PARTITION OF patients FOR VALUES WITH (MODULUS 16, REMAINDER 1);
-- ... и так далее
```

---

## Redis (Кэширование и очереди)

### Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                        FastAPI                               │
└───────┬─────────────────────────────────┬───────────────────┘
        │                                 │
        ▼                                 ▼
┌───────────────┐                 ┌───────────────┐
│   PostgreSQL  │                 │     Redis     │
│   (данные)    │                 │  (кэш/очереди)│
└───────────────┘                 └───────┬───────┘
                                          │
                                          ▼
                                  ┌───────────────┐
                                  │ Celery/ARQ    │
                                  │ (воркеры)     │
                                  └───────────────┘
```

### Что кэшируем

| Данные | TTL | Ключ | Почему |
|--------|-----|------|--------|
| Прайс-лист услуг | 1 час | `clinic:{id}:services` | Редко меняется, часто запрашивается |
| Расписание врачей | 15 мин | `clinic:{id}:schedules` | Быстрый доступ при записи |
| Свободные слоты | 5 мин | `clinic:{id}:slots:{date}` | Виджет онлайн-записи |
| Данные пользователя | 30 мин | `user:{id}:profile` | Не ходить в БД каждый запрос |
| Настройки клиники | 1 час | `clinic:{id}:settings` | Timezone, валюта и т.д. |
| Категории услуг | 2 часа | `clinic:{id}:categories` | Почти статичные данные |
| JWT blacklist | До истечения | `jwt:blacklist:{token_id}` | Logout, смена пароля |

### Реализация кэширования

```python
import redis.asyncio as redis
import json

class CacheService:
    def __init__(self):
        self.redis = redis.from_url("redis://localhost:6379")

    async def get_services(self, clinic_id: int) -> list:
        key = f"clinic:{clinic_id}:services"

        # Пробуем взять из кэша
        cached = await self.redis.get(key)
        if cached:
            return json.loads(cached)

        # Нет в кэше — идём в БД
        services = await db.fetch("""
            SELECT * FROM services
            WHERE clinic_id = $1 AND is_active = true
        """, clinic_id)

        # Сохраняем в кэш на 1 час
        await self.redis.setex(
            key,
            3600,  # TTL в секундах
            json.dumps(services)
        )

        return services

    async def invalidate_services(self, clinic_id: int):
        """Вызывать при изменении прайса"""
        await self.redis.delete(f"clinic:{clinic_id}:services")
```

### Инвалидация кэша

```python
# При обновлении услуги
@router.put("/services/{service_id}")
async def update_service(service_id: int, data: ServiceUpdate):
    await db.execute("UPDATE services SET ... WHERE id = $1", service_id)

    # Сбрасываем кэш
    await cache.invalidate_services(clinic_id)

    return {"status": "ok"}
```

### Очереди фоновых задач

| Задача | Приоритет | Описание |
|--------|-----------|----------|
| Отправка email | high | Welcome, напоминания |
| SMS уведомления | high | Напоминание о приёме |
| Генерация отчётов | low | PDF, Excel экспорт |
| Проверка триалов | low | Истёкшие подписки |
| Бэкапы | low | Ежедневные дампы |
| Очистка старых данных | low | GDPR, ротация логов |

### Пример фоновой задачи (ARQ)

```python
from arq import create_pool
from arq.connections import RedisSettings

# Определение задачи
async def send_appointment_reminder(ctx, appointment_id: int):
    appointment = await db.fetchrow("""
        SELECT a.*, p.phone, p.name as patient_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        WHERE a.id = $1
    """, appointment_id)

    await sms_service.send(
        phone=appointment['phone'],
        message=f"Напоминаем о записи завтра в {appointment['start_time']}"
    )

# Планирование задачи
async def schedule_reminder(appointment_id: int, remind_at: datetime):
    pool = await create_pool(RedisSettings())
    await pool.enqueue_job(
        'send_appointment_reminder',
        appointment_id,
        _defer_until=remind_at
    )
```

### Rate Limiting

```python
async def check_rate_limit(ip: str, endpoint: str, limit: int = 100) -> bool:
    """100 запросов в минуту с одного IP"""
    key = f"rate:{ip}:{endpoint}"

    current = await redis.incr(key)
    if current == 1:
        await redis.expire(key, 60)  # TTL 1 минута

    return current <= limit
```

### Сессии и JWT

```python
# При logout — добавляем токен в blacklist
async def logout(token_id: str, expires_in: int):
    await redis.setex(
        f"jwt:blacklist:{token_id}",
        expires_in,  # До истечения токена
        "1"
    )

# При каждом запросе — проверяем blacklist
async def is_token_valid(token_id: str) -> bool:
    return not await redis.exists(f"jwt:blacklist:{token_id}")
```

### Pub/Sub для реального времени (будущее)

```python
# Уведомление о новой записи в реальном времени
async def notify_new_appointment(clinic_id: int, appointment: dict):
    await redis.publish(
        f"clinic:{clinic_id}:appointments",
        json.dumps(appointment)
    )

# Подписка в WebSocket handler
async def websocket_handler(websocket, clinic_id: int):
    pubsub = redis.pubsub()
    await pubsub.subscribe(f"clinic:{clinic_id}:appointments")

    async for message in pubsub.listen():
        await websocket.send_json(message['data'])
```

---

## Аутентификация

### Два входа в систему

| URL | Кто заходит | База |
|-----|-------------|------|
| `dentify.com` | Клиенты (клиники) | dentify_app |
| `admin.dentify.com` | Сотрудники Dentify | dentify_internal |

### Схема аутентификации клиента

```
┌─────────────────────────────────────────────────────────────┐
│  dentify.com/login                                          │
│  [email] [password] [Войти]                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  dentify_app.users                                          │
│  Поиск по email → clinic_id, user data                      │
│  (email уникален глобально)                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Проверка:                                                  │
│  • clinic.status = 'active' или 'trial'                     │
│  • clinic.trial_ends_at > NOW() (если trial)                │
│  • user.is_active = true                                    │
│  • clinic.subscription → features                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  SET app.current_clinic_id = {clinic_id}                    │
│  (для Row Level Security)                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  JWT Token                                                  │
│  {                                                          │
│    clinic_id, user_id, role, is_owner,                      │
│    branches: [1, 2, 3],                                     │
│    current_branch_id: 1,                                    │
│    features: ["dental_chart", "analytics"],                 │
│    subscription_status: "active"                            │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

### Middleware для RLS

```python
class ClinicIsolationMiddleware:
    async def __call__(self, request, call_next):
        # Получаем clinic_id из JWT
        clinic_id = get_clinic_from_jwt(request)

        # Устанавливаем переменную сессии PostgreSQL
        await db.execute(
            "SET app.current_clinic_id = $1", clinic_id
        )

        return await call_next(request)
```

### Управление пользователями

- **Владелец (is_owner=1)** получает мастер-аккаунт при регистрации клиники
- Можно назначить **двух владельцев** (резерв на случай форс-мажора)
- Владелец создаёт пользователей в своей БД
- Владелец может разрешить/запретить вход каждому пользователю
- Передача владения — через поддержку Dentify

### Безопасность аутентификации

| Механизм | Описание |
|----------|----------|
| **Rate limiting** | 5 неудачных попыток → блок IP на 15 минут |
| **2FA** | Опционально для владельцев (TOTP) |
| **Уведомления** | Email при входе с нового устройства |
| **Сессии** | Список активных сессий, возможность завершить |
| **Password policy** | Минимум 8 символов, цифры + буквы |

---

## База: dentify_internal (Админка Dentify)

Управление компанией, клиентами, биллинг, поддержка.

### Таблицы

```sql
-- Сотрудники Dentify
staff
├── id
├── name
├── email
├── password_hash
├── role (admin | manager | support)
├── is_active
├── created_at
└── updated_at

-- Клиники (мастер-данные)
clinics
├── id
├── name
├── legal_name
├── inn
├── address
├── contact_email
├── contact_phone
├── db_name                   -- ссылка на БД клиники
├── status (trial | active | suspended | cancelled)
├── subscription_plan_id
├── assigned_manager_id       -- FK → staff
├── trial_ends_at
├── created_at
└── updated_at

-- Тарифные планы
subscription_plans
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
invoices
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
payments
├── id
├── invoice_id
├── amount
├── method (card | bank_transfer | stripe)
├── external_id              -- ID в платёжной системе
├── paid_at
└── created_at

-- Feature flags для клиник
clinic_features
├── clinic_id
├── feature_key
├── enabled
└── updated_at

-- Тикеты поддержки (Helpdesk)
tickets
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
ticket_messages
├── id
├── ticket_id
├── author_type (staff | client)
├── author_id
├── message
├── attachments (JSON)       -- ссылки на S3
└── created_at

-- Категории тикетов
ticket_categories
├── id
├── name (Billing | Technical | Feature request | Bug)
└── default_priority

-- Правила SLA
sla_rules
├── id
├── priority
├── first_response_hours     -- 1ч для critical
├── resolution_hours         -- 4ч для critical
└── subscription_plan_id     -- разный SLA для разных тарифов

-- Аудит действий
audit_logs
├── id
├── staff_id
├── action
├── entity_type
├── entity_id
├── old_value (JSON)
├── new_value (JSON)
└── created_at

-- Аналитика (события)
analytics_events
├── id
├── clinic_id
├── event_type
├── payload (JSON)
└── created_at
```

---

## Филиалы (Branches)

### Концепция

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

---

## База: dentify_app (Данные всех клиник)

Единая база для всех клиник с изоляцией через RLS.

**Все таблицы содержат `clinic_id` для изоляции данных.**

```sql
-- ============================================================
-- КЛИНИКИ
-- ============================================================

-- Клиники (мастер-таблица)
clinics
├── id
├── name
├── legal_name
├── inn
├── contact_email
├── contact_phone
├── status (trial | active | suspended | cancelled)
├── subscription_plan_id
├── trial_ends_at
├── created_at
└── updated_at

-- Тарифные планы
subscription_plans
├── id
├── name (Solo | Clinic | Enterprise)
├── price_monthly
├── price_yearly
├── max_users
├── max_patients
├── features (JSON)
├── is_active
└── created_at

-- Настройки виджета онлайн-записи
widget_settings
├── clinic_id
├── api_key                  -- публичный ключ
├── allowed_domains
├── enabled
├── theme (JSON)
├── show_doctors
├── available_service_ids
└── updated_at

-- ============================================================
-- ФИЛИАЛЫ
-- ============================================================

-- Филиалы клиники
branches
├── id
├── clinic_id                -- ← RLS
├── name                     -- "Филиал на Ленина", "Центральный"
├── short_code               -- "ЛЕН", "ЦНТ" (для UI)
├── address
├── phone
├── color                    -- #FF6B6B для визуального различия
├── is_main (0 | 1)          -- главный филиал
├── is_active
└── created_at

-- Доступ пользователей к филиалам
user_branches
├── user_id
├── branch_id
├── is_default (0 | 1)       -- филиал по умолчанию при входе
└── access_level (full | read_only)

-- Кабинеты / кресла (для крупных клиник)
rooms
├── id
├── clinic_id                -- ← RLS
├── branch_id
├── name                     -- "Кабинет 1", "Кресло 3"
├── is_active
└── created_at

-- ============================================================
-- ПОЛЬЗОВАТЕЛИ
-- ============================================================

-- Пользователи клиники
users
├── id
├── clinic_id                -- ← RLS
├── email (UNIQUE globally)  -- для логина
├── password_hash
├── name
├── phone
├── role (doctor | admin)
├── is_owner (0 | 1)         -- владелец клиники (макс. 2)
├── specialization           -- для врачей
├── is_active
├── failed_attempts          -- для rate limiting
├── locked_until
├── last_login_at
├── created_at
└── updated_at

-- ============================================================
-- ПАЦИЕНТЫ
-- ============================================================

-- Пациенты
patients
├── id
├── clinic_id                -- ← RLS
├── first_name
├── last_name
├── middle_name
├── birth_date
├── gender
├── phone
├── email
├── address
├── allergies
├── notes
├── home_branch_id           -- "домашний" филиал (nullable)
├── created_by_user_id
├── created_at
└── updated_at

-- ============================================================
-- РАСПИСАНИЕ И ПРИЁМЫ
-- ============================================================

-- Записи на приём
appointments
├── id
├── clinic_id                -- ← RLS
├── patient_id
├── doctor_id
├── branch_id                -- в каком филиале
├── room_id (nullable)       -- в каком кабинете (опционально)
├── start_time
├── end_time
├── status (scheduled | confirmed | in_progress | completed | cancelled | no_show)
├── notes
├── created_by_user_id
├── created_at
└── updated_at

-- Заявки с виджета (онлайн-запись)
widget_bookings
├── id
├── clinic_id                -- ← RLS
├── patient_name
├── patient_phone
├── patient_email
├── service_id
├── doctor_id (nullable)
├── preferred_date
├── preferred_time
├── status (new | confirmed | cancelled)
├── ip_address
├── created_at
└── processed_at

-- ============================================================
-- УСЛУГИ И ПРАЙС
-- ============================================================

-- Услуги
services
├── id
├── clinic_id                -- ← RLS
├── category_id
├── name
├── code
├── price                    -- базовая цена
├── duration_minutes
├── is_active
└── created_at

-- Категории услуг
service_categories
├── id
├── clinic_id                -- ← RLS
├── name
├── sort_order
└── is_active

-- Цены по филиалам (если отличаются от базовой)
service_branch_prices
├── service_id
├── branch_id
├── price                    -- цена в этом филиале
└── updated_at

-- Оказанные услуги (привязка к приёму)
appointment_services
├── id
├── appointment_id
├── service_id
├── quantity
├── price                    -- цена на момент оказания
├── discount
└── created_at

-- Зубная формула
dental_chart
├── id
├── clinic_id                -- ← RLS
├── patient_id
├── tooth_number (1-32)
├── status (healthy | caries | filled | extracted | implant | crown)
├── notes
├── updated_by_user_id
└── updated_at

-- История изменений зубной формулы
dental_chart_history
├── id
├── dental_chart_id
├── old_status
├── new_status
├── notes
├── changed_by_user_id
└── created_at

-- Записи осмотров / дневники
medical_records
├── id
├── clinic_id                -- ← RLS
├── patient_id
├── appointment_id
├── record_type (examination | treatment | consultation)
├── complaints              -- жалобы
├── anamnesis               -- анамнез
├── diagnosis
├── treatment_plan
├── notes
├── created_by_user_id
├── created_at
└── updated_at

-- Файлы / снимки (метаданные, сами файлы в S3)
files
├── id
├── clinic_id                -- ← RLS
├── patient_id
├── appointment_id (nullable)
├── file_type (xray | photo | document | other)
├── original_name
├── s3_key                   -- путь в S3/{clinic_id}/...
├── mime_type
├── size_bytes
├── uploaded_by_user_id
└── created_at

-- Счета пациентам
patient_invoices
├── id
├── clinic_id                -- ← RLS
├── patient_id
├── appointment_id (nullable)
├── total_amount
├── paid_amount
├── status (pending | partial | paid | cancelled)
├── created_by_user_id
├── created_at
└── updated_at

-- Оплаты от пациентов
patient_payments
├── id
├── invoice_id
├── amount
├── method (cash | card | transfer)
├── received_by_user_id
└── created_at

-- ============================================================
-- РАСПИСАНИЕ ВРАЧЕЙ
-- ============================================================

-- Рабочее расписание врачей (по филиалам)
doctor_schedules
├── id
├── clinic_id                -- ← RLS
├── doctor_id
├── branch_id                -- в каком филиале работает в этот день
├── day_of_week (1-7)
├── start_time
├── end_time
├── is_working
└── updated_at

-- Исключения в расписании (отпуск, больничный)
schedule_exceptions
├── id
├── clinic_id                -- ← RLS
├── doctor_id
├── branch_id (nullable)     -- NULL = для всех филиалов
├── date
├── is_available (0 = выходной, 1 = рабочий)
├── start_time (nullable)
├── end_time (nullable)
├── reason
└── created_at

-- ============================================================
-- НАСТРОЙКИ КЛИНИКИ
-- ============================================================

-- Настройки клиники
clinic_settings
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

## Регистрация клиники (Trial)

### Процесс регистрации

```
┌─────────────────────────────────────────────────────────────┐
│  dentify.com/register                                        │
│  [Название клиники] [Email] [Телефон] [Пароль]              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Создать запись в clinics                                 │
│     status = 'trial'                                        │
│     trial_ends_at = NOW() + 7 days                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Создать владельца в users                                │
│     is_owner = 1                                            │
│     role = 'admin'                                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Создать главный филиал в branches                        │
│     is_main = 1                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Создать настройки в clinic_settings                      │
│     timezone = определить по IP                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Отправить welcome email                                  │
│  6. Автоматический вход → Dashboard                         │
└─────────────────────────────────────────────────────────────┘
```

### Trial → Paid

```python
# Фоновая задача: проверка истёкших триалов
async def check_expired_trials():
    expired = await db.fetch("""
        SELECT id FROM clinics
        WHERE status = 'trial' AND trial_ends_at < NOW()
    """)

    for clinic in expired:
        # Меняем статус на suspended
        await db.execute("""
            UPDATE clinics SET status = 'suspended'
            WHERE id = $1
        """, clinic['id'])

        # Отправляем email: "Ваш триал закончился"
        await send_trial_expired_email(clinic)
```

### Что доступно в Trial

| Функция | Trial (7 дней) | Платная подписка |
|---------|----------------|------------------|
| Пациенты | До 50 | По тарифу |
| Пользователи | 1 (владелец) | По тарифу |
| Все функции | ✓ | ✓ |
| Поддержка | Email | По тарифу |

---

## Public API (Виджет онлайн-записи)

```
GET  /api/widget/{api_key}/services     -- список услуг
GET  /api/widget/{api_key}/doctors      -- список врачей
POST /api/widget/{api_key}/slots        -- доступные слоты
POST /api/widget/{api_key}/book         -- создать заявку
```

**Защита:**
- Rate limiting по IP
- Проверка домена (allowed_domains)
- CAPTCHA при подозрении на бота

---

## DentAI — AI-ассистент

**Ключевое конкурентное преимущество Dentify.**

### Концепция

```
┌─────────────────────────────────────────────────────────────┐
│                    Пользователь                             │
│         "Покажи пациентов без визитов более 6 месяцев"      │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 NLU (Intent Recognition)                    │
│     Распознание намерения: GET_INACTIVE_PATIENTS            │
│     Извлечение параметров: period = 6 months                │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Query Builder                             │
│     SELECT * FROM patients WHERE last_visit < NOW() - 6m    │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                Response Generator                           │
│     "Найдено 23 пациента. Показать список?"                 │
└─────────────────────────────────────────────────────────────┘
```

### Почему локальная модель, а не OpenAI/Claude API?

| Критерий | Внешний API | Локальная модель |
|----------|-------------|------------------|
| **Приватность данных** | Данные уходят на сторонний сервер | Всё внутри системы |
| **HIPAA/GDPR** | Сложно соответствовать | Полный контроль |
| **Стоимость** | Платим за каждый запрос | Фиксированные затраты |
| **Галлюцинации** | Возможны | Исключены (NLU + SQL) |
| **Латентность** | Зависит от сети | Мгновенно |

### Технический подход

**MVP: NLU + Intent Classification**

| Компонент | Технология |
|-----------|------------|
| NLU Engine | Rasa Open Source / spaCy |
| Кол-во интентов | ~300-500 |
| Query Builder | Шаблонные SQL-запросы |
| Response | Шаблонные ответы |

**Будущее: Локальная LLM**
- Llama 3 / Mistral / Phi-3 (через Ollama)
- Fine-tuning на стоматологических данных
- RAG для контекста

### Архитектура AI-модуля

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Service                             │
│                   (Отдельный микросервис)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  NLU Engine │  │ Query       │  │ Response            │  │
│  │  (Rasa/     │→ │ Builder     │→ │ Generator           │  │
│  │   spaCy)    │  │ (SQL/API)   │  │ (Templates)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Intent Database (~500 intents)         │    │
│  │  - get_patient_by_name                              │    │
│  │  - get_schedule_for_date                            │    │
│  │  - get_revenue_for_period                           │    │
│  │  - ...                                              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Main Backend API                         │
│                  (PostgreSQL Database)                      │
└─────────────────────────────────────────────────────────────┘
```

### Примеры запросов по ролям

**Для персонала клиники (врачи, администраторы):**

| Категория | Примеры запросов |
|-----------|------------------|
| Пациенты | "Найди Иванова Петра", "Пациенты с аллергией на анестезию" |
| Расписание | "Свободные окна на пятницу", "Сколько приёмов сегодня?" |
| Финансы | "Сколько должен пациент Козлов?", "Неоплаченные счета" |
| Лечение | "История лечения зуба 36 у Петрова" |
| Отчёты | "Статистика по врачам за месяц" |

**Для владельцев клиник:**

| Категория | Примеры запросов |
|-----------|------------------|
| Аналитика | "Выручка за этот месяц vs прошлый", "Какой врач принял больше всего?" |
| Подписка | "Когда следующий платёж?", "Сколько пользователей в моём тарифе?" |

**Для менеджеров Dentify:**

| Категория | Примеры запросов |
|-----------|------------------|
| Продажи | "Клиники с заканчивающимся триалом", "Кто давно не заходил?" |
| Метрики | "MRR за месяц", "Churn rate", "Конверсия из триала" |

### Интерфейс взаимодействия

**В веб-приложении:**
- Плавающая кнопка "AI-помощник" в углу экрана
- Чат-панель справа (как Intercom)
- Поддержка голосового ввода (Web Speech API)

**В мобильном приложении:**
- Отдельная вкладка "Ассистент"
- Голосовой ввод через микрофон

**Быстрые команды:**
```
/find Иванов           — быстрый поиск пациента
/schedule tomorrow     — расписание на завтра
/revenue week          — выручка за неделю
```

### Безопасность AI

- **Ограничение scope:** AI имеет доступ только к данным текущей клиники
- **Аудит запросов:** Все запросы к AI логируются
- **Только чтение:** AI не может создавать/удалять данные
- **Подтверждение действий:** Любое действие требует подтверждения пользователя

### Этапы внедрения

| Этап | Функционал |
|------|------------|
| **MVP** | Базовый поиск пациентов, расписание |
| **v1.1** | Финансовые запросы, отчёты |
| **v1.2** | Голосовой ввод, рекомендации |
| **v2.0** | Локальная LLM, сложные запросы |

---

## Аналитика

**Вторая ключевая фича** — мощная аналитика через DentAI и дашборды.

### Метрики для клиник:
- Количество приёмов за период
- Выручка по врачам / услугам
- Средний чек
- Конверсия из записи в приём
- Загрузка врачей
- Отмены и no-show
- Пациенты без визита > N месяцев

### Метрики для Dentify (внутренние):
- MRR / ARR
- Churn rate
- LTV клиники
- Активность клиник
- Популярные фичи
- Конверсия триал → платная подписка

---

## Экспорт данных

- **XLS export** — выгрузка табличных данных из интерфейса
- **GDPR export** — полная выгрузка данных клиники по запросу
- **Формат:** XLSX (для таблиц), JSON (для полного экспорта)

---

## Бэкапы

| Параметр | Значение |
|----------|----------|
| Частота | Ежедневно |
| Retention | 14 дней |
| Хранение | Отдельный диск / S3 bucket |
| Метод | pg_dump для каждой БД |

Скрипт бэкапа:
```bash
for db in $(psql -t -c "SELECT db_name FROM clinic_databases"); do
    pg_dump $db | gzip > /backups/$db_$(date +%Y%m%d).sql.gz
done
# Удаление старше 14 дней
find /backups -mtime +14 -delete
```

---

## Мониторинг

| Инструмент | Назначение |
|------------|------------|
| Prometheus | Сбор метрик |
| Grafana | Дашборды |
| Sentry | Ошибки и exceptions |
| Alertmanager | Оповещения |

**Алерты:**
- БД клиники недоступна
- Высокий response time API (>500ms)
- Ошибки 5xx > 1%
- Диск заполнен > 80%
- Бэкап не выполнен

---

## TODO / Отложенные вопросы

### ⚠️ УВЕДОМЛЕНИЯ — ОБСУДИТЬ ОТДЕЛЬНО!
Тема требует глубокой проработки:
- SMS провайдеры
- Email сервис
- Push уведомления
- Шаблоны сообщений
- Очередь отправки
- Retry логика
- Стоимость

**Напомнить при следующем обсуждении!**

---

## Интеграции (базово)

- **Stripe / Paddle** — автосписание подписок (MVP: ручное управление)
- **Email** — transactional emails (welcome, reset password)
- **SMS** — отложено до проработки уведомлений

---

## Следующие шаги

1. [ ] Инициализация FastAPI проекта
2. [ ] Настройка PostgreSQL + PgBouncer
3. [ ] Создание миграций (Alembic)
4. [ ] Реализация аутентификации (JWT)
5. [ ] CRUD для основных сущностей
6. [ ] Public API для виджета
7. [ ] Админка Dentify
8. [ ] XLS экспорт
9. [ ] Мониторинг
