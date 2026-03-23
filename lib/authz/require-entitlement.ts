import { NextResponse } from "next/server";
import { evaluateAccess } from "./evaluate-access";
import { getAccessProfile } from "./profiles";
import type {
  AccessContext,
  IdentityContext,
  ResourceGroup,
  SubscriptionContext,
} from "./types";

export function buildAccessContext(
  identity: IdentityContext,
  subscription: SubscriptionContext
): AccessContext {
  const profile = getAccessProfile(identity.role);

  return {
    identity,
    subscription,
    entitlements: profile.entitlements,
    allow: profile.allow,
    deny: profile.deny,
  };
}

export function requireEntitlement(
  context: AccessContext,
  resourceGroup: ResourceGroup,
  requiredEntitlements: string[]
) {
  const decision = evaluateAccess(context, resourceGroup, requiredEntitlements);

  if (!decision.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: "forbidden",
        reason: decision.reason,
      },
      { status: 403 }
    );
  }

  return null;
}
