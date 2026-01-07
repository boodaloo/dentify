# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dentify is a cloud-first SaaS platform for dental practice management. The project is currently in **Phase 1 (Planning & Design)** - no code has been written yet.

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

### AI Assistant (DentAI)

Built-in AI assistant for all user types — a key competitive advantage:

- **Technology:** Local NLU (Rasa/spaCy) + Intent Classification (~500 intents)
- **No external APIs** — all data stays on our servers (HIPAA/GDPR compliant)
- **No hallucinations** — deterministic responses via NLU + SQL queries
- **Use cases:** Patient search, schedule queries, financial reports, analytics

## Key Project Documents

- `algorithm.md` - Complete development roadmap, market analysis, monetization strategy, and technical architecture (in Russian)
- `GEMINI.md` - Main README with project vision, features, and conventions
- `ui_first_goal.md` - UI/UX design workflow from wireframing to prototyping
- `ui_ux_links.md` - Design inspiration and reference links
- `summary.md` - Project session log
- `prmt.md` - Chronological log of tasks and decisions

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
