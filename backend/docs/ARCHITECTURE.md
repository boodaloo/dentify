# Orisios Backend Architecture

> Модульная документация архитектуры бэкенда.

---

## Технологический стек

| Компонент | Технология |
|-----------|------------|
| API Framework | FastAPI |
| База данных | PostgreSQL |
| Драйвер БД | asyncpg (raw SQL) |
| Connection Pool | PgBouncer |
| Кэширование | Redis |
| Очереди задач | Redis + ARQ |
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
│  orisios_internal   │         │       orisios_app           │
│                     │         │                             │
│  • clinics ─────────┼────────▶│  clinic_id (просто ID)      │
│  • staff            │         │  • users      ← clinic_id   │
│  • subscription_plans         │  • patients   ← clinic_id   │
│  • invoices/payments│         │  • appointments             │
│  • tickets          │         │  • services, ...            │
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
ALTER TABLE core_patients ENABLE ROW LEVEL SECURITY;

-- Политика: видишь только данные своей клиники
CREATE POLICY clinic_isolation ON core_patients
    USING (clinic_id = current_setting('app.current_clinic_id')::int);

-- Забыл WHERE clinic_id = ? — PostgreSQL сам отфильтрует!
```

### Партиционирование (для производительности)

```sql
-- Партиционирование по clinic_id
CREATE TABLE core_patients (
    id SERIAL,
    clinic_id INT NOT NULL,
    ...
) PARTITION BY HASH (clinic_id);

-- 16 партиций
CREATE TABLE core_patients_p0 PARTITION OF core_patients FOR VALUES WITH (MODULUS 16, REMAINDER 0);
CREATE TABLE core_patients_p1 PARTITION OF core_patients FOR VALUES WITH (MODULUS 16, REMAINDER 1);
-- ... и так далее
```

---

## Soft Delete

Для критичных данных используется мягкое удаление:

```
is_deleted (0 | 1)     -- флаг удаления, default 0
deleted_at (timestamp) -- время удаления, NULL если не удалён
```

**Таблицы с soft delete:** `core_patients`, `core_users`, `clin_services`, `clin_service_categories`, `fin_invoices`, `fin_payments`, `clin_appointments`, `clin_medical_records`, `core_branches`

**Физическое удаление:** `clin_files`, `clin_widget_bookings`, `clin_doctor_schedules`, `clin_schedule_exceptions`, `fin_bonus_transactions`

---

## Документация

### Схема БД

| Файл | Описание |
|------|----------|
| [schema/CORE.md](schema/CORE.md) | Клиники, пользователи, филиалы, пациенты, поиск |
| [schema/CLINICAL.md](schema/CLINICAL.md) | Приёмы, услуги, медкарты, зубная формула |
| [schema/FINANCE.md](schema/FINANCE.md) | Счета, оплаты, баланс, бонусы, лояльность |
| [schema/INVENTORY.md](schema/INVENTORY.md) | Склад, материалы, поставщики |

### Функциональность

| Файл | Описание |
|------|----------|
| [features/AUTH.md](features/AUTH.md) | Аутентификация клиник и пациентов |
| [features/BILLING.md](features/BILLING.md) | Биллинг, подписки, делегирование доступа |
| [features/WIDGET.md](features/WIDGET.md) | Виджет онлайн-записи |
| [features/PATIENT_APP.md](features/PATIENT_APP.md) | Мобильное приложение OrisiosPatient |
| [features/ORISAI.md](features/ORISAI.md) | AI-ассистент |
| [features/IMPORT_EXPORT.md](features/IMPORT_EXPORT.md) | Импорт/экспорт данных, аналитика |

### Аутентификация

| Файл | Описание |
|------|----------|
| [features/AUTH.md](features/AUTH.md) | Таблицы: `auth_patient_codes`, `auth_patient_devices`, `auth_patient_sessions` |

### Инфраструктура

| Файл | Описание |
|------|----------|
| [infrastructure/REDIS.md](infrastructure/REDIS.md) | Кэширование, очереди, pub/sub |
| [infrastructure/DOCKER.md](infrastructure/DOCKER.md) | Контейнеризация, деплой, мониторинг |
| [infrastructure/CICD.md](infrastructure/CICD.md) | GitHub Actions, тестирование |

---

## TODO / Отложенные вопросы

### Уведомления — требует отдельной проработки

- SMS провайдеры
- Email сервис
- Push уведомления
- Шаблоны сообщений
- Очередь отправки
- Retry логика
- Стоимость

### Интеграции (базово)

- **Stripe / Paddle** — автосписание подписок (MVP: ручное управление)
- **Email** — transactional emails (welcome, reset password)
- **SMS** — отложено до проработки уведомлений

---

## Текущее состояние (реализовано)

> Фактический стек: **Node.js + Express.js + Prisma ORM + PostgreSQL** (вместо FastAPI/Alembic из первоначального плана).

### Backend ✅ / ⬜
1. ✅ Инициализация проекта (Express.js + TypeScript + Prisma)
2. ✅ Настройка PostgreSQL (Docker Compose)
3. ✅ Схема БД: 45 таблиц через `prisma db push`
4. ✅ Аутентификация (JWT + bcrypt)
5. ✅ CRUD: пациенты, приёмы (базовый)
6. ✅ Seed с демо-данными (6 пациентов, 11 приёмов, 8 услуг)
7. ⬜ CRUD для всех сущностей (услуги, счета, склад, расписание и др.)
8. ⬜ Public API для виджета онлайн-записи
9. ⬜ Patient API для мобильного приложения
10. ⬜ Бонусная система и лояльность
11. ⬜ Импорт данных (XLSX)
12. ⬜ Склад: движения, остатки, уведомления
13. ⬜ XLS экспорт / отчёты
14. ⬜ Redis (кэш, очереди уведомлений)
15. ⬜ Мониторинг (Grafana + Prometheus)

### Frontend ✅ / ⬜
1. ✅ React Web App — 17 страниц, задеплоен на продакшн
   - Dashboard, Calendar, Patients, PatientProfile, Settings
   - OnlineBooking, Templates, Documents, Labs, OMS
   - PriceList, Invoices, Inventory, Reports
   - CallJournal, Loyalty, Analytics, Integrations
2. ✅ Сайдбар с 5 именованными группами (CORE/CLINICAL/FINANCE/MARKETING/ADMIN)
3. ✅ i18n: английский (по умолчанию) + русский
4. ⬜ Подключить страницы к реальным API данным
5. ⬜ React Admin Panel (для сотрудников Orisios)
6. ⬜ Client Portal (для владельцев клиник, управление подпиской)

### Mobile
1. ⬜ Flutter: OrisiosPatient (приложение для пациентов)
2. ⬜ Flutter: Orisios companion app (для врачей — опционально)
