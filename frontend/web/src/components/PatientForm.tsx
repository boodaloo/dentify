import React, { useState } from 'react';
import { api } from '../services/api';
import PhoneInput from './PhoneInput';
import './PatientForm.css';

interface PatientFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName:  initialData?.firstName  || '',
    lastName:   initialData?.lastName   || '',
    middleName: initialData?.middleName || '',
    phone:      initialData?.phone      || '',
    email:      initialData?.email      || '',
    birthDate:  initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '',
    gender:     initialData?.gender     || '',
    allergies:  initialData?.allergies  || '',
    notes:      initialData?.notes      || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const payload = {
        firstName:  formData.firstName,
        lastName:   formData.lastName,
        middleName: formData.middleName || undefined,
        phone:      formData.phone      || undefined,
        email:      formData.email      || undefined,
        birthDate:  formData.birthDate  || undefined,
        gender:     formData.gender     || undefined,
        allergies:  formData.allergies  || undefined,
        notes:      formData.notes      || undefined,
      };
      if (initialData?.id) {
        await api.put(`/patients/${initialData.id}`, payload);
      } else {
        await api.post('/patients', payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this patient? All their data will be removed.')) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/patients/${initialData.id}`);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to delete patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="patient-form flex-col gap-l" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      {/* Name row */}
      <div className="flex gap-m">
        <div className="form-group flex-1">
          <label>Last Name *</label>
          <input type="text" value={formData.lastName} onChange={handleChange('lastName')} required />
        </div>
        <div className="form-group flex-1">
          <label>First Name *</label>
          <input type="text" value={formData.firstName} onChange={handleChange('firstName')} required />
        </div>
        <div className="form-group flex-1">
          <label>Middle Name</label>
          <input type="text" value={formData.middleName} onChange={handleChange('middleName')} />
        </div>
      </div>

      {/* DOB + Gender */}
      <div className="flex gap-m">
        <div className="form-group flex-1">
          <label>Date of Birth</label>
          <input type="date" value={formData.birthDate} onChange={handleChange('birthDate')} />
        </div>
        <div className="form-group flex-1">
          <label>Gender</label>
          <select value={formData.gender} onChange={handleChange('gender')}>
            <option value="">— Not specified —</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
      </div>

      {/* Contacts */}
      <div className="flex gap-m">
        <div className="form-group flex-1">
          <label>Phone</label>
          <PhoneInput value={formData.phone} onChange={handleChange('phone')} />
        </div>
        <div className="form-group flex-1">
          <label>Email</label>
          <input type="email" value={formData.email} onChange={handleChange('email')} />
        </div>
      </div>

      {/* Medical */}
      <div className="form-group">
        <label>Allergies</label>
        <input type="text" value={formData.allergies} onChange={handleChange('allergies')} placeholder="e.g. Lidocaine, penicillin" />
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea value={formData.notes} onChange={handleChange('notes')} rows={2} placeholder="Additional information..." />
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
            {isSubmitting ? 'Saving...' : (initialData?.id ? 'Update Patient' : 'Add Patient')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PatientForm;
