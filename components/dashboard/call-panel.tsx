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
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Call Outcome</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Outcome Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleSubmit('answered')}
            disabled={!currentLead || isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-10"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Answered
          </Button>
          <Button
            onClick={() => handleSubmit('no-answer')}
            disabled={!currentLead || isSubmitting}
            className="bg-slate-600 hover:bg-slate-700 text-white h-10"
          >
            <XCircle className="w-4 h-4 mr-1" />
            No Answer
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleSubmit('voicemail')}
            disabled={!currentLead || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white h-10"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Voicemail
          </Button>
          <Button
            onClick={() => handleSubmit('busy')}
            disabled={!currentLead || isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white h-10"
          >
            Busy
          </Button>
        </div>

        {/* Notes Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Notes</label>
          <Textarea
            placeholder="Add notes about this call..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white min-h-24 resize-none"
          />
        </div>

        {/* Quick Outcomes */}
        <div className="space-y-2 pt-2 border-t border-slate-700">
          <p className="text-xs font-medium text-slate-400 uppercase">Quick Flags</p>
          <div className="space-y-2">
            <Button
              onClick={() => {
                setNotes((prev) => prev + '\n[Called Back Later]');
                handleSubmit('no-answer');
              }}
              disabled={!currentLead || isSubmitting}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 h-8"
            >
              Flag for Retry
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
