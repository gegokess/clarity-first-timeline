/**
 * Enhanced PDF Export with jsPDF
 * Professional single-page PDF export with logo and branding
 */

import jsPDF from 'jspdf';
import type { ExportSettings } from '../types/ExportTypes';
import { prepareExportView, restoreNormalView, captureTimelineAsImage } from './exportUtils';

/**
 * Exportiert Timeline als hochwertiges PDF mit Branding
 */
export async function exportToPDFEnhanced(
  settings: ExportSettings,
  projectName: string
): Promise<void> {
  try {
    await prepareExportView();

    // Erstelle PDF im Querformat
    const pdf = new jsPDF({
      orientation: settings.orientation,
      unit: 'mm',
      format: settings.format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let yOffset = 15;

    // Logo hinzufügen
    if (settings.branding.logo) {
      const logo = settings.branding.logo;
      const maxLogoWidth = 60;
      const maxLogoHeight = 30;
      
      const scale = Math.min(
        maxLogoWidth / logo.width,
        maxLogoHeight / logo.height
      );
      const scaledWidth = logo.width * scale * 0.264583; // px to mm
      const scaledHeight = logo.height * scale * 0.264583;

      let xPos = 15;
      if (logo.position === 'center') {
        xPos = (pageWidth - scaledWidth) / 2;
      } else if (logo.position === 'right') {
        xPos = pageWidth - scaledWidth - 15;
      }

      pdf.addImage(
        logo.dataUrl,
        'PNG',
        xPos,
        yOffset,
        scaledWidth,
        scaledHeight
      );

      yOffset += scaledHeight + 10;
    }

    // Projekttitel
    pdf.setFontSize(20);
    pdf.setTextColor(settings.branding.colorScheme.primary);
    pdf.text(projectName, pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 12;

    // Timeline als Bild erfassen
    const timelineImage = await captureTimelineAsImage(3); // 3x für höhere Qualität

    // Berechne Timeline-Größe (maximal verfügbarer Platz)
    const availableHeight = pageHeight - yOffset - 10;
    const availableWidth = pageWidth - 30;

    // Timeline einfügen
    pdf.addImage(
      timelineImage,
      'PNG',
      15,
      yOffset,
      availableWidth,
      availableHeight,
      undefined,
      'FAST'
    );

    // Legende (falls aktiviert)
    if (settings.showLegend) {
      const legendX = pageWidth - 60;
      const legendY = yOffset + 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor('#1f2937');
      pdf.setFillColor('#ffffff');
      pdf.rect(legendX, legendY, 50, 40, 'FD');
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('LEGENDE', legendX + 3, legendY + 7);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      
      const items = [
        { y: 14, color: settings.branding.colorScheme.primary, text: 'AP (manuell)' },
        { y: 20, color: settings.branding.colorScheme.accent, text: 'AP (auto)' },
        { y: 26, color: settings.branding.colorScheme.neutral, text: 'UAP' },
        { y: 32, color: settings.branding.colorScheme.milestone, text: 'Meilenstein' },
      ];

      items.forEach(item => {
        pdf.setFillColor(item.color);
        pdf.rect(legendX + 3, legendY + item.y - 2, 4, 3, 'F');
        pdf.setTextColor('#4b5563');
        pdf.text(item.text, legendX + 9, legendY + item.y);
      });
    }

    // Filename mit Datum
    const filename = `${projectName.replace(/\s+/g, '-')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Fehler beim PDF-Export:', error);
    throw error;
  } finally {
    restoreNormalView();
  }
}

/**
 * Exportiert Timeline als hochauflösendes PNG mit Branding
 */
export async function exportToPNGEnhanced(
  settings: ExportSettings,
  projectName: string
): Promise<void> {
  try {
    await prepareExportView();

    // Capture mit höherer Auflösung
    const imageData = await captureTimelineAsImage(3);

    // Download
    const link = document.createElement('a');
    link.download = `${projectName.replace(/\s+/g, '-')}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = imageData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error('Fehler beim PNG-Export:', error);
    throw error;
  } finally {
    restoreNormalView();
  }
}

// Legacy exports for backwards compatibility
export function exportTimelineToPDF(): void {
  window.print();
}

export async function exportTimelineToPNG(): Promise<void> {
  const { toPng } = await import('html-to-image');
  
  const svgElement = document.getElementById('gantt-chart-svg');
  if (!svgElement) {
    throw new Error('Timeline SVG nicht gefunden');
  }

  const dataUrl = await toPng(svgElement, {
    quality: 1.0,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    skipFonts: true, // Skip external fonts to avoid CORS errors
    cacheBust: true,
  });

  const link = document.createElement('a');
  link.download = `gantt-chart-${new Date().toISOString().split('T')[0]}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function initPDFExport(): void {
  // Compatibility stub
}

export function cleanupPDFExport(): void {
  // Compatibility stub
}
