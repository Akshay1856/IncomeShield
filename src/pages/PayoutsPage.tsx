import { useState } from 'react';
import { formatCurrency } from '@/lib/mockData';
import { StatusBadge } from '@/components/DashboardWidgets';
import { SampleDataToggle } from '@/components/SampleDataToggle';
import { useSampleData } from '@/hooks/useSampleData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CreditCard, Clock, TrendingUp, Landmark, Smartphone, Wallet, ChevronDown, ChevronUp, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

const paymentMethods = [
  { name: 'Bank Transfer (NEFT/IMPS)', icon: Landmark, desc: 'Direct to your bank account', active: true },
  { name: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm', active: true },
  { name: 'Wallet', icon: Wallet, desc: 'IncomeShield wallet balance', active: false },
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
  const { t } = useTranslation();
  const { isLoaded, loadSampleData, clearSampleData, claims, hourlyRate } = useSampleData();

  // Build payouts from claims
  const recentPayouts = claims.map(claim => ({
    txnId: claim.transactionId || `TXN_PENDING_${claim.id}`,
    claimId: claim.id,
    amount: claim.payoutAmount,
    status: claim.status === 'flagged' ? 'flagged' : claim.status,
    date: claim.timestamp.split('T')[0],
    action: claim.status === 'paid' ? 'View' : claim.status === 'pending' ? 'Track' : 'View',
  }));

  const paidPayouts = recentPayouts.filter(p => p.status === 'paid');
  const pendingPayouts = recentPayouts.filter(p => p.status === 'pending');
  const totalPayout = paidPayouts.reduce((s, p) => s + p.amount, 0);
  const avgPayout = paidPayouts.length > 0 ? totalPayout / paidPayouts.length : 0;
  const pendingTotal = pendingPayouts.reduce((s, p) => s + p.amount, 0);

  // Build trend data - always show 5 weeks minimum
  const payoutTrendData = isLoaded ? (() => {
    const weeks: Record<string, number> = {};
    paidPayouts.forEach(p => {
      const d = new Date(p.date);
      const weekNum = Math.ceil(d.getDate() / 7);
      const key = `W${weekNum}`;
      weeks[key] = (weeks[key] || 0) + p.amount;
    });
    // Ensure at least 5 weeks
    const result: { week: string; amount: number; label: string }[] = [];
    for (let i = 1; i <= Math.max(5, Object.keys(weeks).length); i++) {
      const key = `W${i}`;
      result.push({ week: key, amount: weeks[key] || 0, label: key });
    }
    return result;
  })() : [];

  const highestWeek = payoutTrendData.length > 0
    ? payoutTrendData.reduce((max, w) => w.amount > max.amount ? w : max, payoutTrendData[0])
    : null;

  const hasData = claims.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">{t('payoutsTransactions')}</h1>
          <p className="text-sm text-muted-foreground">{t('trackPayouts')}</p>
        </div>
        <SampleDataToggle isLoaded={isLoaded} onLoad={loadSampleData} onClear={clearSampleData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-5 border-2 border-safe/30 bg-safe/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('totalPayouts')}</p>
            <CreditCard className="h-5 w-5 text-safe" />
          </div>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(totalPayout)}</p>
          <p className="text-xs text-safe mt-1">{paidPayouts.length} successful transactions</p>
          {hasData && <p className="text-xs text-muted-foreground mt-1">Rate: {formatCurrency(hourlyRate)}/hr</p>}
        </div>
        <div className="rounded-xl p-5 border-2 border-warning/30 bg-warning/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('pendingPayouts')}</p>
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(pendingTotal)}</p>
          <p className="text-xs text-warning mt-1">{pendingPayouts.length} pending</p>
        </div>
        <div className="rounded-xl p-5 border-2 border-accent/30 bg-accent/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('avgPayoutLabel')}</p>
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(Math.round(avgPayout))}</p>
          <p className="text-xs text-accent mt-1">Per transaction</p>
        </div>
      </div>

      {!hasData && (
        <div className="elevated-card rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No payout data yet. Load sample data to see how this page works.</p>
        </div>
      )}

      {hasData && (
        <>
          <div className="elevated-card rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">{t('payoutTrend')}</h3>
              {highestWeek && (
                <span className="text-xs text-muted-foreground">
                  Highest: <span className="font-bold text-safe">{highestWeek.week}</span> — {formatCurrency(highestWeek.amount)}
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={payoutTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip formatter={(val: number) => formatCurrency(val)} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} name="Payout">
                  {payoutTrendData.map((entry, index) => (
                    <Cell key={index} fill={highestWeek && entry.week === highestWeek.week ? 'hsl(var(--safe))' : 'hsl(var(--primary))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="elevated-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">{t('recentPayouts')}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground p-3">{t('transactionId')}</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground p-3">{t('claimId')}</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t('amount')}</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground p-3">Calculation</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground p-3">{t('status')}</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground p-3">{t('date')}</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground p-3">{t('action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayouts.map((p, i) => {
                    const claim = claims[i];
                    return (
                      <tr key={p.claimId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-xs font-mono text-foreground">{p.txnId}</td>
                        <td className="p-3 text-xs font-mono text-foreground">{p.claimId}</td>
                        <td className="p-3 text-sm font-bold text-foreground text-right">{formatCurrency(p.amount)}</td>
                        <td className="p-3 text-xs text-muted-foreground text-center">
                          {claim ? `${claim.lostHours}hrs × ₹${hourlyRate}` : '-'}
                        </td>
                        <td className="p-3"><StatusBadge status={p.status} /></td>
                        <td className="p-3 text-xs text-muted-foreground">{p.date}</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                            <Eye className="h-3 w-3" /> {p.action}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="elevated-card rounded-xl p-4 lg:p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">{t('paymentMethods')}</h3>
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

      <div className="elevated-card rounded-xl p-4 lg:p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">{t('faq')}</h3>
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
