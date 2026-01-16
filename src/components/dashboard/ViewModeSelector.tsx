'use client';

import { Grid3x3, List, LayoutGrid } from 'lucide-react';
import { ViewMode } from '@/types';
import Button from '@/components/ui/Button';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewModeSelector({
  viewMode,
  onViewModeChange,
}: ViewModeSelectorProps) {
  const modes = [
    { id: 'feed' as ViewMode, icon: LayoutGrid, label: 'Feed' },
    { id: 'grid' as ViewMode, icon: Grid3x3, label: 'Grid' },
    { id: 'list' as ViewMode, icon: List, label: 'Liste' },
  ];

  return (
    <div className="flex gap-2">
      {modes.map((mode) => (
        <Button
          key={mode.id}
          variant={viewMode === mode.id ? 'primary' : 'ghost'}
          size="icon"
          onClick={() => onViewModeChange(mode.id)}
          aria-label={mode.label}
        >
          <mode.icon className="h-5 w-5" />
        </Button>
      ))}
    </div>
  );
}
