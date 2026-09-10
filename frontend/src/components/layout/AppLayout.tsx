import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useUIStore } from '../../store/uiStore';

export default function AppLayout() {
  const sidebarOpen = useUIStore(s => s.sidebarOpen);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        marginLeft: sidebarOpen ? 240 : 64,
        transition: 'margin-left 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <TopBar />
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          background: 'var(--bg-primary)',
        }} className="styled-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
