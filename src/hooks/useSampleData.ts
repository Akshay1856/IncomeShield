import { useState, useCallback } from 'react';
import { mockClaims, mockTriggerEvents, type Claim, type TriggerEvent } from '@/lib/mockData';

const HOURLY_RATE = 125; // ₹125/hr

// Recalculate payouts based on lostHours × hourly rate
function recalculateClaim(claim: Claim): Claim {
  return {
    ...claim,
    payoutAmount: claim.lostHours * HOURLY_RATE,
  };
}

const sampleClaims: Claim[] = mockClaims.map(recalculateClaim);
const sampleTriggerEvents: TriggerEvent[] = [...mockTriggerEvents];

export function useSampleData() {
  const [isLoaded, setIsLoaded] = useState(false);

  const loadSampleData = useCallback(() => setIsLoaded(true), []);
  const clearSampleData = useCallback(() => setIsLoaded(false), []);

  return {
    isLoaded,
    loadSampleData,
    clearSampleData,
    claims: isLoaded ? sampleClaims : [],
    triggerEvents: isLoaded ? sampleTriggerEvents : [],
    hourlyRate: HOURLY_RATE,
  };
}
