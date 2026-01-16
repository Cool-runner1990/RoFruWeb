'use client';

import { useState, useEffect } from 'react';
import { Photo } from '@/types';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import Button from '@/components/ui/Button';
import Image from 'next/image';

interface PhotoLightboxProps {
  photo: Photo;
  allPhotos?: Photo[];
  onClose: () => void;
  onDownload?: (photo: Photo) => void;
}

export default function PhotoLightbox({
  photo,
  allPhotos = [],
  onClose,
  onDownload,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(
    allPhotos.findIndex((p) => p.id === photo.id) || 0
  );
  const [zoom, setZoom] = useState(1);
  const currentPhoto = allPhotos[currentIndex] || photo;
  
  // Extrahiere Dateinamen aus URL
  const fileName = currentPhoto.image_url.split('/').pop() || `${currentPhoto.position_code}.jpg`;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setZoom(1);
    }
  };

  const handleNext = () => {
    if (currentIndex < allPhotos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setZoom(1);
    }
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.5, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.5, 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim animate-fade-in">
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-10 glass-card flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <div>
            <p className="font-semibold text-on-surface">{fileName}</p>
            {allPhotos.length > 0 && (
              <p className="text-sm text-on-surface-variant">
                {currentIndex + 1} von {allPhotos.length}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 1}>
            <ZoomOut className="h-5 w-5" />
          </Button>
          <span className="text-sm text-on-surface">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 3}>
            <ZoomIn className="h-5 w-5" />
          </Button>
          {onDownload && (
            <Button
              variant="primary"
              size="icon"
              onClick={() => onDownload(currentPhoto)}
            >
              <Download className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      {allPhotos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2"
            onClick={handleNext}
            disabled={currentIndex === allPhotos.length - 1}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Image */}
      <div
        className="relative flex max-h-[80vh] max-w-[90vw] cursor-zoom-in items-center justify-center overflow-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {currentPhoto.image_url && (
          <Image
            src={currentPhoto.image_url}
            alt={fileName}
            width={1920}
            height={1080}
            className="object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
            priority
            unoptimized // Supabase URLs
          />
        )}
      </div>
    </div>
  );
}
