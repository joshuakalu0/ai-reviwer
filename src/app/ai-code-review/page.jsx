"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Shield,
  Zap,
  Bug,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  FileText,
  Brain,
  Target,
  TrendingUp,
  Code,
  Lightbulb,
  Filter,
  GitBranch,
  Clock,
  Users,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { codeAnalysisService } from "@/lib/codeAnalysis";
import { aiCodeReviewService } from "@/lib/aiCodeReview";
import { useSearchParams } from "next/navigation";

const severityConfig = {
  critical: {
    icon: X,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-800",
    badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  },
  high: {
    icon: AlertTriangle,
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950",
    border: "border-orange-200 dark:border-orange-800",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
  },
  medium: {
    icon: Info,
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-950",
    border: "border-yellow-200 dark:border-yellow-800",
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  },
  low: {
    icon: CheckCircle,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  }
};

const categoryConfig = {
  security: {
    icon: Shield,
    color: "text-red-600",
    bg: "bg-red-100 dark:bg-red-900",
    name: "Security"
  },
  performance: {
    icon: Zap,
    color: "text-yellow-600",
    bg: "bg-yellow-100 dark:bg-yellow-900",
    name: "Performance"
  },
  bugs: {
    icon: Bug,
    color: "text-orange-600",
    bg: "bg-orange-100 dark:bg-orange-900",
    name: "Bugs"
  },
  codeSmells: {
    icon: Code,
    color: "text-purple-600",
    bg: "bg-purple-100 dark:bg-purple-900",
    name: "Code Quality"
  },
  bestPractices: {
    icon: Target,
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900",
    name: "Best Practices"
  }
};

export default function AICodeReview() {
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
      runAIAnalysis();
    }
  }, [owner, repo]);

  const runAIAnalysis = async () => {
    if (!owner || !repo) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get repository files
      const files = await codeAnalysisService.getRepositoryFiles(owner, repo);
      
      if (files.length === 0) {
        throw new Error("No code files found in repository");
      }

      // Run AI analysis
      const result = await aiCodeReviewService.analyzeCode(files);
      
      setAnalysisResult({
        repository: `${owner}/${repo}`,
        ...result,
        filesAnalyzed: files.length
      });
    } catch (err) {
      console.error("AI Analysis failed:", err);
      setError(err instanceof Error ? err.message : "AI Analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredIssues = () => {
    if (!analysisResult) return [];

    return analysisResult.issues.filter((issue) => {
      const severityMatch = selectedSeverity === "all" || issue.severity === selectedSeverity;
      const categoryMatch = selectedCategory === "all" || issue.category === selectedCategory;
      return severityMatch && categoryMatch;
    });
  };

  if (!repoFullName) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              No Repository Selected
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Choose a repository from your projects to start AI-powered code analysis and get intelligent insights.
            </p>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <a href="/create-project">Select Repository</a>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Code Review
              </h1>
              <p className="text-muted-foreground mt-1">
                Analyzing {repoFullName} with advanced AI algorithms
              </p>
            </div>
          </div>

          <Card className="border-2 border-dashed border-purple-200 dark:border-purple-800">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full animate-pulse mx-auto mb-6"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-purple-300 dark:border-purple-700 rounded-full animate-spin mx-auto"></div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  AI Analysis in Progress
                </h3>
                <p className="text-muted-foreground mb-4">
                  Our AI is examining your code for patterns, vulnerabilities, and optimization opportunities
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span>This usually takes 30-60 seconds</span>
                </div>
              </div>
            </CardContent>
          </Card>
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
          <Button onClick={runAIAnalysis}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!analysisResult) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Ready for AI Analysis
          </h3>
          <p className="text-muted-foreground mb-6">
            Click below to start comprehensive AI-powered code review
          </p>
          <Button onClick={runAIAnalysis} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Brain className="w-4 h-4 mr-2" />
            Start AI Code Review
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
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Code Review
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <GitBranch className="w-4 h-4" />
                  {analysisResult.repository}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {analysisResult.filesAnalyzed} files
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Just now
                </div>
              </div>
            </div>
          </div>
          <Button onClick={runAIAnalysis} variant="outline" className="border-purple-200 hover:bg-purple-50">
            <Activity className="w-4 h-4 mr-2" />
            Re-analyze
          </Button>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Quality Score</p>
                  <p className="text-3xl font-bold text-green-600">{analysisResult.score.score}</p>
                  <p className="text-sm text-green-600">{analysisResult.score.status}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <Progress value={analysisResult.score.score} className="mt-4 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Grade</p>
                  <p className="text-3xl font-bold text-blue-600">{analysisResult.score.grade}</p>
                  <p className="text-sm text-blue-600">Overall Rating</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Issues Found</p>
                  <p className="text-3xl font-bold text-purple-600">{analysisResult.issues.length}</p>
                  <p className="text-sm text-purple-600">Total Issues</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                  <Bug className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(analysisResult.summary.categories).map(([category, count]) => {
            const config = categoryConfig[category];
            const Icon = config.icon;
            return (
              <Card key={category} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{config.name}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recommendations */}
        {analysisResult.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisResult.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Badge variant={rec.priority === 'critical' ? 'destructive' : rec.priority === 'high' ? 'default' : 'secondary'}>
                      {rec.priority}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">{rec.message}</div>
                      <div className="text-sm text-muted-foreground mt-1">{rec.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="bugs">Bugs</SelectItem>
                  <SelectItem value="codeSmells">Code Quality</SelectItem>
                  <SelectItem value="bestPractices">Best Practices</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="ml-auto text-sm text-muted-foreground">
                Showing {filteredIssues.length} of {analysisResult.issues.length} issues
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Issues Found ({filteredIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredIssues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Issues Found
                </h3>
                <p className="text-muted-foreground">
                  Great job! No issues match the current filters.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredIssues.map((issue, index) => {
                  
                  const severityConf = severityConfig[issue.severity];
                  const categoryConf = categoryConfig[issue.category];
                  const SeverityIcon = severityConf.icon;
                  const CategoryIcon = categoryConf.icon;
                  
                  return (
                    <Card key={index} className={`hover:shadow-md transition-all duration-200 ${severityConf.border}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${severityConf.bg}`}>
                            <SeverityIcon className={`w-5 h-5 ${severityConf.color}`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={categoryConf.bg + " " + categoryConf.color + " border-0"}>
                                <CategoryIcon className="w-3 h-3 mr-1" />
                                {categoryConf.name}
                              </Badge>
                              <Badge className={severityConf.badge + " border-0"}>
                                {issue.severity.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-muted-foreground font-mono">
                                {issue.file}:{issue.line}
                              </span>
                            </div>
                            
                            <h4 className="font-semibold text-foreground mb-2 text-lg">
                              {issue.message}
                            </h4>
                            
                            <p className="text-muted-foreground mb-4">
                              {issue.suggestion}
                            </p>
                            
                            <div className="bg-muted/50 border rounded-lg p-4 font-mono text-sm overflow-x-auto">
                              <pre className="whitespace-pre-wrap">{issue.code}</pre>
                            </div>
                            
                            {issue.confidence && (
                              <div className="mt-3 flex items-center gap-2">
                                <div className="text-xs text-muted-foreground">AI Confidence:</div>
                                <div className="flex-1 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${issue.confidence * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium">{Math.round(issue.confidence * 100)}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}