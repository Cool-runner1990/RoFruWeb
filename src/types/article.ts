export interface Article {
  id: string;
  article_number: string;
  article_text_de: string;
  label_text_de: string | null;
  label_text_fr: string | null;
  label_text_it: string | null;
  category: string | null;
  genus: string | null;
  product_category: string | null;
  branding: string | null;
  co_branding: string | null;
  gtin_cu: string | null;
  gtin_tu: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleFilters {
  searchTerm: string;
  branding?: string;
  category?: string;
}

export interface ArticlePagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: ArticlePagination;
}
