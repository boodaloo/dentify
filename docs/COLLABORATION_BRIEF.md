# iStom: Project Collaboration Brief

## 1. Executive Summary
**iStom** is a cloud-first, all-in-one SaaS platform designed to modernize dental practice management. 
Our vision is to replace outdated, server-based legacy software with a sleek, intuitive web-based solution that streamlines clinic operations, enhances patient engagement, and automates administrative tasks via an intelligent AI assistant.

This document aggregates the core ideas, features, and algorithmic workflows of the project to ensure all collaborators share a unified understanding of the product.

---

## 2. Core Value Proposition
The market is shifting from expensive, difficult-to-maintain on-premise software to flexible cloud solutions. iStom addresses this by offering:
*   **All-in-One Cloud Architecture**: No servers to install. Accessible from any device (PC, Tablet, Mobile). Automatic updates.
*   **Superior UX/UI**: A design-first approach inspired by modern productivity tools (like Notion or Linear) rather than clunky enterprise software.
*   **Patient-Centric Features**: Online booking, automated reminders, and a patient portal are core features, not afterthoughts.
*   **Intelligent Automation**: Built-in specialized AI to handle queries like "Show me patients who haven't visited in 6 months" or "Reschedule John Doe to next Tuesday."

---

## 3. High-Level Architecture
We follow a **Web-First** strategy.
*   **Main Product (Web App)**: React + TypeScript. A full-featured desktop-class application running in the browser. Used by doctors and receptionists.
*   **Mobile Companion (Flutter)**: iOS/Android app. Simplified functionality for doctors on the go (schedule view, quick patient lookup).
*   **Backend (Microservices)**: Node.js (NestJS) or Python (FastAPI) + PostgreSQL. Designed for multi-tenancy (SaaS) where each clinic's data is strictly isolated.
*   **AI Service**: A dedicated microservice handling Natural Language Understanding (NLU) to translate user questions into database queries.

---

## 4. Key Features & Functionality

### 4.1 Clinic Management (The "ERP" Part)
*   **Smart Scheduler**: Drag-and-drop appointment calendar with multiple views (Day/Week, by Doctor).
*   **Electronic Health Records (EHR)**: Interactive dental charting (odontogram), treatment planning, and medical history.
*   **Financials**: Automated invoicing, payment processing (Stripe integration), and insurance claim tracking.
*   **Analytics Dashboard**: Real-time metrics on revenue (MRR), patient retention, and doctor performance.

### 4.2 Patient Engagement
*   **Online Booking Widget**: Embeddable on clinic websites.
*   **Automated Reminders**: SMS/WhatsApp reminders to reduce no-shows.
*   **Patient Portal**: A dedicated area for patients to view their history, pay bills, and sign consent forms digitally.

### 4.3 iStomAI (The "Killer Feature")
A specialized assistant that understands dental context.
*   **Natural Language Queries**: Instead of clicking 10 filters, a user types: *"List all patients with outstanding balances > $500."*
*   **Privacy-Focused**: Uses local NLU models (or private cloud endpoints) to ensure patient data never leaks to public AI models like ChatGPT.

---

## 5. The "Algorithm": Patient Journey Workflow
Understanding the flow of a patient through the system is critical for developing the right features.

### Phase 1: Inbound & Booking
1.  **Contact**: Patient calls or uses the Web Widget.
2.  **Identification**: System identifies returning patients immediately via Caller ID or email match.
3.  **Booking**: 
    *   **New Patients**: System collects minimum viable info (Name, Phone) -> Sends digital intake form link (medical history, consent).
    *   **Returning**: System checks for outstanding balances or incomplete treatment plans before booking.
4.  **Confirmation**: Automated SMS/Email sent with calendar invite and preparation instructions.

### Phase 2: Arrival & Check-In
1.  **Reception**: Patient arrives. Receptionist marks status as "Arrived" in the dashboard.
2.  **Verification**: System flags if insurance info or signatures are missing.
3.  **Queue**: Patient appears in the specific Doctor's "Waiting Room" list.

### Phase 3: Treatment (Clinical Workflow)
1.  **Intake**: Assistant reviews medical history updates on a tablet.
2.  **Exam**: Doctor performs exam. Findings are entered into the **Odontogram** (visual tooth chart).
3.  **Planning**: System generates a **Treatment Plan** with cost estimates.
4.  **Consent**: Patient reviews the plan on screen and digitally signs.
5.  **Procedure**: Treatment is performed and clinical notes are logged (often using voice-to-text).

### Phase 4: Checkout & Payment
1.  **Handover**: Patient returns to front desk.
2.  **Billing**: System auto-calculates the invoice based on *completed* procedures from the Treatment Plan.
3.  **Payment**: Insurance claims are generated. Patient pays their portion (Co-pay).
4.  **Scheduling**: Follow-up appointment is booked immediately based on the Treatment Plan's next phase.

### Phase 5: Retention Loop
1.  **Post-Op**: Automated "How are you feeling?" check-in sent 24h later.
2.  **Review**: If the feedback is positive, system requests a Google Review.
3.  **Recall**: If no appointment is booked, system enters patient into a "Recall Loop" (e.g., 6-month checkup reminder).

## 6. Business Model
*   **SaaS Subscription**:
    *   **Solo**: For individual practitioners.
    *   **Clinic**: For small teams (includes advanced reporting & AI).
    *   **Enterprise**: For multi-location chains (API access, custom integrations).
*   **Monetization Strategy**: Free 14-day trial -> Monthly/Yearly recurring revenue.


