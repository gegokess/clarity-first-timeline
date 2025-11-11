/**
 * SubPackageCard Component
 * Card für UAPs mit Titel und Zeitraum
 * Basierend auf docs/03-Components.md und docs/05-DesignSystem.md
 */

import React, { useState, useRef, useEffect } from 'react';
import type { SubPackage } from '../types';
import { formatDate } from '../utils/dateUtils';

interface SubPackageCardProps {
  subPackage: SubPackage;
  onUpdate: (updates: Partial<SubPackage>) => void;
  onDelete: () => void;
}

const SubPackageCard: React.FC<SubPackageCardProps> = ({ subPackage, onUpdate, onDelete }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(subPackage.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auto-Focus bei Titel-Bearbeitung
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSave = () => {
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== subPackage.title) {
      onUpdate({ title: trimmed });
    } else {
      setTitleValue(subPackage.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitleValue(subPackage.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div
      className="bg-white rounded-md shadow-sm border border-border overflow-hidden h-full"
      style={{ minWidth: '200px' }}
    >
      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        {/* Header mit Titel und Papierkorb */}
        <div className="flex items-start justify-between gap-2">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              className="flex-1 text-sm font-medium text-text px-1 py-0.5 border border-info rounded focus:outline-none focus:ring-1 focus:ring-info"
            />
          ) : (
            <h4
              className="flex-1 text-sm font-medium text-text cursor-pointer hover:text-info transition-colors"
              onClick={() => setIsEditingTitle(true)}
              title="Klicken zum Bearbeiten"
            >
              {subPackage.title}
            </h4>
          )}

          {/* Delete Button */}
          <button
            onClick={() => {
              if (confirm(`UAP "${subPackage.title}" wirklich löschen?`)) {
                onDelete();
              }
            }}
            className="p-1 text-danger hover:bg-danger hover:bg-opacity-10 rounded transition-colors"
            aria-label="Löschen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Datum-Bereich */}
        <div className="text-xs text-text-muted">
          {formatDate(subPackage.start, 'short')} - {formatDate(subPackage.end, 'short')}
        </div>
      </div>
    </div>
  );
};

export default SubPackageCard;
