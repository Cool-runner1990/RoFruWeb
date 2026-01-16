'use client';

import { useState } from 'react';
import { FileText, Download, Trash2, ExternalLink, MoreVertical, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Document, DOCUMENT_TYPES } from '@/types';
import { useDocumentsByPosition, useDeleteDocument, formatFileSize, getFileIcon } from '@/lib/hooks/useDocuments';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

interface DocumentListProps {
  positionCode: string;
}

export default function DocumentList({ positionCode }: DocumentListProps) {
  const { data: documents, isLoading } = useDocumentsByPosition(positionCode);
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const handleDelete = (document: Document) => {
    if (!confirm(`Möchten Sie "${document.file_name}" wirklich löschen?`)) return;
    
    setDeletingId(document.id);
    deleteDocument(
      { document },
      {
        onSettled: () => setDeletingId(null),
      }
    );
  };

  const handleDownload = async (document: Document) => {
    try {
      const response = await fetch(document.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error('Download fehlgeschlagen:', error);
    }
  };

  const toggleNotes = (id: string) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNotes(newExpanded);
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-outline bg-surface-variant/30 p-8 text-center">
        <FileText className="mx-auto mb-3 h-12 w-12 text-on-surface-variant/50" />
        <p className="text-on-surface-variant">Noch keine Dokumente vorhanden</p>
        <p className="mt-1 text-sm text-on-surface-variant/70">
          Laden Sie Wareneingangs&shy;protokolle, Lieferscheine oder andere Dokumente hoch
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className={cn(
            'group rounded-xl border border-outline bg-surface p-4 transition-all hover:border-primary/50 hover:shadow-sm',
            deletingId === doc.id && 'opacity-50'
          )}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-container text-2xl">
              {getFileIcon(doc.file_type)}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="truncate font-medium text-on-surface" title={doc.file_name}>
                    {doc.file_name}
                  </h4>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
                    <Badge variant="outline" className="text-xs">
                      {getDocumentTypeLabel(doc.document_type)}
                    </Badge>
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>•</span>
                    <span>
                      {format(new Date(doc.uploaded_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-shrink-0 items-center gap-2">
                  {doc.notes && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleNotes(doc.id)}
                      className="h-10 w-10"
                      title="Notizen anzeigen"
                    >
                      <MessageSquare className={cn(
                        'h-5 w-5',
                        expandedNotes.has(doc.id) && 'text-primary'
                      )} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(doc.file_url, '_blank')}
                    className="h-10 w-10"
                    title="In neuem Tab öffnen"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(doc)}
                    className="h-10 w-10"
                    title="Herunterladen"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doc)}
                    disabled={isDeleting}
                    className="h-10 w-10 text-error hover:bg-error/10"
                    title="Löschen"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Notizen (expandiert) */}
              {doc.notes && expandedNotes.has(doc.id) && (
                <div className="mt-3 rounded-lg bg-surface-variant/50 p-3 text-sm text-on-surface-variant">
                  {doc.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
