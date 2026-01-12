# Infrastructure: CI/CD

> GitHub Actions для тестирования и деплоя.

---

## Структура workflows

```
.github/workflows/
├── ci.yml          # Тесты на каждый PR
├── deploy.yml      # Деплой на прод (main branch)
└── release.yml     # Релиз с тегом версии
```

---

## CI Pipeline (ci.yml)

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Lint backend
        run: |
          cd backend
          pip install ruff
          ruff check .

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-asyncio

      - name: Run tests
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
        run: |
          cd backend
          pytest --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v4

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker images
        run: |
          docker build -t ghcr.io/dentify/api:${{ github.sha }} ./backend
          docker build -t ghcr.io/dentify/web:${{ github.sha }} ./frontend/web
```

---

## Deploy Pipeline (deploy.yml)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push images
        run: |
          docker build -t ghcr.io/dentify/api:latest ./backend
          docker build -t ghcr.io/dentify/web:latest ./frontend/web
          docker push ghcr.io/dentify/api:latest
          docker push ghcr.io/dentify/web:latest

      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: deploy
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/dentify
            docker-compose pull
            docker-compose up -d --remove-orphans
            docker system prune -f
```

---

## Тестирование

```
tests/
├── unit/                    # Без внешних зависимостей
│   ├── test_validators.py
│   └── test_utils.py
│
├── integration/             # С БД (pytest + testcontainers)
│   ├── test_patients_api.py
│   ├── test_appointments_api.py
│   └── conftest.py          # Фикстуры: test DB, test client
│
└── e2e/                     # Playwright (отдельно)
    └── test_booking_flow.py
```

**conftest.py для интеграционных тестов:**
```python
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine

@pytest.fixture
async def test_db():
    """Создаёт чистую тестовую БД для каждого теста."""
    engine = create_async_engine(os.getenv("DATABASE_URL"))
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def client(test_db):
    """HTTP клиент для тестов API."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
```
