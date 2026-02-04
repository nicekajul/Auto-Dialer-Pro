'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, MessageSquare, PhoneOff, AlertTriangle, PhoneMissed, CheckCircle } from 'lucide-react';

interface CallPanelProps {
  currentLead: any | null;
  onCallComplete: (outcome: string, notes: string) => void;
  onNextPhone?: (outcome?: string) => void;
}

export function CallPanel({ currentLead, onCallComplete, onNextPhone }: CallPanelProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (callOutcome: string) => {
    if (!currentLead) return;

    setIsSubmitting(true);
    try {
      console.log('[v0] Submitting call outcome:', {
        outcome: callOutcome,
        notes: notes,
        notesLength: notes.length,
        lead: currentLead.name,
      });
      onCallComplete(callOutcome, notes);
      setNotes('');
    } catch (error) {
      console.error('[v0] Failed to complete call:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxNoteLength = 500;

  return (
    <Card className="glass-strong shadow-glow border-border/50 sticky top-24 overflow-hidden transition-all duration-300">
      <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent pb-4">
        <CardTitle className="text-xl font-bold text-foreground">Call Outcome</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">Select the call result to proceed</p>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {/* Outcome Buttons - 3x2 Grid */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleSubmit('answered')}
              disabled={!currentLead || isSubmitting}
              className="gradient-accent shadow-glow-green hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] text-white h-14 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Answered
            </Button>
            <Button
              onClick={() => handleSubmit('no-answer')}
              disabled={!currentLead || isSubmitting}
              className="bg-slate-600 hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.98] text-white h-14 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <XCircle className="w-5 h-5 mr-2" />
              No Answer
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleSubmit('voicemail')}
              disabled={!currentLead || isSubmitting}
              className="gradient-primary hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] text-white h-14 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Voicemail
            </Button>
            <Button
              onClick={() => handleSubmit('busy')}
              disabled={!currentLead || isSubmitting}
              className="bg-orange-600 hover:bg-orange-700 hover:scale-[1.02] active:scale-[0.98] text-white h-14 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <PhoneOff className="w-5 h-5 mr-2" />
              Busy
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleSubmit('disconnected')}
              disabled={!currentLead || isSubmitting}
              className="bg-red-700 hover:bg-red-800 hover:scale-[1.02] active:scale-[0.98] text-white h-14 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <PhoneMissed className="w-5 h-5 mr-2" />
              Disconnected
            </Button>
            <Button
              onClick={() => handleSubmit('not-in-service')}
              disabled={!currentLead || isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 hover:scale-[1.02] active:scale-[0.98] text-white h-14 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              Not in Service
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => handleSubmit('verified')}
              disabled={!currentLead || isSubmitting}
              className="bg-green-600 hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98] text-white h-14 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Verified ✓
            </Button>
          </div>
        </div>

        {/* Mark Current Phone & Next (for multi-phone leads) */}
        {currentLead && currentLead.phones && currentLead.phones.length > 1 && onNextPhone && (
          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl border border-amber-500/20">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <PhoneMissed className="w-4 h-4 text-amber-600" />
              Mark Current Phone & Next
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Current: {currentLead.phone} ({(currentLead.currentPhoneIndex || 0) + 1} of {currentLead.phones.length})
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => onNextPhone('no-answer')}
                disabled={!currentLead || isSubmitting}
                size="sm"
                variant="outline"
                className="border-red-500/30 text-red-600 hover:bg-red-500/10 hover:border-red-500/50 font-medium h-10"
              >
                <XCircle className="w-4 h-4 mr-1" />
                No Answer
              </Button>
              <Button
                onClick={() => onNextPhone('busy')}
                disabled={!currentLead || isSubmitting}
                size="sm"
                variant="outline"
                className="border-orange-500/30 text-orange-600 hover:bg-orange-500/10 hover:border-orange-500/50 font-medium h-10"
              >
                <PhoneOff className="w-4 h-4 mr-1" />
                Busy
              </Button>
              <Button
                onClick={() => onNextPhone('voicemail')}
                disabled={!currentLead || isSubmitting}
                size="sm"
                variant="outline"
                className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10 hover:border-blue-500/50 font-medium h-10"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Voicemail
              </Button>
              <Button
                onClick={() => onNextPhone('disconnected')}
                disabled={!currentLead || isSubmitting}
                size="sm"
                variant="outline"
                className="border-red-600/30 text-red-700 hover:bg-red-600/10 hover:border-red-600/50 font-medium h-10"
              >
                <PhoneMissed className="w-4 h-4 mr-1" />
                Disconnected
              </Button>
              <Button
                onClick={() => onNextPhone('not-in-service')}
                disabled={!currentLead || isSubmitting}
                size="sm"
                variant="outline"
                className="border-purple-500/30 text-purple-600 hover:bg-purple-500/10 hover:border-purple-500/50 font-medium h-10 col-span-2"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Not in Service
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              💡 Mark outcome & auto-switch to next phone
            </p>
          </div>
        )}

        {/* Notes Section */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">Call Notes</label>
            <span className="text-xs text-muted-foreground font-medium">
              {notes.length}/{maxNoteLength}
            </span>
          </div>
          <Textarea
            placeholder="Add notes about this call (customer feedback, next steps, etc.)..."
            value={notes}
            onChange={(e) => {
              if (e.target.value.length <= maxNoteLength) {
                setNotes(e.target.value);
              }
            }}
            className="glass-strong border-border/50 text-foreground min-h-32 resize-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 pt-3 border-t border-border/30">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quick Actions</p>
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={() => {
                setNotes((prev) => (prev ? prev + '\n[Callback requested]' : '[Callback requested]'));
                handleSubmit('no-answer');
              }}
              disabled={!currentLead || isSubmitting}
              variant="outline"
              className="w-full border-primary/30 text-foreground h-10 hover:bg-primary/10 hover:border-primary/50 font-medium bg-transparent disabled:opacity-40 transition-all duration-200"
            >
              🔄 Flag for Callback
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
