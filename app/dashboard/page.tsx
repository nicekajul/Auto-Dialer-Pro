'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { SetupModal } from '@/components/dashboard/setup-modal';
import { AutoDialerUI } from '@/components/dashboard/auto-dialer-ui';
import { CallPanel } from '@/components/dashboard/call-panel';
import { CompactAnalytics } from '@/components/dashboard/compact-analytics';
import { BulkActions } from '@/components/dashboard/bulk-actions';
import { useToast } from '@/hooks/use-toast';

interface DashboardState {
  spreadsheetId: string | null;
  agentName: string | null;
  isAutoDialing: boolean;
  currentLead: any | null;
  leads: any[];
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [state, setState] = useState<DashboardState>({
    spreadsheetId: null,
    agentName: null,
    isAutoDialing: false,
    currentLead: null,
    leads: [],
  });
  const [showSetupModal, setShowSetupModal] = useState(true);

  // Load setup from localStorage
  useEffect(() => {
    const savedSetup = localStorage.getItem('dialerSetup');
    if (savedSetup) {
      const setup = JSON.parse(savedSetup);
      setState((prev) => ({
        ...prev,
        spreadsheetId: setup.spreadsheetId,
        agentName: setup.agentName,
      }));
      // Store in window for components to access
      (window as any).spreadsheetId = setup.spreadsheetId;
      setShowSetupModal(false);
    }
  }, []);

  // Fetch leads periodically
  const fetchLeads = useCallback(async () => {
    if (!state.spreadsheetId) return;

    try {
      const response = await fetch(
        `/api/leads?spreadsheetId=${encodeURIComponent(state.spreadsheetId)}`
      );
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const data = await response.json();

      const leadsArray = Array.isArray(data) ? data : [];
      console.log('[v0] Fetched leads:', leadsArray.length, 'leads');
      if (leadsArray.length > 0) {
        console.log('[v0] First lead sample:', leadsArray[0]);
      }

      setState((prev) => ({ ...prev, leads: leadsArray }));
    } catch (error) {
      console.error('[v0] Failed to fetch leads:', error);
    }
  }, [state.spreadsheetId]);

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 5000);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  // Handle leadId from query parameter (when "Call" is clicked from Queue page)
  useEffect(() => {
    const leadId = searchParams.get('leadId');
    if (leadId && state.leads.length > 0 && !state.currentLead) {
      const leadToCall = state.leads.find((l) => l.id === leadId);
      if (leadToCall) {
        console.log('[v0] Auto-loading lead from URL:', leadToCall.name);
        setState((prev) => ({
          ...prev,
          currentLead: leadToCall,
          isAutoDialing: true,
        }));
        toast({
          title: 'Lead Loaded',
          description: `Ready to call ${leadToCall.name}`,
        });
      }
    }
  }, [searchParams, state.leads, state.currentLead, toast]);

  // Helper function to format phone attempts for notes
  const formatPhoneAttempts = (
    attempts: any[] | undefined,
    currentIndex: number,
    phones: string[],
    finalOutcome: string
  ): string => {
    if (!phones || phones.length <= 1) return '';

    const statusLabels: Record<string, string> = {
      'no-answer': 'No Answer',
      'busy': 'Busy',
      'voicemail': 'Voicemail',
      'answered': 'Answered',
      'disconnected': 'Disconnected',
      'not-in-service': 'Not in Service',
    };

    const lines = ['[Phone Attempts]'];
    const attemptsArray = attempts || [];

    // Record all previous phone attempts
    phones.forEach((phone, index) => {
      let outcome = null;
      let timestamp = null;

      if (index < currentIndex && attemptsArray[index]) {
        // Previous phones with recorded outcomes
        outcome = attemptsArray[index].outcome;
        timestamp = attemptsArray[index].timestamp;
      } else if (index === currentIndex) {
        // Current phone (final outcome)
        outcome = finalOutcome;
        timestamp = new Date().toISOString();
      }

      if (outcome) {
        const label = statusLabels[outcome] || outcome;
        const time = timestamp ? new Date(timestamp).toLocaleString() : 'Unknown time';
        lines.push(`${phone}: ${label} (${time})`);
      }
    });

    return lines.length > 1 ? lines.join('\n') : '';
  };

  const handleSetupComplete = (spreadsheetId: string, agentName: string) => {
    setState((prev) => ({ ...prev, spreadsheetId, agentName }));
    localStorage.setItem('dialerSetup', JSON.stringify({ spreadsheetId, agentName }));
    setShowSetupModal(false);
  };

  const handleStartDialing = () => {
    if (state.leads.length === 0) {
      toast({ title: 'Error', description: 'No leads available to dial' });
      return;
    }
    const firstPendingLead = state.leads.find((l) => l.status === 'pending');
    setState((prev) => ({
      ...prev,
      isAutoDialing: true,
      currentLead: firstPendingLead || state.leads[0],
    }));
  };

  const handleStopDialing = () => {
    console.log('[v0] Stopping current call and loading next lead');

    const nextPendingLead = state.leads.find(
      (l) => l.id !== state.currentLead?.id && l.status === 'pending'
    );

    console.log('[v0] Next pending lead:', nextPendingLead?.name || 'None');

    setState((prev) => ({
      ...prev,
      currentLead: nextPendingLead || null,
      isAutoDialing: nextPendingLead ? true : false,
    }));

    if (nextPendingLead) {
      toast({
        title: 'Next Lead Loaded',
        description: `Now calling ${nextPendingLead.name}`,
      });
    } else {
      toast({
        title: 'Queue Complete',
        description: 'No more pending leads in queue',
      });
    }
  };

  const handleNextPhone = (outcome?: string) => {
    if (!state.currentLead) return;

    const currentIndex = state.currentLead.currentPhoneIndex || 0;
    const phones = state.currentLead.phones || [state.currentLead.phone];

    // Record outcome for current phone if provided
    const phoneAttempts = state.currentLead.phoneAttempts || [];
    if (outcome) {
      phoneAttempts[currentIndex] = {
        phone: phones[currentIndex],
        outcome: outcome,
        timestamp: new Date().toISOString(),
      };
    }

    if (currentIndex < phones.length - 1) {
      setState((prev) => ({
        ...prev,
        currentLead: prev.currentLead ? {
          ...prev.currentLead,
          currentPhoneIndex: currentIndex + 1,
          phone: phones[currentIndex + 1],
          phoneAttempts,
        } : null,
      }));
      toast({
        title: 'Phone Switched',
        description: `Now dialing phone ${currentIndex + 2} of ${phones.length}`,
      });
    } else if (outcome) {
      // Last phone, just record the outcome
      setState((prev) => ({
        ...prev,
        currentLead: prev.currentLead ? {
          ...prev.currentLead,
          phoneAttempts,
        } : null,
      }));
    }
  };

  const handleCallComplete = async (outcome: string, notes: string) => {
    if (!state.currentLead) return;

    const nextPendingLead = state.leads.find(
      (l) => l.id !== state.currentLead.id && l.status === 'pending'
    );

    setState((prev) => ({
      ...prev,
      currentLead: nextPendingLead || null,
      isAutoDialing: nextPendingLead ? true : false,
    }));

    try {
      // Format phone attempt history
      const phoneHistory = formatPhoneAttempts(
        state.currentLead.phoneAttempts,
        state.currentLead.currentPhoneIndex || 0,
        state.currentLead.phones || [state.currentLead.phone],
        outcome
      );
      const fullNotes = phoneHistory ? `${phoneHistory}\n\n${notes}` : notes;

      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: state.spreadsheetId,
          rowIndex: state.currentLead.rowIndex,
          updates: {
            status: outcome,
            notes: fullNotes.trim(),
            attempts: (state.currentLead.attempts || 0) + 1,
            lastAttempt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('[v0] Call data updated successfully for lead:', state.currentLead.name);
      toast({ title: 'Success', description: `Lead marked as ${outcome}` });
    } catch (error) {
      console.error('[v0] Failed to update lead:', error);
      toast({ title: 'Error', description: 'Failed to save call outcome' });
    }
  };

  if (showSetupModal && state.spreadsheetId === null) {
    return <SetupModal onComplete={handleSetupComplete} />;
  }

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader agentName={state.agentName} />

      <div className="container mx-auto px-6 py-8">
        {/* Consolidated Dashboard View */}
        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Left Column: Dialer & Call Panel */}
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AutoDialerUI
                  currentLead={state.currentLead}
                  isAutoDialing={state.isAutoDialing}
                  onStartDialing={handleStartDialing}
                  onStopDialing={handleStopDialing}
                  onNextPhone={handleNextPhone}
                />
              </div>
              <div>
                <CallPanel
                  currentLead={state.currentLead}
                  onCallComplete={handleCallComplete}
                  onNextPhone={handleNextPhone}
                />
              </div>
            </div>

            {/* Bulk Actions */}
            <BulkActions spreadsheetId={state.spreadsheetId} onActionsComplete={fetchLeads} />
          </div>

          {/* Right Sidebar: Analytics */}
          <div className="lg:sticky lg:top-24 h-fit">
            <CompactAnalytics leads={state.leads} />
          </div>
        </div>
      </div>
    </main>
  );
}
