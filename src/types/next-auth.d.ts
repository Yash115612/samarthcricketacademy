import "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      user_id?: string;
      branch_id?: "samarth" | "aims" | null;
      role?: "player" | "admin" | "staff";
      isProfileComplete?: boolean;
      membership_status?: string;
      permissions?: {
        manageFees?: boolean;
        manageClients?: boolean;
        manageAttendance?: boolean;
        manageMatches?: boolean;
        manageEnquiries?: boolean;
      };
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user_id?: string;
    branch_id?: "samarth" | "aims" | null;
    role?: "player" | "admin" | "staff";
    isProfileComplete?: boolean;
    membership_status?: string;
    permissions?: {
      manageFees?: boolean;
      manageClients?: boolean;
      manageAttendance?: boolean;
      manageMatches?: boolean;
      manageEnquiries?: boolean;
    };
  }
}

