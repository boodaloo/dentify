import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes        from './routes/auth';
import patientRoutes     from './routes/patients';
import appointmentRoutes from './routes/appointments';
import serviceRoutes     from './routes/services';
import invoiceRoutes     from './routes/invoices';
import staffRoutes       from './routes/staff';
import branchRoutes      from './routes/branches';
import inventoryRoutes   from './routes/inventory';
import clinicalRoutes    from './routes/clinical';
import labRoutes              from './routes/labs';
import notificationRoutes    from './routes/notifications';
import financeRoutes         from './routes/finance';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth',         authRoutes);
app.use('/api/patients',     patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services',     serviceRoutes);
app.use('/api/invoices',     invoiceRoutes);
app.use('/api/staff',        staffRoutes);
app.use('/api/branches',     branchRoutes);
app.use('/api/inventory',    inventoryRoutes);
app.use('/api/clinical',     clinicalRoutes);
app.use('/api/labs',              labRoutes);
app.use('/api/notifications',    notificationRoutes);
app.use('/api/finance',          financeRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (_req: Request, res: Response) => {
  res.send('Orisios Backend (Express) is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
