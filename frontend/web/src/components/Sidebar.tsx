import { useTranslation } from 'react-i18next';
import './Sidebar.css';

const IconDashboard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconInbox = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
const IconCheck = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const IconFile = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconHospital = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V4a2 2 0 0 0-2.2-1.7ZM14 21V10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v11l-9-.1ZM10 21V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v15"/></svg>;
const IconFlask = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12"/><path d="M9 3v14a3 3 0 0 0 3 3 3 3 0 0 0 3-3V3"/><path d="M9 8h6"/></svg>;
const IconPackage = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
const IconChart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>;
const IconPie = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
const IconLink = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IconSettings = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconGlobe = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;

const navItems = [
  { id: 'dashboard', translationKey: 'nav.dashboard', icon: IconDashboard },
  { id: 'schedule', translationKey: 'nav.schedule', icon: IconCalendar },
  { id: 'patients', translationKey: 'nav.patients', icon: IconUsers },
  { id: 'requests', translationKey: 'nav.requests', icon: IconInbox },
  { id: 'tasks', translationKey: 'nav.tasks', icon: IconCheck },
  { id: 'templates', translationKey: 'nav.templates', icon: IconFile },
  { id: 'oms', translationKey: 'nav.oms', icon: IconHospital },
  { id: 'labs', translationKey: 'nav.labs', icon: IconFlask },
  { type: 'divider' },
  { id: 'inventory', translationKey: 'nav.inventory', icon: IconPackage },
  { id: 'analytics', translationKey: 'nav.analytics', icon: IconChart },
  { id: 'reports', translationKey: 'nav.reports', icon: IconPie },
  { id: 'integrations', translationKey: 'nav.integrations', icon: IconLink },
  { type: 'divider' },
  { id: 'settings', translationKey: 'nav.settings', icon: IconSettings },
];

interface SidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeId, onSelect, onLogout }) => {
  const { t, i18n } = useTranslation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          {/* SVG for D-fingerprint will go here */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 4V28M8 4H16C22.6274 4 28 9.37258 28 16C28 22.6274 22.6274 28 16 28H8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="logo-text">
          <span className="text-oris">Oris</span>
          <span className="text-ios">ios</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => {
          if ('type' in item && item.type === 'divider') {
            return <div key={`divider-${index}`} className="nav-divider" />;
          }
          
          const NavItem = item as { id: string, translationKey: string, icon: any };
          const Icon = NavItem.icon;
          const isActive = activeId === NavItem.id;

          return (
            <button
              key={NavItem.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(NavItem.id)}
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-label">{t(NavItem.translationKey)}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button 
          className="nav-item lang-toggle-sidebar" 
          onClick={() => {
            const newLang = i18n.language?.startsWith('ru') ? 'en' : 'ru';
            i18n.changeLanguage(newLang);
            localStorage.setItem('orisios_lang', newLang);
          }}
        >
          <IconGlobe />
          <span className="nav-label">
            {i18n.language?.startsWith('ru') ? 'Switch to English' : 'Switch to Russian'}
          </span>
        </button>

        <button className="nav-item logout" onClick={onLogout}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          <span className="nav-label">{t('common.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
