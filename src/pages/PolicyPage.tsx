import { useState } from 'react';
import { mockPolicy, calculatePremium, formatCurrency } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from '@/components/DashboardWidgets';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Calculator, Shield } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function PolicyPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [simCity, setSimCity] = useState(user?.city || 'Mumbai');
  const [simWork, setSimWork] = useState(user?.workType || 'full-time');
  const simPremium = calculatePremium(49, simCity, simWork);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('policyDetails')}</h1>
        <p className="text-muted-foreground">{t('currentCoverage')}</p>
      </div>

      <div className="elevated-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t('weeklyIncomeProtection')}</h3>
              <p className="text-sm text-muted-foreground">Policy #{mockPolicy.id}</p>
            </div>
          </div>
          <StatusBadge status={mockPolicy.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-muted-foreground">{t('weekPeriod')}</p>
            <p className="text-sm font-medium text-foreground">11 Mar — 17 Mar 2024</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('premiumPaid')}</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(mockPolicy.totalPremium)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('maxCoverage')}</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(mockPolicy.coverageAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('coveredTriggers')}</p>
            <p className="text-sm font-medium text-foreground">Rain, Heat, AQI, Downtime</p>
          </div>
        </div>
      </div>

      <div className="elevated-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">{t('premiumBreakdown')}</h3>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 mb-4 font-mono text-sm text-foreground">
          {t('weekly')} {t('premium')} = {t('baseRate')} + {t('locationRisk')} + {t('weatherRisk')}
        </div>
        <div className="space-y-3">
          <PremiumRow label={t('baseRate')} value={mockPolicy.baseRate} desc="Standard weekly rate" />
          <PremiumRow label={`${t('locationRisk')} (Mumbai)`} value={mockPolicy.locationRisk} desc="High-rainfall zone adjustment" />
          <PremiumRow label={t('weatherRisk')} value={mockPolicy.weatherRisk} desc="Seasonal monsoon factor" />
          <div className="border-t border-border pt-3 flex justify-between items-center">
            <span className="font-bold text-foreground">{t('totalWeeklyPremium')}</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(mockPolicy.totalPremium)}</span>
          </div>
        </div>
      </div>

      <div className="elevated-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-foreground">{t('planSimulator')}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{t('seeHowPremium')}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('city')}</label>
            <Select value={simCity} onValueChange={setSimCity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune'].map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('workType')}</label>
            <Select value={simWork} onValueChange={(v) => setSimWork(v as 'full-time' | 'part-time')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">{t('fullTime')}</SelectItem>
                <SelectItem value="part-time">{t('partTime')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('estimatedPremium')}</label>
            <div className="h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{formatCurrency(simPremium.total)}/{t('weekly').toLowerCase()}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">{t('baseRate')}</p>
            <p className="font-semibold text-foreground">{formatCurrency(simPremium.base)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">{t('locationRisk')}</p>
            <p className="font-semibold text-foreground">+{formatCurrency(simPremium.locationRisk)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">{t('weatherRisk')}</p>
            <p className="font-semibold text-foreground">+{formatCurrency(simPremium.weatherRisk)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PremiumRow({ label, value, desc }: { label: string; value: number; desc: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <span className="font-semibold text-foreground">{formatCurrency(value)}</span>
    </div>
  );
}
