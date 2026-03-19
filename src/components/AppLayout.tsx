import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppSidebar from '@/components/AppSidebar';

export default function AppLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto pt-14 pb-20 lg:pt-0 lg:pb-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
