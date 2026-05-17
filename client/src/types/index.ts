export type RiskLevel = 'safe' | 'caution' | 'danger';

export type ContractType = 'labor' | 'lease' | 'service' | 'other';

export interface Issue {
  id: string;
  ruleCode: string;
  riskLevel: RiskLevel;
  title: string;
  detectedText: string;
  explanation: string;
  legalBasis: string;
  recommendedAction: string;
}

export interface AnalysisData {
  contractType: ContractType;
  overallRisk: RiskLevel;
  riskScore: number;
  summary: string;
  issues: Issue[];
  requiredMissing: string[];
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisData;
  error?: string;
}

export const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  labor: '근로계약서',
  lease: '주택 임대차계약서',
  service: '용역·프리랜서 계약서',
  other: '기타 계약서',
};
