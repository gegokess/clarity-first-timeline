/**
 * LogoUpload Component
 * Drag & Drop + File Picker für Logo-Upload
 */

import React, { useRef, useState } from 'react';

interface LogoUploadProps {
  logo?: {
    dataUrl: string;
    width: number;
    height: number;
  };
  onLogoChange: (logo: { dataUrl: string; width: number; height: number } | undefined) => void;
}

const MAX_FILE_SIZE = 500 * 1024; // 500KB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

const LogoUpload: React.FC<LogoUploadProps> = ({ logo, onLogoChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Nur PNG, JPG und SVG Dateien sind erlaubt');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Datei zu groß (max. 500KB)');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        onLogoChange({
          dataUrl,
          width: img.width,
          height: img.height,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    onLogoChange(undefined);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {!logo ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-info bg-info/10 scale-105'
              : 'border-border hover:border-info hover:bg-info/5'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            className="w-12 h-12 mx-auto mb-3 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm font-medium text-text mb-1">
            Logo hochladen
          </p>
          <p className="text-xs text-text-muted">
            Drag & Drop oder klicken • PNG, JPG, SVG • Max. 500KB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.svg"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-border rounded-xl p-4 bg-panel">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-24 h-24 bg-white rounded-lg flex items-center justify-center border border-border p-2">
              <img
                src={logo.dataUrl}
                alt="Logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text mb-1">Logo hochgeladen</p>
              <p className="text-xs text-text-muted mb-3">
                {logo.width} × {logo.height} px
              </p>
              <button
                onClick={handleRemove}
                className="text-xs font-medium text-error hover:text-error/80 transition-colors"
              >
                Entfernen
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-xs text-error bg-error/10 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default LogoUpload;
