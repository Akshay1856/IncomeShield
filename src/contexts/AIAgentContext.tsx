import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AgentPublicState, ExperienceRecord, LearningCycleResult } from '@/lib/aiAgentTypes';
import { defaultAgentState } from '@/lib/aiAgentTypes';
import {
  addExperienceHybrid,
  computePersonalizedPremiumHybrid,
  ensureLocalSeeds,
  getTriggerThresholdsHybrid,
  refreshAgentStateHybrid,
  runLearningCycleHybrid,
  loadLocalExperiences,
} from '@/lib/aiAgentApi';

interface AIAgentContextValue {
  agentState: AgentPublicState;
  experiences: ExperienceRecord[];
  backendConnected: boolean | null;
  loading: boolean;
  lastCycle: LearningCycleResult | null;
  personalizedPremium: number | null;
  premiumExplainer: string;
  rainThresholdMm: number;
  heatThresholdC: number;
  thresholdExplainer: string;
  refresh: () => Promise<void>;
  runLearning: () => Promise<LearningCycleResult>;
  recordExperience: (exp: Omit<ExperienceRecord, 'id'> & { id?: string }) => ExperienceRecord;
  setPersonalizedFromDashboard: (base: number, city: string) => Promise<void>;
}

const AIAgentContext = createContext<AIAgentContextValue | null>(null);

export function AIAgentProvider({ children }: { children: React.ReactNode }) {
  const [agentState, setAgentState] = useState<AgentPublicState>(defaultAgentState());
  const [experiences, setExperiences] = useState<ExperienceRecord[]>([]);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCycle, setLastCycle] = useState<LearningCycleResult | null>(null);
  const [personalizedPremium, setPersonalizedPremium] = useState<number | null>(null);
  const [premiumExplainer, setPremiumExplainer] = useState('');
  const [rainThresholdMm, setRainThresholdMm] = useState(40);
  const [heatThresholdC, setHeatThresholdC] = useState(43);
  const [thresholdExplainer, setThresholdExplainer] = useState('');

  const syncExperiences = useCallback(() => {
    setExperiences(loadLocalExperiences());
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    ensureLocalSeeds();
    try {
      const health = await fetch('/api/ai/health').then((r) => r.ok).catch(() => false);
      setBackendConnected(health);
      const state = await refreshAgentStateHybrid();
      setAgentState(state);
      syncExperiences();
      const th = await getTriggerThresholdsHybrid('Mumbai');
      setRainThresholdMm(th.rain_mm);
      setHeatThresholdC(th.heat_c);
      setThresholdExplainer(th.explainer);
    } finally {
      setLoading(false);
    }
  }, [syncExperiences]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runLearning = useCallback(async () => {
    const res = await runLearningCycleHybrid();
    setLastCycle(res);
    if (res.state) setAgentState(res.state);
    syncExperiences();
    return res;
  }, [syncExperiences]);

  const recordExperience = useCallback((exp: Omit<ExperienceRecord, 'id'> & { id?: string }) => {
    const saved = addExperienceHybrid(exp);
    syncExperiences();
    return saved;
  }, [syncExperiences]);

  const setPersonalizedFromDashboard = useCallback(async (base: number, city: string) => {
    const { amount, explainer } = await computePersonalizedPremiumHybrid(base, city, {
      claim_frequency_30d: 2,
      avg_rain_mm: 35,
      heat_index: 36,
    });
    setPersonalizedPremium(amount);
    setPremiumExplainer(explainer);
    const th = await getTriggerThresholdsHybrid(city);
    setRainThresholdMm(th.rain_mm);
    setHeatThresholdC(th.heat_c);
    setThresholdExplainer(th.explainer);
  }, []);

  const value = useMemo<AIAgentContextValue>(
    () => ({
      agentState,
      experiences,
      backendConnected,
      loading,
      lastCycle,
      personalizedPremium,
      premiumExplainer,
      rainThresholdMm,
      heatThresholdC,
      thresholdExplainer,
      refresh,
      runLearning,
      recordExperience,
      setPersonalizedFromDashboard,
    }),
    [
      agentState,
      experiences,
      backendConnected,
      loading,
      lastCycle,
      personalizedPremium,
      premiumExplainer,
      rainThresholdMm,
      heatThresholdC,
      thresholdExplainer,
      refresh,
      runLearning,
      recordExperience,
      setPersonalizedFromDashboard,
    ],
  );

  return <AIAgentContext.Provider value={value}>{children}</AIAgentContext.Provider>;
}

export function useAIAgent() {
  const ctx = useContext(AIAgentContext);
  if (!ctx) throw new Error('useAIAgent must be used within AIAgentProvider');
  return ctx;
}
