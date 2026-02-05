'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, User, Calendar, MessageSquare, X } from 'lucide-react';

import { Lead } from '@/lib/google-sheets';

interface LeadDetailModalProps {
    lead: Lead | null;
    isOpen: boolean;
    onClose: () => void;
    onCall?: (lead: Lead) => void;
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

export function LeadDetailModal({ lead, isOpen, onClose, onCall }: LeadDetailModalProps) {
    if (!lead) return null;

    const allPhones = lead.phones || [lead.phone].filter(Boolean);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="glass-strong border-border/50 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                        </div>
                        {lead.name}
                    </DialogTitle>
                    {lead.bookTitle && (
                        <div className="flex items-center gap-1.5 mt-1 ml-15 text-blue-400 font-medium">
                            <span className="opacity-70">📖</span>
                            <span>{lead.bookTitle}</span>
                        </div>
                    )}
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-muted-foreground">Status:</span>
                        <Badge className={`${statusColors[lead.status]} text-white px-3 py-1 font-medium`}>
                            {statusLabels[lead.status] || lead.status}
                        </Badge>
                    </div>

                    {/* Contact Information */}
                    <div className="glass rounded-xl p-5 space-y-4">
                        <h3 className="text-lg font-bold text-foreground mb-3">Contact Information</h3>

                        {/* Email */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Mail className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground font-semibold uppercase">Email</p>
                                <p className="text-foreground font-medium">{lead.email || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Phone Numbers */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">
                                        Phone Numbers ({allPhones.length})
                                    </p>
                                </div>
                            </div>
                            <div className="pl-13 space-y-2">
                                {allPhones.map((phone, index) => {
                                    const attempt = lead.phoneAttempts?.[index];
                                    return (
                                        <div key={index} className="p-3 bg-muted/30 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-mono text-foreground">{phone}</span>
                                                <div className="flex items-center gap-2">
                                                    {index === 0 && (
                                                        <Badge variant="outline" className="text-xs">Primary</Badge>
                                                    )}
                                                    {attempt?.outcome && (
                                                        <Badge className={`${statusColors[attempt.outcome]} text-white text-xs`}>
                                                            {statusLabels[attempt.outcome]}
                                                        </Badge>
                                                    )}
                                                    {!attempt && (
                                                        <Badge variant="outline" className="text-xs text-muted-foreground">Not Tried</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {attempt?.timestamp && (
                                                <p className="text-xs text-muted-foreground">
                                                    📅 {new Date(attempt.timestamp).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Call History */}
                    <div className="glass rounded-xl p-5 space-y-4">
                        <h3 className="text-lg font-bold text-foreground mb-3">Call History</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Attempts</p>
                                <p className="text-2xl font-bold text-foreground">{lead.attempts || 0}</p>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Last Attempt</p>
                                </div>
                                <p className="text-sm font-medium text-foreground">
                                    {lead.lastAttempt
                                        ? new Date(lead.lastAttempt).toLocaleString()
                                        : 'Never'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="glass rounded-xl p-5 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-bold text-foreground">Notes</h3>
                        </div>

                        {lead.notes ? (
                            <div className="p-4 bg-muted/30 rounded-lg">
                                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{lead.notes}</p>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm italic">No notes available</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        {onCall && lead.status === 'pending' && (
                            <Button
                                onClick={() => {
                                    onCall(lead);
                                    onClose();
                                }}
                                className="gradient-primary hover:opacity-90 text-white font-semibold flex-1"
                            >
                                <Phone className="w-4 h-4 mr-2" />
                                Call Now
                            </Button>
                        )}
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex-1"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
