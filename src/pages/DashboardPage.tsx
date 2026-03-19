import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  mockPolicy, mockClaims, mockRiskScore, weeklyEarningsData, riskTrendData,
  formatCurrency, formatDateTime, triggerTypeLabels,
} from '@/lib/mockData';
import { RiskGauge, StatCard, RiskExplanation, StatusBadge } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Shield, TrendingUp, CloudRain, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [triggerActive, setTriggerActive] = useState(false);
  const [simulatedClaim, setSimulatedClaim] = useState<null | { amount: number; hours: number; txnId: string }>(null);

  const simulateTrigger = useCallback(() => {
    setTriggerActive(true);
    toast.warning('🌧️ Heavy Rainfall Detected — Trigger Activated!', {
      description: '65mm/hr rainfall in Mumbai - Andheri West',
    });

    setTimeout(() => {
      const payout = 500;
      const txnId = 'TXN_RPY_' + Math.random().toString(36).slice(2, 9).toUpperCase();
      setSimulatedClaim({ amount: payout, hours: 4, txnId });
      toast.success(`✅ Payout of ${formatCurrency(payout)} credited!`, {
        description: `Transaction: ${txnId}`,
      });
    }, 2500);
  }, []);

  const resetSimulation = useCallback(() => {
    setTriggerActive(false);
    setSimulatedClaim(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Good afternoon, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground">Here's your coverage snapshot for this week</p>
        </div>
        <div className="flex gap-2">
          {!triggerActive ? (
            <Button onClick={simulateTrigger} variant="destructive" className="gap-2">
              <CloudRain className="h-4 w-4" /> Simulate Rainstorm
            </Button>
          ) : (
            <Button onClick={resetSimulation} variant="outline" className="gap-2">
              Reset Demo
            </Button>
          )}
        </div>
      </div>

      {/* Trigger Alert Banner */}
      {triggerActive && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-center gap-4 animate-slide-in">
          <AlertTriangle className="h-6 w-6 text-danger animate-pulse-glow" />
          <div className="flex-1">
            <p className="font-semibold text-danger">Parametric Trigger Activated</p>
            <p className="text-sm text-danger/80">Heavy rainfall (65mm/hr) detected in your zone. Auto-claim initiated.</p>
          </div>
          {simulatedClaim && (
            <div className="text-right">
              <p className="text-lg font-bold text-safe">{formatCurrency(simulatedClaim.amount)}</p>
              <p className="text-xs text-muted-foreground">Credited instantly</p>
            </div>
          )}
        </div>
      )}

      {/* Payout confirmation */}
      {simulatedClaim && (
        <div className="p-5 rounded-xl bg-safe/5 border border-safe/20 animate-slide-in">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="h-5 w-5 text-safe" />
            <h3 className="font-semibold text-foreground">Payout Processed Successfully</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(simulatedClaim.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lost Hours Covered</p>
              <p className="text-lg font-bold text-foreground">{simulatedClaim.hours} hrs</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Transaction ID</p>
              <p className="text-sm font-mono text-foreground">{simulatedClaim.txnId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status="paid" />
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Weekly Premium" value={formatCurrency(mockPolicy.totalPremium)} subtitle="Auto-deducted Monday" icon={Shield} variant="default" />
        <StatCard title="Coverage Amount" value={formatCurrency(mockPolicy.coverageAmount)} subtitle="Max payout this week" icon={TrendingUp} variant="accent" />
        <StatCard title="Earnings Protected" value={formatCurrency(mockPolicy.earningsProtected)} subtitle="This week so far" icon={Zap} variant="safe" />
        <StatCard title="Last Payout" value={formatCurrency(mockClaims[0].payoutAmount)} subtitle={formatDateTime(mockClaims[0].timestamp)} icon={CheckCircle} variant="safe" />
      </div>

      {/* Risk Score + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="elevated-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">AI Risk Score</h3>
          <RiskGauge score={mockRiskScore.overall} />
          <div className="mt-4">
            <RiskExplanation riskScore={mockRiskScore} />
          </div>
        </div>

        <div className="elevated-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Earnings Protected (Weekly)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyEarningsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip formatter={(val: number) => formatCurrency(val)} />
              <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Earnings" />
              <Bar dataKey="protected" fill="hsl(var(--safe))" radius={[4, 4, 0, 0]} name="Protected" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="elevated-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Risk Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={riskTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip />
              <Area type="monotone" dataKey="risk" stroke="hsl(var(--warning))" fill="hsl(var(--warning) / 0.15)" strokeWidth={2} name="Risk Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Current Environmental Status */}
      <div className="elevated-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Real-Time Environmental Monitors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MonitorCard label="Rainfall" value={triggerActive ? '65 mm/hr' : '12 mm/hr'} status={triggerActive ? 'danger' : 'safe'} icon="🌧️" threshold="Threshold: 40mm" />
          <MonitorCard label="Temperature" value="34°C" status="warning" icon="🌡️" threshold="Threshold: 43°C" />
          <MonitorCard label="Air Quality" value="AQI 185" status="warning" icon="🏭" threshold="Threshold: 300" />
          <MonitorCard label="Platform Status" value="Online" status="safe" icon="⚡" threshold="Zomato / Swiggy" />
        </div>
      </div>

      {/* Savings callout */}
      <div className="rounded-xl p-6 bg-accent/10 border border-accent/20">
        <p className="text-lg font-semibold text-foreground">
          💰 You saved {formatCurrency(1850)} this week due to rain and heat disruptions
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          RideShield automatically detected 2 disruption events and processed payouts within seconds.
        </p>
      </div>
    </div>
  );
}

function MonitorCard({ label, value, status, icon, threshold }: {
  label: string; value: string; status: 'safe' | 'warning' | 'danger'; icon: string; threshold: string;
}) {
  const bg = status === 'safe' ? 'bg-safe/5 border-safe/20' : status === 'warning' ? 'bg-warning/5 border-warning/20' : 'bg-danger/5 border-danger/20';
  const dot = status === 'safe' ? 'bg-safe' : status === 'warning' ? 'bg-warning' : 'bg-danger';
  const statusLabel = status === 'safe' ? 'No Disruption' : status === 'warning' ? 'Elevated' : 'Trigger Activated';
  return (
    <div className={`p-4 rounded-xl border ${bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
        <div className={`w-2 h-2 rounded-full ${dot} ${status === 'danger' ? 'animate-pulse-glow' : ''}`} />
      </div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{threshold}</p>
      <p className={`text-xs font-semibold mt-2 ${status === 'safe' ? 'text-safe' : status === 'warning' ? 'text-warning' : 'text-danger'}`}>
        {statusLabel}
      </p>
    </div>
  );
}
