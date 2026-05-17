import { useState } from 'react';
import UploadZone from './components/UploadZone';
import AnalysisResult from './components/AnalysisResult';
import { analyzeContract } from './api/client';
import type { AnalysisData } from './types';

type Status = 'idle' | 'loading' | 'done' | 'error';

function App() {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleFile(file: File) {
    const url = URL.createObjectURL(file);
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setStatus('loading');
    setResult(null);
    setErrorMsg('');

    try {
      const data = await analyzeContract(file);
      setResult(data);
      setStatus('done');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
      );
      setStatus('error');
    }
  }

  function handleReset() {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setResult(null);
    setErrorMsg('');
    setStatus('idle');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-xl font-bold text-slate-800">근로계약서 AI 검토</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            사인하기 전 30초, 내 권리를 확인하세요.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {status === 'idle' && <UploadZone onFile={handleFile} />}

        {status === 'loading' && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="mt-4 font-semibold text-slate-700">
              AI가 계약서를 검토하고 있어요…
            </p>
            <p className="mt-1 text-sm text-slate-500">
              보통 10~30초 정도 걸립니다.
            </p>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="업로드한 근로계약서"
                className="mt-6 max-h-64 rounded-lg border border-slate-200 shadow-sm"
              />
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="rounded-lg bg-red-50 px-4 py-3 text-red-700">
              {errorMsg}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              다시 시도하기
            </button>
          </div>
        )}

        {status === 'done' && result && imageUrl && (
          <div>
            <div className="mb-5 flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                다른 계약서 검토하기
              </button>
            </div>
            <AnalysisResult data={result} imageUrl={imageUrl} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
