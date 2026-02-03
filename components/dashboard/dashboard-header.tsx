'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  agentName?: string | null;
}

export function DashboardHeader({ agentName }: DashboardHeaderProps) {
  const handleLogout = () => {
    localStorage.removeItem('dialerSetup');
    document.cookie = 'google_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'google_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    window.location.href = '/';
  };

  return (
    <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Auto-Dialer Pro</h1>
          {agentName && <p className="text-sm text-slate-400">Agent: {agentName}</p>}
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="text-slate-300 border-slate-600 hover:bg-slate-700 bg-transparent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
