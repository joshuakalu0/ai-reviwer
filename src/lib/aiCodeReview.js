class AICodeReviewService {
  constructor() {
    this.patterns = {
      security: [
        { pattern: /eval\s*\(/, severity: 'critical', message: 'Code injection vulnerability', suggestion: 'Use JSON.parse() or safer alternatives' },
        { pattern: /innerHTML\s*=/, severity: 'high', message: 'XSS vulnerability', suggestion: 'Use textContent or DOM methods' },
        { pattern: /document\.write/, severity: 'high', message: 'XSS vulnerability', suggestion: 'Use modern DOM manipulation' },
        { pattern: /\$\{.*\}.*sql/i, severity: 'critical', message: 'SQL injection risk', suggestion: 'Use parameterized queries' },
        { pattern: /(password|secret|token|key)\s*[:=]\s*["'][^"']+["']/i, severity: 'critical', message: 'Hardcoded credentials', suggestion: 'Use environment variables' },
        { pattern: /Math\.random\(\).*security/i, severity: 'medium', message: 'Weak randomness', suggestion: 'Use crypto.getRandomValues()' }
      ],
      performance: [
        { pattern: /for\s*\(.*\.length.*\)/, severity: 'medium', message: 'Inefficient loop', suggestion: 'Cache array length' },
        { pattern: /\.forEach\(.*await/, severity: 'high', message: 'Sequential async operations', suggestion: 'Use Promise.all() for parallel execution' },
        { pattern: /new\s+RegExp\s*\(/, severity: 'medium', message: 'Runtime regex compilation', suggestion: 'Use regex literals' },
        { pattern: /\+\s*["'].*["']\s*\+/, severity: 'low', message: 'String concatenation', suggestion: 'Use template literals' },
        { pattern: /document\.getElementById.*loop/i, severity: 'medium', message: 'DOM query in loop', suggestion: 'Cache DOM references' }
      ],
      bugs: [
        { pattern: /==\s*null/, severity: 'medium', message: 'Loose equality with null', suggestion: 'Use === null or == null consistently' },
        { pattern: /typeof.*==\s*["']undefined["']/, severity: 'low', message: 'Verbose undefined check', suggestion: 'Use === undefined' },
        { pattern: /parseInt\([^,)]*\)/, severity: 'medium', message: 'Missing radix parameter', suggestion: 'Always specify radix: parseInt(value, 10)' },
        { pattern: /new\s+Array\(\d+\)/, severity: 'low', message: 'Array constructor with single number', suggestion: 'Use array literal []' },
        { pattern: /catch\s*\([^)]*\)\s*\{\s*\}/, severity: 'high', message: 'Empty catch block', suggestion: 'Handle or log errors properly' }
      ],
      codeSmells: [
        { pattern: /function\s+\w+\s*\([^)]*\)\s*\{[\s\S]{500,}?\}/, severity: 'medium', message: 'Large function', suggestion: 'Break into smaller functions' },
        { pattern: /if\s*\([^)]*\)\s*\{[\s\S]*?\}\s*else\s*if[\s\S]{200,}/, severity: 'medium', message: 'Long if-else chain', suggestion: 'Consider switch statement or strategy pattern' },
        { pattern: /\/\*[\s\S]*?\*\/|\/\/.*TODO|\/\/.*FIXME/i, severity: 'low', message: 'TODO/FIXME comment', suggestion: 'Address technical debt' },
        { pattern: /console\.log|console\.debug|console\.warn/, severity: 'low', message: 'Debug statement', suggestion: 'Remove or use proper logging' },
        { pattern: /var\s+/, severity: 'low', message: 'Use of var', suggestion: 'Use let or const instead' }
      ],
      bestPractices: [
        { pattern: /function.*\{[\s\S]*?return[\s\S]*?return/, severity: 'medium', message: 'Multiple return statements', suggestion: 'Consider single return point' },
        { pattern: /\w+\s*=\s*\w+\s*\?\s*\w+\s*:\s*\w+/, severity: 'low', message: 'Ternary operator', suggestion: 'Consider if-else for complex conditions' },
        { pattern: /\.then\(.*\.then\(/s, severity: 'medium', message: 'Promise chain', suggestion: 'Consider async/await' },
        { pattern: /useEffect\([^,]*\)(?!\s*,\s*\[)/, severity: 'medium', message: 'Missing useEffect dependencies', suggestion: 'Add dependency array' }
      ]
    };
  }

  async analyzeCode(files) {
    const results = [];
    
    for (const file of files) {
      const fileAnalysis = await this.analyzeFile(file);
      results.push(...fileAnalysis);
    }

    return this.generateReport(results);
  }

  async analyzeFile(file) {
    const issues = [];
    const lines = file.content.split('\n');
    
    // Pattern-based analysis
    for (const [category, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        const matches = this.findPatternMatches(file.content, pattern, lines);
        issues.push(...matches.map(match => ({
          ...match,
          category,
          file: file.path,
          language: file.language
        })));
      }
    }

    // Language-specific analysis
    const langSpecificIssues = await this.analyzeLanguageSpecific(file, lines);
    issues.push(...langSpecificIssues);

    // Complexity analysis
    const complexityIssues = this.analyzeComplexity(file, lines);
    issues.push(...complexityIssues);

    return issues;
  }

  findPatternMatches(content, pattern, lines) {
    const matches = [];
    
    lines.forEach((line, index) => {
      if (pattern.pattern.test(line)) {
        matches.push({
          line: index + 1,
          code: line.trim(),
          severity: pattern.severity,
          message: pattern.message,
          suggestion: pattern.suggestion,
          confidence: this.calculateConfidence(line, pattern)
        });
      }
    });

    return matches;
  }

  async analyzeLanguageSpecific(file, lines) {
    const issues = [];
    
    if (file.language === 'javascript' || file.language === 'typescript') {
      issues.push(...this.analyzeJavaScript(lines));
    } else if (file.language === 'python') {
      issues.push(...this.analyzePython(lines));
    } else if (file.language === 'java') {
      issues.push(...this.analyzeJava(lines));
    }

    return issues;
  }

  analyzeJavaScript(lines) {
    const issues = [];
    
    lines.forEach((line, index) => {
      // React-specific checks
      if (line.includes('useState') && !line.includes('const')) {
        issues.push({
          line: index + 1,
          code: line.trim(),
          severity: 'medium',
          category: 'bestPractices',
          message: 'useState should be destructured with const',
          suggestion: 'Use const [state, setState] = useState()',
          confidence: 0.8
        });
      }

      // Async/await checks
      if (line.includes('await') && !line.includes('try')) {
        const surroundingLines = lines.slice(Math.max(0, index - 2), index + 3);
        if (!surroundingLines.some(l => l.includes('try') || l.includes('catch'))) {
          issues.push({
            line: index + 1,
            code: line.trim(),
            severity: 'medium',
            category: 'bugs',
            message: 'Unhandled async operation',
            suggestion: 'Wrap in try-catch block',
            confidence: 0.7
          });
        }
      }

      // Memory leak checks
      if (line.includes('addEventListener') && !lines.slice(index, index + 10).some(l => l.includes('removeEventListener'))) {
        issues.push({
          line: index + 1,
          code: line.trim(),
          severity: 'medium',
          category: 'performance',
          message: 'Potential memory leak',
          suggestion: 'Add corresponding removeEventListener',
          confidence: 0.6
        });
      }
    });

    return issues;
  }

  analyzePython(lines) {
    const issues = [];
    
    lines.forEach((line, index) => {
      if (line.includes('except:') && !line.includes('Exception')) {
        issues.push({
          line: index + 1,
          code: line.trim(),
          severity: 'medium',
          category: 'bugs',
          message: 'Bare except clause',
          suggestion: 'Specify exception type',
          confidence: 0.9
        });
      }

      if (line.includes('import *')) {
        issues.push({
          line: index + 1,
          code: line.trim(),
          severity: 'low',
          category: 'bestPractices',
          message: 'Wildcard import',
          suggestion: 'Import specific modules',
          confidence: 0.8
        });
      }
    });

    return issues;
  }

  analyzeJava(lines) {
    const issues = [];
    
    lines.forEach((line, index) => {
      if (line.includes('System.out.print') && !line.includes('test')) {
        issues.push({
          line: index + 1,
          code: line.trim(),
          severity: 'low',
          category: 'bestPractices',
          message: 'Debug print statement',
          suggestion: 'Use proper logging framework',
          confidence: 0.7
        });
      }
    });

    return issues;
  }

  analyzeComplexity(file, lines) {
    const issues = [];
    let cyclomaticComplexity = 1;
    let nestingLevel = 0;
    let maxNesting = 0;

    lines.forEach((line, index) => {
      // Count complexity indicators
      if (/\b(if|while|for|case|catch)\b/.test(line)) {
        cyclomaticComplexity++;
      }

      // Track nesting
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      nestingLevel += openBraces - closeBraces;
      maxNesting = Math.max(maxNesting, nestingLevel);

      if (nestingLevel > 4) {
        issues.push({
          line: index + 1,
          code: line.trim(),
          severity: 'medium',
          category: 'codeSmells',
          message: 'Deep nesting detected',
          suggestion: 'Consider extracting methods or early returns',
          confidence: 0.8
        });
      }
    });

    if (cyclomaticComplexity > 10) {
      issues.push({
        line: 1,
        code: `File: ${file.path}`,
        severity: 'high',
        category: 'codeSmells',
        message: `High cyclomatic complexity: ${cyclomaticComplexity}`,
        suggestion: 'Break down into smaller functions',
        confidence: 0.9
      });
    }

    return issues;
  }

  calculateConfidence(line, pattern) {
    let confidence = 0.5;
    
    // Increase confidence based on context
    if (line.includes('//') || line.includes('/*')) confidence -= 0.2; // Comments reduce confidence
    if (line.trim().length < 10) confidence -= 0.1; // Very short lines
    if (/\b(test|spec|mock)\b/i.test(line)) confidence -= 0.3; // Test files
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  generateReport(issues) {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const sortedIssues = issues.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

    const summary = {
      total: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length,
      categories: {
        security: issues.filter(i => i.category === 'security').length,
        performance: issues.filter(i => i.category === 'performance').length,
        bugs: issues.filter(i => i.category === 'bugs').length,
        codeSmells: issues.filter(i => i.category === 'codeSmells').length,
        bestPractices: issues.filter(i => i.category === 'bestPractices').length
      }
    };

    const score = this.calculateQualityScore(summary);
    const recommendations = this.generateRecommendations(summary);

    return {
      summary,
      score,
      recommendations,
      issues: sortedIssues,
      timestamp: new Date().toISOString()
    };
  }

  calculateQualityScore(summary) {
    const weights = { critical: 20, high: 10, medium: 5, low: 1 };
    const totalDeductions = Object.entries(weights).reduce((sum, [severity, weight]) => {
      return sum + (summary[severity] * weight);
    }, 0);

    const maxScore = 100;
    const score = Math.max(0, maxScore - totalDeductions);
    
    return {
      score: Math.round(score),
      grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
      status: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Improvement' : 'Poor'
    };
  }

  generateRecommendations(summary) {
    const recommendations = [];

    if (summary.critical > 0) {
      recommendations.push({
        priority: 'critical',
        message: `🚨 Fix ${summary.critical} critical security issues immediately`,
        action: 'Review and fix all critical vulnerabilities before deployment'
      });
    }

    if (summary.categories.security > 0) {
      recommendations.push({
        priority: 'high',
        message: '🔒 Implement security best practices',
        action: 'Use HTTPS, input validation, and secure coding practices'
      });
    }

    if (summary.categories.performance > 5) {
      recommendations.push({
        priority: 'medium',
        message: '⚡ Optimize performance bottlenecks',
        action: 'Focus on async operations, caching, and efficient algorithms'
      });
    }

    if (summary.categories.bugs > 3) {
      recommendations.push({
        priority: 'medium',
        message: '🐛 Address potential bugs',
        action: 'Add error handling, fix type issues, and improve validation'
      });
    }

    if (summary.categories.codeSmells > 10) {
      recommendations.push({
        priority: 'low',
        message: '🔧 Refactor code smells',
        action: 'Break down large functions, reduce complexity, and improve readability'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'info',
        message: '🎉 Excellent code quality!',
        action: 'Continue following best practices and regular code reviews'
      });
    }

    return recommendations;
  }
}

export const aiCodeReviewService = new AICodeReviewService();