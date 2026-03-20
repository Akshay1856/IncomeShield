import { useState } from 'react';
import { formatCurrency } from '@/lib/mockData';
import { StatusBadge } from '@/components/DashboardWidgets';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CreditCard, Clock, TrendingUp, Landmark, Smartphone, Wallet, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const payoutTrendData = [
  { week: 'Week 1', amount: 500, label: 'W1' },
  { week: 'Week 2', amount: 875, label: 'W2' },
  { week: 'Week 3', amount: 375, label: 'W3' },
  { week: 'Week 4', amount: 1250, label: 'W4' },
  { week: 'Week 5', amount: 625, label: 'W5' },
];

const highestWeek = payoutTrendData.reduce((max, w) => w.amount > max.amount ? w : max, payoutTrendData[0]);

const recentPayouts = [
  { txnId: 'TXN_RPY_8847291', claimId: 'CLM-001', amount: 500, status: 'paid', date: '2024-03-14', action: 'View' },
  { txnId: 'TXN_RPY_8847290', claimId: 'CLM-002', amount: 375, status: 'paid', date: '2024-03-12', action: 'View' },
  { txnId: 'TXN_RPY_8847289', claimId: 'CLM-003', amount: 625, status: 'approved', date: '2024-03-10', action: 'View' },
  { txnId: 'TXN_RPY_8847288', claimId: 'CLM-004', amount: 250, status: 'paid', date: '2024-03-08', action: 'View' },
  { txnId: 'TXN_RPY_8847287', claimId: 'CLM-005', amount: 750, status: 'pending', date: '2024-03-06', action: 'Track' },
];

const totalPayout = recentPayouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
const avgPayout = totalPayout / recentPayouts.filter(p => p.status === 'paid').length;

const paymentMethods = [
  { name: 'Bank Transfer (NEFT/IMPS)', icon: Landmark, desc: 'Direct to your bank account', active: true },
  { name: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm', active: true },
  { name: 'Wallet', icon: Wallet, desc: 'GigGuard wallet balance', active: false },
];

const faqs = [
  { q: 'How long does it take to receive a payout?', a: 'Payouts are processed instantly once a trigger is verified. Bank transfers may take 1-2 business days, while UPI payments are instant.' },
  { q: 'What happens if my claim is flagged?', a: 'Flagged claims undergo a quick manual review (usually within 24 hours). If verified, the payout is released immediately.' },
  { q: 'Can I change my preferred payment method?', a: 'Yes, you can update your payment method anytime from this page. UPI and Bank Transfer are currently supported.' },
  { q: 'Is there a minimum payout amount?', a: 'The minimum payout is ₹100. Amounts below this threshold are accumulated and paid in the next cycle.' },
  { q: 'How is the payout amount calculated?', a: 'Payouts are calculated based on lost working hours × your hourly rate (₹125/hr). The exact amount depends on the trigger duration.' },
];

export default function PayoutsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">Payouts & Transactions</h1>
        <p className="text-sm text-muted-foreground">Track all your insurance payouts and settlements</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-5 border-2 border-safe/30 bg-safe/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Payouts</p>
            <CreditCard className="h-5 w-5 text-safe" />
          </div>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(totalPayout)}</p>
          <p className="text-xs text-safe mt-1">{recentPayouts.filter(p => p.status === 'paid').length} successful transactions</p>
        </div>
        <div className="rounded-xl p-5 border-2 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pending Payouts</p>
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">₹0</p>
          <p className="text-xs text-primary mt-1">0 pending</p>
        </div>
        <div className="rounded-xl p-5 border-2 border-accent/30 bg-accent/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Avg Payout</p>
            <span className="text-xs font-semibold text-accent-foreground bg-accent px-2 py-0.5 rounded-full">Monthly</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(Math.round(avgPayout))}</p>
          <p className="text-xs text-accent mt-1">Per transaction</p>
        </div>
      </div>

      {/* Payout Trend Chart */}
      <div className="elevated-card rounded-xl p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Payout Trend (5 Weeks)</h3>
          <span className="text-xs text-muted-foreground">
            Highest: <span className="font-bold text-safe">{highestWeek.week}</span> — {formatCurrency(highestWeek.amount)}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={payoutTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip formatter={(val: number) => formatCurrency(val)} />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]} name="Payout">
              {payoutTrendData.map((entry, index) => (
                <Cell key={index} fill={entry.week === highestWeek.week ? 'hsl(var(--safe))' : 'hsl(var(--primary))'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Payouts Table */}
      <div className="elevated-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Recent Payouts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground p-3">Transaction ID</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-3">Claim ID</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-3">Amount</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-3">Date</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentPayouts.map(p => (
                <tr key={p.txnId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-xs font-mono text-foreground">{p.txnId}</td>
                  <td className="p-3 text-xs font-mono text-foreground">{p.claimId}</td>
                  <td className="p-3 text-sm font-bold text-foreground text-right">{formatCurrency(p.amount)}</td>
                  <td className="p-3"><StatusBadge status={p.status} /></td>
                  <td className="p-3 text-xs text-muted-foreground">{p.date}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      <Eye className="h-3 w-3" /> {p.action}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="elevated-card rounded-xl p-4 lg:p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Payment Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {paymentMethods.map(m => (
            <div key={m.name} className={`p-4 rounded-xl border ${m.active ? 'border-safe/30 bg-safe/5' : 'border-border bg-muted/30'} flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.active ? 'bg-safe/10' : 'bg-muted'}`}>
                <m.icon className={`h-5 w-5 ${m.active ? 'text-safe' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </div>
              {m.active && <span className="text-xs font-semibold text-safe">Active</span>}
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="elevated-card rounded-xl p-4 lg:p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Frequently Asked Questions</h3>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors"
              >
                <span className="text-sm font-medium text-foreground">{faq.q}</span>
                {openFaq === i ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-3 pb-3">
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
