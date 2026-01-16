# n8n Workflow Setup - RoFruScan + Supabase

## Übersicht

Dieser erweiterte Workflow speichert Fotos sowohl in **Nextcloud** (wie bisher) als auch in **Supabase** (neu für die Webapp).

```
Webhook (Android App)
       ↓
NextCloud-Ordner erstellen
       ↓
Code - Prepare Photos
       ↓
   ┌───┴───┐
   ↓       ↓
Nextcloud  Supabase Storage
Upload     Upload (HTTP Request)
   ↓           ↓
   │      Supabase DB Insert
   │      (Supabase Node)
   ↓           ↓
   └───┬───────┘
       ↓
  Wait for Both
       ↓
   Send Email
```

## Vor dem Import

### 1. Supabase Credentials in n8n erstellen

Gehe zu **Settings → Credentials → Add Credential**

#### A) HTTP Header Auth (für Storage Upload)
- **Name:** `Supabase Auth`
- **Header Name:** `Authorization`
- **Header Value:** `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvY25ndHhjYmR6dXhqc2pjc3NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MDQ4NjQsImV4cCI6MjA4MzE4MDg2NH0.GtKngrZKAfMF14ZMkbkFTKGZds5Mz7nbvazzcos__3w`

#### B) Supabase API (für DB Insert - nativer Node)
- **Name:** `Supabase API`
- **Host:** `https://eocngtxcbdzuxjsjcsss.supabase.co`
- **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvY25ndHhjYmR6dXhqc2pjc3NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MDQ4NjQsImV4cCI6MjA4MzE4MDg2NH0.GtKngrZKAfMF14ZMkbkFTKGZds5Mz7nbvazzcos__3w`

> **Hinweis:** Für den Supabase Node wird der "Service Role Key" verwendet. Falls du mehr Berechtigungen benötigst, verwende den Service Role Key aus dem Supabase Dashboard unter Settings → API.

### 2. Workflow importieren

1. Öffne n8n
2. Gehe zu **Workflows → Import**
3. Wähle die Datei `n8n-workflow-rofruscan-complete.json`
4. Klicke auf **Import**

### 3. Credentials zuweisen

Nach dem Import musst du die Credentials den Nodes zuweisen:

1. **Supabase Storage Upload** Node (HTTP Request):
   - Klicke auf den Node
   - Wähle bei "Credential" → `Supabase Auth` (HTTP Header Auth)

2. **Supabase DB Insert** Node (Supabase Node):
   - Klicke auf den Node
   - Wähle bei "Credential" → `Supabase API`

3. Bestehende Nodes prüfen:
   - **NextCloud-Ordner erstellen** - OAuth2 Credential
   - **Upload to Nextcloud** - OAuth2 Credential
   - **Send Email** - Microsoft Outlook Credential

### 4. Workflow aktivieren

1. Klicke oben rechts auf den Toggle **Active**
2. Der Workflow ist jetzt bereit

## Workflow-Details

### Webhook (bestehend)
- **URL:** `https://n8n.srv1098602.hstgr.cloud/webhook/31b29f07-a278-47ed-bf7d-e6ec21925940`
- **Methode:** POST
- Empfängt Payload von der Android-App

### Code - Prepare Photos (aktualisiert)
Bereitet jedes Foto für beide Uploads vor:
- Generiert UUID für eindeutigen Dateinamen in Supabase
- Erstellt Binary-Daten für Upload
- Gibt Metadaten für DB-Eintrag weiter

```javascript
const photos = $('Webhook').first().json.body.photos;
const positionCode = $('Webhook').first().json.body.positionCode;
const deviceName = $('Webhook').first().json.body.deviceName || 'Unknown';

return photos.map(photo => {
  const uuid = crypto.randomUUID();
  const fileName = `${uuid}_${positionCode}.jpg`;
  
  return {
    json: {
      fileName: fileName,
      originalFileName: photo.fileName,
      positionCode: positionCode,
      capturedAt: photo.capturedAt,
      deviceName: deviceName,
      uuid: uuid
    },
    binary: {
      data: {
        data: photo.imageBase64,
        mimeType: 'image/jpeg',
        fileExtension: 'jpg',
        fileName: fileName
      }
    }
  }
});
```

### Supabase Storage Upload (neu)
- **URL:** `https://eocngtxcbdzuxjsjcsss.supabase.co/storage/v1/object/incoming-images/{fileName}`
- **Methode:** POST
- **Body:** Binary Data (das Bild)
- **Auth:** Header Auth mit API Key

### Supabase DB Insert (neu - nativer Supabase Node)
- **Node-Typ:** `n8n-nodes-base.supabase`
- **Operation:** Create
- **Tabelle:** `incoming_goods_Fotos`
- **Felder:**
  - `position_code` → Positions-Code aus dem Webhook
  - `image_url` → Vollständige Storage-URL
  - `captured_at` → Zeitstempel der Aufnahme
  - `user_device` → Gerätename

Der native Supabase Node ist einfacher zu konfigurieren und bietet bessere Fehlerbehandlung als ein HTTP Request.

### Wait for Both Uploads (neu)
- Merge Node
- Wartet, bis sowohl Nextcloud als auch Supabase Upload fertig sind
- Erst dann wird die Email gesendet

### Send Email (aktualisiert)
- Enthält jetzt auch Link zur RoFruWeb-App
- Links zu Nextcloud UND RoFruWeb

## Testen

### 1. Test-Webhook senden

```bash
curl -X POST \
  https://n8n.srv1098602.hstgr.cloud/webhook-test/31b29f07-a278-47ed-bf7d-e6ec21925940 \
  -H "Content-Type: application/json" \
  -d '{
    "positionCode": "999999",
    "photos": [{
      "capturedAt": "2026-01-15T12:00:00.000Z",
      "imageBase64": "/9j/4AAQSkZJRgABAQEASABIAAD...",
      "fileName": "999999_test.jpg"
    }],
    "comment": "Test",
    "uploadedAt": "2026-01-15T12:05:00.000Z",
    "deviceName": "Test Device"
  }'
```

### 2. Prüfen

1. **Nextcloud:** Ordner sollte erstellt werden mit Foto
2. **Supabase Storage:** Bild sollte im Bucket `incoming-images` erscheinen
3. **Supabase Datenbank:** Neuer Eintrag in `incoming_goods_Fotos`
4. **RoFruWeb:** Foto sollte auf http://localhost:3000/position/999999 erscheinen
5. **Email:** Sollte an `wareneingang@rodifructus.ch` gesendet werden

## Fehlerbehebung

### "Storage object creation failed"
- Prüfe, ob der Bucket `incoming-images` existiert
- Prüfe RLS-Policies: INSERT muss für anon erlaubt sein

### "Database insert failed"
- Prüfe, ob die Tabelle `incoming_goods_Fotos` existiert
- Prüfe RLS-Policies: INSERT muss erlaubt sein
- Prüfe position_code Format (muss 6-stellig sein)

### "401 Unauthorized"
- API Key in Credentials prüfen
- Beide Header (`Authorization` und `apikey`) müssen gesetzt sein

## Supabase RLS-Policies

Falls noch nicht vorhanden, füge diese Policies hinzu:

```sql
-- Storage Policy für Upload (anon erlauben)
CREATE POLICY "Allow anonymous upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'incoming-images');

-- Datenbank Policy für Insert
CREATE POLICY "Allow anonymous insert"
ON public."incoming_goods_Fotos" FOR INSERT
TO public
WITH CHECK (true);
```

## Fertig!

Nach dem Setup werden alle Fotos von der Android-App:
1. ✅ In Nextcloud gespeichert (wie bisher)
2. ✅ In Supabase Storage gespeichert (neu)
3. ✅ In der Supabase Datenbank registriert (neu)
4. ✅ In der RoFruWeb-App angezeigt (neu)
5. ✅ Per Email benachrichtigt (mit beiden Links)
