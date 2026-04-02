import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  ShieldCheck,
  BarChart3,
  LogOut,
  Eye,
  Menu,
  X,
  IndianRupee,
  CreditCard,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { useState } from 'react';
import incomeshieldLogo from '@/assets/incomeshield-logo.png';
import LanguageSelector from '@/components/LanguageSelector';

export default function AppSidebar() {
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/policy', label: t('policy'), icon: FileText },
    { to: '/claims', label: t('claims'), icon: ShieldCheck },
    { to: '/payouts', label: t('payouts'), icon: IndianRupee },
    { to: '/subscription', label: t('subscription'), icon: CreditCard },
    { to: '/triggers', label: t('triggers'), icon: AlertTriangle },
    { to: '/transparency', label: t('transparency'), icon: Eye },
    { to: '/admin', label: t('admin'), icon: BarChart3 },
  ];

  const bottomNavItems = navItems.slice(0, 5);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex min-h-screen flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
        style={{ backgroundColor: 'hsl(222, 47%, 6%)' }}
      >
        <div className={`p-4 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <img src={incomeshieldLogo} alt="IncomeShield" className="h-8 w-8 invert shrink-0" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <span className="text-xl font-bold" style={{ color: 'hsl(0, 0%, 100%)' }}>IncomeShield</span>
              <p className="text-[10px]" style={{ color: 'hsl(220, 20%, 60%)' }}>{t('tagline')}</p>
            </div>
          )}
          {/* Collapse toggle next to name */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10 shrink-0"
            style={{ color: 'hsl(220, 20%, 60%)' }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.to;
            return (
              <RouterNavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all btn-3d ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </RouterNavLink>
            );
          })}
        </nav>

        <div className={`p-3 border-t border-sidebar-border space-y-2 ${collapsed ? 'px-1' : ''}`}>
          {!collapsed && <LanguageSelector compact />}
          <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-sm font-bold shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'hsl(0, 0%, 95%)' }}>{user?.name || 'User'}</p>
                <p className="text-xs truncate" style={{ color: 'hsl(220, 20%, 60%)' }}>{user?.city || ''}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            title={t('signOut')}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors btn-3d ${collapsed ? 'justify-center' : ''}`}
            style={{ color: 'hsl(220, 20%, 60%)' }}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && t('signOut')}
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <img src={incomeshieldLogo} alt="IncomeShield" className="h-7 w-7 invert" />
          <span className="text-lg font-bold text-foreground">IncomeShield</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector compact />
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-muted btn-3d">
            {mobileMenuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-40 bg-card animate-slide-in">
          <nav className="p-4 space-y-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.to;
              return (
                <RouterNavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors btn-3d ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </RouterNavLink>
              );
            })}
          </nav>
          <div className="absolute bottom-20 left-0 right-0 p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{user?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user?.city || ''}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base text-destructive hover:bg-destructive/10 transition-colors btn-3d"
            >
              <LogOut className="h-5 w-5" />
              {t('signOut')}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around py-2 px-1">
          {bottomNavItems.map(item => {
            const isActive = location.pathname === item.to;
            return (
              <RouterNavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </RouterNavLink>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-muted-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
