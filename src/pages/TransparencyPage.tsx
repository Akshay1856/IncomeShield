import { mockClaims, triggerTypeLabels, formatCurrency, formatDateTime } from '@/lib/mockData';
import { Eye } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function TransparencyPage() {
  const { t } = useTranslation();
  const transparencyClaims = mockClaims.filter(c => c.status === 'paid' || c.status === 'approved' || c.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" /> {t('transparencyLedger')}
        </h1>
        <p className="text-muted-foreground">{t('completeExplanation')}</p>
      </div>

      {transparencyClaims.map(claim => (
        <div key={claim.id} className="elevated-card rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{triggerTypeLabels[claim.triggerType]} — {claim.id}</h3>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                claim.status === 'paid' ? 'bg-safe/10 text-safe' :
                claim.status === 'approved' ? 'bg-primary/10 text-primary' :
                'bg-warning/10 text-warning'
              }`}>
                {claim.status.toUpperCase()}
              </span>
              <span className="text-lg font-bold text-safe">{formatCurrency(claim.payoutAmount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('whyPayoutTriggered')}</h4>
              <p className="text-sm text-foreground">{claim.triggerValue} exceeded the parametric threshold</p>
              <p className="text-sm text-muted-foreground">Auto-detected by IncomeShield AI monitoring system</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('dataUsed')}</h4>
              <ul className="text-sm text-foreground space-y-1">
                <li>• {t('trigger')}: {claim.triggerValue}</li>
                <li>• {t('lostHours')}: {claim.lostHours} hrs</li>
                <li>• Rate: {formatCurrency(125)}/hr</li>
                <li>• {t('time')}: {formatDateTime(claim.timestamp)}</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
            <span>Transaction: <span className="font-mono">{claim.transactionId || 'Pending'}</span></span>
            <span>•</span>
            <span>{claim.status === 'paid' ? 'Processed automatically via smart contract' : claim.status === 'approved' ? 'Approved — payout being processed' : 'Pending verification'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
