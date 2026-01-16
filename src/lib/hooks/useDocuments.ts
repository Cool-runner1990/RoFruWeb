'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Document, DocumentType } from '@/types';

const supabase = createClient();

// Dokumente für eine Position abrufen
export function useDocumentsByPosition(positionCode: string) {
  return useQuery<Document[]>({
    queryKey: ['documents', positionCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('position_code', positionCode)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!positionCode,
  });
}

// Dokument hochladen
interface UploadDocumentParams {
  file: File;
  positionCode: string;
  documentType: DocumentType;
  notes?: string;
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, positionCode, documentType, notes }: UploadDocumentParams) => {
      // Einzigartigen Dateinamen generieren
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${positionCode}/${timestamp}_${sanitizedFileName}`;

      // Datei in Supabase Storage hochladen
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Öffentliche URL abrufen
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Dokument-Eintrag in der Datenbank erstellen
      const { data, error } = await supabase
        .from('documents')
        .insert({
          position_code: positionCode,
          file_url: publicUrl,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          document_type: documentType,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.positionCode] });
    },
  });
}

// Dokument löschen
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ document }: { document: Document }) => {
      // Dateipfad aus URL extrahieren
      const url = new URL(document.file_url);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex(p => p === 'documents');
      const filePath = pathParts.slice(bucketIndex + 1).join('/');

      // Datei aus Storage löschen
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage-Löschung fehlgeschlagen:', storageError);
      }

      // Datenbank-Eintrag löschen
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (error) throw error;
      return document;
    },
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: ['documents', document.position_code] });
    },
  });
}

// Dokument-Notizen aktualisieren
export function useUpdateDocumentNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, notes, positionCode }: { documentId: string; notes: string; positionCode: string }) => {
      const { data, error } = await supabase
        .from('documents')
        .update({ notes })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return { data, positionCode };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['documents', result.positionCode] });
    },
  });
}

// Hilfsfunktion: Dateigröße formatieren
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Hilfsfunktion: Datei-Icon basierend auf MIME-Type
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return '📦';
  return '📎';
}
