'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';

import { Lead } from '@/lib/google-sheets';

interface CompactAnalyticsProps {
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

export function CompactAnalytics({ leads }: CompactAnalyticsProps) {
    const leadsArray = Array.isArray(leads) ? leads : [];

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

    const contacted = stats.total - stats.pending;

    const pieData = [
        { name: 'Answered', value: stats.answered, color: COLORS.answered },
        { name: 'No Answer', value: stats.noAnswer, color: COLORS['no-answer'] },
        { name: 'Voicemail', value: stats.voicemail, color: COLORS.voicemail },
        { name: 'Busy', value: stats.busy, color: COLORS.busy },
        { name: 'Pending', value: stats.pending, color: COLORS.pending },
        { name: 'Disconnected', value: stats.disconnected, color: COLORS.disconnected },
        { name: 'Not in Service', value: stats.notInService, color: COLORS['not-in-service'] },
        { name: 'Verified', value: stats.verified, color: COLORS.verified },
    ].filter((item) => item.value > 0);

    return (
        <div className="space-y-4">
            {/* Compact Metrics */}
            <Card className="glass-strong border-border/50 overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Quick Stats
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-2 mb-1">
                                <Phone className="w-4 h-4 text-primary" />
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Total</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                        </div>

                        <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-lg border border-emerald-500/20 transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Reached</p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">{contacted}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20 transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Rate</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{contactRate}%</p>
                        </div>

                        <div className="p-3 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg border border-amber-500/20 transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Pending</p>
                            </div>
                            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Compact Chart */}
            {pieData.length > 0 && (
                <Card className="glass-strong border-border/50 overflow-hidden">
                    <CardHeader className="pb-3 border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardTitle className="text-lg font-bold text-foreground">Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    cx="50%"
                                    cy="50%"
                                    data={pieData}
                                    innerRadius={50}
                                    outerRadius={80}
                                    dataKey="value"
                                    label={false}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        fontWeight: 600
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Custom Legend */}
                        <div className="mt-4 space-y-2">
                            {pieData.map((entry, index) => (
                                <div key={index} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-muted-foreground font-medium">{entry.name}</span>
                                    </div>
                                    <span className="font-bold text-foreground">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
