import { mockTriggerEvents, triggerTypeLabels, formatDateTime } from '@/lib/mockData';
import { StatusBadge } from '@/components/DashboardWidgets';
import { useTranslation } from '@/hooks/useTranslation';

export default function TriggersPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('triggerEvents')}</h1>
        <p className="text-muted-foreground">{t('realtimeMonitoring')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <LiveMonitor label={t('rainfall')} value="12 mm/hr" threshold={40} current={12} unit="mm/hr" icon="🌧️" />
        <LiveMonitor label={t('temperature')} value="34°C" threshold={43} current={34} unit="°C" icon="🌡️" />
        <LiveMonitor label={t('airQuality')} value="AQI 185" threshold={300} current={185} unit="" icon="🏭" />
        <LiveMonitor label={t('platform')} value={t('online')} threshold={60} current={0} unit="min downtime" icon="⚡" />
      </div>

      <div className="elevated-card rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">{t('triggerHistory')}</h3>
        <div className="space-y-4">
          {mockTriggerEvents.map(event => (
            <div key={event.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{triggerTypeLabels[event.type]}</span>
                  <StatusBadge status={event.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Recorded: {event.value}{event.unit} ({t('threshold')}: {event.threshold}{event.unit}) — {event.location}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{formatDateTime(event.timestamp)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LiveMonitor({ label, value, threshold, current, unit, icon }: {
  label: string; value: string; threshold: number; current: number; unit: string; icon: string;
}) {
  const pct = Math.min((current / threshold) * 100, 100);
  const isTriggered = current >= threshold;
  const barColor = isTriggered ? 'bg-danger' : pct > 70 ? 'bg-warning' : 'bg-safe';

  return (
    <div className="elevated-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
        <span className={`text-xs font-semibold ${isTriggered ? 'text-danger' : 'text-safe'}`}>
          {isTriggered ? 'TRIGGERED' : 'Normal'}
        </span>
      </div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground mt-1">Threshold: {threshold}{unit}</p>
    </div>
  );
}
