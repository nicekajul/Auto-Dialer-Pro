'use client';

import { LogOut, LayoutDashboard, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface DashboardHeaderProps {
  agentName?: string | null;
}

export function DashboardHeader({ agentName }: DashboardHeaderProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('dialerSetup');
    document.cookie = 'google_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'google_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    window.location.href = '/';
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/queue', label: 'Queue', icon: Users },
    { href: '/dashboard/verified', label: 'Verified', icon: CheckCircle },
  ];

  return (
    <header className="border-b border-border/30 glass-strong sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-6">
        {/* Logo/Title */}
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Auto-Dialer Pro
          </h1>
          {agentName && (
            <p className="text-xs text-muted-foreground mt-0.5">Agent: {agentName}</p>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`
                    font-semibold transition-all duration-200
                    ${isActive
                      ? 'gradient-primary text-white shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="text-muted-foreground border-border hover:bg-muted hover:text-foreground transition-all duration-200"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
