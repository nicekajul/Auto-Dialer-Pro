'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Clock, User, Mail, ExternalLink } from 'lucide-react';
import { openClickToDial, formatPhoneNumber } from '@/lib/ringcentral-dial';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
}

interface AutoDialerUIProps {
  currentLead: Lead | null;
  isAutoDialing: boolean;
  onStartDialing: () => void;
  onStopDialing: () => void;
}

export function AutoDialerUI({
  currentLead,
  isAutoDialing,
  onStartDialing,
  onStopDialing,
}: AutoDialerUIProps) {
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!isAutoDialing) {
      setCallDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoDialing]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Active Dialer</CardTitle>
          {isAutoDialing && (
            <Badge className="bg-green-600 text-white animate-pulse">Live Call</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentLead ? (
          <>
            {/* Current Lead Info */}
            <div className="space-y-4 p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{currentLead.name}</h3>
                  <p className="text-sm text-slate-400">{currentLead.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-slate-800 rounded relative group cursor-pointer">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="font-mono text-white font-semibold">{formatPhoneNumber(currentLead.phone)}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-800 rounded">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-xs text-slate-400">Duration</p>
                    <p className="font-mono text-white font-semibold">{formatDuration(callDuration)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => openClickToDial(currentLead.phone, currentLead.name)}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-semibold"
              >
                <Phone className="w-5 h-5 mr-2" />
                Click-to-Dial
              </Button>
              {isAutoDialing ? (
                <Button
                  onClick={onStopDialing}
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700 text-white h-12 font-semibold"
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  End Call
                </Button>
              ) : (
                <Button
                  onClick={onStartDialing}
                  size="lg"
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 h-12 font-semibold bg-transparent"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Auto-Dial Next
                </Button>
              )}
            </div>

            {/* Call Status */}
            <div className="p-3 bg-slate-700/30 rounded text-center">
              <p className="text-sm text-slate-400">
                {isAutoDialing
                  ? 'Call in progress... Click "Stop Call" when done'
                  : 'Ready to dial. Click "Start Dialing" to begin'}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-12 space-y-4">
            <Phone className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400">No leads available to dial</p>
            <Button
              onClick={onStartDialing}
              size="lg"
              className="mx-auto bg-blue-600 hover:bg-blue-700"
            >
              Load Leads
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
