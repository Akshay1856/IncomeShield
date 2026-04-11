import { getRiskLevel, formatCurrency, type RiskScore } from '@/lib/mockData';

export function RiskGauge({ score }: { score: number }) {
  const level = getRiskLevel(score);
  const colorClass = level === 'safe' ? 'text-safe' : level === 'warning' ? 'text-warning' : 'text-danger';
  const bgClass = level === 'safe' ? 'risk-badge-safe' : level === 'warning' ? 'risk-badge-warning' : 'risk-badge-danger';
  const label = level === 'safe' ? 'Low Risk' : level === 'warning' ? 'Moderate' : 'High Risk';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="50" fill="none"
            stroke={level === 'safe' ? 'hsl(var(--safe))' : level === 'warning' ? 'hsl(var(--warning))' : 'hsl(var(--danger))'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 314} 314`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${colorClass}`}>{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bgClass}`}>{label}</span>
    </div>
  );
}

export function StatCard({ title, value, subtitle, icon: Icon, variant = 'default' }: {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ElementType;
  variant?: 'default' | 'safe' | 'warning' | 'danger' | 'accent';
}) {
  const borderColors = {
    default: 'border-l-primary',
    safe: 'border-l-safe',
    warning: 'border-l-warning',
    danger: 'border-l-danger',
    accent: 'border-l-accent',
  };

  return (
    <div className={`elevated-card rounded-xl p-5 border-l-4 ${borderColors[variant]} animate-slide-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

export function RiskExplanation({ riskScore }: { riskScore: RiskScore }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">AI Risk Analysis</h4>
      {riskScore.explanation.map((exp, i) => (
        <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="text-warning mt-0.5">⚡</span>
          <span>{exp}</span>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <MiniStat label="Location" value={riskScore.location} />
        <MiniStat label="Weather" value={riskScore.weather} />
        <MiniStat label="Time" value={riskScore.time} />
        <MiniStat label="Historical" value={riskScore.historical} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  const level = getRiskLevel(value);
  const color = level === 'safe' ? 'text-safe' : level === 'warning' ? 'text-warning' : 'text-danger';
  return (
    <div className="p-2 rounded-lg bg-muted/50">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'risk-badge-safe',
    paid: 'risk-badge-safe',
    approved: 'bg-blue-50 text-blue-700 border border-blue-200',
    pending: 'risk-badge-warning',
    flagged: 'risk-badge-danger',
    expired: 'bg-muted text-muted-foreground border border-border',
    resolved: 'bg-muted text-muted-foreground border border-border',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
