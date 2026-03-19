import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  ShieldCheck,
  BarChart3,
  LogOut,
  Shield,
  Eye,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/policy', label: 'Policy', icon: FileText },
  { to: '/claims', label: 'Claims', icon: ShieldCheck },
  { to: '/triggers', label: 'Triggers', icon: AlertTriangle },
  { to: '/transparency', label: 'Transparency', icon: Eye },
  { to: '/admin', label: 'Admin', icon: BarChart3 },
];

// Bottom nav items (subset for mobile)
const bottomNavItems = navItems.slice(0, 4);

export default function AppSidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="hidden lg:flex w-64 min-h-screen flex-col" style={{ backgroundColor: 'hsl(230, 50%, 14%)' }}>
        <div className="p-6 flex items-center gap-3">
          <Shield className="h-8 w-8 text-accent" />
          <span className="text-xl font-bold" style={{ color: 'hsl(0, 0%, 100%)' }}>RideShield</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.to;
            return (
              <RouterNavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </RouterNavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-sm font-bold">
              {user?.name?.charAt(0) || 'R'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'hsl(0, 0%, 95%)' }}>{user?.name || 'Rider'}</p>
              <p className="text-xs truncate" style={{ color: 'hsl(220, 20%, 60%)' }}>{user?.city || 'Mumbai'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ color: 'hsl(220, 20%, 60%)' }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">RideShield</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-muted">
          {mobileMenuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
        </button>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
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
                {user?.name?.charAt(0) || 'R'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{user?.name || 'Rider'}</p>
                <p className="text-sm text-muted-foreground">{user?.city || 'Mumbai'}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
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
