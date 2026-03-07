# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Orisios is a cloud-first SaaS platform for dental practice management. The project is currently in **Phase 2 (Development)** — the core UI and backend are functional and deployed to the production server.

### Target Architecture

- **Backend:** Microservices architecture using Node.js (NestJS) or Python (FastAPI) with PostgreSQL
- **Main Application:** React Web App (SPA) — browser-based, no installation required
- **Mobile App:** Flutter (iOS/Android) — simplified version for on-the-go access
- **API Style:** REST or GraphQL

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
│   ├── GEMINI.md            # Project vision, features
│   ├── ui_first_goal.md     # UI/UX workflow
│   ├── BrandName.md         # Brand naming research
│   └── BrandLogo.md         # Logo concepts
│
├── backend/                 # FastAPI backend
│   ├── docs/
│   │   └── ARCHITECTURE.md  # DB schema, API design, architecture
│   ├── src/                 # Source code (TBD)
│   └── tests/               # Tests (TBD)
│
├── frontend/                # React applications
│   ├── web/                 # Main clinic web app
│   ├── widget/              # Booking widget for clinic websites
│   └── admin/               # Admin panel
│
├── mobile/                  # Flutter applications
│   ├── clinic_app/          # For clinic staff
│   └── patient_app/         # OrisiosPatient for patients
│
├── design/                  # Design assets
│   ├── ideas/               # Design inspiration, icons
│   ├── logo/                # Logo variants
│   ├── ui/                  # UI screenshots/mockups
│   └── figma/               # Figma exports
│
└── shared/                  # Shared code
    └── types/               # TypeScript types for API
```

## Key Documents

- `docs/algorithm.md` - Complete development roadmap, market analysis, monetization strategy (in Russian)
- `docs/GEMINI.md` - Main README with project vision, features, and conventions
- `docs/ui_first_goal.md` - UI/UX design workflow from wireframing to prototyping
- `backend/docs/ARCHITECTURE.md` - Database schema, API endpoints, technical architecture

## Development Phases

1. **Phase 1 (Current):** Planning & Design - UI/UX in Figma
2. **Phase 2:** Development - Backend API + Frontend apps
3. **Phase 3:** Testing & QA
4. **Phase 4:** Launch & Publication

## Backend Requirements

- Multi-tenancy with `clinic_id` isolation
- Role-Based Access Control (RBAC): global roles (Super-admin, Client-user) and clinic roles (Owner, Doctor, Administrator)
- Payment gateway integration (Stripe/Paddle) for subscriptions
- HIPAA/GDPR compliance considerations for medical data
- bcrypt for password hashing, HTTPS required

## Monetization Model

Multi-tier subscription: "Solo" (single doctor), "Clinic" (2-5 doctors), "Enterprise" (clinic networks)
