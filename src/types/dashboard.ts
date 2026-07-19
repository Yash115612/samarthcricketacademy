export type UserRole = "player" | "admin";
export type BranchId = string;
export type MembershipStatus = "Active" | "Expired" | "Pending";
export type AttendanceStatus = "Present" | "Absent";

export interface Branch {
  id: BranchId;
  name: string;
  location: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  branch_id: BranchId;
  role: UserRole;
  experience?: string;
  isProfileComplete: boolean;
  membership_status: "none" | "active" | "expired" | "pending" | "rejected";
}

export interface Membership {
  id: string;
  user_id: string;
  plan: string;
  start_date: string;
  expiry_date: string;
  status: MembershipStatus;
}

export interface Match {
  id: string;
  branch_id: BranchId;
  teams: string;
  date: string;
  time: string;
  venue: string;
  fee: number;
  status: "Upcoming" | "Live" | "Completed";
  result?: string;
}

export interface MatchParticipant {
  id: string;
  match_id: string;
  user_id: string;
  status: "Confirmed" | "Pending";
}

export interface Performance {
  id: string;
  user_id: string;
  match_id: string;
  runs: number;
  wickets: number;
}

export interface Attendance {
  id: string;
  user_id: string;
  date: string;
  status: AttendanceStatus;
}

export interface Notice {
  id: string;
  branch_id: BranchId;
  title: string;
  message: string;
  date: string;
  important: boolean;
}
