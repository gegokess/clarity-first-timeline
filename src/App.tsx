/**
 * App Component
 * Hauptkomponente mit Layout-Orchestrierung
 * Basierend auf docs/03-Components.md
 */

import React, { useState, useEffect } from 'react';
import { useProject } from './hooks/useProject';
import type { TimeResolution } from './types';
import Toolbar from './components/Toolbar';
import Timeline from './components/Timeline';
import ToastContainer from './components/ToastContainer';
import { exportTimelineToPDF, exportTimelineToPNG, initPDFExport, cleanupPDFExport } from './utils/pdfUtils';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

type Selection = {
  type: 'wp' | 'sp' | 'ms';
  id: string;
  parentId?: string; // For sub-packages
} | null;

const App: React.FC = () => {
  const {
    project,
    toasts,
    showToast,
    removeToast,
    updateProjectName,
    updateProjectDates,
    addWorkPackage,
    updateWorkPackage,
    deleteWorkPackage,
    addSubPackage,
    updateSubPackage,
    deleteSubPackage,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    exportToFile,
    copyToClipboard,
    importFromJSON,
    toggleWorkPackageCollapse,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useProject();

  const [timeResolution, setTimeResolution] = useState<TimeResolution>('month');
  const [pixelsPerDay, setPixelsPerDay] = useState(20);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [selection, setSelection] = useState<Selection>(null);

  // PDF Export initialisieren
  useEffect(() => {
    initPDFExport();
    return () => cleanupPDFExport();
  }, []);

  const handleDeleteSelection = () => {
    if (!selection) return;
    
    if (selection.type === 'wp') {
      if (confirm('Arbeitspaket löschen?')) {
        deleteWorkPackage(selection.id);
        setSelection(null);
      }
    } else if (selection.type === 'sp' && selection.parentId) {
      if (confirm('Unterarbeitspaket löschen?')) {
        deleteSubPackage(selection.parentId, selection.id);
        setSelection(null);
      }
    } else if (selection.type === 'ms') {
      if (confirm('Meilenstein löschen?')) {
        deleteMilestone(selection.id);
        setSelection(null);
      }
    }
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    // Undo
    {
      key: 'z',
      ctrl: true,
      handler: () => {
        if (canUndo) {
          undo();
          showToast('info', 'Rückgängig gemacht');
        }
      },
    },
    // Redo (Ctrl+Y)
    {
      key: 'y',
      ctrl: true,
      handler: () => {
        if (canRedo) {
          redo();
          showToast('info', 'Wiederhergestellt');
        }
      },
    },
    // Redo (Ctrl+Shift+Z)
    {
      key: 'z',
      ctrl: true,
      shift: true,
      handler: () => {
        if (canRedo) {
          redo();
          showToast('info', 'Wiederhergestellt');
        }
      },
    },
    // Zoom In (+)
    {
      key: '+',
      handler: () => setPixelsPerDay(prev => Math.min(prev * 1.2, 200)),
    },
    // Zoom Out (-)
    {
      key: '-',
      handler: () => setPixelsPerDay(prev => Math.max(prev / 1.2, 2)),
    },
    // Delete
    {
      key: 'Delete',
      handler: handleDeleteSelection,
    },
    // Backspace (same as Delete)
    {
      key: 'Backspace',
      handler: handleDeleteSelection,
    },
  ]);

  // Drag & Drop für JSON-Import
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          importFromJSON(text);
          showToast('success', 'Projekt erfolgreich importiert');
        }
      };
      reader.readAsText(file);
    } else {
      showToast('error', 'Bitte eine gültige JSON-Datei hochladen');
    }
  };

  const handleSelect = (type: 'wp' | 'sp' | 'ms', id: string, parentId?: string) => {
    setSelection({ type, id, parentId });
  };

  return (
    <div
      className="flex flex-col h-screen bg-bg text-text"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Toolbar */}
      <Toolbar
        projectName={project.name}
        onProjectNameChange={updateProjectName}
        projectStart={project.start}
        projectEnd={project.end}
        onProjectDatesChange={updateProjectDates}
        timeResolution={timeResolution}
        onTimeResolutionChange={setTimeResolution}
        pixelsPerDay={pixelsPerDay}
        onPixelsPerDayChange={setPixelsPerDay}
        onExportJSON={exportToFile}
        onImportJSON={() => document.getElementById('import-json')?.click()}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onCopyJSON={copyToClipboard}
        onExportPDF={exportTimelineToPDF}
        onExportPNG={async () => {
          try {
            await exportTimelineToPNG();
            showToast('success', 'Timeline als PNG exportiert');
          } catch (error) {
            showToast('error', 'Fehler beim PNG-Export');
          }
        }}
        onAddWorkPackage={addWorkPackage}
        onAddMilestone={addMilestone}
      />

      {/* Main Content */}
      <div 
        className="flex flex-1 overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(111,126,255,0.12),_transparent_45%)]"
        onClick={() => setSelection(null)}
      >
        {/* Timeline */}
        <Timeline
          workPackages={project.workPackages}
          milestones={project.milestones}
          timeResolution={timeResolution}
          pixelsPerDay={pixelsPerDay}
          clampingEnabled={project.settings.clampUapInsideManualAp}
          projectStart={project.start}
          projectEnd={project.end}
          onUpdateSubPackage={updateSubPackage}
          onUpdateMilestone={updateMilestone}
          onAddWorkPackage={addWorkPackage}
          onAddMilestone={addMilestone}
          onDeleteWorkPackage={deleteWorkPackage}
          onDeleteSubPackage={deleteSubPackage}
          onDeleteMilestone={deleteMilestone}
          onUpdateWorkPackage={updateWorkPackage}
          onAddSubPackage={addSubPackage}
          onToggleCollapse={toggleWorkPackageCollapse}
          selection={selection}
          onSelect={handleSelect}
        />
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Drag & Drop Overlay */}
      {isDraggingFile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-panel-alt rounded-3xl shadow-2xl p-8 border-2 border-dashed border-info/60 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-semibold text-info">JSON-Datei hier ablegen</p>
            <p className="text-sm text-text-muted mt-2">Wir importieren automatisch nach dem Upload</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
