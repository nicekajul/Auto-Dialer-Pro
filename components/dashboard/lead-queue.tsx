'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, X, Clock } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  attempts: number;
}

interface LeadQueueProps {
  leads: Lead[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-slate-600',
  calling: 'bg-blue-600 animate-pulse',
  answered: 'bg-emerald-600',
  'no-answer': 'bg-red-600',
  voicemail: 'bg-amber-600',
  busy: 'bg-orange-600',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  calling: 'Calling',
  answered: 'Answered',
  'no-answer': 'No Answer',
  voicemail: 'Voicemail',
  busy: 'Busy',
};

export function LeadQueue({ leads }: LeadQueueProps) {
  const pendingLeads = leads.filter((l) => l.status === 'pending');
  const contactedLeads = leads.filter((l) => l.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Pending Leads */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl">Pending Leads ({pendingLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingLeads.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400">All leads have been contacted</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pendingLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{lead.name}</h4>
                      <p className="text-sm text-slate-400">{lead.phone}</p>
                    </div>
                    <Badge variant="secondary">Queue</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Contacted */}
      {contactedLeads.length > 0 && (
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">Recently Contacted ({contactedLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {contactedLeads.slice(0, 20).map((lead) => (
                <div
                  key={lead.id}
                  className="p-3 bg-slate-700/30 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white truncate">{lead.name}</h4>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        Attempts: {lead.attempts}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{lead.phone}</p>
                  </div>
                  <Badge className={`${statusColors[lead.status]} text-white flex-shrink-0 ml-2`}>
                    {statusLabels[lead.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
