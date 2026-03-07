import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import './AppointmentForm.css';

interface AppointmentFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    patientId: initialData?.patientId || '',
    startTime: initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : '',
    endTime: initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'SCHEDULED'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        await api.put(`/appointments/${initialData.id}`, formData);
      } else {
        await api.post('/appointments', formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save appointment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setIsSubmitting(true);
      try {
        await api.delete(`/appointments/${initialData.id}`);
        onSuccess();
      } catch (err) {
        console.error('Failed to delete appointment:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form className="appointment-form flex-col gap-l" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>{t('calendar.patient')}</label>
        <input 
          type="text" 
          placeholder="Patient ID or Name..." 
          value={formData.patientId}
          onChange={(e) => setFormData({...formData, patientId: e.target.value})}
          required
        />
      </div>

      <div className="flex gap-m">
        <div className="form-group flex-1">
          <label>{t('calendar.time')} (Start)</label>
          <input 
            type="datetime-local" 
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
            required
          />
        </div>
        <div className="form-group flex-1">
          <label>{t('calendar.time')} (End)</label>
          <input 
            type="datetime-local" 
            value={formData.endTime}
            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>{t('calendar.procedure')}</label>
        <textarea 
          placeholder="Appointment notes..." 
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
      </div>

      <div className="form-group">
        <label>{t('calendar.status')}</label>
        <select 
          value={formData.status}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
        >
          <option value="SCHEDULED">Scheduled</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
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
