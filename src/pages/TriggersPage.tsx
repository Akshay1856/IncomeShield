import { triggerTypeLabels, formatDateTime } from '@/lib/mockData';
import { StatusBadge } from '@/components/DashboardWidgets';
import { useTranslation } from '@/hooks/useTranslation';
import { useSampleData } from '@/hooks/useSampleData';
import { SampleDataToggle } from '@/components/SampleDataToggle';
import { AlertCircle } from 'lucide-react';

export default function TriggersPage() {
  const { t } = useTranslation();
  const { isLoaded, loadSampleData, clearSampleData, triggerEvents } = useSampleData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('triggerEvents')}</h1>
          <p className="text-muted-foreground">{t('realtimeMonitoring')}</p>
        </div>
        <SampleDataToggle isLoaded={isLoaded} onLoad={loadSampleData} onClear={clearSampleData} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoaded ? (
          <>
            <LiveMonitor label={t('rainfall')} value="12 mm/hr" threshold={40} current={12} unit="mm/hr" icon="🌧️" />
            <LiveMonitor label={t('temperature')} value="34°C" threshold={43} current={34} unit="°C" icon="🌡️" />
            <LiveMonitor label={t('airQuality')} value="AQI 185" threshold={300} current={185} unit="" icon="🏭" />
            <LiveMonitor label={t('platform')} value={t('online')} threshold={60} current={0} unit="min downtime" icon="⚡" />
          </>
        ) : (
          <>
            <LiveMonitor label={t('rainfall')} value="—" threshold={40} current={0} unit="mm/hr" icon="🌧️" />
            <LiveMonitor label={t('temperature')} value="—" threshold={43} current={0} unit="°C" icon="🌡️" />
            <LiveMonitor label={t('airQuality')} value="—" threshold={300} current={0} unit="" icon="🏭" />
            <LiveMonitor label={t('platform')} value="—" threshold={60} current={0} unit="min downtime" icon="⚡" />
          </>
        )}
      </div>

      <div className="elevated-card rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">{t('triggerHistory')}</h3>

        {triggerEvents.length === 0 && (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No trigger events yet. Load sample data to see monitoring history.</p>
          </div>
        )}

        <div className="space-y-4">
          {triggerEvents.map(event => (
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
        <span className={`text-xs font-semibold ${isTriggered ? 'text-danger' : current === 0 ? 'text-muted-foreground' : 'text-safe'}`}>
          {current === 0 && !isTriggered ? 'No Data' : isTriggered ? 'TRIGGERED' : 'Normal'}
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
