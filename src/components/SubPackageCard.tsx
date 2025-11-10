/**
 * SubPackageCard Component
 * Moderne Card für UAPs mit Farbauswahl, Kategorie, Avataren
 * Basierend auf docs/03-Components.md und docs/05-DesignSystem.md
 */

import React, { useState, useRef, useEffect } from 'react';
import type { SubPackage } from '../types';
import { DEFAULT_COLORS } from '../types';
import { formatDate } from '../utils/dateUtils';

interface SubPackageCardProps {
  subPackage: SubPackage;
  onUpdate: (updates: Partial<SubPackage>) => void;
  onDelete: () => void;
}

const SubPackageCard: React.FC<SubPackageCardProps> = ({ subPackage, onUpdate, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(subPackage.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Schließe Menü bei Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

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

  const handleColorChange = (color: string) => {
    onUpdate({ color });
    setIsMenuOpen(false);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string): string => {
    // Generiere konsistente Farbe basierend auf Namen
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div
      className="bg-white rounded-md shadow-sm border border-border overflow-hidden flex h-full"
      style={{ minWidth: '200px' }}
    >
      {/* Farbiger Balken links */}
      <div
        className="w-1 flex-shrink-0"
        style={{ backgroundColor: subPackage.color || DEFAULT_COLORS[0] }}
      />

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col gap-2">
        {/* Header mit Titel und Drei-Punkt-Menü */}
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

          {/* Drei-Punkt-Menü */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="three-dot-menu p-1 hover:bg-surface rounded transition-colors"
              aria-label="Optionen"
            >
              <svg className="w-4 h-4 text-text-muted" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-md border border-border z-10 min-w-[160px]">
                {/* Farbauswahl */}
                <div className="p-3 border-b border-border">
                  <div className="text-xs font-medium text-text-muted mb-2">Farbe</div>
                  <div className="flex gap-2 flex-wrap">
                    {DEFAULT_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className="w-6 h-6 rounded-full border-2 border-white hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: color,
                          boxShadow: subPackage.color === color ? '0 0 0 2px var(--color-info)' : 'none',
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Löschen */}
                <button
                  onClick={() => {
                    if (confirm(`UAP "${subPackage.title}" wirklich löschen?`)) {
                      onDelete();
                    }
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-surface transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Löschen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Kategorie */}
        {subPackage.category && (
          <div className="text-xs text-text-muted">{subPackage.category}</div>
        )}

        {/* Datum-Bereich */}
        <div className="text-xs text-text-muted">
          {formatDate(subPackage.start, 'short')} - {formatDate(subPackage.end, 'short')}
        </div>

        {/* Zugewiesene Personen */}
        {subPackage.assignedTo && subPackage.assignedTo.length > 0 && (
          <div className="flex gap-1 mt-auto">
            {subPackage.assignedTo.map((person, idx) => (
              <div
                key={idx}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: getAvatarColor(person) }}
                title={person}
              >
                {getInitials(person)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubPackageCard;
