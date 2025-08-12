"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  GitBranch,
  Plus,
  Star,
  GitFork,
  Clock,
  Search,
  Lock,
  Globe,
  ExternalLink,
  FileText,
  Brain,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { githubAPI, getLanguageColor, formatDate } from "@/lib/github";
import Link from "next/link";

export default function Repositories() {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [filteredRepos, setFilteredRepos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && githubAPI.isAuthenticated()) {
      fetchRepositories();
    }
  }, [user]);

  useEffect(() => {
    filterRepositories();
  }, [repositories, searchTerm, filter]);

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
    let filtered = repositories;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (repo.description &&
            repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply visibility filter
    if (filter === "public") {
      filtered = filtered.filter((repo) => !repo.private);
    } else if (filter === "private") {
      filtered = filtered.filter((repo) => repo.private);
    }

    setFilteredRepos(filtered);
  };

  const getStats = () => {
    const total = repositories.length;
    const publicCount = repositories.filter((repo) => !repo.private).length;
    const privateCount = repositories.filter((repo) => repo.private).length;

    return { total, publicCount, privateCount };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded"></div>
              </div>
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Repositories</h1>
            <p className="text-muted-foreground mt-2">
              Manage your GitHub repositories ({stats.total} total)
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchRepositories} variant="outline">
              Refresh
            </Button>
            <Button
              asChild
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Repository
              </a>
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({stats.total})
            </Button>
            <Button
              variant={filter === "public" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("public")}
            >
              Public ({stats.publicCount})
            </Button>
            <Button
              variant={filter === "private" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("private")}
            >
              Private ({stats.privateCount})
            </Button>
          </div>
        </div>

        {/* Repository Grid */}
        {filteredRepos.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRepos.map((repo) => (
              <Card
                key={repo.id}
                className="hover:shadow-md transition-all duration-200 hover:border-border/80"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-foreground hover:text-blue-600 transition-colors"
                        >
                          {repo.name}
                        </a>
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
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {repo.description || "No description available"}
                    </p>

                    {/* Topics */}
                    {repo.topics && repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {repo.topics.slice(0, 3).map((topic) => (
                          <Badge
                            key={topic}
                            variant="outline"
                            className="text-xs"
                          >
                            {topic}
                          </Badge>
                        ))}
                        {repo.topics.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{repo.topics.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {repo.language && (
                        <div className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded-full"
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
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(repo.updated_at)}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        {(repo.size / 1024).toFixed(1)} MB
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/code-review?repo=${encodeURIComponent(
                              repo.full_name
                            )}`}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Semgrep Scan
                          </Link>
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          asChild
                        >
                          <Link
                            href={`/ai-code-review?repo=${encodeURIComponent(
                              repo.full_name
                            )}`}
                          >
                            <Brain className="w-3 h-3 mr-1" />
                            AI Review
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm || filter !== "all"
                ? "No repositories found"
                : "No repositories yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Create your first repository on GitHub to get started"}
            </p>
            {!searchTerm && filter === "all" && (
              <Button
                asChild
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <a
                  href="https://github.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Repository
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
