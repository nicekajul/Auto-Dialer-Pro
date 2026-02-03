'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Flag, CheckCircle, Trash2 } from 'lucide-react';

interface BulkActionsProps {
  spreadsheetId: string | null;
  onActionsComplete?: () => void;
}

export function BulkActions({ spreadsheetId, onActionsComplete }: BulkActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const performBulkAction = async (action: string) => {
    if (!spreadsheetId) {
      toast({ title: 'Error', description: 'No spreadsheet connected' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId,
          action,
        }),
      });

      if (!response.ok) throw new Error('Bulk action failed');

      const data = await response.json();
      toast({
        title: 'Success',
        description: `${data.updatesApplied} leads updated`,
      });

      onActionsComplete?.();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({ title: 'Error', description: 'Failed to perform action' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-strong border-border shadow-lg">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="text-xl font-bold text-foreground">Bulk Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={isLoading || !spreadsheetId}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 justify-center font-semibold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry All No-Answer Leads
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-slate-800 border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle>Reset No-Answer Leads?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This will mark all "no-answer" leads as pending for another attempt.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction
              onClick={() => performBulkAction('retry-no-answer')}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Continue
            </AlertDialogAction>
            <AlertDialogCancel className="border-slate-600">Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={isLoading || !spreadsheetId}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 justify-center font-semibold"
            >
              <Flag className="w-4 h-4 mr-2" />
              Flag No-Answer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-strong border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Add Flag to No-Answer Leads?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This will add a follow-up flag to all no-answer calls for later contact.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction
              onClick={() => performBulkAction('flag-no-answer')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Continue
            </AlertDialogAction>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={isLoading || !spreadsheetId}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 justify-center font-semibold"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Contacted
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-strong border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Mark All as Contacted?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This will mark all pending leads as "no-answer" and increment attempt counts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction
              onClick={() => performBulkAction('mark-contacted')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Continue
            </AlertDialogAction>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={isLoading || !spreadsheetId}
              variant="outline"
              className="w-full border-red-600 text-red-400 hover:bg-red-950 h-12 justify-center font-semibold bg-transparent"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-slate-800 border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle>Reset All Leads?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This will reset all leads to "pending" status and clear notes. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction
              onClick={() => performBulkAction('clear-all')}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Reset All
            </AlertDialogAction>
            <AlertDialogCancel className="border-slate-600">Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
