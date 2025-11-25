/**
 * ExportSettingsModal Component
 * Modal für Export-Einstellungen: Logo, Farbschema, Optionen
 */

import React, { useState, useEffect } from 'react';
import type { ExportSettings, ColorSchemeName, LogoPosition } from '../types/ExportTypes';
import { COLOR_SCHEMES } from '../types/ExportTypes';
import LogoUpload from './LogoUpload';

interface ExportSettingsModalProps {
  isOpen: boolean;
  currentSettings: ExportSettings;
  onClose: () => void;
  onSave: (settings: ExportSettings) => void;
}

const ExportSettingsModal: React.FC<ExportSettingsModalProps> = ({
  isOpen,
  currentSettings,
  onClose,
  onSave,
}) => {
  const [settings, setSettings] = useState<ExportSettings>(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleColorSchemeChange = (schemeName: ColorSchemeName) => {
    setSettings({
      ...settings,
      branding: {
        ...settings.branding,
        colorScheme: COLOR_SCHEMES[schemeName],
      },
    });
  };

  const handleCustomColorChange = (color: string) => {
    setSettings({
      ...settings,
      branding: {
        ...settings.branding,
        colorScheme: {
          ...COLOR_SCHEMES.custom,
          primary: color,
        },
      },
    });
  };

  const handleLogoPositionChange = (position: LogoPosition) => {
    setSettings({
      ...settings,
      branding: {
        ...settings.branding,
        logo: settings.branding.logo
          ? { ...settings.branding.logo, position }
          : undefined,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-panel border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-panel border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text">Export-Einstellungen</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-bg transition-colors flex items-center justify-center text-text-muted hover:text-text"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Branding Section */}
          <section>
            <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
              🎨 Branding
            </h3>
            
            {/* Logo Upload */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-text-muted mb-2">
                Logo
              </label>
              <LogoUpload
                logo={settings.branding.logo}
                onLogoChange={(logo) =>
                  setSettings({
                    ...settings,
                    branding: {
                      ...settings.branding,
                      logo: logo ? { ...logo, position: settings.branding.logo?.position || 'left' } : undefined,
                    },
                  })
                }
              />
            </div>

            {/* Logo Position */}
            {settings.branding.logo && (
              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">
                  Logo-Position
                </label>
                <div className="flex gap-2">
                  {(['left', 'center', 'right'] as LogoPosition[]).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => handleLogoPositionChange(pos)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        settings.branding.logo?.position === pos
                          ? 'bg-info text-white'
                          : 'bg-panel-alt text-text hover:bg-info/10'
                      }`}
                    >
                      {pos === 'left' && '← Links'}
                      {pos === 'center' && '↔ Mitte'}
                      {pos === 'right' && 'Rechts →'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Color Scheme Section */}
          <section>
            <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
              🎨 Farbschema
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {Object.entries(COLOR_SCHEMES)
                .filter(([key]) => key !== 'custom')
                .map(([key, scheme]) => (
                  <button
                    key={key}
                    onClick={() => handleColorSchemeChange(key as ColorSchemeName)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      settings.branding.colorScheme.name === key
                        ? 'border-info bg-info/10'
                        : 'border-border hover:border-info/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-1">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: scheme.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: scheme.accent }}
                        />
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: scheme.milestone }}
                        />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-text capitalize">
                      {key === 'corporate' && 'Business'}
                      {key === 'minimal' && 'Minimal'}
                      {key === 'vibrant' && 'Lebendig'}
                    </p>
                  </button>
                ))}
            </div>

            {/* Custom Color */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">
                Eigene Primärfarbe
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={
                    settings.branding.colorScheme.name === 'custom'
                      ? settings.branding.colorScheme.primary
                      : '#4F46E5'
                  }
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="w-16 h-10 rounded-lg border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={
                    settings.branding.colorScheme.name === 'custom'
                      ? settings.branding.colorScheme.primary
                      : '#4F46E5'
                  }
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="flex-1 px-3 py-2 bg-panel-alt border border-border rounded-lg text-sm font-mono text-text"
                  placeholder="#4F46E5"
                />
              </div>
            </div>
          </section>

          {/* Export Options */}
          <section>
            <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
              📋 Export-Optionen
            </h3>
            
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-panel-alt transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showLegend}
                onChange={(e) =>
                  setSettings({ ...settings, showLegend: e.target.checked })
                }
                className="w-4 h-4 rounded border-border text-info focus:ring-info"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-text">Legende anzeigen</p>
                <p className="text-xs text-text-muted">
                  Zeigt Erklärung der Symbole und Farben
                </p>
              </div>
            </label>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-panel border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text hover:bg-bg transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-info text-white hover:bg-info/90 transition-colors"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportSettingsModal;
