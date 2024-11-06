import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { useResizeObserver, useDebounceCallback } from 'usehooks-ts';
import './tooltip.css';

interface BoxPlotData {
  category: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
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

export default function PerformanceBoxPlot() {
  const [boxData, setBoxData] = useState<BoxPlotData[]>([]);
  const boxPlotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ComponentSize>({ width: 0, height: 0 });
  const margin: Margin = { top: 40, right: 20, bottom: 80, left: 80 };

  const onResize = useDebounceCallback((size: ComponentSize) => setSize(size), 200);
  useResizeObserver({ ref: boxPlotRef, onResize });

  useEffect(() => {
    const dataFromCSV = async () => {
      try {
        const csvData = await d3.csv('../../data/student-mat.csv', d => ({
          category: d.studytime, // Example: Study time
          value: +d.G3, // Final grade
        }));

        const groupedData = d3.groups(csvData, d => d.category);

        const processedData = groupedData.map(([category, values]) => {
          const sortedValues = values.map(d => d.value).sort(d3.ascending);
          const min = d3.min(sortedValues) ?? 0;
          const q1 = d3.quantile(sortedValues, 0.25) ?? 0;
          const median = d3.median(sortedValues) ?? 0;
          const q3 = d3.quantile(sortedValues, 0.75) ?? 0;
          const max = d3.max(sortedValues) ?? 0;

          return { category, min, q1, median, q3, max };
        });

        setBoxData(processedData.sort((a, b) => +a.category - +b.category));
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    };
    dataFromCSV();
  }, []);

  useEffect(() => {
    if (boxData.length === 0 || size.width === 0) return;
    d3.select('#boxplot-svg').selectAll('*').remove();
    initChart();
  }, [boxData, size]);

  function initChart() {
    const chartContainer = d3.select('#boxplot-svg');
    const xCategories = boxData.map(d => d.category);

    const xScale = d3.scaleBand().domain(xCategories).range([margin.left, size.width - margin.right]).padding(0.2);
    const yScale = d3.scaleLinear().domain([0, d3.max(boxData, d => d.max) ?? 0]).nice().range([size.height - margin.bottom, margin.top]);

    chartContainer.append('g')
      .attr('transform', `translate(0,${size.height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    
    chartContainer.append('text')
      .attr('x', (size.width + margin.left - margin.right) / 2)
      .attr('y', size.height - margin.bottom + 40)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Study Time Hour');
    
    chartContainer.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(size.height + margin.top - margin.bottom) / 2)
      .attr('y', margin.left - 50)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Final Grade');

    chartContainer.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden');

    const boxGroups = chartContainer.selectAll('.box')
      .data(boxData)
      .enter().append('g')
      .attr('class', 'box')
      .attr('transform', d => `translate(${xScale(d.category) as number},0)`);

    boxGroups.append('rect')
      .attr('x', -xScale.bandwidth() / 4)
      .attr('width', xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.q3))
      .attr('height', d => yScale(d.q1) - yScale(d.q3))
      .attr('fill', 'steelblue')
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);

    // Median line with hover functionality for median information
    boxGroups.append('line')
      .attr('x1', -xScale.bandwidth() / 4)
      .attr('x2', xScale.bandwidth() / 4)
      .attr('y1', d => yScale(d.median))
      .attr('y2', d => yScale(d.median))
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .on('mouseover', (event, d) => {
        tooltip
          .style('visibility', 'visible')
          .html(`<strong>Median:</strong> ${d.median}`);
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    boxGroups.append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', d => yScale(d.min))
      .attr('y2', d => yScale(d.max))
      .attr('stroke', 'black');

    boxGroups.append('line')
      .attr('x1', -xScale.bandwidth() / 6)
      .attr('x2', xScale.bandwidth() / 6)
      .attr('y1', d => yScale(d.min))
      .attr('y2', d => yScale(d.min))
      .attr('stroke', 'black');

    boxGroups.append('line')
      .attr('x1', -xScale.bandwidth() / 6)
      .attr('x2', xScale.bandwidth() / 6)
      .attr('y1', d => yScale(d.max))
      .attr('y2', d => yScale(d.max))
      .attr('stroke', 'black');

    function handleMouseOver(event, d) {
      d3.select(event.currentTarget).attr('fill', 'darkorange');
      tooltip
        .style('visibility', 'visible')
        .html(`
          <strong>Category:</strong> ${d.category}<br/>
          <strong>Min:</strong> ${d.min}<br/>
          <strong>Q1:</strong> ${d.q1}<br/>
          <strong>Median:</strong> ${d.median}<br/>
          <strong>Q3:</strong> ${d.q3}<br/>
          <strong>Max:</strong> ${d.max}
        `);
    }

    function handleMouseOut() {
      d3.select(this).attr('fill', 'steelblue');
      tooltip.style('visibility', 'hidden');
    }

    chartContainer.on('mousemove', (event) => {
      tooltip
        .style('top', `${event.pageY - 10}px`)
        .style('left', `${event.pageX + 10}px`);
    });
  }

  return (
    <div ref={boxPlotRef} className="chart-container">
      <svg id="boxplot-svg" width="100%" height={500}></svg>
    </div>
  );
}