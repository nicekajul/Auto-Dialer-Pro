'use client';

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Phone, CheckCircle2, X, MessageSquare, PhoneOff, PhoneMissed, AlertTriangle, CheckCircle } from 'lucide-react';

interface CallRecord {
  leadId: string;
  name: string;
  phone: string;
  outcome: string;
  duration: number;
  notes: string;
  timestamp: string;
  agent: string;
}

interface CallHistoryProps {
  leads: any[];
}

const outcomeIcons: Record<string, React.ReactNode> = {
  answered: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  'no-answer': <X className="w-4 h-4 text-red-400" />,
  voicemail: <MessageSquare className="w-4 h-4 text-amber-400" />,
  busy: <PhoneOff className="w-4 h-4 text-orange-400" />,
  disconnected: <PhoneMissed className="w-4 h-4 text-red-500" />,
  'not-in-service': <AlertTriangle className="w-4 h-4 text-purple-400" />,
  verified: <CheckCircle className="w-4 h-4 text-green-400" />,
};

const outcomeColors: Record<string, string> = {
  answered: 'bg-emerald-900/30 text-emerald-200',
  'no-answer': 'bg-red-900/30 text-red-200',
  voicemail: 'bg-amber-900/30 text-amber-200',
  busy: 'bg-orange-900/30 text-orange-200',
  disconnected: 'bg-red-950/40 text-red-300',
  'not-in-service': 'bg-purple-900/30 text-purple-200',
  verified: 'bg-green-900/30 text-green-200',
};

export function CallHistory({ leads }: CallHistoryProps) {
  // Get recent contacted leads
  const recentCalls = leads
    .filter((l) => l.status !== 'pending')
    .sort((a, b) => {
      const timeA = new Date(a.lastAttempt || 0).getTime();
      const timeB = new Date(b.lastAttempt || 0).getTime();
      return timeB - timeA;
    })
    .slice(0, 15);

  if (recentCalls.length === 0) {
    return (
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg">Recent Call History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Phone className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">No calls recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-strong shadow-glow border-border/50">
      <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardTitle className="text-xl font-bold text-foreground">Recent Call History</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {recentCalls.map((call, index) => (
            <div
              key={index}
              className="p-4 glass rounded-lg hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 border border-transparent"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{call.name}</h4>
                  <p className="text-sm text-slate-400">{call.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  {outcomeIcons[call.status]}
                  <Badge
                    variant="secondary"
                    className={outcomeColors[call.status] || 'bg-slate-700'}
                  >
                    {call.status}
                  </Badge>
                </div>
              </div>

              {call.notes && (
                <p className="text-xs text-slate-300 mb-2 p-2 bg-slate-800/50 rounded">
                  {call.notes}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {call.lastAttempt
                    ? new Date(call.lastAttempt).toLocaleTimeString()
                    : 'N/A'}
                </span>
                <span>Attempt #{call.attempts}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
