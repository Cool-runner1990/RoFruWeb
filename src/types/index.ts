export interface Photo {
  id: string;
  position_code: string;
  image_url: string;
  captured_at: string;
  created_at: string;
  user_device?: string;
  edited_url?: string; // URL des bearbeiteten Bildes
}

export type PositionCategory = 
  | 'reklamation'
  | 'qualitaetsmangel'
  | 'transportschaden'
  | 'ok'
  | 'sonstiges'
  | null;

export const POSITION_CATEGORIES: { value: PositionCategory; label: string; color: string }[] = [
  { value: 'ok', label: 'OK', color: 'bg-green-500' },
  { value: 'reklamation', label: 'Reklamation', color: 'bg-red-500' },
  { value: 'qualitaetsmangel', label: 'Qualitätsmangel', color: 'bg-orange-500' },
  { value: 'transportschaden', label: 'Transportschaden', color: 'bg-yellow-500' },
  { value: 'sonstiges', label: 'Sonstiges', color: 'bg-gray-500' },
];

export interface Position {
  position_code: string;
  photos: Photo[];
  first_photo_url?: string;
  photo_count: number;
  latest_captured_at: string;
  category?: PositionCategory;
}

export interface DashboardFilters {
  date: Date;
  searchTerm: string;
}

export type ViewMode = 'feed' | 'grid' | 'list';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export type DocumentType = 
  | 'wareneingangsprotokoll'
  | 'lieferschein'
  | 'rechnung'
  | 'reklamation'
  | 'sonstiges';

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'wareneingangsprotokoll', label: 'Wareneingangsprotokoll' },
  { value: 'lieferschein', label: 'Lieferschein' },
  { value: 'rechnung', label: 'Rechnung' },
  { value: 'reklamation', label: 'Reklamation' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

export interface Document {
  id: string;
  position_code: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  document_type: DocumentType;
  notes?: string;
  uploaded_at: string;
  uploaded_by?: string;
}
