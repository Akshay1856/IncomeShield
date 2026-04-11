import type { AgentPublicState, ExperienceRecord, LearningCycleResult } from './aiAgentTypes';

import {
  defaultAgentState,
  loadLocalExperiences,
  saveLocalExperiences,
  loadLocalAgentState,
  saveLocalAgentState
} from './aiAgentTypes';

import {
  appendLocalExperience,
  runLocalLearningCycle,
  seedExperiences,
  suggestPremiumLocal
} from './localHerFallback';

const BASE = '/api/ai';

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const r = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export async function apiAddExperience(exp: Omit<ExperienceRecord, 'id'> & { id?: string }): Promise<{ experience: ExperienceRecord; total: number } | null> {
  return fetchJson('/experiences', { method: 'POST', body: JSON.stringify(exp) });
}

export async function apiListExperiences(): Promise<{ experiences: ExperienceRecord[]; total: number } | null> {
  return fetchJson('/experiences?limit=200');
}

export async function apiAgentState(): Promise<{ state: AgentPublicState; experience_count: number } | null> {
  return fetchJson('/agent-state');
}

export async function apiLearningCycle(): Promise<LearningCycleResult | null> {
  return fetchJson('/learning-cycle', { method: 'POST', body: JSON.stringify({ batch_size: 32, epochs: 8 }) });
}

export async function apiSuggestPremium(body: {
  base_premium: number;
  city: string;
  claim_frequency_30d?: number;
  avg_rain_mm?: number;
  heat_index?: number;
}): Promise<{ personalized_premium: number; explainer: string; base_premium: number } | null> {
  return fetchJson('/suggest-premium', { method: 'POST', body: JSON.stringify(body) });
}

export async function apiTriggerThresholds(city: string): Promise<{ rain_mm: number; heat_c: number; explainer: string } | null> {
  return fetchJson(`/trigger-thresholds?city=${encodeURIComponent(city)}`);
}

export async function apiSeed(): Promise<{ seeded: number; total: number } | null> {
  return fetchJson('/seed', { method: 'POST' });
}

/** Sync server experiences into local cache when API works. */
export function mergeServerExperiencesIntoLocal(serverExps: ExperienceRecord[]) {
  const local = loadLocalExperiences();
  const ids = new Set(local.map((e) => e.id));
  const merged = [...local];
  for (const e of serverExps) {
    if (!ids.has(e.id)) merged.push(e);
  }
  saveLocalExperiences(merged);
}

export function addExperienceHybrid(exp: Omit<ExperienceRecord, 'id'> & { id?: string }): ExperienceRecord {
  const full: ExperienceRecord = {
    ...exp,
    id: exp.id ?? `exp_${Date.now()}`,
    decision_was_good: exp.decision_was_good,
  };
  const saved = appendLocalExperience(full);
  void apiAddExperience(saved).then((res) => {
    if (res?.experience) mergeServerExperiencesIntoLocal([res.experience]);
  });
  return saved;
}

export async function runLearningCycleHybrid(): Promise<LearningCycleResult> {
  const remote = await apiLearningCycle();
  if (remote && remote.ok && remote.state) {
    saveLocalAgentState(remote.state);
    const list = await apiListExperiences();
    if (list?.experiences) mergeServerExperiencesIntoLocal(list.experiences);
    return remote;
  }
  return runLocalLearningCycle();
}

export async function refreshAgentStateHybrid(): Promise<AgentPublicState> {
  const remote = await apiAgentState();
  if (remote?.state) {
    saveLocalAgentState(remote.state);
    return remote.state;
  }
  await apiSeed().catch(() => null);
  const again = await apiAgentState();
  if (again?.state) {
    saveLocalAgentState(again.state);
    return again.state;
  }
  return loadLocalAgentState() || defaultAgentState();
}

export async function computePersonalizedPremiumHybrid(
  basePremium: number,
  city: string,
  extras?: Record<string, number>,
): Promise<{ amount: number; explainer: string }> {
  const state = await refreshAgentStateHybrid();
  const remote = await apiSuggestPremium({
    base_premium: basePremium,
    city,
    ...extras,
  });
  if (remote) {
    return { amount: remote.personalized_premium, explainer: remote.explainer };
  }
  const loc = suggestPremiumLocal(basePremium, city, state);
  return { amount: loc.personalized, explainer: loc.explainer };
}

export async function getTriggerThresholdsHybrid(city: string): Promise<{ rain_mm: number; heat_c: number; explainer: string }> {
  const r = await apiTriggerThresholds(city);
  if (r) return r;
  const s = loadLocalAgentState() || defaultAgentState();
  const rain = Math.max(20, Math.min(70, 40 + s.rain_threshold_offset));
  const heat = Math.max(38, Math.min(48, 43 + s.heat_threshold_offset));
  return {
    rain_mm: Math.round(rain * 10) / 10,
    heat_c: Math.round(heat * 10) / 10,
    explainer: 'Offline thresholds from local replay state.',
  };
}

export function ensureLocalSeeds() {
  const exps = loadLocalExperiences();
  if (exps.length < 4) {
    saveLocalExperiences([...exps, ...seedExperiences()]);
  }
}
