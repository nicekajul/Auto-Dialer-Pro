'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Phone, Search, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { Lead } from '@/lib/google-sheets';

interface LeadQueueProps {
  leads: Lead[];
  onCallLead?: (lead: Lead) => void;
  onViewLead?: (lead: Lead) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-slate-600',
  calling: 'bg-blue-600 animate-pulse',
  answered: 'bg-emerald-600',
  'no-answer': 'bg-red-600',
  voicemail: 'bg-amber-600',
  busy: 'bg-orange-600',
  disconnected: 'bg-red-700',
  'not-in-service': 'bg-purple-600',
  verified: 'bg-green-600',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  calling: 'Calling',
  answered: 'Answered',
  'no-answer': 'No Answer',
  voicemail: 'Voicemail',
  busy: 'Busy',
  disconnected: 'Disconnected',
  'not-in-service': 'Not in Service',
  verified: 'Verified',
};

const PAGE_SIZE = 25;

export function LeadQueue({ leads, onCallLead, onViewLead }: LeadQueueProps) {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isSkipping, setIsSkipping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Filter pending leads and sort by date
  const allPendingLeads = leads.filter((l) => l.status === 'pending');

  // Apply search filter
  const pendingLeads = allPendingLeads.filter((lead) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.phone.includes(query) ||
      lead.email.toLowerCase().includes(query)
    );
  });

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
      <Card className="glass-strong shadow-glow border-border/50 overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-black/90">
              Leads ({pendingLeads.length})
            </CardTitle>
            <div className="text-sm text-muted-foreground font-medium">
              Showing {(currentPage - 1) * PAGE_SIZE + 1} -{' '}
              {Math.min(currentPage * PAGE_SIZE, pendingLeads.length)}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-10 glass-strong border-border/50 text-foreground"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {pendingLeads.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400">All leads have been contacted</p>
            </div>
          ) : (
            <>
              {/* Selection Controls */}
              <div className="flex items-center gap-3 pb-4 border-b border-border/30">
                <Checkbox
                  checked={isAllSelectedOnPage}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm text-foreground/70 font-medium">Select all on page</span>
                {selectedLeads.size > 0 && (
                  <>
                    <span className="text-sm text-foreground font-semibold ml-auto">
                      {selectedLeads.size} selected
                    </span>
                    <Button
                      onClick={handleSkipSelected}
                      disabled={isSkipping}
                      className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium"
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
                      className="gradient-primary hover:opacity-90 text-white font-medium"
                      size="sm"
                    >
                      Call Selected
                    </Button>
                  </>
                )}
              </div>

              {/* Leads List */}
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {paginatedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 glass rounded-lg hover:bg-primary/5 hover:border-primary/30 transition-all flex items-center gap-4 border border-transparent"
                  >
                    <Checkbox
                      checked={selectedLeads.has(lead.id)}
                      onCheckedChange={() => handleSelectLead(lead.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <Badge className="bg-primary/20 text-primary border-0 px-2 py-0.5 font-bold text-xs">
                          {lead.attempts}
                        </Badge>
                        <h4 className="font-semibold text-foreground truncate">{lead.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono mt-1">{lead.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {onViewLead && (
                        <Button
                          onClick={() => onViewLead(lead)}
                          size="sm"
                          variant="outline"
                          className="border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50 font-medium"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      )}
                      {onCallLead && (
                        <Button
                          onClick={() => onCallLead(lead)}
                          size="sm"
                          className="gradient-primary hover:opacity-90 text-white font-semibold"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                      )}
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
        <Card className="glass-strong shadow-glow border-border/50 overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardTitle className="text-xl font-bold text-black/90">
              Recently Contacted ({contactedLeads.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {contactedLeads.slice(0, 20).map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 glass rounded-lg flex items-center justify-between gap-4 hover:bg-accent/5 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h4 className="font-semibold text-foreground truncate">{lead.name}</h4>
                      <Badge className="bg-primary/20 text-primary border-0 text-xs font-medium">
                        {lead.attempts} attempts
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{lead.phone}</p>
                  </div>
                  <Badge className={`${statusColors[lead.status]} text-white flex-shrink-0 ml-2 font-medium px-3 py-1`}>
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
