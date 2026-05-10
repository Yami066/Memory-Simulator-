import { getApp } from '../utils/algorithms.js';

export default function PageTable({ frames, pageTable }) {
  const entries = Object.entries(pageTable).map(([pageStr, frameIdx]) => {
    const page = parseInt(pageStr);
    const app = getApp(page);
    const valid = frames[frameIdx] === page;
    return { page, app, frameIdx, valid };
  });

  return (
    <table className="w-full border-collapse font-mono text-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
      <thead>
        <tr style={{ background: '#F4F1EC' }}>
          <th className="text-xs font-bold uppercase tracking-wider px-4 py-3 text-left" style={{ color: '#6B6560', border: '1px solid #E2DDD6' }}>App</th>
          <th className="text-xs font-bold uppercase tracking-wider px-4 py-3 text-center" style={{ color: '#6B6560', border: '1px solid #E2DDD6' }}>Frame</th>
          <th className="text-xs font-bold uppercase tracking-wider px-4 py-3 text-center" style={{ color: '#6B6560', border: '1px solid #E2DDD6' }}>Valid</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(({ page, app, frameIdx, valid }) => (
          <tr
            key={page}
            className="transition-colors"
            style={{ background: '#FFFFFF' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F4F1EC'}
            onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
          >
            <td className="px-4 py-2.5 font-bold text-left" style={{ color: app?.color || '#2D6A4F', border: '1px solid #E2DDD6' }}>
              {app && <app.Icon size={14} className="inline mr-2 align-middle" />}
              {app?.name || 'P' + page}
            </td>
            <td className="px-4 py-2.5 text-center font-mono" style={{ color: '#1A1A1A', border: '1px solid #E2DDD6' }}>
              F{frameIdx}
            </td>
            <td className="px-4 py-2.5 text-center text-lg" style={{ color: valid ? '#27AE60' : '#E74C3C', border: '1px solid #E2DDD6' }}>
              {valid ? '●' : '○'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
