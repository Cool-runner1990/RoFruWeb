'use client';

import { PearCharacter, LemonCharacter } from '@/components/ui/FruitCharacters';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = 'Keine Daten gefunden',
  description = 'Für den ausgewählten Zeitraum liegen keine Wareneingangsfotos vor.',
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 flex items-end justify-center gap-4">
        <PearCharacter size={64} className="animate-bounce-slow" />
        <LemonCharacter size={56} className="animate-bounce-slow delay-200" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-on-surface">{title}</h3>
      <p className="max-w-md text-on-surface-variant">{description}</p>
      <p className="mt-4 text-sm text-on-surface-variant opacity-60">
        Unsere Früchtchen warten auf neue Fotos!
      </p>
    </div>
  );
}
