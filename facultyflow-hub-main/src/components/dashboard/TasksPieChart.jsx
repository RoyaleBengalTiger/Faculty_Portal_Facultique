import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

export const TasksPieChart = ({ tasks }) => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    // Calculate task counts
    const counts = {
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      overdue: tasks.filter(t => 
        new Date(t.dueAt) < new Date() && t.status !== 'COMPLETED'
      ).length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      submitted: tasks.filter(t => t.status === 'SUBMITTED').length,
    };

    // Filter out empty segments
    const segments = [
      { label: 'In Progress', count: counts.inProgress, color: 'hsl(224, 76%, 65%)' },
      { label: 'Overdue', count: counts.overdue, color: 'hsl(0, 72%, 58%)' },
      { label: 'Pending', count: counts.pending, color: 'hsl(42, 86%, 64%)' },
      { label: 'Completed', count: counts.completed, color: 'hsl(142, 71%, 45%)' },
      { label: 'Submitted', count: counts.submitted, color: 'hsl(264, 83%, 70%)' },
    ].filter(segment => segment.count > 0);

    const data = {
      labels: segments.map(s => s.label),
      datasets: [
        {
          label: 'Tasks',
          data: segments.map(s => s.count),
          backgroundColor: segments.map(s => s.color),
          borderColor: segments.map(s => s.color.replace('65%)', '55%)')),
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };

    setChartData(data);
  }, [tasks]);

  // Get computed CSS colors for consistent theming
  const getComputedColor = (cssVar) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const hslValues = computedStyle.getPropertyValue(cssVar).trim();
      return hslValues ? `hsl(${hslValues})` : '#000000';
    }
    return '#000000';
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Task Distribution (${tasks.length} Total)`,
        font: {
          size: 18,              // Increased font size
          weight: 'bold',
        },
        color: getComputedColor('--foreground'), // Use theme color
        padding: {
          top: 0,
          bottom: 20           // Increased padding
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,         // Increased padding
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 14,          // Increased font size
          },
          color: getComputedColor('--foreground'), // Use theme color
        },
      },
      tooltip: {
        backgroundColor: getComputedColor('--popover'),
        titleColor: getComputedColor('--popover-foreground'),
        bodyColor: getComputedColor('--popover-foreground'),
        borderColor: getComputedColor('--border'),
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          size: 14,            // Increased font size
        },
        bodyFont: {
          size: 13,            // Increased font size
        },
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1800,
      easing: 'easeInOutCubic',
      delay: (context) => {
        return context.dataIndex * 150;
      }
    },
    elements: {
      arc: {
        borderRadius: 4,
      }
    },
    rotation: -90,
    circumference: 360,
  };

  if (!chartData.datasets) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-96"> {/* Changed from h-80 to h-96 for much bigger size */}
      <Pie data={chartData} options={options} />
    </div>
  );
};
