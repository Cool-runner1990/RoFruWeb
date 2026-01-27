import { Article } from './article';

export type ScanStatus = 'ok' | 'problem' | 'pending';

export type ProblemType = 
  | 'wrong_article'      // Falsche Ware
  | 'wrong_quantity'     // Falsche Menge
  | 'damaged'            // Beschädigt
  | 'quality_issue'      // Qualitätsmangel
  | 'missing'            // Fehlend
  | 'other';             // Sonstiges

export const SCAN_STATUS_CONFIG: { value: ScanStatus; label: string; color: string; bgColor: string }[] = [
  { value: 'ok', label: 'OK', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  { value: 'problem', label: 'Problem', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  { value: 'pending', label: 'Ausstehend', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
];

export const PROBLEM_TYPES: { value: ProblemType; label: string }[] = [
  { value: 'wrong_article', label: 'Falsche Ware' },
  { value: 'wrong_quantity', label: 'Falsche Menge' },
  { value: 'damaged', label: 'Beschädigt' },
  { value: 'quality_issue', label: 'Qualitätsmangel' },
  { value: 'missing', label: 'Fehlend' },
  { value: 'other', label: 'Sonstiges' },
];

export interface Scan {
  id: string;
  position_code: string | null; // 6-digit position code from mobile app
  device_id: string;
  device_name: string | null;
  gtin: string;
  article_id: string | null;
  article?: Article; // Joined from articles table
  scan_status: ScanStatus;
  weight: number | null;
  notes: string | null;
  photo_url: string | null;
  problem_type: ProblemType | null;
  scanned_at: string;
  created_at: string;
}

export interface ScanFilters {
  searchTerm?: string;
  status?: ScanStatus;
  deviceId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ScanWithArticle extends Scan {
  article: Article | null;
}
