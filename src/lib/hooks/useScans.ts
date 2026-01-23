'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Scan, ScanFilters, ScanStatus, ScanWithArticle } from '@/types/scan';
import { Article } from '@/types/article';
import { useState, useCallback, useMemo, useEffect } from 'react';

const BATCH_SIZE = 100;

interface UseScansOptions {
  initialFilters?: ScanFilters;
}

interface UseScansResult {
  scans: ScanWithArticle[];
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
  filters: ScanFilters;
  setFilters: (filters: ScanFilters) => void;
  setSearchTerm: (term: string) => void;
  setStatus: (status: ScanStatus | undefined) => void;
  setDeviceId: (deviceId: string | undefined) => void;
  setDateRange: (from: Date | undefined, to: Date | undefined) => void;
  refetch: () => void;
  invalidate: () => void;
  devices: string[]; // Unique device IDs for filter dropdown
}

export function useScans(options: UseScansOptions = {}): UseScansResult {
  const { initialFilters = {} } = options;
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<ScanFilters>(initialFilters);

  // Realtime subscription for live updates
  useEffect(() => {
    const channel = supabase
      .channel('scans-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scans' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['scans'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  const queryKey = useMemo(
    () => ['scans', 'list', filters],
    [filters]
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      // Build query with joins
      let query = supabase
        .from('scans')
        .select(`
          *,
          article:articles(*)
        `, { count: 'exact' });

      // Apply search filter
      if (filters.searchTerm) {
        const searchPattern = `%${filters.searchTerm}%`;
        query = query.or(
          `gtin.ilike.${searchPattern},device_id.ilike.${searchPattern},device_name.ilike.${searchPattern},notes.ilike.${searchPattern}`
        );
      }

      // Apply status filter
      if (filters.status) {
        query = query.eq('scan_status', filters.status);
      }

      // Apply device filter
      if (filters.deviceId) {
        query = query.eq('device_id', filters.deviceId);
      }

      // Apply date range filter
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        query = query.gte('scanned_at', fromDate.toISOString());
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        query = query.lte('scanned_at', toDate.toISOString());
      }

      // Order by scan time descending (newest first)
      query = query
        .order('scanned_at', { ascending: false })
        .limit(BATCH_SIZE);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Transform the data to match our type
      const scans: ScanWithArticle[] = (data || []).map((scan) => ({
        ...scan,
        article: scan.article as Article | null,
      }));

      return {
        scans,
        totalCount: count || 0,
      };
    },
    staleTime: 30 * 1000, // 30 seconds - shorter for realtime feel
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch unique device IDs for filter dropdown
  const { data: devicesData } = useQuery({
    queryKey: ['scans', 'devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scans')
        .select('device_id, device_name')
        .order('device_id');

      if (error) {
        throw new Error(error.message);
      }

      // Get unique device IDs
      const deviceSet = new Set<string>();
      (data || []).forEach((d) => {
        if (d.device_id) {
          deviceSet.add(d.device_name || d.device_id);
        }
      });

      return Array.from(deviceSet);
    },
    staleTime: 5 * 60 * 1000,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['scans'] });
  }, [queryClient]);

  const setSearchTerm = useCallback((term: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const setStatus = useCallback((status: ScanStatus | undefined) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setDeviceId = useCallback((deviceId: string | undefined) => {
    setFilters((prev) => ({ ...prev, deviceId }));
  }, []);

  const setDateRange = useCallback((from: Date | undefined, to: Date | undefined) => {
    setFilters((prev) => ({ ...prev, dateFrom: from, dateTo: to }));
  }, []);

  return {
    scans: data?.scans || [],
    isLoading,
    error: error as Error | null,
    totalCount: data?.totalCount || 0,
    filters,
    setFilters,
    setSearchTerm,
    setStatus,
    setDeviceId,
    setDateRange,
    refetch,
    invalidate,
    devices: devicesData || [],
  };
}

// Hook to get scan count for display
export function useScanCount() {
  const supabase = createClient();

  const { data, isLoading } = useQuery({
    queryKey: ['scans', 'count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new Error(error.message);
      }

      return count || 0;
    },
    staleTime: 30 * 1000,
  });

  return {
    count: data || 0,
    isLoading,
  };
}

// Hook to get today's scan count
export function useTodayScanCount() {
  const supabase = createClient();

  const { data, isLoading } = useQuery({
    queryKey: ['scans', 'count', 'today'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .gte('scanned_at', today.toISOString());

      if (error) {
        throw new Error(error.message);
      }

      return count || 0;
    },
    staleTime: 30 * 1000,
  });

  return {
    count: data || 0,
    isLoading,
  };
}
