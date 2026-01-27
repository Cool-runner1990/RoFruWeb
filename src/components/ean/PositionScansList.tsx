'use client';

import { useState } from 'react';
import {
  Barcode,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Scale,
  MessageSquare,
  Image as ImageIcon,
  Smartphone,
  RefreshCw,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScansByPosition } from '@/lib/hooks/useScans';
import { ScanWithArticle, ScanStatus, SCAN_STATUS_CONFIG, PROBLEM_TYPES } from '@/types/scan';
import Spinner from '@/components/ui/Spinner';
import ScanDetailModal from './ScanDetailModal';

interface PositionScansListProps {
  positionCode: string;
}

export default function PositionScansList({ positionCode }: PositionScansListProps) {
  const { scans, totalCount, isLoading, refetch } = useScansByPosition(positionCode);
  const [selectedScan, setSelectedScan] = useState<ScanWithArticle | null>(null);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      }),
    };
  };

  const getStatusIcon = (status: ScanStatus) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'problem':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <HelpCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusConfig = (status: ScanStatus) => {
    return SCAN_STATUS_CONFIG.find(s => s.value === status) || SCAN_STATUS_CONFIG[2];
  };

  const getProblemLabel = (type: string | null) => {
    if (!type) return null;
    return PROBLEM_TYPES.find(p => p.value === type)?.label || type;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[150px] items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center rounded-xl border border-outline/20 bg-surface-variant/20">
        <Barcode className="h-12 w-12 text-on-surface-variant/40 mb-3" />
        <p className="text-on-surface font-medium">Keine Scans vorhanden</p>
        <p className="text-sm text-on-surface-variant mt-1">
          Diese Position hat noch keine EAN-Scans
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between text-sm text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <Barcode className="h-4 w-4" />
          {totalCount} {totalCount === 1 ? 'Scan' : 'Scans'}
        </span>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Aktualisieren
        </button>
      </div>

      {/* Scans List */}
      <div className="rounded-xl border border-outline/20 overflow-hidden divide-y divide-outline/10">
        {scans.map((scan) => {
          const { date, time } = formatDateTime(scan.scanned_at);
          const statusConfig = getStatusConfig(scan.scan_status);

          return (
            <button
              key={scan.id}
              onClick={() => setSelectedScan(scan)}
              className="w-full text-left hover:bg-surface-variant/20 transition-colors p-3"
            >
              <div className="flex items-start gap-3">
                {/* Status Icon */}
                <div className="mt-0.5">
                  {getStatusIcon(scan.scan_status)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Artikel / GTIN */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {scan.article ? (
                        <>
                          <div className="text-sm text-on-surface font-medium truncate">
                            {scan.article.label_text_de || scan.article.article_text_de}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-on-surface-variant mt-0.5">
                            <Barcode className="h-3 w-3 flex-shrink-0" />
                            <span className="font-mono">{scan.gtin}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-on-surface">{scan.gtin}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                            Unbekannt
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Status Badge */}
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                      statusConfig.bgColor,
                      statusConfig.color
                    )}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Problem Type */}
                  {scan.problem_type && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {getProblemLabel(scan.problem_type)}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {time} - {date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Smartphone className="h-3 w-3" />
                      {scan.device_name || scan.device_id}
                    </span>
                    {scan.weight && (
                      <span className="flex items-center gap-1">
                        <Scale className="h-3 w-3" />
                        {scan.weight} kg
                      </span>
                    )}
                    {scan.notes && (
                      <MessageSquare className="h-3 w-3" title="Hat Bemerkung" />
                    )}
                    {scan.photo_url && (
                      <ImageIcon className="h-3 w-3" title="Hat Foto" />
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Scan Detail Modal */}
      {selectedScan && (
        <ScanDetailModal
          scan={selectedScan}
          onClose={() => setSelectedScan(null)}
        />
      )}
    </div>
  );
}
