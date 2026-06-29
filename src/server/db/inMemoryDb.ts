import "server-only";

import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { BranchId, MembershipStatus, UserRole } from "@/types/dashboard";

export type DbId = string;

export type PaymentStatus = "Succeeded" | "Failed";

export interface DbUser {
  id: DbId;
  name: string;
  email: string;
  phone: string;
  google_id?: string | null;
  branch_id: BranchId | null;
  batch_id?: string | null;
  role: UserRole;
  experience: string | null;
  isProfileComplete: boolean;
  passwordHash: string | null;
  membership_status: "none" | "active" | "expired" | "pending" | "rejected";
  failed_attempts?: number;
  lockout_until?: string | null;
}

export interface DbMembership {
  id: DbId;
  user_id: DbId;
  branch_id: BranchId;
  plan_type: "monthly" | "pt";
  plan_name: string;
  start_date: string;
  expiry_date: string;
  status: MembershipStatus;
  coach_name?: string; // For PT
}

export interface DbEnquiry {
  id: DbId;
  name: string;
  phone: string;
  email?: string;
  branch_id: BranchId;
  message: string;
  type: "personal_training" | "admission" | "contact";
  status: "normal" | "waiting" | "contacted" | "assigned";
  created_at: string;
}

export interface DbSettings {
  total_pt_slots: number;
  used_pt_slots: number;
  payment_qr_url: string;
  payment_upi_id: string;
  payment_instructions: string[];
}

export interface DbMatch {
  id: DbId;
  branch_id: BranchId;
  teams: string;
  date: string;
  time: string;
  venue: string;
  fee: number;
  status: "Upcoming" | "Live" | "Completed";
  result?: string;
  live_link?: string;
}

export interface DbMatchParticipant {
  id: DbId;
  match_id: DbId;
  user_id: DbId;
  branch_id: BranchId;
  status: "Confirmed" | "Pending";
}

export interface DbPerformance {
  id: DbId;
  user_id: DbId;
  branch_id: BranchId;
  match_id: DbId;
  runs: number;
  wickets: number;
}

export interface DbAttendance {
  id: DbId;
  user_id: DbId;
  branch_id: BranchId;
  date: string;
  status: "Present" | "Absent";
}

export interface DbStaffAttendance {
  id: DbId;
  staff_id: DbId;
  branch_id: BranchId;
  date: string;
  status: "Present" | "Absent";
}

export interface DbNotice {
  id: DbId;
  branch_id: BranchId;
  title: string;
  message: string;
  date: string;
  important: boolean;
}

export interface DbPayment {
  id: DbId;
  user_id: DbId;
  branch_id: BranchId;
  match_id: DbId;
  amount: number;
  status: PaymentStatus;
  created_at: string;
}

export type PaymentVerificationStatus = "pending" | "approved" | "rejected";

export interface DbPaymentVerification {
  id: DbId;
  user_id: DbId;
  name: string;
  phone: string;
  email: string;
  plan_name: string;
  plan_type: "monthly" | "pt";
  plan_price: number;
  plan_duration_days: number;
  branch_id: BranchId;
  utr_number: string;
  screenshot_url: string;
  status: PaymentVerificationStatus;
  created_at: string;
  reviewed_at?: string;
}

export interface DbBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive";
  google_maps_link: string;
  description: string;
  head_coach: string;
  established: string;
}

export interface DbStaff {
  id: DbId;
  name: string;
  role: string;
  email: string;
  phone: string;
  branch_id: BranchId;
  status: "Active" | "Inactive";
  experience: string;
  bio?: string;
  image?: string;
}

export interface DbTransaction {
  id: DbId;
  branch_id: BranchId;
  type: "Income" | "Expense";
  category: string;
  amount: number;
  date: string;
  status: "Completed" | "Pending";
  player: string;
}

export interface DbPlan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  duration_label: string;
  features: string[];
  type: "monthly" | "pt";
}

export type WicketType = "bowled" | "caught" | "lbw" | "run_out" | "stumped" | "hit_wicket" | "retired";

export interface DbBall {
  id: DbId;
  match_id: DbId;
  innings: 1 | 2;
  over: number;
  batsman: string;
  non_striker: string;
  bowler: string;
  runs: number;
  wide: boolean;
  no_ball: boolean;
  bye: number;
  leg_bye: number;
  wicket?: { type: WicketType; batsman: string; fielder?: string };
  timestamp: string;
}

export interface DbScoringSession {
  id: DbId;
  match_id: DbId;
  branch_id: BranchId;
  innings: 1 | 2;
  batting_team: string;
  bowling_team: string;
  total_overs: number;
  target?: number;
  batting_lineup: string[];
  striker: string;
  non_striker: string;
  current_bowler: string;
  previous_bowler?: string;
  awaiting_new_bowler: boolean;
  awaiting_new_batsman: boolean;
  over_completed_on_wicket: boolean;
  status: "active" | "innings_break" | "completed";
  created_at: string;
  updated_at: string;
}

export interface DbHeroSlide {
  id: string;
  img: string;
  tag: string;
  title: string;
  accent: string;
  sub: string;
}

export interface DbGalleryImage {
  id: string;
  src: string;
  alt: string;
}

export interface DbHomepageVideo {
  id: string;
  url: string;
  title: string;
  description: string;
  thumbnail_url: string;
  enabled: boolean;
  order: number;
}

export interface DbProduct {
  id: DbId;
  name: string;
  price: number;
  stock: number;
  category: string;
  branch_id: BranchId;
  description?: string;
  image?: string;
}

export interface DbSiteSettings {
  players_trained: string;
  tournament_wins: string;
  certified_coaches: string;
  matches_played: string;
  academy_name: string;
  academy_description: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  address: string;
  google_maps_link: string;
  phone: string;
  email: string;
  hero_slides: DbHeroSlide[];
  gallery_images: DbGalleryImage[];
  homepage_videos: DbHomepageVideo[];
}

interface DbState {
  users: DbUser[];
  memberships: DbMembership[];
  branches: DbBranch[];
  staff: DbStaff[];
  matches: DbMatch[];
  match_participants: DbMatchParticipant[];
  performance: DbPerformance[];
  attendance: DbAttendance[];
  staff_attendance: DbStaffAttendance[];
  notices: DbNotice[];
  payments: DbPayment[];
  payment_verifications: DbPaymentVerification[];
  enquiries: DbEnquiry[];
  transactions: DbTransaction[];
  plans: DbPlan[];
  settings: Record<BranchId, DbSettings>;
  scoring_sessions: DbScoringSession[];
  balls: DbBall[];
  site_settings: DbSiteSettings;
  notifications: DbNotification[];
  products: DbProduct[];
}

export interface DbNotification {
  id: string;
  user_id: string;
  branch_id: BranchId;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  link?: string;
  is_read: boolean;
  created_at: string;
}


import { invalidateCache } from "@/server/cache";
import { saveToBlobsAsync, syncDbFromBlobs as _syncDbFromBlobs } from "./netlifyBlobs";
import bcrypt from "bcryptjs";

// ── Helpers ──────────────────────────────────────────────────────────────────

const todayIso = () => new Date().toISOString().slice(0, 10);

const addDaysIso = (dateIso: string, days: number) => {
  const d = new Date(dateIso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const hashPassword = (password: string) => bcrypt.hashSync(password, 12);
const verifyPassword = (password: string, hash: string) => bcrypt.compareSync(password, hash);

const genId = (prefix: string) => `${prefix}_${crypto.randomBytes(8).toString("hex")}`;

// ── File persistence ──────────────────────────────────────────────────────────

const DB_FILE = path.join(process.cwd(), "data", "db.json");
const BACKUP_DIR = path.join(process.cwd(), "data", "backups");

let isSaving = false;
let pendingSave = false;

async function saveDb(): Promise<void> {
  if (isSaving) {
    pendingSave = true;
    return;
  }
  isSaving = true;
  pendingSave = false;

  rebuildIndexes();
  invalidateCache();

  // Check if we're in a serverless environment (like Vercel or Netlify)
  // On Vercel in production, we skip FS operations to avoid crashes
  const isNetlify = !!(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);
  const isVercel = !!(process.env.VERCEL || process.env.VERCEL_URL);

  try {
    if (!isVercel && !isNetlify) {
      const data = JSON.stringify(db, null, 2);
      
      // Async file write to keep the event loop free
      await fs.promises.mkdir(path.dirname(DB_FILE), { recursive: true });
      await fs.promises.writeFile(DB_FILE, data, "utf-8");
      
      // Skip backups for very large databases to save disk space and time
      const isVeryLarge = data.length > 50 * 1024 * 1024; // 50MB
      const now = new Date();
      const lastBackup = (db as any)._last_backup_at;
      if (!isVeryLarge && (!lastBackup || now.getTime() - new Date(lastBackup).getTime() > 24 * 60 * 60 * 1000)) {
        await fs.promises.mkdir(BACKUP_DIR, { recursive: true });
        const backupFile = path.join(BACKUP_DIR, `db_${now.toISOString().replace(/[:.]/g, "-")}.json`);
        await fs.promises.writeFile(backupFile, data, "utf-8");
        (db as any)._last_backup_at = now.toISOString();
        
        const files = (await fs.promises.readdir(BACKUP_DIR)).sort();
        if (files.length > 7) {
          for (const f of files.slice(0, files.length - 7)) {
            await fs.promises.unlink(path.join(BACKUP_DIR, f));
          }
        }
      }
    }
  } catch (err) {
    // Ignore errors from FS operations on serverless platforms
    console.warn("Database file save failed (safe to ignore on serverless platforms)", err);
  } finally {
    isSaving = false;
    saveToBlobsAsync(db);
    if (pendingSave) {
      saveDb();
    }
  }
}

/** Call this at the top of any API route on Netlify to load the latest DB snapshot. */
export async function ensureDbSynced(): Promise<void> {
  const isNetlify = !!(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);
  if (!isNetlify) return;
  await _syncDbFromBlobs(db as unknown as Record<string, unknown>, () => {
    rebuildIndexes();
    invalidateCache();
  });
}

function loadPersistedDb(): DbState | null {
  // Try multiple paths — process.cwd() can vary on serverless platforms
  const candidates = [
    DB_FILE,
    path.join(__dirname, "../../../../data/db.json"),
    path.join(__dirname, "../../../../../data/db.json"),
  ];

  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw) as DbState;
        if (Array.isArray(parsed?.users)) {
          return parsed;
        }
      }
    } catch {
      // try next candidate
    }
  }

  return null;
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const DEFAULT_HERO_SLIDES: DbHeroSlide[] = [
  { id: "hs1", img: "https://images.unsplash.com/photo-1531415074968-036ba1b575da", tag: "Professional Cricket Coaching", title: "WHERE CHAMPIONS", accent: "ARE FORGED", sub: "Mira Bhayander's Premier Cricket Academy — building champions since 2011." },
  { id: "hs2", img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e", tag: "Match Exposure", title: "COMPETE AT", accent: "EVERY LEVEL", sub: "From local tournaments to state competitions — real match experience every season." },
  { id: "hs3", img: "https://images.unsplash.com/photo-1531415074968-036ba1b575da", tag: "Elite Training Facilities", title: "TRAIN LIKE", accent: "A PRO", sub: "International-grade turf pitches, video analysis, and certified coaches." },
];

const DEFAULT_GALLERY_IMAGES: DbGalleryImage[] = [
  { id: "gi1", src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da", alt: "Cricket Stadium" },
  { id: "gi2", src: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e", alt: "Match Action" },
  { id: "gi3", src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da", alt: "Net Practice" },
  { id: "gi4", src: "https://images.unsplash.com/photo-1593341646782-e0b495cff86d", alt: "Victory Celebration" },
  { id: "gi5", src: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972", alt: "Cricket Ground" },
  { id: "gi6", src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da", alt: "Stadium Lights" },
  { id: "gi7", src: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e", alt: "Batting" },
  { id: "gi8", src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da", alt: "Bowling Practice" },
];

function buildSeedData(): DbState {
  return {
    branches: [
      {
        id: "samarth",
        name: "Samarth Cricket Academy",
        address: "Samarth Cricket Academy, Mira Bhayander, Mumbai - 401107",
        city: "Mira Bhayander, Mumbai",
        phone: "+91 98765 43210",
        email: "info@samarthcricket.com",
        status: "Active" as const,
        google_maps_link: "https://maps.google.com",
        description: "Main branch of Samarth Cricket Academy in Mira Bhayander, Mumbai.",
        head_coach: "",
        established: "2011",
      },
      {
        id: "aims",
        name: "AIMS Academy",
        address: "AIMS Sports Complex, Mumbai, Maharashtra",
        city: "Mumbai",
        phone: "+91 91234 56789",
        email: "aims@samarthcricket.com",
        status: "Active" as const,
        google_maps_link: "https://maps.google.com",
        description: "Second branch of Samarth Cricket Academy in Mumbai.",
        head_coach: "",
        established: "2015",
      },
    ],
    users: [
      {
        id: "a1",
        name: "Admin",
        email: (process.env.ADMIN_EMAIL || "admin@samarth.com").toLowerCase(),
        phone: "",
        branch_id: "samarth",
        role: "admin",
        experience: null,
        isProfileComplete: true,
        passwordHash: hashPassword(process.env.ADMIN_PASSWORD || "admin123"),
        membership_status: "active",
      },
      {
        id: "p1",
        name: "Player One",
        email: "player@samarth.com",
        phone: "9999999999",
        branch_id: "samarth",
        batch_id: "morning",
        role: "player",
        experience: "Intermediate",
        isProfileComplete: true,
        passwordHash: hashPassword("player123"),
        membership_status: "active",
      },
    ],
    staff: [],
    memberships: [],
    matches: [],
    match_participants: [],
    performance: [],
    attendance: [],
    staff_attendance: [],
    notices: [],
    payments: [],
    payment_verifications: [],
    enquiries: [],
    transactions: [],
    plans: [
      {
        id: "monthly",
        name: "2 Months Plan",
        price: 5000,
        duration_days: 60,
        duration_label: "2 Months",
        features: [
          "Full academy training (basic to advanced)",
          "Group practice sessions",
          "Match participation",
          "Attendance tracking",
          "Performance tracking",
        ],
        type: "monthly"
      },
      {
        id: "pt",
        name: "Personal Training",
        price: 0,
        duration_days: 30,
        duration_label: "Contact Base",
        features: [
          "One-to-one coaching (coach + player only)",
          "Personalized training sessions",
          "No group practice",
          "Premium styling & badge",
          "Dedicated coach support",
        ],
        type: "pt"
      }
    ],
    settings: {
      samarth: {
        total_pt_slots: 10,
        used_pt_slots: 0,
        payment_qr_url: "/qr-code.svg",
        payment_upi_id: "academy@upi",
        payment_instructions: [
          "Scan the QR code using any UPI app",
          "Pay the required amount for your selected plan",
          "Note the UTR / Transaction Reference Number",
          "Take a screenshot of the payment confirmation",
          "Fill the form and upload your screenshot",
          "Wait for admin approval to activate your account"
        ],
      },
      aims: {
        total_pt_slots: 15,
        used_pt_slots: 0,
        payment_qr_url: "/qr-code.svg",
        payment_upi_id: "aims@upi",
        payment_instructions: [
          "Scan the QR code using any UPI app",
          "Pay the required amount for your selected plan",
          "Note the UTR / Transaction Reference Number",
          "Take a screenshot of the payment confirmation",
          "Fill the form and upload your screenshot",
          "Wait for admin approval to activate your account"
        ],
      },
    },
    scoring_sessions: [],
    balls: [],
    site_settings: {
      players_trained: "0+",
      tournament_wins: "0+",
      certified_coaches: "0+",
      matches_played: "0+",
      academy_name: "Samarth Cricket Academy",
      academy_description: "Professional cricket coaching developing disciplined, skilled, and confident cricketers.",
      facebook_url: "",
      instagram_url: "",
      twitter_url: "",
      address: "",
      google_maps_link: "",
      phone: "",
      email: "info@samarthcricket.com",
      hero_slides: DEFAULT_HERO_SLIDES,
      gallery_images: DEFAULT_GALLERY_IMAGES,
      homepage_videos: [],
    },
    notifications: [],
    products: [],
  };
}


// ── Database initialization ───────────────────────────────────────────────────
// Load from persisted file, or fall back to seed data and immediately save it.

const persisted = loadPersistedDb();
const db: DbState = persisted ?? buildSeedData();

// ── Indexing for Performance ──────────────────────────────────────────────────

const indexes = {
  usersById: new Map<string, DbUser>(),
  usersByEmail: new Map<string, DbUser>(),
  membershipsById: new Map<string, DbMembership>(),
  membershipsByUser: new Map<string, DbMembership[]>(),
  staffById: new Map<string, DbStaff>(),
  matchesById: new Map<string, DbMatch>(),
  paymentVerificationsById: new Map<string, DbPaymentVerification>(),
  notificationsByUser: new Map<string, DbNotification[]>(),
};

function rebuildIndexes() {
  indexes.usersById.clear();
  indexes.usersByEmail.clear();
  db.users.forEach((u) => {
    indexes.usersById.set(u.id, u);
    indexes.usersByEmail.set(u.email.toLowerCase(), u);
  });

  indexes.membershipsById.clear();
  indexes.membershipsByUser.clear();
  db.memberships.forEach((m) => {
    indexes.membershipsById.set(m.id, m);
    const userMems = indexes.membershipsByUser.get(m.user_id) || [];
    userMems.push(m);
    indexes.membershipsByUser.set(m.user_id, userMems);
  });

  indexes.staffById.clear();
  db.staff.forEach((s) => indexes.staffById.set(s.id, s));

  indexes.matchesById.clear();
  db.matches.forEach((m) => indexes.matchesById.set(m.id, m));

  indexes.paymentVerificationsById.clear();
  db.payment_verifications.forEach((v) => indexes.paymentVerificationsById.set(v.id, v));

  indexes.notificationsByUser.clear();
  db.notifications.forEach((n) => {
    const userNotes = indexes.notificationsByUser.get(n.user_id) || [];
    userNotes.push(n);
    indexes.notificationsByUser.set(n.user_id, userNotes);
  });
}


// Migrate: add new fields if loading an older persisted DB
if (!db.scoring_sessions) (db as any).scoring_sessions = [];
if (!db.branches) {
  (db as any).branches = [
    { id: "samarth", name: "Samarth Cricket Academy", address: "Samarth Cricket Academy, Mira Bhayander, Mumbai - 401107", city: "Mira Bhayander, Mumbai", phone: "+91 98765 43210", email: "info@samarthcricket.com", status: "Active", google_maps_link: "https://maps.google.com", description: "Main branch of Samarth Cricket Academy.", head_coach: "", established: "2011" },
    { id: "aims", name: "AIMS Academy", address: "AIMS Sports Complex, Mumbai, Maharashtra", city: "Mumbai", phone: "+91 91234 56789", email: "aims@samarthcricket.com", status: "Active", google_maps_link: "https://maps.google.com", description: "Second branch of Samarth Cricket Academy.", head_coach: "", established: "2015" },
  ];
}
if (!db.balls) (db as any).balls = [];
if (!db.site_settings) {
  (db as any).site_settings = {
    players_trained: "1,200+",
    tournament_wins: "85+",
    certified_coaches: "24+",
    matches_played: "500+",
    academy_name: "Samarth Cricket Academy",
    academy_description: "Nurturing the next generation of cricket legends with professional coaching, modern facilities, and a passion for the game.",
    facebook_url: "https://facebook.com/samarthacademy",
    instagram_url: "https://instagram.com/samarth_cricket",
    twitter_url: "https://twitter.com/samarth_cricket",
    address: "Samarth Academy Ground, Near Stadium Road, Pune, Maharashtra",
    google_maps_link: "https://maps.google.com",
    phone: "+91 98765 43210",
    email: "info@samarthcricket.com"
  };
}
if (!db.notifications) db.notifications = [];
if (!db.products) {
  db.products = [
    { id: "p1", name: "Academy Pro Bat", price: 12500, stock: 15, category: "Equipment", branch_id: "samarth" },
    { id: "p2", name: "Training Jersey", price: 1200, stock: 42, category: "Apparel", branch_id: "samarth" },
    { id: "p3", name: "Elite Cricket Ball", price: 850, stock: 120, category: "Equipment", branch_id: "aims" },
  ];
}
if (!db.site_settings.hero_slides) db.site_settings.hero_slides = DEFAULT_HERO_SLIDES;
if (!db.site_settings.gallery_images) db.site_settings.gallery_images = DEFAULT_GALLERY_IMAGES;
if (!db.site_settings.homepage_videos) db.site_settings.homepage_videos = [];

// Migrate: ensure all existing settings entries have payment fields
Object.values(db.settings).forEach((s: any) => {
  if (s.payment_qr_url === undefined) s.payment_qr_url = "";
  if (s.payment_upi_id === undefined) s.payment_upi_id = "";
  if (s.payment_instructions === undefined) s.payment_instructions = [];
});

rebuildIndexes();

if (!persisted) {
  // First run: save seed data so future restarts have a starting point
  saveDb();
} else {
  // No log needed
}

// ── User methods ──────────────────────────────────────────────────────────────

export const users = {
  getById: (id: string) => indexes.usersById.get(id) ?? null,
  listByBranch: (branch_id: BranchId) =>
    db.users.filter((u) => u.role === "player" && u.branch_id === branch_id),
  countByBranch: (branch_id: BranchId) => {
    let count = 0;
    for (const u of db.users) {
      if (u.role === "player" && u.branch_id === branch_id) count++;
    }
    return count;
  },
  countActiveByBranch: (branch_id: BranchId) => {
    let count = 0;
    for (const u of db.users) {
      if (u.role === "player" && u.branch_id === branch_id && u.membership_status === "active") count++;
    }
    return count;
  },
  getByEmailAnyBranch: (email: string) => indexes.usersByEmail.get(email.toLowerCase()) ?? null,
  getByEmailAndBranch: (email: string, branch_id: BranchId) => {
    const u = indexes.usersByEmail.get(email.toLowerCase());
    return u?.branch_id === branch_id ? u : null;
  },
  getByGoogleId: (googleId: string) => db.users.find((u) => u.google_id === googleId) ?? null,
  getAdminByEmail: (email: string) => {
    const u = indexes.usersByEmail.get(email.toLowerCase());
    return u?.role === "admin" ? u : null;
  },
  getByPhone: (phone: string) => {
    const normalized = phone.replace(/\D/g, "");
    return db.users.find((u) => u.phone.replace(/\D/g, "") === normalized) ?? null;
  },
  upsertOAuthUser: (params: { id: string; email: string; name?: string | null }) => {
    // 1. Try to find by google_id first
    const byGoogle = users.getByGoogleId(params.id);
    if (byGoogle) return byGoogle;

    // 2. Try to find by email and link Google ID
    const existing = users.getByEmailAnyBranch(params.email);
    if (existing) {
      existing.google_id = params.id;
      saveDb();
      return existing;
    }

    // 3. Create new OAuth user
    const isAdmin = params.email.toLowerCase().includes("admin");
    const created: DbUser = {
      id: genId("u"),
      google_id: params.id,
      email: params.email.toLowerCase(),
      name: params.name ?? params.email.split("@")[0],
      phone: "",
      branch_id: "samarth",
      role: isAdmin ? "admin" : "player",
      experience: null,
      isProfileComplete: isAdmin,
      passwordHash: null,
      membership_status: isAdmin ? "active" : "none",
    };
    db.users.push(created);
    saveDb();
    return created;
  },
  createPlayer: (params: { email: string; password: string; branch_id: BranchId; name?: string }) => {
    const existing = users.getByEmailAnyBranch(params.email);
    if (existing) return { ok: false as const, error: "USER_EXISTS" as const };
    const id = genId("u");
    const user: DbUser = {
      id,
      email: params.email,
      name: params.name ?? params.email.split("@")[0],
      phone: "",
      branch_id: params.branch_id,
      role: "player",
      experience: null,
      isProfileComplete: false,
      passwordHash: hashPassword(params.password),
      membership_status: "none",
    };
    db.users.push(user);
    saveDb();
    return { ok: true as const, user };
  },
  bulkCreatePlayers: (
    players: {
      email: string;
      password?: string;
      branch_id: BranchId;
      name: string;
      phone?: string;
      membership_status?: DbUser["membership_status"];
      plan_name?: string;
    }[]
  ) => {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as { email: string; error: string }[],
    };

    players.forEach((p) => {
      const existing = users.getByEmailAnyBranch(p.email);
      if (existing) {
        results.failed++;
        results.errors.push({ email: p.email, error: "User with this email already exists." });
        return;
      }

      if (p.phone && users.getByPhone(p.phone)) {
        results.failed++;
        results.errors.push({ email: p.email, error: "User with this phone number already exists." });
        return;
      }

      const id = genId("u");
      const user: DbUser = {
        id,
        email: p.email.toLowerCase().trim(),
        name: p.name,
        phone: p.phone || "",
        branch_id: p.branch_id,
        role: "player",
        experience: null,
        isProfileComplete: false,
        passwordHash: hashPassword(p.password || "password123"),
        membership_status: p.membership_status || "none",
      };

      db.users.push(user);
      results.success++;

      // If plan_name is provided, assign it
      if (p.plan_name && p.plan_name !== "none") {
        try {
          const now = todayIso();
          const plan_type = p.plan_name === "Personal Training" ? "pt" : "monthly";
          const expiry = addDaysIso(now, plan_type === "monthly" ? 60 : 30);
          
          const mem: DbMembership = {
            id: genId("mem"),
            user_id: user.id,
            branch_id: user.branch_id!,
            plan_type,
            plan_name: p.plan_name,
            start_date: now,
            expiry_date: expiry,
            status: "Active",
          };
          db.memberships.push(mem);
          user.membership_status = "active";
        } catch (memErr) {
        // failed for this user
      }
      }
    });

    saveDb();
    return results;
  },
  updateProfile: (id: string, patch: Partial<Pick<DbUser, "name" | "phone" | "experience" | "branch_id" | "isProfileComplete" | "membership_status">>) => {
    const user = users.getById(id);
    if (!user) return null;
    Object.assign(user, patch);
    saveDb();
    return user;
  },
  delete: (id: string) => {
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    db.users.splice(idx, 1);
    // Also remove related memberships
    db.memberships = db.memberships.filter((m) => m.user_id !== id);
    saveDb();
    return true;
  },
  verifyPassword: (user: DbUser, password: string) => {
    if (!user.passwordHash) return false;

    // Check lockout
    if (user.lockout_until) {
      const now = new Date();
      const lockoutTime = new Date(user.lockout_until);
      if (now < lockoutTime) return false;
      // Lockout expired, reset
      user.lockout_until = null;
      user.failed_attempts = 0;
      saveDb();
    }

    const isValid = verifyPassword(password, user.passwordHash);

    if (!isValid) {
      user.failed_attempts = (user.failed_attempts || 0) + 1;
      if (user.failed_attempts >= 5) {
        // Block for 15 minutes
        const lockoutDate = new Date();
        lockoutDate.setMinutes(lockoutDate.getMinutes() + 15);
        user.lockout_until = lockoutDate.toISOString();
      }
      saveDb();
      return false;
    }

    // Success: reset attempts
    user.failed_attempts = 0;
    user.lockout_until = null;
    saveDb();
    return true;
  },
};

// ── Membership methods ────────────────────────────────────────────────────────

export const memberships = {
  listByBranch: (branch_id: BranchId) =>
    db.memberships.filter((m) => m.branch_id === branch_id),
  getForUserBranch: (user_id: string, branch_id: BranchId) => {
    const mems = indexes.membershipsByUser.get(user_id);
    return mems?.find((m) => m.branch_id === branch_id) ?? null;
  },
  normalizeStatus: (membership: DbMembership) => {
    const now = new Date(todayIso());
    const expiry = new Date(membership.expiry_date);
    const computedStatus: MembershipStatus = expiry.getTime() < now.getTime() ? "Expired" : membership.status;
    if (computedStatus !== membership.status) {
      membership.status = computedStatus;
      // Also update user's membership_status
      const user = users.getById(membership.user_id);
      if (user && user.membership_status !== "none" && user.membership_status !== "pending") {
        if (computedStatus === "Expired") {
          user.membership_status = "expired";
          // Notify admins about expiry
          const admins = db.users.filter(u => u.role === "admin" && u.branch_id === membership.branch_id);
          admins.forEach(admin => {
            notifications.create({
              user_id: admin.id,
              branch_id: membership.branch_id,
              title: "Membership Expired",
              message: `${user.name}'s membership has expired.`,
              type: "warning",
              link: "/admin/membership"
            });
          });
        }
        else if (computedStatus === "Active") user.membership_status = "active";
      }
      saveDb();
    }
    return membership;
  },
  isExpiringSoon: (membership: DbMembership) => {
    const now = new Date(todayIso());
    const expiry = new Date(membership.expiry_date);
    const diffMs = expiry.getTime() - now.getTime();
    return diffMs >= 0 && diffMs <= 3 * 24 * 60 * 60 * 1000;
  },
  daysUntilExpiry: (membership: DbMembership) => {
    const now = new Date(todayIso());
    const expiry = new Date(membership.expiry_date);
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  },
  renew: (user_id: string, branch_id: BranchId, plan_name = "2 Months Plan") => {
    const now = todayIso();
    const plan_type = plan_name === "Personal Training" ? "pt" : "monthly";
    const expiry = addDaysIso(now, plan_type === "monthly" ? 60 : 30);
    const existing = memberships.getForUserBranch(user_id, branch_id);
    if (existing) {
      existing.plan_type = plan_type;
      existing.plan_name = plan_name;
      existing.start_date = now;
      existing.expiry_date = expiry;
      existing.status = "Active";
      saveDb();
      return existing;
    }
    const created: DbMembership = {
      id: genId("mem"),
      user_id,
      branch_id,
      plan_type,
      plan_name,
      start_date: now,
      expiry_date: expiry,
      status: "Active",
    };
    db.memberships.push(created);
    saveDb();
    return created;
  },
  getById: (id: string) => db.memberships.find((m) => m.id === id) ?? null,
  update: (id: string, patch: Partial<DbMembership>) => {
    const m = db.memberships.find((mem) => mem.id === id);
    if (m) {
      Object.assign(m, patch);
      saveDb();
    }
    return m;
  },
  delete: (id: string) => {
    const idx = db.memberships.findIndex((m) => m.id === id);
    if (idx !== -1) {
      db.memberships.splice(idx, 1);
      saveDb();
      return true;
    }
    return false;
  },
};

// ── Staff methods ─────────────────────────────────────────────────────────────

export const staff = {
  listByBranch: (branch_id: BranchId) => db.staff.filter((s) => s.branch_id === branch_id),
  getById: (id: string) => db.staff.find((s) => s.id === id) ?? null,
  create: (params: Omit<DbStaff, "id">) => {
    const s: DbStaff = { id: genId("s"), ...params };
    db.staff.push(s);
    saveDb();
    return s;
  },
  update: (id: string, patch: Partial<DbStaff>) => {
    const s = staff.getById(id);
    if (s) {
      Object.assign(s, patch);
      saveDb();
    }
    return s;
  },
  delete: (id: string) => {
    const idx = db.staff.findIndex((s) => s.id === id);
    if (idx !== -1) {
      db.staff.splice(idx, 1);
      saveDb();
      return true;
    }
    return false;
  },
};

// ── Match methods ─────────────────────────────────────────────────────────────

export const matches = {
  listByBranch: (branch_id: BranchId) => db.matches.filter((m) => m.branch_id === branch_id),
  getById: (id: string) => db.matches.find((m) => m.id === id) ?? null,
  create: (params: Omit<DbMatch, "id">) => {
    const m: DbMatch = { id: genId("m"), ...params };
    db.matches.push(m);

    // Notify admins
    const admins = db.users.filter(u => u.role === "admin" && u.branch_id === params.branch_id);
    admins.forEach(admin => {
      notifications.create({
        user_id: admin.id,
        branch_id: params.branch_id,
        title: "New Match Scheduled",
        message: `A new match "${params.teams}" has been scheduled for ${params.date}.`,
        type: "info",
        link: "/admin/matches"
      });
    });

    saveDb();
    return m;
  },
  update: (id: string, patch: Partial<DbMatch>) => {
    const m = matches.getById(id);
    if (m) {
      Object.assign(m, patch);
      saveDb();
    }
    return m;
  },
  delete: (id: string) => {
    const idx = db.matches.findIndex((m) => m.id === id);
    if (idx !== -1) {
      db.matches.splice(idx, 1);
      saveDb();
      return true;
    }
    return false;
  },
};

// ── Notice methods ────────────────────────────────────────────────────────────

export const notices = {
  listByBranchLatestFirst: (branch_id: BranchId) =>
    db.notices
      .filter((n) => n.branch_id === branch_id)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date)),
  create: (params: Omit<DbNotice, "id">) => {
    const n: DbNotice = { id: genId("n"), ...params };
    db.notices.push(n);

    // Notify admins
    const admins = db.users.filter(u => u.role === "admin" && u.branch_id === params.branch_id);
    admins.forEach(admin => {
      notifications.create({
        user_id: admin.id,
        branch_id: params.branch_id,
        title: "New Announcement",
        message: `A new notice "${params.title}" has been posted.`,
        type: "info",
        link: "/admin/notices"
      });
    });

    saveDb();
    return n;
  },
  update: (id: string, patch: Partial<DbNotice>) => {
    const n = db.notices.find((x) => x.id === id);
    if (n) {
      Object.assign(n, patch);
      saveDb();
    }
    return n ?? null;
  },
  delete: (id: string) => {
    const idx = db.notices.findIndex((n) => n.id === id);
    if (idx !== -1) {
      db.notices.splice(idx, 1);
      saveDb();
      return true;
    }
    return false;
  },
};

// ── Performance methods ───────────────────────────────────────────────────────

export const performance = {
  listByBranch: (branch_id: BranchId) => 
    db.performance.filter((p) => p.branch_id === branch_id),
  listByUserBranch: (user_id: string, branch_id: BranchId) =>
    db.performance.filter((p) => p.user_id === user_id && p.branch_id === branch_id),
  create: (params: Omit<DbPerformance, "id">) => {
    const p: DbPerformance = { id: genId("perf"), ...params };
    db.performance.push(p);
    saveDb();
    return p;
  },
  update: (id: string, patch: Partial<DbPerformance>) => {
    const p = db.performance.find((x) => x.id === id);
    if (p) {
      Object.assign(p, patch);
      saveDb();
    }
    return p ?? null;
  },
  delete: (id: string) => {
    const idx = db.performance.findIndex((p) => p.id === id);
    if (idx !== -1) {
      db.performance.splice(idx, 1);
      saveDb();
      return true;
    }
    return false;
  },
};

// ── Attendance methods ────────────────────────────────────────────────────────

export const attendance = {
  listByUserBranch: (user_id: string, branch_id: BranchId) =>
    db.attendance.filter((a) => a.user_id === user_id && a.branch_id === branch_id),
  listByBranchAndDate: (branch_id: BranchId, date: string) =>
    db.attendance.filter((a) => a.branch_id === branch_id && a.date === date),
  mark: async (params: { user_id: string; branch_id: BranchId; date: string; status: "Present" | "Absent" }) => {
    const existingIndex = db.attendance.findIndex(
      (a) => a.user_id === params.user_id && a.branch_id === params.branch_id && a.date === params.date
    );
    if (existingIndex > -1) {
      db.attendance[existingIndex].status = params.status;
    } else {
      db.attendance.push({ id: genId("att"), ...params });
    }
    await saveDb();
  },
};

export const staffAttendance = {
  listByBranchAndDate: (branch_id: BranchId, date: string) =>
    db.staff_attendance.filter((a) => a.branch_id === branch_id && a.date === date),
  mark: async (params: { staff_id: string; branch_id: BranchId; date: string; status: "Present" | "Absent" }) => {
    const existingIndex = db.staff_attendance.findIndex(
      (a) => a.staff_id === params.staff_id && a.branch_id === params.branch_id && a.date === params.date
    );
    if (existingIndex > -1) {
      db.staff_attendance[existingIndex].status = params.status;
    } else {
      db.staff_attendance.push({ id: genId("satt"), ...params });
    }
    await saveDb();
  },
};

// ── Match participant methods ─────────────────────────────────────────────────

export const matchParticipants = {
  get: (match_id: string, user_id: string) =>
    db.match_participants.find((p) => p.match_id === match_id && p.user_id === user_id) ?? null,
  addConfirmed: (match_id: string, user_id: string, branch_id: BranchId) => {
    const existing = matchParticipants.get(match_id, user_id);
    if (existing) return existing;
    const created: DbMatchParticipant = { id: genId("mp"), match_id, user_id, branch_id, status: "Confirmed" };
    db.match_participants.push(created);
    saveDb();
    return created;
  },
  listForUser: (user_id: string) => db.match_participants.filter((p) => p.user_id === user_id),
};

// ── Payment methods ───────────────────────────────────────────────────────────

export const payments = {
  listByBranch: (branch_id: BranchId) => db.payments.filter((p) => p.branch_id === branch_id),
  simulate: (params: Omit<DbPayment, "id" | "status" | "created_at">) => {
    const p: DbPayment = {
      id: genId("pay"),
      ...params,
      status: "Succeeded",
      created_at: new Date().toISOString(),
    };
    db.payments.push(p);
    saveDb();
    return p;
  },
};

// ── Payment verification methods ──────────────────────────────────────────────

export const paymentVerifications = {
  list: (branch_id?: BranchId | "all") =>
    db.payment_verifications
      .filter((v) => !branch_id || branch_id === "all" || v.branch_id === branch_id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),

  getById: (id: string) => db.payment_verifications.find((v) => v.id === id) ?? null,

  getPendingByUserBranch: (user_id: string, branch_id: BranchId) =>
    db.payment_verifications.find((v) => v.user_id === user_id && v.branch_id === branch_id && v.status === "pending") ?? null,

  create: (params: {
    user_id: string;
    name: string;
    phone: string;
    email: string;
    plan_name: string;
    plan_type: "monthly" | "pt";
    plan_price: number;
    plan_duration_days: number;
    branch_id: BranchId;
    utr_number: string;
    screenshot_url: string;
  }): DbPaymentVerification => {
    const record: DbPaymentVerification = {
      id: genId("pv"),
      ...params,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    db.payment_verifications.push(record);

    const user = users.getById(params.user_id);
    if (user) user.membership_status = "pending";

    // Notify admins
    const admins = db.users.filter(u => u.role === "admin" && u.branch_id === params.branch_id);
    admins.forEach(admin => {
      notifications.create({
        user_id: admin.id,
        branch_id: params.branch_id,
        title: "New Payment Submitted",
        message: `${user?.name || 'A player'} has submitted a payment for ${params.plan_name}.`,
        type: "warning",
        link: "/admin/payments"
      });
    });

    saveDb();
    return record;
  },

  approve: (id: string): { ok: boolean; error?: string } => {
    const record = db.payment_verifications.find((v) => v.id === id);
    if (!record) return { ok: false, error: "NOT_FOUND" };
    if (record.status !== "pending") return { ok: false, error: "ALREADY_PROCESSED" };

    const user = users.getById(record.user_id);
    if (!user) return { ok: false, error: "USER_NOT_FOUND" };

    const now = todayIso();
    const expiry = addDaysIso(now, record.plan_duration_days);
    const existing = memberships.getForUserBranch(user.id, record.branch_id);
    if (existing) {
      existing.plan_type = record.plan_type;
      existing.plan_name = record.plan_name;
      existing.start_date = now;
      existing.expiry_date = expiry;
      existing.status = "Active";
    } else {
      const mem: DbMembership = {
        id: genId("mem"),
        user_id: user.id,
        branch_id: record.branch_id,
        plan_type: record.plan_type,
        plan_name: record.plan_name,
        start_date: now,
        expiry_date: expiry,
        status: "Active",
      };
      db.memberships.push(mem);
    }

    user.membership_status = "active";
    record.status = "approved";
    record.reviewed_at = new Date().toISOString();

    // Automatically record income transaction
    const transaction: DbTransaction = {
      id: genId("tx"),
      branch_id: record.branch_id,
      type: "Income",
      category: "Membership",
      amount: record.plan_price,
      date: todayIso(),
      status: "Completed",
      player: user.name,
    };
    db.transactions.push(transaction);

    // Notify admins
    const admins = db.users.filter(u => u.role === "admin" && u.branch_id === record.branch_id);
    admins.forEach(admin => {
      notifications.create({
        user_id: admin.id,
        branch_id: record.branch_id,
        title: "Membership Approved",
        message: `${user.name}'s ${record.plan_name} has been approved. ₹${record.plan_price} added to finance.`,
        type: "success",
        link: "/admin/finance"
      });
    });

    saveDb();

    return { ok: true };
  },

  reject: (id: string): { ok: boolean; error?: string } => {
    const record = db.payment_verifications.find((v) => v.id === id);
    if (!record) return { ok: false, error: "NOT_FOUND" };
    if (record.status !== "pending") return { ok: false, error: "ALREADY_PROCESSED" };

    const user = users.getById(record.user_id);
    if (user) user.membership_status = "rejected";

    record.status = "rejected";
    record.reviewed_at = new Date().toISOString();

    // Notify admins
    const admins = db.users.filter(u => u.role === "admin" && u.branch_id === record.branch_id);
    admins.forEach(admin => {
      notifications.create({
        user_id: admin.id,
        branch_id: record.branch_id,
        title: "Payment Rejected",
        message: `${user?.name || 'A player'}'s payment has been rejected.`,
        type: "error",
        link: "/admin/payments"
      });
    });

    saveDb();
    return { ok: true };

  },
};

// ── Enquiry methods ───────────────────────────────────────────────────────────

export const enquiries = {
  list: (branch_id: BranchId) =>
    db.enquiries
      .filter((e) => e.branch_id === branch_id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
  create: (params: Omit<DbEnquiry, "id" | "status" | "created_at">) => {
    const currentSettings = settings.get(params.branch_id);
    const remaining = currentSettings.total_pt_slots - currentSettings.used_pt_slots;
    const enquiry: DbEnquiry = {
      id: genId("enq"),
      ...params,
      status: remaining > 0 ? "normal" : "waiting",
      created_at: new Date().toISOString(),
    };
    db.enquiries.push(enquiry);

    // Notify admins
    const admins = db.users.filter(u => u.role === "admin" && u.branch_id === params.branch_id);
    admins.forEach(admin => {
      notifications.create({
        user_id: admin.id,
        branch_id: params.branch_id,
        title: "New Admission Enquiry",
        message: `${params.name} has sent a new enquiry for ${params.type.replace('_', ' ')}.`,
        type: "info",
        link: "/admin/enquiries"
      });
    });

    saveDb();
    return enquiry;
  },
  updateStatus: (id: string, status: DbEnquiry["status"]) => {
    const enq = db.enquiries.find((e) => e.id === id);
    if (enq) {
      enq.status = status;
      saveDb();
    }
    return enq;
  },
  assignPT: (params: { user_id: string; branch_id: BranchId; coach_name: string; duration_days: number }): { ok: boolean; error?: string } => {
    const user = users.getById(params.user_id);
    if (!user) return { ok: false, error: "USER_NOT_FOUND" };

    const now = todayIso();
    const expiry = addDaysIso(now, params.duration_days);

    const mem = memberships.renew(user.id, params.branch_id, "Personal Training");
    mem.coach_name = params.coach_name;
    mem.expiry_date = expiry;

    user.membership_status = "active";
    db.settings[params.branch_id].used_pt_slots += 1;
    saveDb();
    return { ok: true };
  },
};

// ── Transaction methods ───────────────────────────────────────────────────────

export const transactions = {
  listByBranch: (branch_id: BranchId) => db.transactions.filter((t) => t.branch_id === branch_id),
  create: (params: Omit<DbTransaction, "id">) => {
    const t: DbTransaction = { id: genId("tx"), ...params };
    db.transactions.push(t);
    saveDb();
    return t;
  },
};

// ── Branch methods ────────────────────────────────────────────────────────────

export const dbBranches = {
  list: () => db.branches,
  getById: (id: string) => db.branches.find((b) => b.id === id) ?? null,
  create: (params: Omit<DbBranch, "id">, id: string) => {
    if (db.branches.find((b) => b.id === id)) return null;
    const branch: DbBranch = { id, ...params };
    db.branches.push(branch);
    // Seed default settings for this branch
    if (!(db.settings as any)[id]) {
      (db.settings as any)[id] = { total_pt_slots: 10, used_pt_slots: 0, payment_qr_url: "", payment_upi_id: "", payment_instructions: [] };
    }
    saveDb();
    return branch;
  },
  update: (id: string, patch: Partial<Omit<DbBranch, "id">>) => {
    const branch = dbBranches.getById(id);
    if (!branch) return null;
    Object.assign(branch, patch);
    saveDb();
    return branch;
  },
  delete: (id: string) => {
    const hasUsers = db.users.some((u) => u.branch_id === id);
    if (hasUsers) return { ok: false as const, error: "BRANCH_HAS_USERS" };
    const idx = db.branches.findIndex((b) => b.id === id);
    if (idx === -1) return { ok: false as const, error: "NOT_FOUND" };
    db.branches.splice(idx, 1);
    saveDb();
    return { ok: true as const };
  },
};

// ── Plan methods ──────────────────────────────────────────────────────────────

export const plans = {
  list: () => db.plans,
  getById: (id: string) => db.plans.find((p) => p.id === id) ?? null,
  update: (id: string, patch: Partial<DbPlan>) => {
    const p = plans.getById(id);
    if (p) {
      Object.assign(p, patch);
      saveDb();
    }
    return p;
  },
};

// ── Settings methods ──────────────────────────────────────────────────────────

export const settings = {
  get: (branch_id: BranchId) => db.settings[branch_id],
  update: (branch_id: BranchId, patch: Partial<DbSettings>) => {
    if (!db.settings[branch_id]) return null;
    Object.assign(db.settings[branch_id], patch);
    // Payment fields are academy-wide — sync to all branches
    const paymentFields = ["payment_qr_url", "payment_upi_id", "payment_instructions"] as const;
    const hasPaymentUpdate = paymentFields.some((k) => k in patch);
    if (hasPaymentUpdate) {
      const paymentPatch = Object.fromEntries(
        paymentFields.filter((k) => k in patch).map((k) => [k, patch[k]])
      );
      for (const bid of Object.keys(db.settings)) {
        if (bid !== branch_id && db.settings[bid as BranchId]) {
          Object.assign(db.settings[bid as BranchId], paymentPatch);
        }
      }
    }
    saveDb();
    return db.settings[branch_id];
  },
};

// ── Scoring session methods ───────────────────────────────────────────────────

export const scoringSessions = {
  getByMatchId: (match_id: string) =>
    db.scoring_sessions.find((s) => s.match_id === match_id) ?? null,

  create: (params: Omit<DbScoringSession, "id" | "created_at" | "updated_at">) => {
    const existingIdx = db.scoring_sessions.findIndex(
      (s) => s.match_id === params.match_id && s.innings === params.innings
    );
    if (existingIdx !== -1) db.scoring_sessions.splice(existingIdx, 1);
    db.balls = db.balls.filter(
      (b) => !(b.match_id === params.match_id && b.innings === params.innings)
    );
    const session: DbScoringSession = {
      id: genId("ss"),
      ...params,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.scoring_sessions.push(session);
    saveDb();
    return session;
  },

  update: (id: string, patch: Partial<DbScoringSession>) => {
    const s = db.scoring_sessions.find((s) => s.id === id);
    if (s) {
      Object.assign(s, patch, { updated_at: new Date().toISOString() });
      saveDb();
    }
    return s ?? null;
  },
};

// ── Ball methods ──────────────────────────────────────────────────────────────

export const ballsDb = {
  listByMatch: (match_id: string, innings?: 1 | 2) =>
    db.balls.filter(
      (b) => b.match_id === match_id && (innings === undefined || b.innings === innings)
    ),

  add: (params: Omit<DbBall, "id">) => {
    const b: DbBall = { id: genId("bl"), ...params };
    db.balls.push(b);
    saveDb();
    return b;
  },

  removeLast: (match_id: string, innings: 1 | 2) => {
    const matchBalls = db.balls.filter(
      (b) => b.match_id === match_id && b.innings === innings
    );
    if (matchBalls.length === 0) return null;
    const last = matchBalls[matchBalls.length - 1];
    const idx = db.balls.indexOf(last);
    db.balls.splice(idx, 1);
    saveDb();
    return last;
  },
};

// ── Site Settings methods ─────────────────────────────────────────────────────

export const siteSettings = {
  get: () => db.site_settings,
  update: async (patch: Partial<DbSiteSettings>) => {
    if (!db.site_settings) return null;
    Object.assign(db.site_settings, patch);
    await saveDb();
    return db.site_settings;
  },
};

export const notifications = {
  listByUser: (user_id: string, branch_id: BranchId) => {
    const userNotes = indexes.notificationsByUser.get(user_id) || [];
    return userNotes
      .filter((n) => n.branch_id === branch_id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  create: (data: Omit<DbNotification, "id" | "is_read" | "created_at">) => {
    const notification: DbNotification = {
      id: genId("nt"),
      ...data,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    db.notifications.push(notification);
    saveDb();
    return notification;
  },
  markAsRead: (id: string) => {
    const n = db.notifications.find((nt) => nt.id === id);
    if (n) {
      n.is_read = true;
      saveDb();
      return true;
    }
    return false;
  },
  markAllAsRead: (user_id: string, branch_id: BranchId) => {
    let count = 0;
    db.notifications.forEach((n) => {
      if (n.user_id === user_id && n.branch_id === branch_id && !n.is_read) {
        n.is_read = true;
        count++;
      }
    });
    if (count > 0) saveDb();
    return count;
  },
  delete: (id: string) => {
    const idx = db.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      db.notifications.splice(idx, 1);
      saveDb();
      return true;
    }
    return false;
  },
};

// ── Shop methods ──────────────────────────────────────────────────────────────

export const shop = {
  listByBranch: (branch_id: BranchId) => db.products.filter((p) => p.branch_id === branch_id),
  getById: (id: string) => db.products.find((p) => p.id === id) ?? null,
  create: (params: Omit<DbProduct, "id">) => {
    const p: DbProduct = { id: genId("p"), ...params };
    db.products.push(p);
    saveDb();
    return p;
  },
  update: (id: string, patch: Partial<DbProduct>) => {
    const p = shop.getById(id);
    if (p) {
      Object.assign(p, patch);
      saveDb();
    }
    return p;
  },
  delete: (id: string) => {
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      db.products.splice(idx, 1);
      saveDb();
      return true;
    }
    return false;
  },
};
