import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import './AppointmentForm.css';

interface AppointmentFormProps {
  initialData?: any;
  defaultDate?: string; // ISO date string for pre-filling
  onSuccess: () => void;
  onCancel: () => void;
}

const STATUSES = [
  { value: 'SCHEDULED',   label: 'Scheduled' },
  { value: 'CONFIRMED',   label: 'Confirmed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED',   label: 'Completed' },
  { value: 'CANCELLED',   label: 'Cancelled' },
  { value: 'NO_SHOW',     label: 'No Show' },
];

const AppointmentForm: React.FC<AppointmentFormProps> = ({ initialData, defaultDate, onSuccess, onCancel }) => {
  const { t } = useTranslation();

  const defaultStart = defaultDate
    ? new Date(defaultDate).toISOString().slice(0, 16)
    : initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : '';

  const defaultEnd = initialData?.endTime
    ? new Date(initialData.endTime).toISOString().slice(0, 16)
    : defaultDate
      ? new Date(new Date(defaultDate).getTime() + 30 * 60000).toISOString().slice(0, 16)
      : '';

  const [formData, setFormData] = useState({
    patientId:  initialData?.patientId  || '',
    doctorId:   initialData?.doctorId   || '',
    startTime:  defaultStart,
    endTime:    defaultEnd,
    notes:      initialData?.notes      || '',
    status:     initialData?.status     || 'SCHEDULED',
    color:      initialData?.color      || '#14919B',
  });

  const [patientSearch, setPatientSearch] = useState(
    initialData?.patient ? `${initialData.patient.firstName} ${initialData.patient.lastName}` : ''
  );
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [branchId, setBranchId] = useState<string>(initialData?.branchId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.get('/staff').then((res: any) => {
      const items = res?.data?.items ?? res?.data ?? res ?? [];
      setDoctors(Array.isArray(items) ? items : []);
    }).catch(() => {});

    // Auto-pick the main branch
    if (!branchId) {
      api.get('/branches').then((res: any) => {
        const branches: any[] = Array.isArray(res) ? res : (res?.data ?? []);
        const main = branches.find((b: any) => b.isMain) ?? branches[0];
        if (main) setBranchId(main.id);
      }).catch(() => {});
    }
  }, []);

  const handlePatientSearch = (value: string) => {
    setPatientSearch(value);
    if (!value.trim()) {
      setFormData(prev => ({ ...prev, patientId: '' }));
      setPatientResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res: any = await api.get('/patients', { search: value, limit: '8' });
        const items = res?.data?.items ?? res?.data ?? res ?? [];
        setPatientResults(Array.isArray(items) ? items : []);
        setShowPatientDropdown(true);
      } catch {}
    }, 250);
  };

  const selectPatient = (p: any) => {
    setFormData(prev => ({ ...prev, patientId: p.id }));
    setPatientSearch(`${p.firstName} ${p.lastName}`);
    setPatientResults([]);
    setShowPatientDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId) { setError('Please select a patient'); return; }
    if (!formData.doctorId)  { setError('Please select a doctor'); return; }
    if (!branchId) { setError('No branch found. Please configure a branch in Settings.'); return; }
    setIsSubmitting(true);
    setError('');
    try {
      const payload = {
        patientId: formData.patientId,
        doctorId:  formData.doctorId  || undefined,
        branchId,
        startTime: formData.startTime,
        endTime:   formData.endTime,
        notes:     formData.notes     || undefined,
        status:    formData.status,
        color:     formData.color,
      };
      if (initialData?.id) {
        await api.put(`/appointments/${initialData.id}`, payload);
      } else {
        await api.post('/appointments', payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this appointment?')) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/appointments/${initialData.id}`);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    } finally {
      setIsSubmitting(false);
    }
  };

  const COLORS = ['#14919B', '#2563EB', '#7C3AED', '#DC2626', '#D97706', '#059669', '#DB2777', '#6B7280'];

  return (
    <form className="appointment-form flex-col gap-l" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      {/* Patient search */}
      <div className="form-group" style={{ position: 'relative' }}>
        <label>{t('calendar.patient')} *</label>
        <input
          type="text"
          placeholder="Search patient by name..."
          value={patientSearch}
          onChange={(e) => handlePatientSearch(e.target.value)}
          onFocus={() => patientResults.length > 0 && setShowPatientDropdown(true)}
          autoComplete="off"
        />
        {showPatientDropdown && patientResults.length > 0 && (
          <div className="patient-dropdown">
            {patientResults.map(p => (
              <div key={p.id} className="patient-dropdown-item" onMouseDown={() => selectPatient(p)}>
                <span className="patient-dd-name">{p.firstName} {p.lastName}</span>
                {p.phone && <span className="patient-dd-phone">{p.phone}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Doctor */}
      <div className="form-group">
        <label>Doctor</label>
        <select value={formData.doctorId} onChange={(e) => setFormData(prev => ({ ...prev, doctorId: e.target.value }))}>
          <option value="">— Any doctor —</option>
          {doctors.map((d: any) => (
            <option key={d.userId || d.id} value={d.userId || d.id}>
              {d.user?.name || d.name || `Doctor ${d.userId}`}
            </option>
          ))}
        </select>
      </div>

      {/* Times */}
      <div className="flex gap-m">
        <div className="form-group flex-1">
          <label>Start Time *</label>
          <input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
            required
          />
        </div>
        <div className="form-group flex-1">
          <label>End Time *</label>
          <input
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
            required
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex gap-m">
        <div className="form-group flex-1">
          <label>{t('calendar.status')}</label>
          <select value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flexShrink: 0 }}>
          <label>Color</label>
          <div className="color-picker">
            {COLORS.map(c => (
              <div
                key={c}
                className={`color-dot${formData.color === c ? ' active' : ''}`}
                style={{ background: c }}
                onClick={() => setFormData(prev => ({ ...prev, color: c }))}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="form-group">
        <label>Notes</label>
        <textarea
          placeholder="Appointment notes..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={2}
        />
      </div>

      <div className="form-actions flex justify-between items-center mt-l">
        <div>
          {initialData?.id && (
            <button type="button" className="danger-btn" onClick={handleDelete} disabled={isSubmitting}>
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-m">
          <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
          <button type="submit" className="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Appointment'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AppointmentForm;
