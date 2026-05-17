import { randomUUID } from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ANALYSIS_PROMPT } from '../prompts/analysisPrompt';
import type { AnalysisData, Issue, RiskLevel, RuleCode } from '../types';

/** Gemini가 이미지를 정상적인 근로계약서로 처리하지 못한 경우 (사용자 입력 오류). */
export class AnalysisRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnalysisRejectedError';
  }
}

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const RULE_CODES: readonly RuleCode[] = [
  'LABOR_MIN_WAGE',
  'LABOR_NO_BREAK',
  'LABOR_NO_WEEKLY_PAY',
  'LABOR_PENALTY',
  'LABOR_REQUIRED_TERMS',
];
const RISK_LEVELS: readonly RiskLevel[] = ['safe', 'caution', 'danger'];

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
  }
  if (!client) {
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

/** 근로계약서 이미지를 분석한다. 거부 시 AnalysisRejectedError, 그 외 실패는 Error. */
export async function analyzeContract(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<AnalysisData> {
  const model = getClient().getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: { responseMimeType: 'application/json', temperature: 0 },
  });

  let rawText: string;
  try {
    const result = await model.generateContent([
      { text: ANALYSIS_PROMPT },
      { inlineData: { data: imageBuffer.toString('base64'), mimeType } },
    ]);
    rawText = result.response.text();
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`Gemini API 호출에 실패했습니다: ${detail}`);
  }

  if (!rawText || !rawText.trim()) {
    throw new Error('Gemini가 빈 응답을 반환했습니다.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(rawText));
  } catch {
    throw new Error('Gemini 응답을 JSON으로 파싱하지 못했습니다.');
  }

  if (isRecord(parsed) && typeof parsed.error === 'string') {
    throw new AnalysisRejectedError(parsed.error);
  }

  return normalize(parsed);
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function isRuleCode(value: unknown): value is RuleCode {
  return typeof value === 'string' && (RULE_CODES as readonly string[]).includes(value);
}

function isRiskLevel(value: unknown): value is RiskLevel {
  return typeof value === 'string' && (RISK_LEVELS as readonly string[]).includes(value);
}

function toIssue(raw: Record<string, unknown>): Issue | null {
  if (!isRuleCode(raw.ruleCode)) {
    return null;
  }
  return {
    id: randomUUID(),
    ruleCode: raw.ruleCode,
    riskLevel: isRiskLevel(raw.riskLevel) ? raw.riskLevel : 'caution',
    title: asString(raw.title),
    detectedText: asString(raw.detectedText),
    explanation: asString(raw.explanation),
    legalBasis: asString(raw.legalBasis),
    recommendedAction: asString(raw.recommendedAction),
  };
}

function deriveRisk(issues: Issue[]): RiskLevel {
  if (issues.some((i) => i.riskLevel === 'danger')) return 'danger';
  if (issues.some((i) => i.riskLevel === 'caution')) return 'caution';
  return 'safe';
}

function defaultScore(risk: RiskLevel): number {
  if (risk === 'danger') return 85;
  if (risk === 'caution') return 50;
  return 10;
}

/** Gemini의 원본 JSON을 검증·보정하여 안전한 AnalysisData로 변환한다. */
function normalize(raw: unknown): AnalysisData {
  const obj = isRecord(raw) ? raw : {};

  const issues: Issue[] = (Array.isArray(obj.issues) ? obj.issues : [])
    .filter(isRecord)
    .map(toIssue)
    .filter((i): i is Issue => i !== null);

  const overallRisk: RiskLevel = isRiskLevel(obj.overallRisk)
    ? obj.overallRisk
    : deriveRisk(issues);

  const score = Number(obj.riskScore);
  const riskScore = Number.isFinite(score)
    ? Math.min(100, Math.max(0, Math.round(score)))
    : defaultScore(overallRisk);

  const requiredMissing = (Array.isArray(obj.requiredMissing) ? obj.requiredMissing : [])
    .filter((s): s is string => typeof s === 'string');

  return {
    overallRisk,
    riskScore,
    summary: asString(obj.summary),
    issues,
    requiredMissing,
  };
}
