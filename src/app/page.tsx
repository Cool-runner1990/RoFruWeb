'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePositions } from '@/lib/hooks/usePositions';
import { ViewMode } from '@/types';
import Header from '@/components/layout/Header';
import DatePicker from '@/components/dashboard/DatePicker';
import ViewModeSelector from '@/components/dashboard/ViewModeSelector';
import PositionFeedCard from '@/components/dashboard/PositionFeedCard';
import PositionGridCard from '@/components/dashboard/PositionGridCard';
import PositionListItem from '@/components/dashboard/PositionListItem';
import EmptyState from '@/components/dashboard/EmptyState';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import { Search } from 'lucide-react';
import { AppleCharacter, OrangeCharacter, PearCharacter, LemonCharacter, GrapesCharacter } from '@/components/ui/FruitCharacters';

export default function DashboardPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // null = alle Daten
  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  const [searchTerm, setSearchTerm] = useState('');

  const { positions, isLoading } = usePositions(selectedDate || undefined);

  const filteredPositions = useMemo(() => {
    if (!searchTerm) return positions;
    return positions.filter((pos) =>
      pos.position_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [positions, searchTerm]);

  const handlePositionClick = (positionCode: string) => {
    router.push(`/position/${positionCode}`);
  };

  const renderPositions = () => {
    if (isLoading) {
      return (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      );
    }

    if (filteredPositions.length === 0) {
      return <EmptyState />;
    }

    if (viewMode === 'feed') {
      return (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {filteredPositions.map((position) => (
            <PositionFeedCard
              key={position.position_code}
              position={position}
              onClick={() => handlePositionClick(position.position_code)}
            />
          ))}
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPositions.map((position) => (
            <PositionGridCard
              key={position.position_code}
              position={position}
              onClick={() => handlePositionClick(position.position_code)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filteredPositions.map((position) => (
          <PositionListItem
            key={position.position_code}
            position={position}
            onClick={() => handlePositionClick(position.position_code)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Dezente Früchte-Dekoration im Hintergrund - gleichmäßig verteilt */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden hidden lg:block">
        {/* Linke Spalte - 8 Früchte gleichmäßig von oben nach unten */}
        <div className="absolute top-[5%] left-[3%] opacity-10">
          <AppleCharacter size={65} className="animate-bounce-slow" />
        </div>
        <div className="absolute top-[17%] left-[6%] opacity-10">
          <PearCharacter size={60} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[29%] left-[2%] opacity-10">
          <LemonCharacter size={55} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[41%] left-[5%] opacity-10">
          <GrapesCharacter size={65} className="animate-bounce-slow delay-300" />
        </div>
        <div className="absolute top-[53%] left-[3%] opacity-10">
          <OrangeCharacter size={60} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[65%] left-[6%] opacity-10">
          <AppleCharacter size={55} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[77%] left-[2%] opacity-10">
          <PearCharacter size={65} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[89%] left-[5%] opacity-10">
          <LemonCharacter size={60} className="animate-bounce-slow delay-300" />
        </div>
        
        {/* Rechte Spalte - 8 Früchte gleichmäßig von oben nach unten */}
        <div className="absolute top-[5%] right-[3%] opacity-10">
          <GrapesCharacter size={65} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[17%] right-[6%] opacity-10">
          <OrangeCharacter size={60} className="animate-bounce-slow delay-300" />
        </div>
        <div className="absolute top-[29%] right-[2%] opacity-10">
          <AppleCharacter size={55} className="animate-bounce-slow" />
        </div>
        <div className="absolute top-[41%] right-[5%] opacity-10">
          <PearCharacter size={65} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[53%] right-[3%] opacity-10">
          <LemonCharacter size={60} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[65%] right-[6%] opacity-10">
          <GrapesCharacter size={55} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[77%] right-[2%] opacity-10">
          <OrangeCharacter size={65} className="animate-bounce-slow delay-300" />
        </div>
        <div className="absolute top-[89%] right-[5%] opacity-10">
          <AppleCharacter size={60} className="animate-bounce-slow delay-200" />
        </div>
        
        {/* Zweite linke Spalte (etwas weiter innen) - 8 Früchte */}
        <div className="absolute top-[11%] left-[10%] opacity-10">
          <OrangeCharacter size={55} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[23%] left-[12%] opacity-10">
          <GrapesCharacter size={60} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[35%] left-[9%] opacity-10">
          <AppleCharacter size={50} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[47%] left-[11%] opacity-10">
          <LemonCharacter size={55} className="animate-bounce-slow delay-300" />
        </div>
        <div className="absolute top-[59%] left-[10%] opacity-10">
          <PearCharacter size={50} className="animate-bounce-slow" />
        </div>
        <div className="absolute top-[71%] left-[12%] opacity-10">
          <OrangeCharacter size={55} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[83%] left-[9%] opacity-10">
          <GrapesCharacter size={50} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[95%] left-[11%] opacity-10">
          <AppleCharacter size={55} className="animate-bounce-slow delay-200" />
        </div>
        
        {/* Zweite rechte Spalte (etwas weiter innen) - 8 Früchte */}
        <div className="absolute top-[11%] right-[10%] opacity-10">
          <PearCharacter size={55} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[23%] right-[12%] opacity-10">
          <LemonCharacter size={60} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[35%] right-[9%] opacity-10">
          <OrangeCharacter size={50} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[47%] right-[11%] opacity-10">
          <GrapesCharacter size={55} className="animate-bounce-slow delay-300" />
        </div>
        <div className="absolute top-[59%] right-[10%] opacity-10">
          <AppleCharacter size={50} className="animate-bounce-slow" />
        </div>
        <div className="absolute top-[71%] right-[12%] opacity-10">
          <PearCharacter size={55} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[83%] right-[9%] opacity-10">
          <LemonCharacter size={50} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[95%] right-[11%] opacity-10">
          <OrangeCharacter size={55} className="animate-bounce-slow delay-100" />
        </div>
      </div>

      <Header />

      <main className="relative z-10 mx-auto max-w-7xl p-4 lg:p-6">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-on-surface">Dashboard</h2>
              <p className="mt-1 text-on-surface-variant">
                Wareneingangsfotos verwalten
              </p>
            </div>
            <ViewModeSelector
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant z-10" />
              <Input
                type="text"
                placeholder="Position suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!pl-14"
              />
            </div>
          </div>
        </div>

        {renderPositions()}
      </main>
    </div>
  );
}
