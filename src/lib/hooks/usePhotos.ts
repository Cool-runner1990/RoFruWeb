import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Photo } from '@/types';

export function usePhotos(date?: Date) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['photos', date?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from('incoming_goods_Fotos')
        .select('*')
        .order('captured_at', { ascending: false });

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        query = query
          .gte('captured_at', startOfDay.toISOString())
          .lte('captured_at', endOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Photo[];
    },
  });
}

export function usePhotosByPosition(positionCode: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['photos', 'position', positionCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incoming_goods_Fotos')
        .select('*')
        .eq('position_code', positionCode)
        .order('captured_at', { ascending: false });

      if (error) throw error;
      return data as Photo[];
    },
    enabled: !!positionCode,
  });
}

// Für die bestehende DB-Struktur ist die image_url bereits vollständig
// Daher brauchen wir keinen Storage-Zugriff
export function usePhotoUrl(imageUrl?: string) {
  return useQuery({
    queryKey: ['photo-url', imageUrl],
    queryFn: async () => {
      return imageUrl || null;
    },
    enabled: !!imageUrl,
    staleTime: 1000 * 60 * 60, // 1 hour - URLs ändern sich nicht
  });
}
