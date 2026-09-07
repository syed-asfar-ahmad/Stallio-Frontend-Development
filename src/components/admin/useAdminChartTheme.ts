import { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';

export function useAdminChartTheme() {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';

  return useMemo(
    () => ({
      isDark,
      grid: isDark ? '#3f3f46' : '#e7e5e4',
      tick: isDark ? '#a1a1aa' : '#78716c',
      axis: isDark ? '#52525b' : '#d6d3d1',
      tooltip: {
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        border: `1px solid ${isDark ? '#3f3f46' : '#e7e5e4'}`,
        borderRadius: '12px',
        color: isDark ? '#fafafa' : '#1c1917',
        boxShadow: isDark
          ? '0 10px 15px -3px rgb(0 0 0 / 0.45)'
          : '0 10px 15px -3px rgb(0 0 0 / 0.08)',
      } as React.CSSProperties,
      tooltipLabel: isDark ? '#fafafa' : '#44403c',
      areaCursor: { stroke: isDark ? '#3f3f46' : '#e7e5e4', strokeWidth: 1, strokeDasharray: '4 4' },
      barCursor: {
        fill: isDark ? 'rgba(91, 69, 229, 0.18)' : 'rgba(63, 52, 186, 0.12)',
      },
      barFill: isDark ? '#b8adf5' : '#5b45e5',
      activeBar: { fill: '#2f2184', stroke: '#b8adf5', strokeWidth: 1 },
    }),
    [isDark],
  );
}
