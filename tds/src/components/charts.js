// ============================================
// TDS Charts Component (Chart.js Wrapper)
// ============================================
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Default chart styling for dark theme
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8',
        font: { family: "'Inter', sans-serif", size: 12 },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 8
      }
    },
    tooltip: {
      backgroundColor: '#151d32',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(59, 130, 246, 0.2)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      titleFont: { family: "'Inter', sans-serif", weight: '600' },
      bodyFont: { family: "'Inter', sans-serif" },
      displayColors: true,
      boxPadding: 4
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
      ticks: { color: '#64748b', font: { family: "'Inter', sans-serif", size: 11 } }
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
      ticks: { color: '#64748b', font: { family: "'Inter', sans-serif", size: 11 } }
    }
  }
};

/**
 * Create a delivery performance bar chart (estimated vs actual time)
 */
export function createPerformanceChart(canvasId, driversData) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: driversData.map(d => d.name.split(' ')[0]),
      datasets: [
        {
          label: 'Estimated (hrs)',
          data: driversData.map(d => d.estimated),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.7
        },
        {
          label: 'Actual (hrs)',
          data: driversData.map(d => d.actual),
          backgroundColor: 'rgba(16, 185, 129, 0.6)',
          borderColor: '#10b981',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.7
        }
      ]
    },
    options: {
      ...defaultOptions,
      plugins: {
        ...defaultOptions.plugins,
        title: { display: false }
      }
    }
  });
}

/**
 * Create on-time rate donut chart
 */
export function createOnTimeChart(canvasId, onTimeRate) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['On Time', 'Delayed'],
      datasets: [{
        data: [onTimeRate, 100 - onTimeRate],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.3)'],
        borderColor: ['#10b981', '#ef4444'],
        borderWidth: 2,
        cutout: '75%',
        spacing: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...defaultOptions.plugins,
        legend: { display: false },
      }
    },
    plugins: [{
      id: 'centerText',
      afterDraw(chart) {
        const { ctx: c, width, height } = chart;
        c.save();
        c.font = `bold 28px 'JetBrains Mono', monospace`;
        c.fillStyle = '#f1f5f9';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(`${onTimeRate}%`, width / 2, height / 2 - 8);
        c.font = `500 12px 'Inter', sans-serif`;
        c.fillStyle = '#64748b';
        c.fillText('On Time', width / 2, height / 2 + 16);
        c.restore();
      }
    }]
  });
}

/**
 * Create fuel efficiency line chart
 */
export function createFuelChart(canvasId, fuelData) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: fuelData.labels,
      datasets: [{
        label: 'Avg Fuel Level (%)',
        data: fuelData.values,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#0f1629',
        pointBorderWidth: 2,
        pointHoverRadius: 6
      }]
    },
    options: defaultOptions
  });
}

/**
 * Create distance area chart
 */
export function createDistanceChart(canvasId, distData) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: distData.labels,
      datasets: [{
        label: 'Distance (km)',
        data: distData.values,
        borderColor: '#8b5cf6',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return 'rgba(139, 92, 246, 0.1)';
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
          return gradient;
        },
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#0f1629',
        pointBorderWidth: 2
      }]
    },
    options: defaultOptions
  });
}

/**
 * Create driver rest compliance heatmap (as bar chart)
 */
export function createRestComplianceChart(canvasId, restData) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: restData.map(d => d.name.split(' ')[0]),
      datasets: [{
        label: 'Rest Compliance (%)',
        data: restData.map(d => d.compliance),
        backgroundColor: restData.map(d => {
          if (d.compliance >= 95) return 'rgba(16, 185, 129, 0.7)';
          if (d.compliance >= 85) return 'rgba(245, 158, 11, 0.7)';
          return 'rgba(239, 68, 68, 0.7)';
        }),
        borderColor: restData.map(d => {
          if (d.compliance >= 95) return '#10b981';
          if (d.compliance >= 85) return '#f59e0b';
          return '#ef4444';
        }),
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6
      }]
    },
    options: {
      ...defaultOptions,
      plugins: {
        ...defaultOptions.plugins,
        legend: { display: false }
      },
      scales: {
        ...defaultOptions.scales,
        y: {
          ...defaultOptions.scales.y,
          max: 100,
          min: 60
        }
      }
    }
  });
}
