# Infrastructure: Redis

> Кэширование, очереди задач, rate limiting, pub/sub.

---

## Архитектура

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

---

## Что кэшируем

| Данные | TTL | Ключ | Почему |
|--------|-----|------|--------|
| Прайс-лист услуг | 1 час | `clinic:{id}:services` | Редко меняется, часто запрашивается |
| Расписание врачей | 15 мин | `clinic:{id}:schedules` | Быстрый доступ при записи |
| Свободные слоты | 5 мин | `clinic:{id}:slots:{date}` | Виджет онлайн-записи |
| Данные пользователя | 30 мин | `user:{id}:profile` | Не ходить в БД каждый запрос |
| Настройки клиники | 1 час | `clinic:{id}:settings` | Timezone, валюта и т.д. |
| Категории услуг | 2 часа | `clinic:{id}:categories` | Почти статичные данные |
| JWT blacklist | До истечения | `jwt:blacklist:{token_id}` | Logout, смена пароля |

---

## Реализация кэширования

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

---

## Инвалидация кэша

```python
# При обновлении услуги
@router.put("/services/{service_id}")
async def update_service(service_id: int, data: ServiceUpdate):
    await db.execute("UPDATE services SET ... WHERE id = $1", service_id)

    # Сбрасываем кэш
    await cache.invalidate_services(clinic_id)

    return {"status": "ok"}
```

---

## Очереди фоновых задач

| Задача | Приоритет | Описание |
|--------|-----------|----------|
| Отправка email | high | Welcome, напоминания |
| SMS уведомления | high | Напоминание о приёме |
| Генерация отчётов | low | PDF, Excel экспорт |
| Проверка триалов | low | Истёкшие подписки |
| Бэкапы | low | Ежедневные дампы |
| Очистка старых данных | low | GDPR, ротация логов |

---

## Пример фоновой задачи (ARQ)

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

---

## Rate Limiting

```python
async def check_rate_limit(ip: str, endpoint: str, limit: int = 100) -> bool:
    """100 запросов в минуту с одного IP"""
    key = f"rate:{ip}:{endpoint}"

    current = await redis.incr(key)
    if current == 1:
        await redis.expire(key, 60)  # TTL 1 минута

    return current <= limit
```

---

## Сессии и JWT

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

---

## Pub/Sub для реального времени (будущее)

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
