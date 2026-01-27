export interface PackageUsage {
  count: number;
  size?: string;
}

export interface UsageReport {
  packages: Record<string, PackageUsage>;
  fileUsage: Record<string, number>;
  unusedFiles: string[];
  unusedExports: Record<string, string[]>;
}

export interface AnalyzerOptions {
  rootPath: string;
  includeSizes: boolean;
}
