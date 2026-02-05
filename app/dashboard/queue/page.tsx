'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { LeadQueue } from '@/components/dashboard/lead-queue';
import { LeadDetailModal } from '@/components/dashboard/lead-detail-modal';
import { useRouter } from 'next/navigation';

import { Lead } from '@/lib/google-sheets';

export default function QueuePage() {
    const router = useRouter();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [agentName, setAgentName] = useState<string | null>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);

    // Load setup and leads
    useEffect(() => {
        const savedSetup = localStorage.getItem('dialerSetup');
        if (savedSetup) {
            const setup = JSON.parse(savedSetup);
            setAgentName(setup.agentName);
            setSpreadsheetId(setup.spreadsheetId);
            (window as any).spreadsheetId = setup.spreadsheetId;
        }
    }, []);

    // Fetch leads
    const fetchLeads = useCallback(async () => {
        if (!spreadsheetId) return;

        try {
            const response = await fetch(
                `/api/leads?spreadsheetId=${encodeURIComponent(spreadsheetId)}`
            );
            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();
            setLeads(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('[v0] Failed to fetch leads:', error);
        }
    }, [spreadsheetId]);

    useEffect(() => {
        fetchLeads();
        const interval = setInterval(fetchLeads, 5000);
        return () => clearInterval(interval);
    }, [fetchLeads]);

    const handleViewLead = (lead: Lead) => {
        setSelectedLead(lead);
        setIsModalOpen(true);
    };

    const handleCallLead = (lead: Lead) => {
        // Navigate to dashboard with lead pre-selected
        router.push(`/dashboard?leadId=${lead.id}`);
    };

    return (
        <main className="min-h-screen bg-background">
            <DashboardHeader agentName={agentName} />

            <div className="container mx-auto px-6 py-8">
                <LeadQueue
                    leads={leads}
                    onCallLead={handleCallLead}
                    onViewLead={handleViewLead}
                />
            </div>

            <LeadDetailModal
                lead={selectedLead}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCall={handleCallLead}
            />
        </main>
    );
}
