import type { RoutePolicy } from "./types";

export const ROUTE_POLICIES: RoutePolicy[] = [
  {
    route: "/api/docs/public/:slug",
    resourceGroup: "docs.public",
    requiredEntitlements: ["docs.read.public"],
  },
  {
    route: "/api/contributor/protocol",
    resourceGroup: "contributor.protocols",
    requiredEntitlements: ["contributor.protocol.read"],
  },
  {
    route: "/api/comments/submit",
    resourceGroup: "comments",
    requiredEntitlements: ["comment.submit"],
  },
  {
    route: "/api/downloads/toolkit-starter",
    resourceGroup: "downloads.starter",
    requiredEntitlements: ["downloads.starter"],
  },
  {
    route: "/api/downloads/toolkit-premium",
    resourceGroup: "downloads.premium",
    requiredEntitlements: ["downloads.premium"],
  },
  {
    route: "/api/runbooks/private/:slug",
    resourceGroup: "runbooks.private",
    requiredEntitlements: ["runbooks.read.private"],
  },
  {
    route: "/api/platform/read",
    resourceGroup: "api.platform.read",
    requiredEntitlements: ["api.platform.read"],
  },
  {
    route: "/api/platform/execute",
    resourceGroup: "api.platform.execute",
    requiredEntitlements: ["api.platform.execute"],
  },
  {
    route: "/api/admin/billing",
    resourceGroup: "billing.admin",
    requiredEntitlements: ["billing.admin"],
  },
];
