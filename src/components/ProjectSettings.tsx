/**
 * ProjectSettings Component
 * Dialog für Projekt-Einstellungen (Start/End-Datum)
 */

import React, { useState, useEffect } from 'react';

interface ProjectSettingsProps {
  projectStart?: string;
  projectEnd?: string;
  onUpdate: (start?: string, end?: string) => void;
  onClose: () => void;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({
  projectStart,
  projectEnd,
  onUpdate,
  onClose,
}) => {
  const [start, setStart] = useState(projectStart || '');
  const [end, setEnd] = useState(projectEnd || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setStart(projectStart || '');
    setEnd(projectEnd || '');
  }, [projectStart, projectEnd]);

  const handleSave = () => {
    // Validierung
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (startDate > endDate) {
        setError('Projektstartdatum muss vor dem Enddatum liegen');
        return;
      }
    }

    setError('');
    onUpdate(
      start || undefined,
      end || undefined
    );
    onClose();
  };

  const handleClear = () => {
    setStart('');
    setEnd('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-panel-alt border border-line/70 rounded-3xl shadow-2xl shadow-black/50 p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-text-muted">Zeilen</p>
            <h2 className="text-xl font-semibold text-text">Projekt-Einstellungen</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-panel transition-colors"
            aria-label="Schließen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label htmlFor="project-start" className="block text-sm font-medium text-text mb-2">
              Projektstartdatum (optional)
            </label>
            <input
              id="project-start"
              type="date"
              value={start}
              onChange={e => setStart(e.target.value)}
              className="w-full px-3 py-2 bg-panel border border-line/70 rounded-xl focus:border-info focus:outline-none"
            />
            <p className="text-xs text-text-muted mt-1">
              Legt den Startpunkt der Timeline fest
            </p>
          </div>

          <div>
            <label htmlFor="project-end" className="block text-sm font-medium text-text mb-2">
              Projektenddatum (optional)
            </label>
            <input
              id="project-end"
              type="date"
              value={end}
              onChange={e => setEnd(e.target.value)}
              className="w-full px-3 py-2 bg-panel border border-line/70 rounded-xl focus:border-info focus:outline-none"
            />
            <p className="text-xs text-text-muted mt-1">
              Legt den Endpunkt der Timeline fest
            </p>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger rounded-xl p-3">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <div className="bg-panel rounded-2xl p-4 border border-line/60">
            <p className="text-xs text-text-muted">
              💡 <strong>Hinweis:</strong> Wenn keine Datumsfelder gesetzt sind, wird der Zeitraum
              automatisch aus den Arbeitspaketen und Meilensteinen berechnet.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-text-muted text-sm font-medium hover:text-white transition-colors"
          >
            Zurücksetzen
          </button>

          <div className="flex-1" />

          <button
            onClick={onClose}
            className="px-4 py-2 bg-panel text-text text-sm font-medium rounded-2xl hover:text-white transition-colors"
          >
            Abbrechen
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 bg-accent-gradient text-white text-sm font-semibold rounded-2xl shadow-md hover:shadow-xl transition-all"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;
