# RoFruWeb - Deployment Checkliste

## ✅ Pre-Deployment Checkliste

### 1. Projekt-Status überprüfen
- [x] Alle Features implementiert
- [x] TypeScript kompiliert fehlerfrei
- [x] Alle Komponenten erstellt (36 TypeScript-Dateien)
- [x] ~2.800 Lines of Code
- [x] Build funktioniert (benötigt nur Supabase-Credentials)

### 2. Supabase Setup
- [ ] Supabase-Projekt erstellt auf https://supabase.com
- [ ] SQL-Migration ausgeführt:
  - [ ] `photos` Tabelle erstellt
  - [ ] Indizes erstellt (date, position, date+position)
  - [ ] Row Level Security aktiviert
  - [ ] Policy für authentifizierte User erstellt
- [ ] Storage Bucket erstellt:
  - [ ] Bucket `rofruscan-photos` erstellt
  - [ ] Storage Policy für authentifizierte User
  - [ ] Public Access korrekt konfiguriert

### 3. Environment-Variablen
- [ ] `.env.local` erstellt (für lokale Entwicklung)
- [ ] Environment-Variablen gesetzt:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
  ```
- [ ] Bei Vercel/Netlify: Environment-Variablen im Dashboard hinterlegt

### 4. n8n Workflow erweitern
- [ ] Workflow ID: `zPTwBaGa6QgF2CP1` geöffnet
- [ ] **Supabase Storage Upload Node** hinzugefügt:
  - Typ: HTTP Request
  - URL: `https://<project>.supabase.co/storage/v1/object/rofruscan-photos/{date}/{position}/{fileName}`
  - Auth: Bearer Token mit Supabase Service Key
  - Body: Binary (Bild-Daten)
- [ ] **Supabase DB Insert Node** hinzugefügt:
  - Typ: Supabase Node
  - Operation: Insert
  - Tabelle: `photos`
  - Felder: position_code, file_name, storage_path, captured_at, device_name, comment
- [ ] Beide Nodes parallel zum Nextcloud-Upload ausführen
- [ ] Workflow getestet mit Test-Upload von Android-App

### 5. Lokaler Test
- [ ] `npm install` ausgeführt
- [ ] `npm run dev` startet erfolgreich
- [ ] App läuft auf http://localhost:3000
- [ ] Login funktioniert
- [ ] Dashboard lädt (ggf. mit Test-Daten)
- [ ] Alle Ansichtsmodi funktionieren
- [ ] Download funktioniert
- [ ] Bildbearbeitung funktioniert
- [ ] Theme-Wechsel funktioniert

### 6. Production Build
- [ ] `npm run build` erfolgreich
- [ ] Build-Ordner `.next/` erstellt
- [ ] Keine TypeScript-Fehler
- [ ] Keine Build-Warnings

### 7. Deployment (Vercel)
- [ ] Vercel-Account vorbereitet
- [ ] Repository mit Git connected
- [ ] Projekt auf Vercel importiert
- [ ] Environment-Variablen in Vercel gesetzt
- [ ] Deploy ausgeführt
- [ ] Production-URL erhalten
- [ ] App ist erreichbar

### 8. Post-Deployment Tests
- [ ] Login funktioniert in Production
- [ ] Dashboard lädt Daten
- [ ] Fotos werden angezeigt
- [ ] Download funktioniert
- [ ] Lightbox funktioniert
- [ ] Bildbearbeitung funktioniert
- [ ] Responsive Design auf Mobile getestet
- [ ] Dark/Light Mode funktioniert

### 9. Android-App Integration testen
- [ ] Foto mit Android-App aufnehmen
- [ ] n8n Workflow wird getriggert
- [ ] Foto erscheint in Nextcloud (bestehend)
- [ ] Foto erscheint in Supabase Storage (neu)
- [ ] Datenbank-Eintrag in Supabase (neu)
- [ ] Foto ist in RoFruWeb sichtbar
- [ ] Foto kann heruntergeladen werden
- [ ] Foto kann bearbeitet werden

### 10. Monitoring & Maintenance
- [ ] Vercel-Analytics aktiviert (optional)
- [ ] Error-Tracking eingerichtet (z.B. Sentry)
- [ ] Supabase Storage-Limits überprüft
- [ ] Backup-Strategie definiert
- [ ] Team-Zugriff konfiguriert

## 📋 Deployment-Optionen

### Option 1: Vercel (empfohlen)
```bash
# Vercel CLI installieren
npm i -g vercel

# Deployen
vercel

# Production-Deploy
vercel --prod
```

### Option 2: Netlify
```bash
# Build
npm run build

# Deploy mit Netlify CLI
netlify deploy --prod --dir=.next
```

### Option 3: Docker
```dockerfile
# Dockerfile bereits vorbereitet
docker build -t RoFruWeb .
docker run -p 3000:3000 RoFruWeb
```

### Option 4: Selbst-Hosting
```bash
# Build
npm run build

# Start
npm run start
# oder mit PM2:
pm2 start npm --name RoFruWeb -- start
```

## 🔧 Troubleshooting

### Problem: "Supabase URL not found"
**Lösung:** Environment-Variablen prüfen

### Problem: "Failed to fetch photos"
**Lösung:** 
1. Supabase RLS Policies prüfen
2. Auth-Token prüfen
3. Storage Bucket öffentlich?

### Problem: "Can't download images"
**Lösung:**
1. Storage Policy prüfen
2. CORS-Settings in Supabase
3. Browser-Console für Fehler checken

### Problem: Build-Fehler
**Lösung:**
1. `rm -rf .next node_modules`
2. `npm install`
3. `npm run build`

## 📞 Support-Kontakte

- **Supabase:** https://supabase.com/docs
- **Next.js:** https://nextjs.org/docs
- **Vercel:** https://vercel.com/docs

## 🎯 Go-Live Kriterien

Deployment kann erfolgen, wenn:
- ✅ Alle Pre-Deployment-Checks grün
- ✅ Lokaler Test erfolgreich
- ✅ Production Build erfolgreich
- ✅ Post-Deployment Tests erfolgreich
- ✅ Android-App Integration funktioniert

---

**Geschätzte Zeit bis Go-Live:** 30-45 Minuten

**Letzte Aktualisierung:** Januar 2026
