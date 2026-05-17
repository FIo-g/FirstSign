import type { Issue } from '../types';
import RiskBadge, { RISK_META } from './RiskBadge';

interface ClauseCardProps {
  issue: Issue;
}

function ClauseCard({ issue }: ClauseCardProps) {
  const accent =
    issue.riskLevel === 'danger'
      ? 'border-l-red-500'
      : issue.riskLevel === 'caution'
        ? 'border-l-amber-500'
        : 'border-l-green-500';

  return (
    <article
      className={`rounded-lg border border-slate-200 border-l-4 ${accent} bg-white p-4 shadow-sm`}
    >
      <header className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-slate-800">{issue.title}</h3>
        <RiskBadge risk={issue.riskLevel} />
      </header>

      {issue.detectedText && (
        <blockquote className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600 italic">
          “{issue.detectedText}”
        </blockquote>
      )}

      <p className="mt-3 text-sm text-slate-700 leading-relaxed">
        {issue.explanation}
      </p>

      <dl className="mt-3 space-y-1.5 text-sm">
        {issue.legalBasis && (
          <div className="flex gap-2">
            <dt className="shrink-0 font-semibold text-slate-500">법령 근거</dt>
            <dd className="text-slate-700">{issue.legalBasis}</dd>
          </div>
        )}
        {issue.recommendedAction && (
          <div className="flex gap-2">
            <dt className="shrink-0 font-semibold text-slate-500">권장 행동</dt>
            <dd className="text-slate-700">{issue.recommendedAction}</dd>
          </div>
        )}
      </dl>

      <p className="mt-3 text-right text-xs text-slate-400">
        규칙 {issue.ruleCode} · {RISK_META[issue.riskLevel].label}
      </p>
    </article>
  );
}

export default ClauseCard;
