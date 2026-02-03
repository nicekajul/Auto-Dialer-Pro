/**
 * Call Management System
 * Tracks call state, outcomes, and retry logic
 */

export interface CallRecord {
  leadId: string;
  timestamp: string;
  outcome: 'answered' | 'no-answer' | 'voicemail' | 'busy';
  duration: number; // in seconds
  notes: string;
  agent: string;
}

export interface CallState {
  isActive: boolean;
  currentLeadId: string | null;
  startTime: number | null;
  outcome?: string;
  notes?: string;
}

class CallManager {
  private callState: CallState = {
    isActive: false,
    currentLeadId: null,
    startTime: null,
  };

  private callHistory: CallRecord[] = [];

  startCall(leadId: string) {
    this.callState = {
      isActive: true,
      currentLeadId: leadId,
      startTime: Date.now(),
    };
    console.log(`[Call Manager] Call started for lead: ${leadId}`);
  }

  endCall(outcome: string, notes: string, agent: string): CallRecord | null {
    if (!this.callState.isActive || !this.callState.currentLeadId || !this.callState.startTime) {
      console.error('[Call Manager] No active call to end');
      return null;
    }

    const duration = Math.floor((Date.now() - this.callState.startTime) / 1000);

    const record: CallRecord = {
      leadId: this.callState.currentLeadId,
      timestamp: new Date().toISOString(),
      outcome: outcome as any,
      duration,
      notes,
      agent,
    };

    this.callHistory.push(record);
    this.callState = {
      isActive: false,
      currentLeadId: null,
      startTime: null,
    };

    console.log(`[Call Manager] Call ended:`, record);
    return record;
  }

  getCallDuration(): number {
    if (!this.callState.isActive || !this.callState.startTime) return 0;
    return Math.floor((Date.now() - this.callState.startTime) / 1000);
  }

  getCallHistory() {
    return [...this.callHistory];
  }

  clearHistory() {
    this.callHistory = [];
  }
}

export const callManager = new CallManager();
