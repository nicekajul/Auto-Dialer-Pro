'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Clock, User, Mail, ExternalLink } from 'lucide-react';
import { openClickToDial, formatPhoneNumber } from '@/lib/ringcentral-dial';

import { Lead } from '@/lib/google-sheets';

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
    <Card className="glass-strong shadow-glow border-border/50 overflow-hidden transition-all duration-300">
      <CardHeader className="border-b border-border bg-gradient-to-br from-primary/10 to-transparent pb-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Phone className="w-6 h-6 text-primary" />
            Active Dialer
          </CardTitle>
          {isAutoDialing && (
            <Badge className="bg-teal-500 text-white animate-pulse px-3 py-1 shadow-md">
              Live Call
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {currentLead ? (
          <div className="space-y-4 p-5 bg-card border-2 border-primary/20 rounded-xl shadow-sm">
            {/* Current Lead Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-md">
                <User className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-xl">{currentLead.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {currentLead.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-4 p-4 bg-muted/50 border border-border rounded-xl hover:border-primary/40 transition-all duration-200 cursor-pointer group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    Phone {allPhones.length > 1 ? `${currentPhoneIndex + 1}/${allPhones.length}` : ''}
                  </p>
                  <p className="font-mono text-foreground font-bold text-sm">{formatPhoneNumber(currentPhone)}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 border border-border rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Duration</p>
                  <p className="font-mono text-foreground font-bold text-sm">{formatDuration(callDuration)}</p>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => openClickToDial(currentPhone, currentLead.name)}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 font-bold text-base shadow-lg transition-all"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Click-to-Dial
                </Button>
                {hasMorePhones && onNextPhone && (
                  <Button
                    onClick={onNextPhone}
                    size="lg"
                    variant="outline"
                    className="w-full border-2 border-primary text-primary h-12 font-semibold hover:bg-primary/70 bg-transparent"
                  >
                    Try Next Phone ({allPhones.length - currentPhoneIndex - 1} more)
                  </Button>
                )}
              </div>

              <Button
                onClick={onStopDialing}
                variant="destructive"
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 text-white h-12 font-bold shadow-md"
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                End Call
              </Button>
            </div>

            {/* Call Status */}
            <div className="p-4 bg-gradient-to-br from-muted/50 to-muted/30 border border-border rounded-xl text-center">
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {isAutoDialing
                  ? '📞 Call in progress... Click "End Call" when finished'
                  : '🎯 Ready to dial. Click button above to begin calling'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Phone className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">No Leads Available</h3>
              <p className="text-muted-foreground">Load leads from your Google Sheet to start dialing</p>
            </div>
            <Button
              onClick={onStartDialing}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg"
            >
              Load Leads
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
