export const ROLES = ["owner", "admin", "staff", "superadmin"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "products.view",
  "products.write",
  "categories.write",
  "inventory.view",
  "inventory.write",
  "sales.view",
  "sales.write",
  "reports.view",
  "settings.view",
  "settings.write",
  "team.manage",
  // Platform-level capabilities, reserved for Samtech Labs super admins.
  "platform.view",
  "platform.manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<Role, Permission[] | ["*"]> = {
  owner: ["*"],
  admin: [
    "products.view",
    "products.write",
    "categories.write",
    "inventory.view",
    "inventory.write",
    "sales.view",
    "sales.write",
    "reports.view",
  ],
  staff: ["products.view", "inventory.view", "sales.view", "sales.write"],
  // Samtech Labs platform operators — full access plus the ability to pause
  // or resume the hosted site.
  superadmin: ["*"],
};

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Administrator",
  staff: "Staff",
  superadmin: "Super Admin",
};

/** Roles that may be assigned to a client's team through the admin UI. */
export const ASSIGNABLE_ROLES: Role[] = ["admin", "staff"];

export function isSuperAdmin(role: Role): boolean {
  return role === "superadmin";
}

export function hasPermission(
  role: Role,
  extraPermissions: string[] | undefined,
  permission: Permission,
): boolean {
  const base: string[] = ROLE_PERMISSIONS[role] ?? [];
  if (base.includes("*")) return true;
  if (base.includes(permission)) return true;
  return Boolean(extraPermissions?.includes(permission));
}

export function canViewFinancials(role: Role, extra: string[] | undefined) {
  return (
    role === "owner" ||
    role === "superadmin" ||
    hasPermission(role, extra, "reports.view") ||
    hasPermission(role, extra, "settings.view")
  );
}
