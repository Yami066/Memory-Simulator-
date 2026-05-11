import { getApp } from '../utils/algorithms.js';

export default function PageTable({ frames, pageTable }) {
  const entries = Object.entries(pageTable).map(([pageStr, frameIdx]) => {
    const page = parseInt(pageStr);
    const app = getApp(page);
    const valid = frames[frameIdx] === page;
    return { page, app, frameIdx, valid };
  });

  return (
    <div className="rounded-none overflow-hidden border border-[var(--win-border)] bg-[linear-gradient(180deg,rgba(26,34,54,0.96),rgba(20,28,46,0.98))] shadow-[0_16px_40px_rgba(0,0,0,0.24)]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--win-border)]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--win-text-secondary)] font-bold">Page table</p>
          <p className="text-sm text-[var(--win-text-secondary)] mt-1">Current mapping between active pages and frames</p>
        </div>
        <div className="text-[10px] uppercase tracking-[0.28em] text-[var(--win-text-secondary)] font-bold">{entries.length} entries</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-sm">
          <thead>
            <tr style={{ background: 'rgba(30,45,61,0.8)' }}>
              <th className="text-xs font-bold uppercase tracking-wider px-4 py-3 text-left" style={{ color: 'var(--win-text-secondary)', borderBottom: '1px solid var(--win-border)' }}>App</th>
              <th className="text-xs font-bold uppercase tracking-wider px-4 py-3 text-center" style={{ color: 'var(--win-text-secondary)', borderBottom: '1px solid var(--win-border)' }}>Frame</th>
              <th className="text-xs font-bold uppercase tracking-wider px-4 py-3 text-center" style={{ color: 'var(--win-text-secondary)', borderBottom: '1px solid var(--win-border)' }}>Valid</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(({ page, app, frameIdx, valid }, index) => (
              <tr
                key={page}
                className="transition-colors"
                style={{ background: index % 2 === 0 ? 'rgba(20,28,46,0.95)' : 'rgba(16,23,39,0.95)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,45,61,0.95)'}
                onMouseLeave={e => e.currentTarget.style.background = index % 2 === 0 ? 'rgba(20,28,46,0.95)' : 'rgba(16,23,39,0.95)'}
              >
                <td className="px-4 py-3 font-bold text-left" style={{ color: app?.color || 'var(--win-accent)', borderTop: '1px solid var(--win-border)' }}>
                  <span className="inline-flex items-center gap-2">
                    {app && <app.Icon size={14} />}
                    <span>{app?.name || 'P' + page}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-mono" style={{ color: 'var(--win-text)', borderTop: '1px solid var(--win-border)' }}>
                  F{frameIdx}
                </td>
                <td className="px-4 py-3 text-center text-lg" style={{ color: valid ? 'var(--win-accent)' : '#ff6b6b', borderTop: '1px solid var(--win-border)' }}>
                  {valid ? '●' : '○'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
