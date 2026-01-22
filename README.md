# 🍎 RoFruWeb

<div align="center">

**Moderne Web-Plattform für Wareneingangs-Management**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

[Demo](#) • [Dokumentation](#-dokumentation) • [Installation](#-installation) • [Features](#-features)

</div>

---

## 📖 Über das Projekt

**RoFruWeb** ist die moderne Web-Plattform für das Rodifructus Wareneingangs-Management. Sie bietet Zugriff auf alle über die **RoFruScan Android-App** erfassten Fotos und ermöglicht deren Verwaltung, Bearbeitung und Download – direkt im Browser.

### 🎯 Hauptziele

- 🖼️ Zentrale Ansicht aller Wareneingangsfotos
- 📅 Intuitive Filterung nach Datum und Position
- ⚡ Schneller Zugriff ohne App-Installation
- 🎨 Identisches "Liquid Glass" Design zur Android-App
- 📱 Responsive für Desktop, Tablet & Mobile

---

## ✨ Features

### 🔐 Authentifizierung
- Sichere Anmeldung mit Email & Passwort
- Registrierung mit Email-Bestätigung
- "Angemeldet bleiben" Option
- Passwort zurücksetzen

### 📊 Dashboard
- **3 Ansichtsmodi:**
  - 🎴 **Feed** - Große Karten mit Vorschaubildern
  - 🔲 **Grid** - Kompakte Kachel-Ansicht
  - 📋 **Liste** - Tabellarische Übersicht
- 📅 Datums-Navigation mit Kalender-Picker
- ⚡ Quick-Filter (Heute, Gestern, Letzte 7 Tage)
- 🔍 Suchfunktion nach Positionscode
- 🔄 Echtzeit-Updates

### 🖼️ Foto-Verwaltung
- 🔍 **Lightbox** mit Vollbild-Ansicht
- 🔎 Zoom-Funktion (1x - 3x)
- ⌨️ Tastatur-Navigation
- 📸 Bild-Counter (X von Y)
- 💬 Kommentar-Anzeige

### 📥 Download-Funktionen
- ⬇️ Einzelbild-Download
- ✅ Mehrfachauswahl mit Checkboxen
- 🗜️ ZIP-Download mehrerer Fotos
- 📊 Progress-Bar für große Downloads
- 📝 Automatische Dateinamen

### ✂️ Bildbearbeitung
- **Crop-Tool:**
  - ✂️ Freie Auswahl
  - 📐 Drittel-Linien (Rule of Thirds)
  - 👁️ Live-Vorschau
- **Paint-Tool:**
  - 🎨 8 Farboptionen
  - 🖌️ Einstellbare Pinselstärke (2-30px)
  - ↩️ Undo/Redo
  - 🧹 Canvas zurücksetzen

### 🎨 Design & UX
- 🌓 Dark/Light Mode mit System-Präferenz
- ✨ Liquid Glass Design-System
- 🎭 Smooth Animationen
- 📱 Vollständig responsive
- ♿ Accessibility-optimiert

---

## 🛠️ Tech Stack

| Kategorie | Technologie | Version |
|-----------|-------------|---------|
| **Framework** | Next.js | 16.1.2 |
| **Sprache** | TypeScript | 5.0 |
| **Styling** | Tailwind CSS | 4.0 |
| **Backend** | Supabase | Latest |
| **State Management** | React Query | 5.90 |
| **Bildbearbeitung** | react-image-crop + Canvas API | - |
| **Icons** | Lucide React | 0.562 |
| **Datum** | date-fns | 4.1 |
| **Downloads** | JSZip + file-saver | - |

---

## 🚀 Installation

### Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Supabase-Account

### 1️⃣ Repository klonen

```bash
git clone https://github.com/Cool-runner1990/RoFruWeb.git
cd RoFruWeb
```

### 2️⃣ Dependencies installieren

```bash
npm install
```

### 3️⃣ Environment-Variablen konfigurieren

Erstelle eine `.env.local` Datei:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4️⃣ Supabase-Datenbank einrichten

Führe die SQL-Migration in deinem Supabase-Projekt aus:

```sql
-- Tabelle für Fotos erstellen
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_code VARCHAR(6) NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    device_name TEXT,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX idx_photos_date ON photos (DATE(captured_at));
CREATE INDEX idx_photos_position ON photos (position_code);
CREATE INDEX idx_photos_date_position ON photos (DATE(captured_at), position_code);

-- Row Level Security aktivieren
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users können Fotos sehen
CREATE POLICY "Authenticated users can view all photos"
    ON photos FOR SELECT
    TO authenticated
    USING (true);

-- Storage Bucket erstellen
INSERT INTO storage.buckets (id, name, public)
VALUES ('rofruscan-photos', 'rofruscan-photos', false);

-- Storage Policy
CREATE POLICY "Authenticated users can read photos"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'rofruscan-photos');
```

### 5️⃣ Entwicklungsserver starten

```bash
npm run dev
```

Die App läuft jetzt auf **[http://localhost:3000](http://localhost:3000)** 🎉

---

## 📁 Projektstruktur

```
RoFruWeb/
├── 📂 src/
│   ├── 📂 app/                        # Next.js App Router
│   │   ├── 📂 (auth)/                 # Auth-Seiten
│   │   │   ├── 📄 login/page.tsx
│   │   │   └── 📄 register/page.tsx
│   │   ├── 📄 page.tsx                # Dashboard
│   │   ├── 📂 position/[code]/        # Positions-Detail
│   │   ├── 📂 editor/[photoId]/       # Bildeditor
│   │   ├── 📂 api/                    # API Routes
│   │   ├── 📄 layout.tsx              # Root Layout
│   │   └── 📄 globals.css             # Liquid Glass CSS
│   │
│   ├── 📂 components/
│   │   ├── 📂 ui/                     # Basis UI-Komponenten
│   │   ├── 📂 layout/                 # Header, Theme Toggle
│   │   ├── 📂 dashboard/              # Dashboard-Komponenten
│   │   ├── 📂 photos/                 # Foto-Komponenten
│   │   ├── 📂 editor/                 # Bildbearbeitungs-Komponenten
│   │   └── 📂 providers/              # React Query Provider
│   │
│   ├── 📂 lib/
│   │   ├── 📂 supabase/               # Supabase Clients
│   │   ├── 📂 hooks/                  # Custom React Hooks
│   │   └── 📄 utils.ts                # Utility-Funktionen
│   │
│   ├── 📂 types/                      # TypeScript-Typen
│   └── 📄 middleware.ts               # Auth Middleware
│
├── 📂 public/                         # Statische Assets
├── 📄 package.json
├── 📄 next.config.ts
└── 📄 tsconfig.json
```

---

## 📚 Dokumentation

| Datei | Beschreibung |
|-------|--------------|
| 📘 [QUICKSTART.md](QUICKSTART.md) | Schnellstart-Anleitung (5 Minuten Setup) |
| 📗 [STATUS.md](STATUS.md) | Detaillierter Implementierungsstatus |
| 📙 [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment-Guide für Vercel, Netlify & Co. |
| 📕 [CHECKLIST.md](CHECKLIST.md) | Pre-Deployment-Checkliste |
| 📔 [SUMMARY.md](SUMMARY.md) | Vollständige Projekt-Zusammenfassung |
| 🔧 [N8N-WORKFLOW-SETUP.md](N8N-WORKFLOW-SETUP.md) | n8n Workflow-Konfiguration |

---

## 🎨 Design System

Die App nutzt das **"Liquid Glass Design System"** mit folgenden Hauptfarben:

| Farbe | Hex | Verwendung |
|-------|-----|------------|
| 🔵 Primary Blue | `#1684C1` | Buttons, Links, Aktionen |
| 🥂 Champagne | `#D4C4B0` | Akzente, Highlights |
| 🩶 Warm Gray | `#525252` - `#737373` | Text, Borders |
| ⚫ Charcoal | `#0F0F0F` | Dark Mode Basis |

Alle Farben sind als CSS-Variablen in `src/app/globals.css` definiert.

### Besonderheiten

- ✨ Glasmorphism-Effekte (backdrop-blur)
- 🌊 Smooth Transitions (200ms ease)
- 📏 Konsistentes Spacing (4px Grid)
- 🔤 Roboto Font Family
- 🎭 Subtile Schatten & Glows

---

## 🔧 Scripts

```bash
# Entwicklung
npm run dev          # Entwicklungsserver starten

# Production
npm run build        # Production Build erstellen
npm run start        # Production Server starten

# Code-Qualität
npm run lint         # ESLint ausführen
```

---

## 🌐 Deployment

### Vercel (Empfohlen)

1. Repository mit Vercel verbinden
2. Environment-Variablen setzen
3. Deploy!

**Automatisches Deployment** bei jedem Push auf `main`.

### Weitere Optionen

- 🌍 **Netlify** - Siehe [DEPLOYMENT.md](DEPLOYMENT.md)
- 🐳 **Docker** - Dockerfile inklusive
- 🖥️ **Selbst-Hosting** - Node.js 18+ erforderlich

Detaillierte Anleitungen in [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 🔄 n8n Workflow-Integration

Die RoFruScan Android-App lädt Fotos via n8n-Workflow hoch. Dieser muss erweitert werden:

### Erforderliche Anpassungen:

1. ➕ **Supabase Storage Upload Node** hinzufügen
2. ➕ **Supabase DB Insert Node** hinzufügen
3. 🔀 Beide Nodes parallel zum Nextcloud-Upload ausführen

Vollständige Anleitung und Workflow-JSON: [N8N-WORKFLOW-SETUP.md](N8N-WORKFLOW-SETUP.md)

---

## 📊 Projektstatus

| Metrik | Wert |
|--------|------|
| ✅ Features implementiert | 100% |
| 📝 TypeScript-Dateien | 36 |
| 🧩 React-Komponenten | 18 |
| 🎣 Custom Hooks | 5 |
| 🛣️ Pages/Routes | 6 |
| 📏 Lines of Code | ~3.500 |
| 🛡️ Type-Safety | 100% |

---

## 🤝 Entwickler-Guidelines

### Code-Style

- ✅ TypeScript für alle Komponenten
- ✅ Funktionale Komponenten + Hooks
- ✅ Client/Server Components getrennt
- ✅ Custom Hooks für Logik-Wiederverwendung
- ✅ Aussagekräftige Variablennamen

### Performance

- ⚡ React Query für Server-State-Caching
- 🖼️ Next.js Image-Optimierung
- 📦 Automatisches Code Splitting
- 🔄 Lazy Loading wo sinnvoll

### Sicherheit

- 🔒 Row Level Security (RLS) in Supabase
- 🛡️ Auth Middleware für geschützte Routes
- 🍪 Secure Session-Handling
- 🔐 HTTPS-only Cookies

---

## 🐛 Known Issues

Aktuell keine bekannten Probleme. Bei Bugs bitte ein Issue erstellen.

---

## 📝 Lizenz

**Proprietary - Rodifructus**

Dieses Projekt ist proprietär und für den internen Gebrauch bei Rodifructus bestimmt.

---

## 👨‍💻 Entwickelt von

**Rodifructus Development Team**

---

## 🙏 Danksagungen

- **Next.js Team** für das großartige Framework
- **Supabase** für die Backend-Infrastruktur
- **Tailwind Labs** für Tailwind CSS
- **Vercel** für Hosting & Deployment

---

<div align="center">

**Made with ❤️ for Rodifructus**

[⬆ Zurück nach oben](#-RoFruWeb)

</div>
