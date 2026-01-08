# Dentify: A Modern Dental Practice Management Platform

## Current Status: Phase 1 (Planning & Design)

We have completed the initial project planning, including market analysis, feature definition, and monetization strategy.

We are now actively in the **UI/UX Design** phase. The core focus is on creating a complete, interactive prototype in Figma, which will serve as the blueprint for development. Key project artifacts like `algorithm.md` (the initial deep-dive plan), `ui_ux_links.md` (design inspiration), and `ui_first_goal.md` (our design workflow) have been created.

## Project Overview

This project is the creation of **Dentify**, a modern, cloud-first, all-in-one SaaS (Software as a Service) platform designed to manage all aspects of a dental practice. The application is **web-based** (works in any modern browser) with a companion mobile app for iOS and Android.

The core vision is to provide a user-friendly, intuitive, and powerful tool that streamlines clinic operations, enhances patient engagement, and provides a clear path to monetization.

**Why Web-First?** Dental clinics work from stationary computers at reception desks and in doctor's offices. A web application provides instant access without installation, automatic updates, and the ability to work from any device with a browser.

### Key Features:

*   **All-in-One Cloud Platform:** A fully cloud-based solution.
*   **Superior User Experience (UX):** A clean, modern, and intuitive interface.
*   **Patient Engagement Portal:** Online booking, history, and payments for patients.
*   **Comprehensive Patient Records:** Detailed digital patient cards.
*   **Advanced Scheduling:** A graphical interface for managing appointments.
*   **Billing & Invoicing:** Creation of invoices, payment processing, and reporting.
*   **Customizable Document Constructor:** A tool to create custom templates.
*   **Price List Management:** Import and manage service price lists.
*   **AI Assistant (DentAI):** Built-in intelligent assistant for natural language queries — find patients, check schedules, generate reports, all by simply asking.

### Monetization Model:

The project will be monetized via a multi-tiered subscription model (e.g., "Solo", "Clinic", "Enterprise") with a free trial period.

## System Architecture

The Dentify platform will be built on a **microservices architecture** following DevOps principles. The backend will consist of several small, independent services (e.g., Patient Service, Appointment Service, Billing Service), each communicating via APIs.

The frontend ecosystem will include:
1.  **Main Web Application (React):** The primary browser-based application for clinic staff (doctors, administrators). This is the main product.
2.  **Admin Panel (React):** For service administrators to manage all clinics and subscriptions.
3.  **Client Portal (React):** For clinic owners to manage their accounts and subscriptions (can be integrated into the main app).
4.  **Mobile App (Flutter):** A companion app for iOS/Android with simplified functionality (schedule view, notifications, quick patient search).

The **AI Service** is a separate microservice:
*   **Technology:** Local NLU engine (Rasa/spaCy) with ~500 predefined intents
*   **Privacy:** All processing happens on our servers — no data sent to external AI providers
*   **Function:** Translates natural language queries into database operations
*   **Security:** Read-only access, clinic-scoped data isolation, full audit logging

## Building and Running

This section will be updated with specific commands as the project is developed.

### 1. Backend (Microservices)

*   **Technology:** Node.js (NestJS) or Python (FastAPI), with PostgreSQL.
*   **Setup:** `TODO`
*   **Run:** `TODO`

### 2. Frontend - Main Web App (React)

*   **Technology:** React, TypeScript, Vite/Next.js.
*   **Setup:** `TODO`
*   **Run:** `TODO`

### 3. Frontend - Mobile App (Flutter)

*   **Technology:** Flutter (iOS/Android).
*   **Setup:** `TODO`
*   **Run:** `TODO`

## Development Conventions

*   **Version Control:** Git (repository to be created on GitHub or GitLab).
*   **Task Management:** A project board will be used (e.g., Trello, Jira).
*   **Design:** All UI/UX work (wireframes, mockups, interactive prototypes) will be done in **Figma**. The Figma project serves as the single source of truth for design.
*   **API Style:** The backend services will expose REST or GraphQL APIs.
*   **Security:**
    *   All communication will be over HTTPS (SSL).
    *   Passwords will be securely hashed using `bcrypt`.
    *   Regular database backups will be configured.
*   **Access Control:** A robust Role-Based Access Control (RBAC) system will be implemented.
*   **Code Style:** Linters and formatters will be configured for each project component.
