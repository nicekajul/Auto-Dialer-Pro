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
  // Calculate stats
  const stats = {
    total: leads.length,
    answered: leads.filter((l) => l.status === 'answered').length,
    noAnswer: leads.filter((l) => l.status === 'no-answer').length,
    voicemail: leads.filter((l) => l.status === 'voicemail').length,
    busy: leads.filter((l) => l.status === 'busy').length,
    pending: leads.filter((l) => l.status === 'pending').length,
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
    { name: '1 Attempt', count: leads.filter((l) => l.attempts === 1).length },
    { name: '2 Attempts', count: leads.filter((l) => l.attempts === 2).length },
    { name: '3+ Attempts', count: leads.filter((l) => l.attempts >= 3).length },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400 mb-2">Total Leads</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400 mb-2">Contacted</p>
            <p className="text-3xl font-bold text-emerald-400">{stats.answered}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400 mb-2">No Answer</p>
            <p className="text-3xl font-bold text-red-400">{stats.noAnswer}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400 mb-2">Contact Rate</p>
            <p className="text-3xl font-bold text-blue-400">{contactRate}%</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400 mb-2">Pending</p>
            <p className="text-3xl font-bold text-amber-400">{stats.pending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Call Outcome Distribution */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Call Outcome Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attempts Distribution */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Call Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attemptsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
