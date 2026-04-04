import * as React from 'react';
import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { DayPicker } from 'react-day-picker';

type Step = 'year' | 'month' | 'day';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface DatePickerDOBProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

export function DatePickerDOB({ selected, onSelect, disabled, className }: DatePickerDOBProps) {
  const currentYear = new Date().getFullYear();
  const [step, setStep] = useState<Step>('day');
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? 2000);
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? 0);
  const [yearPageStart, setYearPageStart] = useState(Math.floor((selected?.getFullYear() ?? 2000) / 12) * 12);

  const handleCaptionClick = () => {
    setStep('year');
    setYearPageStart(Math.floor(viewYear / 12) * 12);
  };

  const handleYearSelect = (year: number) => {
    setViewYear(year);
    setStep('month');
  };

  const handleMonthSelect = (month: number) => {
    setViewMonth(month);
    setStep('day');
  };

  const handleDaySelect = (date: Date | undefined) => {
    onSelect(date);
  };

  if (step === 'year') {
    const years = Array.from({ length: 12 }, (_, i) => yearPageStart + i);
    return (
      <div className={cn('p-3 pointer-events-auto w-[280px]', className)}>
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setYearPageStart(y => y - 12)}
            className={cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 p-0 opacity-50 hover:opacity-100')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium">{yearPageStart} – {yearPageStart + 11}</span>
          <button
            type="button"
            onClick={() => setYearPageStart(y => y + 12)}
            disabled={yearPageStart + 12 > currentYear}
            className={cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 p-0 opacity-50 hover:opacity-100 disabled:opacity-20')}
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {years.map(y => (
            <button
              key={y}
              type="button"
              disabled={y > currentYear || y < 1940}
              onClick={() => handleYearSelect(y)}
              className={cn(
                'h-9 rounded-md text-sm font-medium transition-colors',
                y === viewYear
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground',
                (y > currentYear || y < 1940) && 'opacity-30 cursor-not-allowed'
              )}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'month') {
    return (
      <div className={cn('p-3 pointer-events-auto w-[280px]', className)}>
        <div className="flex items-center justify-center mb-3 gap-2">
          <button
            type="button"
            onClick={() => setStep('year')}
            className={cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 p-0 opacity-50 hover:opacity-100')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium">{viewYear}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              type="button"
              onClick={() => handleMonthSelect(i)}
              className={cn(
                'h-9 rounded-md text-sm font-medium transition-colors',
                i === viewMonth && viewYear === (selected?.getFullYear() ?? -1)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Day step - use DayPicker with custom caption
  const displayMonth = new Date(viewYear, viewMonth);

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={handleDaySelect}
      month={displayMonth}
      onMonthChange={(m) => {
        setViewYear(m.getFullYear());
        setViewMonth(m.getMonth());
      }}
      disabled={disabled}
      showOutsideDays
      className={cn('p-3 pointer-events-auto', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium cursor-pointer hover:text-primary transition-colors',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(buttonVariants({ variant: 'ghost' }), 'h-9 w-9 p-0 font-normal aria-selected:opacity-100'),
        day_range_end: 'day-range-end',
        day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside: 'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronLeft className="h-4 w-4 rotate-180" />,
        CaptionLabel: ({ displayMonth: dm }) => (
          <button
            type="button"
            onClick={handleCaptionClick}
            className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
          >
            {MONTHS[dm.getMonth()]} {dm.getFullYear()}
          </button>
        ),
      }}
    />
  );
}
