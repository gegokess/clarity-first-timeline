/**
 * Timeline Component
 * SVG-basierte Gantt-Chart-Visualisierung mit Drag & Drop und Resize
 * Basierend auf docs/05-DesignSystem.md
 */

import React, { useState, useRef, useMemo, useLayoutEffect } from 'react';
import type { WorkPackage, Milestone, ZoomLevel, SubPackage, ZoomPreset } from '../types';
import { ZOOM_CONFIGS, TIMELINE_CONSTANTS } from '../types';
import {
  daysBetween,
  addDays,
  today,
  formatDate,
  getWeekNumber,
  getMonthName,
  getQuarterString,
  clampDate,
  minDate,
  maxDate,
  fromISODate,
} from '../utils/dateUtils';
import { usePrintMode } from '../hooks/usePrintMode';

interface TimelineProps {
  workPackages: WorkPackage[];
  milestones: Milestone[];
  zoomLevel: ZoomLevel;
  clampingEnabled: boolean;
  projectStart?: string;
  projectEnd?: string;
  onUpdateSubPackage: (wpId: string, spId: string, updates: Partial<SubPackage>) => void;
  onUpdateMilestone?: (msId: string, updates: Partial<Milestone>) => void;
}

const PRINT_PALETTE = {
  background: '#FFFFFF',
  grid: '#C7CEDA',
  axis: '#1F2933',
  text: '#1F2933',
  metadata: '#5F6C7B',
  frameBorder: '#D4D7DE',
};

const COLOR_PALETTE = [
  { ap: '#1F4E79', sub: '#AEC9E6' },
  { ap: '#7C1F35', sub: '#F5B3C7' },
  { ap: '#135C5C', sub: '#9ED8D6' },
  { ap: '#6C3A00', sub: '#F3CDA8' },
  { ap: '#5A2E6D', sub: '#DAB9F0' },
  { ap: '#274653', sub: '#B6DCE2' },
  { ap: '#7A4605', sub: '#EBC8A2' },
  { ap: '#1C5B34', sub: '#B7E2CA' },
] as const;

const MILESTONE_COLORS = {
  ui: '#FACC15',
  print: '#DAA520',
} as const;

const PIXELS_PER_DAY: Record<ZoomPreset, number> = {
  month: 18,
  quarter: 12,
  year: 8,
};

const SHORT_MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

const formatShortMonth = (isoDate: string): string => {
  const date = fromISODate(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = SHORT_MONTHS[date.getMonth()];
  return `${day}. ${month}`;
};

const determinePreset = (level: ZoomLevel, spanDays: number): ZoomPreset => {
  if (level !== 'auto') return level;
  if (spanDays <= 160) return 'month';
  if (spanDays <= 320) return 'quarter';
  return 'year';
};

const Timeline: React.FC<TimelineProps> = ({
  workPackages,
  milestones,
  zoomLevel,
  clampingEnabled,
  projectStart,
  projectEnd,
  onUpdateSubPackage,
  onUpdateMilestone,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewWidth, setViewWidth] = useState(1200);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [dragState, setDragState] = useState<{
    type: 'move' | 'resize-left' | 'resize-right' | 'move-milestone';
    // Für UAPs
    wpId?: string;
    spId?: string;
    originalStart?: string;
    originalEnd?: string;
    currentStart?: string; // Temporärer Zustand während Drag
    currentEnd?: string;   // Temporärer Zustand während Drag
    // Für Meilensteine
    msId?: string;
    originalDate?: string;
    currentDate?: string;  // Temporärer Zustand während Drag
    // Gemeinsam
    startX: number;
  } | null>(null);

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setViewWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();

    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const timelineBounds = useMemo(() => {
    const dates: string[] = [];
    if (projectStart) dates.push(projectStart);
    if (projectEnd) dates.push(projectEnd);
    workPackages.forEach(wp => {
      dates.push(wp.start, wp.end);
      wp.subPackages.forEach(sp => dates.push(sp.start, sp.end));
    });
    milestones.forEach(ms => dates.push(ms.date));

    if (dates.length === 0) {
      const base = today();
      return { min: base, max: addDays(base, 30) };
    }

    return {
      min: minDate(...dates),
      max: maxDate(...dates),
    };
  }, [workPackages, milestones, projectStart, projectEnd]);

  const timelineSpanDays = Math.max(1, daysBetween(timelineBounds.min, timelineBounds.max));
  const isPrintMode = usePrintMode();
  const activePreset = determinePreset(zoomLevel, timelineSpanDays);
  const zoomConfig = ZOOM_CONFIGS[activePreset];

  const paddingDays = Math.max(zoomConfig.tickDays, 7);
  const effectiveViewStart = addDays(timelineBounds.min, -paddingDays);
  const effectiveViewEnd = addDays(timelineBounds.max, paddingDays);
  const effectiveViewDays = Math.max(1, daysBetween(effectiveViewStart, effectiveViewEnd));

  const density = PIXELS_PER_DAY[activePreset];
  const desiredWidth = effectiveViewDays * density + TIMELINE_CONSTANTS.PADDING_LEFT + TIMELINE_CONSTANTS.PADDING_RIGHT;
  const svgWidth = isPrintMode ? Math.max(desiredWidth, 640) : Math.max(viewWidth, desiredWidth);
  const availableWidth = svgWidth - TIMELINE_CONSTANTS.PADDING_LEFT - TIMELINE_CONSTANTS.PADDING_RIGHT;
  const dayPixel = availableWidth / effectiveViewDays;

  const {
    SUBBAR_HEIGHT,
    UAP_SPACING,
    ROW_PADDING,
    HEADER_HEIGHT: DEFAULT_HEADER_HEIGHT,
    PADDING_LEFT,
    PADDING_TOP,
    PADDING_BOTTOM,
    AP_LABEL_HEIGHT,
    AP_LABEL_SPACING,
    AP_PADDING_VERTICAL,
    MILESTONE_BOTTOM_OFFSET,
  } = TIMELINE_CONSTANTS;

  const subBarHeight = isPrintMode ? SUBBAR_HEIGHT - 6 : SUBBAR_HEIGHT;
  const apBarHeight = isPrintMode ? Math.max(6, subBarHeight * 0.45) : Math.max(10, subBarHeight * 0.6);
  const subStackSpacing = isPrintMode ? Math.max(4, UAP_SPACING - 4) : UAP_SPACING;
  const HEADER_HEIGHT = isPrintMode ? 50 : DEFAULT_HEADER_HEIGHT;

  const dateToX = (date: string): number => {
    const days = daysBetween(effectiveViewStart, date);
    return PADDING_LEFT + days * dayPixel;
  };

  const getBarGeometry = (start: string, end: string) => {
    const x = dateToX(start);
    const endX = dateToX(addDays(end, 1));
    return {
      x,
      width: Math.max(endX - x, 1),
    };
  };

  const getSubStackHeight = (wp: WorkPackage): number => {
    if (wp.subPackages.length === 0) return 0;
    return (
      wp.subPackages.length * subBarHeight +
      Math.max(0, wp.subPackages.length - 1) * subStackSpacing +
      AP_PADDING_VERTICAL * 2
    );
  };

  const getRowHeight = (wp: WorkPackage): number => {
    const stackHeight = getSubStackHeight(wp);
    const blockAbove = AP_LABEL_HEIGHT + AP_LABEL_SPACING + apBarHeight + AP_LABEL_SPACING;
    if (stackHeight === 0) {
      return blockAbove + ROW_PADDING;
    }
    return blockAbove + stackHeight + ROW_PADDING;
  };

  const getRowY = (wpIndex: number): number => {
    let y = HEADER_HEIGHT + PADDING_TOP;
    for (let i = 0; i < wpIndex; i++) {
      y += getRowHeight(workPackages[i]);
    }
    return y;
  };

  const totalHeight = useMemo(() => {
    const rowsHeight = workPackages.reduce((sum, wp) => sum + getRowHeight(wp), 0);
    return (
      HEADER_HEIGHT +
      PADDING_TOP +
      rowsHeight +
      PADDING_BOTTOM +
      MILESTONE_BOTTOM_OFFSET +
      60
    );
  }, [workPackages, HEADER_HEIGHT, PADDING_TOP, PADDING_BOTTOM, MILESTONE_BOTTOM_OFFSET, apBarHeight, subBarHeight, subStackSpacing]);

  const timeTicks = useMemo(() => {
    const ticks: { date: string; x: number; label: string }[] = [];
    const formatLabel = (date: string) => {
      switch (zoomConfig.format) {
        case 'day':
          return formatDate(date, 'short');
        case 'week':
          return getWeekNumber(date);
        case 'month':
          return getMonthName(date).slice(0, 3);
        case 'quarter':
        default:
          return getQuarterString(date);
      }
    };

    const pushTick = (date: string, withLabel = true) => {
      ticks.push({
        date,
        x: dateToX(date),
        label: withLabel ? formatLabel(date) : '',
      });
    };

    pushTick(effectiveViewStart, true);

    let nextDate = addDays(effectiveViewStart, zoomConfig.tickDays);
    let safety = 0;
    while (daysBetween(nextDate, effectiveViewEnd) > 0 && safety < 200) {
      pushTick(nextDate, true);
      nextDate = addDays(nextDate, zoomConfig.tickDays);
      safety += 1;
    }

    pushTick(effectiveViewEnd, false);

    return ticks;
  }, [effectiveViewStart, effectiveViewEnd, zoomConfig, dateToX]);

  const handleMouseDown = (
    e: React.MouseEvent,
    type: 'move' | 'resize-left' | 'resize-right' | 'move-milestone',
    idObj: { wpId?: string; spId?: string; msId?: string },
    initialData: { start?: string; end?: string; date?: string }
  ) => {
    e.stopPropagation();
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    setDragState({
      type,
      wpId: idObj.wpId,
      spId: idObj.spId,
      msId: idObj.msId,
      originalStart: initialData.start,
      originalEnd: initialData.end,
      currentStart: initialData.start,
      currentEnd: initialData.end,
      originalDate: initialData.date,
      currentDate: initialData.date,
      startX: e.clientX - svgRect.left,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState) return;

    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const currentX = e.clientX - svgRect.left;
    const deltaX = currentX - dragState.startX;
    const deltaDays = Math.round(deltaX / dayPixel);

    const { type } = dragState;

    if (type === 'move-milestone') {
      const { originalDate } = dragState;
      if (originalDate) {
        const newDate = addDays(originalDate, deltaDays);
        setDragState(prev => prev ? { ...prev, currentDate: newDate } : null);
      }
      return;
    }

    // UAP Logic
    const { wpId, originalStart, originalEnd } = dragState;
    if (!originalStart || !originalEnd) return;

    let newStart = originalStart;
    let newEnd = originalEnd;

    if (type === 'move') {
      newStart = addDays(originalStart, deltaDays);
      newEnd = addDays(originalEnd, deltaDays);
    } else if (type === 'resize-left') {
      newStart = addDays(originalStart, deltaDays);
      if (daysBetween(newStart, newEnd) < 1) {
        newStart = addDays(newEnd, -1);
      }
    } else if (type === 'resize-right') {
      newEnd = addDays(originalEnd, deltaDays);
      if (daysBetween(newStart, newEnd) < 1) {
        newEnd = addDays(newStart, 1);
      }
    }

    if (clampingEnabled && wpId) {
      const wp = workPackages.find(w => w.id === wpId);
      if (wp && wp.mode === 'manual') {
        newStart = clampDate(newStart, wp.start, wp.end);
        newEnd = clampDate(newEnd, wp.start, wp.end);
      }
    }

    // Update local drag state only, do not commit to parent yet
    setDragState(prev => prev ? { ...prev, currentStart: newStart, currentEnd: newEnd } : null);
  };

  const handleMouseUp = () => {
    if (!dragState) return;

    const { type, wpId, spId, msId, currentStart, currentEnd, currentDate } = dragState;

    if (type === 'move-milestone' && msId && currentDate && onUpdateMilestone) {
      onUpdateMilestone(msId, { date: currentDate });
    } else if (wpId && spId && currentStart && currentEnd) {
      onUpdateSubPackage(wpId, spId, { start: currentStart, end: currentEnd });
    }

    setDragState(null);
  };

  const svgElement = (
    <svg
      ref={svgRef}
      width={svgWidth}
      height={totalHeight}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="timeline-svg"
      id="gantt-chart-svg"
    >
      {/* Time Axis Header */}
      <g className="time-axis">
        <rect
          x={0}
          y={0}
          width={svgWidth}
          height={HEADER_HEIGHT}
          fill={isPrintMode ? PRINT_PALETTE.background : 'var(--color-panel)'}
        />
        {timeTicks.map(tick => (
          <g key={`tick-${tick.date}`}>
            <line
              x1={tick.x}
              y1={HEADER_HEIGHT}
              x2={tick.x}
              y2={totalHeight}
              stroke={isPrintMode ? PRINT_PALETTE.grid : 'var(--color-line)'}
              strokeWidth={isPrintMode ? 0.6 : 0.8}
              strokeDasharray={isPrintMode ? '2 6' : '4 6'}
            />
            {tick.label && (
              <text
                x={tick.x}
                y={HEADER_HEIGHT - 20}
                textAnchor="middle"
                fill={isPrintMode ? PRINT_PALETTE.metadata : 'var(--color-text-muted)'}
                fontSize={isPrintMode ? 11 : 12}
                fontWeight={isPrintMode ? 500 : 400}
              >
                {tick.label}
              </text>
            )}
          </g>
        ))}
        <line
          x1={0}
          y1={HEADER_HEIGHT}
          x2={svgWidth}
          y2={HEADER_HEIGHT}
          stroke={isPrintMode ? PRINT_PALETTE.axis : 'var(--color-line)'}
          strokeWidth={1}
        />
      </g>

      {/* Milestone lines */}
      {milestones.map(ms => {
        // Use dragged date if this milestone is being dragged
        const isDragging = dragState?.msId === ms.id;
        const displayDate = isDragging && dragState?.currentDate ? dragState.currentDate : ms.date;
        
        const msX = dateToX(displayDate);
        const milestoneColor = isPrintMode ? MILESTONE_COLORS.print : MILESTONE_COLORS.ui;
        return (
          <line
            key={`ms-line-${ms.id}`}
            x1={msX}
            y1={HEADER_HEIGHT}
            x2={msX}
            y2={totalHeight}
            stroke={milestoneColor}
            strokeWidth={isPrintMode ? 1.4 : 1.2}
            strokeDasharray={isPrintMode ? '3 6' : '4 4'}
            opacity={0.6}
          />
        );
      })}

      {/* Work Packages */}
      {workPackages.map((wp, wpIndex) => {
        const rowY = getRowY(wpIndex);
        const palette = COLOR_PALETTE[wpIndex % COLOR_PALETTE.length];
        const metadataColor = isPrintMode ? PRINT_PALETTE.metadata : 'var(--color-text-muted)';
        const labelColor = isPrintMode ? PRINT_PALETTE.text : 'var(--color-text)';
        const apLabelY = rowY + AP_LABEL_HEIGHT;
        const apBarY = rowY + AP_LABEL_HEIGHT + AP_LABEL_SPACING;
        const containerY = apBarY + apBarHeight + AP_LABEL_SPACING;
        const hasSubPackages = wp.subPackages.length > 0;

        const apInnerStart = hasSubPackages ? minDate(...wp.subPackages.map(sp => sp.start)) : wp.start;
        const apInnerEnd = hasSubPackages ? maxDate(...wp.subPackages.map(sp => sp.end)) : wp.end;
        const { x: apX, width: apWidth } = getBarGeometry(apInnerStart, apInnerEnd);
        const apCenterX = apX + apWidth / 2;
        const dateRangeLabel = `${formatShortMonth(apInnerStart)} – ${formatShortMonth(apInnerEnd)}`;

        return (
          <g key={wp.id} className="work-package-row">
            <rect
              x={apX}
              y={apBarY}
              width={apWidth}
              height={apBarHeight}
              fill={isPrintMode ? 'transparent' : palette.ap}
              fillOpacity={isPrintMode ? 0 : 0.65}
              stroke={palette.ap}
              strokeWidth={isPrintMode ? 1.4 : 1}
              rx={isPrintMode ? 3 : 10}
            />

            <text
              x={apCenterX}
              y={apLabelY}
              fill={labelColor}
              fontSize={isPrintMode ? 12 : 13}
              fontWeight={isPrintMode ? 700 : 600}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {wp.title}
            </text>
            <text
              x={apCenterX}
              y={apBarY + apBarHeight + 14}
              fill={metadataColor}
              fontSize={10}
              textAnchor="middle"
            >
              {dateRangeLabel}
            </text>

            {hasSubPackages &&
              wp.subPackages.map((sp, spIndex) => {
                const stackY =
                  containerY +
                  AP_PADDING_VERTICAL +
                  spIndex * (subBarHeight + subStackSpacing);
                
                // Use dragged values if this SP is being dragged
                const isDragging = dragState?.spId === sp.id;
                const displayStart = isDragging && dragState?.currentStart ? dragState.currentStart : sp.start;
                const displayEnd = isDragging && dragState?.currentEnd ? dragState.currentEnd : sp.end;

                const { x: spX, width: spWidth } = getBarGeometry(displayStart, displayEnd);
                const spLabelX = spX + spWidth + 14;
                const spCenterY = stackY + subBarHeight / 2;
                const subRangeLabel = `${formatShortMonth(displayStart)} – ${formatShortMonth(displayEnd)}`;

                return (
                  <g key={sp.id} className="sub-package">
                    <rect
                      x={spX}
                      y={stackY}
                      width={spWidth}
                      height={subBarHeight}
                      fill={palette.sub}
                      stroke={palette.ap}
                      strokeWidth={1}
                      rx={isPrintMode ? 3 : 8}
                      style={{ cursor: dragState ? 'grabbing' : 'grab' }}
                      onMouseDown={e => handleMouseDown(e, 'move', { wpId: wp.id, spId: sp.id }, { start: sp.start, end: sp.end })}
                      onMouseEnter={e => {
                        const rectBounds = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          x: rectBounds.right + 10,
                          y: rectBounds.top,
                          content: `${sp.title}
${formatDate(displayStart)} – ${formatDate(displayEnd)}`,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />

                    <text
                      x={spLabelX}
                      y={spCenterY - 6}
                      fill={palette.ap}
                      fontSize={11}
                      fontWeight={600}
                      dominantBaseline="middle"
                    >
                      {sp.title}
                    </text>
                    <text
                      x={spLabelX}
                      y={spCenterY + 8}
                      fill={metadataColor}
                      fontSize={10}
                      dominantBaseline="middle"
                    >
                      {subRangeLabel}
                    </text>

                    <rect
                      x={spX - 3}
                      y={stackY}
                      width={6}
                      height={subBarHeight}
                      fill="transparent"
                      style={{ cursor: 'ew-resize' }}
                      onMouseDown={e => handleMouseDown(e, 'resize-left', { wpId: wp.id, spId: sp.id }, { start: sp.start, end: sp.end })}
                      className="resize-handle"
                    />
                    <rect
                      x={spX + spWidth - 3}
                      y={stackY}
                      width={6}
                      height={subBarHeight}
                      fill="transparent"
                      style={{ cursor: 'ew-resize' }}
                      onMouseDown={e => handleMouseDown(e, 'resize-right', { wpId: wp.id, spId: sp.id }, { start: sp.start, end: sp.end })}
                      className="resize-handle"
                    />
                  </g>
                );
              })}
          </g>
        );
      })}

      {/* Milestone Markers */}
      {milestones.map(ms => {
        // Use dragged date if this milestone is being dragged
        const isDragging = dragState?.msId === ms.id;
        const displayDate = isDragging && dragState?.currentDate ? dragState.currentDate : ms.date;

        const msX = dateToX(displayDate);
        const markerY = totalHeight - MILESTONE_BOTTOM_OFFSET;
        const milestoneColor = isPrintMode ? MILESTONE_COLORS.print : MILESTONE_COLORS.ui;
        const milestoneLabel = ms.title;
        const milestoneDate = formatShortMonth(displayDate);

        return (
          <g key={ms.id} className="milestone" style={{ cursor: 'grab' }}>
            <path
              d={`M ${msX} ${markerY - 10} L ${msX + 10} ${markerY} L ${msX} ${markerY + 10} L ${msX - 10} ${markerY} Z`}
              fill={milestoneColor}
              stroke={milestoneColor}
              strokeWidth={isPrintMode ? 1.2 : 1.6}
              onMouseDown={e => handleMouseDown(e, 'move-milestone', { msId: ms.id }, { date: ms.date })}
            />

            <text
              x={msX + 14}
              y={markerY - 4}
              fill={milestoneColor}
              fontSize={isPrintMode ? 11 : 12}
              fontWeight={600}
            >
              {milestoneLabel}
            </text>
            <text
              x={msX + 14}
              y={markerY + 12}
              fill={milestoneColor}
              fontSize={10}
            >
              {milestoneDate}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <div
      ref={containerRef}
      className={`timeline-container flex-1 overflow-auto bg-surface ${dragState ? 'select-none cursor-grabbing' : ''}`}
      style={isPrintMode ? { backgroundColor: PRINT_PALETTE.background } : undefined}
    >
      {isPrintMode ? (
        <div style={{ padding: '10px 48px 40px', backgroundColor: PRINT_PALETTE.background }}>
          <div
            style={{
              border: `1px solid ${PRINT_PALETTE.frameBorder}`,
              borderRadius: 16,
              padding: '12px 32px 32px',
              background: PRINT_PALETTE.background,
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
            }}
          >
            {svgElement}
          </div>
        </div>
      ) : (
        svgElement
      )}

      {tooltip && (
        <div
          className={`fixed text-xs px-3 py-2 rounded-xl border border-line/70 shadow-lg whitespace-pre-line pointer-events-none z-50 ${
            isPrintMode ? 'bg-white text-[#333333]' : 'bg-panel-alt text-white'
          }`}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default Timeline;
