'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Button from '@/components/ui/Button';
import { useState } from 'react';

interface DatePickerProps {
  date: Date | null;
  onDateChange: (date: Date | null) => void;
}

export default function DatePicker({ date, onDateChange }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const quickDates: Array<{ label: string; date: Date | null }> = [
    { label: 'Alle Daten', date: null },
    { label: 'Heute', date: new Date() },
    { label: 'Gestern', date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outlined"
          onClick={() => setShowCalendar(!showCalendar)}
          className="gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
          {date ? format(date, 'dd. MMMM yyyy', { locale: de }) : 'Alle Daten'}
        </Button>
      </div>

      {showCalendar && (
        <div className="glass-card p-4 animate-fade-in">
          <input
            type="date"
            value={date ? format(date, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              const newDate = e.target.value ? new Date(e.target.value) : null;
              onDateChange(newDate);
              setShowCalendar(false);
            }}
            className="input-field w-full"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {quickDates.map((quick) => (
              <Button
                key={quick.label}
                variant="secondary"
                size="sm"
                onClick={() => {
                  onDateChange(quick.date);
                  setShowCalendar(false);
                }}
              >
                {quick.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
