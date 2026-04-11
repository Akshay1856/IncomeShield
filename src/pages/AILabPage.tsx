import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAIAgent } from '@/contexts/AIAgentContext';
import { formatCurrency } from '@/lib/mockData';
import { calculatePremium, mockClaims, mockPolicy } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area,
} from 'recharts';
import {
  Brain, Play, RefreshCw, Shield, AlertTriangle, Sparkles, Activity, Gavel, Users, Cpu, CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import CoverageMapPreview from '@/components/CoverageMapPreview';

const DEMO_STEPS = [
  'New user joins and completes profile',
  'Adaptive Risk agent sets personalized weekly premium',
  'Weather / disruption event occurs',
  'Claim processed (trigger + payout agents)',
  'Outcome stored in Experience Memory',
  'Run hindsight learning cycle',
  'Agents update pricing, triggers, fraud, and payout bias',
];

export default function AILabPage() {
  const { user } = useAuth();
  const {
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
  } = useAIAgent();

  const [cycleRunning, setCycleRunning] = useState(false);
  const [history, setHistory] = useState<{ cycle: number; loss: number; version: number }[]>([]);

  const city = user?.city || 'Mumbai';
  const baseCalc = useMemo(() => calculatePremium(mockPolicy.baseRate, city, user?.workType || 'full-time'), [city, user?.workType]);

  useEffect(() => {
    void setPersonalizedFromDashboard(baseCalc.total, city);
  }, [baseCalc.total, city, setPersonalizedFromDashboard]);

  useEffect(() => {
    if (lastCycle?.ok && lastCycle.loss != null) {
      setHistory((h) => [
        ...h,
        { cycle: lastCycle.state.learning_cycles, loss: lastCycle.loss, version: lastCycle.state.model_version },
      ].slice(-12));
    }
  }, [lastCycle]);

  const onRunLearning = useCallback(async () => {
    setCycleRunning(true);
    try {
      const res = await runLearning();
      if (res.ok) {
        toast.success('Learning cycle complete', {
          description: `Loss ${res.loss?.toFixed(4) ?? '—'} · Hindsight replays: ${res.hindsight_replays ?? 0}`,
        });
        await setPersonalizedFromDashboard(baseCalc.total, city);
      } else toast.error(res.message || 'Learning failed');
    } finally {
      setCycleRunning(false);
    }
  }, [runLearning, setPersonalizedFromDashboard, baseCalc.total, city]);

  const fraudAlerts = useMemo(() => {
    return experiences
      .filter((e) => e.event_type === 'fraud' && !e.decision_was_good)
      .slice(-5)
      .map((e) => ({
        id: e.id,
        city: String(e.inputs.city ?? '—'),
        detail: e.outcome.fraud_missed ? 'Missed fraud — hindsight tightening' : 'False positive — easing strictness',
      }));
  }, [experiences]);

  const modelAccuracy = useMemo(() => {
    const base = 72;
    const bump = Math.min(18, agentState.learning_cycles * 1.2 + agentState.model_version * 0.15);
    return Math.min(96, base + bump);
  }, [agentState.learning_cycles, agentState.model_version]);

  const fairnessScore = useMemo(() => {
    const base = 68;
    const bump = Math.min(25, agentState.learning_cycles * 0.9);
    return Math.min(94, base + bump);
  }, [agentState.learning_cycles]);

  const handleDemoPayout = () => {
    const offered = 450;
    const lostHours = 5;
    const ideal = lostHours * 120;
    const delta = ideal - offered;
    const good = Math.abs(delta) < 80;
    recordExperience({
      event_type: 'payout',
      inputs: { city, hour_of_day: 18, demand_zone_score: 0.75 },
      decision: { payout_offered: offered },
      outcome: { ideal_payout_delta: delta, false_trigger: false },
      decision_was_good: good,
      financial_result_inr: good ? 100 : -50,
    });
    toast.message('Experience logged', { description: good ? 'Payout near fair (good).' : `Δ vs ideal: ₹${delta.toFixed(0)} — stored for HER.` });
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Brain className="h-7 w-7 text-primary" />
              AI Agent Command Center
            </h1>
            <Badge variant={backendConnected ? 'default' : 'secondary'} className="text-[10px]">
              {backendConnected === null ? '…' : backendConnected ? 'PyTorch service' : 'Local HER fallback'}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Hindsight Experience Replay: every disruption becomes training signal — including misses and false triggers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button size="sm" className="gap-2 btn-3d" onClick={() => void onRunLearning()} disabled={cycleRunning || loading}>
            {cycleRunning ? <Activity className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />}
            Run learning cycle
          </Button>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Demo flow
          </CardTitle>
          <CardDescription>Walk through the autonomous learning loop end to end.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-1 text-sm text-foreground">
            {DEMO_STEPS.map((s) => (
              <li key={s} className="text-muted-foreground"><span className="text-foreground">{s}</span></li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Tabs defaultValue="user" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[480px]">
          <TabsTrigger value="user">My AI</TabsTrigger>
          <TabsTrigger value="admin">Platform AI</TabsTrigger>
          <TabsTrigger value="explain">Explainability</TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="elevated-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Adaptive risk — weekly plan
                </CardTitle>
                <CardDescription>Personalized premium from the pricing agent + your zone.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Rule-based baseline</span>
                  <span className="font-mono font-semibold">{formatCurrency(baseCalc.total)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">AI-adjusted weekly</span>
                  <span className="text-2xl font-bold text-primary">
                    {personalizedPremium != null ? formatCurrency(personalizedPremium) : '—'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{premiumExplainer || 'Loading…'}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-muted/50 border border-border">
                    <p className="text-muted-foreground">Rain trigger</p>
                    <p className="font-semibold">{rainThresholdMm} mm</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50 border border-border">
                    <p className="text-muted-foreground">Heat trigger</p>
                    <p className="font-semibold">{heatThresholdC} °C</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">{thresholdExplainer}</p>
              </CardContent>
            </Card>

            <CoverageMapPreview city={city} />

            <Card className="elevated-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Live triggers & recommendations</CardTitle>
                <CardDescription>Trigger Optimization agent adjusts regional thresholds after missed or false events.</CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-safe/30 bg-safe/5">
                  <CheckCircle2 className="h-4 w-4 text-safe mb-2" />
                  <p className="text-sm font-medium">Coverage active</p>
                  <p className="text-xs text-muted-foreground">Parametric triggers aligned to {city} after {agentState.learning_cycles} learning cycles.</p>
                </div>
                <div className="p-3 rounded-xl border border-accent/30 bg-accent/5">
                  <Sparkles className="h-4 w-4 text-accent mb-2" />
                  <p className="text-sm font-medium">Smart nudge</p>
                  <p className="text-xs text-muted-foreground">
                    {agentState.premium_bias < 0
                      ? 'Retention agent suggests keeping your current plan — pricing eased after churn signals in cohort.'
                      : 'Consider Pro Shield if monsoon intensity rises in your zone.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Claim history (sample)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[180px] pr-3">
                <div className="space-y-2">
                  {mockClaims.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex justify-between text-sm border-b border-border pb-2">
                      <span className="text-muted-foreground">{c.triggerType}</span>
                      <span className="font-medium">{formatCurrency(c.payoutAmount)}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button variant="secondary" size="sm" className="mt-3" onClick={handleDemoPayout}>
                Log sample payout experience
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard label="Composite model accuracy" value={`${modelAccuracy.toFixed(0)}%`} icon={Cpu} sub="Improves with replay" />
            <MetricCard label="Payout fairness index" value={`${fairnessScore.toFixed(0)}%`} icon={Gavel} sub="vs ideal hourly loss" />
            <MetricCard label="Learning cycles" value={String(agentState.learning_cycles)} icon={Activity} sub={`v${agentState.model_version}`} />
            <MetricCard label="Experiences" value={String(experiences.length)} icon={Users} sub="Memory store" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="elevated-card">
              <CardHeader>
                <CardTitle className="text-sm">Training loss (demo)</CardTitle>
              </CardHeader>
              <CardContent className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history.length ? history : [{ cycle: 0, loss: 0.08, version: 1 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="cycle" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="loss" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="elevated-card">
              <CardHeader>
                <CardTitle className="text-sm">Premium optimization bias</CardTitle>
              </CardHeader>
              <CardContent className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'Premium ₹', v: agentState.premium_bias }, { name: 'Rain mm', v: agentState.rain_threshold_offset }, { name: 'Heat °C', v: agentState.heat_threshold_offset * 10 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="v" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Fraud agent — recent hindsight items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fraudAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No fraud failures in recent memory — run more demo experiences or learning cycles.</p>
              ) : (
                <ul className="space-y-2">
                  {fraudAlerts.map((f) => (
                    <li key={f.id} className="text-sm flex justify-between border-b border-border pb-2">
                      <span>{f.city}</span>
                      <span className="text-muted-foreground text-xs">{f.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explain" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Why the AI decided this</CardTitle>
              <CardDescription>Transparent signals from the multi-agent stack.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ExplainBlock title="Why premium changed" body={premiumExplainer} />
              <ExplainBlock
                title="Why triggers differ by city"
                body={`Rain threshold ${rainThresholdMm} mm and heat ${heatThresholdC} °C incorporate ${agentState.rain_threshold_offset.toFixed(1)} mm and ${agentState.heat_threshold_offset.toFixed(1)} °C offsets from hindsight on missed vs false triggers.`}
              />
              <ExplainBlock
                title="Why fraud scores move"
                body={`Fraud strictness offset ${agentState.fraud_strictness.toFixed(2)} updates after false positives (legitimate riders blocked) and false negatives (missed abuse).`}
              />
              <ExplainBlock
                title="Payout fairness"
                body={`Payout bias ₹${agentState.payout_fairness_bias.toFixed(0)} scales offers toward ideal hourly loss recovery learned from past Δ vs ground truth.`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">What we learned recently</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(agentState.recent_insights.length ? agentState.recent_insights : ['Run a learning cycle to populate insights.']).map((t, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              {lastCycle?.mean_correction && (
                <p className="text-[10px] text-muted-foreground mt-3 font-mono">
                  Mean correction vector: [{lastCycle.mean_correction.map((x) => x.toFixed(3)).join(', ')}]
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Learning progress</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={Array.from({ length: Math.max(6, agentState.learning_cycles + 1) }, (_, i) => ({
                  c: i,
                  acc: Math.min(96, 72 + i * 1.5),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="c" name="cycle" tick={{ fontSize: 11 }} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="acc" stroke="hsl(var(--safe))" fill="hsl(var(--safe) / 0.2)" name="Accuracy %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Experience memory log</CardTitle>
          <CardDescription>Event type · decision quality · financial outcome (newest first)</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[280px] pr-3">
            <div className="space-y-2 font-mono text-xs">
              {[...experiences].reverse().slice(0, 40).map((e) => (
                <div key={e.id} className="flex flex-wrap gap-2 items-center border-b border-border pb-2">
                  <Badge variant="outline">{e.event_type}</Badge>
                  <span className={e.decision_was_good ? 'text-safe' : 'text-warning'}>
                    {e.decision_was_good ? 'good' : 'suboptimal'}
                  </span>
                  <span className="text-muted-foreground truncate max-w-[200px]">{e.id}</span>
                  {e.financial_result_inr != null && (
                    <span>₹{Number(e.financial_result_inr).toFixed(0)}</span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Last train loss</span>
            <Progress value={Math.min(100, 100 - Math.min(80, (agentState.last_loss || 0) * 400))} className="h-2 flex-1 max-w-xs" />
            <span className="text-xs font-mono">{(agentState.last_loss ?? 0).toFixed(4)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: typeof Cpu }) {
  return (
    <Card className="elevated-card">
      <CardContent className="pt-4">
        <Icon className="h-4 w-4 text-muted-foreground mb-2" />
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function ExplainBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border p-3 bg-muted/20">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{body}</p>
    </div>
  );
}
