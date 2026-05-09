import { getApp } from '../utils/algorithms.js';

export default function PageTable({ frames, pageTable }) {
  const entries = Object.entries(pageTable).map(([pageStr, frameIdx]) => {
    const page = parseInt(pageStr);
    const app = getApp(page);
    const valid = frames[frameIdx] === page;
    return { page, app, frameIdx, valid };
  });

  return (
    <table className="w-full border-collapse font-mono">
      <thead>
        <tr>
          <th className="border border-white/[0.08] bg-white/[0.04] text-[var(--win-text-secondary)] text-[10px] px-1.5 py-1">App</th>
          <th className="border border-white/[0.08] bg-white/[0.04] text-[var(--win-text-secondary)] text-[10px] px-1.5 py-1">Frame</th>
          <th className="border border-white/[0.08] bg-white/[0.04] text-[var(--win-text-secondary)] text-[10px] px-1.5 py-1">Valid</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(({ page, app, frameIdx, valid }) => (
          <tr key={page}>
            <td className="border border-white/[0.08] text-[10px] px-1.5 py-0.5 text-center font-semibold" style={{ color: app?.color || '#818cf8' }}>
              {app && <app.Icon size={10} className="inline mr-1" />}
              {app?.name || 'P' + page}
            </td>
            <td className="border border-white/[0.08] text-[10px] px-1.5 py-0.5 text-center">F{frameIdx}</td>
            <td className="border border-white/[0.08] text-[13px] px-1.5 py-0.5 text-center" style={{ color: valid ? 'var(--color-hit)' : 'var(--color-miss)' }}>
              {valid ? '●' : '○'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
