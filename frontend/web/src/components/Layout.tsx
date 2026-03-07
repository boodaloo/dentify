import React from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  activeId: string;
  onSelect: (id: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeId, onSelect, onLogout }) => {
  return (
    <div className="layout-container">
      <Sidebar activeId={activeId} onSelect={onSelect} onLogout={onLogout} />
      <div className="main-wrapper">
        <TopHeader />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
