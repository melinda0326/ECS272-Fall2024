import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';

interface LineChartData {
  studyTime: number;
  grade: number;
  group: string;
}

interface ComponentSize {
  width: number;
  height: number;
}

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export default function InteractiveLineChart() {
  const [data, setData] = useState<LineChartData[]>([]);
  const [filteredData, setFilteredData] = useState<LineChartData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ComponentSize>({ width: 0, height: 0 });
  const margin: Margin = { top: 40, right: 20, bottom: 80, left: 80 };

  const onResize = useDebounceCallback((size: ComponentSize) => setSize(size), 200);
  useResizeObserver({ ref: chartRef, onResize });

  useEffect(() => {
    const dataFromCSV = async () => {
      try {
        const csvData = await d3.csv('../../data/student-mat.csv', d => ({
          studyTime: +d.studytime,
          grade: +d.G3,
          group: d.sex,
        }));
        setData(csvData as LineChartData[]);
        setFilteredData(csvData as LineChartData[]);
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    };
    dataFromCSV();
  }, []);

  useEffect(() => {
    const filtered = selectedGroup ? data.filter(d => d.group === selectedGroup) : data;
    setFilteredData(filtered);
  }, [data, selectedGroup]);

  useEffect(() => {
    if (filteredData.length === 0 || size.width === 0) return;
    d3.select('#linechart-svg').selectAll('*').remove();
    initChart();
  }, [filteredData, size]);

  function initChart() {
    const svg = d3.select('#linechart-svg');

    const xScale = d3.scaleLinear().domain([1, 4]).range([margin.left, size.width - margin.right]);
    const yScale = d3.scaleLinear().domain([0, 20]).range([size.height - margin.bottom, margin.top]);
    
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const line = d3.line<LineChartData>()
      .x(d => xScale(d.studyTime))
      .y(d => yScale(d.grade));

    const groupedData = d3.group(filteredData, d => d.group);

    svg.append('g')
      .attr('transform', `translate(0,${size.height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(4));

    svg.append('text')
      .attr('x', (size.width + margin.left - margin.right) / 2)
      .attr('y', size.height - margin.bottom / 3)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Study Time Hour');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(size.height - margin.top - margin.bottom) / 2)
      .attr('y', margin.left / 3)
      .attr('dy', '-1em')
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Final Grade');

    groupedData.forEach((values, key) => {
      svg.append('path')
        .datum(values)
        .attr('fill', 'none')
        .attr('stroke', colorScale(key) as string)
        .attr('stroke-width', 2)
        .attr('d', line);
    });
  }

  return (
    <div ref={chartRef} className="chart-container">
      <div>
        <label htmlFor="groupFilter">Filter by Group: </label>
        <select
          id="groupFilter"
          value={selectedGroup ?? ''}
          onChange={(e) => setSelectedGroup(e.target.value || null)}
        >
          <option value="">All</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
      </div>
      <svg id="linechart-svg" width="100%" height={500}></svg>
    </div>
  );
}