# 8 вопросов на проработку

Критические замечания к архитектуре, требующие решения.

---

## 1. Аутентификация — маршрутизация логина ✅ РЕШЕНО

**Проблема:**
Три базы, три типа пользователей. Пользователь вводит email/пароль — где искать?

**Решение:**

1. **Два входа:**
   - `dentify.com` → клиенты (клиники)
   - `admin.dentify.com` → сотрудники Dentify

2. **Таблица `user_credentials` в dentify_catalog:**
   - Email глобально уникален
   - Содержит clinic_id и user_id для маршрутизации
   - Rate limiting (failed_attempts, locked_until)

3. **Поток аутентификации:**
   ```
   email/password → catalog.user_credentials → clinic_id
   → проверка подписки в internal → загрузка пользователя из clinic_X
   → JWT с правами, филиалами, фичами
   ```

4. **Безопасность:**
   - 5 попыток → блок на 15 минут
   - 2FA для владельцев (опционально)
   - Уведомление о входе с нового устройства

**Статус:** Добавлено в ARCHITECTURE.md

---

## 2. Создание новой клиники — автоматизация

**Проблема:**
Клиника оплатила подписку → нужно автоматически развернуть инфраструктуру.

**Что должно произойти:**

```
1. Создать БД dentify_clinic_XXX
2. Накатить все миграции (структура таблиц)
3. Создать запись в dentify_catalog.clinic_databases
4. Создать owner-пользователя в новой БД
5. Отправить welcome email с данными для входа
```

**Реализация:**
Отдельный сервис `ClinicProvisioner` или Celery task.

```python
async def provision_clinic(clinic_id: int, owner_email: str):
    db_name = f"dentify_clinic_{clinic_id}"
    await create_database(db_name)
    await run_migrations(db_name)
    await register_in_catalog(clinic_id, db_name)
    await create_owner_user(db_name, owner_email)
    await send_welcome_email(owner_email)
```

**Решение:** ?

---

## 3. Миграции на сотни БД

**Проблема:**
Alembic работает с одной БД. У нас 500 клиник = 500 отдельных баз.

**Вопросы:**
- Как накатить миграцию на все 500 баз?
- Что если одна упала — откатывать все?
- Версионирование: клиника A на v1.5, клиника B на v1.6?

**Варианты решения:**

A) **Скрипт массовых миграций:**
```bash
#!/bin/bash
for db in $(psql dentify_catalog -t -c "SELECT db_name FROM clinic_databases WHERE status='active'"); do
    echo "Migrating $db..."
    alembic -x db=$db upgrade head || echo "FAILED: $db" >> migration_errors.log
done
```

B) **Хранить версию схемы в catalog:**
```sql
clinic_databases
├── ...
├── schema_version
└── last_migration_at
```

C) **Blue-green миграции:**
Новые клиники сразу на новой версии, старые мигрируют постепенно.

**Решение:** ?

---

## 4. Кэширование (Redis)

**Проблема:**
Нет слоя кэширования. Каждый запрос идёт в БД.

**Где нужен Redis:**

| Кейс | TTL |
|------|-----|
| JWT refresh tokens | 7 дней |
| Сессии пользователей | 24 часа |
| Прайс-лист услуг клиники | 1 час |
| Rate limiting (IP → count) | 1 минута |
| Очередь задач (бэкапы, emails) | — |

**Архитектура:**

```
FastAPI → Redis (cache/queue) → PostgreSQL
              ↓
          Celery workers (фоновые задачи)
```

**Решение:** Добавить Redis в стек? Celery для очередей?

---

## 5. Soft Delete vs Hard Delete

**Проблема:**
Удалили пациента — что делать с данными?

| Требование | Решение |
|------------|---------|
| GDPR "право на удаление" | Hard delete |
| Аудит и история | Soft delete |
| Случайное удаление | Soft delete + восстановление |

**Варианты:**

A) **Soft delete везде:**
```sql
patients
├── ...
├── deleted_at (nullable)
└── deleted_by_user_id
```

B) **Архивная БД:**
```
dentify_clinic_X (активные данные)
dentify_clinic_X_archive (удалённые)
```

C) **Гибрид:**
- Soft delete по умолчанию (30 дней)
- Через 30 дней → hard delete или архив
- GDPR запрос → немедленный hard delete

**Решение:** ?

---

## 6. Timezone ✅ РЕШЕНО

**Проблема:**
Клиники в разных часовых поясах. Москва, Владивосток, Калининград.

**Решение:**

```sql
-- Хранить в UTC
appointments.start_time = '2025-01-15 10:00:00+00'

-- В настройках клиники (добавить таблицу clinic_settings)
clinic_settings.timezone = 'Europe/Moscow'

-- При отображении
SELECT start_time AT TIME ZONE 'Europe/Moscow'
```

**В коде:**
```python
from datetime import datetime, timezone

# Сохранение — всегда UTC
dt_utc = datetime.now(timezone.utc)

# Отображение — в зоне клиники
dt_local = dt_utc.astimezone(clinic_timezone)
```

**Статус:** UTC в БД + timezone в настройках клиники

---

## 7. Поиск пациентов

**Проблема:**
Маленькая клиника — 500 пациентов, PostgreSQL справится.
Большая сеть — 100,000+ пациентов, нужен полнотекстовый поиск.

**Варианты:**

A) **PostgreSQL pg_trgm (достаточно для большинства):**
```sql
CREATE EXTENSION pg_trgm;
CREATE INDEX patients_name_trgm ON patients
  USING gin (name gin_trgm_ops);

SELECT * FROM patients
WHERE name ILIKE '%иван%'
ORDER BY similarity(name, 'иван') DESC;
```

B) **Elasticsearch (для enterprise):**
- Отдельный сервис
- Синхронизация с PostgreSQL
- Сложнее, но мощнее

**Рекомендация:**
MVP → pg_trgm
Enterprise → Elasticsearch как опция

**Решение:** ?

---

## 8. Docker / CI/CD

**Проблема:**
Не описано:
- Как поднять проект локально?
- Как деплоить на прод?
- Как тестировать?

**Что нужно:**

**docker-compose.yml (локальная разработка):**
```yaml
services:
  api:
    build: .
    ports: ["8000:8000"]
    depends_on: [postgres, redis]

  postgres:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine

  pgbouncer:
    image: edoburu/pgbouncer
```

**CI/CD pipeline:**
```
1. Push to main
2. Run tests
3. Build Docker image
4. Push to registry
5. Deploy to staging
6. (manual) Deploy to production
```

**Инструменты:**
- GitHub Actions / GitLab CI
- Docker Registry (GitHub, Docker Hub)
- Deployment: Kubernetes / Docker Swarm / простой VPS

**Решение:** Описать docker-compose + CI pipeline?

---

## Приоритеты

| # | Вопрос | Приоритет | Статус |
|---|--------|-----------|--------|
| 1 | Аутентификация | P0 | ✅ Решено |
| 2 | Provisioning клиник | P0 | ⏳ Ожидает |
| 3 | Миграции | P1 | ⏳ Ожидает |
| 4 | Redis/кэширование | P1 | ⏳ Ожидает |
| 5 | Soft delete | P1 | ⏳ Ожидает |
| 6 | Timezone | P1 | ✅ Решено |
| 7 | Поиск | P2 | ⏳ Ожидает |
| 8 | Docker/CI | P0 | ⏳ Ожидает |
