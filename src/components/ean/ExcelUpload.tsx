'use client';

import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface ExcelUploadProps {
  onUploadSuccess: () => void;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadResult {
  success: boolean;
  message: string;
  count?: number;
}

export default function ExcelUpload({ onUploadSuccess }: ExcelUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && isValidExcelFile(file)) {
      setSelectedFile(file);
      setResult(null);
    } else {
      setResult({
        success: false,
        message: 'Bitte eine gültige Excel-Datei (.xlsx, .xls) auswählen',
      });
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidExcelFile(file)) {
      setSelectedFile(file);
      setResult(null);
    } else if (file) {
      setResult({
        success: false,
        message: 'Bitte eine gültige Excel-Datei (.xlsx, .xls) auswählen',
      });
    }
  }, []);

  const isValidExcelFile = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const validExtensions = ['.xlsx', '.xls'];
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );
    return hasValidType || hasValidExtension;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus('uploading');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload-articles', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setResult({
          success: true,
          message: data.message || 'Import erfolgreich',
          count: data.count,
        });
        setSelectedFile(null);
        onUploadSuccess();
      } else {
        setStatus('error');
        setResult({
          success: false,
          message: data.error || 'Fehler beim Import',
        });
      }
    } catch (error) {
      setStatus('error');
      setResult({
        success: false,
        message: 'Verbindungsfehler. Bitte erneut versuchen.',
      });
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setStatus('idle');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-on-surface mb-1">
          Artikelstammdaten importieren
        </h3>
        <p className="text-sm text-on-surface-variant">
          Lade eine Excel-Datei mit Artikeldaten hoch, um die Datenbank zu aktualisieren.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-2xl border-2 border-dashed transition-all duration-200',
          'flex flex-col items-center justify-center p-12 text-center',
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-outline/30 bg-surface-variant/20 hover:border-outline/50 hover:bg-surface-variant/30',
          status === 'uploading' && 'pointer-events-none opacity-70'
        )}
      >
        {status === 'uploading' ? (
          <>
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <p className="text-on-surface font-medium text-lg">Daten werden importiert...</p>
            <p className="text-sm text-on-surface-variant mt-2">
              Dies kann je nach Dateigröße einen Moment dauern
            </p>
          </>
        ) : selectedFile ? (
          <>
            <FileSpreadsheet className="h-16 w-16 text-primary mb-4" />
            <p className="text-on-surface font-medium text-lg">{selectedFile.name}</p>
            <p className="text-sm text-on-surface-variant mt-1">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleUpload} size="lg">
                <Upload className="h-4 w-4 mr-2" />
                Jetzt importieren
              </Button>
              <Button variant="outlined" size="lg" onClick={resetUpload}>
                Andere Datei wählen
              </Button>
            </div>
          </>
        ) : (
          <>
            <Upload className="h-16 w-16 text-on-surface-variant mb-4" />
            <p className="text-on-surface font-medium text-lg">
              Excel-Datei hierher ziehen
            </p>
            <p className="text-sm text-on-surface-variant mt-2">
              oder klicken, um eine Datei auszuwählen
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </>
        )}
      </div>

      {/* Result Message */}
      {result && (
        <div
          className={cn(
            'flex items-start gap-3 rounded-xl p-4',
            result.success
              ? 'bg-green-500/10 text-green-700 dark:text-green-400'
              : 'bg-red-500/10 text-red-700 dark:text-red-400'
          )}
        >
          {result.success ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-medium">{result.message}</p>
            {result.count !== undefined && (
              <p className="text-sm opacity-80 mt-1">
                {result.count} Artikel wurden verarbeitet
              </p>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl bg-surface-variant/30 p-4">
        <p className="text-sm font-medium text-on-surface mb-2">Unterstützte Formate:</p>
        <ul className="text-sm text-on-surface-variant space-y-1">
          <li className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Excel (.xlsx, .xls)
          </li>
        </ul>
        <p className="text-xs text-on-surface-variant mt-3 opacity-70">
          Die Datei sollte eine Artikelbezeichnungsliste mit EAN-Codes enthalten.
          Bestehende Artikel werden aktualisiert, neue werden hinzugefügt.
        </p>
      </div>
    </div>
  );
}
