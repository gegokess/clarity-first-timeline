/**
 * Toolbar Component
 * Hauptnavigation mit Zoom, Export, Import
 * Basierend auf docs/03-Components.md
 */

import React, { useState, useRef, useEffect } from 'react';
import type { TimeResolution } from '../types';
import ProjectSettings from './ProjectSettings';

interface ToolbarProps {
  projectName: string;
  projectStart?: string;
  projectEnd?: string;
  onProjectNameChange: (name: string) => void;
  onProjectDatesChange: (start?: string, end?: string) => void;
  
  // New Props
  timeResolution: TimeResolution;
  onTimeResolutionChange: (res: TimeResolution) => void;
  pixelsPerDay: number;
  onPixelsPerDayChange: (val: number | ((prev: number) => number)) => void;
  
  onAddWorkPackage: () => void;
  onAddMilestone: () => void;
  
  // Undo/Redo
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  onExportJSON: () => void;
  onCopyJSON: () => void;
  onExportPDF: () => void;
  onExportPNG: () => void;
  onImportJSON: (json: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  projectName,
  projectStart,
  projectEnd,
  onProjectNameChange,
  onProjectDatesChange,
  timeResolution,
  onTimeResolutionChange,
  pixelsPerDay,
  onPixelsPerDayChange,
  onAddWorkPackage,
  onAddMilestone,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExportJSON,
  onCopyJSON,
  onExportPDF,
  onExportPNG,
  onImportJSON,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(projectName);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const importDialogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-Focus bei Name-Bearbeitung
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // Schließe Export-Menü bei Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };

    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExportMenuOpen]);

  const handleNameSave = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== projectName) {
      onProjectNameChange(trimmed);
    } else {
      setNameValue(projectName);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setNameValue(projectName);
      setIsEditingName(false);
    }
  };

  const handleImportSubmit = () => {
    const trimmed = importText.trim();
    if (trimmed) {
      onImportJSON(trimmed);
      setImportText('');
      setIsImportDialogOpen(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          onImportJSON(text);
          setIsImportDialogOpen(false);
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };



  return (
    <header className="bg-surface/90 border-b border-line/80 shadow-[0_20px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="px-6 sm:px-8 py-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-4 pr-6 border-r border-line/60">
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-panel-alt/70 border border-line/50 shadow-inner shadow-black/20">
              <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 5v14m7-7H5" />
              </svg>
            </div>
            <div className="flex flex-col gap-1 min-w-[200px]">
              <span className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Projekt</span>
              {isEditingName ? (
                <input
                  ref={nameInputRef}
                  type="text"
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={handleNameKeyDown}
                  className="bg-panel px-3 py-2 rounded-xl border border-line text-lg font-semibold text-text focus:border-info focus:outline-none focus:ring-0"
                />
              ) : (
                <button
                  className="text-2xl font-semibold text-left text-white hover:text-info transition-colors"
                  onClick={() => setIsEditingName(true)}
                  title="Klicken zum Bearbeiten"
                >
                  {projectName}
                </button>
              )}
              <div className="text-xs text-text-muted flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-info/80" />
                {projectStart && projectEnd
                  ? `${projectStart} – ${projectEnd}`
                  : 'Zeitraum wird dynamisch aus APs ermittelt'}
              </div>
            </div>
          </div>

          {/* Time Resolution & Zoom */}
          <div className="flex items-center gap-4">
            {/* Time Resolution */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Ansicht</span>
              <div className="flex bg-panel-alt/50 rounded-lg p-0.5 border border-line/40">
                {(['week', 'month', 'quarter', 'year'] as TimeResolution[]).map((res) => (
                  <button
                    key={res}
                    onClick={() => onTimeResolutionChange(res)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      timeResolution === res
                        ? 'bg-panel shadow-sm text-white'
                        : 'text-text-muted hover:text-text hover:bg-white/5'
                    }`}
                  >
                    {res === 'week' ? 'Woche' : res === 'month' ? 'Monat' : res === 'quarter' ? 'Quartal' : 'Jahr'}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px h-8 bg-line/40 mx-2" />

            {/* Zoom Slider */}
            <div className="flex flex-col gap-1 min-w-[120px]">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Zoom</span>
                <span className="text-[10px] text-text-muted">{Math.round(pixelsPerDay)}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="100"
                step="1"
                value={pixelsPerDay}
                onChange={(e) => onPixelsPerDayChange(Number(e.target.value))}
                className="w-full h-1.5 bg-panel-alt rounded-lg appearance-none cursor-pointer accent-info"
              />
            </div>
          </div>

          <div className="w-px h-8 bg-line/40 mx-2" />

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-2 rounded-lg transition-colors ${
                canUndo ? 'text-text hover:bg-white/10' : 'text-text-muted/30 cursor-not-allowed'
              }`}
              title="Rückgängig (Ctrl+Z)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-2 rounded-lg transition-colors ${
                canRedo ? 'text-text hover:bg-white/10' : 'text-text-muted/30 cursor-not-allowed'
              }`}
              title="Wiederherstellen (Ctrl+Y)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <div className="toolbar-actions flex flex-wrap items-center justify-end gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 rounded-2xl bg-panel-alt/70 border border-line/60 text-text-muted hover:text-white hover:border-info/60 transition-colors"
              title="Projekt-Einstellungen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <button
              onClick={onAddWorkPackage}
              className="px-4 py-2 rounded-2xl bg-accent-gradient text-sm font-semibold text-white shadow-md shadow-black/30 hover:shadow-lg flex items-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 5v14m7-7H5" />
              </svg>
              AP hinzufügen
            </button>

            <button
              onClick={onAddMilestone}
              className="px-4 py-2 rounded-2xl border border-line/70 text-sm font-semibold text-white/90 bg-panel-alt/70 hover:border-info/60 hover:text-white flex items-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
              </svg>
              Meilenstein
            </button>

            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="px-4 py-2 rounded-2xl border border-line/70 text-sm font-semibold text-white/90 bg-panel hover:border-info/70 flex items-center gap-2 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 top-full mt-3 bg-panel-alt border border-line/80 rounded-2xl shadow-lg shadow-black/40 z-20 min-w-[200px] overflow-hidden">
                  <button
                    onClick={() => {
                      onExportJSON();
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white/90 hover:bg-panel transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    JSON Download
                  </button>
                  <button
                    onClick={() => {
                      onCopyJSON();
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white/90 hover:bg-panel transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    JSON kopieren
                  </button>
                  <button
                    onClick={() => {
                      onExportPDF();
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white/90 hover:bg-panel transition-colors flex items-center gap-3 border-t border-line/70"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    PDF Export (Timeline)
                  </button>
                  <button
                    onClick={() => {
                      onExportPNG();
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white/90 hover:bg-panel transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    PNG Export (Timeline)
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsImportDialogOpen(true)}
              className="px-4 py-2 rounded-2xl border border-info/40 text-sm font-semibold text-info bg-info/10 hover:bg-info/20 flex items-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import
            </button>
          </div>
        </div>
      </div>

      {/* Import Dialog */}
      {isImportDialogOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={importDialogRef}
            className="bg-panel-alt border border-line/70 rounded-3xl shadow-2xl shadow-black/50 p-6 w-full max-w-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Datenquelle</p>
                <h2 className="text-xl font-semibold text-white mt-1">Projekt importieren</h2>
              </div>
              <button
                onClick={() => {
                  setIsImportDialogOpen(false);
                  setImportText('');
                }}
                className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-panel transition-colors"
                aria-label="Schließen"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="JSON-Daten hier einfügen..."
              className="w-full h-56 px-4 py-3 bg-panel text-sm font-mono text-text border border-line/70 rounded-2xl focus:border-info focus:outline-none focus:ring-0 resize-none"
            />

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-2xl border border-line/70 text-sm font-semibold text-white/90 bg-panel hover:border-info/60 flex items-center gap-2 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Datei wählen
              </button>

              <div className="flex-1" />

              <button
                onClick={() => {
                  setIsImportDialogOpen(false);
                  setImportText('');
                }}
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-white transition-colors"
              >
                Abbrechen
              </button>

              <button
                onClick={handleImportSubmit}
                disabled={!importText.trim()}
                className="px-5 py-2 rounded-2xl bg-accent-gradient text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Importieren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Settings Dialog */}
      {isSettingsOpen && (
        <ProjectSettings
          projectStart={projectStart}
          projectEnd={projectEnd}
          onUpdate={onProjectDatesChange}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </header>
  );
};

export default Toolbar;
