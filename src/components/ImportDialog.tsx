/**
 * Import Dialog Component
 * Standalone dialog for JSON import with portal rendering
 */

import React, { useRef } from 'react';
import { createPortal } from 'react-dom';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (json: string) => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ isOpen, onClose, onImport }) => {
  const [importText, setImportText] = React.useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          onImport(text);
          setImportText('');
          onClose();
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportSubmit = () => {
    const trimmed = importText.trim();
    if (trimmed) {
      onImport(trimmed);
      setImportText('');
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-[9999] p-4 pt-20 overflow-y-auto">
      <div className="bg-panel-alt border border-line/70 rounded-3xl shadow-2xl shadow-black/50 p-6 w-full max-w-2xl max-h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Datenquelle</p>
            <h2 className="text-xl font-semibold text-white mt-1">Projekt importieren</h2>
          </div>
          <button
            onClick={() => {
              onClose();
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
          className="w-full flex-1 min-h-[200px] px-4 py-3 bg-panel text-sm font-mono text-text border border-line/70 rounded-2xl focus:border-info focus:outline-none focus:ring-0 resize-none"
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
              onClose();
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
    </div>,
    document.body
  );
};

export default ImportDialog;
