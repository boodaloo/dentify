# Schema: Inventory

> Склад и материалы: учёт расходных материалов, медикаментов, инструментов.

---

## Функционал MVP

```
Склад
│
├── 📦 Номенклатура
│   ├── Список материалов
│   ├── Категории (анестетики, пломбы, инструменты...)
│   └── Единицы измерения
│
├── 📊 Остатки
│   ├── Текущие остатки по филиалам
│   ├── Минимальный остаток (для уведомлений)
│   └── История движения
│
├── 📥 Поступления
│   ├── Приход от поставщика
│   ├── Перемещение между филиалами
│   └── Инвентаризация
│
├── 📤 Списания
│   ├── Ручное списание
│   └── Автосписание при оказании услуги (опционально)
│
└── 🔔 Уведомления
    └── "Заканчивается: Анестетик Ультракаин (осталось 5 шт)"
```

### Что НЕ входит в MVP

| Функция | Причина |
|---------|---------|
| Серийные номера / партии | Усложняет учёт |
| Сроки годности | Требует отдельной логики |
| Закупки и заказы поставщикам | Отдельный модуль |
| Интеграция с 1С | Enterprise фича |

---

## Таблицы

```sql
-- Контрагенты (поставщики, лаборатории)
contractors
├── id
├── clinic_id                -- ← RLS
├── name                     -- "ООО Дентал-Сервис"
├── type (supplier | lab | other)
├── inn
├── contact_person
├── phone
├── email
├── address
├── notes
├── is_active
└── created_at

-- Категории материалов
material_categories
├── id
├── clinic_id                -- ← RLS
├── name                     -- "Анестетики", "Пломбировочные"
├── sort_order
└── is_active

-- Единицы измерения
units
├── id
├── clinic_id                -- ← RLS
├── name                     -- "шт", "мл", "г", "карпула"
├── short_name               -- "шт", "мл"
└── is_active

-- Номенклатура материалов
materials
├── id
├── clinic_id                -- ← RLS
├── category_id
├── name                     -- "Ультракаин Д-С форте"
├── sku                      -- артикул
├── unit_id
├── min_stock                -- минимальный остаток для уведомления
├── default_contractor_id    -- основной поставщик
├── is_active
└── created_at

-- Остатки по филиалам
material_stock
├── id
├── clinic_id                -- ← RLS
├── material_id
├── branch_id
├── quantity                 -- текущий остаток
├── last_updated_at
└── updated_by_user_id

-- Движение материалов
stock_movements
├── id
├── clinic_id                -- ← RLS
├── material_id
├── branch_id
├── type (in | out | transfer | adjustment)
├── quantity                 -- положительное = приход, отрицательное = расход
├── quantity_before          -- остаток до операции
├── quantity_after           -- остаток после операции
├── source_type              -- 'purchase', 'appointment', 'transfer', 'inventory', 'manual'
├── source_id (nullable)     -- ID поступления/приёма/etc
├── contractor_id (nullable) -- от какого поставщика (для purchase)
├── transfer_to_branch_id    -- для перемещений между филиалами
├── notes
├── created_by_user_id
└── created_at

-- Поступления (накладные)
stock_receipts
├── id
├── clinic_id                -- ← RLS
├── branch_id
├── contractor_id
├── receipt_number           -- номер накладной
├── receipt_date
├── total_amount
├── notes
├── created_by_user_id
└── created_at

-- Позиции в поступлении
stock_receipt_items
├── id
├── receipt_id
├── material_id
├── quantity
├── price                    -- цена за единицу
├── amount                   -- сумма позиции
└── created_at

-- Привязка материалов к услугам (для автосписания)
service_materials
├── id
├── clinic_id                -- ← RLS
├── service_id
├── material_id
├── quantity                 -- сколько списывать при оказании услуги
├── is_required              -- обязательный или опциональный
└── updated_at
```

---

## Привязка материалов к услугам

```
Услуга: "Пломба световая"
├── Материал 1: Композит (0.5 г)
├── Материал 2: Бонд (1 капля)
└── Материал 3: Анестетик (1 карпула) — опционально
```

При завершении приёма:
- Автоматически списываем материалы (если настроено)
- Или напоминаем врачу подтвердить списание
