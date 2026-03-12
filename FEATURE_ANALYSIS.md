# Feature Analysis: Orisios vs Competitor (FID)

> Last updated: 2026-03-12

## Competitor Pricing Tiers (FID)

| Tier             | Price/month | Target         |
|------------------|-------------|----------------|
| Лайт             | 5 000 ₽     | Solo practice  |
| Базовый          | 7 000 ₽     | Small clinic   |
| Всё включено     | 9 000 ₽     | Full clinic    |

---

## Feature Comparison

### Medical Block

| Feature                          | FID (Лайт) | FID (Базовый) | FID (Всё вкл.) | Orisios        | Priority |
|----------------------------------|:----------:|:-------------:|:--------------:|----------------|----------|
| Dental chart (зубная карта)      | ✅         | ✅            | ✅             | ✅ implemented | —        |
| Treatment plan                   | ✅         | ✅            | ✅             | ✅ implemented | —        |
| Medical documents / Templates    | ✅         | ✅            | ✅             | ✅ implemented | —        |
| Lab orders (Лабы)                | ✅         | ✅            | ✅             | ✅ implemented | —        |
| Images / X-ray gallery           | ✅         | ✅            | ✅             | ✅ implemented | —        |
| Diagnoses (МКБ/МКБ-С)           | ✅         | ✅            | ✅             | ⬜ missing UI  | Medium   |

### Administrative Block

| Feature                          | FID (Лайт) | FID (Базовый) | FID (Всё вкл.) | Orisios        | Priority |
|----------------------------------|:----------:|:-------------:|:--------------:|----------------|----------|
| Calendar / Schedule              | ✅         | ✅            | ✅             | ✅ implemented | —        |
| Doctor columns view              | ❓         | ✅            | ✅             | ✅ implemented | —        |
| Doctor schedules                 | ✅         | ✅            | ✅             | ✅ implemented | —        |
| Patient list / CRM               | ✅         | ✅            | ✅             | ✅ implemented | —        |
| Patient profile                  | ✅         | ✅            | ✅             | ✅ implemented | —        |
| Invoices / Payments              | ✅         | ✅            | ✅             | ✅ implemented | —        |
| Price list (Прейскурант)         | ✅         | ✅            | ✅             | ✅ implemented | —        |
| Staff management                 | ✅         | ✅            | ✅             | ✅ implemented | —        |
| Task manager (Постановщик задач) | ✅         | ✅            | ✅             | ❌ missing     | **HIGH** |
| Waiting list                     | ❓         | ✅            | ✅             | ❌ missing     | Medium   |
| Call journal                     | ✅         | ✅            | ✅             | ✅ implemented | —        |

### Reports & Analytics

| Feature                          | FID (Лайт) | FID (Базовый) | FID (Всё вкл.) | Orisios        | Priority |
|----------------------------------|:----------:|:-------------:|:--------------:|----------------|----------|
| Basic reports                    | ✅         | ✅            | ✅             | ✅ implemented | —        |
| Financial analytics              | ✅         | ✅            | ✅             | ✅ implemented | —        |
| Cohort analytics                 | ❌         | ✅            | ✅             | ⬜ partial     | Medium   |
| Budget / Clinic profit page      | ❌         | ✅            | ✅             | ⬜ missing UI  | Medium   |
| Funnel / Conversion              | ❌         | ❌            | ✅             | ❌ missing     | Low      |
| Staff KPIs                       | ❌         | ✅            | ✅             | ❌ missing     | Medium   |

### Integrations & Compliance

| Feature                          | FID (Лайт) | FID (Базовый) | FID (Всё вкл.) | Orisios        | Priority |
|----------------------------------|:----------:|:-------------:|:--------------:|----------------|----------|
| Online booking widget            | ✅         | ✅            | ✅             | ✅ implemented | —        |
| SMS / WhatsApp reminders         | ✅         | ✅            | ✅             | ⬜ page only   | Medium   |
| ЕГИСЗ (Russian state reporting)  | ❌         | ❌            | ✅             | ❌ missing     | **HIGH** |
| ДМС / Insurance                  | ❌         | ❌            | ✅             | ✅ implemented | —        |
| IP-telephony / CallJournal       | ❌         | ✅            | ✅             | ✅ implemented | —        |
| Loyalty / Discounts              | ❌         | ❌            | ✅             | ✅ implemented | —        |
| Inventory management             | ❌         | ✅            | ✅             | ✅ implemented | —        |

### Platform

| Feature                          | FID        | Orisios        | Priority |
|----------------------------------|------------|----------------|----------|
| Web app                          | ✅         | ✅             | —        |
| Mobile app (iOS/Android)         | ✅         | ❌ planned     | High     |
| Multi-branch support             | ✅         | ✅             | —        |
| Storage management UI            | ✅         | ❌ missing UI  | Medium   |
| Messenger / Internal chat        | ✅         | ❌ missing     | Low      |
| AI assistant / Triggers          | ❌         | ⬜ planned     | Low      |
| Coordinators module              | ✅         | ❌ missing     | Low      |

---

## Priority Gap Summary

### HIGH priority (blocks competitiveness)
1. **Task manager** — present in all FID tiers; essential for clinic workflow coordination
2. **ЕГИСЗ integration** — required by Russian law for medical reporting; present in FID top tier
3. **Mobile app** — FID has it; major convenience gap for doctors

### MEDIUM priority (differentiators)
4. Budget / Profit pages — backend DB exists, just need UI
5. Staff KPI reports — extends existing Analytics page
6. SMS/WhatsApp reminders — integrations page exists, needs backend hooks
7. Cohort analytics — extend existing Analytics.tsx
8. Storage management UI — backend file handling exists
9. Waiting list

### LOW priority (nice to have)
10. Funnel / Conversion analytics
11. Coordinators module
12. Messenger / Internal chat
13. OrisAI triggers

---

## Orisios Unique Advantages

- **Doctor columns calendar view** — not visible in FID
- **AI assistant (OrisAI)** — local NLU, no external API, HIPAA/GDPR compliant
- **Modern SaaS architecture** — cloud-first, no installation, always up-to-date
- **Open design** — easy to embed, extend via REST API
- **Competitive pricing potential** — similar feature set can be priced more aggressively

---

## Competitor Pricing Context

FID charges 5 000–9 000 ₽/month per clinic. Orisios planned tiers:
- Solo: ~2 000–3 000 ₽/month
- Clinic: ~5 000–6 000 ₽/month
- Enterprise: custom

Closing the HIGH-priority gaps (task manager + ЕГИСЗ) makes Orisios competitive at the "Базовый" tier level.
