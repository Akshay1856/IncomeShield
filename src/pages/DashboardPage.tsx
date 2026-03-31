import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  mockPolicy, mockClaims, mockRiskScore, weeklyEarningsData, riskTrendData,
  formatCurrency, formatDateTime,
} from '@/lib/mockData';
import { RiskGauge, StatCard, RiskExplanation, StatusBadge } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Shield, TrendingUp, CloudRain, Zap, AlertTriangle, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWeatherData } from '@/hooks/useWeatherData';

export default function DashboardPage() {
  const { user } = useAuth();
  const city = user?.city || 'Mumbai';
  const { data: weatherData, loading: weatherLoading, error: weatherError, refetch: refetchWeather } = useWeatherData(city);
  const [triggerActive, setTriggerActive] = useState(false);
  const [simulatedClaims, setSimulatedClaims] = useState<Array<{ amount: number; hours: number; txnId: string }>>([]);
  const [simulationCount, setSimulationCount] = useState(0);

  const totalSimulatedPayout = simulatedClaims.reduce((s, c) => s + c.amount, 0);

  const simulateTrigger = useCallback(() => {
    setTriggerActive(true);
    setSimulationCount(prev => prev + 1);
    toast.warning('🌧️ Heavy Rainfall Detected — Trigger Activated!', {
      description: '65mm/hr rainfall in Mumbai - Andheri West',
    });

    setTimeout(() => {
      const payout = 400 + Math.floor(Math.random() * 200);
      const hours = 3 + Math.floor(Math.random() * 3);
      const txnId = 'TXN_RPY_' + Math.random().toString(36).slice(2, 9).toUpperCase();
      setSimulatedClaims(prev => [...prev, { amount: payout, hours, txnId }]);
      toast.success(`✅ Payout of ${formatCurrency(payout)} credited!`, {
        description: `Transaction: ${txnId}`,
      });
    }, 2500);
  }, []);

  const resetSimulation = useCallback(() => {
    setTriggerActive(false);
    setSimulatedClaims([]);
    setSimulationCount(0);
  }, []);

  const latestClaim = simulatedClaims[simulatedClaims.length - 1];

  // Dynamic values that update with simulation
  const currentEarningsProtected = mockPolicy.earningsProtected + totalSimulatedPayout;
  const currentLastPayout = latestClaim ? latestClaim.amount : mockClaims[0].payoutAmount;
  const currentLastPayoutTime = latestClaim ? 'Just now' : formatDateTime(mockClaims[0].timestamp);

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Hi, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
          <p className="text-sm text-muted-foreground">Your coverage snapshot this week</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {simulationCount > 0 && (
            <span className="text-xs text-muted-foreground">Simulated: {simulationCount}x</span>
          )}
          <Button onClick={() => refetchWeather()} variant="outline" size="sm" className="gap-2" disabled={weatherLoading}>
            {weatherLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh Weather
          </Button>
          <Button onClick={simulateTrigger} variant="destructive" size="sm" className="gap-2 w-full sm:w-auto">
            <CloudRain className="h-4 w-4" /> Simulate Rainstorm
          </Button>
          {simulationCount > 0 && (
            <Button onClick={resetSimulation} variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Trigger Alert Banner */}
      {triggerActive && (
        <div className="p-3 lg:p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-center gap-3 animate-slide-in">
          <AlertTriangle className="h-5 w-5 text-danger animate-pulse-glow shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-danger text-sm">Trigger Activated</p>
            <p className="text-xs text-danger/80">Heavy rainfall (65mm/hr) detected. Auto-claim initiated.</p>
          </div>
          {latestClaim && (
            <div className="text-right shrink-0">
              <p className="text-base font-bold text-safe">{formatCurrency(latestClaim.amount)}</p>
              <p className="text-[10px] text-muted-foreground">Credited</p>
            </div>
          )}
        </div>
      )}

      {/* All payout confirmations */}
      {simulatedClaims.length > 0 && (
        <div className="p-4 rounded-xl bg-safe/5 border border-safe/20 animate-slide-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-safe" />
              <h3 className="font-semibold text-foreground text-sm">
                {simulatedClaims.length} Payout{simulatedClaims.length > 1 ? 's' : ''} Processed
              </h3>
            </div>
            <p className="text-base font-bold text-safe">{formatCurrency(totalSimulatedPayout)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Latest Amount</p>
              <p className="text-base font-bold text-foreground">{formatCurrency(latestClaim!.amount)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Hours Covered</p>
              <p className="text-base font-bold text-foreground">{latestClaim!.hours} hrs</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Transaction</p>
              <p className="text-xs font-mono text-foreground break-all">{latestClaim!.txnId}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Status</p>
              <StatusBadge status="paid" />
            </div>
          </div>
        </div>
      )}

      {/* Stats row - values update with simulations */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Premium" value={formatCurrency(mockPolicy.totalPremium)} subtitle="Weekly" icon={Shield} variant="default" />
        <StatCard title="Coverage" value={formatCurrency(mockPolicy.coverageAmount)} subtitle="Max payout" icon={TrendingUp} variant="accent" />
        <StatCard title="Protected" value={formatCurrency(currentEarningsProtected)} subtitle="This week" icon={Zap} variant="safe" />
        <StatCard title="Last Payout" value={formatCurrency(currentLastPayout)} subtitle={currentLastPayoutTime} icon={CheckCircle} variant="safe" />
      </div>

      {/* Risk Score */}
      <div className="elevated-card rounded-xl p-4 lg:p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">AI Risk Score</h3>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <RiskGauge score={Math.min(mockRiskScore.overall + simulationCount * 5, 99)} />
          <div className="flex-1">
            <RiskExplanation riskScore={mockRiskScore} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="elevated-card rounded-xl p-4 lg:p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Earnings Protected</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyEarningsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={40} />
              <Tooltip formatter={(val: number) => formatCurrency(val)} />
              <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Earnings" />
              <Bar dataKey="protected" fill="hsl(var(--safe))" radius={[3, 3, 0, 0]} name="Protected" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="elevated-card rounded-xl p-4 lg:p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Risk Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={riskTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={30} />
              <Tooltip />
              <Area type="monotone" dataKey="risk" stroke="hsl(var(--warning))" fill="hsl(var(--warning) / 0.15)" strokeWidth={2} name="Risk" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Environmental Monitors */}
      <div className="elevated-card rounded-xl p-4 lg:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Live Monitors</h3>
          {weatherData && (
            <div className="flex items-center gap-2">
              {weatherData.conditions.icon && (
                <img src={weatherData.conditions.icon} alt={weatherData.conditions.description} className="w-8 h-8" />
              )}
              <span className="text-xs text-muted-foreground capitalize">{weatherData.conditions.description}</span>
              <span className="text-[10px] text-muted-foreground">• {weatherData.city}</span>
            </div>
          )}
          {weatherLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        {weatherError && (
          <div className="p-2 mb-3 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger">
            ⚠️ Weather unavailable: {weatherError}. Showing defaults.
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <MonitorCard
            label="Rainfall"
            value={triggerActive ? '65 mm/hr' : (weatherData?.monitors.rainfall.value || '— mm/hr')}
            status={triggerActive ? 'danger' : (weatherData?.monitors.rainfall.status || 'safe')}
            icon="🌧️"
            threshold="40mm"
            subtitle={weatherData ? `Humidity: ${weatherData.conditions.humidity}%` : undefined}
          />
          <MonitorCard
            label="Temp"
            value={weatherData?.monitors.temperature.value || '—°C'}
            status={weatherData?.monitors.temperature.status || 'safe'}
            icon="🌡️"
            threshold="45°C"
            subtitle={weatherData ? `Feels like: ${weatherData.monitors.temperature.feelsLike}°C` : undefined}
          />
          <MonitorCard
            label="AQI"
            value={weatherData?.monitors.aqi.value || '—'}
            status={weatherData?.monitors.aqi.status || 'safe'}
            icon="🏭"
            threshold="300"
            subtitle={weatherData ? `PM2.5: ${weatherData.monitors.aqi.pm25}` : undefined}
          />
          <MonitorCard
            label="Wind"
            value={weatherData ? `${weatherData.conditions.windSpeed} km/h` : '— km/h'}
            status={weatherData && weatherData.conditions.windSpeed > 50 ? 'danger' : weatherData && weatherData.conditions.windSpeed > 30 ? 'warning' : 'safe'}
            icon="💨"
            threshold="50 km/h"
          />
        </div>
        {weatherData && (
          <p className="text-[10px] text-muted-foreground mt-2 text-right">
            Updated: {new Date(weatherData.timestamp).toLocaleTimeString('en-IN')} • Auto-refreshes every 5 min
          </p>
        )}
      </div>

      {/* Savings callout */}
      <div className="rounded-xl p-4 bg-accent/10 border border-accent/20">
        <p className="text-sm lg:text-base font-semibold text-foreground">
          💰 You saved {formatCurrency(currentEarningsProtected)} this week
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {2 + simulationCount} disruption events detected — payouts processed instantly.
        </p>
      </div>
    </div>
  );
}

function MonitorCard({ label, value, status, icon, threshold, subtitle }: {
  label: string; value: string; status: 'safe' | 'warning' | 'danger'; icon: string; threshold: string; subtitle?: string;
}) {
  const bg = status === 'safe' ? 'bg-safe/5 border-safe/20' : status === 'warning' ? 'bg-warning/5 border-warning/20' : 'bg-danger/5 border-danger/20';
  const dot = status === 'safe' ? 'bg-safe' : status === 'warning' ? 'bg-warning' : 'bg-danger';
  const statusLabel = status === 'safe' ? 'Normal' : status === 'warning' ? 'Elevated' : 'TRIGGERED';
  return (
    <div className={`p-3 rounded-xl border ${bg}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-base">{icon}</span>
        <div className={`w-2 h-2 rounded-full ${dot} ${status === 'danger' ? 'animate-pulse-glow' : ''}`} />
      </div>
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
      <p className={`text-[10px] font-semibold mt-1 ${status === 'safe' ? 'text-safe' : status === 'warning' ? 'text-warning' : 'text-danger'}`}>
        {statusLabel}
      </p>
    </div>
  );
}
