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

## 2. Создание новой клиники — автоматизация ✅ РЕШЕНО

**Проблема:**
Клиника оплатила подписку → нужно автоматически развернуть инфраструктуру.

**Решение: Одна БД + RLS (без создания отдельных баз)**

Регистрация = просто INSERT в существующие таблицы:

```python
async def register_clinic(data: ClinicRegisterData):
    # 1. Создать клинику
    clinic = await db.fetchrow("""
        INSERT INTO clinics (name, contact_email, status, trial_ends_at)
        VALUES ($1, $2, 'trial', NOW() + INTERVAL '7 days')
        RETURNING id
    """, data.name, data.email)

    # 2. Создать владельца
    await db.execute("""
        INSERT INTO users (clinic_id, email, password_hash, is_owner, role)
        VALUES ($1, $2, $3, 1, 'admin')
    """, clinic['id'], data.email, hash_password(data.password))

    # 3. Создать главный филиал
    await db.execute("""
        INSERT INTO branches (clinic_id, name, is_main)
        VALUES ($1, 'Главный филиал', 1)
    """, clinic['id'])

    # 4. Создать настройки
    await db.execute("""
        INSERT INTO clinic_settings (clinic_id, timezone)
        VALUES ($1, $2)
    """, clinic['id'], detect_timezone_by_ip())

    # 5. Welcome email
    await send_welcome_email(data.email)
```

**Преимущества:**
- Нет создания БД = мгновенная регистрация
- Нет миграций на отдельную базу
- RLS автоматически изолирует данные

**Статус:** Добавлено в ARCHITECTURE.md

---

## 3. Миграции на сотни БД ✅ РЕШЕНО

**Проблема:**
Alembic работает с одной БД. У нас 500 клиник = 500 отдельных баз.

**Решение: Одна БД = одна миграция**

С переходом на одну базу `dentify_app` проблема исчезла:

```bash
# Одна команда на всех клиентов
alembic upgrade head
```

**Преимущества:**
- Все клиники на одной версии схемы
- Нет проблем с версионированием
- Нет "упавших" миграций
- Простой откат при необходимости

**Статус:** Проблема устранена изменением архитектуры

---

## 4. Кэширование (Redis) ✅ РЕШЕНО

**Проблема:**
Нет слоя кэширования. Каждый запрос идёт в БД.

**Решение: Redis для кэша + очередей**

**Что кэшируем:**

| Данные | TTL | Ключ |
|--------|-----|------|
| Прайс-лист услуг | 1 час | `clinic:{id}:services` |
| Расписание врачей | 15 мин | `clinic:{id}:schedules` |
| Свободные слоты | 5 мин | `clinic:{id}:slots:{date}` |
| Данные пользователя | 30 мин | `user:{id}:profile` |
| Настройки клиники | 1 час | `clinic:{id}:settings` |
| JWT blacklist | До истечения | `jwt:blacklist:{token_id}` |

**Очереди задач (ARQ/Celery):**
- Отправка email/SMS
- Генерация отчётов
- Проверка истёкших триалов
- Бэкапы

**Дополнительно:**
- Rate limiting
- Pub/Sub для realtime (WebSocket)

**Статус:** Добавлено в ARCHITECTURE.md с примерами кода

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
| 2 | Provisioning клиник | P0 | ✅ Решено |
| 3 | Миграции | P1 | ✅ Решено (одна БД) |
| 4 | Redis/кэширование | P1 | ⏳ Ожидает |
| 5 | Soft delete | P1 | ⏳ Ожидает |
| 6 | Timezone | P1 | ✅ Решено |
| 7 | Поиск | P2 | ⏳ Ожидает |
| 8 | Docker/CI | P0 | ⏳ Ожидает |
