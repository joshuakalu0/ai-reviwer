// Type definitions for SemgrepAnalysis

export const AnalysisResult = {
  repository: '',
  analysisDate: '',
  totalIssues: 0,
  issuesBySeverity: {
    error: 0,
    warning: 0,
    info: 0
  },
  issuesByCategory: {
    security: 0,
    performance: 0,
    maintainability: 0,
    reliability: 0,
    style: 0,
    compliance: 0
  },
  issues: [],
  aiConfidence: 0,
  summary: {
    overallScore: 0,
    recommendations: []
  }
};

export const CodeIssue = {
  id: '',
  file: '',
  line: 0,
  column: 0,
  severity: '',
  category: '',
  rule: '',
  message: '',
  suggestion: '',
  code: '',
  confidence: '',
  cwe: [],
  owasp: [],
  metadata: {}
};