import type { RiskLevel } from '../types';

interface RiskMeta {
  label: string;
  dot: string;
  badge: string;
}

export const RISK_META: Record<RiskLevel, RiskMeta> = {
  safe: {
    label: '안전',
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  caution: {
    label: '주의',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  danger: {
    label: '위험',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
};

interface RiskBadgeProps {
  risk: RiskLevel;
  size?: 'sm' | 'lg';
}

function RiskBadge({ risk, size = 'sm' }: RiskBadgeProps) {
  const meta = RISK_META[risk];
  const sizing =
    size === 'lg' ? 'text-base px-3 py-1.5 gap-2' : 'text-xs px-2 py-1 gap-1.5';
  const dotSize = size === 'lg' ? 'h-2.5 w-2.5' : 'h-2 w-2';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${meta.badge} ${sizing}`}
    >
      <span className={`rounded-full ${meta.dot} ${dotSize}`} />
      {meta.label}
    </span>
  );
}

export default RiskBadge;
