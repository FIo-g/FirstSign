import type { AnalysisData } from '../types';
import RiskBadge, { RISK_META } from './RiskBadge';
import ClauseCard from './ClauseCard';

interface AnalysisResultProps {
  data: AnalysisData;
  imageUrl: string;
}

function AnalysisResult({ data, imageUrl }: AnalysisResultProps) {
  const meta = RISK_META[data.overallRisk];

  return (
    <div className="grid gap-6 md:grid-cols-[300px_1fr]">
      {/* 업로드 이미지 미리보기 */}
      <div className="md:sticky md:top-6 md:self-start">
        <p className="mb-2 text-sm font-semibold text-slate-500">업로드한 계약서</p>
        <img
          src={imageUrl}
          alt="업로드한 근로계약서"
          className="w-full rounded-lg border border-slate-200 shadow-sm"
        />
      </div>

      {/* 분석 결과 */}
      <div>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-800">종합 진단</h2>
            <RiskBadge risk={data.overallRisk} size="lg" />
          </div>

          <p className="mt-3 text-slate-700">{data.summary}</p>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-500">위험 점수</span>
              <span className="font-bold text-slate-800">{data.riskScore} / 100</span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${meta.dot}`}
                style={{ width: `${Math.min(100, Math.max(0, data.riskScore))}%` }}
              />
            </div>
          </div>
        </section>

        {data.requiredMissing.length > 0 && (
          <section className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="font-bold text-amber-800">누락된 필수 기재사항</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {data.requiredMissing.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-sm text-amber-800"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-4">
          <h3 className="mb-2 font-bold text-slate-800">
            검출된 위험 조항 ({data.issues.length}건)
          </h3>
          {data.issues.length === 0 ? (
            <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              5가지 검증 규칙에 해당하는 위험 조항이 발견되지 않았습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {data.issues.map((issue) => (
                <ClauseCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </section>

        <p className="mt-4 text-xs text-slate-400">
          본 결과는 5가지 객관적 규칙에 따른 참고용 분석이며, 법적 효력을 갖는 자문이
          아닙니다.
        </p>
      </div>
    </div>
  );
}

export default AnalysisResult;
