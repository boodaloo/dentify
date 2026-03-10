/*
  Warnings:

  - You are about to drop the `Clinic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Patient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('PHONE', 'EMAIL', 'ADDRESS');

-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('EXAMINATION', 'TREATMENT', 'CONSULTATION');

-- CreateEnum
CREATE TYPE "ToothStatus" AS ENUM ('HEALTHY', 'CARIES', 'FILLED', 'CROWN', 'EXTRACTED', 'IMPLANT', 'BRIDGE', 'MISSING', 'PROSTHESIS', 'VENEER', 'INLAY');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('XRAY', 'PHOTO', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'BALANCE', 'INSURANCE');

-- CreateEnum
CREATE TYPE "BalanceTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL');

-- CreateEnum
CREATE TYPE "BonusTransactionType" AS ENUM ('EARNED', 'SPENT', 'EXPIRED', 'MANUAL');

-- CreateEnum
CREATE TYPE "BonusRuleType" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('DISCOUNT_PERCENT', 'DISCOUNT_FIXED', 'BONUS_MULTIPLY', 'FREE_SERVICE');

-- CreateEnum
CREATE TYPE "ContractorType" AS ENUM ('SUPPLIER', 'LAB', 'OTHER');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "WidgetBookingStatus" AS ENUM ('NEW', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TreatmentPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LabOrderStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LabType" AS ENUM ('LAB', 'TECHNICIAN');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('DMS', 'OMS');

-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('FIXED', 'PERCENT', 'MIXED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('SMS', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationEventType" AS ENUM ('APPOINTMENT_CREATED', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'APPOINTMENT_REMINDER', 'BIRTHDAY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "RelativeType" AS ENUM ('PARENT', 'SPOUSE', 'CHILD', 'GUARDIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "CashFlowDirection" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "CallDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "CallResult" AS ENUM ('ANSWERED', 'MISSED', 'BUSY', 'VOICEMAIL');

-- CreateEnum
CREATE TYPE "PatientReferralSource" AS ENUM ('INTERNET', 'RECOMMENDATION', 'ADVERTISEMENT', 'SOCIAL_MEDIA', 'WALK_IN', 'OTHER');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'OWNER';

-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_clinicId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_clinicId_fkey";

-- DropTable
DROP TABLE "Clinic";

-- DropTable
DROP TABLE "Patient";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "core_clinics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "inn" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "core_clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_clinic_settings" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Moscow',
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD.MM.YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '24h',
    "appointmentDurationDefault" INTEGER NOT NULL DEFAULT 30,
    "workingHoursStart" TEXT NOT NULL DEFAULT '09:00',
    "workingHoursEnd" TEXT NOT NULL DEFAULT '21:00',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "core_clinic_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_widget_settings" (
    "clinicId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "allowedDomains" TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "theme" JSONB,
    "showDoctors" BOOLEAN NOT NULL DEFAULT true,
    "availableServiceIds" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "core_widget_settings_pkey" PRIMARY KEY ("clinicId")
);

-- CreateTable
CREATE TABLE "core_branches" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "color" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "workingHoursStart" TEXT,
    "workingHoursEnd" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "core_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_rooms" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "core_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_specializations" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "core_specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_users" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "color" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'DOCTOR',
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "specializationId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "core_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_user_branches" (
    "userId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "accessLevel" TEXT NOT NULL DEFAULT 'full',

    CONSTRAINT "core_user_branches_pkey" PRIMARY KEY ("userId","branchId")
);

-- CreateTable
CREATE TABLE "core_patients" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "birthDate" TIMESTAMP(3),
    "gender" TEXT,
    "allergies" TEXT,
    "notes" TEXT,
    "referralSource" "PatientReferralSource",
    "homeBranchId" TEXT,
    "createdByUserId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "core_patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_patient_contacts" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" "ContactType" NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "core_patient_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_patient_comments" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "core_patient_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_patient_doctors" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "specializationId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "core_patient_doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_patient_relatives" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "relativeType" "RelativeType" NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "isGuardian" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "relativePatientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "core_patient_relatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_patient_groups" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENT',
    "discountValue" DECIMAL(5,2) NOT NULL,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "core_patient_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_patient_group_members" (
    "groupId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "core_patient_group_members_pkey" PRIMARY KEY ("groupId","patientId")
);

-- CreateTable
CREATE TABLE "core_calls" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "branchId" TEXT,
    "patientId" TEXT,
    "userId" TEXT,
    "direction" "CallDirection" NOT NULL,
    "result" "CallResult" NOT NULL,
    "phone" TEXT NOT NULL,
    "durationSeconds" INTEGER,
    "notes" TEXT,
    "recordingUrl" TEXT,
    "calledAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "core_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_issued_documents" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT,
    "docType" TEXT NOT NULL,
    "docNumber" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),
    "fileKey" TEXT,
    "notes" TEXT,
    "createdByUserId" TEXT,

    CONSTRAINT "core_issued_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_appointments" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "roomId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "color" TEXT,
    "notes" TEXT,
    "cancellationReason" TEXT,
    "createdByUserId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clin_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_widget_bookings" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "patientPhone" TEXT NOT NULL,
    "patientEmail" TEXT,
    "patientId" TEXT,
    "serviceId" TEXT,
    "doctorId" TEXT,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "preferredTime" TEXT NOT NULL,
    "status" "WidgetBookingStatus" NOT NULL DEFAULT 'NEW',
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "clin_widget_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_doctor_schedules" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isWorking" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clin_doctor_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_schedule_exceptions" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "branchId" TEXT,
    "date" DATE NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "endTime" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clin_schedule_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_service_categories" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "clin_service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_services" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clin_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_service_branch_prices" (
    "serviceId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clin_service_branch_prices_pkey" PRIMARY KEY ("serviceId","branchId")
);

-- CreateTable
CREATE TABLE "clin_appointment_services" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clin_appointment_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_treatment_plan_templates" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "isFolder" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clin_treatment_plan_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_treatment_plan_template_items" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clin_treatment_plan_template_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_treatment_plans" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "TreatmentPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" DATE,
    "endDate" DATE,
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clin_treatment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_treatment_plan_items" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "toothNumber" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clin_treatment_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_diagnosis_categories" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "clin_diagnosis_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_diagnoses" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "categoryId" TEXT,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "clin_diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_medical_record_diagnoses" (
    "id" TEXT NOT NULL,
    "medicalRecordId" TEXT NOT NULL,
    "diagnosisId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "clin_medical_record_diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_examination_templates" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "isFolder" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "clin_examination_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_examination_template_sections" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clin_examination_template_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_diary_templates" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "isFolder" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clin_diary_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_dental_chart" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "toothNumber" INTEGER NOT NULL,
    "status" "ToothStatus" NOT NULL DEFAULT 'HEALTHY',
    "notes" TEXT,
    "updatedByUserId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clin_dental_chart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_dental_chart_history" (
    "id" TEXT NOT NULL,
    "dentalChartId" TEXT NOT NULL,
    "oldStatus" "ToothStatus" NOT NULL,
    "newStatus" "ToothStatus" NOT NULL,
    "notes" TEXT,
    "changedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clin_dental_chart_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_medical_records" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "recordType" "RecordType" NOT NULL DEFAULT 'EXAMINATION',
    "complaints" TEXT,
    "anamnesis" TEXT,
    "treatmentPlan" TEXT,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clin_medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_patient_diary" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "content" TEXT NOT NULL,
    "recordDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clin_patient_diary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clin_files" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "fileType" "FileType" NOT NULL DEFAULT 'OTHER',
    "originalName" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "uploadedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "clin_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_technicians" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LabType" NOT NULL DEFAULT 'LAB',
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_tooth_colors" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "colorCode" TEXT NOT NULL,
    "colorName" TEXT,

    CONSTRAINT "lab_tooth_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_price_items" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_price_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_orders" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "orderNumber" TEXT,
    "status" "LabOrderStatus" NOT NULL DEFAULT 'NEW',
    "toothColor" TEXT,
    "dueDate" DATE,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_order_stages" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dueDate" DATE,
    "completedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "lab_order_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_order_work_items" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "priceItemId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "lab_order_work_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_invoices" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "orderId" TEXT,
    "invoiceNumber" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "invoiceDate" DATE NOT NULL,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ins_companies" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ins_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ins_patient_policies" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "InsuranceType" NOT NULL DEFAULT 'DMS',
    "policyNumber" TEXT,
    "validFrom" DATE,
    "validTo" DATE,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ins_patient_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_salary_settings" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specializationId" TEXT,
    "salaryType" "SalaryType" NOT NULL DEFAULT 'PERCENT',
    "fixedAmount" DECIMAL(10,2),
    "percentValue" DECIMAL(5,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_salary_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_work_time" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "hoursWorked" DECIMAL(4,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hr_work_time_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_doctor_payments" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "percentApplied" DECIMAL(5,2),
    "paymentDate" DATE NOT NULL,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hr_doctor_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_invoices" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "invoiceNumber" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "createdByUserId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fin_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_consult_invoices" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "planId" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fin_consult_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_consult_invoice_items" (
    "id" TEXT NOT NULL,
    "consultInvoiceId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "fin_consult_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_payments" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "balanceCashUsed" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balanceCardUsed" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "receivedByUserId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fin_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_balances" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "cashBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cardBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fin_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_balance_transactions" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" "BalanceTransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "cashAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cardAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balanceCashAfter" DECIMAL(10,2) NOT NULL,
    "balanceCardAfter" DECIMAL(10,2) NOT NULL,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "invoiceId" TEXT,
    "description" TEXT,
    "createdByUserId" TEXT,
    "receiptNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fin_balance_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_bonuses" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fin_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_bonus_transactions" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "type" "BonusTransactionType" NOT NULL,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "description" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fin_bonus_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_bonus_rules" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BonusRuleType" NOT NULL,
    "value" DECIMAL(5,2) NOT NULL,
    "minCheckAmount" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fin_bonus_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_loyalty_tiers" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minTotalSpent" DECIMAL(10,2) NOT NULL,
    "bonusMultiplier" DECIMAL(3,1) NOT NULL DEFAULT 1.0,
    "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENT',
    "discountValue" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fin_loyalty_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_promotions" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "PromotionType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "minCheckAmount" DECIMAL(10,2),
    "maxUsesTotal" INTEGER,
    "maxUsesPerPatient" INTEGER,
    "promoCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fin_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_promotion_services" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "discountOverride" DECIMAL(5,2),

    CONSTRAINT "fin_promotion_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_promotion_usages" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "invoiceId" TEXT,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "promoCodeUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fin_promotion_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_cashflow_categories" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "direction" "CashFlowDirection" NOT NULL,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "fin_cashflow_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fin_cashflow_transactions" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "branchId" TEXT,
    "categoryId" TEXT NOT NULL,
    "direction" "CashFlowDirection" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "transactionDate" DATE NOT NULL,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fin_cashflow_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ntf_templates" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "eventType" "NotificationEventType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'SMS',
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ntf_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ntf_logs" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT,
    "templateId" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "cost" DECIMAL(8,4),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ntf_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ntf_reminders" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT,
    "text" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ntf_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inv_contractors" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ContractorType" NOT NULL DEFAULT 'SUPPLIER',
    "inn" TEXT,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inv_contractors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inv_material_categories" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "inv_material_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inv_units" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "inv_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inv_materials" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "unitId" TEXT,
    "minStock" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "defaultContractorId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inv_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inv_material_stock" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "updatedByUserId" TEXT,

    CONSTRAINT "inv_material_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inv_stock_movements" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "quantityBefore" DECIMAL(10,3) NOT NULL,
    "quantityAfter" DECIMAL(10,3) NOT NULL,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "contractorId" TEXT,
    "transferToBranchId" TEXT,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inv_stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inv_stock_receipts" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "contractorId" TEXT,
    "receiptNumber" TEXT,
    "receiptDate" DATE NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inv_stock_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inv_stock_receipt_items" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inv_stock_receipt_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inv_service_materials" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inv_service_materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "core_clinic_settings_clinicId_key" ON "core_clinic_settings"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "core_widget_settings_apiKey_key" ON "core_widget_settings"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "core_users_email_key" ON "core_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clin_doctor_schedules_doctorId_branchId_dayOfWeek_key" ON "clin_doctor_schedules"("doctorId", "branchId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "clin_dental_chart_patientId_toothNumber_key" ON "clin_dental_chart"("patientId", "toothNumber");

-- CreateIndex
CREATE UNIQUE INDEX "clin_medical_records_appointmentId_key" ON "clin_medical_records"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "fin_balances_patientId_key" ON "fin_balances"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "fin_bonuses_patientId_key" ON "fin_bonuses"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "inv_material_stock_materialId_branchId_key" ON "inv_material_stock"("materialId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "inv_service_materials_serviceId_materialId_key" ON "inv_service_materials"("serviceId", "materialId");

-- AddForeignKey
ALTER TABLE "core_clinic_settings" ADD CONSTRAINT "core_clinic_settings_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "core_clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_widget_settings" ADD CONSTRAINT "core_widget_settings_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "core_clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_branches" ADD CONSTRAINT "core_branches_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "core_clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_rooms" ADD CONSTRAINT "core_rooms_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "core_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_specializations" ADD CONSTRAINT "core_specializations_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "core_clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_users" ADD CONSTRAINT "core_users_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "core_clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_users" ADD CONSTRAINT "core_users_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "core_specializations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_user_branches" ADD CONSTRAINT "core_user_branches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "core_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_user_branches" ADD CONSTRAINT "core_user_branches_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "core_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_patients" ADD CONSTRAINT "core_patients_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "core_clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_patient_contacts" ADD CONSTRAINT "core_patient_contacts_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_patient_comments" ADD CONSTRAINT "core_patient_comments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_patient_comments" ADD CONSTRAINT "core_patient_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "core_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_patient_doctors" ADD CONSTRAINT "core_patient_doctors_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_patient_doctors" ADD CONSTRAINT "core_patient_doctors_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "core_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_patient_doctors" ADD CONSTRAINT "core_patient_doctors_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "core_specializations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_patient_relatives" ADD CONSTRAINT "core_patient_relatives_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_patient_relatives" ADD CONSTRAINT "core_patient_relatives_relativePatientId_fkey" FOREIGN KEY ("relativePatientId") REFERENCES "core_patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_patient_group_members" ADD CONSTRAINT "core_patient_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "core_patient_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_patient_group_members" ADD CONSTRAINT "core_patient_group_members_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_calls" ADD CONSTRAINT "core_calls_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "core_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_calls" ADD CONSTRAINT "core_calls_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_calls" ADD CONSTRAINT "core_calls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_issued_documents" ADD CONSTRAINT "core_issued_documents_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_issued_documents" ADD CONSTRAINT "core_issued_documents_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_appointments" ADD CONSTRAINT "clin_appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_appointments" ADD CONSTRAINT "clin_appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "core_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_appointments" ADD CONSTRAINT "clin_appointments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "core_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_appointments" ADD CONSTRAINT "clin_appointments_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "core_rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_appointments" ADD CONSTRAINT "clin_appointments_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_widget_bookings" ADD CONSTRAINT "clin_widget_bookings_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_widget_bookings" ADD CONSTRAINT "clin_widget_bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "clin_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_doctor_schedules" ADD CONSTRAINT "clin_doctor_schedules_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "core_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_doctor_schedules" ADD CONSTRAINT "clin_doctor_schedules_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "core_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_schedule_exceptions" ADD CONSTRAINT "clin_schedule_exceptions_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "core_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_schedule_exceptions" ADD CONSTRAINT "clin_schedule_exceptions_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "core_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_services" ADD CONSTRAINT "clin_services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "clin_service_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_service_branch_prices" ADD CONSTRAINT "clin_service_branch_prices_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "clin_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_service_branch_prices" ADD CONSTRAINT "clin_service_branch_prices_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "core_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_appointment_services" ADD CONSTRAINT "clin_appointment_services_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "clin_appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_appointment_services" ADD CONSTRAINT "clin_appointment_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "clin_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_treatment_plan_templates" ADD CONSTRAINT "clin_treatment_plan_templates_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "clin_treatment_plan_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_treatment_plan_template_items" ADD CONSTRAINT "clin_treatment_plan_template_items_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "clin_treatment_plan_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_treatment_plan_template_items" ADD CONSTRAINT "clin_treatment_plan_template_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "clin_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_treatment_plans" ADD CONSTRAINT "clin_treatment_plans_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_treatment_plans" ADD CONSTRAINT "clin_treatment_plans_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "core_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_treatment_plan_items" ADD CONSTRAINT "clin_treatment_plan_items_planId_fkey" FOREIGN KEY ("planId") REFERENCES "clin_treatment_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_treatment_plan_items" ADD CONSTRAINT "clin_treatment_plan_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "clin_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_diagnosis_categories" ADD CONSTRAINT "clin_diagnosis_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "clin_diagnosis_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_diagnoses" ADD CONSTRAINT "clin_diagnoses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "clin_diagnosis_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_medical_record_diagnoses" ADD CONSTRAINT "clin_medical_record_diagnoses_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "clin_medical_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_medical_record_diagnoses" ADD CONSTRAINT "clin_medical_record_diagnoses_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "clin_diagnoses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_examination_templates" ADD CONSTRAINT "clin_examination_templates_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "clin_examination_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_examination_template_sections" ADD CONSTRAINT "clin_examination_template_sections_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "clin_examination_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_diary_templates" ADD CONSTRAINT "clin_diary_templates_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "clin_diary_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_dental_chart" ADD CONSTRAINT "clin_dental_chart_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_dental_chart_history" ADD CONSTRAINT "clin_dental_chart_history_dentalChartId_fkey" FOREIGN KEY ("dentalChartId") REFERENCES "clin_dental_chart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_medical_records" ADD CONSTRAINT "clin_medical_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_medical_records" ADD CONSTRAINT "clin_medical_records_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "clin_appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_medical_records" ADD CONSTRAINT "clin_medical_records_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_patient_diary" ADD CONSTRAINT "clin_patient_diary_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_patient_diary" ADD CONSTRAINT "clin_patient_diary_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "core_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_patient_diary" ADD CONSTRAINT "clin_patient_diary_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "clin_appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_files" ADD CONSTRAINT "clin_files_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_files" ADD CONSTRAINT "clin_files_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "clin_appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clin_files" ADD CONSTRAINT "clin_files_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_tooth_colors" ADD CONSTRAINT "lab_tooth_colors_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "lab_technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_price_items" ADD CONSTRAINT "lab_price_items_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "lab_technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "lab_technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "clin_appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_order_stages" ADD CONSTRAINT "lab_order_stages_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "lab_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_order_work_items" ADD CONSTRAINT "lab_order_work_items_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "lab_order_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_order_work_items" ADD CONSTRAINT "lab_order_work_items_priceItemId_fkey" FOREIGN KEY ("priceItemId") REFERENCES "lab_price_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_invoices" ADD CONSTRAINT "lab_invoices_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "lab_technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_invoices" ADD CONSTRAINT "lab_invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "lab_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_invoices" ADD CONSTRAINT "lab_invoices_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ins_patient_policies" ADD CONSTRAINT "ins_patient_policies_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ins_patient_policies" ADD CONSTRAINT "ins_patient_policies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "ins_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_salary_settings" ADD CONSTRAINT "hr_salary_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "core_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_salary_settings" ADD CONSTRAINT "hr_salary_settings_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "core_specializations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_work_time" ADD CONSTRAINT "hr_work_time_userId_fkey" FOREIGN KEY ("userId") REFERENCES "core_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_work_time" ADD CONSTRAINT "hr_work_time_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "core_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_doctor_payments" ADD CONSTRAINT "hr_doctor_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "core_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_doctor_payments" ADD CONSTRAINT "hr_doctor_payments_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "clin_appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_doctor_payments" ADD CONSTRAINT "hr_doctor_payments_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_invoices" ADD CONSTRAINT "fin_invoices_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_invoices" ADD CONSTRAINT "fin_invoices_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "clin_appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_invoices" ADD CONSTRAINT "fin_invoices_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_consult_invoices" ADD CONSTRAINT "fin_consult_invoices_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_consult_invoices" ADD CONSTRAINT "fin_consult_invoices_planId_fkey" FOREIGN KEY ("planId") REFERENCES "clin_treatment_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_consult_invoices" ADD CONSTRAINT "fin_consult_invoices_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_consult_invoice_items" ADD CONSTRAINT "fin_consult_invoice_items_consultInvoiceId_fkey" FOREIGN KEY ("consultInvoiceId") REFERENCES "fin_consult_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_consult_invoice_items" ADD CONSTRAINT "fin_consult_invoice_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "clin_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_payments" ADD CONSTRAINT "fin_payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "fin_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_payments" ADD CONSTRAINT "fin_payments_receivedByUserId_fkey" FOREIGN KEY ("receivedByUserId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_balances" ADD CONSTRAINT "fin_balances_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_balance_transactions" ADD CONSTRAINT "fin_balance_transactions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_balance_transactions" ADD CONSTRAINT "fin_balance_transactions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "fin_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_balance_transactions" ADD CONSTRAINT "fin_balance_transactions_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_bonuses" ADD CONSTRAINT "fin_bonuses_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_bonus_transactions" ADD CONSTRAINT "fin_bonus_transactions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_bonus_transactions" ADD CONSTRAINT "fin_bonus_transactions_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_promotion_services" ADD CONSTRAINT "fin_promotion_services_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "fin_promotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_promotion_services" ADD CONSTRAINT "fin_promotion_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "clin_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_promotion_usages" ADD CONSTRAINT "fin_promotion_usages_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "fin_promotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_promotion_usages" ADD CONSTRAINT "fin_promotion_usages_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_promotion_usages" ADD CONSTRAINT "fin_promotion_usages_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "clin_appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_promotion_usages" ADD CONSTRAINT "fin_promotion_usages_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "fin_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_cashflow_categories" ADD CONSTRAINT "fin_cashflow_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "fin_cashflow_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_cashflow_transactions" ADD CONSTRAINT "fin_cashflow_transactions_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "core_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_cashflow_transactions" ADD CONSTRAINT "fin_cashflow_transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "fin_cashflow_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fin_cashflow_transactions" ADD CONSTRAINT "fin_cashflow_transactions_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ntf_logs" ADD CONSTRAINT "ntf_logs_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ntf_logs" ADD CONSTRAINT "ntf_logs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ntf_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ntf_reminders" ADD CONSTRAINT "ntf_reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "core_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ntf_reminders" ADD CONSTRAINT "ntf_reminders_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "core_patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_materials" ADD CONSTRAINT "inv_materials_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "inv_material_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_materials" ADD CONSTRAINT "inv_materials_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "inv_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_materials" ADD CONSTRAINT "inv_materials_defaultContractorId_fkey" FOREIGN KEY ("defaultContractorId") REFERENCES "inv_contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_material_stock" ADD CONSTRAINT "inv_material_stock_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "inv_materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_material_stock" ADD CONSTRAINT "inv_material_stock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "core_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_stock_movements" ADD CONSTRAINT "inv_stock_movements_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "inv_materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_stock_movements" ADD CONSTRAINT "inv_stock_movements_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "core_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_stock_movements" ADD CONSTRAINT "inv_stock_movements_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "inv_contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_stock_movements" ADD CONSTRAINT "inv_stock_movements_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_stock_receipts" ADD CONSTRAINT "inv_stock_receipts_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "core_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_stock_receipts" ADD CONSTRAINT "inv_stock_receipts_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "inv_contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_stock_receipts" ADD CONSTRAINT "inv_stock_receipts_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "core_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_stock_receipt_items" ADD CONSTRAINT "inv_stock_receipt_items_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "inv_stock_receipts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_stock_receipt_items" ADD CONSTRAINT "inv_stock_receipt_items_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "inv_materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_service_materials" ADD CONSTRAINT "inv_service_materials_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "clin_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inv_service_materials" ADD CONSTRAINT "inv_service_materials_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "inv_materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
