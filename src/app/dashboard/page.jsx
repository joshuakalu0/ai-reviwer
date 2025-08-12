"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GitBranch, 
  Plus, 
  Star, 
  GitFork, 
  Clock, 
  TrendingUp, 
  Activity, 
  Users, 
  Code, 
  Zap,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  githubAPI,
  GitHubRepository,
  getLanguageColor,
  formatDate,
} from "@/lib/github";

export default function Dashboard() {
  const { user } = useAuth();
  const [recentRepos, setRecentRepos] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && githubAPI.isAuthenticated()) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch recent repositories (last 5)
      const [repositories, userStats] = await Promise.all([
        githubAPI.getUserRepositories({ sort: "updated", per_page: 5 }),
        githubAPI.getUserStats(),
      ]);

      setRecentRepos(repositories);
      setStats(userStats);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gradient-to-r from-muted to-muted/50 rounded-lg w-1/3 mb-3"></div>
            <div className="h-5 bg-muted rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gradient-to-br from-muted to-muted/50 rounded-lg"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-gradient-to-r from-muted to-muted/50 rounded-lg"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Error loading dashboard
          </h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Welcome back, <span className="font-semibold text-foreground">{user?.name || user?.login}</span>! Here's your development overview.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <a href="/create-project">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </a>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Repositories</p>
                  <p className="text-3xl font-bold text-blue-600">{stats?.totalRepos || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {stats?.publicRepos || 0} public • {stats?.privateRepos || 0} private
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Total Stars</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats?.totalStars || 0}</p>
                  <p className="text-xs text-yellow-600 mt-1">Community appreciation</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Forks</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.totalForks || 0}</p>
                  <p className="text-xs text-green-600 mt-1">Community contributions</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <GitFork className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Activity</p>
                  <p className="text-3xl font-bold text-purple-600">{recentRepos.length}</p>
                  <p className="text-xs text-purple-600 mt-1">Recent updates</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Repositories */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Recent Activity
              </h2>
              <p className="text-muted-foreground mt-1">Your most recently updated repositories</p>
            </div>
            <Button variant="outline" size="sm" asChild className="group">
              <a href="/repositories" className="flex items-center gap-2">
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>

          {recentRepos.length > 0 ? (
            <div className="space-y-4">
              {recentRepos.map((repo, index) => (
                <Card
                  key={repo.id}
                  className="hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-lg text-foreground hover:text-blue-600 transition-colors group-hover:text-blue-600"
                              >
                                {repo.name}
                              </a>
                              {repo.private ? (
                                <Badge variant="secondary" className="text-xs">
                                  Private
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Public
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm">
                              {repo.description || "No description available"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          {repo.language && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: getLanguageColor(repo.language),
                                }}
                              ></div>
                              <span className="font-medium">{repo.language}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="w-4 h-4" />
                            <span className="font-medium">{repo.stargazers_count}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600">
                            <GitFork className="w-4 h-4" />
                            <span className="font-medium">{repo.forks_count}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(repo.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <a href={`/ai-code-review?repo=${repo.full_name}`}>
                          <Zap className="w-4 h-4 mr-2" />
                          Analyze
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-muted">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <GitBranch className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    No Repositories Yet
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start your coding journey by creating your first repository on GitHub.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <a
                        href="https://github.com/new"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Repository
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/repositories">
                        <GitBranch className="w-4 h-4 mr-2" />
                        Browse Existing
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 border-indigo-200 dark:border-indigo-800">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto p-4 justify-start">
                <a href="/create-project" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">New Project</div>
                    <div className="text-sm text-muted-foreground">Start AI code review</div>
                  </div>
                </a>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4 justify-start">
                <a href="/repositories" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Browse Repos</div>
                    <div className="text-sm text-muted-foreground">View all repositories</div>
                  </div>
                </a>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4 justify-start">
                <a href="/settings" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Settings</div>
                    <div className="text-sm text-muted-foreground">Manage preferences</div>
                  </div>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
