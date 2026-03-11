export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: Pagination;
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface Stats {
  domains: { total: number; scanned: number };
  subdomains: { total: number };
  ports: { total: number };
  probed: { total: number };
  vulnerabilities: {
    total: number;
    by_severity: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      info: number;
    };
  };
}

export interface Domain {
  id: number;
  name: string;
  is_scanned: boolean;
  created_at: string;
  subdomains_count?: number;
  ports_count?: number;
  vulns_count?: number;
}

export interface DomainStats {
  subdomains: number;
  ports: number;
  probed_hosts: number;
  vulnerabilities: number;
  vulnerability_breakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export interface Subdomain {
  id: number;
  name: string;
  domain_id: number;
  domain?: string;
  created_at: string;
}

export interface Port {
  id: number;
  host: string;
  ip: string;
  port: number;
  protocol: string;
  tls: boolean;
  subdomain?: string;
  created_at: string;
}

export interface ProbedHost {
  id: number;
  url: string;
  host: string;
  ip?: string;
  scheme: string;
  status_code: number;
  title?: string;
  tech?: string[];
  created_at: string;
}

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Vulnerability {
  id: number;
  host: string;
  name: string;
  severity: Severity;
  port?: string;
  matcher_name?: string;
  template_id?: string;
  tags?: string[];
  created_at: string;
}

export interface ApiToken {
  id: number;
  name: string;
  token?: string;
  created_at: string;
  expires_at?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  created_at: string;
}
