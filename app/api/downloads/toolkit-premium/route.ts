import { NextResponse } from "next/server";
import {
  buildAccessContext,
  requireEntitlement,
} from "@/lib/authz/require-entitlement";

export async function GET() {
  const identity = {
    userId: "abc123",
    email: "guest@example.com",
    provider: "microsoft-365",
    role: "guest_contributor" as const,
    tenantType: "external_guest",
    status: "active" as const,
  };

  const subscription = {
    tier: "none" as const,
    status: "inactive" as const,
    startedAt: null,
    expiresAt: null,
  };

  const context = buildAccessContext(identity, subscription);

  const denied = requireEntitlement(
    context,
    "downloads.premium",
    ["downloads.premium"]
  );

  if (denied) return denied;

  return NextResponse.json({
    ok: true,
    message: "Premium download access granted",
  });
}
