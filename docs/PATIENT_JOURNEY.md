# Patient Journey: Complete Interaction Algorithm

## Overview

This document describes the complete patient journey from initial contact through post-treatment follow-up in the Orisios dental practice management system.

---

## 1. INITIAL CONTACT PHASE

### 1.1 Contact Channels

**BRANCH: How did patient initiate contact?**

#### Option A: Phone Call
```
1. Patient calls clinic
2. System shows caller info if existing patient (caller ID lookup)
3. Receptionist sees:
   - Patient name & history (if existing)
   - Available time slots
   - Doctor schedules
4. GO TO: Appointment Booking (Section 2)
```

#### Option B: Messenger (WhatsApp/Telegram/Facebook)
```
1. Patient sends message
2. OrisAI Bot responds instantly:
   - "Hello! I'm the assistant at [Clinic Name]. How can I help you?"
3. Bot analyzes intent:
   - Book appointment → GO TO: Automated Booking (1.2)
   - Ask question → Provide info + offer booking
   - Emergency → Escalate to receptionist + offer urgent slot
4. GO TO: Appointment Booking (Section 2)
```

#### Option C: Website/Widget
```
1. Patient visits clinic website
2. Booking widget shows:
   - Available services
   - Doctor profiles
   - Calendar with free slots
3. Patient selects:
   - Service type
   - Preferred doctor (or "any available")
   - Date & time
4. GO TO: Appointment Booking (Section 2)
```

#### Option D: Walk-in (no prior contact)
```
1. Patient enters clinic
2. GO TO: Section 3 (Arrival at Clinic)
3. Receptionist checks availability
4. IF emergency → Fit into schedule
5. IF routine → Book future appointment
```

---

## 2. APPOINTMENT BOOKING PHASE

### 2.1 New Patient Registration

**IF patient is NEW:**

```
1. Collect basic information:
   - Full name
   - Phone number
   - Email (optional)
   - Date of birth
   - Preferred communication channel

2. System creates patient record:
   - Generates unique patient_id
   - Links to clinic_id
   - Sets status: "new_patient"

3. Send confirmation:
   - SMS: "Appointment confirmed for [Date] at [Time] with Dr. [Name]"
   - Email: Includes clinic address, parking info, what to bring
   - Messenger: Confirmation + option to add to calendar

4. Add to appointment queue
5. GO TO: Pre-Visit Preparation (2.3)
```

### 2.2 Returning Patient

**IF patient EXISTS in system:**

```
1. System retrieves:
   - Patient history
   - Previous treatments
   - Outstanding balance
   - Allergies/medical conditions
   - Preferred doctor

2. Check for issues:
   - IF unpaid balance > threshold → Notify receptionist
   - IF missed appointments > 2 → Flag for confirmation call

3. Book appointment with context:
   - Suggest same doctor as before
   - Reference previous treatment plan if ongoing
   - Check if follow-up appointment was recommended

4. Send confirmation (same as new patient)
5. GO TO: Pre-Visit Preparation (2.3)
```

### 2.3 Pre-Visit Preparation

**24-48 hours before appointment:**

```
1. System automatically sends reminder:
   - SMS: "Reminder: Appointment tomorrow at [Time] with Dr. [Name]"
   - Option to confirm, reschedule, or cancel

2. IF new patient:
   - Send link to digital intake form:
     * Medical history
     * Current medications
     * Allergies
     * Insurance information
     * Consent forms

3. IF follow-up visit:
   - Remind about previous treatment plan
   - List pending procedures

4. Receptionist reviews tomorrow's schedule:
   - Prepares patient files
   - Checks for special requirements
   - Verifies insurance pre-authorization if needed
```

**2 hours before appointment:**

```
1. Send final reminder:
   - "Your appointment is in 2 hours. See you soon!"
   - Include clinic address + parking info

2. IF patient hasn't confirmed:
   - Receptionist calls to confirm
   - Mark as "confirmed" or "no-show-risk"
```

---

## 3. ARRIVAL AT CLINIC

### 3.1 Patient Enters Building

```
1. Patient walks through entrance
2. Visual cues guide to reception:
   - Clear signage
   - Welcoming environment
   - Comfortable waiting area visible
```

### 3.2 Check-In Process

**At Reception Desk:**

```
1. Receptionist greets patient:
   - "Good morning! Welcome to [Clinic Name]. Do you have an appointment?"

2. Patient provides name

3. Receptionist searches system:
   - Enters name or phone number
   - System shows appointment details

4. BRANCH: Patient Type
```

#### Path A: Expected Appointment
```
1. Receptionist confirms:
   - "Yes, I see you're scheduled with Dr. [Name] at [Time]"

2. Check-in tasks:
   - Mark patient as "arrived" in system
   - Update wait time estimate
   - Notify doctor/assistant patient is here

3. IF new patient OR first visit in 6+ months:
   - Request ID verification
   - Provide intake forms (if not completed online)
   - Collect insurance card (copy/scan)
   - Explain payment policies

4. IF returning patient:
   - "Any changes to your contact info or medical history?"
   - Update if needed

5. Direct to waiting area:
   - "Please have a seat, [Assistant/Doctor] will call you shortly"
   - Offer water, magazines, WiFi password

6. GO TO: Waiting Room (3.3)
```

#### Path B: Walk-in / No Appointment
```
1. Receptionist checks schedule:
   - "Let me check our availability"

2. IF slots available today:
   - "We can see you at [Time]. Would that work?"
   - Register as new appointment
   - GO TO: Path A (Expected Appointment)

3. IF no availability:
   - "Our next opening is [Date/Time]. Shall I book that for you?"
   - Offer emergency protocol if urgent
   - GO TO: Appointment Booking (Section 2)
```

#### Path C: Emergency/Urgent
```
1. Patient expresses pain/emergency:
   - "I have severe tooth pain"

2. Receptionist assesses:
   - Severity of pain (1-10 scale)
   - Duration of problem
   - Visible swelling/bleeding

3. Immediate actions:
   - Notify doctor immediately
   - Create urgent appointment slot
   - Fast-track check-in (minimal paperwork)
   - Bring to treatment room ASAP

4. GO TO: Treatment Room (Section 4)
```

### 3.3 Waiting Room Experience

```
1. Patient seated in waiting area
2. System tracking:
   - Wait time counter starts
   - Position in queue visible to staff
   - Alerts if wait exceeds expected time

3. Environment:
   - Comfortable seating
   - Entertainment (TV, magazines, music)
   - Refreshments available
   - Clean, calming atmosphere

4. Staff monitors:
   - Check every 10 minutes if wait > 15 minutes
   - Update patient on delays if any
   - Apologize for waits > 20 minutes

5. When ready for patient:
   - Assistant comes to waiting room
   - Calls patient by name
   - Escorts to treatment area

6. GO TO: Treatment Room (Section 4)
```

---

## 4. IN THE TREATMENT ROOM

### 4.1 Initial Greeting & Setup

```
1. Assistant/Hygienist welcomes patient:
   - "Hi [Name], please come with me"
   - Small talk to build rapport
   - Escort to treatment room

2. Room preparation:
   - "Please have a seat here"
   - Adjust chair for comfort
   - Attach bib
   - Position overhead light

3. Review appointment purpose:
   - "So today we're doing [procedure], is that correct?"
   - Confirm patient expectations

4. Quick health screening:
   - "Any changes to your health since last visit?"
   - Update medical history if needed
   - Check allergies

5. IF first visit:
   - Tour of room
   - Explain equipment
   - Build trust and comfort

6. Notify doctor:
   - "Doctor will be right in"
   - System alerts doctor patient is ready
```

### 4.2 Doctor Consultation

**BRANCH: Visit Type**

#### Type A: Initial Consultation / Comprehensive Exam
```
1. Doctor enters and greets:
   - Introduces self (if new patient)
   - Reviews chief complaint
   - "What brings you in today?"

2. Clinical examination:
   - Visual inspection
   - Periodontal probing
   - Palpation of tissues
   - TMJ assessment
   - Bite evaluation

3. Diagnostic imaging:
   - X-rays (panoramic, bitewing, periapical as needed)
   - Intraoral photos
   - 3D scan if available

4. Diagnosis & findings:
   - Document all findings in system
   - Take notes with clinical codes
   - Mark teeth on digital chart

5. Treatment planning discussion:
   - Explain findings to patient
   - Use visual aids (images, diagrams)
   - Discuss treatment options
   - Answer questions

6. Create treatment plan:
   - List all recommended procedures
   - Prioritize (urgent, important, optional)
   - Estimate timeline
   - Generate cost estimate

7. GO TO: Treatment Planning Discussion (4.3)
```

#### Type B: Specific Procedure (e.g., filling, crown, cleaning)
```
1. Doctor confirms procedure:
   - "Today we're doing [procedure] on tooth #[number]"
   - Review treatment plan from previous visit

2. Pre-procedure steps:
   - Explain what will happen
   - Discuss anesthesia options
   - Obtain consent
   - Answer any last-minute questions

3. Administer anesthesia (if needed):
   - Topical anesthetic first
   - Inject local anesthetic
   - Wait for numbness (5-10 minutes)
   - Test for adequate anesthesia

4. Perform procedure:
   - Isolation (rubber dam, cotton rolls)
   - Execute treatment
   - Assistant supports throughout
   - Communicate with patient during procedure
   - Use tell-show-do technique

5. Post-procedure steps:
   - Check occlusion/bite
   - Polish restoration
   - Remove isolation
   - Rinse patient's mouth
   - Show result with mirror

6. GO TO: Post-Treatment Instructions (4.4)
```

#### Type C: Emergency Treatment
```
1. Rapid assessment:
   - Identify source of pain
   - Take emergency X-ray if needed
   - Diagnose issue (abscess, crack, pulpitis, etc.)

2. Immediate pain relief:
   - Anesthesia
   - Drain abscess if present
   - Open tooth for drainage if needed
   - Prescribe pain medication

3. Temporary solution:
   - Temporary filling
   - Temporary crown
   - Stabilize situation

4. Plan follow-up:
   - Schedule definitive treatment
   - Provide prescriptions (antibiotics if needed)
   - Emergency contact instructions

5. GO TO: Post-Treatment Instructions (4.4)
```

### 4.3 Treatment Planning Discussion

```
1. Doctor presents treatment plan on screen:
   - Visual treatment plan with tooth chart
   - List of procedures with descriptions
   - Timeline for treatment

2. Discuss each item:
   - Why it's needed
   - What it involves
   - Expected outcome
   - Consequences of delaying

3. Financial discussion:
   - Present cost estimate
   - Break down by procedure
   - Discuss insurance coverage
   - Offer payment plans if needed

4. Patient decision:
   - BRANCH: Patient Response
```

**Patient accepts full plan:**
```
1. Schedule all appointments:
   - Prioritize by urgency
   - Consider patient availability
   - Space appropriately for healing
   - Book multiple appointments at once

2. Provide written plan:
   - Print or email treatment plan
   - Include cost breakdown
   - List scheduled appointments

3. Submit to insurance (if applicable):
   - Create pre-authorization request
   - Submit claim for pre-determination
   - Explain expected coverage

4. GO TO: Checkout (Section 5)
```

**Patient wants to think about it:**
```
1. Provide materials to review:
   - Written treatment plan
   - Educational materials
   - Contact information for questions

2. Set follow-up:
   - "When would you like us to follow up?"
   - Schedule call/email reminder
   - Leave offer open

3. GO TO: Checkout (Section 5)
```

**Patient accepts partial plan:**
```
1. Identify which procedures to do now:
   - Start with urgent items
   - Patient selects based on budget/time

2. Schedule accepted procedures:
   - Book appointments
   - Plan phased approach

3. Keep full plan on file:
   - Mark items as "pending patient decision"
   - Set reminders for future discussion

4. GO TO: Checkout (Section 5)
```

### 4.4 Post-Treatment Instructions

```
1. Doctor explains care instructions:
   - What to expect (pain, sensitivity, healing time)
   - How to care for the area
   - What to avoid (foods, activities)
   - When to call if problems arise

2. Medication instructions (if prescribed):
   - How to take
   - Frequency and duration
   - Possible side effects
   - Interactions to avoid

3. Assistant reinforces verbally:
   - Reviews key points
   - Checks patient understanding
   - "Do you have any questions?"

4. Provide written instructions:
   - Print post-op care sheet
   - Include emergency contact number
   - Email instructions as well

5. Schedule follow-up:
   - IF ongoing treatment → Book next appointment
   - IF completed → Schedule 6-month checkup
   - IF complication risk → Book 1-week follow-up

6. Escort to checkout:
   - "Let me walk you to the front desk"
   - Ensure patient is stable (not dizzy from anesthesia)

7. GO TO: Checkout (Section 5)
```

---

## 5. CHECKOUT & PAYMENT

### 5.1 At Reception Desk

```
1. Receptionist reviews visit:
   - "How did everything go?"
   - Note patient feedback in system

2. Retrieve billing information:
   - System shows procedures completed today
   - Calculates charges
   - Applies insurance estimates
   - Shows patient responsibility

3. Present bill:
   - Itemized statement
   - Explain charges
   - Show insurance coverage (if applicable)
   - Patient portion highlighted
```

### 5.2 Payment Processing

**BRANCH: Payment Method**

#### Option A: Insurance + Patient Payment
```
1. Verify insurance information:
   - Confirm coverage details
   - Explain what's covered vs. patient portion

2. Collect patient portion:
   - "Your portion today is $[amount]"
   - Accept payment method
   - Process payment

3. File insurance claim:
   - Submit electronically
   - Provide claim number
   - Explain reimbursement timeline

4. Provide receipt:
   - Print detailed receipt
   - Email copy
   - Note balance if any

5. GO TO: Appointment Confirmation (5.3)
```

#### Option B: Full Patient Payment
```
1. Present total:
   - "Your total today is $[amount]"

2. Accept payment:
   - Cash
   - Credit/Debit card
   - Digital wallet (Apple Pay, Google Pay)
   - HSA/FSA card

3. Process payment:
   - Run transaction
   - Print receipt
   - Email receipt

4. GO TO: Appointment Confirmation (5.3)
```

#### Option C: Payment Plan
```
1. Patient requests payment plan:
   - "Can I pay this over time?"

2. Present options:
   - In-house financing terms
   - Third-party financing (CareCredit, etc.)
   - Explain interest and terms

3. Set up plan:
   - Collect down payment
   - Complete financing application
   - OR set up installment schedule in system
   - Provide payment schedule

4. Provide receipt for down payment
5. GO TO: Appointment Confirmation (5.3)
```

#### Option D: Balance Carried Forward
```
1. IF patient cannot pay today:
   - Note balance in account
   - Set payment due date
   - Explain late fees if applicable

2. Provide statement:
   - Current balance
   - Due date
   - Payment options

3. Set reminder:
   - System schedules payment reminder
   - Follow-up call if not paid by due date

4. GO TO: Appointment Confirmation (5.3)
```

### 5.3 Appointment Confirmation

```
1. Review scheduled appointments:
   - "You're scheduled next on [Date] at [Time]"
   - Confirm patient has it noted

2. Provide appointment card:
   - Print card with date/time
   - OR send calendar invite
   - Add to patient's mobile calendar

3. Remind about preparation:
   - IF next visit requires preparation (fasting, etc.)
   - Explain what's needed

4. Offer appointment reminders:
   - Confirm preferred contact method
   - SMS, email, or phone call
```

### 5.4 Farewell

```
1. Receptionist wraps up:
   - "Is there anything else I can help you with?"
   - Answer any final questions

2. Thank patient:
   - "Thank you for choosing [Clinic Name]"
   - Hand any take-home materials
   - Prescriptions if applicable

3. Guide to exit:
   - "The exit is right there. Have a great day!"

4. Note in system:
   - Patient checked out at [Time]
   - Update appointment status to "completed"

5. GO TO: Post-Visit Phase (Section 6)
```

---

## 6. POST-VISIT PHASE

### 6.1 Immediate Follow-Up (Same Day)

```
1. System automatically records:
   - Procedures completed
   - Payments processed
   - Next appointments scheduled
   - Materials provided to patient

2. IF high-risk procedure (extraction, surgery):
   - Schedule automatic check-in call for evening
   - Assistant calls patient:
     * "How are you feeling?"
     * "Any excessive bleeding or pain?"
     * "Do you have your medications?"
     * Answer questions
     * Escalate to doctor if issues
```

### 6.2 24-Hour Follow-Up

```
1. For significant procedures:
   - Send automated SMS/email:
     * "How are you feeling after your procedure?"
     * Link to rate pain level
     * Option to request callback

2. IF patient reports issues:
   - Notify clinical team
   - Call patient to assess
   - Schedule urgent follow-up if needed

3. IF no response:
   - Assume patient is doing well
   - Note in record
```

### 6.3 Review & Rating Request

```
1. 2-3 days after visit:
   - Send satisfaction survey:
     * "How was your experience at [Clinic Name]?"
     * Star rating (1-5)
     * Optional comments
     * Net Promoter Score question

2. IF rating ≥ 4 stars:
   - Request online review:
     * "Would you mind sharing your experience on Google?"
     * Provide direct link
     * Thank you message

3. IF rating < 4 stars:
   - Internal alert to management:
     * Follow up personally
     * Resolve any issues
     * Prevent negative public review
     * Learn and improve
```

### 6.4 Treatment Plan Follow-Up

**IF patient has pending treatment:**

```
1. One week after visit:
   - Send reminder about treatment plan:
     * "We have your treatment plan ready"
     * List pending procedures
     * Offer to schedule

2. Two weeks after visit:
   - Personal call from receptionist:
     * "Just checking if you'd like to schedule your treatment"
     * Address any concerns
     * Offer flexible scheduling

3. One month after visit:
   - Final reminder:
     * Email summary of recommended treatment
     * Note urgency if applicable
     * Offer consultation if questions

4. IF no response:
   - Mark as "patient deferred"
   - Set reminder to mention at next routine visit
```

### 6.5 Pre-Appointment Reminder (for next visit)

```
→ GO TO: Section 2.3 (Pre-Visit Preparation)
```

### 6.6 Reactivation Protocol

**IF patient hasn't visited in 6+ months:**

```
1. Automated reminder:
   - "It's been a while! Time for your checkup?"
   - Offer easy scheduling link

2. After 9 months:
   - Personal outreach:
     * Call or text
     * "We miss you! Would you like to schedule?"
     * Special offer if appropriate

3. After 12 months:
   - Final outreach:
     * Personalized email from dentist
     * Emphasize importance of regular care
     * Offer convenient times

4. After 18 months:
   - Mark as inactive
   - Remove from active recall list
   - Keep record for future return
```

---

## 7. ONGOING RELATIONSHIP MANAGEMENT

### 7.1 Birthday & Special Occasions

```
1. On patient's birthday:
   - Send personalized message:
     * "Happy Birthday from [Clinic Name]!"
     * Optional: Small discount or gift

2. Clinic anniversary:
   - "It's been [X years] since your first visit!"
   - Thank you message
```

### 7.2 Educational Content

```
1. Monthly newsletter (optional):
   - Oral health tips
   - Clinic news
   - Staff spotlights
   - Seasonal advice

2. Targeted education:
   - Based on patient's treatment history
   - "Tips for caring for your new crown"
   - "How to maintain your dental implants"
```

### 7.3 Referral Program

```
1. IF patient refers friend:
   - Send thank you message
   - Apply referral reward
   - Track referral source

2. Encourage referrals:
   - Periodic reminder about referral program
   - Share program details
```

### 7.4 Insurance & Account Updates

```
1. Before insurance renewal:
   - Remind patient to use benefits
   - "Your insurance benefits expire soon!"

2. IF payment plan active:
   - Send monthly statements
   - Auto-charge if authorized
   - Confirm payment received
```

---

## 8. EXCEPTIONAL SITUATIONS

### 8.1 No-Show Protocol

```
1. Patient doesn't arrive for appointment:
   - Wait 15 minutes past appointment time
   - Call/text patient:
     * "We have you scheduled for [Time]. Are you on your way?"

2. IF no response:
   - Mark as "no-show" in system
   - Send message:
     * "We're sorry we missed you today"
     * Link to reschedule

3. IF repeat no-shows (3+):
   - Flag account
   - Require deposit for future appointments
   - OR require 48-hour advance booking only
```

### 8.2 Late Cancellation

```
1. Patient cancels with <24 hours notice:
   - Note in system
   - Explain cancellation policy

2. IF frequent late cancellations:
   - Implement deposit requirement
   - OR restrict scheduling
```

### 8.3 Dissatisfied Patient

```
1. Patient expresses dissatisfaction:
   - Listen actively
   - Empathize
   - Don't be defensive
   - "I understand your concern"

2. Immediate escalation:
   - Involve manager or dentist
   - Investigate issue
   - Propose solution

3. Resolution:
   - Offer appropriate remedy
   - Discount, refund, or redo procedure
   - Follow up to ensure satisfaction

4. Document:
   - Record complaint and resolution
   - Learn from incident
   - Train staff if needed
```

### 8.4 Medical Emergency in Office

```
1. Recognize emergency:
   - Chest pain, difficulty breathing, seizure, etc.

2. Immediate response:
   - Call 911
   - Doctor provides emergency care
   - Use emergency kit/AED if needed
   - Clear area

3. Document:
   - Record all details
   - Times, actions taken, patient condition

4. Follow-up:
   - Contact patient/family next day
   - Review emergency protocols
   - Update emergency supplies
```

---

## 9. SYSTEM TRACKING & METRICS

Throughout the patient journey, the Orisios system tracks:

```
1. Touchpoint metrics:
   - Source of appointment (phone, web, walk-in, referral)
   - Response time to inquiries
   - Booking conversion rate
   - Confirmation rate

2. Experience metrics:
   - Wait time (scheduled vs actual)
   - Visit duration
   - No-show rate
   - Cancellation rate

3. Clinical metrics:
   - Treatment acceptance rate
   - Procedures per visit
   - Case completion rate
   - Recall compliance

4. Financial metrics:
   - Revenue per visit
   - Collection rate
   - Outstanding balances
   - Payment plan compliance

5. Satisfaction metrics:
   - Patient satisfaction scores
   - Net Promoter Score
   - Online review ratings
   - Referral rate

6. Retention metrics:
   - Patient lifetime value
   - Retention rate
   - Reactivation success
   - Churn rate
```

---

## 10. SUCCESS CRITERIA

**Patient leaves with a beautiful smile when:**

✅ Pain or concern addressed completely
✅ Clear understanding of oral health status
✅ Confidence in treatment plan
✅ Financial arrangements comfortable
✅ Next steps clearly scheduled
✅ Post-care instructions understood
✅ Feel valued and respected
✅ Trust in doctor and team established
✅ Excited to return (not dreading it)
✅ Likely to recommend clinic to others

---

## ALGORITHM SUMMARY

```
START
  ↓
1. INITIAL CONTACT → [Phone | Messenger | Website | Walk-in]
  ↓
2. BOOKING → [New Patient | Returning Patient] → Pre-Visit Prep
  ↓
3. ARRIVAL → Check-in → Waiting Room
  ↓
4. TREATMENT → [Consultation | Procedure | Emergency] → Post-Treatment
  ↓
5. CHECKOUT → Payment → Appointment Confirmation → Farewell
  ↓
6. POST-VISIT → Follow-up → Satisfaction → Next Visit Reminder
  ↓
7. ONGOING → Recalls | Education | Relationship Building
  ↓
[LOOP BACK to appropriate step based on patient needs]
  ↓
END (Patient with beautiful, healthy smile ✨)
```

---

**END OF PATIENT JOURNEY ALGORITHM**
