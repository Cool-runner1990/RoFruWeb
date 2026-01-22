'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Article } from '@/types';
import { useState, useCallback, useMemo } from 'react';

// Supabase hat ein Limit von 1000 Zeilen pro Abfrage
const BATCH_SIZE = 1000;

interface UseArticlesOptions {
  initialSearchTerm?: string;
  initialPage?: number;
}

interface UseArticlesResult {
  articles: Article[];
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
  page: number;
  pageSize: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setPage: (page: number) => void;
  refetch: () => void;
  invalidate: () => void;
}

export function useArticles(options: UseArticlesOptions = {}): UseArticlesResult {
  const { initialSearchTerm = '' } = options;
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  // Für die gruppierte Ansicht brauchen wir keine Pagination mehr
  const page = 1;
  const setPage = useCallback(() => {}, []);

  const queryKey = useMemo(
    () => ['articles', 'grouped', { searchTerm }],
    [searchTerm]
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      // Zuerst die Gesamtzahl ermitteln
      let countQuery = supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      if (searchTerm) {
        const searchPattern = `%${searchTerm}%`;
        countQuery = countQuery.or(
          `article_number.ilike.${searchPattern},article_text_de.ilike.${searchPattern},label_text_de.ilike.${searchPattern},gtin_cu.ilike.${searchPattern},gtin_tu.ilike.${searchPattern},category.ilike.${searchPattern},genus.ilike.${searchPattern},product_category.ilike.${searchPattern}`
        );
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        throw new Error(countError.message);
      }

      const totalCount = count || 0;

      // Wenn keine Artikel, früh zurückkehren
      if (totalCount === 0) {
        return { articles: [], totalCount: 0 };
      }

      // Alle Artikel in Batches laden
      const allArticles: Article[] = [];
      const batches = Math.ceil(totalCount / BATCH_SIZE);

      for (let i = 0; i < batches; i++) {
        const from = i * BATCH_SIZE;
        const to = from + BATCH_SIZE - 1;

        let query = supabase
          .from('articles')
          .select('*');

        // Apply search filter
        if (searchTerm) {
          const searchPattern = `%${searchTerm}%`;
          query = query.or(
            `article_number.ilike.${searchPattern},article_text_de.ilike.${searchPattern},label_text_de.ilike.${searchPattern},gtin_cu.ilike.${searchPattern},gtin_tu.ilike.${searchPattern},category.ilike.${searchPattern},genus.ilike.${searchPattern},product_category.ilike.${searchPattern}`
          );
        }

        // Sortierung: Bedarfsbereich > Gattung > Produktkategorie > Artikelnummer
        query = query
          .order('category', { ascending: true, nullsFirst: false })
          .order('genus', { ascending: true, nullsFirst: false })
          .order('product_category', { ascending: true, nullsFirst: false })
          .order('article_number', { ascending: true })
          .range(from, to);

        const { data, error } = await query;

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          allArticles.push(...(data as Article[]));
        }
      }

      return {
        articles: allArticles,
        totalCount,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['articles'] });
  }, [queryClient]);

  return {
    articles: data?.articles || [],
    isLoading,
    error: error as Error | null,
    totalCount: data?.totalCount || 0,
    page,
    pageSize: BATCH_SIZE,
    searchTerm,
    setSearchTerm,
    setPage,
    refetch,
    invalidate,
  };
}

// Hook to get article count for display
export function useArticleCount() {
  const supabase = createClient();

  const { data, isLoading } = useQuery({
    queryKey: ['articles', 'count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new Error(error.message);
      }

      return count || 0;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    count: data || 0,
    isLoading,
  };
}
