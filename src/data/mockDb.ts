import { Branch, Match, Notice, User, Membership, Performance, Attendance } from "@/types/dashboard";

export const BRANCHES: Branch[] = [
  { id: "samarth", name: "Samarth Cricket Academy", location: "Main Branch, Pune" },
  { id: "aims", name: "AIMS Academy", location: "Second Branch, Mumbai" }
];

export const MOCK_NOTICES: Notice[] = [
  {
    id: "n1",
    branch_id: "samarth",
    title: "Morning Practice Rescheduled",
    message: "Morning nets for Pro Elite batch moved to 7:00 AM due to maintenance.",
    date: "2026-04-13",
    important: true
  },
  {
    id: "n2",
    branch_id: "samarth",
    title: "Monthly Selection Trials",
    message: "Trials for the upcoming state-level tournament will be held next weekend.",
    date: "2026-04-20",
    important: false
  },
  {
    id: "n3",
    branch_id: "aims",
    title: "Mumbai Inter-Academy League",
    message: "Registrations open for the summer league. Contact head coach for details.",
    date: "2026-04-15",
    important: true
  }
];

export const MOCK_MATCHES: Match[] = [
  {
    id: "m1",
    branch_id: "samarth",
    teams: "Samarth Eagles vs Eagles XI",
    date: "2026-04-10",
    time: "09:00 AM",
    venue: "Main Ground",
    fee: 0,
    status: "Completed",
    result: "Won by 4 wickets"
  },
  {
    id: "m2",
    branch_id: "samarth",
    teams: "Rising Suns vs Samarth Eagles",
    date: "2026-04-15",
    time: "09:00 AM",
    venue: "Main Ground",
    fee: 500,
    status: "Upcoming"
  },
  {
    id: "m3",
    branch_id: "aims",
    teams: "AIMS Stars vs Mumbai Titans",
    date: "2026-04-18",
    time: "03:00 PM",
    venue: "AIMS Arena",
    fee: 300,
    status: "Upcoming"
  }
];

export const MOCK_PERFORMANCE: Performance[] = [
  { id: "p1", user_id: "u1", match_id: "m1", runs: 42, wickets: 1 }
];

export const MOCK_ATTENDANCE: Attendance[] = [
  { id: "a1", user_id: "u1", date: "2026-04-01", status: "Present" },
  { id: "a2", user_id: "u1", date: "2026-04-02", status: "Present" },
  { id: "a3", user_id: "u1", date: "2026-04-03", status: "Absent" },
  { id: "a4", user_id: "u1", date: "2026-04-04", status: "Present" },
  { id: "a5", user_id: "u1", date: "2026-04-05", status: "Present" }
];
