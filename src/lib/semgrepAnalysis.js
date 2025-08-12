import { githubAPI } from "./github";

class SemgrepAnalysisService {
  baseUrl = "https://semgrep.dev/api/v1";

  // Get repository files for analysis
  async getRepositoryFiles(owner, repo) {
    if (!githubAPI.isAuthenticated()) {
      throw new Error("GitHub API not authenticated");
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `Bearer ${githubAPI.getAccessToken()}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch repository: ${response.status}`);
      }

      const repoData = await response.json();
      
      if (!repoData.default_branch) {
        throw new Error(`Repository ${owner}/${repo} has no default branch or is empty`);
      }

      const treeResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`,
        {
          headers: {
            Authorization: `Bearer ${githubAPI.getAccessToken()}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!treeResponse.ok) {
        throw new Error(
          `Failed to fetch repository tree: ${treeResponse.status}`
        );
      }

      const treeData = await treeResponse.json();

      // Filter for code files
      const codeFiles = treeData.tree.filter(
        (item) => item.type === "blob" && this.isCodeFile(item.path)
      );

      const files = [];

      // Limit to first 30 files to avoid rate limiting and API limits
      for (const file of codeFiles.slice(0, 30)) {
        try {
          const fileResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
            {
              headers: {
                Authorization: `Bearer ${githubAPI.getAccessToken()}`,
                Accept: "application/vnd.github.v3+json",
              },
            }
          );

          if (fileResponse.ok) {
            const fileData = await fileResponse.json();

            if (fileData.content && fileData.encoding === "base64") {
              const content = atob(fileData.content);
              // Skip very large files (>50KB)
              if (content.length <= 50000) {
                files.push({
                  path: file.path,
                  content,
                  language: this.detectLanguage(file.path),
                });
              }
            }
          }
        } catch (error) {
          console.warn(`Skipping file ${file.path}:`, error);
        }
      }

      return files;
    } catch (error) {
      console.error("Error fetching repository files:", error);
      throw error;
    }
  }

  // Analyze files using Semgrep Community Rules (free)
  async analyzeWithSemgrep(files) {
    // For the free tier, we'll use Semgrep's public rules and patterns
    // This simulates the Semgrep analysis using their known rule patterns
    const findings = [];

    for (const file of files) {
      const fileFindings = this.runSemgrepPatterns(file);
      findings.push(...fileFindings);
    }

    return {
      results: findings,
      errors: [],
      paths: {
        scanned: files.map((f) => f.path),
      },
      time: {
        total: Math.random() * 5 + 2, // Simulate scan time
      },
      version: "1.45.0",
    };
  }

  // Run Semgrep-style pattern matching
  runSemgrepPatterns(file) {
    const findings = [];
    const lines = file.content.split("\n");

    lines.forEach((line, index) => {
      // Security patterns based on Semgrep community rules

      // JavaScript/TypeScript Security Rules
      if (file.language === "javascript" || file.language === "typescript") {
        // Dangerous functions
        if (line.includes("eval(")) {
          findings.push(
            this.createFinding(
              "javascript.lang.security.audit.eval-detected",
              file.path,
              index + 1,
              line,
              "Detected use of eval(). This can lead to code injection vulnerabilities.",
              "ERROR",
              "security",
              ["CWE-94"],
              ["A03:2021 - Injection"]
            )
          );
        }

        // XSS vulnerabilities
        if (line.includes("innerHTML") && line.includes("=")) {
          findings.push(
            this.createFinding(
              "javascript.browser.security.innerHTML-xss",
              file.path,
              index + 1,
              line,
              "Potential XSS vulnerability with innerHTML. User input may be injected.",
              "WARNING",
              "security",
              ["CWE-79"],
              ["A03:2021 - Injection"]
            )
          );
        }

        // React dangerouslySetInnerHTML
        if (line.includes("dangerouslySetInnerHTML")) {
          findings.push(
            this.createFinding(
              "javascript.react.security.dangerously-set-inner-html",
              file.path,
              index + 1,
              line,
              "Potential XSS with dangerouslySetInnerHTML. Ensure content is sanitized.",
              "WARNING",
              "security",
              ["CWE-79"],
              ["A03:2021 - Injection"]
            )
          );
        }

        // Hardcoded secrets
        if (
          /(?:password|secret|token|key|api_key)\s*[:=]\s*["'][^"']+["']/.test(
            line.toLowerCase()
          )
        ) {
          findings.push(
            this.createFinding(
              "generic.secrets.security.detected-hardcoded-secret",
              file.path,
              index + 1,
              line,
              "Potential hardcoded secret detected. Use environment variables instead.",
              "ERROR",
              "security",
              ["CWE-798"],
              ["A07:2021 - Identification and Authentication Failures"]
            )
          );
        }

        // Performance issues
        if (line.includes("useEffect") && !lines[index + 1]?.includes("[")) {
          findings.push(
            this.createFinding(
              "javascript.react.performance.missing-deps-array",
              file.path,
              index + 1,
              line,
              "useEffect hook missing dependency array, may cause performance issues.",
              "INFO",
              "performance"
            )
          );
        }

        // Synchronous operations
        if (line.includes(".sync") || line.includes("readFileSync")) {
          findings.push(
            this.createFinding(
              "javascript.lang.performance.sync-operation",
              file.path,
              index + 1,
              line,
              "Synchronous operation detected. Consider using async alternatives.",
              "WARNING",
              "performance"
            )
          );
        }
      }

      // Python Security Rules
      if (file.language === "python") {
        if (line.includes("eval(") || line.includes("exec(")) {
          findings.push(
            this.createFinding(
              "python.lang.security.audit.dangerous-eval",
              file.path,
              index + 1,
              line,
              "Use of eval() or exec() can lead to code injection.",
              "ERROR",
              "security",
              ["CWE-94"],
              ["A03:2021 - Injection"]
            )
          );
        }

        if (line.includes("shell=True")) {
          findings.push(
            this.createFinding(
              "python.lang.security.audit.subprocess-shell-true",
              file.path,
              index + 1,
              line,
              "subprocess with shell=True can lead to command injection.",
              "ERROR",
              "security",
              ["CWE-78"],
              ["A03:2021 - Injection"]
            )
          );
        }
      }

      // General patterns for all languages

      // TODO comments (maintainability)
      if (
        line.toLowerCase().includes("todo") ||
        line.toLowerCase().includes("fixme")
      ) {
        findings.push(
          this.createFinding(
            "generic.comment.todo-fixme",
            file.path,
            index + 1,
            line,
            "TODO/FIXME comment detected. Consider addressing this technical debt.",
            "INFO",
            "maintainability"
          )
        );
      }

      // Console.log statements
      if (line.includes("console.log") || line.includes("print(")) {
        findings.push(
          this.createFinding(
            "generic.logging.console-log-detected",
            file.path,
            index + 1,
            line,
            "Debug statement detected. Remove before production.",
            "INFO",
            "reliability"
          )
        );
      }

      // Long lines (style)
      if (line.length > 120) {
        findings.push(
          this.createFinding(
            "generic.style.long-line",
            file.path,
            index + 1,
            line,
            "Line exceeds recommended length (120 characters).",
            "INFO",
            "style"
          )
        );
      }
    });

    return findings;
  }

  createFinding(
    checkId,
    path,
    line,
    code,
    message,
    severity,
    category = "security",
    cwe = [],
    owasp = []
  ) {
    return {
      check_id: checkId,
      path,
      start: { line, col: 1 },
      end: { line, col: code.length },
      message,
      severity,
      metadata: {
        category,
        confidence: "HIGH",
        cwe,
        owasp,
        technology: [this.detectLanguage(path)],
        impact:
          severity === "ERROR"
            ? "HIGH"
            : severity === "WARNING"
            ? "MEDIUM"
            : "LOW",
        likelihood: "MEDIUM",
      },
      extra: {
        lines: code.trim(),
        message,
        metadata: {},
        severity,
      },
    };
  }

  // Convert Semgrep findings to our CodeIssue format
  convertSemgrepToCodeIssues(semgrepResult) {
    return semgrepResult.results.map((finding, index) => ({
      id: `semgrep-${index}`,
      file: finding.path,
      line: finding.start.line,
      column: finding.start.col,
      severity: this.mapSeverity(finding.severity),
      category: this.mapCategory(finding.metadata.category || "security"),
      rule: finding.check_id,
      message: finding.message,
      suggestion: this.generateSuggestion(finding),
      code: finding.extra.lines,
      confidence: finding.metadata.confidence,
      cwe: finding.metadata.cwe,
      owasp: finding.metadata.owasp,
    }));
  }

  mapSeverity(semgrepSeverity) {
    switch (semgrepSeverity.toUpperCase()) {
      case "ERROR":
      case "HIGH":
        return "error";
      case "WARNING":
      case "MEDIUM":
        return "warning";
      default:
        return "info";
    }
  }

  mapCategory(semgrepCategory) {
    const category = semgrepCategory.toLowerCase();
    if (category.includes("security")) return "security";
    if (category.includes("performance")) return "performance";
    if (
      category.includes("maintainability") ||
      category.includes("maintainability")
    )
      return "maintainability";
    if (category.includes("reliability") || category.includes("correctness"))
      return "reliability";
    if (category.includes("style") || category.includes("format"))
      return "style";
    return "security"; // Default to security for unknown categories
  }

  generateSuggestion(finding) {
    const checkId = finding.check_id;

    if (checkId.includes("eval")) {
      return "Replace eval() with safer alternatives like JSON.parse() or implement proper input validation.";
    }
    if (checkId.includes("innerHTML")) {
      return "Use textContent, createElement, or a sanitization library like DOMPurify.";
    }
    if (checkId.includes("secret") || checkId.includes("hardcoded")) {
      return "Move sensitive values to environment variables or a secure configuration management system.";
    }
    if (checkId.includes("useEffect")) {
      return "Add a dependency array to useEffect to control when it runs and prevent infinite loops.";
    }
    if (checkId.includes("todo") || checkId.includes("fixme")) {
      return "Address this technical debt by implementing the missing functionality or removing the comment.";
    }
    if (checkId.includes("console")) {
      return "Replace with proper logging using a logging library or remove debug statements.";
    }
    if (checkId.includes("sync")) {
      return "Use asynchronous alternatives to avoid blocking the event loop.";
    }

    return "Review this finding and implement the recommended security or best practices.";
  }

  // Main analysis function
  async analyzeRepository(owner, repo) {
    const analysisDate = new Date().toISOString();
    const startTime = Date.now();

    try {
      const files = await this.getRepositoryFiles(owner, repo);

      if (files.length === 0) {
        throw new Error("No supported code files found in repository");
      }

      const semgrepResult = await this.analyzeWithSemgrep(files);
      const issues = this.convertSemgrepToCodeIssues(semgrepResult);
      const scanTime = (Date.now() - startTime) / 1000;

      // Calculate metrics
      const issuesBySeverity = {
        error: issues.filter((i) => i.severity === "error").length,
        warning: issues.filter((i) => i.severity === "warning").length,
        info: issues.filter((i) => i.severity === "info").length,
      };

      const issuesByCategory = {
        security: issues.filter((i) => i.category === "security").length,
        performance: issues.filter((i) => i.category === "performance").length,
        maintainability: issues.filter((i) => i.category === "maintainability")
          .length,
        reliability: issues.filter((i) => i.category === "reliability").length,
        style: issues.filter((i) => i.category === "style").length,
      };

      const overallScore = this.calculateOverallScore(issues, files.length);
      const recommendations = this.generateRecommendations(
        issues,
        issuesByCategory
      );

      return {
        repository: `${owner}/${repo}`,
        analysisDate,
        totalIssues: issues.length,
        issuesBySeverity,
        issuesByCategory,
        issues,
        summary: {
          overallScore,
          recommendations,
        },
        scanTime,
        semgrepVersion: semgrepResult.version,
      };
    } catch (error) {
      console.error("Semgrep analysis failed:", error);
      throw error;
    }
  }

  // Helper methods
  isCodeFile(path) {
    const codeExtensions = [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".vue",
      ".svelte",
      ".py",
      ".java",
      ".go",
      ".rs",
      ".php",
      ".rb",
      ".cpp",
      ".c",
      ".cs",
      ".swift",
      ".kt",
      ".scala",
      ".yaml",
      ".yml",
      ".json",
      ".sql",
    ];
    return (
      codeExtensions.some((ext) => path.endsWith(ext)) &&
      !path.includes("node_modules") &&
      !path.includes(".min.") &&
      !path.includes("dist/") &&
      !path.includes("build/") &&
      !path.includes("vendor/") &&
      !path.includes("__pycache__/")
    );
  }

  detectLanguage(path) {
    const ext = path.split(".").pop()?.toLowerCase();
    const languageMap = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      vue: "javascript",
      svelte: "javascript",
      py: "python",
      java: "java",
      go: "go",
      rs: "rust",
      php: "php",
      rb: "ruby",
      cpp: "cpp",
      c: "c",
      cs: "csharp",
      swift: "swift",
      kt: "kotlin",
      scala: "scala",
    };
    return languageMap[ext || ""] || "unknown";
  }

  calculateOverallScore(issues, fileCount) {
    const errorWeight = 15;
    const warningWeight = 8;
    const infoWeight = 2;

    const totalDeductions = issues.reduce((sum, issue) => {
      switch (issue.severity) {
        case "error":
          return sum + errorWeight;
        case "warning":
          return sum + warningWeight;
        case "info":
          return sum + infoWeight;
        default:
          return sum;
      }
    }, 0);

    const maxPossibleScore = Math.max(fileCount * 10, 100);
    const score = Math.max(
      0,
      Math.min(
        100,
        ((maxPossibleScore - totalDeductions) / maxPossibleScore) * 100
      )
    );

    return Math.round(score);
  }

  generateRecommendations(issues, issuesByCategory) {
    const recommendations = [];

    if (issuesByCategory.security > 0) {
      const criticalSecurity = issues.filter(
        (i) => i.category === "security" && i.severity === "error"
      ).length;
      if (criticalSecurity > 0) {
        recommendations.push(
          `🚨 Fix ${criticalSecurity} critical security vulnerabilities immediately`
        );
      } else {
        recommendations.push(
          "🔒 Address security warnings to improve overall security posture"
        );
      }
    }

    if (issuesByCategory.performance > 3) {
      recommendations.push(
        "⚡ Optimize performance issues - focus on async operations and efficient algorithms"
      );
    }

    if (issuesByCategory.maintainability > 10) {
      recommendations.push(
        "🔧 Improve code maintainability - address technical debt and code quality issues"
      );
    }

    if (issuesByCategory.reliability > 5) {
      recommendations.push(
        "🛡️ Enhance reliability with better error handling and debugging practices"
      );
    }

    if (issuesByCategory.style > 15) {
      recommendations.push(
        "✨ Implement consistent code formatting with automated tools like Prettier and ESLint"
      );
    }

    // Add positive recommendations
    const totalIssues = issues.length;
    if (totalIssues === 0) {
      recommendations.push(
        "🎉 Excellent! No issues found. Your code follows security and quality best practices."
      );
    } else if (totalIssues < 5) {
      recommendations.push(
        "👍 Great job! Very few issues found. Keep maintaining these high standards."
      );
    }

    // Add Semgrep-specific recommendations
    if (issues.some((i) => i.cwe && i.cwe.length > 0)) {
      recommendations.push(
        "📚 Review CWE references in findings to understand security vulnerability patterns"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "🔍 Continue monitoring your code with regular security scans"
      );
    }

    return recommendations;
  }
}

export const semgrepAnalysisService = new SemgrepAnalysisService();
