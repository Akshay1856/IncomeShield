import { adminStats, adminMonthlyData, formatCurrency } from '@/lib/mockData';
import { StatCard } from '@/components/DashboardWidgets';
import { Users, FileText, IndianRupee, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform-wide metrics and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={adminStats.totalUsers.toLocaleString()} icon={Users} variant="default" />
        <StatCard title="Active Policies" value={adminStats.activePolicies.toLocaleString()} icon={FileText} variant="accent" />
        <StatCard title="Total Payouts" value={formatCurrency(adminStats.totalPayouts)} icon={IndianRupee} variant="safe" />
        <StatCard title="Trigger Events" value={adminStats.triggerEvents.toString()} subtitle="Last 30 days" icon={Zap} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="elevated-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">User Growth & Payouts (6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={adminMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip formatter={(val: number, name: string) => name === 'Payouts' ? formatCurrency(val) : val.toLocaleString()} />
              <Bar yAxisId="left" dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Users" />
              <Bar yAxisId="right" dataKey="payouts" fill="hsl(var(--safe))" radius={[4, 4, 0, 0]} name="Payouts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="elevated-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Trigger Events Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={adminMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip />
              <Line type="monotone" dataKey="triggers" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ fill: 'hsl(var(--warning))' }} name="Triggers" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="elevated-card rounded-xl p-5 text-center">
          <p className="text-sm text-muted-foreground">Avg. Premium</p>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(adminStats.avgPremium)}</p>
          <p className="text-xs text-muted-foreground">per week per user</p>
        </div>
        <div className="elevated-card rounded-xl p-5 text-center">
          <p className="text-sm text-muted-foreground">Claim Ratio</p>
          <p className="text-3xl font-bold text-warning">{(adminStats.claimRatio * 100).toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">of policies claimed this month</p>
        </div>
        <div className="elevated-card rounded-xl p-5 text-center">
          <p className="text-sm text-muted-foreground">Fraud Detection Rate</p>
          <p className="text-3xl font-bold text-safe">2.1%</p>
          <p className="text-xs text-muted-foreground">of claims flagged</p>
        </div>
      </div>
    </div>
  );
}
