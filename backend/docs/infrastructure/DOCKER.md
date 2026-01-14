# Infrastructure: Docker

> Контейнеризация, локальная разработка, продакшн.

---

## Локальная разработка

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: orisios
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: orisios_app
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: ./backend
    volumes:
      - ./backend:/app
    environment:
      DATABASE_URL: postgresql://orisios:dev_password@postgres:5432/orisios_app
      REDIS_URL: redis://redis:6379
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis

  web:
    build: ./frontend/web
    volumes:
      - ./frontend/web:/app
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  postgres_data:
```

**Команды:**
```bash
docker-compose up -d              # поднять всё
docker-compose logs -f api        # логи бэкенда
docker-compose exec api pytest    # запустить тесты
docker-compose down -v            # остановить и удалить volumes
```

---

## Продакшн (AWS VPS + Docker Compose)

**Этап 1 (MVP):** Self-hosted на одном сервере

```
AWS EC2 (t3.medium, $30-40/мес)
│
├── Traefik (reverse proxy, SSL)
│   ├── HTTPS терминация
│   ├── Let's Encrypt автообновление
│   └── Роутинг: api.orisios.app → api, app.orisios.app → web
│
├── api (FastAPI в Docker)
├── web (React build в Nginx)
├── redis (Docker)
├── postgres (Docker)          ← self-hosted на старте
│
└── S3 (файлы пациентов)       ← отдельно от VPS
```

**docker-compose.prod.yml:**
```yaml
services:
  traefik:
    image: traefik:v3.0
    command:
      - "--providers.docker=true"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@orisios.app"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - letsencrypt:/letsencrypt

  api:
    image: ghcr.io/orisios/api:latest
    labels:
      - "traefik.http.routers.api.rule=Host(`api.orisios.app`)"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: redis://redis:6379
      SECRET_KEY: ${SECRET_KEY}
    depends_on:
      - postgres
      - redis

  web:
    image: ghcr.io/orisios/web:latest
    labels:
      - "traefik.http.routers.web.rule=Host(`app.orisios.app`)"
      - "traefik.http.routers.web.tls.certresolver=letsencrypt"

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
  letsencrypt:
```

---

## Этапы масштабирования

**Этап 2 (рост):** Managed PostgreSQL

```
AWS EC2                    AWS RDS PostgreSQL
├── Traefik          ───▶  ├── Automated backups
├── api                    ├── Multi-AZ (отказоустойчивость)
├── web                    └── Point-in-time recovery
└── redis
```

**Этап 3 (масштаб):** Kubernetes (EKS)

```
AWS EKS
├── Ingress (ALB)
├── api (Deployment, HPA)
├── web (Deployment)
├── redis (ElastiCache)
└── postgres (RDS)
```

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
