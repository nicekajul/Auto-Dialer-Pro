'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { Lead } from '@/lib/google-sheets';

interface AnalyticsDashboardProps {
  leads: Lead[];
}

const COLORS = {
  answered: '#10b981',
  'no-answer': '#ef4444',
  voicemail: '#f59e0b',
  busy: '#f97316',
  pending: '#64748b',
  disconnected: '#b91c1c',
  'not-in-service': '#9333ea',
  verified: '#059669',
};

export function AnalyticsDashboard({ leads }: AnalyticsDashboardProps) {
  // Safety check: ensure leads is an array
  const leadsArray = Array.isArray(leads) ? leads : [];

  // Calculate stats
  const stats = {
    total: leadsArray.length,
    answered: leadsArray.filter((l) => l.status === 'answered').length,
    noAnswer: leadsArray.filter((l) => l.status === 'no-answer').length,
    voicemail: leadsArray.filter((l) => l.status === 'voicemail').length,
    busy: leadsArray.filter((l) => l.status === 'busy').length,
    pending: leadsArray.filter((l) => l.status === 'pending').length,
    disconnected: leadsArray.filter((l) => l.status === 'disconnected').length,
    notInService: leadsArray.filter((l) => l.status === 'not-in-service').length,
    verified: leadsArray.filter((l) => l.status === 'verified').length,
  };

  const contactRate =
    stats.total > 0 ? Math.round(((stats.answered + stats.voicemail) / stats.total) * 100) : 0;

  const pieData = [
    { name: 'Answered', value: stats.answered },
    { name: 'No Answer', value: stats.noAnswer },
    { name: 'Voicemail', value: stats.voicemail },
    { name: 'Busy', value: stats.busy },
    { name: 'Pending', value: stats.pending },
    { name: 'Disconnected', value: stats.disconnected },
    { name: 'Not in Service', value: stats.notInService },
    { name: 'Verified', value: stats.verified },
  ].filter((item) => item.value > 0);

  const attemptsData = [
    { name: '1 Attempt', count: leadsArray.filter((l) => l.attempts === 1).length },
    { name: '2 Attempts', count: leadsArray.filter((l) => l.attempts === 2).length },
    { name: '3+ Attempts', count: leadsArray.filter((l) => l.attempts >= 3).length },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="border-2 border-border shadow-lg bg-card">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Total Leads</p>
            <p className="text-4xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-500/30 shadow-lg bg-emerald-50 dark:bg-emerald-950">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2 uppercase tracking-wider">Contacted</p>
            <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{stats.answered}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/30 shadow-lg bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-2 uppercase tracking-wider">No Answer</p>
            <p className="text-4xl font-bold text-red-600 dark:text-red-400">{stats.noAnswer}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/30 shadow-lg bg-blue-50 dark:bg-blue-950">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wider">Contact Rate</p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{contactRate}%</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-500/30 shadow-lg bg-amber-50 dark:bg-amber-950">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2 uppercase tracking-wider">Pending</p>
            <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Call Outcome Distribution */}
        <Card className="border-2 border-border shadow-lg bg-card">
          <CardHeader className="border-b-2 border-border">
            <CardTitle className="text-xl font-bold text-foreground">Call Outcome Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={(entry) => entry.name}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                    fontWeight: 600
                  }}
                />
                <Legend
                  wrapperStyle={{
                    color: '#111827',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attempts Distribution */}
        <Card className="border-2 border-border shadow-lg bg-card">
          <CardHeader className="border-b-2 border-border">
            <CardTitle className="text-xl font-bold text-foreground">Call Attempts</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attemptsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis
                  dataKey="name"
                  stroke="#374151"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                />
                <YAxis
                  stroke="#374151"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                    fontWeight: 600
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
