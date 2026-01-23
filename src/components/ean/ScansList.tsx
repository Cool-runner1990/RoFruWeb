'use client';

import { useState } from 'react';
import { 
  Search, 
  Smartphone, 
  Barcode, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Filter,
  X,
  Scale,
  MessageSquare,
  Image as ImageIcon,
  Package,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScans, useTodayScanCount } from '@/lib/hooks/useScans';
import { ScanWithArticle, ScanStatus, SCAN_STATUS_CONFIG, PROBLEM_TYPES } from '@/types/scan';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import ScanDetailModal from './ScanDetailModal';

interface ScansListProps {
  onScanSelect?: (scan: ScanWithArticle) => void;
}

export default function ScansList({ onScanSelect }: ScansListProps) {
  const {
    scans,
    isLoading,
    totalCount,
    filters,
    setSearchTerm,
    setStatus,
    setDeviceId,
    devices,
    refetch,
  } = useScans();

  const { count: todayCount } = useTodayScanCount();
  
  const [selectedScan, setSelectedScan] = useState<ScanWithArticle | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleScanClick = (scan: ScanWithArticle) => {
    setSelectedScan(scan);
    onScanSelect?.(scan);
  };

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
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'problem':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <HelpCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusConfig = (status: ScanStatus) => {
    return SCAN_STATUS_CONFIG.find(s => s.value === status) || SCAN_STATUS_CONFIG[2];
  };

  const getProblemLabel = (type: string | null) => {
    if (!type) return null;
    return PROBLEM_TYPES.find(p => p.value === type)?.label || type;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatus(undefined);
    setDeviceId(undefined);
  };

  const hasActiveFilters = filters.searchTerm || filters.status || filters.deviceId;

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <Barcode className="h-4 w-4" />
          {totalCount} Scans gesamt
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {todayCount} heute
        </span>
        <span className="flex items-center gap-1.5">
          <Smartphone className="h-4 w-4" />
          {devices.length} Geräte
        </span>
        <button
          onClick={() => refetch()}
          className="ml-auto flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Aktualisieren
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant z-10" />
            <Input
              type="text"
              placeholder="GTIN, Gerät oder Bemerkung suchen..."
              value={filters.searchTerm || ''}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!pl-12"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
              showFilters 
                ? "border-primary bg-primary/10 text-primary" 
                : "border-outline/30 text-on-surface-variant hover:bg-surface-variant/50"
            )}
          >
            <Filter className="h-4 w-4" />
            Filter
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-surface-variant/30 border border-outline/20">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface-variant">Status:</span>
              <div className="flex gap-1">
                {SCAN_STATUS_CONFIG.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setStatus(filters.status === status.value ? undefined : status.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm transition-colors",
                      filters.status === status.value
                        ? `${status.bgColor} ${status.color} font-medium`
                        : "bg-surface hover:bg-surface-variant/50 text-on-surface-variant"
                    )}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Device Filter */}
            {devices.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-on-surface-variant">Gerät:</span>
                <select
                  value={filters.deviceId || ''}
                  onChange={(e) => setDeviceId(e.target.value || undefined)}
                  className="px-3 py-1.5 rounded-lg text-sm bg-surface border border-outline/30 text-on-surface"
                >
                  <option value="">Alle Geräte</option>
                  {devices.map((device) => (
                    <option key={device} value={device}>{device}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto"
              >
                <X className="h-4 w-4" />
                Filter zurücksetzen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Barcode className="h-16 w-16 text-on-surface-variant/50 mb-4" />
          <p className="text-on-surface font-medium">Keine Scans gefunden</p>
          <p className="text-sm text-on-surface-variant mt-1">
            {hasActiveFilters 
              ? 'Versuche andere Filtereinstellungen' 
              : 'Scans der mobilen App werden hier angezeigt'}
          </p>
        </div>
      ) : (
        /* Scans Table */
        <div className="rounded-xl border border-outline/20 overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[100px_1fr_1fr_120px_100px_80px] gap-4 px-4 py-3 bg-surface-variant/30 border-b border-outline/20 text-sm font-medium text-on-surface-variant">
            <div>Zeitpunkt</div>
            <div>Gerät</div>
            <div>Artikel / GTIN</div>
            <div>Status</div>
            <div>Gewicht</div>
            <div>Details</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-outline/10">
            {scans.map((scan) => {
              const { date, time } = formatDateTime(scan.scanned_at);
              const statusConfig = getStatusConfig(scan.scan_status);

              return (
                <button
                  key={scan.id}
                  onClick={() => handleScanClick(scan)}
                  className="w-full text-left hover:bg-surface-variant/20 transition-colors"
                >
                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-[100px_1fr_1fr_120px_100px_80px] gap-4 px-4 py-3 items-center">
                    {/* Zeitpunkt */}
                    <div className="text-sm">
                      <div className="text-on-surface font-medium">{time}</div>
                      <div className="text-on-surface-variant text-xs">{date}</div>
                    </div>

                    {/* Gerät */}
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-on-surface-variant flex-shrink-0" />
                      <span className="text-sm text-on-surface truncate">
                        {scan.device_name || scan.device_id}
                      </span>
                    </div>

                    {/* Artikel / GTIN */}
                    <div className="min-w-0">
                      {scan.article ? (
                        <div>
                          <div className="text-sm text-on-surface font-medium truncate">
                            {scan.article.label_text_de || scan.article.article_text_de}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                            <Barcode className="h-3 w-3" />
                            <span className="font-mono">{scan.gtin}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-on-surface">{scan.gtin}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                            Unbekannt
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {getStatusIcon(scan.scan_status)}
                      <div>
                        <div className={cn("text-sm font-medium", statusConfig.color)}>
                          {statusConfig.label}
                        </div>
                        {scan.problem_type && (
                          <div className="text-xs text-on-surface-variant">
                            {getProblemLabel(scan.problem_type)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Gewicht */}
                    <div className="text-sm">
                      {scan.weight ? (
                        <span className="flex items-center gap-1 text-on-surface">
                          <Scale className="h-3.5 w-3.5 text-on-surface-variant" />
                          {scan.weight} kg
                        </span>
                      ) : (
                        <span className="text-on-surface-variant">-</span>
                      )}
                    </div>

                    {/* Details Indicators */}
                    <div className="flex items-center gap-2">
                      {scan.notes && (
                        <MessageSquare className="h-4 w-4 text-on-surface-variant" title="Hat Bemerkung" />
                      )}
                      {scan.photo_url && (
                        <ImageIcon className="h-4 w-4 text-on-surface-variant" title="Hat Foto" />
                      )}
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {scan.article ? (
                          <div className="text-sm text-on-surface font-medium truncate">
                            {scan.article.label_text_de || scan.article.article_text_de}
                          </div>
                        ) : (
                          <div className="text-sm font-mono text-on-surface">{scan.gtin}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs text-on-surface-variant">
                          <Smartphone className="h-3 w-3" />
                          <span>{scan.device_name || scan.device_id}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(scan.scan_status)}
                        <span className={cn("text-sm font-medium", statusConfig.color)}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {time} - {date}
                        </span>
                        {scan.weight && (
                          <span className="flex items-center gap-1">
                            <Scale className="h-3 w-3" />
                            {scan.weight} kg
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {scan.notes && <MessageSquare className="h-3.5 w-3.5" />}
                        {scan.photo_url && <ImageIcon className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
