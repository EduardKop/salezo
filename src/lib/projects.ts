export type MemberStatus = "pending" | "approved" | "rejected";
export type MemberRole = "owner" | "admin" | "sales_manager" | "viewer";

export type MemberProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export type ProjectMember = {
  id: string;
  project_id: string;
  user_id: string;
  status: MemberStatus;
  role: MemberRole;
  user_name: string | null;
  user_email: string | null;
  profiles?: MemberProfile | MemberProfile[] | null;
};

export type ProductInfo = {
  name: string;
  price: string;
};

export type ProjectDetailValue = string | boolean | string[] | ProductInfo[];

export type ProjectDetail = {
  name: string;
  information: ProjectDetailValue;
};

export type Project = {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
  join_key?: string;
  plan?: string;
  details: ProjectDetail[];
  members?: ProjectMember[];
  scripts_count?: number;
};

export function normalizeProfile(
  profile: ProjectMember["profiles"]
): MemberProfile | null {
  if (Array.isArray(profile)) {
    return profile[0] ?? null;
  }

  return profile ?? null;
}

export function isProductInfo(value: unknown): value is ProductInfo {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeProduct = value as Record<string, unknown>;
  return (
    typeof maybeProduct.name === "string" &&
    typeof maybeProduct.price === "string"
  );
}

export function isProductInfoList(value: unknown): value is ProductInfo[] {
  return Array.isArray(value) && value.every(isProductInfo);
}

export function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
