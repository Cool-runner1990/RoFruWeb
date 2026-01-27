'use client';

import { Position, POSITION_CATEGORIES } from '@/types';
import Badge from '@/components/ui/Badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { SadAppleCharacter } from '@/components/ui/FruitCharacters';
import { Barcode } from 'lucide-react';

interface PositionGridCardProps {
  position: Position;
  onClick: () => void;
}

export default function PositionGridCard({ position, onClick }: PositionGridCardProps) {
  return (
    <div
      onClick={onClick}
      className="glass-card cursor-pointer overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-slide-up"
    >
      <div className="relative aspect-square w-full bg-surface-variant">
        {position.first_photo_url ? (
          <Image
            src={position.first_photo_url}
            alt={`Position ${position.position_code}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            unoptimized // Supabase URLs
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl font-bold text-on-surface-variant opacity-20">
              {position.position_code}
            </span>
          </div>
        )}
        <div className="absolute right-2 top-2 flex flex-col gap-1 items-end">
          <Badge variant="default" className="text-xs">
            {position.photo_count} {position.photo_count === 1 ? 'Foto' : 'Fotos'}
          </Badge>
          {position.scan_count > 0 && (
            <Badge variant="default" className="text-xs flex items-center gap-1">
              <Barcode className="h-3 w-3" />
              {position.scan_count}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-on-surface">
            {position.position_code}
          </h3>
          {position.category && (
            <Badge 
              variant="default"
              className={cn(
                'text-xs text-white',
                POSITION_CATEGORIES.find(c => c.value === position.category)?.color
              )}
            >
              {POSITION_CATEGORIES.find(c => c.value === position.category)?.label}
            </Badge>
          )}
        </div>
        {position.category === 'reklamation' && (
          <div className="mt-1 flex justify-end">
            <SadAppleCharacter size={48} />
          </div>
        )}
      </div>
    </div>
  );
}
