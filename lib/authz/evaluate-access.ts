import type { AccessContext, AccessDecision, ResourceGroup } from "./types";

export function evaluateAccess(
  context: AccessContext,
  resourceGroup: ResourceGroup,
  requiredEntitlements: string[]
): AccessDecision {
  if (context.identity.status && context.identity.status !== "active") {
    return {
      allowed: false,
      reason: `Identity status is ${context.identity.status}`,
    };
  }

  if (context.deny.includes(resourceGroup)) {
    return {
      allowed: false,
      reason: `Resource group explicitly denied: ${resourceGroup}`,
    };
  }

  if (!context.allow.includes(resourceGroup)) {
    return {
      allowed: false,
      reason: `Resource group not allowed: ${resourceGroup}`,
    };
  }

  for (const entitlement of requiredEntitlements) {
    if (!context.entitlements.includes(entitlement)) {
      return {
        allowed: false,
        reason: `Missing entitlement: ${entitlement}`,
      };
    }
  }

  return {
    allowed: true,
    reason: "Access granted",
  };
}
