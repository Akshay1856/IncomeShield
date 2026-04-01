import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';

export default function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className={compact ? 'w-auto gap-1.5 h-8 text-xs bg-card border-border' : 'w-48 gap-2'}>
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {LANGUAGES.map(l => (
          <SelectItem key={l.code} value={l.code}>
            {l.label} / {l.native}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
