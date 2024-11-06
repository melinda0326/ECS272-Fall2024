import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';

interface HeatmapCell {
  categoryX: string;
  categoryY: string;
  value: number;
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

export default function InteractiveHeatmap() {
  const [cells, setCells] = useState<HeatmapCell[]>([]);
  const heatmapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ComponentSize>({ width: 0, height: 0 });
  const margin: Margin = { top: 40, right: 20, bottom: 80, left: 80 };

  const onResize = useDebounceCallback((size: ComponentSize) => setSize(size), 200);
  useResizeObserver({ ref: heatmapRef, onResize });

  useEffect(() => {
    const dataFromCSV = async () => {
      try {
        const csvData = await d3.csv('../../data/student-mat.csv', d => ({
          categoryX: d.G1, // Example: First Grade
          categoryY: d.G3, // Example: Final Grade
          value: +d.G3, // Final grade as value for heatmap coloring
        }));

        const valueCounts = d3.rollups(
          csvData,
          v => v.length,
          d => `${d.categoryX}-${d.categoryY}`
        );

        setCells(
          valueCounts.map(([key, value]) => {
            const [categoryX, categoryY] = key.split('-');
            return { categoryX, categoryY, value };
          })
        );
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    };
    dataFromCSV();
  }, []);

  useEffect(() => {
    if (cells.length === 0 || size.width === 0) return;
    d3.select('#heatmap-svg').selectAll('*').remove();
    initChart();
  }, [cells, size]);

  function initChart() {
    const chartContainer = d3.select('#heatmap-svg');

    // Sort xCategories and yCategories in ascending order
    const xCategories = Array.from(new Set(cells.map(d => d.categoryX))).sort((a, b) => +a - +b);
    const yCategories = Array.from(new Set(cells.map(d => d.categoryY))).sort((a, b) => +a - +b);

    const xScale = d3.scaleBand().domain(xCategories).range([margin.left, size.width - margin.right]).padding(0.05);
    const yScale = d3.scaleBand().domain(yCategories).range([size.height - margin.bottom, margin.top]).padding(0.05);

    const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(cells, d => d.value) ?? 0]);

    // Add axes
    chartContainer.append('g')
      .attr('transform', `translate(0,${size.height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    // X-axis label
    chartContainer.append('text')
      .attr('x', (size.width + margin.left - margin.right) / 2)
      .attr('y', size.height - margin.bottom / 3)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('G1');  // Change this to the actual label text

      
    chartContainer.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Y-axis label
    chartContainer.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(size.height - margin.top - margin.bottom) / 2)
      .attr('y', margin.left / 3)
      .attr('dy', '-1em')
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('G3');  

    // Add cells
    const cellGroup = chartContainer.append('g').selectAll('rect').data(cells).enter().append('rect')
      .attr('x', d => xScale(d.categoryX) as number)
      .attr('y', d => yScale(d.categoryY) as number)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .style('stroke', 'white')
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);

    // Tooltip div
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('padding', '5px')
      .style('border-radius', '5px');

    function handleMouseOver(event: any, d: HeatmapCell) {
      d3.select(event.currentTarget).style('stroke', 'black');
      tooltip.style('visibility', 'visible').text(`Number of students: ${d.value}`);
    }

    function handleMouseOut(event: any) {
      d3.select(event.currentTarget).style('stroke', 'white');
      tooltip.style('visibility', 'hidden');
    }

    chartContainer.on('mousemove', (event: any) => {
      tooltip
        .style('top', `${event.pageY - 10}px`)
        .style('left', `${event.pageX + 10}px`);
    });
  }

  return (
    <div ref={heatmapRef} className="chart-container">
      <svg id="heatmap-svg" width="100%" height={500}></svg>
    </div>
  );
}