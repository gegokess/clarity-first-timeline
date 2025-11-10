/**
 * Type Definitions für Projekt Zeitplan
 * Basierend auf der Dokumentation in docs/02-DataModel.md
 */

// Unterarbeitspaket (UAP)
export interface SubPackage {
  id: string;
  title: string;
  start: string; // ISO format: YYYY-MM-DD
  end: string; // ISO format: YYYY-MM-DD
  category?: string;
  color?: string; // Hex color code
  assignedTo?: string[]; // Person names/initials
}

// Arbeitspaket (AP)
export interface WorkPackage {
  id: string;
  title: string;
  start: string; // ISO format: YYYY-MM-DD
  end: string; // ISO format: YYYY-MM-DD
  mode: 'auto' | 'manual'; // auto = rollup from UAPs, manual = user-defined
  subPackages: SubPackage[];
}

// Meilenstein
export interface Milestone {
  id: string;
  title: string;
  date: string; // ISO format: YYYY-MM-DD
}

// Projekt-Einstellungen
export interface ProjectSettings {
  clampUapInsideManualAp: boolean; // Constraint UAPs within AP boundaries (manual mode only)
}

// Projekt
export interface Project {
  id: string;
  name: string;
  description?: string;
  settings: ProjectSettings;
  workPackages: WorkPackage[];
  milestones: Milestone[];
}

// Toast-Benachrichtigungen
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms, default: 3000
}

// Zoom-Levels für Timeline
export type ZoomLevel = 'week' | 'month' | 'quarter' | 'year';

export interface ZoomConfig {
  tickDays: number; // Days between tick marks
  viewDays: number; // Number of days visible in viewport
  format: 'day' | 'week' | 'month' | 'quarter'; // How to format time axis labels
}

// Timeline-Konfiguration
export const ZOOM_CONFIGS: Record<ZoomLevel, ZoomConfig> = {
  week: { tickDays: 1, viewDays: 14, format: 'day' },
  month: { tickDays: 7, viewDays: 90, format: 'week' },
  quarter: { tickDays: 30, viewDays: 180, format: 'month' },
  year: { tickDays: 90, viewDays: 365, format: 'quarter' },
};

// Standard-Farben für UAPs (7 vordefinierte Farben)
export const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
] as const;

// Timeline-Layout-Konstanten
export const TIMELINE_CONSTANTS = {
  BASE_ROW_HEIGHT: 70,
  SUBBAR_HEIGHT: 28,
  UAP_SPACING: 10,
  ROW_PADDING: 35,
  HEADER_HEIGHT: 90,
  PADDING_LEFT: 40,
  PADDING_RIGHT: 40,
  PADDING_TOP: 20,
  PADDING_BOTTOM: 20,
} as const;
