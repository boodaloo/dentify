import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import './Login.css';

interface LoginProps {
  onLogin: (user: any) => void;
}

const IconSparkles = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>;
const IconGlobe = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleLanguage = () => {
    const currentLang = i18n.language || 'en';
    const newLang = currentLang.startsWith('en') ? 'ru' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('orisios_token', data.token);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || t('login.error_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header-actions">
            <button className="lang-switcher-minimal" onClick={toggleLanguage} type="button">
              <IconGlobe />
              {i18n.language?.toUpperCase().split('-')[0]}
            </button>
          </div>
          <div className="brand-header">
            <div className="logo-container">
              <IconSparkles />
            </div>
            <h1>Orisios</h1>
            <p>{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>{t('login.email_label')}</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="doctor@orisios.com"
                required 
              />
            </div>

            <div className="form-group">
              <label>{t('login.password_label')}</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? t('login.signing_in') : t('login.submit')}
            </button>
          </form>

          <div className="login-footer">
            <a href="#">{t('login.forgot_password')}</a>
            <span>{t('login.need_account')} <a href="#">{t('login.contact_admin')}</a></span>
          </div>
        </div>
        <div className="login-backdrop">
          <div className="glow-1"></div>
          <div className="glow-2"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
