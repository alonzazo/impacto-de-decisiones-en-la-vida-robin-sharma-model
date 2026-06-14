/**
 * Interactive stacked horizontal bar for priority distribution.
 * Drag borders between segments to redistribute values.
 * Total is always preserved (zero-sum redistribution).
 */
import React, { useRef, useCallback } from 'react';
import type { Priorities, WealthDimension } from '../types/simulation';
import { DIMENSION_COLORS, DIMENSION_NAMES } from '../constants/model';

interface Props {
  priorities: Priorities;
  onChange?: (p: Priorities) => void;
  height?: number;
}

const DIMS: WealthDimension[] = ['crecimiento', 'bienestar', 'familia', 'trabajo', 'dinero', 'comunidad', 'aventura', 'servicio'];
const HANDLE_WIDTH = 8;
const MIN_VALUE = 1;

export const StackedBar: React.FC<Props> = ({ priorities, onChange, height = 22 }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const total = DIMS.reduce((sum, d) => sum + (priorities[d] || 0), 0) || 1;
  const isEditable = !!onChange;

  const handleDrag = useCallback((handleIndex: number, e: React.MouseEvent) => {
    if (!onChange || !barRef.current) return;
    e.preventDefault();

    const bar = barRef.current;
    const barRect = bar.getBoundingClientRect();
    const barWidth = barRect.width;

    const leftDim = DIMS[handleIndex];
    const rightDim = DIMS[handleIndex + 1];
    const startX = e.clientX;
    const startLeft = priorities[leftDim];
    const startRight = priorities[rightDim];
    const combined = startLeft + startRight;

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dValue = (dx / barWidth) * total;

      let newLeft = Math.round(startLeft + dValue);
      newLeft = Math.max(MIN_VALUE, Math.min(combined - MIN_VALUE, newLeft));
      const newRight = combined - newLeft;

      onChange({
        ...priorities,
        [leftDim]: newLeft,
        [rightDim]: newRight,
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [priorities, onChange, total]);

  return (
    <div
      ref={barRef}
      style={{
        display: 'flex',
        width: '100%',
        height,
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: 2,
        marginBottom: 2,
        position: 'relative',
      }}
    >
      {DIMS.map((dim, i) => {
        const pct = ((priorities[dim] || 0) / total) * 100;
        if (pct < 0.5) return null;
        return (
          <React.Fragment key={dim}>
            <div
              title={`${DIMENSION_NAMES[dim]}: ${(priorities[dim] || 0)} (${pct.toFixed(0)}%)`}
              style={{
                width: `${pct}%`,
                background: DIMENSION_COLORS[dim],
                opacity: 0.85,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: pct > 10 ? '7px' : '0',
                color: '#0f0f23',
                fontWeight: 700,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                transition: 'none',
                position: 'relative',
              }}
            >
              {pct > 14 ? DIMENSION_NAMES[dim].slice(0, 3) : pct > 10 ? DIMENSION_NAMES[dim][0] : ''}
            </div>
            {/* Draggable handle between segments */}
            {isEditable && i < DIMS.length - 1 && (
              <div
                onMouseDown={e => handleDrag(i, e)}
                style={{
                  width: HANDLE_WIDTH,
                  marginLeft: -HANDLE_WIDTH / 2,
                  marginRight: -HANDLE_WIDTH / 2,
                  height: '100%',
                  cursor: 'col-resize',
                  zIndex: 10,
                  position: 'relative',
                  background: 'transparent',
                }}
              >
                <div style={{
                  position: 'absolute',
                  left: HANDLE_WIDTH / 2 - 1,
                  top: 2,
                  bottom: 2,
                  width: 2,
                  background: 'rgba(255,255,255,0.4)',
                  borderRadius: 1,
                }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
