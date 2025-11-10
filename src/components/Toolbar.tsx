/**
 * Toolbar Component
 * Hauptnavigation mit Zoom, Export, Import
 * Basierend auf docs/03-Components.md
 */

import React, { useState, useRef, useEffect } from 'react';
import type { ZoomLevel } from '../types';

interface ToolbarProps {
  projectName: string;
  zoomLevel: ZoomLevel;
  onProjectNameChange: (name: string) => void;
  onZoomChange: (level: ZoomLevel) => void;
  onAddWorkPackage: () => void;
  onAddMilestone: () => void;
  onExportJSON: () => void;
  onCopyJSON: () => void;
  onExportPDF: () => void;
  onImportJSON: (json: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  projectName,
  zoomLevel,
  onProjectNameChange,
  onZoomChange,
  onAddWorkPackage,
  onAddMilestone,
  onExportJSON,
  onCopyJSON,
  onExportPDF,
  onImportJSON,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(projectName);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
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

  const zoomOptions: { value: ZoomLevel; label: string }[] = [
    { value: 'week', label: 'Woche' },
    { value: 'month', label: 'Monat' },
    { value: 'quarter', label: 'Quartal' },
    { value: 'year', label: 'Jahr' },
  ];

  return (
    <div className="h-16 bg-white border-b border-border flex items-center px-6 gap-6">
      {/* Projektname */}
      <div className="flex items-center gap-3">
        {isEditingName ? (
          <input
            ref={nameInputRef}
            type="text"
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleNameKeyDown}
            className="text-lg font-semibold text-text px-2 py-1 border border-info rounded-md focus:outline-none focus:ring-2 focus:ring-info"
            style={{ minWidth: '200px' }}
          />
        ) : (
          <h1
            className="text-lg font-semibold text-text cursor-pointer hover:text-info transition-colors"
            onClick={() => setIsEditingName(true)}
            title="Klicken zum Bearbeiten"
          >
            {projectName}
          </h1>
        )}
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Zoom-Auswahl */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-muted">Zoom:</span>
        <div className="flex gap-1 bg-surface rounded-md p-1">
          {zoomOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onZoomChange(option.value)}
              className={`
                px-3 py-1 text-sm rounded transition-colors
                ${zoomLevel === option.value
                  ? 'bg-white text-info font-medium shadow-sm'
                  : 'text-text-muted hover:text-text'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      {/* Action Buttons */}
      <div className="toolbar-actions flex items-center gap-3">
        <button
          onClick={onAddWorkPackage}
          className="px-4 py-2 bg-info text-white text-sm font-medium rounded-md hover:bg-opacity-90 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          AP hinzufügen
        </button>

        <button
          onClick={onAddMilestone}
          className="px-4 py-2 bg-white text-text text-sm font-medium rounded-md border border-border hover:bg-surface transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Meilenstein
        </button>

        {/* Export Dropdown */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="px-4 py-2 bg-white text-text text-sm font-medium rounded-md border border-border hover:bg-surface transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-md shadow-lg border border-border z-20 min-w-[180px]">
              <button
                onClick={() => {
                  onExportJSON();
                  setIsExportMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-text hover:bg-surface transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                JSON Download
              </button>
              <button
                onClick={() => {
                  onCopyJSON();
                  setIsExportMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-text hover:bg-surface transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                JSON kopieren
              </button>
              <button
                onClick={() => {
                  onExportPDF();
                  setIsExportMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-text hover:bg-surface transition-colors flex items-center gap-2 border-t border-border"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF Export
              </button>
            </div>
          )}
        </div>

        {/* Import Button */}
        <button
          onClick={() => setIsImportDialogOpen(true)}
          className="px-4 py-2 bg-white text-text text-sm font-medium rounded-md border border-border hover:bg-surface transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import
        </button>
      </div>

      {/* Import Dialog */}
      {isImportDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={importDialogRef}
            className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mx-4"
          >
            <h2 className="text-lg font-semibold text-text mb-4">Projekt importieren</h2>

            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="JSON-Daten hier einfügen..."
              className="w-full h-48 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-info font-mono text-sm resize-none"
            />

            <div className="mt-4 flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-surface text-text text-sm font-medium rounded-md hover:bg-border transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Datei wählen
              </button>

              <div className="flex-1" />

              <button
                onClick={() => {
                  setIsImportDialogOpen(false);
                  setImportText('');
                }}
                className="px-4 py-2 text-text-muted text-sm font-medium hover:text-text transition-colors"
              >
                Abbrechen
              </button>

              <button
                onClick={handleImportSubmit}
                disabled={!importText.trim()}
                className="px-4 py-2 bg-info text-white text-sm font-medium rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importieren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
