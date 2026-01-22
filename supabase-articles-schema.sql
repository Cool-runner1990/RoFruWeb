-- Supabase Schema für Artikelliste (EAN-Daten)
-- Führe dieses SQL in der Supabase SQL-Konsole aus

-- Tabelle erstellen
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_number VARCHAR(20) NOT NULL UNIQUE,
  article_text_de TEXT NOT NULL,
  label_text_de TEXT,
  label_text_fr TEXT,
  label_text_it TEXT,
  category VARCHAR(50),
  genus VARCHAR(50),
  product_category VARCHAR(100),
  branding VARCHAR(100),
  co_branding VARCHAR(100),
  gtin_cu VARCHAR(20),
  gtin_tu VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes für schnelle Suche
CREATE INDEX IF NOT EXISTS idx_articles_gtin_cu ON articles(gtin_cu);
CREATE INDEX IF NOT EXISTS idx_articles_gtin_tu ON articles(gtin_tu);
CREATE INDEX IF NOT EXISTS idx_articles_article_number ON articles(article_number);
CREATE INDEX IF NOT EXISTS idx_articles_branding ON articles(branding);
CREATE INDEX IF NOT EXISTS idx_articles_product_category ON articles(product_category);

-- Volltextsuche-Index für schnelle Textsuche
CREATE INDEX IF NOT EXISTS idx_articles_text_search ON articles USING GIN (
  to_tsvector('german', COALESCE(article_text_de, '') || ' ' || COALESCE(label_text_de, ''))
);

-- RLS aktivieren
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Public Access Policy (wie bestehende Tabellen)
DROP POLICY IF EXISTS "Public access" ON articles;
CREATE POLICY "Public access" ON articles FOR ALL USING (true);

-- Trigger für automatisches updated_at Update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Kommentar zur Dokumentation
COMMENT ON TABLE articles IS 'Artikelstammdaten aus Excel-Import (Artikelbezeichnungsliste)';
COMMENT ON COLUMN articles.article_number IS 'Eindeutige Artikelnummer';
COMMENT ON COLUMN articles.gtin_cu IS 'GTIN Consumer Unit (EAN für Endverbraucher)';
COMMENT ON COLUMN articles.gtin_tu IS 'GTIN Trade Unit (EAN für Handel)';
