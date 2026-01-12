# Schema: Clinical Data

> Клинические данные: приёмы, услуги, медкарты, зубная формула.

---

## Расписание и приёмы

```sql
-- Записи на приём [SOFT DELETE]
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
├── is_deleted (0 | 1)       -- soft delete
├── deleted_at
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
```

---

## Расписание врачей

```sql
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
```

---

## Услуги и прайс

```sql
-- Услуги [SOFT DELETE]
services
├── id
├── clinic_id                -- ← RLS
├── category_id
├── name
├── code
├── price                    -- базовая цена
├── duration_minutes
├── is_active
├── is_deleted (0 | 1)       -- soft delete
├── deleted_at
└── created_at

-- Категории услуг [SOFT DELETE]
service_categories
├── id
├── clinic_id                -- ← RLS
├── name
├── sort_order
├── is_active
├── is_deleted (0 | 1)       -- soft delete
└── deleted_at

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
```

---

## Зубная формула

```sql
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
```

---

## Медицинские записи

```sql
-- Медицинские записи приёма [SOFT DELETE]
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
├── is_deleted (0 | 1)       -- soft delete
├── deleted_at
├── created_at
└── updated_at

-- Дневник врача (свободные записи)
patient_diary
├── id
├── clinic_id                -- ← RLS
├── patient_id
├── doctor_id                -- кто написал (FK → users)
├── appointment_id (nullable) -- можно привязать к приёму
├── content (TEXT)           -- текст записи (без ограничения длины)
├── record_date              -- дата записи
├── created_at
└── updated_at

-- Индекс для быстрого доступа к записям пациента
CREATE INDEX idx_diary_patient_date
ON patient_diary (clinic_id, patient_id, record_date DESC);

-- Несколько записей в день — ок
-- Каждая запись принадлежит врачу (doctor_id)
```

---

## Файлы / снимки

```sql
-- Файлы / снимки (метаданные, сами файлы в S3)
-- Отложенное удаление: deleted_at → cron удаляет из S3 через 30 дней
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
├── created_at
└── deleted_at               -- время удаления (NULL если активен)

-- Cron-задача: удалить из S3 где deleted_at < NOW() - 30 days
```
