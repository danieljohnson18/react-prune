export interface PackageUsage {
  count: number;
  size?: string;
}

export interface UsageReport {
  packages: Record<string, PackageUsage>;
  // fileUsage: Record<string, number>; // Removed in favor of unusedFiles tracking
  unusedFiles: string[];
  unusedExports: Record<string, string[]>;
  usedExports?: Record<string, Set<string>>;
  unusedDependencies?: string[];
  sourceFiles?: Record<string, any>; // ts-morph SourceFile
}

export interface AnalyzerOptions {
  rootPath: string;
  includeSizes: boolean;
  analyzeExports?: boolean;
  silent?: boolean;
}
