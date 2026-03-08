# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Orisios is a cloud-first SaaS platform for dental practice management. The project is currently in **Phase 2 (Development)** — the core UI and backend are functional and deployed to the production server.

### Current Tech Stack (implemented)

- **Backend:** Node.js + Express.js + TypeScript + Prisma ORM + PostgreSQL
- **Main Application:** React 18 + TypeScript + Vite (SPA) — deployed on production server
- **Deployment:** Docker Compose on VPS (`37.230.162.148`), Nginx reverse proxy
- **Auth:** JWT stored in localStorage, bcrypt password hashing
- **i18n:** i18next, English default, Russian supported
- **Mobile App:** Flutter (iOS/Android) — planned, not started
- **API Style:** REST

### Frontend Components

1. **Main Web App (React)** - Primary application for clinic staff (doctors, administrators) — works in browser
2. **Client Portal (React)** - For clinic owners to manage subscriptions (can be integrated into main app)
3. **Admin Panel (React)** - For service administrators
4. **Mobile App (Flutter)** - Companion app for quick access to schedule, notifications, patient search

### Why Web-First Architecture?

- **No installation required** — clinics start working immediately after registration
- **Always up-to-date** — all users automatically get the latest version
- **Access from any device** — works on any computer with a browser
- **Easier maintenance** — single codebase, no platform-specific builds
- **Lower development costs** — React ecosystem is mature with many ready-made components

### AI Assistant (OrisAI)

Built-in AI assistant for all user types — a key competitive advantage:

- **Technology:** Local NLU (Rasa/spaCy) + Intent Classification (~500 intents)
- **No external APIs** — all data stays on our servers (HIPAA/GDPR compliant)
- **No hallucinations** — deterministic responses via NLU + SQL queries
- **Use cases:** Patient search, schedule queries, financial reports, analytics

## Project Structure

```
dent_app/
├── docs/                    # General documentation
│   ├── algorithm.md         # Development roadmap, market analysis (RU)
│   ├── GEMINI.md            # Project vision, features, build instructions
│   ├── ui_first_goal.md     # UI/UX workflow
│   ├── BrandName.md         # Brand naming research
│   └── BrandLogo.md         # Logo concepts
│
├── backend/                 # Express.js backend (Node.js + Prisma + PostgreSQL)
│   ├── docs/
│   │   ├── ARCHITECTURE.md  # Architecture overview, two-DB design
│   │   ├── schema/          # DB schema docs: CORE, CLINICAL, FINANCE, INVENTORY
│   │   ├── features/        # Feature specs: AUTH, BILLING, WIDGET, ORISAI, etc.
│   │   └── infrastructure/  # Docker, Redis, CI/CD specs
│   ├── prisma/
│   │   ├── schema.prisma    # Full 45-table schema (implemented)
│   │   └── seed.js          # Demo data seed
│   └── src/
│       ├── controllers/     # authController, patientController, appointmentController
│       ├── routes/          # auth, patients, appointments
│       ├── middleware/       # JWT auth middleware
│       └── utils/           # JWT helpers
│
├── frontend/
│   └── web/                 # Main clinic web app (React + Vite)
│       └── src/
│           ├── components/  # Layout, Sidebar, TopHeader, Modal, PatientForm
│           ├── pages/       # 17 pages (Dashboard, Calendar, Patients,
│           │                #   PatientProfile, Settings, OnlineBooking,
│           │                #   Templates, Documents, Labs, OMS, PriceList,
│           │                #   Invoices, Inventory, Reports, CallJournal,
│           │                #   Loyalty, Analytics, Integrations)
│           ├── locales/     # en.json, ru.json
│           └── services/    # api.ts
│
├── mobile/                  # Flutter applications (planned)
├── design/                  # Design assets, Figma exports
└── shared/                  # Shared TypeScript types
```

## Key Documents

- `docs/algorithm.md` - Complete development roadmap, market analysis, monetization strategy (in Russian)
- `docs/GEMINI.md` - Main README with project vision, features, and conventions
- `docs/ui_first_goal.md` - UI/UX design workflow from wireframing to prototyping
- `backend/docs/ARCHITECTURE.md` - Database schema, API endpoints, technical architecture

## Development Phases

1. **Phase 1** ✅ Planning & Design — completed
2. **Phase 2** 🔄 Development — **in progress (current)**
   - ✅ React Web App: all 17 pages implemented and deployed
   - ✅ Express backend: auth, patients, appointments API
   - ✅ PostgreSQL schema: 45 tables (CORE / CLINICAL / FINANCE / INVENTORY)
   - ✅ Docker Compose production deployment
   - ⬜ Connect frontend pages to real API data
   - ⬜ Backend CRUD for all entities (services, invoices, inventory, etc.)
   - ⬜ Client Portal (subscription management for clinic owners)
   - ⬜ Admin Panel (internal Orisios management)
3. **Phase 3** ⬜ Testing & QA
4. **Phase 4** ⬜ Launch & Publication

## Backend Requirements

- Multi-tenancy with `clinic_id` isolation
- Role-Based Access Control (RBAC): global roles (Super-admin, Client-user) and clinic roles (Owner, Doctor, Administrator)
- Payment gateway integration (Stripe/Paddle) for subscriptions
- HIPAA/GDPR compliance considerations for medical data
- bcrypt for password hashing, HTTPS required

## Monetization Model

Multi-tier subscription: "Solo" (single doctor), "Clinic" (2-5 doctors), "Enterprise" (clinic networks)
