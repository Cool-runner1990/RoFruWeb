'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Crop, Paintbrush, Save, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import CropOverlay from '@/components/editor/CropOverlay';
import PaintCanvas from '@/components/editor/PaintCanvas';
import Spinner from '@/components/ui/Spinner';
import { createClient } from '@/lib/supabase/client';

interface ImageEditorPageProps {
  params: Promise<{
    photoId: string;
  }>;
}

type EditorMode = 'none' | 'crop' | 'paint';

export default function ImageEditorPage({ params }: ImageEditorPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { photoId } = use(params);
  
  const [mode, setMode] = useState<EditorMode>('none');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Lade Foto-Daten aus Supabase
  useEffect(() => {
    const loadPhoto = async () => {
      // Prüfe ob URL als Query-Parameter übergeben wurde (für einfacheren Zugriff)
      const urlFromParams = searchParams.get('url');
      if (urlFromParams) {
        const decodedUrl = decodeURIComponent(urlFromParams);
        setImageUrl(decodedUrl);
        setOriginalImageUrl(decodedUrl);
        setLoading(false);
        return;
      }

      // Ansonsten aus Datenbank laden
      try {
        const { data, error } = await supabase
          .from('incoming_goods_Fotos')
          .select('*')
          .eq('id', photoId)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Foto nicht gefunden');

        // Verwende edited_url falls vorhanden, sonst original
        const url = data.edited_url || data.image_url;
        setImageUrl(url);
        setOriginalImageUrl(data.image_url);
      } catch (err) {
        console.error('Failed to load photo:', err);
        setError('Foto konnte nicht geladen werden');
      } finally {
        setLoading(false);
      }
    };

    loadPhoto();
  }, [photoId, searchParams, supabase]);

  const uploadEditedImage = async (imageBlob: Blob): Promise<string> => {
    // Generiere eindeutigen Dateinamen
    const timestamp = Date.now();
    const fileName = `edited_${photoId}_${timestamp}.jpg`;
    const filePath = `edited/${fileName}`;

    // Upload zu Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, imageBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload fehlgeschlagen: ${uploadError.message}`);
    }

    // Hole öffentliche URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSaveCrop = async (croppedImage: Blob) => {
    setSaving(true);
    setError(null);
    try {
      const newUrl = await uploadEditedImage(croppedImage);
      
      // Update Datenbank-Eintrag
      const { error: updateError } = await supabase
        .from('incoming_goods_Fotos')
        .update({ edited_url: newUrl })
        .eq('id', photoId);

      if (updateError) throw updateError;

      setImageUrl(newUrl);
      setMode('none');
      setSuccessMessage('Bild erfolgreich zugeschnitten und gespeichert!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save cropped image:', err);
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePaint = async (paintedImage: Blob) => {
    setSaving(true);
    setError(null);
    try {
      const newUrl = await uploadEditedImage(paintedImage);
      
      // Update Datenbank-Eintrag
      const { error: updateError } = await supabase
        .from('incoming_goods_Fotos')
        .update({ edited_url: newUrl })
        .eq('id', photoId);

      if (updateError) throw updateError;

      setImageUrl(newUrl);
      setMode('none');
      setSuccessMessage('Zeichnung erfolgreich gespeichert!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save painted image:', err);
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToOriginal = async () => {
    if (!originalImageUrl) return;
    
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('incoming_goods_Fotos')
        .update({ edited_url: null })
        .eq('id', photoId);

      if (updateError) throw updateError;

      setImageUrl(originalImageUrl);
      setSuccessMessage('Original wiederhergestellt!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Zurücksetzen fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl pt-20 mt-16 p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Zurück"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-on-surface sm:text-3xl">
              Bildbearbeitung
            </h1>
          </div>

          {mode === 'none' && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outlined"
                onClick={() => setMode('crop')}
                className="gap-2"
                disabled={saving}
              >
                <Crop className="h-4 w-4" />
                Zuschneiden
              </Button>
              <Button
                variant="outlined"
                onClick={() => setMode('paint')}
                className="gap-2"
                disabled={saving}
              >
                <Paintbrush className="h-4 w-4" />
                Zeichnen
              </Button>
              {imageUrl !== originalImageUrl && originalImageUrl && (
                <Button
                  variant="secondary"
                  onClick={handleResetToOriginal}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Original wiederherstellen
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 rounded-lg bg-error/10 p-4 text-error">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 rounded-lg bg-green-500/10 p-4 text-green-700 dark:text-green-400">
            {successMessage}
          </div>
        )}

        {/* Editor Content */}
        <div className="glass-card p-6">
          {mode === 'none' && imageUrl && (
            <div className="space-y-4">
              <p className="text-center text-on-surface-variant">
                Wählen Sie einen Bearbeitungsmodus
              </p>
              <div className="flex justify-center">
                <img
                  src={imageUrl}
                  alt="Vorschau"
                  className="max-h-[60vh] rounded-lg object-contain shadow-lg"
                />
              </div>
              {imageUrl !== originalImageUrl && (
                <p className="text-center text-sm text-primary">
                  ✓ Dieses Bild wurde bereits bearbeitet
                </p>
              )}
            </div>
          )}

          {mode === 'none' && !imageUrl && (
            <div className="text-center text-on-surface-variant">
              Kein Bild verfügbar
            </div>
          )}

          {mode === 'crop' && imageUrl && (
            <CropOverlay
              imageUrl={imageUrl}
              onCropComplete={handleSaveCrop}
              onCancel={() => setMode('none')}
            />
          )}

          {mode === 'paint' && imageUrl && (
            <PaintCanvas
              imageUrl={imageUrl}
              onSave={handleSavePaint}
              onCancel={() => setMode('none')}
            />
          )}
        </div>
      </main>
    </div>
  );
}
