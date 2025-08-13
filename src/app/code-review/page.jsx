"use client";

export const dynamic = 'force-dynamic';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Zap,
  Wrench,
  Bug,
  Palette,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  FileText,
  Clock,
  BarChart3,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  semgrepAnalysisService,
  AnalysisResult,
  CodeIssue,
} from "@/lib/semgrepAnalysis";
import { useSearchParams } from "next/navigation";

const severityIcons = {
  error: X,
  warning: AlertTriangle,
  info: Info,
};

const severityColors = {
  error: "text-destructive",
  warning: "text-yellow-600",
  info: "text-blue-600",
};

const categoryIcons = {
  security: Shield,
  performance: Zap,
  maintainability: Wrench,
  reliability: Bug,
  style: Palette,
};

const categoryColors = {
  security: "text-red-600",
  performance: "text-orange-600",
  maintainability: "text-blue-600",
  reliability: "text-purple-600",
  style: "text-green-600",
};

function CodeReviewContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const repoFullName = searchParams.get("repo");
  const [owner, repo] = repoFullName?.split("/") || [];

  useEffect(() => {
    if (owner && repo) {
      runAnalysis();
    }
  }, [owner, repo]);

  const runAnalysis = async () => {
    if (!owner || !repo) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await semgrepAnalysisService.analyzeRepository(
        owner,
        repo
      );
      setAnalysisResult(result);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredIssues = () => {
    if (!analysisResult) return [];

    return analysisResult.issues.filter((issue) => {
      const severityMatch =
        selectedSeverity === "all" || issue.severity === selectedSeverity;
      const categoryMatch =
        selectedCategory === "all" || issue.category === selectedCategory;
      return severityMatch && categoryMatch;
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 60) return "Needs Improvement";
    return "Poor";
  };

  if (!repoFullName) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No repository selected
          </h3>
          <p className="text-muted-foreground">
            Please select a repository to analyze from the repositories page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Semgrep Code Analysis
            </h1>
            <p className="text-muted-foreground mt-2">
              Analyzing {repoFullName} with enterprise-grade security
              scanning...
            </p>
          </div>

          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Running Semgrep Security Analysis
            </h3>
            <p className="text-muted-foreground">
              Scanning for security vulnerabilities, bugs, and code quality
              issues...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Analysis Failed
          </h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={runAnalysis}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!analysisResult) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No analysis results
          </h3>
          <p className="text-muted-foreground mb-6">
            Click the button below to start code analysis
          </p>
          <Button
            onClick={runAnalysis}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Start Semgrep Analysis
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const filteredIssues = getFilteredIssues();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Semgrep Analysis Results
            </h1>
            <p className="text-muted-foreground mt-2">
              Security and quality analysis for {analysisResult.repository}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={runAnalysis} variant="outline">
              Re-analyze
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Score
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getScoreColor(
                  analysisResult.summary.overallScore
                )}`}
              >
                {analysisResult.summary.overallScore}/100
              </div>
              <p className="text-xs text-muted-foreground">
                {getScoreLabel(analysisResult.summary.overallScore)}
              </p>
              <Progress
                value={analysisResult.summary.overallScore}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Issues
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analysisResult.totalIssues}
              </div>
              <p className="text-xs text-muted-foreground">
                Found across all files
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Critical Issues
              </CardTitle>
              <X className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {analysisResult.issuesBySeverity.error}
              </div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Analysis Date
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">
                {new Date(analysisResult.analysisDate).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(analysisResult.analysisDate).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysisResult.summary.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Issues Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Issues Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="issues" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="issues">Issues List</TabsTrigger>
                <TabsTrigger value="categories">By Category</TabsTrigger>
              </TabsList>

              <TabsContent value="issues" className="space-y-6">
                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Severity:</span>
                    {["all", "error", "warning", "info"].map((severity) => (
                      <Button
                        key={severity}
                        variant={
                          selectedSeverity === severity ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedSeverity(severity)}
                        className="capitalize"
                      >
                        {severity}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm font-medium">Category:</span>
                    {[
                      "all",
                      "security",
                      "performance",
                      "maintainability",
                      "reliability",
                      "style",
                    ].map((category) => (
                      <Button
                        key={category}
                        variant={
                          selectedCategory === category ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="capitalize"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Issues List */}
                <div className="space-y-4">
                  {filteredIssues.length > 0 ? (
                    filteredIssues.map((issue, index) => {
                      const SeverityIcon = severityIcons[issue.severity];
                      const CategoryIcon = categoryIcons[issue.category];

                      return (
                        <Card
                          key={issue.id}
                          className="border-l-4 border-l-muted"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <SeverityIcon
                                    className={`w-4 h-4 ${
                                      severityColors[issue.severity]
                                    }`}
                                  />
                                  <CategoryIcon
                                    className={`w-4 h-4 ${
                                      categoryColors[issue.category]
                                    }`}
                                  />
                                  <Badge variant="outline" className="text-xs">
                                    {issue.rule}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {issue.file}:{issue.line}
                                  </span>
                                </div>

                                <h4 className="font-medium mb-1">
                                  {issue.message}
                                </h4>

                                {issue.suggestion && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    💡 {issue.suggestion}
                                  </p>
                                )}

                                {issue.code && (
                                  <div className="bg-muted p-2 rounded text-sm font-mono">
                                    {issue.code}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No issues found
                      </h3>
                      <p className="text-muted-foreground">
                        Great job! No issues match your current filters.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analysisResult.issuesByCategory).map(
                    ([category, count]) => {
                      const CategoryIcon = categoryIcons[category];
                      const total = analysisResult.totalIssues;
                      const percentage =
                        total > 0 ? Math.round((count / total) * 100) : 0;

                      return (
                        <Card key={category}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CategoryIcon
                                className={`w-5 h-5 ${categoryColors[category]}`}
                              />
                              <h3 className="font-medium capitalize">
                                {category}
                              </h3>
                            </div>
                            <div className="text-2xl font-bold">{count}</div>
                            <p className="text-sm text-muted-foreground">
                              {percentage}% of total issues
                            </p>
                            <Progress value={percentage} className="mt-2" />
                          </CardContent>
                        </Card>
                      );
                    }
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function CodeReview() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    }>
      <CodeReviewContent />
    </Suspense>
  );
}
