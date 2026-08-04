import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Image, Music, Scroll, Trash2, Menu, User, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ToastContainer } from '../common/Toast';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export const AppShell: React.FC<AppShellProps> = ({ children, breadcrumbs }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { trashItems } = useApp();

  const activeTrashCount = trashItems.length;

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Campaign', icon: BookOpen, path: '/campaigns' },
    { label: 'Scenes', icon: Image, path: '/scenes' },
    { label: 'Library', icon: Music, path: '/library' },
    { label: 'Credits', icon: Scroll, path: '/credits' },
    { label: 'Trash', icon: Trash2, path: '/trash', badge: activeTrashCount > 0 ? activeTrashCount : undefined }
  ];

  // Helper for determining active sidebar highlighting per PW-06
  const getIsActive = (itemPath: string) => {
    if (itemPath === '/') {
      return location.pathname === '/' || location.pathname.includes('/sessions');
    }
    if (itemPath === '/campaigns') {
      return location.pathname === '/campaigns';
    }
    if (itemPath === '/scenes') {
      return location.pathname === '/scenes' || (location.pathname.startsWith('/scenes/') && !location.pathname.includes('/sessions/'));
    }
    if (itemPath === '/library') {
      return location.pathname.startsWith('/library');
    }
    if (itemPath === '/credits') {
      return location.pathname === '/credits';
    }
    if (itemPath === '/trash') {
      return location.pathname === '/trash';
    }
    return false;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0D0D0D] text-[#E5E7EB]">
      {/* Sidebar Navigation */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } shrink-0 bg-[#121212] border-r border-[#222222] flex flex-col transition-all duration-300 z-30`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#222222]">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8C7019] flex items-center justify-center text-black font-serif font-bold text-lg shadow-md">
                A
              </div>
              <span className="font-serif italic font-bold text-lg gold-gradient-text tracking-wide">
                Arcanum Audio
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8C7019] flex items-center justify-center text-black font-serif font-bold text-lg shadow-md">
              A
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = getIsActive(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative flex items-center ${
                  sidebarOpen ? 'px-4 py-3' : 'justify-center p-3'
                } rounded-lg font-medium text-sm transition-all group ${
                  active
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                    : 'text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                {/* Active Gold Bar Indicator */}
                {active && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#D4AF37] rounded-r" />
                )}
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-[#D4AF37]' : 'text-[#8E8E93] group-hover:text-white'}`} />
                {sidebarOpen && <span className="ml-3 truncate">{item.label}</span>}
                {sidebarOpen && item.badge !== undefined && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer — Profile Avatar Placeholder (PW-05 defer) */}
        <div className="p-4 border-t border-[#222222] bg-[#101010]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#262626] border border-[#3A3A3A] flex items-center justify-center text-[#8E8E93]">
              <User className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">Game Master</span>
                <span className="text-[10px] text-[#7E7E84] truncate">Local Session</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-[#121212] border-b border-[#222222] px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="p-2 text-[#8E8E93] hover:text-white rounded-lg hover:bg-[#202020] transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Uppercase Breadcrumb Trail for Drill-Down */}
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#A0A0A0]">
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#555]" />}
                    {crumb.path ? (
                      <span
                        onClick={() => navigate(crumb.path!)}
                        className="hover:text-[#D4AF37] cursor-pointer transition-colors"
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      <span className="text-[#D4AF37]">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <span className="font-serif italic font-bold text-lg text-white">
                Arcanum Audio
              </span>
            )}
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0D0D0D]">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
