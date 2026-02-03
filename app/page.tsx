'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, BarChart3, Users } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login');
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Features */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Auto-Dialer Pro
              </h1>
              <p className="text-lg text-slate-300">
                Automate your sales calls and manage leads effortlessly
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Automatic Dialing</h3>
                  <p className="text-sm text-slate-400">
                    Sequentially dial leads without manual clicking
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Multi-Agent Support</h3>
                  <p className="text-sm text-slate-400">
                    Multiple agents working simultaneously
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Real-Time Analytics</h3>
                  <p className="text-sm text-slate-400">
                    Track call outcomes and agent performance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Card */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">Get Started</CardTitle>
              <CardDescription>
                Connect your Google Sheets to begin dialing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
              >
                {isLoading ? 'Connecting...' : 'Sign in with Google'}
              </Button>
              <p className="text-xs text-slate-400 mt-4 text-center">
                We'll securely access your Google Sheets to manage your leads
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
