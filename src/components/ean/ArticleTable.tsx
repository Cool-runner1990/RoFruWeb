'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Package, Barcode, Layers, Grid3X3, Tag, Folder, FolderOpen, FileText, Hash, Globe, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Article } from '@/types';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';

interface ArticleTableProps {
  articles: Article[];
  isLoading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

// Gruppierte Struktur
interface GroupedArticles {
  [category: string]: {
    [genus: string]: {
      [productCategory: string]: Article[];
    };
  };
}

export default function ArticleTable({
  articles,
  isLoading,
  totalCount,
  searchTerm,
  onSearchChange,
}: ArticleTableProps) {
  // Expanded state für alle drei Ebenen
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedGenera, setExpandedGenera] = useState<Set<string>>(new Set());
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());

  // Gruppiere Artikel nach Bedarfsbereich > Gattung > Produktkategorie
  const groupedArticles = useMemo(() => {
    const grouped: GroupedArticles = {};
    
    articles.forEach((article) => {
      const category = article.category || 'Nicht kategorisiert';
      const genus = article.genus || 'Ohne Gattung';
      const productCategory = article.product_category || 'Ohne Produktkategorie';

      if (!grouped[category]) {
        grouped[category] = {};
      }
      if (!grouped[category][genus]) {
        grouped[category][genus] = {};
      }
      if (!grouped[category][genus][productCategory]) {
        grouped[category][genus][productCategory] = [];
      }
      grouped[category][genus][productCategory].push(article);
    });

    return grouped;
  }, [articles]);

  // Statistiken berechnen
  const stats = useMemo(() => {
    const categories = Object.keys(groupedArticles).length;
    let genera = 0;
    let productCategories = 0;

    Object.values(groupedArticles).forEach((genusMap) => {
      genera += Object.keys(genusMap).length;
      Object.values(genusMap).forEach((productMap) => {
        productCategories += Object.keys(productMap).length;
      });
    });

    return { categories, genera, productCategories };
  }, [groupedArticles]);

  // Toggle Funktionen
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const toggleGenus = (key: string) => {
    setExpandedGenera((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleProduct = (key: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleArticle = (id: string) => {
    setExpandedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Alle aufklappen/zuklappen
  const expandAll = () => {
    const allCategories = new Set(Object.keys(groupedArticles));
    const allGenera = new Set<string>();
    const allProducts = new Set<string>();

    Object.entries(groupedArticles).forEach(([category, genusMap]) => {
      Object.entries(genusMap).forEach(([genus, productMap]) => {
        allGenera.add(`${category}|${genus}`);
        Object.keys(productMap).forEach((product) => {
          allProducts.add(`${category}|${genus}|${product}`);
        });
      });
    });

    setExpandedCategories(allCategories);
    setExpandedGenera(allGenera);
    setExpandedProducts(allProducts);
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
    setExpandedGenera(new Set());
    setExpandedProducts(new Set());
    setExpandedArticles(new Set());
  };

  // Zähle Artikel in einer Kategorie
  const countArticlesInCategory = (category: string): number => {
    let count = 0;
    Object.values(groupedArticles[category] || {}).forEach((genusMap) => {
      Object.values(genusMap).forEach((articles) => {
        count += articles.length;
      });
    });
    return count;
  };

  // Zähle Artikel in einer Gattung
  const countArticlesInGenus = (category: string, genus: string): number => {
    let count = 0;
    Object.values(groupedArticles[category]?.[genus] || {}).forEach((articles) => {
      count += articles.length;
    });
    return count;
  };

  const formatGtin = (gtin: string | null) => {
    if (!gtin) return '-';
    return gtin;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const sortedCategories = Object.keys(groupedArticles).sort();
  const isAnyExpanded = expandedCategories.size > 0;

  return (
    <div className="space-y-4">
      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant z-10" />
          <Input
            type="text"
            placeholder="Artikelnummer, Bezeichnung oder EAN suchen..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="!pl-12"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 rounded-lg transition-colors"
          >
            Alle öffnen
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 rounded-lg transition-colors"
          >
            Alle schließen
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <Package className="h-4 w-4" />
          {totalCount} Artikel
        </span>
        <span className="flex items-center gap-1.5">
          <Layers className="h-4 w-4" />
          {stats.categories} Bedarfsbereiche
        </span>
        <span className="flex items-center gap-1.5">
          <Grid3X3 className="h-4 w-4" />
          {stats.genera} Gattungen
        </span>
        <span className="flex items-center gap-1.5">
          <Tag className="h-4 w-4" />
          {stats.productCategories} Produktkategorien
        </span>
      </div>

      {/* Empty State */}
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-16 w-16 text-on-surface-variant/50 mb-4" />
          <p className="text-on-surface font-medium">Keine Artikel gefunden</p>
          <p className="text-sm text-on-surface-variant mt-1">
            {searchTerm 
              ? 'Versuche einen anderen Suchbegriff' 
              : 'Importiere eine Excel-Datei, um Artikel anzuzeigen'}
          </p>
        </div>
      ) : (
        /* Hierarchische Artikel-Liste */
        <div className="space-y-2">
          {sortedCategories.map((category) => {
            const isCategoryExpanded = expandedCategories.has(category);
            const categoryCount = countArticlesInCategory(category);
            const sortedGenera = Object.keys(groupedArticles[category]).sort();

            return (
              <div
                key={category}
                className="rounded-xl border border-outline/20 bg-surface/50 backdrop-blur-sm overflow-hidden"
              >
                {/* Bedarfsbereich Header (Level 1) */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-surface-variant/30 transition-colors"
                >
                  {isCategoryExpanded ? (
                    <ChevronDown className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-on-surface-variant flex-shrink-0" />
                  )}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    {isCategoryExpanded ? (
                      <FolderOpen className="h-4 w-4 text-primary" />
                    ) : (
                      <Folder className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-semibold text-on-surface">{category}</span>
                  </div>
                  <span className="text-sm text-on-surface-variant bg-surface-variant/50 px-2.5 py-1 rounded-full">
                    {categoryCount.toLocaleString('de-DE')} Artikel
                  </span>
                </button>

                {/* Gattungen (Level 2) */}
                {isCategoryExpanded && (
                  <div className="border-t border-outline/10">
                    {sortedGenera.map((genus) => {
                      const genusKey = `${category}|${genus}`;
                      const isGenusExpanded = expandedGenera.has(genusKey);
                      const genusCount = countArticlesInGenus(category, genus);
                      const sortedProducts = Object.keys(groupedArticles[category][genus]).sort();

                      return (
                        <div key={genusKey} className="border-b border-outline/5 last:border-b-0">
                          {/* Gattung Header */}
                          <button
                            onClick={() => toggleGenus(genusKey)}
                            className="w-full flex items-center gap-3 pl-8 pr-4 py-3 hover:bg-surface-variant/20 transition-colors"
                          >
                            {isGenusExpanded ? (
                              <ChevronDown className="h-4 w-4 text-primary/70 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-on-surface-variant flex-shrink-0" />
                            )}
                            <div className="flex-shrink-0 w-6 h-6 rounded-md bg-secondary/10 flex items-center justify-center">
                              <Grid3X3 className="h-3.5 w-3.5 text-secondary" />
                            </div>
                            <span className="flex-1 text-left font-medium text-on-surface">
                              {genus}
                            </span>
                            <span className="text-xs text-on-surface-variant bg-surface-variant/30 px-2 py-0.5 rounded">
                              {genusCount}
                            </span>
                          </button>

                          {/* Produktkategorien (Level 3) */}
                          {isGenusExpanded && (
                            <div className="bg-surface-variant/10">
                              {sortedProducts.map((productCategory) => {
                                const productKey = `${category}|${genus}|${productCategory}`;
                                const isProductExpanded = expandedProducts.has(productKey);
                                const productArticles = groupedArticles[category][genus][productCategory];

                                return (
                                  <div key={productKey}>
                                    {/* Produktkategorie Header */}
                                    <button
                                      onClick={() => toggleProduct(productKey)}
                                      className="w-full flex items-center gap-3 pl-14 pr-4 py-2.5 hover:bg-surface-variant/30 transition-colors"
                                    >
                                      {isProductExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-primary/60 flex-shrink-0" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-on-surface-variant/70 flex-shrink-0" />
                                      )}
                                      <div className="flex-shrink-0 w-5 h-5 rounded bg-tertiary/10 flex items-center justify-center">
                                        <Tag className="h-3 w-3 text-tertiary" />
                                      </div>
                                      <span className="flex-1 text-left text-sm text-on-surface">
                                        {productCategory}
                                      </span>
                                      <span className="text-xs text-on-surface-variant">
                                        {productArticles.length}
                                      </span>
                                    </button>

                                    {/* Artikel Liste (Level 4) */}
                                    {isProductExpanded && (
                                      <div className="bg-surface-variant/20">
                                        {productArticles.map((article) => {
                                          const isArticleExpanded = expandedArticles.has(article.id);

                                          return (
                                            <div
                                              key={article.id}
                                              className={cn(
                                                'border-t border-outline/5',
                                                isArticleExpanded && 'bg-surface/30'
                                              )}
                                            >
                                              {/* Artikel Zeile - verbessert */}
                                              <button
                                                onClick={() => toggleArticle(article.id)}
                                                className="w-full flex items-start gap-4 pl-20 pr-4 py-3 hover:bg-surface/30 transition-colors text-left"
                                              >
                                                {/* Artikelnummer Badge */}
                                                <div className="flex-shrink-0 bg-primary/10 px-2 py-1 rounded">
                                                  <span className="font-mono text-xs text-primary font-semibold">
                                                    {article.article_number}
                                                  </span>
                                                </div>
                                                
                                                {/* Artikelname und Infos */}
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-sm text-on-surface font-medium truncate">
                                                    {article.label_text_de || article.article_text_de}
                                                  </p>
                                                  {article.gtin_cu && (
                                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-on-surface-variant">
                                                      <Barcode className="h-3 w-3 flex-shrink-0" />
                                                      <span className="font-mono">{article.gtin_cu}</span>
                                                    </div>
                                                  )}
                                                </div>
                                                
                                                {/* Branding Badge */}
                                                {article.branding && (
                                                  <span className="flex-shrink-0 text-xs px-2 py-1 rounded-md bg-surface-variant/80 text-on-surface-variant font-medium">
                                                    {article.branding}
                                                  </span>
                                                )}
                                                
                                                {/* Expand Indicator */}
                                                <div className="flex-shrink-0">
                                                  {isArticleExpanded ? (
                                                    <ChevronDown className="h-4 w-4 text-primary" />
                                                  ) : (
                                                    <ChevronRight className="h-4 w-4 text-on-surface-variant/50" />
                                                  )}
                                                </div>
                                              </button>

                                              {/* Artikel Details - komplett überarbeitet */}
                                              {isArticleExpanded && (
                                                <div className="mx-4 mb-4 ml-20">
                                                  <div className="rounded-xl border-2 border-primary/50 bg-surface overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.3)] ring-2 ring-primary/20">
                                                    {/* Header mit Artikelnummer */}
                                                    <div className="bg-primary/5 px-4 py-3 border-b border-outline/10">
                                                      <div className="flex items-center justify-between">
                                                        <div>
                                                          <p className="text-xs text-on-surface-variant uppercase tracking-wider">Artikelnummer</p>
                                                          <p className="font-mono text-lg font-semibold text-primary">{article.article_number}</p>
                                                        </div>
                                                        {article.branding && (
                                                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                                            {article.branding}
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                    
                                                    {/* Content Grid */}
                                                    <div className="p-4">
                                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {/* Artikeltext */}
                                                        <div className="space-y-3">
                                                          <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                                                            <Type className="h-3.5 w-3.5" />
                                                            Artikeltext
                                                          </h4>
                                                          <div className="space-y-2">
                                                            <div className="p-3 rounded-lg bg-surface-variant/30">
                                                              <p className="text-xs text-on-surface-variant mb-1 flex items-center gap-1.5">
                                                                <span className="font-semibold">DE</span> Deutsch
                                                              </p>
                                                              <p className="text-sm text-on-surface">{article.article_text_de || '-'}</p>
                                                            </div>
                                                            {article.co_branding && (
                                                              <div className="p-3 rounded-lg bg-surface-variant/30">
                                                                <p className="text-xs text-on-surface-variant mb-1 flex items-center gap-1.5">
                                                                  <Tag className="h-3 w-3" /> Co-Branding
                                                                </p>
                                                                <p className="text-sm text-on-surface">{article.co_branding}</p>
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                        
                                                        {/* EAN-Codes */}
                                                        <div className="space-y-3">
                                                          <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                                                            <Hash className="h-3.5 w-3.5" />
                                                            EAN-Codes
                                                          </h4>
                                                          <div className="space-y-2">
                                                            <div className="p-3 rounded-lg bg-surface-variant/30">
                                                              <p className="text-xs text-on-surface-variant mb-1 flex items-center gap-1.5">
                                                                <Barcode className="h-3 w-3" /> GTIN CU (Verbraucher)
                                                              </p>
                                                              <p className="font-mono text-sm text-on-surface font-medium">
                                                                {formatGtin(article.gtin_cu)}
                                                              </p>
                                                            </div>
                                                            <div className="p-3 rounded-lg bg-surface-variant/30">
                                                              <p className="text-xs text-on-surface-variant mb-1 flex items-center gap-1.5">
                                                                <Package className="h-3 w-3" /> GTIN TU (Handel)
                                                              </p>
                                                              <p className="font-mono text-sm text-on-surface font-medium">
                                                                {formatGtin(article.gtin_tu)}
                                                              </p>
                                                            </div>
                                                          </div>
                                                        </div>
                                                        
                                                        {/* Mehrsprachig */}
                                                        <div className="space-y-3">
                                                          <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                                                            <Globe className="h-3.5 w-3.5" />
                                                            Mehrsprachig
                                                          </h4>
                                                          <div className="space-y-2">
                                                            <div className="p-3 rounded-lg bg-surface-variant/30">
                                                              <p className="text-xs text-on-surface-variant mb-1 flex items-center gap-1.5">
                                                                <span className="font-semibold">FR</span> Französisch
                                                              </p>
                                                              <p className="text-sm text-on-surface">
                                                                {article.label_text_fr || '-'}
                                                              </p>
                                                            </div>
                                                            <div className="p-3 rounded-lg bg-surface-variant/30">
                                                              <p className="text-xs text-on-surface-variant mb-1 flex items-center gap-1.5">
                                                                <span className="font-semibold">IT</span> Italienisch
                                                              </p>
                                                              <p className="text-sm text-on-surface">
                                                                {article.label_text_it || '-'}
                                                              </p>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info wenn Suche aktiv */}
      {searchTerm && articles.length > 0 && (
        <p className="text-center text-sm text-on-surface-variant pt-2">
          Zeige {articles.length} Treffer für &quot;{searchTerm}&quot;
        </p>
      )}
    </div>
  );
}
