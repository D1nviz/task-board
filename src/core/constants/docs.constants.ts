export const DOCS_TAGS = {
  health: "Health",
  auth: "Auth",
  boards: "Boards",
  columns: "Columns",
  labels: "Labels",
  tasks: "Tasks",
  notes: "Notes",
} as const;

export const SECURITY_SCHEMES = {
  cookieAuth: "cookieAuth",
} as const;

export const COOKIE_SECURITY = [{ [SECURITY_SCHEMES.cookieAuth]: [] }];

export const DOCS_ROUTE_PREFIX = "/docs";
