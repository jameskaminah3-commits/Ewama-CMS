import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { ProtectedRoute } from './ProtectedRoute';

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto w-full">
          <div className="max-w-6xl mx-auto mt-12 md:mt-0">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
