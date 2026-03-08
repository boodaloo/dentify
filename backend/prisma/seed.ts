import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('orisios123', 10);

  // Clinic
  const clinic = await prisma.clinic.upsert({
    where: { id: 'default-clinic-id' },
    update: {},
    create: {
      id: 'default-clinic-id',
      name: 'Orisios Demo Clinic',
      legalName: 'ООО Орисиос Клиника',
      address: 'г. Москва, ул. Тверская, д. 10',
      phone: '+7 (495) 000-00-00',
      email: 'info@orisios-demo.ru',
    },
  });

  // Clinic settings
  await prisma.clinicSettings.upsert({
    where: { clinicId: clinic.id },
    update: {},
    create: {
      clinicId: clinic.id,
      timezone: 'Europe/Moscow',
      currency: 'RUB',
      workingHoursStart: '09:00',
      workingHoursEnd: '21:00',
      appointmentDurationDefault: 30,
    },
  });

  // Branch
  const branch = await prisma.branch.upsert({
    where: { id: 'default-branch-id' },
    update: {},
    create: {
      id: 'default-branch-id',
      clinicId: clinic.id,
      name: 'Центральный филиал',
      shortCode: 'ЦЕН',
      address: 'г. Москва, ул. Тверская, д. 10',
      phone: '+7 (495) 000-00-01',
      color: '#14919B',
      isMain: true,
    },
  });

  // Specializations
  const specTherapist = await prisma.specialization.create({
    data: { clinicId: clinic.id, name: 'Терапевт', sortOrder: 1 },
  }).catch(() => prisma.specialization.findFirst({ where: { clinicId: clinic.id, name: 'Терапевт' } })) as any;

  const specSurgeon = await prisma.specialization.create({
    data: { clinicId: clinic.id, name: 'Хирург', sortOrder: 2 },
  }).catch(() => prisma.specialization.findFirst({ where: { clinicId: clinic.id, name: 'Хирург' } })) as any;

  const specOrtho = await prisma.specialization.create({
    data: { clinicId: clinic.id, name: 'Ортодонт', sortOrder: 3 },
  }).catch(() => prisma.specialization.findFirst({ where: { clinicId: clinic.id, name: 'Ортодонт' } })) as any;

  // Admin user (doctor)
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@orisios.com' },
    update: { password },
    create: {
      email: 'doctor@orisios.com',
      password,
      name: 'Др. Иванов Александр Петрович',
      role: 'ADMIN',
      isOwner: true,
      clinicId: clinic.id,
      specializationId: specTherapist?.id,
    },
  });

  // Second doctor
  const doctor2 = await prisma.user.upsert({
    where: { email: 'surgeon@orisios.com' },
    update: { password },
    create: {
      email: 'surgeon@orisios.com',
      password,
      name: 'Др. Петрова Светлана Андреевна',
      role: 'DOCTOR',
      clinicId: clinic.id,
      specializationId: specSurgeon?.id,
    },
  });

  // User branches
  await prisma.userBranch.upsert({
    where: { userId_branchId: { userId: doctor.id, branchId: branch.id } },
    update: {},
    create: { userId: doctor.id, branchId: branch.id, isDefault: true },
  });

  // Service categories
  const catTherapy = await prisma.serviceCategory.create({
    data: { clinicId: clinic.id, name: 'Терапия', sortOrder: 1 },
  }).catch(() => prisma.serviceCategory.findFirst({ where: { clinicId: clinic.id, name: 'Терапия' } })) as any;

  const catSurgery = await prisma.serviceCategory.create({
    data: { clinicId: clinic.id, name: 'Хирургия', sortOrder: 2 },
  }).catch(() => prisma.serviceCategory.findFirst({ where: { clinicId: clinic.id, name: 'Хирургия' } })) as any;

  const catDiag = await prisma.serviceCategory.create({
    data: { clinicId: clinic.id, name: 'Диагностика', sortOrder: 3 },
  }).catch(() => prisma.serviceCategory.findFirst({ where: { clinicId: clinic.id, name: 'Диагностика' } })) as any;

  // Services
  const services: any[] = [];
  const serviceData = [
    { categoryId: catDiag?.id, name: 'Первичная консультация', code: 'A01.07.001', price: 1500, durationMinutes: 30 },
    { categoryId: catDiag?.id, name: 'Прицельный рентгеновский снимок', code: 'A06.07.003', price: 500, durationMinutes: 15 },
    { categoryId: catTherapy?.id, name: 'Лечение кариеса (1 поверхность)', code: 'A16.07.002', price: 6500, durationMinutes: 60 },
    { categoryId: catTherapy?.id, name: 'Лечение кариеса (2 поверхности)', code: 'A16.07.003', price: 8500, durationMinutes: 75 },
    { categoryId: catTherapy?.id, name: 'Лечение пульпита (1 канал)', code: 'A16.07.008', price: 9000, durationMinutes: 90 },
    { categoryId: catTherapy?.id, name: 'Профессиональная чистка (Air Flow)', code: 'A16.07.052', price: 5000, durationMinutes: 60 },
    { categoryId: catSurgery?.id, name: 'Удаление зуба (простое)', code: 'A16.07.025', price: 4500, durationMinutes: 30 },
    { categoryId: catSurgery?.id, name: 'Удаление зуба (сложное)', code: 'A16.07.026', price: 9500, durationMinutes: 60 },
  ];

  for (const s of serviceData) {
    const service = await prisma.service.create({ data: { clinicId: clinic.id, ...s } })
      .catch(() => prisma.service.findFirst({ where: { clinicId: clinic.id, code: s.code } }));
    if (service) services.push(service);
  }

  // Patients
  const patientsData = [
    { firstName: 'Анна', lastName: 'Смирнова', middleName: 'Ивановна', birthDate: new Date('1985-03-15'), gender: 'F', phone: '+7 (916) 123-45-67', email: 'smirnova@mail.ru' },
    { firstName: 'Сергей', lastName: 'Козлов', middleName: 'Михайлович', birthDate: new Date('1978-07-22'), gender: 'M', phone: '+7 (925) 234-56-78', email: 'kozlov@gmail.com' },
    { firstName: 'Мария', lastName: 'Новикова', middleName: 'Александровна', birthDate: new Date('1992-11-30'), gender: 'F', phone: '+7 (903) 345-67-89', email: null },
    { firstName: 'Дмитрий', lastName: 'Волков', middleName: 'Сергеевич', birthDate: new Date('1988-05-08'), gender: 'M', phone: '+7 (977) 456-78-90', email: 'volkov@yandex.ru' },
    { firstName: 'Елена', lastName: 'Соколова', middleName: 'Дмитриевна', birthDate: new Date('1975-09-12'), gender: 'F', phone: '+7 (916) 567-89-01', email: 'sokolova@mail.ru', allergies: 'Лидокаин' },
    { firstName: 'Александр', lastName: 'Попов', middleName: 'Николаевич', birthDate: new Date('1990-12-25'), gender: 'M', phone: '+7 (926) 678-90-12', email: null },
  ];

  const patients: any[] = [];
  for (const p of patientsData) {
    const { phone, email, ...rest } = p;
    const patient = await prisma.patient.create({
      data: {
        clinicId: clinic.id,
        createdByUserId: doctor.id,
        homeBranchId: branch.id,
        ...rest,
        contacts: {
          create: [
            ...(phone ? [{ type: 'PHONE' as const, value: phone, isPrimary: true, clinicId: clinic.id }] : []),
            ...(email ? [{ type: 'EMAIL' as const, value: email, isPrimary: true, clinicId: clinic.id }] : []),
          ],
        },
      },
    }).catch(() => null);
    if (patient) patients.push(patient);
  }

  // Appointments (this week)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointmentSlots = [
    { dayOffset: 0, hour: 9,  patient: 0, doctor: doctor,  service: 2 },
    { dayOffset: 0, hour: 10, patient: 1, doctor: doctor,  service: 0 },
    { dayOffset: 0, hour: 11, patient: 2, doctor: doctor2, service: 6 },
    { dayOffset: 0, hour: 14, patient: 3, doctor: doctor,  service: 4 },
    { dayOffset: 1, hour: 9,  patient: 4, doctor: doctor,  service: 5 },
    { dayOffset: 1, hour: 10, patient: 5, doctor: doctor2, service: 7 },
    { dayOffset: 2, hour: 11, patient: 0, doctor: doctor,  service: 3 },
    { dayOffset: 3, hour: 9,  patient: 1, doctor: doctor,  service: 2 },
  ];

  const statuses = ['COMPLETED', 'COMPLETED', 'IN_PROGRESS', 'SCHEDULED', 'SCHEDULED', 'SCHEDULED', 'SCHEDULED', 'SCHEDULED'];

  for (let i = 0; i < appointmentSlots.length; i++) {
    const slot = appointmentSlots[i];
    if (!patients[slot.patient]) continue;

    const start = new Date(today);
    start.setDate(today.getDate() + slot.dayOffset);
    start.setHours(slot.hour, 0, 0, 0);

    const service = services[slot.service];
    const end = new Date(start.getTime() + (service?.durationMinutes || 30) * 60000);

    await prisma.appointment.create({
      data: {
        clinicId: clinic.id,
        patientId: patients[slot.patient].id,
        doctorId: slot.doctor.id,
        branchId: branch.id,
        startTime: start,
        endTime: end,
        status: statuses[i] as any,
        createdByUserId: doctor.id,
        services: service ? {
          create: [{
            serviceId: service.id,
            quantity: 1,
            price: service.price,
          }],
        } : undefined,
      },
    }).catch(() => null);
  }

  // Dental chart for first patient
  if (patients[0]) {
    const toothData = [
      { toothNumber: 11, status: 'HEALTHY' },
      { toothNumber: 12, status: 'FILLED' },
      { toothNumber: 16, status: 'CROWN' },
      { toothNumber: 18, status: 'EXTRACTED' },
      { toothNumber: 21, status: 'HEALTHY' },
      { toothNumber: 26, status: 'CARIES' },
      { toothNumber: 36, status: 'FILLED' },
      { toothNumber: 46, status: 'HEALTHY' },
    ];

    for (const tooth of toothData) {
      await prisma.dentalChart.create({
        data: {
          clinicId: clinic.id,
          patientId: patients[0].id,
          toothNumber: tooth.toothNumber,
          status: tooth.status as any,
          updatedByUserId: doctor.id,
        },
      }).catch(() => null);
    }
  }

  // Doctor schedules
  for (let day = 1; day <= 5; day++) {
    await prisma.doctorSchedule.create({
      data: {
        clinicId: clinic.id,
        doctorId: doctor.id,
        branchId: branch.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        isWorking: true,
      },
    }).catch(() => null);
  }

  console.log('✅ Seed completed successfully');
  console.log('   Login: doctor@orisios.com / orisios123');
  console.log(`   Clinic: ${clinic.name}`);
  console.log(`   Patients: ${patients.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
