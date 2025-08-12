// Simplified AI-powered code analysis service without external dependencies
// This version uses pattern matching and heuristics to simulate AI analysis

class AICodeAnalysisService {
  isInitialized = true; // Always available since it's pattern-based

  // AI-powered code analysis using advanced pattern matching
  async analyzeCodeWithAI(fileContent, fileName, language) {
    const summary = await this.generateCodeSummary(
      fileContent,
      fileName,
      language
    );
    const suggestions = await this.generateAISuggestions(fileContent, language);
    const securityRisks = await this.analyzeSecurityWithAI(
      fileContent,
      language
    );
    const performanceInsights = await this.analyzePerformanceWithAI(
      fileContent,
      language
    );
    const maintainabilityTips = await this.analyzeMaintainabilityWithAI(
      fileContent,
      language
    );
    const bugPredictions = await this.predictBugsWithAI(fileContent, language);
    const codeQualityScore = await this.calculateAIQualityScore(
      fileContent,
      language
    );

    return {
      summary,
      codeQualityScore,
      suggestions,
      securityRisks,
      performanceInsights,
      maintainabilityTips,
      bugPredictions,
    };
  }

  // Generate intelligent code summary using pattern analysis
  async generateCodeSummary(code, fileName, language) {
    const lines = code.split("\n").filter((line) => line.trim().length > 0);
    const functions = this.extractFunctions(code, language);
    const classes = this.extractClasses(code, language);
    const imports = this.extractImports(code, language);

    let summary = `${fileName} is a ${language} file with ${lines.length} lines of code`;

    if (functions.length > 0) {
      summary += `, containing ${functions.length} function${
        functions.length === 1 ? "" : "s"
      }`;
      const mainFunction = functions.find(
        (f) =>
          f.includes("main") || f.includes("index") || f.includes("default")
      );
      if (mainFunction) {
        summary += ` including a main function`;
      }
    }

    if (classes.length > 0) {
      summary += ` and ${classes.length} class${
        classes.length === 1 ? "" : "es"
      }`;
    }

    if (imports.length > 0) {
      summary += `. It imports ${imports.length} module${
        imports.length === 1 ? "" : "s"
      }`;
    }

    // Quality assessment
    const complexity = this.calculateComplexity(code);
    if (complexity > 10) {
      summary +=
        ". The code has high complexity and may benefit from refactoring.";
    } else if (complexity > 5) {
      summary += ". The code has moderate complexity.";
    } else {
      summary += ". The code appears well-structured with low complexity.";
    }

    return summary;
  }

  // Generate AI-powered code suggestions using advanced pattern recognition
  async generateAISuggestions(code, language) {
    const suggestions = [];

    // Security suggestions
    if (code.includes("eval(")) {
      suggestions.push({
        type: "fix",
        title: "Remove eval() for Security",
        description:
          "eval() usage detected - this is a critical security vulnerability",
        code: "eval(userInput)",
        suggestedCode: "JSON.parse(userInput) // or use a proper parser",
        confidence: 0.95,
        reasoning:
          "eval() can execute arbitrary code and is a major security risk. Use safer alternatives like JSON.parse() for data parsing.",
      });
    }

    // Performance suggestions
    if (language.includes("javascript") || language.includes("typescript")) {
      const inefficientLoops = code.match(/for\s*\([^)]*\.length[^)]*\)/g);
      if (inefficientLoops && inefficientLoops.length > 0) {
        suggestions.push({
          type: "optimization",
          title: "Optimize Loop Performance",
          description:
            "Cache array length in loop conditions for better performance",
          code: "for (let i = 0; i < array.length; i++)",
          suggestedCode: "for (let i = 0, len = array.length; i < len; i++)",
          confidence: 0.8,
          reasoning:
            "Caching array length prevents repeated property access and improves loop performance, especially for large arrays.",
        });
      }

      // React-specific suggestions
      if (code.includes("useEffect") && !code.includes("[]")) {
        suggestions.push({
          type: "optimization",
          title: "Add useEffect Dependency Array",
          description:
            "Missing dependency array may cause unnecessary re-renders",
          code: "useEffect(() => { ... })",
          suggestedCode: "useEffect(() => { ... }, [dependency])",
          confidence: 0.85,
          reasoning:
            "useEffect without dependency array runs on every render. Add dependencies to control when the effect should run.",
        });
      }
    }

    // Maintainability suggestions
    if (code.includes("console.log")) {
      suggestions.push({
        type: "refactor",
        title: "Replace Debug Statements",
        description:
          "Remove or replace console.log statements with proper logging",
        code: "console.log(data)",
        suggestedCode: "logger.debug(data) // or remove entirely",
        confidence: 0.7,
        reasoning:
          "Console statements should be removed from production code. Use a proper logging framework instead.",
      });
    }

    // Code duplication detection
    const duplicatedPatterns = this.findDuplicatedCode(code);
    if (duplicatedPatterns.length > 0) {
      suggestions.push({
        type: "refactor",
        title: "Extract Common Code",
        description:
          "Duplicate code patterns detected - consider extracting to functions",
        code: duplicatedPatterns[0],
        suggestedCode:
          "extractedFunction() // Move common code to reusable function",
        confidence: 0.75,
        reasoning:
          "Code duplication increases maintenance burden. Extract common patterns into reusable functions.",
      });
    }

    // Variable naming suggestions
    const poorVariableNames = code.match(
      /\b[a-z]\b|\btemp\b|\bdata\b|\binfo\b/g
    );
    if (poorVariableNames && poorVariableNames.length > 3) {
      suggestions.push({
        type: "refactor",
        title: "Improve Variable Names",
        description:
          "Use more descriptive variable names for better code readability",
        code: "let a = getData(); let temp = process(a);",
        suggestedCode:
          "let userData = getUserData(); let processedData = processUserData(userData);",
        confidence: 0.65,
        reasoning:
          "Descriptive variable names make code self-documenting and easier to understand and maintain.",
      });
    }

    return suggestions.slice(0, 8); // Limit to top 8 suggestions
  }

  // Advanced security analysis
  async analyzeSecurityWithAI(code, language) {
    const risks = [];

    // Critical security patterns
    if (code.includes("eval(")) {
      risks.push(
        "🚨 CRITICAL: eval() usage detected - immediate code injection vulnerability"
      );
    }

    if (code.includes("innerHTML") && !code.includes("sanitiz")) {
      risks.push(
        "⚠️ HIGH: innerHTML usage without sanitization - XSS vulnerability risk"
      );
    }

    if (code.includes("dangerouslySetInnerHTML")) {
      risks.push(
        "⚠️ HIGH: dangerouslySetInnerHTML requires careful input sanitization"
      );
    }

    // Credential detection with advanced patterns
    const credentialPatterns = [
      /(?:password|secret|key|token|api_key)\s*[:=]\s*["'][^"']{8,}["']/i,
      /(?:auth|bearer|jwt)\s*[:=]\s*["'][^"']{20,}["']/i,
      /(?:private_key|secret_key)\s*[:=]\s*["'][^"']+["']/i,
    ];

    for (const pattern of credentialPatterns) {
      if (pattern.test(code)) {
        risks.push(
          "🔑 CRITICAL: Hardcoded credentials detected - move to environment variables"
        );
        break;
      }
    }

    // SQL injection patterns
    if (
      code.includes("query") &&
      code.includes("+") &&
      (code.includes("SELECT") || code.includes("INSERT"))
    ) {
      risks.push(
        "💉 HIGH: Potential SQL injection - use parameterized queries"
      );
    }

    // Path traversal
    if (code.includes("../") || code.includes("..\\")) {
      risks.push(
        "📁 MEDIUM: Path traversal patterns detected - validate file paths"
      );
    }

    // Weak random number generation
    if (
      code.includes("Math.random()") &&
      (code.includes("password") || code.includes("token"))
    ) {
      risks.push(
        "🎲 MEDIUM: Weak random number generation for security purposes"
      );
    }

    return risks.length > 0
      ? risks
      : ["✅ No critical security vulnerabilities detected by AI analysis"];
  }

  // Performance analysis with AI insights
  async analyzePerformanceWithAI(code, language) {
    const insights = [];

    // Synchronous operations
    const syncPatterns = ["fs.readFileSync", "fs.writeFileSync", "execSync"];
    for (const pattern of syncPatterns) {
      if (code.includes(pattern)) {
        insights.push(
          `⚡ Replace ${pattern} with async alternative to prevent blocking`
        );
      }
    }

    // Memory leaks
    if (code.includes("setInterval") && !code.includes("clearInterval")) {
      insights.push(
        "🔄 Potential memory leak: setInterval without clearInterval"
      );
    }

    // Inefficient DOM operations
    if (
      code.includes("document.getElementById") &&
      code.split("document.getElementById").length > 3
    ) {
      insights.push(
        "🎯 Cache DOM elements instead of repeated getElementById calls"
      );
    }

    // Large object copying
    if (code.includes("JSON.parse(JSON.stringify")) {
      insights.push(
        "📦 Deep cloning with JSON is inefficient - use structured cloning or libraries"
      );
    }

    // React performance anti-patterns
    if (language.includes("javascript") || language.includes("typescript")) {
      if (code.includes("render()") && code.includes("bind(this)")) {
        insights.push(
          "⚛️ Avoid binding in render methods - use arrow functions or constructor binding"
        );
      }

      if (
        code.includes("useState") &&
        code.includes("useEffect") &&
        !code.includes("useCallback")
      ) {
        const effectCount = (code.match(/useEffect/g) || []).length;
        if (effectCount > 3) {
          insights.push(
            "⚛️ Consider useCallback for expensive computations in multiple useEffect hooks"
          );
        }
      }
    }

    // Algorithm complexity
    const nestedLoops = (code.match(/for[\s\S]*for/g) || []).length;
    if (nestedLoops > 2) {
      insights.push(
        "🔁 High algorithmic complexity detected - consider optimization or different data structures"
      );
    }

    return insights.length > 0
      ? insights
      : ["✅ No major performance issues detected by AI analysis"];
  }

  // Maintainability analysis
  async analyzeMaintainabilityWithAI(code, language) {
    const tips = [];

    // Function length analysis
    const longFunctions = this.findLongFunctions(code);
    if (longFunctions.length > 0) {
      tips.push(
        `📏 ${longFunctions.length} function(s) exceed 50 lines - consider breaking them down`
      );
    }

    // Complexity analysis
    const complexity = this.calculateComplexity(code);
    if (complexity > 15) {
      tips.push(
        "🧩 High cyclomatic complexity detected - refactor conditional logic"
      );
    }

    // Magic numbers
    const magicNumbers = (code.match(/\b(?!0|1|2|10|100|1000)\d+\b/g) || [])
      .length;
    if (magicNumbers > 5) {
      tips.push("🔢 Multiple magic numbers found - extract to named constants");
    }

    // Comments ratio
    const totalLines = code.split("\n").length;
    const commentLines = (code.match(/\/\/|\/\*|\*/g) || []).length;
    const commentRatio = commentLines / totalLines;
    if (commentRatio < 0.1 && totalLines > 50) {
      tips.push(
        "📝 Low comment ratio - add explanatory comments for complex logic"
      );
    }

    // Import organization
    const imports = (code.match(/^import|^const.*require/gm) || []).length;
    if (imports > 15) {
      tips.push(
        "📦 Many imports detected - consider organizing into groups or barrel exports"
      );
    }

    return tips.length > 0
      ? tips
      : ["✅ Code follows good maintainability practices"];
  }

  // Bug prediction using pattern analysis
  async predictBugsWithAI(code, language) {
    const predictions = [];

    // Null/undefined access
    const nullChecks = (code.match(/\?\./g) || []).length;
    const dotAccesses = (code.match(/\w+\.\w+/g) || []).length;
    if (dotAccesses > 10 && nullChecks < 3) {
      predictions.push(
        "❓ High risk of null/undefined errors - add more null checks or optional chaining"
      );
    }

    // Async/await without error handling
    if (
      code.includes("await") &&
      !code.includes("try") &&
      !code.includes("catch")
    ) {
      predictions.push(
        "🚫 Async operations without error handling - wrap in try-catch blocks"
      );
    }

    // Array access without bounds checking
    if (code.includes("[") && code.includes("length") && !code.includes("if")) {
      predictions.push(
        "🔢 Potential array index out of bounds - add length validation"
      );
    }

    // Type coercion issues
    if (
      language.includes("javascript") &&
      code.includes("==") &&
      !code.includes("===")
    ) {
      predictions.push(
        "⚖️ Type coercion with == operator may cause unexpected behavior"
      );
    }

    // Memory leaks
    if (
      code.includes("addEventListener") &&
      !code.includes("removeEventListener")
    ) {
      predictions.push(
        "🔄 Potential memory leak - event listeners without cleanup"
      );
    }

    // Race conditions
    if (
      (code.match(/setTimeout|setInterval/g) || []).length > 2 &&
      code.includes("state")
    ) {
      predictions.push(
        "⏱️ Potential race condition with timers and state updates"
      );
    }

    return predictions.length > 0
      ? predictions
      : ["✅ No obvious bug patterns detected by AI analysis"];
  }

  // Calculate AI-enhanced quality score
  async calculateAIQualityScore(code, language) {
    let score = 100;

    // Complexity penalty
    const complexity = this.calculateComplexity(code);
    score -= Math.min(30, complexity * 2);

    // Security penalty
    if (code.includes("eval(")) score -= 40;
    if (/(?:password|secret|key)\s*[:=]\s*["'][^"']*["']/i.test(code))
      score -= 35;
    if (code.includes("innerHTML") && !code.includes("sanitiz")) score -= 25;

    // Performance penalty
    if (code.includes("fs.readFileSync")) score -= 20;
    if ((code.match(/for[\s\S]*for/g) || []).length > 1) score -= 15;

    // Maintainability bonus/penalty
    const commentRatio =
      (code.match(/\/\/|\/\*/g) || []).length / code.split("\n").length;
    if (commentRatio > 0.15) score += 10;
    if (commentRatio < 0.05) score -= 10;

    // Code style penalty
    const longLines = code
      .split("\n")
      .filter((line) => line.length > 120).length;
    score -= Math.min(15, longLines * 2);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // Utility methods for pattern analysis
  extractFunctions(code, language) {
    const patterns = [
      /function\s+(\w+)/g,
      /const\s+(\w+)\s*=\s*(?:async\s+)?\(/g,
      /(\w+)\s*:\s*(?:async\s+)?function/g,
      /(\w+)\s*=>\s*/g,
    ];

    const functions = [];
    for (const pattern of patterns) {
      const matches = code.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) functions.push(match[1]);
      }
    }
    return functions;
  }

  extractClasses(code, language) {
    const classMatches = code.matchAll(/class\s+(\w+)/g);
    return Array.from(classMatches, (match) => match[1]);
  }

  extractImports(code, language) {
    const importMatches = code.matchAll(/^(?:import|const.*require)/gm);
    return Array.from(importMatches, (match) => match[0]);
  }

  calculateComplexity(code) {
    const complexityMarkers = [
      "if",
      "else",
      "for",
      "while",
      "switch",
      "case",
      "catch",
      "&&",
      "||",
      "?",
      ":",
      "try",
      "finally",
    ];

    let complexity = 1;
    for (const marker of complexityMarkers) {
      const matches = code.split(marker).length - 1;
      complexity += matches;
    }
    return complexity;
  }

  findLongFunctions(code) {
    const lines = code.split("\n");
    const longFunctions = [];
    let currentFunction = null;
    let functionLineCount = 0;
    let braceCount = 0;

    for (const line of lines) {
      if (
        line.includes("function ") ||
        (line.includes("=>") && line.includes("{"))
      ) {
        currentFunction = line.trim();
        functionLineCount = 1;
        braceCount =
          (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      } else if (currentFunction) {
        functionLineCount++;
        braceCount +=
          (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;

        if (braceCount <= 0) {
          if (functionLineCount > 50) {
            longFunctions.push(currentFunction);
          }
          currentFunction = null;
        }
      }
    }

    return longFunctions;
  }

  findDuplicatedCode(code) {
    const lines = code.split("\n").filter((line) => line.trim().length > 5);
    const duplicates = [];
    const lineGroups = new Map();

    // Check for repeated 3-line patterns
    for (let i = 0; i < lines.length - 2; i++) {
      const pattern = lines
        .slice(i, i + 3)
        .map((line) => line.trim())
        .join("\n");
      if (pattern.length > 30) {
        lineGroups.set(pattern, (lineGroups.get(pattern) || 0) + 1);
      }
    }

    for (const [pattern, count] of lineGroups) {
      if (count > 1) {
        duplicates.push(pattern.substring(0, 60) + "...");
      }
    }

    return duplicates;
  }
}

export const aiCodeAnalysisService = new AICodeAnalysisService();
