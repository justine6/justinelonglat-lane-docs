export type JltRole =
  | "public_visitor"
  | "guest_contributor"
  | "basic_member"
  | "toolkit_subscriber"
  | "platform_subscriber"
  | "advisory_client"
  | "admin"
  | "owner";

export type SubscriptionTier =
  | "none"
  | "starter"
  | "toolkit"
  | "platform"
  | "advisory"
  | "internal";

export type ResourceGroup =
  | "docs.public"
  | "docs.private"
  | "comments"
  | "contributor.protocols"
  | "downloads.starter"
  | "downloads.premium"
  | "toolkit.preview"
  | "toolkit.full"
  | "runbooks.public"
  | "runbooks.private"
  | "automation.templates.basic"
  | "automation.templates.premium"
  | "api.platform.read"
  | "api.platform.execute"
  | "api.admin"
  | "billing.customer"
  | "billing.admin";

export interface IdentityContext {
  userId: string;
  email?: string;
  provider?: string;
  role: JltRole;
  tenantType?: string;
  status?: "active" | "inactive" | "suspended";
}

export interface SubscriptionContext {
  tier: SubscriptionTier;
  status: "active" | "inactive" | "trial" | "expired";
  startedAt?: string | null;
  expiresAt?: string | null;
}

export interface AccessProfile {
  subscriptionTier: SubscriptionTier;
  entitlements: string[];
  allow: ResourceGroup[];
  deny: ResourceGroup[];
}

export interface AccessContext {
  identity: IdentityContext;
  subscription: SubscriptionContext;
  entitlements: string[];
  allow: ResourceGroup[];
  deny: ResourceGroup[];
}

export interface RoutePolicy {
  route: string;
  resourceGroup: ResourceGroup;
  requiredEntitlements: string[];
}

export interface AccessDecision {
  allowed: boolean;
  reason: string;
}
