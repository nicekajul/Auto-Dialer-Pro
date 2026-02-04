'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LeadDetailModal } from '@/components/dashboard/lead-detail-modal';
import { Search, CheckCircle, Calendar, Phone, User, Download } from 'lucide-react';

interface PhoneAttempt {
    phone: string;
    outcome: string | null;
    timestamp?: string;
}

interface Lead {
    id: string;
    name: string;
    phone: string;
    phones?: string[];
    phoneAttempts?: PhoneAttempt[];
    email: string;
    status: string;
    notes: string;
    attempts: number;
    lastAttempt?: string;
    rowIndex?: number;
}

export default function VerifiedLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [agentName, setAgentName] = useState<string | null>(null);
    const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Load setup
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
            const allLeads = Array.isArray(data) ? data : [];

            // Filter for verified leads only
            const verifiedLeads = allLeads.filter(lead => lead.status === 'verified');
            setLeads(verifiedLeads);
        } catch (error) {
            console.error('[v0] Failed to fetch leads:', error);
        }
    }, [spreadsheetId]);

    useEffect(() => {
        fetchLeads();
        const interval = setInterval(fetchLeads, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, [fetchLeads]);

    // Filter leads by search query
    const filteredLeads = leads.filter((lead) => {
        const query = searchQuery.toLowerCase();
        return (
            lead.name.toLowerCase().includes(query) ||
            lead.phone.includes(query) ||
            lead.email.toLowerCase().includes(query)
        );
    });

    const getVerifiedPhone = (lead: Lead): string => {
        // If we have explicit attempt history, look for the phone marked as verified
        if (lead.phoneAttempts && lead.phoneAttempts.length > 0) {
            const verifiedAttempt = lead.phoneAttempts.find(p => p.outcome === 'verified');
            if (verifiedAttempt) {
                return verifiedAttempt.phone;
            }
        }
        // Fallback: if status is verified but no explicit history match (e.g. single phone lead), return primary phone
        return lead.phone;
    };

    const downloadVerifiedCSV = () => {
        const headers = ['Name', 'Verified Phone', 'Email', 'Notes', 'Verification Date'];
        const csvContent = [
            headers.join(','),
            ...filteredLeads.map(lead => {
                const verifiedPhone = getVerifiedPhone(lead);
                const date = lead.lastAttempt ? new Date(lead.lastAttempt).toLocaleDateString() : '';
                // Escape fields that might contain commas
                const cleanName = `"${lead.name.replace(/"/g, '""')}"`;
                const cleanNotes = `"${lead.notes.replace(/"/g, '""').replace(/\n/g, ' ')}"`; // Newline matching fix

                return [
                    cleanName,
                    verifiedPhone,
                    lead.email,
                    cleanNotes,
                    date
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'verified_leads.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleViewLead = (lead: Lead) => {
        setSelectedLead(lead);
        setIsModalOpen(true);
    };

    return (
        <main className="min-h-screen bg-background">
            <DashboardHeader agentName={agentName} />

            <div className="container mx-auto px-6 py-8">
                <Card className="glass-strong shadow-glow border-border/50 overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-gradient-to-br from-green-500/10 to-transparent space-y-4 pb-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-7 h-7 text-green-600" />
                                    </div>
                                    Verified Leads
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Successfully verified and qualified contacts
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={downloadVerifiedCSV}
                                    variant="outline"
                                    className="gap-2 border-green-500/30 hover:bg-green-500/10 hover:text-green-600"
                                >
                                    <Download className="w-4 h-4" />
                                    Export CSV
                                </Button>
                                <Badge className="bg-green-600 text-white px-4 py-2 text-lg font-bold">
                                    {filteredLeads.length} Total
                                </Badge>
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by name, phone, or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 glass-strong border-border/50 text-foreground focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                            />
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        {filteredLeads.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="w-16 h-16 text-green-600/30 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-muted-foreground">
                                    {searchQuery ? 'No verified leads match your search' : 'No verified leads yet'}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {!searchQuery && 'Mark leads as "Verified" during calls to see them here'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredLeads.map((lead) => (
                                    <div
                                        key={lead.id}
                                        className="p-5 glass rounded-xl hover:bg-green-500/5 hover:border-green-500/30 transition-all duration-200 border border-transparent cursor-pointer"
                                        onClick={() => handleViewLead(lead)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-lg text-foreground">{lead.name}</h4>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                                <Phone className="w-3.5 h-3.5" />
                                                                <span className="font-mono">{lead.phone}</span>
                                                            </div>
                                                            {lead.attempts > 0 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {lead.attempts} {lead.attempts === 1 ? 'attempt' : 'attempts'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {lead.notes && (
                                                    <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                                                        <p className="text-sm text-foreground line-clamp-2">{lead.notes}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-end gap-2 ml-4">
                                                <Badge className="bg-green-600 text-white font-semibold">
                                                    ✓ Verified
                                                </Badge>
                                                {lead.lastAttempt && (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(lead.lastAttempt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <LeadDetailModal
                lead={selectedLead}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </main>
    );
}
