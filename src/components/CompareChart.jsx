import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { silentRun } from '../utils/algorithms.js';
import s from '../styles/mica.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function CompareChart({ show, refString, frameCount, onClose }) {
  const data = useMemo(() => {
    if (!refString.length) return [0, 0, 0, 0];
    const rs = [...refString];
    const fc = Math.max(1, Math.min(6, frameCount));
    return [
      silentRun(rs, fc, 'FIFO'),
      silentRun(rs, fc, 'LRU'),
      silentRun(rs, fc, 'MRU'),
      silentRun(rs, fc, 'OPT'),
    ];
  }, [refString, frameCount, show]);

  const chartData = {
    labels: ['FIFO', 'LRU', 'MRU', 'Optimal'],
    datasets: [{
      label: 'Page Faults',
      data,
      backgroundColor: ['#3b82f6', '#818cf8', '#f97316', '#22c55e'],
      borderWidth: 0,
      borderRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: refString.length + 1,
        ticks: { color: '#64748b', stepSize: 1, precision: 0 },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      x: {
        ticks: { color: '#e2e8f0', font: { family: 'Inter' } },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: c => 'Faults: ' + c.raw } },
    },
  };

  const plugins = [{
    id: 'datalabels',
    afterDatasetsDraw(chart) {
      const meta = chart.getDatasetMeta(0);
      const ctx = chart.ctx;
      ctx.save();
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e2e8f0';
      meta.data.forEach((bar, i) => {
        ctx.fillText(chart.data.datasets[0].data[i], bar.x, bar.y - 8);
      });
      ctx.restore();
    },
  }];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className={`${s.chartOverlay} fixed bottom-[calc(var(--taskbar-h)+12px)] left-1/2 -translate-x-1/2 z-20 rounded-lg p-3.5 w-[min(480px,90vw)]`}
        >
          <button
            onClick={onClose}
            className="absolute top-1.5 right-2.5 bg-transparent border-none text-[var(--win-text-secondary)] text-[15px] cursor-pointer hover:text-[var(--color-miss)] transition-colors"
          >
            <X size={15} />
          </button>
          <h3 className="text-[10px] text-[var(--win-text-secondary)] uppercase tracking-[1.5px] mb-1.5">
            Algorithm Comparison
          </h3>
          <div className="w-full h-[180px]">
            <Bar data={chartData} options={chartOptions} plugins={plugins} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
