'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface SetupModalProps {
  onComplete: (spreadsheetId: string, agentName: string) => void;
}

export function SetupModal({ onComplete }: SetupModalProps) {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [agentName, setAgentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spreadsheetId || !agentName) return;

    setIsLoading(true);
    try {
      // Verify spreadsheet access
      const response = await fetch(
        `/api/leads?spreadsheetId=${encodeURIComponent(spreadsheetId)}`
      );
      if (!response.ok) throw new Error('Failed to access spreadsheet');

      onComplete(spreadsheetId, agentName);
    } catch (error) {
      console.error('Setup error:', error);
      alert('Failed to access spreadsheet. Check your Sheet ID.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl">Setup Your Dialer</CardTitle>
          <CardDescription>
            Connect your Google Sheet and enter your agent name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="spreadsheetId" className="text-slate-300">
                Google Sheet ID
              </Label>
              <Input
                id="spreadsheetId"
                placeholder="1a2b3c4d5e6f7g8h9i0j..."
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400 mt-1">
                Find this in your Google Sheet URL: docs.google.com/spreadsheets/d/
                <strong>SHEET_ID</strong>
              </p>
            </div>

            <div>
              <Label htmlFor="agentName" className="text-slate-300">
                Your Name
              </Label>
              <Input
                id="agentName"
                placeholder="John Doe"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={!spreadsheetId || !agentName || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
            >
              {isLoading ? 'Connecting...' : 'Start Dialing'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
