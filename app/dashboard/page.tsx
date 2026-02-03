'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { SetupModal } from '@/components/dashboard/setup-modal';
import { AutoDialerUI } from '@/components/dashboard/auto-dialer-ui';
import { CallPanel } from '@/components/dashboard/call-panel';
import { LeadQueue } from '@/components/dashboard/lead-queue';
import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard';
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
  const [activeTab, setActiveTab] = useState<'dialer' | 'queue' | 'analytics' | 'actions'>('dialer');

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
      
      // Ensure data is an array
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
    const interval = setInterval(fetchLeads, 5000); // Sync every 5 seconds
    return () => clearInterval(interval);
  }, [fetchLeads]);

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
    setState((prev) => ({
      ...prev,
      isAutoDialing: false,
      currentLead: null,
    }));
  };

  const handleCallComplete = async (outcome: string, notes: string) => {
    if (!state.currentLead) return;

    // Update lead status
    const nextPendingLead = state.leads.find(
      (l) => l.id !== state.currentLead.id && l.status === 'pending'
    );

    setState((prev) => ({
      ...prev,
      currentLead: nextPendingLead || null,
      isAutoDialing: nextPendingLead ? true : false,
    }));

    try {
      // Sync to Google Sheets with proper error handling
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: state.spreadsheetId,
          rowIndex: state.currentLead.rowIndex,
          updates: {
            status: outcome,
            notes: notes || '', // Ensure notes are always sent, even if empty
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
    <main className="min-h-screen bg-slate-950">
      <DashboardHeader agentName={state.agentName} />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Main Content */}
        {activeTab === 'dialer' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AutoDialerUI
                currentLead={state.currentLead}
                isAutoDialing={state.isAutoDialing}
                onStartDialing={handleStartDialing}
                onStopDialing={handleStopDialing}
              />
            </div>
            <div>
              <CallPanel
                currentLead={state.currentLead}
                onCallComplete={handleCallComplete}
              />
            </div>
          </div>
        )}

        {activeTab === 'queue' && <LeadQueue leads={state.leads} />}

        {activeTab === 'analytics' && <AnalyticsDashboard leads={state.leads} />}

        {activeTab === 'actions' && (
          <div className="space-y-6">
            <BulkActions spreadsheetId={state.spreadsheetId} onActionsComplete={fetchLeads} />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 bg-slate-800 border border-slate-700 rounded-full p-1">
          {(['dialer', 'queue', 'analytics', 'actions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full font-medium transition-colors text-sm ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'dialer' && 'Dialer'}
              {tab === 'queue' && 'Queue'}
              {tab === 'analytics' && 'Analytics'}
              {tab === 'actions' && 'Actions'}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
