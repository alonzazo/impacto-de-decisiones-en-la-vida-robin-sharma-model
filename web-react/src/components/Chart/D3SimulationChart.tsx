/**
 * D3-powered simulation chart with SVG rendering.
 * Same interface as SimulationChart but uses D3 for full visual control.
 * NOTE: Remove ts-nocheck after running `npm install d3 @types/d3`
 */
// @ts-nocheck
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { SimulationHistory, WealthDimension } from '../../types/simulation';
import type { MonteCarloBands } from '../../engine/monteCarlo';
import { WEALTH_DIMENSIONS, DIMENSION_COLORS, DIMENSION_NAMES } from '../../constants/model';

interface Props {
  history: SimulationHistory;
  showExito: boolean;
  mcBands?: MonteCarloBands | null;
}

const MARGIN = { top: 30, right: 80, bottom: 40, left: 55 };

export const D3SimulationChart: React.FC<Props> = ({ history, showExito, mcBands }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 450 });
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  // Responsive resize
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: Math.max(400, width), h: Math.max(300, height) });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // D3 rendering
  useEffect(() => {
    if (!svgRef.current || !history.ages.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const w = dims.w;
    const h = dims.h;
    const iw = w - MARGIN.left - MARGIN.right;
    const ih = h - MARGIN.top - MARGIN.bottom;

    // Background
    svg.append('rect').attr('width', w).attr('height', h).attr('fill', '#0f0f23');

    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(history.ages) as [number, number])
      .range([0, iw]);

    const yScale = d3.scaleLinear().domain([0, 100]).range([ih, 0]);

    const maxNW = Math.max(...history.netWorth, 1);
    const y1Scale = d3.scaleLinear()
      .domain([Math.min(0, ...history.netWorth), Math.ceil(maxNW / 10000) * 10000])
      .range([ih, 0]);

    // Grid lines
    g.append('g').attr('class', 'grid')
      .selectAll('line')
      .data(yScale.ticks(5))
      .join('line')
      .attr('x1', 0).attr('x2', iw)
      .attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
      .attr('stroke', '#2a2a4a').attr('stroke-opacity', 0.4);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${ih})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat(d => String(Math.floor(d as number))))
      .call(ax => ax.selectAll('text').attr('fill', '#c8d6e5').attr('font-size', '10px'))
      .call(ax => ax.selectAll('line,path').attr('stroke', '#2a2a4a'));

    // X label
    g.append('text').attr('x', iw / 2).attr('y', ih + 35).attr('text-anchor', 'middle')
      .attr('fill', '#c8d6e5').attr('font-size', '11px').text('Edad');

    // Y left axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .call(ax => ax.selectAll('text').attr('fill', '#c8d6e5').attr('font-size', '10px'))
      .call(ax => ax.selectAll('line,path').attr('stroke', '#2a2a4a'));
    g.append('text').attr('transform', 'rotate(-90)').attr('x', -ih / 2).attr('y', -42)
      .attr('text-anchor', 'middle').attr('fill', '#c8d6e5').attr('font-size', '11px').text('Índice (0-100)');

    // Y right axis
    g.append('g')
      .attr('transform', `translate(${iw},0)`)
      .call(d3.axisRight(y1Scale).ticks(5).tickFormat(d => `$${((d as number) / 1e3).toFixed(0)}K`))
      .call(ax => ax.selectAll('text').attr('fill', '#ffd700').attr('font-size', '10px'))
      .call(ax => ax.selectAll('line,path').attr('stroke', '#ffd70040'));
    g.append('text')
      .attr('x', iw + 55).attr('y', ih / 2)
      .attr('transform', `rotate(90, ${iw + 55}, ${ih / 2})`)
      .attr('text-anchor', 'middle').attr('fill', '#ffd700').attr('font-size', '11px').text('Patrimonio ($)');

    // Data points array
    const dataPoints = history.ages.map((age, i) => ({ age, i }));

    // Line generator
    const lineGen = (accessor: (i: number) => number) =>
      d3.line<{ age: number; i: number }>()
        .x(d => xScale(d.age))
        .y(d => yScale(accessor(d.i)))
        .curve(d3.curveMonotoneX);

    // ── Monte Carlo bands ──
    if (mcBands && mcBands.ages.length) {
      const mcPoints = mcBands.ages.map((age, i) => ({ age, i }));

      // P5-P95 band
      const areaOuter = d3.area<{ age: number; i: number }>()
        .x(d => xScale(d.age))
        .y0(d => yScale(mcBands.p5[d.i]))
        .y1(d => yScale(mcBands.p95[d.i]))
        .curve(d3.curveMonotoneX);

      g.append('path').datum(mcPoints)
        .attr('d', areaOuter)
        .attr('fill', '#9b59b6').attr('fill-opacity', 0.08);

      // P25-P75 band
      const areaInner = d3.area<{ age: number; i: number }>()
        .x(d => xScale(d.age))
        .y0(d => yScale(mcBands.p25[d.i]))
        .y1(d => yScale(mcBands.p75[d.i]))
        .curve(d3.curveMonotoneX);

      g.append('path').datum(mcPoints)
        .attr('d', areaInner)
        .attr('fill', '#9b59b6').attr('fill-opacity', 0.15);

      // Median line
      g.append('path').datum(mcPoints)
        .attr('d', lineGen(i => mcBands.p50[i])(mcPoints))
        .attr('fill', 'none')
        .attr('stroke', '#9b59b6').attr('stroke-width', 2)
        .attr('stroke-dasharray', '6,4').attr('stroke-opacity', 0.7);
    }

    // ── Event annotations (staggered vertically to avoid overlap) ──
    const yLevels = [0.05, 0.25, 0.45, 0.65, 0.85]; // fraction of chart height
    history.events.forEach((event, ei) => {
      const x = xScale(event.age);
      if (x < 0 || x > iw) return;
      const yFrac = yLevels[ei % yLevels.length];
      const labelY = ih * yFrac;

      // Full-height vertical dashed line
      g.append('line')
        .attr('x1', x).attr('x2', x).attr('y1', 0).attr('y2', ih)
        .attr('stroke', '#ffffff').attr('stroke-opacity', 0.25)
        .attr('stroke-width', 1).attr('stroke-dasharray', '4,4');

      // Label background for readability
      const shortText = event.text.length > 18 ? event.text.slice(0, 16) + '…' : event.text;
      g.append('text')
        .attr('x', x + 4).attr('y', labelY + 3)
        .attr('fill', '#c8d6e5').attr('font-size', '7.5px').attr('opacity', 0.8)
        .text(`${event.icon} ${shortText}`);
    });

    // ── Wealth dimension lines ──
    for (const dim of WEALTH_DIMENSIONS) {
      if (hidden.has(dim)) continue;
      const color = DIMENSION_COLORS[dim];
      const opacity = showExito ? 0.3 : 1;

      g.append('path')
        .datum(dataPoints)
        .attr('d', lineGen(i => history.wealth[dim][i]))
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', showExito ? 1.2 : 2)
        .attr('stroke-opacity', opacity)
        .attr('class', `line-${dim}`);
    }

    // ── EXITO index ──
    if (showExito && !hidden.has('exito')) {
      g.append('path')
        .datum(dataPoints)
        .attr('d', lineGen(i => history.wealthIndex[i]))
        .attr('fill', 'none')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '3,3');
    }

    // ── Patrimonio Neto (right axis) ──
    if (!hidden.has('patrimonio')) {
      const nwLine = d3.line<{ age: number; i: number }>()
        .x(d => xScale(d.age))
        .y(d => y1Scale(history.netWorth[d.i]))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(dataPoints)
        .attr('d', nwLine)
        .attr('fill', 'none')
        .attr('stroke', '#ffd700')
        .attr('stroke-width', 2.5)
        .attr('stroke-dasharray', '8,4');
    }

    // ── Interactive tooltip ──
    const tooltipLine = g.append('line')
      .attr('y1', 0).attr('y2', ih)
      .attr('stroke', '#ffffff').attr('stroke-opacity', 0)
      .attr('stroke-width', 1).attr('stroke-dasharray', '2,2');

    const tooltipG = g.append('g').attr('opacity', 0);
    const tooltipBg = tooltipG.append('rect')
      .attr('fill', '#1a1a3ef0').attr('rx', 6).attr('stroke', '#00d2ff40');
    const tooltipText = tooltipG.append('text')
      .attr('fill', '#c8d6e5').attr('font-size', '10px');

    const overlay = g.append('rect')
      .attr('width', iw).attr('height', ih).attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    overlay.on('mousemove', function (event) {
      const [mx] = d3.pointer(event);
      const age = xScale.invert(mx);
      const idx = d3.bisector((d: { age: number }) => d.age).left(dataPoints, age);
      const i = Math.min(idx, dataPoints.length - 1);
      const x = xScale(history.ages[i]);

      tooltipLine.attr('x1', x).attr('x2', x).attr('stroke-opacity', 0.3);

      const lines: string[] = [`Edad: ${history.ages[i].toFixed(1)}`];
      for (const dim of WEALTH_DIMENSIONS) {
        if (hidden.has(dim)) continue;
        lines.push(`${DIMENSION_NAMES[dim]}: ${history.wealth[dim][i].toFixed(1)}`);
      }
      if (showExito) lines.push(`EXITO: ${history.wealthIndex[i].toFixed(1)}`);
      lines.push(`Patrimonio: $${(history.netWorth[i] / 1e3).toFixed(1)}K`);
      if (mcBands && mcBands.p50[i] != null) {
        lines.push(`MC P50: ${mcBands.p50[i].toFixed(1)} | P25-P75: ${mcBands.p25[i].toFixed(1)}-${mcBands.p75[i].toFixed(1)}`);
      }

      tooltipText.selectAll('tspan').remove();
      lines.forEach((line, li) => {
        tooltipText.append('tspan')
          .attr('x', 8).attr('dy', li === 0 ? 14 : 13)
          .text(line);
      });

      const bbox = (tooltipText.node() as SVGTextElement).getBBox();
      tooltipBg.attr('width', bbox.width + 16).attr('height', bbox.height + 10);

      const tx = x + 15 + bbox.width + 16 > iw ? x - bbox.width - 30 : x + 15;
      tooltipG.attr('transform', `translate(${tx},${Math.max(0, ih / 2 - bbox.height / 2)})`).attr('opacity', 1);
    });

    overlay.on('mouseleave', () => {
      tooltipLine.attr('stroke-opacity', 0);
      tooltipG.attr('opacity', 0);
    });

    // ── Legend ──
    const legendG = svg.append('g').attr('transform', `translate(${MARGIN.left + 5},8)`);
    const allItems: { key: string; label: string; color: string }[] = [
      ...WEALTH_DIMENSIONS.map(d => ({ key: d, label: DIMENSION_NAMES[d], color: DIMENSION_COLORS[d] })),
      { key: 'exito', label: 'EXITO', color: '#ffffff' },
      { key: 'patrimonio', label: 'Patrimonio', color: '#ffd700' },
    ];
    if (mcBands) allItems.push({ key: 'mc', label: 'MC Bands', color: '#9b59b6' });

    const colsPerRow = Math.max(1, Math.floor(iw / 78));
    allItems.forEach((item, i) => {
      const col = i % colsPerRow;
      const row = Math.floor(i / colsPerRow);
      const ig = legendG.append('g')
        .attr('transform', `translate(${col * 78},${row * 14})`)
        .attr('cursor', 'pointer')
        .attr('opacity', hidden.has(item.key) ? 0.3 : 1)
        .on('click', () => {
          setHidden(prev => {
            const next = new Set(prev);
            if (next.has(item.key)) next.delete(item.key);
            else next.add(item.key);
            return next;
          });
        });

      ig.append('rect').attr('width', 10).attr('height', 3).attr('y', 5).attr('fill', item.color).attr('rx', 1);
      ig.append('text').attr('x', 13).attr('y', 9).attr('fill', '#c8d6e5').attr('font-size', '8px').text(item.label);
    });

  }, [history, showExito, mcBands, dims, hidden]);

  return (
    <div ref={containerRef} className="chart-container" style={{ position: 'relative' }}>
      <svg ref={svgRef} width={dims.w} height={dims.h} style={{ display: 'block' }} />
    </div>
  );
};
