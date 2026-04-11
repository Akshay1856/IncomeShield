export type AIEventType = 'pricing' | 'trigger' | 'fraud' | 'payout' | 'retention';

export interface ExperienceRecord {
  id: string;
  event_type: AIEventType;
  inputs: Record<string, number | string | boolean>;
  decision: Record<string, number | string | boolean>;
  outcome: Record<string, number | string | boolean>;
  user_response?: string;
  fraud_status?: string;
  financial_result_inr?: number;
  decision_was_good: boolean;
}

export interface AgentPublicState {
  learning_cycles: number;
  last_loss: number;
  premium_bias: number;
  rain_threshold_offset: number;
  heat_threshold_offset: number;
  fraud_strictness: number;
  payout_fairness_bias: number;
  model_version: number;
  recent_insights: string[];
}

export interface LearningCycleResult {
  ok: boolean;
  loss?: number;
  hindsight_replays?: number;
  state: AgentPublicState;
  mean_correction?: number[];
  message?: string;
}

const STORAGE_KEY = 'incomeshield_ai_experiences';
const STATE_KEY = 'incomeshield_ai_agent_state';

export function loadLocalExperiences(): ExperienceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExperienceRecord[];
  } catch {
    return [];
  }
}

export function saveLocalExperiences(exps: ExperienceRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exps));
}

export function loadLocalAgentState(): AgentPublicState | null {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AgentPublicState;
  } catch {
    return null;
  }
}

export function saveLocalAgentState(s: AgentPublicState) {
  localStorage.setItem(STATE_KEY, JSON.stringify(s));
}

export const defaultAgentState = (): AgentPublicState => ({
  learning_cycles: 0,
  last_loss: 0,
  premium_bias: 0,
  rain_threshold_offset: 0,
  heat_threshold_offset: 0,
  fraud_strictness: 0,
  payout_fairness_bias: 0,
  model_version: 1,
  recent_insights: [],
});
