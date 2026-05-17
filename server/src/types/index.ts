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
