import type { AgentPublicState, ExperienceRecord, LearningCycleResult } from './aiAgentTypes';
import { defaultAgentState, loadLocalAgentState, loadLocalExperiences, saveLocalAgentState, saveLocalExperiences } from './aiAgentTypes';

/** TypeScript mirror of Python hindsight target logic for offline demo. */
export function computeHindsightTargets(exp: ExperienceRecord): number[] {
  const out = exp.outcome || {};
  const good = exp.decision_was_good;
  const t = [0, 0, 0, 0, 0];
  if (good) return t;

  if (out.user_churned) t[0] -= 0.12;
  if (Number(out.loss_ratio || 0) > 0.45) t[0] += 0.08;
  if (out.missed_trigger) t[1] -= 0.06;
  if (out.false_trigger) t[1] += 0.05;
  if (out.missed_trigger && exp.event_type === 'trigger') t[2] -= 0.04;
  if (out.false_trigger && exp.event_type === 'trigger') t[2] += 0.03;
  if (out.fraud_missed) t[3] += 0.1;
  if (out.false_fraud_flag) t[3] -= 0.08;
  const idealDelta = Number(out.ideal_payout_delta || 0);
  if (Math.abs(idealDelta) > 1) t[4] = Math.max(-0.15, Math.min(0.15, idealDelta / 800));
  if (Number(out.renewed ?? 1) < 0.5) t[0] -= 0.05;
  return t.map((x) => Math.max(-0.25, Math.min(0.25, x)));
}

function applyDeltas(state: AgentPublicState, deltas: number[]): AgentPublicState {
  const d = deltas;
  const next = { ...state };
  next.premium_bias += d[0] * 5;
  next.rain_threshold_offset += d[1] * 8;
  next.heat_threshold_offset += d[2] * 2;
  next.fraud_strictness += d[3] * 0.15;
  next.payout_fairness_bias += d[4] * 40;
  next.premium_bias = Math.max(-25, Math.min(25, next.premium_bias));
  next.rain_threshold_offset = Math.max(-15, Math.min(15, next.rain_threshold_offset));
  next.heat_threshold_offset = Math.max(-5, Math.min(5, next.heat_threshold_offset));
  next.fraud_strictness = Math.max(-0.5, Math.min(0.5, next.fraud_strictness));
  next.payout_fairness_bias = Math.max(-120, Math.min(120, next.payout_fairness_bias));
  return next;
}

function insightsFrom(mean: number[], recent: ExperienceRecord[]): string[] {
  const out: string[] = [];
  const bad = recent.filter((e) => !e.decision_was_good);
  if (bad.length) {
    out.push(`Last suboptimal event: ${bad[bad.length - 1]?.event_type} — hindsight relabel applied.`);
  }
  if (mean[0] < -0.02) out.push('Pricing: leaning slightly cheaper after churn signals.');
  else if (mean[0] > 0.02) out.push('Pricing: nudging premiums up after loss-ratio stress.');
  if (Math.abs(mean[1]) > 0.02) out.push('Rain trigger: threshold updated from replay.');
  if (Math.abs(mean[3]) > 0.02) out.push('Fraud: strictness adjusted from FP/FN mix.');
  if (!out.length) out.push('Cycle complete: consolidated small policy corrections.');
  return out;
}

/** Offline learning cycle: MSE-style mean correction from hindsight targets. */
export function runLocalLearningCycle(): LearningCycleResult {
  let exps = loadLocalExperiences();
  if (exps.length < 4) {
    exps = [...exps, ...seedExperiences()];
    saveLocalExperiences(exps);
  }
  if (exps.length < 2) {
    return { ok: false, message: 'Not enough experiences', state: loadLocalAgentState() || defaultAgentState() };
  }

  const xs: number[][] = [];
  for (const exp of exps) {
    xs.push(computeHindsightTargets(exp));
    if (!exp.decision_was_good) xs.push([0, 0, 0, 0, 0]);
  }
  const mean = [0, 1, 2, 3, 4].map((j) => xs.reduce((s, row) => s + row[j], 0) / xs.length);
  const loss = xs.reduce((s, row) => {
    const e = row.reduce((a, v, i) => a + (v - mean[i]) ** 2, 0) / 5;
    return s + e;
  }, 0) / xs.length;

  let state = loadLocalAgentState() || defaultAgentState();
  state = applyDeltas(state, mean);
  state.learning_cycles += 1;
  state.model_version += 1;
  state.last_loss = loss;
  state.recent_insights = [...state.recent_insights, ...insightsFrom(mean, exps.slice(-20))].slice(-20);
  saveLocalAgentState(state);

  return {
    ok: true,
    loss,
    hindsight_replays: xs.length - exps.length,
    state,
    mean_correction: mean,
  };
}

export function seedExperiences(): ExperienceRecord[] {
  return [
    {
      id: 'seed_p1',
      event_type: 'pricing',
      inputs: { city: 'Mumbai', claim_frequency_30d: 2, avg_rain_mm: 45, heat_index: 34, traffic_index: 0.72, earnings_volatility: 0.35, prev_payout_ratio: 0.25, season_monsoon: 1 },
      decision: { premium_weekly: 95 },
      outcome: { user_churned: true, loss_ratio: 0.28, renewed: 0 },
      decision_was_good: false,
      financial_result_inr: -120,
    },
    {
      id: 'seed_p2',
      event_type: 'pricing',
      inputs: { city: 'Delhi', claim_frequency_30d: 5, avg_rain_mm: 8, heat_index: 44, traffic_index: 0.55, earnings_volatility: 0.4, prev_payout_ratio: 0.55, season_summer: 1 },
      decision: { premium_weekly: 52 },
      outcome: { user_churned: false, loss_ratio: 0.62, renewed: 1 },
      decision_was_good: false,
      financial_result_inr: -800,
    },
    {
      id: 'seed_t1',
      event_type: 'trigger',
      inputs: { city: 'Bengaluru', avg_rain_mm: 38 },
      decision: { rain_threshold_mm: 40, heat_threshold_c: 43 },
      outcome: { missed_trigger: true, false_trigger: false },
      decision_was_good: false,
      financial_result_inr: -400,
    },
    {
      id: 'seed_t2',
      event_type: 'trigger',
      inputs: { city: 'Chennai' },
      decision: { rain_threshold_mm: 30 },
      outcome: { missed_trigger: false, false_trigger: true },
      decision_was_good: false,
      financial_result_inr: -250,
    },
    {
      id: 'seed_f1',
      event_type: 'fraud',
      inputs: { city: 'Hyderabad', gps_anomaly_score: 0.15 },
      decision: { fraud_score: 0.22 },
      outcome: { fraud_missed: true, false_fraud_flag: false },
      decision_was_good: false,
      financial_result_inr: -900,
    },
    {
      id: 'seed_f2',
      event_type: 'fraud',
      inputs: { city: 'Pune', gps_anomaly_score: 0.05 },
      decision: { fraud_score: 0.85 },
      outcome: { fraud_missed: false, false_fraud_flag: true },
      decision_was_good: false,
      financial_result_inr: -80,
    },
    {
      id: 'seed_pay1',
      event_type: 'payout',
      inputs: { city: 'Kolkata', hour_of_day: 19, demand_zone_score: 0.8 },
      decision: { payout_offered: 420 },
      outcome: { ideal_payout_delta: 180 },
      decision_was_good: false,
      financial_result_inr: 50,
    },
    {
      id: 'seed_ret1',
      event_type: 'retention',
      inputs: { city: 'Mumbai' },
      decision: { premium_weekly: 88 },
      outcome: { renewed: 0, user_churned: true },
      decision_was_good: false,
      financial_result_inr: -200,
    },
    {
      id: 'seed_ok1',
      event_type: 'payout',
      inputs: { city: 'Delhi' },
      decision: { payout_offered: 500 },
      outcome: { ideal_payout_delta: 0 },
      decision_was_good: true,
      financial_result_inr: 120,
    },
    {
      id: 'seed_ok2',
      event_type: 'pricing',
      inputs: { city: 'Bengaluru' },
      decision: { premium_weekly: 72 },
      outcome: { loss_ratio: 0.32, renewed: 1 },
      decision_was_good: true,
      financial_result_inr: 300,
    },
  ];
}

export function appendLocalExperience(exp: ExperienceRecord): ExperienceRecord {
  const list = loadLocalExperiences();
  const id = exp.id || `exp_${list.length}_${Math.random().toString(36).slice(2, 8)}`;
  const withId = { ...exp, id };
  list.push(withId);
  saveLocalExperiences(list);
  return withId;
}

export function suggestPremiumLocal(base: number, city: string, state: AgentPublicState): { personalized: number; explainer: string } {
  const delta = state.premium_bias * 0.08;
  const adj = Math.max(29, Math.min(150, base + state.premium_bias + delta));
  return {
    personalized: Math.round(adj * 100) / 100,
    explainer: `Base ₹${base} adjusted by learned bias ${state.premium_bias >= 0 ? '+' : ''}${state.premium_bias.toFixed(1)} for ${city}.`,
  };
}
