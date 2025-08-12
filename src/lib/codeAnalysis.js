import { githubAPI } from "./github";

class CodeAnalysisService {
  // Fetch repository files for analysis
  async getRepositoryFiles(owner, repo) {
    if (!githubAPI.isAuthenticated()) {
      throw new Error("GitHub API not authenticated");
    }

    try {
      // Get repository tree
      const repoResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `Bearer ${githubAPI.getAccessToken()}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      
      if (!repoResponse.ok) {
        throw new Error(`Failed to fetch repository: ${repoResponse.status}`);
      }
      
      const repoData = await repoResponse.json();
      
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
        throw new Error(`Failed to fetch repository tree: ${treeResponse.status}`);
      }
      
      const treeData = await treeResponse.json();

      // Filter for code files and fetch content
      const codeFiles = treeData.tree.filter(
        (item) => item.type === "blob" && this.isCodeFile(item.path)
      );

      const files = [];

      // Limit to first 50 files to avoid rate limiting
      for (const file of codeFiles.slice(0, 50)) {
        try {
          const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
            {
              headers: {
                Authorization: `Bearer ${githubAPI.getAccessToken()}`,
                Accept: "application/vnd.github.v3+json",
              },
            }
          );

          const fileData = await response.json();

          if (fileData.content && fileData.encoding === "base64") {
            const content = atob(fileData.content);
            files.push({
              path: file.path,
              content,
              language: this.detectLanguage(file.path),
            });
          }
        } catch (error) {
          console.error(`Error fetching file ${file.path}:`, error);
        }
      }

      return files;
    } catch (error) {
      console.error("Error fetching repository files:", error);
      throw error;
    }
  }

  // Main analysis function
  async analyzeRepository(owner, repo) {
    const analysisDate = new Date().toISOString();
    const files = await this.getRepositoryFiles(owner, repo);

    const allIssues = [];

    // Run different analysis checks
    for (const file of files) {
      const fileIssues = [
        ...this.analyzeSecurityIssues(file),
        ...this.analyzePerformanceIssues(file),
        ...this.analyzeMaintainabilityIssues(file),
        ...this.analyzeReliabilityIssues(file),
        ...this.analyzeStyleIssues(file),
      ];

      allIssues.push(...fileIssues);
    }

    // Calculate metrics
    const issuesBySeverity = {
      error: allIssues.filter((i) => i.severity === "error").length,
      warning: allIssues.filter((i) => i.severity === "warning").length,
      info: allIssues.filter((i) => i.severity === "info").length,
    };

    const issuesByCategory = {
      security: allIssues.filter((i) => i.category === "security").length,
      performance: allIssues.filter((i) => i.category === "performance").length,
      maintainability: allIssues.filter((i) => i.category === "maintainability")
        .length,
      reliability: allIssues.filter((i) => i.category === "reliability").length,
      style: allIssues.filter((i) => i.category === "style").length,
    };

    const overallScore = this.calculateOverallScore(allIssues, files.length);
    const recommendations = this.generateRecommendations(
      allIssues,
      issuesByCategory
    );

    return {
      repository: `${owner}/${repo}`,
      analysisDate,
      totalIssues: allIssues.length,
      issuesBySeverity,
      issuesByCategory,
      issues: allIssues,
      summary: {
        overallScore,
        recommendations,
      },
    };
  }

  // Security analysis
  analyzeSecurityIssues(file) {
    const issues = [];
    const lines = file.content.split("\n");

    lines.forEach((line, index) => {
      // Check for common security issues
      if (
        line.includes("eval(") &&
        (file.language === "javascript" || file.language === "typescript")
      ) {
        issues.push({
          id: `sec-${file.path}-${index}`,
          file: file.path,
          line: index + 1,
          severity: "error",
          category: "security",
          rule: "no-eval",
          message: "Use of eval() can be dangerous and should be avoided",
          suggestion: "Consider using JSON.parse() or other safer alternatives",
          code: line.trim(),
        });
      }

      if (
        line.includes("innerHTML") &&
        (file.language === "javascript" || file.language === "typescript")
      ) {
        issues.push({
          id: `sec-${file.path}-${index}`,
          file: file.path,
          line: index + 1,
          severity: "warning",
          category: "security",
          rule: "no-inner-html",
          message:
            "Direct innerHTML assignment can lead to XSS vulnerabilities",
          suggestion: "Use textContent or DOM manipulation methods instead",
          code: line.trim(),
        });
      }

      if (
        line.includes("dangerouslySetInnerHTML") &&
        file.language === "javascript"
      ) {
        issues.push({
          id: `sec-${file.path}-${index}`,
          file: file.path,
          line: index + 1,
          severity: "warning",
          category: "security",
          rule: "dangerous-inner-html",
          message: "dangerouslySetInnerHTML can introduce XSS vulnerabilities",
          suggestion: "Ensure content is properly sanitized",
          code: line.trim(),
        });
      }

      // Check for hardcoded credentials
      if (
        /(?:password|token|secret|key)\s*[:=]\s*["'][^"']+["']/.test(
          line.toLowerCase()
        )
      ) {
        issues.push({
          id: `sec-${file.path}-${index}`,
          file: file.path,
          line: index + 1,
          severity: "error",
          category: "security",
          rule: "no-hardcoded-credentials",
          message: "Hardcoded credentials detected",
          suggestion: "Move sensitive data to environment variables",
          code: line.trim(),
        });
      }
    });

    return issues;
  }

  // Performance analysis
  analyzePerformanceIssues(file) {
    const issues = [];
    const lines = file.content.split("\n");

    lines.forEach((line, index) => {
      // Check for synchronous operations that could block
      if (line.includes("fs.readFileSync") && file.language === "javascript") {
        issues.push({
          id: `perf-${file.path}-${index}`,
          file: file.path,
          line: index + 1,
          severity: "warning",
          category: "performance",
          rule: "no-sync-operations",
          message: "Synchronous file operations can block the event loop",
          suggestion: "Use asynchronous alternatives like fs.readFile()",
          code: line.trim(),
        });
      }

      // Check for inefficient loops
      if (
        line.includes("for") &&
        line.includes(".length") &&
        !line.includes("const len")
      ) {
        issues.push({
          id: `perf-${file.path}-${index}`,
          file: file.path,
          line: index + 1,
          severity: "info",
          category: "performance",
          rule: "optimize-loops",
          message: "Consider caching array length in loops",
          suggestion:
            "Store array.length in a variable to avoid repeated property access",
          code: line.trim(),
        });
      }

      // React performance issues
      if (
        line.includes("useEffect") &&
        !line.includes("[]") &&
        file.language === "javascript"
      ) {
        const nextLine = lines[index + 1];
        if (nextLine && !nextLine.includes(", [")) {
          issues.push({
            id: `perf-${file.path}-${index}`,
            file: file.path,
            line: index + 1,
            severity: "warning",
            category: "performance",
            rule: "useeffect-dependencies",
            message: "useEffect missing dependency array",
            suggestion:
              "Add dependency array to prevent unnecessary re-renders",
            code: line.trim(),
          });
        }
      }
    });

    return issues;
  }

  // Maintainability analysis
  analyzeMaintainabilityIssues(file) {
    const issues = [];
    const lines = file.content.split("\n");

    // Check function length
    let functionLines = 0;
    let inFunction = false;

    lines.forEach((line, index) => {
      if (
        line.includes("function ") ||
        line.includes("=>") ||
        (line.includes("const ") && line.includes("="))
      ) {
        inFunction = true;
        functionLines = 1;
      } else if (inFunction) {
        functionLines++;
        if (line.includes("}") && functionLines > 50) {
          issues.push({
            id: `maint-${file.path}-${index}`,
            file: file.path,
            line: index + 1,
            severity: "warning",
            category: "maintainability",
            rule: "function-length",
            message: `Function is too long (${functionLines} lines)`,
            suggestion:
              "Consider breaking this function into smaller functions",
            code: line.trim(),
          });
          inFunction = false;
        }
      }
    });

    // Check for magic numbers
    lines.forEach((line, index) => {
      const magicNumbers = line.match(/\b(?!0|1|2|10|100|1000)\d+\b/g);
      if (
        magicNumbers &&
        (file.language === "javascript" || file.language === "typescript")
      ) {
        issues.push({
          id: `maint-${file.path}-${index}`,
          file: file.path,
          line: index + 1,
          severity: "info",
          category: "maintainability",
          rule: "no-magic-numbers",
          message: "Magic numbers should be replaced with named constants",
          suggestion: "Define constants for these numeric values",
          code: line.trim(),
        });
      }
    });

    return issues;
  }

  // Reliability analysis
  analyzeReliabilityIssues(file) {
    const issues = [];
    const lines = file.content.split("\n");

    lines.forEach((line, index) => {
      // Check for missing error handling
      if (
        line.includes("JSON.parse") &&
        !lines
          .slice(Math.max(0, index - 3), index + 3)
          .some((l) => l.includes("try") || l.includes("catch"))
      ) {
        issues.push({
          id: `rel-${file.path}-${index}`,
          file: file.path,
          line: index + 1,
          severity: "warning",
          category: "reliability",
          rule: "error-handling",
          message: "JSON.parse should be wrapped in try-catch",
          suggestion: "Add error handling for potential JSON parsing errors",
          code: line.trim(),
        });
      }

      // Check for console.log in production code
      if (line.includes("console.log") && !file.path.includes("test")) {
        issues.push({
          id: `rel-${file.path}-${index}`,
          file: file.path,
          line: index + 1,
          severity: "info",
          category: "reliability",
          rule: "no-console",
          message: "console.log should not be used in production code",
          suggestion: "Use proper logging library or remove debug statements",
          code: line.trim(),
        });
      }
    });

    return issues;
  }

  // Style analysis
  analyzeStyleIssues(file) {
    const issues = [];
    const lines = file.content.split("\n");

    lines.forEach((line, index) => {
      // Check indentation
      if (
        line.length > 0 &&
        !line.startsWith("  ") &&
        !line.startsWith("\t") &&
        line.startsWith(" ")
      ) {
        issues.push({
          id: `style-${file.path}-${index}`,
          file: file.path,
          line: index + 1,
          severity: "info",
          category: "style",
          rule: "indentation",
          message: "Inconsistent indentation",
          suggestion: "Use consistent indentation (2 spaces or 4 spaces)",
          code: line.trim(),
        });
      }

      // Check line length
      if (line.length > 120) {
        issues.push({
          id: `style-${file.path}-${index}`,
          file: file.path,
          line: index + 1,
          severity: "info",
          category: "style",
          rule: "line-length",
          message: "Line is too long",
          suggestion: "Break long lines for better readability",
          code: line.substring(0, 50) + "...",
        });
      }
    });

    return issues;
  }

  // Helper methods
  isCodeFile(path) {
    const codeExtensions = [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".py",
      ".java",
      ".go",
      ".rs",
      ".php",
      ".rb",
      ".cpp",
      ".c",
      ".cs",
    ];
    return (
      codeExtensions.some((ext) => path.endsWith(ext)) &&
      !path.includes("node_modules") &&
      !path.includes(".min.") &&
      !path.includes("dist/") &&
      !path.includes("build/")
    );
  }

  detectLanguage(path) {
    const ext = path.split(".").pop()?.toLowerCase();
    const languageMap = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      go: "go",
      rs: "rust",
      php: "php",
      rb: "ruby",
      cpp: "cpp",
      c: "c",
      cs: "csharp",
    };
    return languageMap[ext || ""] || "unknown";
  }

  calculateOverallScore(issues, fileCount) {
    const errorWeight = 10;
    const warningWeight = 5;
    const infoWeight = 1;

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

    const maxPossibleScore = fileCount * 10; // 10 points per file
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
      recommendations.push(
        "🔒 Address security vulnerabilities immediately - consider using security linting tools"
      );
    }

    if (issuesByCategory.performance > 5) {
      recommendations.push(
        "⚡ Optimize performance issues - focus on async operations and React optimizations"
      );
    }

    if (issuesByCategory.maintainability > 10) {
      recommendations.push(
        "🔧 Improve code maintainability - break down large functions and use meaningful constants"
      );
    }

    if (issuesByCategory.reliability > 0) {
      recommendations.push(
        "🛡️ Add error handling and remove debug statements for production readiness"
      );
    }

    if (issuesByCategory.style > 15) {
      recommendations.push(
        "✨ Implement consistent code formatting - consider using Prettier and ESLint"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "🎉 Great job! Your code quality is excellent with minimal issues found"
      );
    }

    return recommendations;
  }
}

export const codeAnalysisService = new CodeAnalysisService();
