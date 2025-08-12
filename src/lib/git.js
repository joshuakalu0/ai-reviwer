import { Octokit } from "@octokit/rest";

class GitHubAPI {
  octokit;
  accessToken;

  setAccessToken(token) {
    this.accessToken = token;
    this.octokit = new Octokit({
      auth: token,
    });
  }

  getAccessToken() {
    return this.accessToken;
  }

  isAuthenticated() {
    return !!this.accessToken && !!this.octokit;
  }

  async getCurrentUser() {
    if (!this.octokit) {
      throw new Error("GitHub API not authenticated");
    }

    const { data } = await this.octokit.users.getAuthenticated();
    return data;
  }

  async getUserRepositories(options = {}) {
    if (!this.octokit) {
      throw new Error("GitHub API not authenticated");
    }

    const {
      sort = "updated",
      direction = "desc",
      per_page = 100,
      page = 1,
      type = "owner",
    } = options;

    const { data } = await this.octokit.repos.listForAuthenticatedUser({
      sort,
      direction,
      per_page,
      page,
      type,
    });

    return data;
  }

  async getRepository(owner, repo) {
    if (!this.octokit) {
      throw new Error("GitHub API not authenticated");
    }

    const { data } = await this.octokit.repos.get({
      owner,
      repo,
    });

    return data;
  }

  async getUserStats() {
    if (!this.octokit) {
      throw new Error("GitHub API not authenticated");
    }

    const repos = await this.getUserRepositories({ per_page: 100 });

    const totalRepos = repos.length;
    const totalStars = repos.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    );
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    const publicRepos = repos.filter((repo) => !repo.private).length;
    const privateRepos = repos.filter((repo) => repo.private).length;

    return {
      totalRepos,
      totalStars,
      totalForks,
      publicRepos,
      privateRepos,
    };
  }

  // OAuth flow helpers
  static getAuthURL(clientId, redirectUri, scopes = ["repo", "user"]) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes.join(" "),
      response_type: "code",
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  static async exchangeCodeForToken(code, clientId, clientSecret) {
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    return data.access_token;
  }
}

export const githubAPI = new GitHubAPI();

// Language colors for repository display
export const getLanguageColor = (language) => {
  const colors = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    Java: "#b07219",
    Go: "#00ADD8",
    Rust: "#dea584",
    CSS: "#1572B6",
    HTML: "#e34c26",
    PHP: "#4F5D95",
    Ruby: "#701516",
    Swift: "#fa7343",
    Kotlin: "#A97BFF",
    Dart: "#00B4AB",
    "C++": "#f34b7d",
    "C#": "#239120",
    C: "#555555",
    Shell: "#89e051",
    Vue: "#4FC08D",
    React: "#61DAFB",
  };
  return colors[language || ""] || "#6b7280";
};

// Helper to format dates
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  } else if (diffInHours < 24 * 7) {
    const days = Math.floor(diffInHours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  } else if (diffInHours < 24 * 30) {
    const weeks = Math.floor(diffInHours / (24 * 7));
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  } else {
    return date.toLocaleDateString();
  }
};
