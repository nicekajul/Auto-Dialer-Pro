'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, MessageSquare } from 'lucide-react';

interface CallPanelProps {
  currentLead: any | null;
  onCallComplete: (outcome: string, notes: string) => void;
}

export function CallPanel({ currentLead, onCallComplete }: CallPanelProps) {
  const [outcome, setOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (callOutcome: string) => {
    if (!currentLead) return;

    setIsSubmitting(true);
    try {
      onCallComplete(callOutcome, notes);
      setOutcome('');
      setNotes('');
    } catch (error) {
      console.error('Failed to complete call:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass-strong shadow-glow border-border/50 sticky top-24 overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardTitle className="text-lg font-bold text-white/90">Call Outcome</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Outcome Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleSubmit('answered')}
            disabled={!currentLead || isSubmitting}
            className="gradient-accent shadow-glow-green hover:opacity-90 text-white h-12 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Answered
          </Button>
          <Button
            onClick={() => handleSubmit('no-answer')}
            disabled={!currentLead || isSubmitting}
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground h-12 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            No Answer
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleSubmit('voicemail')}
            disabled={!currentLead || isSubmitting}
            className="gradient-primary hover:opacity-90 text-white h-12 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Voicemail
          </Button>
          <Button
            onClick={() => handleSubmit('busy')}
            disabled={!currentLead || isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white h-12 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Busy
          </Button>
        </div>

        {/* Notes Section */}
        <div className="space-y-2.5">
          <label className="text-sm font-semibold text-foreground/90">Notes</label>
          <Textarea
            placeholder="Add notes about this call..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="glass-strong border-border/50 text-foreground min-h-28 resize-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Quick Outcomes */}
        <div className="space-y-3 pt-3 border-t border-border/30">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quick Flags</p>
          <div className="space-y-2">
            <Button
              onClick={() => {
                setNotes((prev) => prev + '\n[Called Back Later]');
                handleSubmit('no-answer');
              }}
              disabled={!currentLead || isSubmitting}
              variant="outline"
              className="w-full border-primary/30 text-foreground h-10 hover:bg-primary/10 hover:border-primary/50 font-medium bg-transparent disabled:opacity-50"
            >
              Flag for Retry
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
