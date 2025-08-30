
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { BenchmarkData, HistoryEntry } from '../types';

interface RadarChartProps {
  results: BenchmarkData[];
  history: HistoryEntry[];
}

const normalize = (value: number, min: number, max: number): number => {
  if (max === min) return 1;
  return (value - min) / (max - min);
};

export const RadarChart: React.FC<RadarChartProps> = ({ results, history }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // FIX: Moved getQualityForResponse outside of useEffect to make it accessible to the component's render logic.
  const getQualityForResponse = (response: string): number => {
    const historyEntry = history.find(h => h.response === response);
    return historyEntry?.quality || 0;
  }

  useEffect(() => {
    if (!chartRef.current || results.length === 0) return;

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // --- Data Processing for Chart ---
    const dataWithQuality = results.map(r => ({
      ...r,
      quality: getQualityForResponse(r.response)
    })).filter(r => r.quality > 0); // Only chart rated models

    if (dataWithQuality.length < 1) return; // Need at least 1 rated model to draw a chart

    // Invert metrics where lower is better
    const invertedData = dataWithQuality.map(r => ({
      ...r,
      speed: 1 / r.time,
      costEfficiency: r.cost > 0 ? 1 / r.cost : 1 / 0.00001, // Avoid division by zero
      conciseness: 1 / r.tokens.output
    }));

    // Find max values for normalization
    const maxSpeed = Math.max(...invertedData.map(r => r.speed));
    const maxCost = Math.max(...invertedData.map(r => r.costEfficiency));
    const maxConciseness = Math.max(...invertedData.map(r => r.conciseness));
    
    // Create datasets
    const datasets = invertedData.map((r, index) => {
      const color = ['#22d3ee', '#f87171', '#a78bfa'][index % 3]; // cyan, red, violet
      return {
        label: r.model.name,
        data: [
          normalize(r.speed, 0, maxSpeed),
          normalize(r.costEfficiency, 0, maxCost),
          normalize(r.quality, 0, 5), // Quality is 0-5
          normalize(r.conciseness, 0, maxConciseness),
        ],
        fill: true,
        backgroundColor: color.replace(')', ', 0.2)'),
        borderColor: color,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: color
      };
    });


    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Tốc độ', 'Hiệu quả Chi phí', 'Chất lượng', 'Ngắn gọn'],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
            grid: { color: 'rgba(255, 255, 255, 0.2)' },
            pointLabels: {
              color: '#cbd5e1', // text-slate-300
              font: {
                size: 14,
              }
            },
            ticks: {
              color: '#1f2937', // bg-gray-800 to hide text
              backdropColor: 'rgba(0, 0, 0, 0.5)',
              stepSize: 0.25
            },
            min: 0,
            max: 1,
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#e5e7eb' // text-gray-200
            }
          }
        }
      }
    });

  }, [results, history]);

  const ratedResultsCount = results.map(r => getQualityForResponse(r.response)).filter(q => q > 0).length;

  if (ratedResultsCount === 0) {
      return <p className="text-center text-gray-400">Vui lòng đánh giá chất lượng của ít nhất một mô hình để xem biểu đồ so sánh.</p>;
  }


  return (
    <div className="relative h-96">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};
