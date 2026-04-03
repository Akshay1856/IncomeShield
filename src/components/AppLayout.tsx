import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppSidebar from '@/components/AppSidebar';
import scootyBg from '@/assets/scooty-bg.png';

export default function AppLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex w-full bg-background relative">
      {/* Scooty background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${scootyBg})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px',
          opacity: 0.25,
          filter: 'brightness(0) invert(1)',
        }}
      />
      <AppSidebar />
      <main className="flex-1 overflow-auto pt-14 pb-20 lg:pt-0 lg:pb-0 relative z-10">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
