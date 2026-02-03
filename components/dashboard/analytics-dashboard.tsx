'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Lead {
  id: string;
  status: string;
  attempts: number;
  name: string;
}

interface AnalyticsDashboardProps {
  leads: Lead[];
}

const COLORS = {
  answered: '#10b981',
  'no-answer': '#ef4444',
  voicemail: '#f59e0b',
  busy: '#f97316',
  pending: '#64748b',
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
  };

  const contactRate =
    stats.total > 0 ? Math.round(((stats.answered + stats.voicemail) / stats.total) * 100) : 0;

  const pieData = [
    { name: 'Answered', value: stats.answered },
    { name: 'No Answer', value: stats.noAnswer },
    { name: 'Voicemail', value: stats.voicemail },
    { name: 'Busy', value: stats.busy },
    { name: 'Pending', value: stats.pending },
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
        <Card className="glass-strong border-border shadow-lg">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-foreground/70 mb-2 uppercase tracking-wide">Total Leads</p>
            <p className="text-4xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="glass-strong border-border shadow-lg bg-emerald-500/10">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-emerald-300 mb-2 uppercase tracking-wide">Contacted</p>
            <p className="text-4xl font-bold text-emerald-400">{stats.answered}</p>
          </CardContent>
        </Card>

        <Card className="glass-strong border-border shadow-lg bg-red-500/10">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-red-300 mb-2 uppercase tracking-wide">No Answer</p>
            <p className="text-4xl font-bold text-red-400">{stats.noAnswer}</p>
          </CardContent>
        </Card>

        <Card className="glass-strong border-border shadow-lg bg-blue-500/10">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-blue-300 mb-2 uppercase tracking-wide">Contact Rate</p>
            <p className="text-4xl font-bold text-blue-400">{contactRate}%</p>
          </CardContent>
        </Card>

        <Card className="glass-strong border-border shadow-lg bg-amber-500/10">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-amber-300 mb-2 uppercase tracking-wide">Pending</p>
            <p className="text-4xl font-bold text-amber-400">{stats.pending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Call Outcome Distribution */}
        <Card className="glass-strong border-border shadow-lg">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-xl font-bold text-foreground">Call Outcome Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attempts Distribution */}
        <Card className="glass-strong border-border shadow-lg">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-xl font-bold text-foreground">Call Attempts</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attemptsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#d1d5db" />
                <YAxis stroke="#d1d5db" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
