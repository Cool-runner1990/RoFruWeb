'use client';

import { useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Barcode, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Scale,
  MessageSquare,
  Package,
  Tag,
  Hash,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScanWithArticle, ScanStatus, SCAN_STATUS_CONFIG, PROBLEM_TYPES } from '@/types/scan';

interface ScanDetailModalProps {
  scan: ScanWithArticle;
  onClose: () => void;
}

export default function ScanDetailModal({ scan, onClose }: ScanDetailModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusIcon = (status: ScanStatus) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'problem':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'pending':
        return <HelpCircle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusConfig = (status: ScanStatus) => {
    return SCAN_STATUS_CONFIG.find(s => s.value === status) || SCAN_STATUS_CONFIG[2];
  };

  const getProblemLabel = (type: string | null) => {
    if (!type) return null;
    return PROBLEM_TYPES.find(p => p.value === type)?.label || type;
  };

  const statusConfig = getStatusConfig(scan.scan_status);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-primary/50 bg-surface shadow-[0_0_30px_rgba(59,130,246,0.4)] ring-2 ring-primary/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-surface border-b border-outline/20">
          <div className="flex items-center gap-3">
            {getStatusIcon(scan.scan_status)}
            <div>
              <h2 className="text-lg font-semibold text-on-surface">Scan Details</h2>
              <p className="text-sm text-on-surface-variant">
                {formatDateTime(scan.scanned_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-variant/50 transition-colors"
          >
            <X className="h-5 w-5 text-on-surface-variant" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={cn(
            "flex items-center gap-3 p-4 rounded-xl",
            statusConfig.bgColor
          )}>
            {getStatusIcon(scan.scan_status)}
            <div>
              <div className={cn("font-semibold", statusConfig.color)}>
                {statusConfig.label}
              </div>
              {scan.problem_type && (
                <div className="text-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {getProblemLabel(scan.problem_type)}
                </div>
              )}
            </div>
          </div>

          {/* Device Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Gerät
            </h3>
            <div className="p-4 rounded-xl bg-surface-variant/30 border border-outline/10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">Geräte-ID</p>
                  <p className="text-sm text-on-surface font-mono">{scan.device_id}</p>
                </div>
                {scan.device_name && (
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Gerätename</p>
                    <p className="text-sm text-on-surface">{scan.device_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">Scan-Zeitpunkt</p>
                  <p className="text-sm text-on-surface flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-on-surface-variant" />
                    {formatDateTime(scan.scanned_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* GTIN / Article Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
              <Barcode className="h-4 w-4" />
              Artikel
            </h3>
            <div className="p-4 rounded-xl bg-surface-variant/30 border border-outline/10">
              <div className="space-y-4">
                {/* GTIN */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Hash className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Gescannter GTIN</p>
                    <p className="text-lg font-mono font-semibold text-on-surface">{scan.gtin}</p>
                  </div>
                </div>

                {/* Article Details if found */}
                {scan.article ? (
                  <div className="border-t border-outline/10 pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      Artikel gefunden
                    </div>
                    <div className="grid gap-3">
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">Artikelnummer</p>
                        <p className="text-sm font-mono text-primary font-semibold">
                          {scan.article.article_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">Bezeichnung</p>
                        <p className="text-sm text-on-surface">
                          {scan.article.label_text_de || scan.article.article_text_de}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {scan.article.category && (
                          <div>
                            <p className="text-xs text-on-surface-variant mb-1">Bedarfsbereich</p>
                            <p className="text-sm text-on-surface">{scan.article.category}</p>
                          </div>
                        )}
                        {scan.article.branding && (
                          <div>
                            <p className="text-xs text-on-surface-variant mb-1">Branding</p>
                            <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary text-sm">
                              {scan.article.branding}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-outline/10 pt-4">
                    <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                      <AlertTriangle className="h-4 w-4" />
                      Artikel nicht in Datenbank gefunden
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Data */}
          {(scan.weight || scan.notes) && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                <Package className="h-4 w-4" />
                Zusätzliche Daten
              </h3>
              <div className="p-4 rounded-xl bg-surface-variant/30 border border-outline/10 space-y-4">
                {/* Weight */}
                {scan.weight && (
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Scale className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">Gewicht</p>
                      <p className="text-lg font-semibold text-on-surface">{scan.weight} kg</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {scan.notes && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-on-surface-variant" />
                      <p className="text-xs text-on-surface-variant">Bemerkung</p>
                    </div>
                    <p className="text-sm text-on-surface bg-surface/50 p-3 rounded-lg">
                      {scan.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photo */}
          {scan.photo_url && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Foto
              </h3>
              <div className="rounded-xl overflow-hidden border border-outline/20">
                <img
                  src={scan.photo_url}
                  alt="Scan-Foto"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 bg-surface border-t border-outline/20">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-medium hover:bg-primary/90 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
