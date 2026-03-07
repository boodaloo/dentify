import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import './PatientForm.css';

interface PatientFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
    address: initialData?.address || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        await api.put(`/patients/${initialData.id}`, formData);
      } else {
        await api.post('/patients', formData);
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save patient:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this patient? This will also delete all their appointments.')) {
      setIsSubmitting(true);
      try {
        await api.delete(`/patients/${initialData.id}`);
        onSuccess();
      } catch (err) {
        console.error('Failed to delete patient:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form className="patient-form flex-col gap-l" onSubmit={handleSubmit}>
      <div className="flex gap-m">
        <div className="form-group flex-1">
          <label>First Name</label>
          <input 
            type="text" 
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
          />
        </div>
        <div className="form-group flex-1">
          <label>Last Name</label>
          <input 
            type="text" 
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Email Address</label>
        <input 
          type="email" 
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>Phone Number</label>
        <input 
          type="tel" 
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>Date of Birth</label>
        <input 
          type="date" 
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>Address</label>
        <textarea 
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
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
            {isSubmitting ? 'Saving...' : 'Save Patient'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PatientForm;
