'use client';

import { Photo } from '@/types';
import { Download, Check, Edit2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PhotoCardProps {
  photo: Photo;
  isSelected?: boolean;
  onSelect?: (photo: Photo) => void;
  onView?: (photo: Photo) => void;
  onDownload?: (photo: Photo) => void;
  onEdit?: (photo: Photo) => void;
  showCheckbox?: boolean;
}

export default function PhotoCard({
  photo,
  isSelected = false,
  onSelect,
  onView,
  onDownload,
  onEdit,
  showCheckbox = false,
}: PhotoCardProps) {
  // Extrahiere Dateinamen aus URL
  const fileName = photo.image_url.split('/').pop() || `${photo.position_code}.jpg`;

  // Im Auswahlmodus: Klick auf gesamtes Bild wählt aus
  // Sonst: Klick öffnet Lightbox
  const handleImageClick = () => {
    if (showCheckbox) {
      onSelect?.(photo);
    } else {
      onView?.(photo);
    }
  };

  return (
    <div
      className={cn(
        'glass-card group relative overflow-hidden transition-all duration-200 hover:shadow-lg animate-slide-up',
        isSelected && 'ring-2 ring-primary'
      )}
    >
      <div
        className="relative aspect-square w-full cursor-pointer bg-surface-variant"
        onClick={handleImageClick}
      >
        {photo.image_url ? (
          <Image
            src={photo.image_url}
            alt={fileName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            unoptimized // Supabase URLs
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-on-surface-variant">Laden...</span>
          </div>
        )}

        {/* Overlay with actions - nur anzeigen wenn NICHT im Auswahlmodus */}
        {!showCheckbox && (
          <div className="absolute inset-0 bg-scrim opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex h-full items-center justify-center gap-2">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(photo);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-on-surface transition-transform hover:scale-110"
                  aria-label="Foto bearbeiten"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
              )}
              {onDownload && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(photo);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-on-surface transition-transform hover:scale-110"
                  aria-label="Foto herunterladen"
                >
                  <Download className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Selection overlay - zeigt Auswahl-Indikator im Auswahlmodus */}
        {showCheckbox && (
          <div 
            className={cn(
              'absolute inset-0 transition-colors duration-200',
              isSelected ? 'bg-primary/20' : 'hover:bg-scrim/30'
            )}
          >
            {/* Checkbox oben links */}
            <div className="absolute left-2 top-2 z-10">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors',
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-surface bg-surface/50 backdrop-blur-sm'
                )}
              >
                {isSelected && <Check className="h-4 w-4 text-on-primary" />}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-2">
        <div className="flex items-center justify-between">
          <p className="truncate text-xs text-on-surface-variant">{fileName}</p>
          {photo.edited_url && (
            <span className="ml-1 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              Bearbeitet
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
