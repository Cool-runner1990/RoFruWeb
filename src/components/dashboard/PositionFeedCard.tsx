'use client';

import { Position, POSITION_CATEGORIES } from '@/types';
import Badge from '@/components/ui/Badge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { SadAppleCharacter } from '@/components/ui/FruitCharacters';

interface PositionFeedCardProps {
  position: Position;
  onClick: () => void;
}

export default function PositionFeedCard({ position, onClick }: PositionFeedCardProps) {
  const hasPhotos = position.photos && position.photos.length > 0;
  const hasMultiplePhotos = position.photos.length > 1;

  return (
    <div
      onClick={onClick}
      className="glass-card flex flex-col cursor-pointer overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-slide-up"
    >
      {/* Photo Grid - Feste Höhe für konsistente Kartengröße */}
      <div className={`relative h-[320px] w-full bg-surface-variant`}>
        <div className={`grid h-full w-full ${
          hasMultiplePhotos 
            ? position.photos.length === 2 
              ? 'grid-cols-2 gap-1' 
              : position.photos.length === 3
              ? 'grid-cols-3 gap-1'
              : position.photos.length === 4
              ? 'grid-cols-2 grid-rows-2 gap-1'
              : 'grid-cols-3 gap-1'
            : ''
        }`}>
          {hasPhotos ? (
            position.photos.slice(0, 6).map((photo, index) => (
              <div 
                key={photo.id} 
                className={`relative ${
                  hasMultiplePhotos
                    ? position.photos.length === 2
                      ? ''
                      : position.photos.length === 3
                      ? ''
                      : position.photos.length === 4
                      ? ''
                      : position.photos.length === 5 && index === 0
                      ? 'col-span-2'
                      : position.photos.length === 5
                      ? ''
                      : position.photos.length >= 6 && index < 3
                      ? ''
                      : ''
                    : ''
                }`}
              >
                <Image
                  src={photo.image_url}
                  alt={`Position ${position.position_code} - Foto ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized // Supabase URLs
                />
                {position.photos.length > 6 && index === 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="text-3xl font-bold text-white">
                      +{position.photos.length - 6}
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-6xl font-bold text-on-surface-variant opacity-20">
                {position.position_code}
              </span>
            </div>
          )}
        </div>

        {/* Badge - innerhalb des Bildbereichs */}
        <div className="absolute right-3 top-3">
          <Badge variant="default">
            {position.photo_count} {position.photo_count === 1 ? 'Foto' : 'Fotos'}
          </Badge>
        </div>
      </div>

      {/* Info Section - Feste Höhe für konsistente Darstellung */}
      <div className="relative flex-shrink-0 p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-bold text-on-surface">
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
        <p className="mt-1 text-sm text-on-surface-variant">
          {format(new Date(position.latest_captured_at), 'dd. MMM yyyy, HH:mm', {
            locale: de,
          })}
        </p>
        {position.category === 'reklamation' && (
          <div className="absolute bottom-3 right-3">
            <SadAppleCharacter size={56} />
          </div>
        )}
      </div>
    </div>
  );
}
