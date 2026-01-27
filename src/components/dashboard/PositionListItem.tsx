'use client';

import { Position, POSITION_CATEGORIES } from '@/types';
import Badge from '@/components/ui/Badge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronRight, Barcode } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { SadAppleCharacter } from '@/components/ui/FruitCharacters';

interface PositionListItemProps {
  position: Position;
  onClick: () => void;
}

export default function PositionListItem({ position, onClick }: PositionListItemProps) {
  return (
    <div
      onClick={onClick}
      className="glass-card flex cursor-pointer items-center gap-4 p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-md animate-slide-up"
    >
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-variant">
        {position.first_photo_url ? (
          <Image
            src={position.first_photo_url}
            alt={`Position ${position.position_code}`}
            fill
            className="object-cover"
            sizes="64px"
            unoptimized // Supabase URLs
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xl font-bold text-on-surface-variant opacity-20">
              {position.position_code.slice(0, 2)}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-bold text-on-surface">
            {position.position_code}
          </h3>
          <Badge variant="default" className="text-xs">
            {position.photo_count}
          </Badge>
          {position.scan_count > 0 && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Barcode className="h-3 w-3" />
              {position.scan_count}
            </Badge>
          )}
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
        <p className="text-sm text-on-surface-variant">
          {format(new Date(position.latest_captured_at), 'dd. MMM yyyy, HH:mm', {
            locale: de,
          })}
        </p>
      </div>
      {position.category === 'reklamation' && (
        <SadAppleCharacter size={48} className="mr-2" />
      )}

      <ChevronRight className="h-5 w-5 text-on-surface-variant" />
    </div>
  );
}
