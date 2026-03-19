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
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/policy', label: 'Policy', icon: FileText },
  { to: '/claims', label: 'Claims', icon: ShieldCheck },
  { to: '/triggers', label: 'Triggers', icon: AlertTriangle },
  { to: '/transparency', label: 'Transparency', icon: Eye },
  { to: '/admin', label: 'Admin', icon: BarChart3 },
];

export default function AppSidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ backgroundColor: 'hsl(230, 50%, 14%)' }}>
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
  );
}
