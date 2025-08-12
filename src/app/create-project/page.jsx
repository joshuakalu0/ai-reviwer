"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GitBranch,
  Star,
  GitFork,
  Clock,
  Search,
  Lock,
  Globe,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Moon,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { githubAPI, getLanguageColor, formatDate } from "@/lib/github";
import { useRouter } from "next/navigation";

const ProjectSkeleton = () => (
  <div className="border rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-9 w-20 ml-4" />
    </div>
  </div>
);

export default function CreateProject() {
  const { user } = useAuth();
  const router = useRouter();
  const [repositories, setRepositories] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && githubAPI.isAuthenticated()) {
      fetchRepositories();
    }
  }, [user]);

  useEffect(() => {
    filterRepositories();
  }, [repositories, searchTerm]);

  const fetchRepositories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const repos = await githubAPI.getUserRepositories({
        sort: "updated",
        per_page: 100,
        type: "owner",
      });
      setRepositories(repos);
    } catch (err) {
      console.error("Error fetching repositories:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch repositories"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filterRepositories = () => {
    if (searchTerm) {
      setIsSearching(true);
      setTimeout(() => {
        const filtered = repositories.filter(
          (repo) =>
            repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (repo.description &&
              repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredRepos(filtered);
        setIsSearching(false);
      }, 300);
    } else {
      setFilteredRepos(repositories);
      setIsSearching(false);
    }
  };

  const handleSelectRepo = (repo) => {
    router.push(`/ai-code-review?repo=${repo.full_name}`);
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Error loading repositories
          </h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={fetchRepositories}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Project
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Import a Git repository to get started with AI-powered code review and analysis
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Repository Search */}
          <div className="bg-card border rounded-lg p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <GitBranch className="w-6 h-6 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Import Git Repository</h2>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search repositories..."
                  className="pl-10 h-12 text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Repository List */}
              <div className="space-y-3">
                {isLoading || isSearching ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <ProjectSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredRepos.length > 0 ? (
                  <div className="space-y-3">
                    {filteredRepos.slice(0, 5).map((repo) => (
                      <div
                        key={repo.id}
                        className="border rounded-lg p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground truncate">
                                {repo.name}
                              </h3>
                              {repo.private ? (
                                <Badge variant="secondary" className="text-xs">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Private
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  <Globe className="w-3 h-3 mr-1" />
                                  Public
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm mb-2 line-clamp-1">
                              {repo.description || "No description available"}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {repo.language && (
                                <div className="flex items-center gap-1">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                      backgroundColor: getLanguageColor(repo.language),
                                    }}
                                  ></div>
                                  {repo.language}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {repo.stargazers_count}
                              </div>
                              <div className="flex items-center gap-1">
                                <GitFork className="w-3 h-3" />
                                {repo.forks_count}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleSelectRepo(repo)}
                            className="ml-4"
                            size="sm"
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GitBranch className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">
                      {searchTerm ? "No repositories found" : "No repositories yet"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : "Create your first repository on GitHub to get started"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Why Choose AI Code Review?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">AI-Powered Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced AI algorithms analyze your code for bugs and optimization opportunities
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Instant Feedback</h3>
                    <p className="text-sm text-muted-foreground">
                      Get immediate insights to improve code quality and performance
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Security First</h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive security scanning to identify vulnerabilities
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Getting Started</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                  <span>Search and select your repository</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                  <span>AI analyzes your codebase</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                  <span>Review insights and recommendations</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}