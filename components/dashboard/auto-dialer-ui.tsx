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
  phones?: string[];
  currentPhoneIndex?: number;
  email: string;
  status: string;
}

interface AutoDialerUIProps {
  currentLead: Lead | null;
  isAutoDialing: boolean;
  onStartDialing: () => void;
  onStopDialing: () => void;
  onNextPhone?: () => void;
}

export function AutoDialerUI({
  currentLead,
  isAutoDialing,
  onStartDialing,
  onStopDialing,
  onNextPhone,
}: AutoDialerUIProps) {
  const [callDuration, setCallDuration] = useState(0);
  
  // Get current phone and check if there are more phones
  const currentPhoneIndex = currentLead?.currentPhoneIndex || 0;
  const allPhones = currentLead?.phones || [currentLead?.phone].filter(Boolean);
  const currentPhone = allPhones[currentPhoneIndex] || currentLead?.phone || '';
  const hasMorePhones = allPhones.length > 1 && currentPhoneIndex < allPhones.length - 1;

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
    <Card className="glass-strong shadow-glow border-border/50 overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Active Dialer
          </CardTitle>
          {isAutoDialing && (
            <Badge className="gradient-accent shadow-glow-green text-white animate-pulse px-3 py-1">
              Live Call
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {currentLead ? (
          <>
            {/* Current Lead Info */}
            <div className="space-y-4 p-5 glass rounded-xl border-l-4 border-primary/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 gradient-primary rounded-full flex items-center justify-center shadow-glow ring-2 ring-primary/20">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl">{currentLead.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {currentLead.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 glass-strong rounded-lg relative group cursor-pointer hover:border-primary/50 transition-all">
                  <div className="w-10 h-10 rounded-lg gradient-primary/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      Phone {allPhones.length > 1 ? `${currentPhoneIndex + 1}/${allPhones.length}` : ''}
                    </p>
                    <p className="font-mono text-white font-bold text-sm">{formatPhoneNumber(currentPhone)}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex items-center gap-3 p-4 glass-strong rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Duration</p>
                    <p className="font-mono text-white font-bold text-sm">{formatDuration(callDuration)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => openClickToDial(currentPhone, currentLead.name)}
                  size="lg"
                  className="w-full gradient-primary hover:opacity-90 text-white h-14 font-bold text-base shadow-glow transition-all"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Click-to-Dial
                </Button>
                {hasMorePhones && onNextPhone && (
                  <Button
                    onClick={onNextPhone}
                    size="lg"
                    variant="outline"
                    className="w-full border-accent/50 text-accent h-12 font-semibold hover:bg-accent/10 bg-transparent"
                  >
                    Try Next Phone ({allPhones.length - currentPhoneIndex - 1} more)
                  </Button>
                )}
              </div>
              {isAutoDialing ? (
                <Button
                  onClick={onStopDialing}
                  size="lg"
                  className="w-full bg-destructive hover:bg-destructive/90 text-white h-14 font-bold text-base shadow-lg"
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  End Call
                </Button>
              ) : (
                <Button
                  onClick={onStartDialing}
                  size="lg"
                  variant="outline"
                  className="w-full border-primary/30 text-foreground h-14 font-bold text-base hover:bg-primary/10 hover:border-primary/50 bg-transparent transition-all"
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
