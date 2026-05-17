import type { AnalysisData, AnalyzeResponse } from '../types';

/** 백엔드에 계약서 이미지를 보내 분석 결과를 받는다. 실패 시 Error를 throw. */
export async function analyzeContract(file: File): Promise<AnalysisData> {
  const formData = new FormData();
  formData.append('image', file);

  let res: Response;
  try {
    res = await fetch('/api/analyze', { method: 'POST', body: formData });
  } catch {
    throw new Error('서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.');
  }

  let body: AnalyzeResponse;
  try {
    body = (await res.json()) as AnalyzeResponse;
  } catch {
    throw new Error('서버 응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }

  if (!body.success || !body.data) {
    throw new Error(body.error || '분석에 실패했습니다.');
  }

  return body.data;
}
