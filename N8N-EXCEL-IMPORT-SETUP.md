# n8n Excel-Import Workflow Setup

Diese Anleitung beschreibt die Einrichtung des n8n-Workflows für den Excel-Artikelimport.

## Voraussetzungen

1. n8n-Instanz mit Zugriff auf Supabase
2. Supabase-Tabelle `articles` (siehe SQL unten)
3. npm-Paket `xlsx` in n8n verfügbar (für Excel-Parsing)

## 1. Supabase Tabelle erstellen

Führe das SQL aus `supabase-articles-schema.sql` in der Supabase SQL-Konsole aus:

```sql
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

-- RLS aktivieren
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access" ON articles FOR ALL USING (true);
```

## 2. n8n Workflow importieren

1. Öffne n8n
2. Gehe zu "Workflows" → "Import from File"
3. Wähle `n8n-workflow-excel-import.json`
4. Konfiguriere die Credentials:

### Supabase Auth Credential

Erstelle ein neues "Header Auth" Credential:
- **Name**: `Supabase Auth`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY`

**Wichtig**: Verwende den **Service Role Key** (nicht den Anon Key), um Upserts durchzuführen.

### Workflow-Nodes aktualisieren

1. **Supabase Upsert Node**:
   - Ersetze `REPLACE_WITH_CREDENTIAL_ID` mit deiner Credential-ID
   - Passe die Supabase-URL an (falls anders als `eocngtxcbdzuxjsjcsss.supabase.co`)

## 3. Umgebungsvariable in der Webapp setzen

Füge in `.env.local` hinzu:

```env
N8N_EXCEL_WEBHOOK_URL=https://your-n8n-instance.com/webhook/excel-upload
```

Ersetze die URL mit der tatsächlichen Webhook-URL aus deinem n8n-Workflow.

## 4. Workflow aktivieren

1. Öffne den Workflow in n8n
2. Klicke auf "Active" (Toggle oben rechts)
3. Der Webhook ist nun unter der konfigurierten URL erreichbar

## 5. Testen

1. Starte die Webapp: `npm run dev`
2. Navigiere zum "EAN"-Tab
3. Lade eine Excel-Datei hoch (Format wie `Artikelbezeichnungsliste_de.xlsx`)
4. Die Artikel sollten nach wenigen Sekunden in der Liste erscheinen

## Excel-Format

Die Excel-Datei muss folgendes Format haben:

| Zeile | Inhalt |
|-------|--------|
| 1 | Titel (wird ignoriert) |
| 2 | Header-Zeile mit Spaltennamen |
| 3+ | Datenzeilen |

**Spaltenreihenfolge:**
1. Artikelnummer
2. Artikeltext deutsch
3. Etikettentext deutsch
4. Etikettentext französisch
5. Etikettentext italienisch
6. Bedarfsbereich (Kategorie)
7. Gattung
8. Produktkategorie
9. Branding
10. Co-Branding
11. GTIN CU (Consumer Unit)
12. GTIN TU (Trade Unit)

## Troubleshooting

### "xlsx is not defined" Fehler
Das `xlsx` npm-Paket muss in n8n installiert sein. Bei self-hosted n8n:
```bash
npm install xlsx
```

Bei n8n Cloud ist `xlsx` bereits verfügbar.

### Upsert funktioniert nicht
Stelle sicher, dass:
1. Die `article_number` Spalte als UNIQUE definiert ist
2. Der `Prefer: resolution=merge-duplicates` Header gesetzt ist
3. Der Service Role Key (nicht Anon Key) verwendet wird

### Timeout bei großen Dateien
Für Excel-Dateien mit >5000 Zeilen:
1. Erhöhe den Webhook-Timeout in n8n
2. Oder teile die Datei in kleinere Batches auf
