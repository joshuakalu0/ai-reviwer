import { Octokit } from "@octokit/rest";

class GitHubAPI {
  constructor() {
    this.octokit = null;
    this.accessToken = "";
  }

  setAccessToken(token) {
    this.accessToken = token;
    this.octokit = new Octokit({
      auth: token,
    });
  }

  isAuthenticated() {
    return !!this.accessToken && !!this.octokit;
  }

  getAccessToken() {
    return this.accessToken;
  }

  async getCurrentUser() {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }

    try {
      const { data } = await this.octokit.users.getAuthenticated();
      return data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      if (error.status === 401) {
        throw new Error('Invalid or expired access token');
      }
      if (error.status === 403) {
        throw new Error('Access forbidden - check token permissions');
      }
      throw new Error(`GitHub API error: ${error.message}`);
    }
  }

  async getUserRepositories(options = {}) {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }

    try {
      const { data } = await this.octokit.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 100,
        ...options,
      });
      return data;
    } catch (error) {
      console.error("Error fetching repositories:", error);
      throw error;
    }
  }

  async getUserStats() {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }

    try {
      const repos = await this.getUserRepositories({ per_page: 100 });
      
      const stats = {
        totalRepos: repos.length,
        publicRepos: repos.filter(repo => !repo.private).length,
        privateRepos: repos.filter(repo => repo.private).length,
        totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
        totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
      };

      return stats;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  }

  async getRepository(owner, repo) {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }

    try {
      const { data } = await this.octokit.repos.get({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      console.error("Error fetching repository:", error);
      throw error;
    }
  }
}

// Language colors mapping
const languageColors = {
  JavaScript: "#f1e05a",
  TypeScript: "#2b7489",
  Python: "#3572A5",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#239120",
  Swift: "#ffac45",
  Kotlin: "#F18E33",
  Dart: "#00B4AB",
  Shell: "#89e051",
  Vue: "#2c3e50",
  React: "#61dafb",
};

export function getLanguageColor(language) {
  return languageColors[language] || "#586069";
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
}

// Export singleton instance
export const githubAPI = new GitHubAPI();

// Legacy exports for backward compatibility
export async function fetchUserRepositories(accessToken) {
  const tempAPI = new GitHubAPI();
  tempAPI.setAccessToken(accessToken);
  return tempAPI.getUserRepositories();
}

export async function fetchRepository(accessToken, owner, repo) {
  const tempAPI = new GitHubAPI();
  tempAPI.setAccessToken(accessToken);
  return tempAPI.getRepository(owner, repo);
}

export async function fetchUserProfile(accessToken) {
  const tempAPI = new GitHubAPI();
  tempAPI.setAccessToken(accessToken);
  return tempAPI.getCurrentUser();
}

export function getGitHubClient(accessToken) {
  return new Octokit({
    auth: accessToken,
  });
}