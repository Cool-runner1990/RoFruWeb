# RoFruWeb - Deployment Guide

## Supabase Configuration erforderlich

Vor dem Build müssen folgende Environment-Variablen gesetzt werden:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Lokale Entwicklung

1. Erstellen Sie eine `.env.local` Datei im Projektroot:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. Starten Sie den Dev-Server:

```bash
npm run dev
```

## Production Build

```bash
# Mit gesetzten Environment-Variablen
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

npm run build
npm run start
```

## Deployment (z.B. Vercel)

Environment-Variablen in den Projekt-Einstellungen hinterlegen.

## Supabase Setup

Siehe `README.md` Abschnitt "Installation" für SQL-Migration und Storage-Konfiguration.
