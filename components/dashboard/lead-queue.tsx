'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  attempts: number;
  rowIndex?: number;
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

const PAGE_SIZE = 25;

export function LeadQueue({ leads }: LeadQueueProps) {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isSkipping, setIsSkipping] = useState(false);
  const { toast } = useToast();

  // Filter pending leads and sort by date
  const pendingLeads = leads.filter((l) => l.status === 'pending');
  const contactedLeads = leads.filter((l) => l.status !== 'pending');

  // Paginate pending leads
  const totalPages = Math.ceil(pendingLeads.length / PAGE_SIZE);
  const paginatedLeads = pendingLeads.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Handle select all on page
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedLeads);
      paginatedLeads.forEach((lead) => newSelected.add(lead.id));
      setSelectedLeads(newSelected);
    } else {
      const newSelected = new Set(selectedLeads);
      paginatedLeads.forEach((lead) => newSelected.delete(lead.id));
      setSelectedLeads(newSelected);
    }
  };

  // Handle individual select
  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  // Handle skip selected
  const handleSkipSelected = async () => {
    if (selectedLeads.size === 0) {
      toast({ title: 'Error', description: 'No leads selected' });
      return;
    }

    setIsSkipping(true);
    try {
      // Get spreadsheet ID from localStorage or window
      let spreadsheetId = (window as any).spreadsheetId;
      if (!spreadsheetId) {
        const savedSetup = localStorage.getItem('dialerSetup');
        if (savedSetup) {
          const setup = JSON.parse(savedSetup);
          spreadsheetId = setup.spreadsheetId;
        }
      }

      if (!spreadsheetId) {
        throw new Error('No spreadsheet ID found');
      }

      // Mark selected leads as skipped by updating their status to 'no-answer'
      const leadsToSkip = Array.from(selectedLeads)
        .map((id) => pendingLeads.find((l) => l.id === id))
        .filter(Boolean);

      for (const lead of leadsToSkip) {
        if (lead) {
          const response = await fetch('/api/leads', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              spreadsheetId,
              rowIndex: lead.rowIndex,
              updates: {
                status: 'no-answer', // Using no-answer as skip status
                attempts: (lead.attempts || 0) + 1,
                lastAttempt: new Date().toISOString(),
              },
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to skip lead ${lead.name}`);
          }
        }
      }

      setSelectedLeads(new Set());
      toast({
        title: 'Success',
        description: `${leadsToSkip.length} leads skipped and marked as no-answer`,
      });

      // Reset to first page after skip
      setCurrentPage(1);
    } catch (error) {
      console.error('[v0] Failed to skip leads:', error);
      toast({ title: 'Error', description: 'Failed to skip leads' });
    } finally {
      setIsSkipping(false);
    }
  };

  const isAllSelectedOnPage =
    paginatedLeads.length > 0 && paginatedLeads.every((lead) => selectedLeads.has(lead.id));

  return (
    <div className="space-y-6">
      {/* Pending Leads with Selection */}
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              Leads ({pendingLeads.length})
            </CardTitle>
            <div className="text-sm text-slate-400">
              Showing {(currentPage - 1) * PAGE_SIZE + 1} -{' '}
              {Math.min(currentPage * PAGE_SIZE, pendingLeads.length)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingLeads.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400">All leads have been contacted</p>
            </div>
          ) : (
            <>
              {/* Selection Controls */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
                <Checkbox
                  checked={isAllSelectedOnPage}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <span className="text-sm text-slate-400">Select all on page</span>
                {selectedLeads.size > 0 && (
                  <>
                    <span className="text-sm text-slate-300 ml-auto">
                      {selectedLeads.size} selected
                    </span>
                    <Button
                      onClick={handleSkipSelected}
                      disabled={isSkipping}
                      className="bg-slate-700 hover:bg-slate-600 text-white"
                      size="sm"
                    >
                      {isSkipping ? 'Skipping...' : 'Skip Selected'}
                    </Button>
                    <Button
                      onClick={() => {
                        const response = fetch('/api/leads/bulk', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            spreadsheetId: (window as any).spreadsheetId,
                            action: 'call-selected',
                            selectedIds: Array.from(selectedLeads),
                          }),
                        });
                        setSelectedLeads(new Set());
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      Call Selected
                    </Button>
                  </>
                )}
              </div>

              {/* Leads List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {paginatedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-3"
                  >
                    <Checkbox
                      checked={selectedLeads.has(lead.id)}
                      onCheckedChange={() => handleSelectLead(lead.id)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-400">
                          {lead.attempts}
                        </span>
                        <h4 className="font-medium text-white">{lead.name}</h4>
                      </div>
                      <p className="text-sm text-slate-400">{lead.phone}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="border-slate-600"
                >
                  Prev
                </Button>
                <span className="text-sm text-slate-400">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="border-slate-600"
                >
                  Next
                </Button>
              </div>
            </>
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
