export type RiskLevel = 'safe' | 'caution' | 'danger';

export type RuleCode =
  | 'LABOR_MIN_WAGE'
  | 'LABOR_NO_BREAK'
  | 'LABOR_NO_WEEKLY_PAY'
  | 'LABOR_PENALTY'
  | 'LABOR_REQUIRED_TERMS';

export interface Issue {
  id: string;
  ruleCode: RuleCode;
  riskLevel: RiskLevel;
  title: string;
  detectedText: string;
  explanation: string;
  legalBasis: string;
  recommendedAction: string;
}

export interface AnalysisData {
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
