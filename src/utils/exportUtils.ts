/**
 * Enhanced Export Utilities
 * Gemeinsame Logik für PDF/PNG Exporte mit Branding
 */

import type { ExportSettings, ColorScheme } from '../types/ExportTypes';

/**
 * Bereitet die Timeline für den Export vor
 * Aktiviert Print-Mode und wartet auf Rendering
 */
export async function prepareExportView(): Promise<void> {
  document.body.classList.add('print-mode');
  
  // Event dispatchen für Print-Mode
  window.dispatchEvent(new CustomEvent('print-mode-change', { detail: { active: true } }));
  
  // Warte kurz für Rendering
  await new Promise(resolve => setTimeout(resolve, 200));
}

/**
 * Stellt normale Ansicht wieder her
 */
export function restoreNormalView(): void {
  document.body.classList.remove('print-mode');
  window.dispatchEvent(new CustomEvent('print-mode-change', { detail: { active: false } }));
}

/**
 * Rendert SVG-Header mit Logo und Projekttitel
 */
export function renderSVGHeader(
  svg: SVGElement,
  settings: ExportSettings,
  projectName: string,
  svgWidth: number
): void {
  const headerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  headerGroup.setAttribute('id', 'export-header');

  let yOffset = 20;

  // Logo, falls vorhanden
  if (settings.branding.logo) {
    const logo = settings.branding.logo;
    const maxLogoHeight = 60;
    const scale = Math.min(1, maxLogoHeight / logo.height);
    const scaledWidth = logo.width * scale;
    const scaledHeight = logo.height * scale;

    let xPos = 40;
    if (logo.position === 'center') {
      xPos = (svgWidth - scaledWidth) / 2;
    } else if (logo.position === 'right') {
      xPos = svgWidth - scaledWidth - 40;
    }

    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', logo.dataUrl);
    image.setAttribute('x', xPos.toString());
    image.setAttribute('y', yOffset.toString());
    image.setAttribute('width', scaledWidth.toString());
    image.setAttribute('height', scaledHeight.toString());
    headerGroup.appendChild(image);

    yOffset += scaledHeight + 20;
  }

  // Projekttitel
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', (svgWidth / 2).toString());
  title.setAttribute('y', yOffset.toString());
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('font-size', '24');
  title.setAttribute('font-weight', 'bold');
  title.setAttribute('fill', settings.branding.colorScheme.primary);
  title.textContent = projectName;
  headerGroup.appendChild(title);

  // Insert at beginning of SVG
  if (svg.firstChild) {
    svg.insertBefore(headerGroup, svg.firstChild);
  } else {
    svg.appendChild(headerGroup);
  }
}

/**
 * Rendert Legende
 */
export function renderLegend(
  svg: SVGElement,
  settings: ExportSettings,
  yPosition: number,
  svgWidth: number
): void {
  if (!settings.showLegend) return;

  const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  legendGroup.setAttribute('id', 'export-legend');
  legendGroup.setAttribute('transform', `translate(${svgWidth - 250}, ${yPosition})`);

  // Hintergrund
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('x', '0');
  bg.setAttribute('y', '0');
  bg.setAttribute('width', '220');
  bg.setAttribute('height', '140');
  bg.setAttribute('fill', '#ffffff');
  bg.setAttribute('stroke', '#e5e7eb');
  bg.setAttribute('stroke-width', '1');
  bg.setAttribute('rx', '8');
  legendGroup.appendChild(bg);

  // Titel
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', '10');
  title.setAttribute('y', '25');
  title.setAttribute('font-size', '14');
  title.setAttribute('font-weight', 'bold');
  title.setAttribute('fill', '#1f2937');
  title.textContent = 'LEGENDE';
  legendGroup.appendChild(title);

  // Legende-Items
  const items = [
    { y: 50, color: settings.branding.colorScheme.primary, text: 'Arbeitspaket (manuell)' },
    { y: 70, color: settings.branding.colorScheme.accent, text: 'Arbeitspaket (auto)' },
    { y: 90, color: settings.branding.colorScheme.neutral, text: 'Unterarbeitspaket' },
    { y: 110, color: settings.branding.colorScheme.milestone, text: 'Meilenstein', shape: 'diamond' },
  ];

  items.forEach(item => {
    if (item.shape === 'diamond') {
      // Diamond for milestone
      const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      diamond.setAttribute('points', '20,${item.y} 25,${item.y - 5} 30,${item.y} 25,${item.y + 5}');
      diamond.setAttribute('fill', item.color);
      legendGroup.appendChild(diamond);
    } else {
      // Rectangle for packages
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', '10');
      rect.setAttribute('y', (item.y - 8).toString());
      rect.setAttribute('width', '20');
      rect.setAttribute('height', '12');
      rect.setAttribute('fill', item.color);
      rect.setAttribute('rx', '2');
      legendGroup.appendChild(rect);
    }

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', '40');
    label.setAttribute('y', (item.y + 4).toString());
    label.setAttribute('font-size', '12');
    label.setAttribute('fill', '#4b5563');
    label.textContent = item.text;
    legendGroup.appendChild(label);
  });

  svg.appendChild(legendGroup);
}

/**
 * Wendet Farbschema auf Timeline-SVG an
 */
export function applyColorScheme(svg: SVGElement, colorScheme: ColorScheme): void {
  // Arbeitspaket-Balken (manual mode)
  const manualBars = svg.querySelectorAll('[data-type="wp-manual"]');
  manualBars.forEach(bar => {
    bar.setAttribute('fill', colorScheme.primary);
  });

  // Arbeitspaket-Balken (auto mode)
  const autoBars = svg.querySelectorAll('[data-type="wp-auto"]');
  autoBars.forEach(bar => {
    bar.setAttribute('fill', colorScheme.accent);
  });

  // Unterarbeitspakete
  const subBars = svg.querySelectorAll('[data-type="sp"]');
  subBars.forEach(bar => {
    bar.setAttribute('fill', colorScheme.neutral);
  });

  // Meilensteine
  const milestones = svg.querySelectorAll('[data-type="milestone"]');
  milestones.forEach(ms => {
    ms.setAttribute('fill', colorScheme.milestone);
  });
}

/**
 * Erfasst Timeline als hochauflösendes Bild
 */
export async function captureTimelineAsImage(scale: number = 2): Promise<string> {
  const { toPng } = await import('html-to-image');
  
  const svgElement = document.getElementById('gantt-chart-svg');
  if (!svgElement) {
    throw new Error('Timeline SVG nicht gefunden');
  }

  const dataUrl = await toPng(svgElement, {
    quality: 1.0,
    pixelRatio: scale,
    backgroundColor: '#ffffff',
    skipFonts: true, // Skip external fonts to avoid CORS errors
    cacheBust: true, // Prevent caching issues
  });

  return dataUrl;
}
