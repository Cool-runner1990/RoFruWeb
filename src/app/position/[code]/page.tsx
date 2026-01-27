'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePhotosByPosition } from '@/lib/hooks/usePhotos';
import { useDownload } from '@/lib/hooks/useDownload';
import { Photo, PositionCategory, POSITION_CATEGORIES } from '@/types';
import Header from '@/components/layout/Header';
import PhotoCard from '@/components/photos/PhotoCard';
import PhotoLightbox from '@/components/photos/PhotoLightbox';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/dashboard/EmptyState';
import CategorySelector from '@/components/ui/CategorySelector';
import EmailDialog from '@/components/ui/EmailDialog';
import { ArrowLeft, Download, CheckSquare, Square, Mail, Edit2, FileText, Plus, ChevronDown, ChevronUp, Barcode } from 'lucide-react';
import DocumentUpload from '@/components/documents/DocumentUpload';
import DocumentList from '@/components/documents/DocumentList';
import PositionScansList from '@/components/ean/PositionScansList';
import { useScansByPosition } from '@/lib/hooks/useScans';
import { useDocumentsByPosition } from '@/lib/hooks/useDocuments';
import { AppleCharacter, OrangeCharacter, PearCharacter, LemonCharacter, GrapesCharacter } from '@/components/ui/FruitCharacters';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';

interface PositionDetailPageProps {
  params: Promise<{
    code: string;
  }>;
}

export default function PositionDetailPage({ params }: PositionDetailPageProps) {
  const router = useRouter();
  const supabase = createClient();
  const { code } = use(params);
  const { data: photos, isLoading, refetch } = usePhotosByPosition(code);
  const { downloadSinglePhoto, downloadMultiplePhotos, isDownloading, progress } = useDownload();

  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [category, setCategory] = useState<PositionCategory>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [documentsExpanded, setDocumentsExpanded] = useState(true);
  const [scansExpanded, setScansExpanded] = useState(true);
  
  const { data: documents } = useDocumentsByPosition(code);
  const { totalCount: scanCount } = useScansByPosition(code);

  const handleToggleSelection = (photo: Photo) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photo.id)) {
      newSelection.delete(photo.id);
    } else {
      newSelection.add(photo.id);
    }
    setSelectedPhotos(newSelection);
  };

  const handleSelectAll = () => {
    if (photos && selectedPhotos.size < photos.length) {
      setSelectedPhotos(new Set(photos.map((p) => p.id)));
    } else {
      setSelectedPhotos(new Set());
    }
  };

  const handleDownloadSingle = async (photo: Photo) => {
    const fileName = photo.image_url.split('/').pop() || `${photo.position_code}.jpg`;
    await downloadSinglePhoto(photo.image_url, fileName);
  };

  const handleDownloadSelected = async () => {
    if (!photos) return;
    const selected = photos.filter((p) => selectedPhotos.has(p.id));
    const date = format(new Date(), 'yyyyMMdd');
    const zipName = `${code}_${date}.zip`;
    
    await downloadMultiplePhotos(
      selected.map((p) => ({ 
        imageUrl: p.edited_url || p.image_url, 
        fileName: p.image_url.split('/').pop() || `${p.position_code}.jpg` 
      })),
      zipName
    );
  };

  const handleEditPhoto = (photo: Photo) => {
    const encodedUrl = encodeURIComponent(photo.edited_url || photo.image_url);
    router.push(`/editor/${photo.id}?url=${encodedUrl}`);
  };

  const handleCategoryChange = async (newCategory: PositionCategory) => {
    setCategory(newCategory);
    
    // Speichere Kategorie in localStorage als temporäre Lösung
    // In Produktion würde dies in der Datenbank gespeichert
    if (newCategory) {
      localStorage.setItem(`position_category_${code}`, newCategory);
    } else {
      localStorage.removeItem(`position_category_${code}`);
    }
    
    // Manuelles Event für Kategorie-Updates innerhalb des gleichen Tabs
    window.dispatchEvent(new CustomEvent('categoryUpdate', { detail: { code, category: newCategory } }));
  };

  const handleSendEmail = async (email: string, subject: string, message: string) => {
    if (!photos) return;
    
    const selected = photos.filter((p) => selectedPhotos.has(p.id));
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject,
        message,
        photos: selected.map((p) => ({
          url: p.edited_url || p.image_url,
          fileName: p.image_url.split('/').pop() || `${p.position_code}.jpg`,
        })),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'E-Mail konnte nicht gesendet werden');
    }
  };

  // Lade gespeicherte Kategorie beim Start
  useEffect(() => {
    const savedCategory = localStorage.getItem(`position_category_${code}`);
    if (savedCategory) {
      setCategory(savedCategory as PositionCategory);
    }
  }, [code]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <EmptyState
          title="Keine Fotos gefunden"
          description={`Für Position ${code} sind keine Fotos vorhanden.`}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Dezente Früchte-Dekoration im Hintergrund - gleichmäßig verteilt */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden hidden lg:block">
        {/* Linke Spalte - 8 Früchte gleichmäßig von oben nach unten */}
        <div className="absolute top-[5%] left-[3%] opacity-10">
          <AppleCharacter size={65} className="animate-bounce-slow" />
        </div>
        <div className="absolute top-[17%] left-[6%] opacity-10">
          <PearCharacter size={60} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[29%] left-[2%] opacity-10">
          <LemonCharacter size={55} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[41%] left-[5%] opacity-10">
          <GrapesCharacter size={65} className="animate-bounce-slow delay-300" />
        </div>
        <div className="absolute top-[53%] left-[3%] opacity-10">
          <OrangeCharacter size={60} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[65%] left-[6%] opacity-10">
          <AppleCharacter size={55} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[77%] left-[2%] opacity-10">
          <PearCharacter size={65} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[89%] left-[5%] opacity-10">
          <LemonCharacter size={60} className="animate-bounce-slow delay-300" />
        </div>
        
        {/* Rechte Spalte - 8 Früchte gleichmäßig von oben nach unten */}
        <div className="absolute top-[5%] right-[3%] opacity-10">
          <GrapesCharacter size={65} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[17%] right-[6%] opacity-10">
          <OrangeCharacter size={60} className="animate-bounce-slow delay-300" />
        </div>
        <div className="absolute top-[29%] right-[2%] opacity-10">
          <AppleCharacter size={55} className="animate-bounce-slow" />
        </div>
        <div className="absolute top-[41%] right-[5%] opacity-10">
          <PearCharacter size={65} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[53%] right-[3%] opacity-10">
          <LemonCharacter size={60} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[65%] right-[6%] opacity-10">
          <GrapesCharacter size={55} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[77%] right-[2%] opacity-10">
          <OrangeCharacter size={65} className="animate-bounce-slow delay-300" />
        </div>
        <div className="absolute top-[89%] right-[5%] opacity-10">
          <AppleCharacter size={60} className="animate-bounce-slow delay-200" />
        </div>
        
        {/* Zweite linke Spalte (etwas weiter innen) - 8 Früchte */}
        <div className="absolute top-[11%] left-[10%] opacity-10">
          <OrangeCharacter size={55} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[23%] left-[12%] opacity-10">
          <GrapesCharacter size={60} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[35%] left-[9%] opacity-10">
          <AppleCharacter size={50} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[47%] left-[11%] opacity-10">
          <LemonCharacter size={55} className="animate-bounce-slow delay-300" />
        </div>
        <div className="absolute top-[59%] left-[10%] opacity-10">
          <PearCharacter size={50} className="animate-bounce-slow" />
        </div>
        <div className="absolute top-[71%] left-[12%] opacity-10">
          <OrangeCharacter size={55} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[83%] left-[9%] opacity-10">
          <GrapesCharacter size={50} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[95%] left-[11%] opacity-10">
          <AppleCharacter size={55} className="animate-bounce-slow delay-200" />
        </div>
        
        {/* Zweite rechte Spalte (etwas weiter innen) - 8 Früchte */}
        <div className="absolute top-[11%] right-[10%] opacity-10">
          <PearCharacter size={55} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[23%] right-[12%] opacity-10">
          <LemonCharacter size={60} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[35%] right-[9%] opacity-10">
          <OrangeCharacter size={50} className="animate-bounce-slow delay-100" />
        </div>
        <div className="absolute top-[47%] right-[11%] opacity-10">
          <GrapesCharacter size={55} className="animate-bounce-slow delay-300" />
        </div>
        <div className="absolute top-[59%] right-[10%] opacity-10">
          <AppleCharacter size={50} className="animate-bounce-slow" />
        </div>
        <div className="absolute top-[71%] right-[12%] opacity-10">
          <PearCharacter size={55} className="animate-bounce-slow delay-200" />
        </div>
        <div className="absolute top-[83%] right-[9%] opacity-10">
          <LemonCharacter size={50} className="animate-bounce-slow delay-400" />
        </div>
        <div className="absolute top-[95%] right-[11%] opacity-10">
          <OrangeCharacter size={55} className="animate-bounce-slow delay-100" />
        </div>
      </div>

      <Header />

      <main className="relative z-10 mx-auto max-w-7xl pt-20 mt-16 p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Zurück"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-on-surface">Position {code}</h1>
              <p className="mt-1 text-on-surface-variant">
                {photos.length} {photos.length === 1 ? 'Foto' : 'Fotos'}
              </p>
            </div>
          </div>

          {/* Kategorie-Auswahl */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-on-surface-variant">Kategorie:</span>
            <CategorySelector
              value={category}
              onChange={handleCategoryChange}
            />
            {category && (
              <Badge 
                variant="default"
                className={POSITION_CATEGORIES.find(c => c.value === category)?.color}
              >
                {POSITION_CATEGORIES.find(c => c.value === category)?.label}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={selectionMode ? 'primary' : 'outlined'}
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelectedPhotos(new Set());
              }}
            >
              {selectionMode ? 'Auswahl beenden' : 'Auswählen'}
            </Button>

            {selectionMode && (
              <>
                <Button
                  variant="secondary"
                  onClick={handleSelectAll}
                  className="gap-2"
                >
                  {selectedPhotos.size === photos.length ? (
                    <>
                      <Square className="h-4 w-4" />
                      Alle abwählen
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4" />
                      Alle auswählen
                    </>
                  )}
                </Button>

                {selectedPhotos.size > 0 && (
                  <>
                    <Badge variant="default">
                      {selectedPhotos.size} ausgewählt
                    </Badge>
                    <Button
                      variant="primary"
                      onClick={handleDownloadSelected}
                      disabled={isDownloading}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {isDownloading
                        ? `Download... ${progress}%`
                        : 'Als ZIP herunterladen'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setEmailDialogOpen(true)}
                      className="gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Per E-Mail senden
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Photo Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              isSelected={selectedPhotos.has(photo.id)}
              onSelect={handleToggleSelection}
              onView={setLightboxPhoto}
              onDownload={handleDownloadSingle}
              onEdit={handleEditPhoto}
              showCheckbox={selectionMode}
            />
          ))}
        </div>

        {/* Scans Sektion */}
        <div className="mt-10">
          <button
            onClick={() => setScansExpanded(!scansExpanded)}
            className="mb-4 flex items-center gap-2 text-left"
          >
            <Barcode className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-on-surface">
              EAN-Scans
              {scanCount > 0 && (
                <span className="ml-2 text-base font-normal text-on-surface-variant">
                  ({scanCount})
                </span>
              )}
            </h2>
            {scansExpanded ? (
              <ChevronUp className="h-5 w-5 text-on-surface-variant" />
            ) : (
              <ChevronDown className="h-5 w-5 text-on-surface-variant" />
            )}
          </button>

          {scansExpanded && (
            <PositionScansList positionCode={code} />
          )}
        </div>

        {/* Dokumente Sektion */}
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setDocumentsExpanded(!documentsExpanded)}
              className="flex items-center gap-2 text-left"
            >
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-on-surface">
                Dokumente
                {documents && documents.length > 0 && (
                  <span className="ml-2 text-base font-normal text-on-surface-variant">
                    ({documents.length})
                  </span>
                )}
              </h2>
              {documentsExpanded ? (
                <ChevronUp className="h-5 w-5 text-on-surface-variant" />
              ) : (
                <ChevronDown className="h-5 w-5 text-on-surface-variant" />
              )}
            </button>
            
            {!showDocumentUpload && (
              <Button
                variant="outlined"
                onClick={() => setShowDocumentUpload(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Dokument hochladen
              </Button>
            )}
          </div>

          {documentsExpanded && (
            <div className="space-y-6">
              {/* Upload-Bereich */}
              {showDocumentUpload && (
                <div className="rounded-xl border border-outline bg-surface p-5">
                  <h3 className="mb-4 font-medium text-on-surface">Neues Dokument hochladen</h3>
                  <DocumentUpload
                    positionCode={code}
                    onSuccess={() => setShowDocumentUpload(false)}
                    onCancel={() => setShowDocumentUpload(false)}
                  />
                </div>
              )}

              {/* Dokument-Liste */}
              <DocumentList positionCode={code} />
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      {lightboxPhoto && (
        <PhotoLightbox
          photo={lightboxPhoto}
          allPhotos={photos}
          onClose={() => setLightboxPhoto(null)}
          onDownload={handleDownloadSingle}
        />
      )}

      {/* Email Dialog */}
      <EmailDialog
        isOpen={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        onSend={handleSendEmail}
        selectedCount={selectedPhotos.size}
        positionCode={code}
      />
    </div>
  );
}
