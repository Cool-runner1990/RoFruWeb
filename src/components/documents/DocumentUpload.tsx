'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentType, DOCUMENT_TYPES } from '@/types';
import { useUploadDocument, formatFileSize } from '@/lib/hooks/useDocuments';
import Button from '@/components/ui/Button';

interface DocumentUploadProps {
  positionCode: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function DocumentUpload({ positionCode, onSuccess, onCancel }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('wareneingangsprotokoll');
  const [notes, setNotes] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { mutate: uploadDocument, isPending: isUploading } = useUploadDocument();

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Dieser Dateityp wird nicht unterstützt. Erlaubt: PDF, Bilder, Word, Excel';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Die Datei ist zu groß. Maximum: ${formatFileSize(MAX_FILE_SIZE)}`;
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadDocument(
      {
        file: selectedFile,
        positionCode,
        documentType,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setNotes('');
          setDocumentType('wareneingangsprotokoll');
          onSuccess?.();
        },
        onError: (error) => {
          setError(`Upload fehlgeschlagen: ${error.message}`);
        },
      }
    );
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all',
          dragOver
            ? 'border-primary bg-primary-container/20'
            : 'border-outline hover:border-primary hover:bg-surface-variant/50',
          selectedFile && 'border-primary bg-primary-container/10'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center gap-3">
            <FileText className="h-10 w-10 text-primary" />
            <div className="text-left">
              <p className="font-medium text-on-surface">{selectedFile.name}</p>
              <p className="text-sm text-on-surface-variant">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="ml-2 rounded-full p-1 hover:bg-surface-variant"
            >
              <X className="h-5 w-5 text-on-surface-variant" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="mb-2 h-10 w-10 text-on-surface-variant" />
            <p className="text-center text-on-surface-variant">
              <span className="font-medium text-primary">Datei auswählen</span> oder hierher ziehen
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              PDF, Bilder, Word, Excel • Max. {formatFileSize(MAX_FILE_SIZE)}
            </p>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Dokument-Typ Auswahl */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-on-surface">
          Dokumenttyp
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          className="w-full rounded-xl border border-outline bg-surface px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {DOCUMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notizen */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-on-surface">
          Notizen (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Zusätzliche Anmerkungen zum Dokument..."
          rows={3}
          className="w-full resize-none rounded-xl border border-outline bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Aktionen */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isUploading}>
            Abbrechen
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Wird hochgeladen...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Hochladen
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
