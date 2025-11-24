import React, { useState, useEffect } from 'react';
import type { WorkPackage, SubPackage, Milestone } from '../types';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  title: string;
  initialData?: any;
  type: 'workPackage' | 'subPackage' | 'milestone';
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  initialData,
  type,
}) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({ ...initialData });
    } else {
      setFormData({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-panel rounded-2xl shadow-2xl w-full max-w-md border border-line/60 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-line/60 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-text">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Titel</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-panel-alt border border-line/60 rounded-lg text-text focus:border-info focus:outline-none"
              autoFocus
            />
          </div>

          {type === 'workPackage' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-text-muted">Modus:</label>
              <div className="flex gap-1 bg-panel-alt rounded-lg p-1 border border-line/60">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mode: 'auto' })}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    formData.mode === 'auto' ? 'bg-info text-white' : 'text-text-muted hover:text-text'
                  }`}
                >
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mode: 'manual' })}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    formData.mode === 'manual' ? 'bg-info text-white' : 'text-text-muted hover:text-text'
                  }`}
                >
                  Manuell
                </button>
              </div>
            </div>
          )}

          {(type === 'milestone' || (type === 'workPackage' && formData.mode === 'manual') || type === 'subPackage') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">
                  {type === 'milestone' ? 'Datum' : 'Start'}
                </label>
                <input
                  type="date"
                  value={type === 'milestone' ? (formData.date || '') : (formData.start || '')}
                  onChange={e => {
                    if (type === 'milestone') {
                      setFormData({ ...formData, date: e.target.value });
                    } else {
                      setFormData({ ...formData, start: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 bg-panel-alt border border-line/60 rounded-lg text-text focus:border-info focus:outline-none"
                />
              </div>
              {type !== 'milestone' && (
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Ende</label>
                  <input
                    type="date"
                    value={formData.end || ''}
                    onChange={e => setFormData({ ...formData, end: e.target.value })}
                    className="w-full px-3 py-2 bg-panel-alt border border-line/60 rounded-lg text-text focus:border-info focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-info hover:bg-info/90 text-white rounded-lg transition-colors shadow-lg shadow-info/20"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
