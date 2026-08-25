import { type ReactNode } from 'react';
import { Providers } from '@/components/providers';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <MobileSidebar />
        <div className="lg:pl-64">
          {children}
        </div>
      </div>
    </Providers>
  );
}
