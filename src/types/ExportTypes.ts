/**
 * Export-related Type Definitions
 * Für Logo-Upload, Farbschemata und Export-Einstellungen
 */

export type LogoPosition = 'left' | 'center' | 'right';
export type ColorSchemeName = 'corporate' | 'minimal' | 'vibrant' | 'custom';

export interface LogoConfig {
  dataUrl: string;      // Base64-encoded image
  width: number;        // Original width in pixels
  height: number;       // Original height in pixels
  position: LogoPosition;
}

export interface ColorScheme {
  name: ColorSchemeName;
  primary: string;      // Main color for work packages
  accent: string;       // Accent color for highlights
  neutral: string;      // Neutral/gray tones
  milestone: string;    // Milestone color
}

export interface BrandingConfig {
  logo?: LogoConfig;
  colorScheme: ColorScheme;
}

export interface ExportSettings {
  branding: BrandingConfig;
  showLegend: boolean;
  format: 'a4' | 'a3';
  orientation: 'landscape' | 'portrait';
}

// Predefined color schemes
export const COLOR_SCHEMES: Record<ColorSchemeName, ColorScheme> = {
  corporate: {
    name: 'corporate',
    primary: '#2563EB',      // Business Blue
    accent: '#10B981',        // Success Green
    neutral: '#64748B',       // Slate Gray
    milestone: '#F59E0B',     // Amber
  },
  minimal: {
    name: 'minimal',
    primary: '#1F2937',       // Dark Gray
    accent: '#6366F1',        // Indigo
    neutral: '#9CA3AF',
    milestone: '#EF4444',     // Red
  },
  vibrant: {
    name: 'vibrant',
    primary: '#7C3AED',       // Purple
    accent: '#EC4899',        // Pink
    neutral: '#6B7280',
    milestone: '#FBBF24',     // Yellow
  },
  custom: {
    name: 'custom',
    primary: '#4F46E5',       // Default custom color
    accent: '#10B981',
    neutral: '#64748B',
    milestone: '#F59E0B',
  },
};

// Default export settings
export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  branding: {
    colorScheme: COLOR_SCHEMES.corporate,
  },
  showLegend: true,
  format: 'a4',
  orientation: 'landscape',
};
