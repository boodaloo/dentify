# Schema: Finance

> Финансовые данные: счета, оплаты, баланс пациента, бонусы, система лояльности.

---

## Счета и оплаты

```sql
-- Счета пациентам [SOFT DELETE]
fin_invoices
├── id
├── clinic_id                -- ← RLS
├── patient_id
├── appointment_id (nullable)
├── total_amount
├── paid_amount
├── status (pending | partial | paid | cancelled)
├── created_by_user_id
├── is_deleted (0 | 1)       -- soft delete
├── deleted_at
├── created_at
└── updated_at

-- Оплаты от пациентов [SOFT DELETE]
fin_payments
├── id
├── invoice_id
├── amount
├── method (cash | card | transfer | balance)  -- balance = с баланса
├── balance_cash_used        -- сколько списано с нал. баланса (для method=balance)
├── balance_card_used        -- сколько списано с безнал. баланса (для method=balance)
├── received_by_user_id
├── is_deleted (0 | 1)       -- soft delete
├── deleted_at
└── created_at
```

---

## Баланс пациента

Раздельный учёт наличных и безналичных средств.

```sql
-- Баланс пациента (раздельный учёт нал/безнал)
fin_balances
├── id
├── clinic_id                -- ← RLS
├── patient_id (UNIQUE per clinic)
├── cash_balance             -- баланс наличных
├── card_balance             -- баланс безналичных
└── updated_at

-- История операций с балансом
fin_balance_transactions
├── id
├── clinic_id                -- ← RLS
├── patient_id
├── type (deposit | withdrawal)  -- пополнение | списание
├── amount                   -- общая сумма операции
├── cash_amount              -- сколько наличных в операции
├── card_amount              -- сколько безнала в операции
├── balance_cash_after       -- остаток наличных после
├── balance_card_after       -- остаток безнала после
├── source_type              -- 'manual', 'payment', 'refund'
├── source_id (nullable)     -- ID оплаты/возврата
├── invoice_id (nullable)    -- какой счёт оплачен (для withdrawal)
├── description              -- "Пополнение баланса", "Оплата счёта №123"
├── created_by_user_id       -- кто провёл операцию
├── receipt_number (nullable) -- номер чека
└── created_at
```

### Примеры операций

```
1. Пополнение 10,000₽ нал    → type=deposit, cash_amount=10000, card_amount=0
2. Пополнение 5,000₽ безнал  → type=deposit, cash_amount=0, card_amount=5000
3. Оплата счёта 7,000₽       → type=withdrawal, cash_amount=3000, card_amount=4000
   (смешанная: 3000 нал + 4000 безнал, если на балансе cash=3000, card=5000)
```

---

## Бонусная система

```sql
-- Бонусный баланс пациента (по клиникам)
fin_bonuses
├── id
├── clinic_id                -- ← RLS
├── patient_id
├── balance                  -- текущий баланс баллов
├── total_earned             -- всего начислено за всё время
├── total_spent              -- всего списано за всё время
└── updated_at

-- История операций с бонусами
fin_bonus_transactions
├── id
├── clinic_id                -- ← RLS
├── patient_id
├── amount                   -- положительное = начисление, отрицательное = списание
├── balance_after            -- баланс после операции
├── type (earned | spent | expired | manual)
├── source_type              -- 'appointment', 'referral', 'promo', 'manual'
├── source_id (nullable)     -- ID записи/акции/etc
├── description              -- "За визит 15.01.2025", "Списание при оплате"
├── created_by_user_id       -- кто начислил/списал (для manual)
└── created_at

-- Правила начисления бонусов
fin_bonus_rules
├── id
├── clinic_id                -- ← RLS
├── name                     -- "За визит", "За приглашённого друга"
├── type (percent | fixed)   -- процент от чека или фиксированная сумма
├── value                    -- 5 (%) или 100 (баллов)
├── min_check_amount         -- минимальная сумма чека (nullable)
├── is_active
└── created_at
```

---

## Система лояльности

```sql
-- Уровни лояльности (Серебряный, Золотой, Платиновый)
fin_loyalty_tiers
├── id
├── clinic_id                -- ← RLS
├── name                     -- "Серебряный", "Золотой", "Платиновый"
├── min_total_spent          -- от какой суммы покупок (накопительно)
├── bonus_multiplier         -- множитель бонусов (1.0, 1.5, 2.0)
├── discount_type (percent | fixed)  -- тип скидки
├── discount_value           -- 10 (%) или 500 (₽)
├── color                    -- цвет для UI (#C0C0C0, #FFD700, #E5E4E2)
├── sort_order
├── is_active
└── created_at

-- Акции / Промо-кампании
fin_promotions
├── id
├── clinic_id                -- ← RLS
├── name                     -- "Скидка 20% на чистку"
├── description              -- описание для пациентов
├── type (discount_percent | discount_fixed | bonus_multiply | free_service)
├── value                    -- 20 (%) или 500 (₽) или 2 (x2 бонусы)
├── start_date
├── end_date
├── min_check_amount         -- мин. сумма чека (nullable)
├── max_uses_total           -- лимит использований всего (nullable)
├── max_uses_per_patient     -- лимит на пациента (nullable)
├── promo_code (nullable)    -- "SUMMER2025" (для ввода вручную)
├── is_active
├── created_at
└── updated_at

-- Услуги, участвующие в акции
fin_promotion_services
├── id
├── promotion_id
├── service_id               -- FK → clin_services
└── discount_override        -- своя скидка для этой услуги (nullable)

-- Использование акций (история)
fin_promotion_usages
├── id
├── clinic_id                -- ← RLS
├── promotion_id
├── patient_id
├── appointment_id (nullable)
├── invoice_id (nullable)
├── discount_amount          -- сколько сэкономил
├── promo_code_used          -- какой код ввёл (если был)
└── created_at
```

### Примеры акций

```
1. "Скидка 20% на отбеливание" → type=discount_percent, value=20
2. "500₽ скидка при чеке от 5000₽" → type=discount_fixed, value=500, min_check=5000
3. "Двойные бонусы в июне" → type=bonus_multiply, value=2
4. "Бесплатная консультация" → type=free_service + promotion_services
```
