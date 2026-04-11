import { Database, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

interface SampleDataToggleProps {
  isLoaded: boolean;
  onLoad: () => void;
  onClear: () => void;
}

export function SampleDataToggle({ isLoaded, onLoad, onClear }: SampleDataToggleProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      {!isLoaded ? (
        <Button onClick={onLoad} variant="outline" size="sm" className="gap-2 btn-3d">
          <Database className="h-4 w-4" />
          Load Sample Data
        </Button>
      ) : (
        <>
          <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
            Sample Data Active
          </span>
          <Button onClick={onClear} variant="outline" size="sm" className="gap-2 text-danger border-danger/30 hover:bg-danger/10 btn-3d">
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </>
      )}
    </div>
  );
}
