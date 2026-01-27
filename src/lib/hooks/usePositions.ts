import { usePhotos } from './usePhotos';
import { useScanCountsByPosition } from './useScans';
import { Position, PositionCategory } from '@/types';
import { useMemo, useState, useEffect } from 'react';

// Helper-Funktion um Kategorie aus localStorage zu laden
function getPositionCategory(positionCode: string): PositionCategory {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(`position_category_${positionCode}`);
  return saved as PositionCategory;
}

export function usePositions(date?: Date) {
  const { data: photos, isLoading, error } = usePhotos(date);
  const { scanCounts } = useScanCountsByPosition();
  const [categoryVersion, setCategoryVersion] = useState(0);

  // Listener für localStorage-Änderungen, um bei Kategorie-Updates zu re-rendern
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('position_category_')) {
        setCategoryVersion((v) => v + 1);
      }
    };
    
    // Listener für Custom Events (innerhalb des gleichen Tabs)
    const handleCategoryUpdate = () => {
      setCategoryVersion((v) => v + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('categoryUpdate', handleCategoryUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('categoryUpdate', handleCategoryUpdate);
    };
  }, []);

  const positions = useMemo(() => {
    if (!photos) return [];

    const positionMap = new Map<string, Position>();

    photos.forEach((photo) => {
      const existing = positionMap.get(photo.position_code);

      if (existing) {
        existing.photos.push(photo);
        existing.photo_count++;
        // Update latest captured time if this photo is newer
        if (new Date(photo.captured_at) > new Date(existing.latest_captured_at)) {
          existing.latest_captured_at = photo.captured_at;
        }
      } else {
        positionMap.set(photo.position_code, {
          position_code: photo.position_code,
          photos: [photo],
          first_photo_url: photo.image_url, // Direkte URL aus der DB
          photo_count: 1,
          scan_count: scanCounts.get(photo.position_code) || 0,
          latest_captured_at: photo.captured_at,
          category: getPositionCategory(photo.position_code),
        });
      }
    });

    return Array.from(positionMap.values()).sort(
      (a, b) =>
        new Date(b.latest_captured_at).getTime() -
        new Date(a.latest_captured_at).getTime()
    );
  }, [photos, categoryVersion, scanCounts]);

  return {
    positions,
    isLoading,
    error,
  };
}
