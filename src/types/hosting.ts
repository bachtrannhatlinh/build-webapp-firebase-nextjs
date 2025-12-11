export interface HostingRelease {
  id: string;
  version: string;
  status: "CREATED" | "FINALIZED" | "DELETED" | "ABANDONED" | "EXPIRED";
  createTime: Date;
  finalizeTime?: Date;
  message?: string;
  type: "DEPLOY" | "ROLLBACK" | "SITE_DISABLE";
}

export interface HostingSite {
  id: string;
  name: string;
  defaultUrl: string;
  type: "DEFAULT_SITE" | "USER_SITE";
  labels?: Record<string, string>;
}

export interface HostingConfig {
  site: string;
  public: string;
  ignore: string[];
  rewrites?: HostingRewrite[];
  redirects?: HostingRedirect[];
  headers?: HostingHeader[];
  cleanUrls?: boolean;
  trailingSlash?: boolean;
}

export interface HostingRewrite {
  source: string;
  destination?: string;
  function?: string;
  run?: {
    serviceId: string;
    region?: string;
  };
}

export interface HostingRedirect {
  source: string;
  destination: string;
  type: 301 | 302;
}

export interface HostingHeader {
  source: string;
  headers: Array<{
    key: string;
    value: string;
  }>;
}

export interface DeploymentStatus {
  status: "idle" | "building" | "deploying" | "success" | "error";
  message: string;
  progress?: number;
}

export interface HostingDomain {
  id: string;
  domainName: string;
  status: "PENDING" | "ACTIVE" | "REQUIRES_VERIFICATION" | "EXPIRED";
  updateTime: Date;
  provisioning?: {
    certStatus: string;
    dnsStatus: string;
  };
}
