# Authentication System Overview - Samarth Cricket Academy

## 1. Authentication Configuration

### Main Config File: [src/server/auth/options.ts](src/server/auth/options.ts)

The authentication system uses **NextAuth.js** with the following configuration:

```typescript
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  // ... configuration details below
}
```

**Key features:**
- **Session Strategy**: JWT-based sessions
- **Cookie Configuration**: Secure, httpOnly cookies with strict sameSite policies
- **Environment-based Secrets**: Falls back to "SCA-nextauth-fallback-secret-change-in-production-env" if not set
- **Production Mode**: Uses secure cookies only in production (HTTPS)

---

## 2. Authentication Providers

The system supports **3 authentication methods**:

### A. Admin Credentials Provider (Email + Password)
```typescript
CredentialsProvider({
  id: "admin-credentials",
  name: "Admin Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    // Validates admin using getAdminByEmail() and verifyPassword()
    // Checks env variables: ADMIN_EMAIL and ADMIN_PASSWORD first
    // Falls back to database users
  }
})
```

**Env Override Support:**
- `ADMIN_EMAIL`: Environment variable admin email
- `ADMIN_PASSWORD`: Environment variable admin password
- Useful for Netlify deployments

### B. Player Credentials Provider (Email + Password)
```typescript
CredentialsProvider({
  id: "credentials",
  name: "Email Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    // Validates player using getByEmailAnyBranch() and verifyPassword()
    // Only allows users with role === "player"
  }
})
```

### C. Google OAuth Provider
```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET
})
```

**Requirements:**
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` env variables must be set
- Email must be verified by Google (profile.email_verified = true)
- Automatically creates/links users in the database

---

## 3. Demo User Credentials

### Location: [src/app/(auth)/signin/page.tsx](src/app/(auth)/signin/page.tsx) (Lines 272-289)

The demo credentials are hardcoded in the UI for easy testing:

#### **Admin Demo Account:**
```
Email:    admin@samarth.com
Password: admin123
```

#### **Player Demo Account:**
```
Email:    player@samarth.com
Password: player123
```

**Note:** These credentials are also visible in the signin page UI as "Demo Admin Account" and "Demo Player Account" sections.

### Actual Storage: [data/db.json](data/db.json)

The database contains the seeded admin user:
```json
{
  "id": "a1",
  "name": "Admin",
  "email": "admin@samarth.com",
  "phone": "",
  "branch_id": "samarth",
  "role": "admin",
  "experience": null,
  "isProfileComplete": true,
  "passwordSalt": "seed_salt_a1",
  "passwordHash": "f95d874917f239394ae5a7e3307c7812951a5aab39ae81c557a7700480a99121",
  "membership_status": "active",
  "failed_attempts": 1
}
```

---

## 4. Admin Login Page & Logic

### File: [src/app/(auth)/signin/page.tsx](src/app/(auth)/signin/page.tsx)

#### Page Structure:
- **Tab Switcher**: "Player Login" / "Admin Login" tabs
- **Components Used**: Input, Button, Card UI components
- **Form Handling**: React hooks for state management

#### Admin Login Form (Lines 310-365):
```typescript
const handleAdminLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    const res = await signIn("admin-credentials", {
      redirect: false,
      email: adminEmail,
      password: adminPassword,
    });

    if (res?.error) {
      setError("Invalid admin credentials.");
      setLoading(false);
      return;
    }

    // Successful login: hard redirect to fresh session
    window.location.href = callbackUrl ?? "/admin";
  } catch (err) {
    setError("Admin sign-in failed.");
    setLoading(false);
  }
};
```

**Key Behaviors:**
1. Calls `signIn("admin-credentials", ...)` with email and password
2. On error: displays "Invalid admin credentials" message
3. On success: performs hard redirect to `/admin` page (or callbackUrl)
4. Loading state prevents double-submissions
5. Uses `window.location.href` for fresh session (bypasses React Router)

#### Admin Panel UI (Lines 310-355):
```jsx
{tab === "admin" && (
  <form className="space-y-6" onSubmit={handleAdminLogin}>
    <Input
      label="Admin Email"
      type="email"
      placeholder="admin@samarth.com"
      value={adminEmail}
      onChange={(e) => setAdminEmail(e.target.value)}
    />
    <Input
      label="Password"
      type="password"
      placeholder="••••••••"
      value={adminPassword}
      onChange={(e) => setAdminPassword(e.target.value)}
    />
    {/* ... error display and submit button ... */}
  </form>
)}
```

---

## 5. Admin User Validation

### Validation Flow:

#### Step 1: Credential Provider Authorization
**File:** [src/server/auth/options.ts](src/server/auth/options.ts#L23-L60)

```typescript
async authorize(credentials) {
  const email = (credentials?.email ?? "").trim().toLowerCase();
  const password = credentials?.password ?? "";
  if (!email || !password) return null;

  // Check env-var override first
  const envAdminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const envAdminPassword = process.env.ADMIN_PASSWORD ?? "";

  if (envAdminEmail && envAdminPassword) {
    if (email === envAdminEmail && password === envAdminPassword) {
      return {
        id: "env_admin",
        name: "Admin",
        email: envAdminEmail,
        role: "admin",
        branch_id: "samarth",
        isProfileComplete: true,
        membership_status: "active",
      } as any;
    }
  }

  // Check database
  const admin = users.getAdminByEmail(email);
  if (!admin) return null;
  if (!users.verifyPassword(admin, password)) return null;

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    branch_id: admin.branch_id,
    isProfileComplete: admin.isProfileComplete,
    membership_status: admin.membership_status,
  } as any;
}
```

#### Step 2: Database Lookup
**File:** [src/server/db/inMemoryDb.ts](src/server/db/inMemoryDb.ts#L683-L686)

```typescript
getAdminByEmail: (email: string) => {
  const u = indexes.usersByEmail.get(email.toLowerCase());
  return u?.role === "admin" ? u : null;
}
```

**Validation rules:**
- Email is case-insensitive (lowercased before lookup)
- User MUST have `role === "admin"`
- Returns `null` if not found or role is not "admin"

#### Step 3: Password Verification
**File:** [src/server/db/inMemoryDb.ts](src/server/db/inMemoryDb.ts#L835-L859)

```typescript
verifyPassword: (user: DbUser, password: string) => {
  if (!user.passwordHash) return false;

  // Check lockout (after 5 failed attempts, locked for 15 minutes)
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
}
```

**Security Features:**
- Uses `bcryptjs` for password hashing (12-round salt)
- Account lockout after 5 failed attempts
- 15-minute lockout period
- Failed attempts counter resets on successful login

#### Step 4: JWT & Session Encoding
**File:** [src/server/auth/options.ts](src/server/auth/options.ts#L120-L150)

```typescript
async jwt({ token, user }) {
  if (user) {
    const userId = (user as any).id ?? token.sub;
    token.sub = userId;
    token.user_id = userId;
    token.role = (user as any).role ?? "player";
    token.branch_id = (user as any).branch_id ?? null;
    token.isProfileComplete = (user as any).isProfileComplete ?? false;
    token.membership_status = (user as any).membership_status ?? "none";
    token.name = (user as any).name ?? "";
    token.email = (user as any).email ?? "";
    return token;
  }
  // ... refresh user data from DB
  return token;
}

async session({ session, token }) {
  if (session.user) {
    (session.user as any).user_id = token.user_id ?? token.sub ?? "";
    (session.user as any).role = token.role ?? "player";
    (session.user as any).branch_id = token.branch_id ?? null;
    (session.user as any).isProfileComplete = token.isProfileComplete ?? false;
    (session.user as any).membership_status = token.membership_status ?? "none";
    (session.user as any).name = token.name ?? "";
    (session.user as any).email = token.email ?? "";
  }
  return session;
}
```

**Session Data Includes:**
- `user_id`: Unique user ID
- `role`: "admin" or "player"
- `branch_id`: "samarth" or "aims"
- `isProfileComplete`: Boolean flag
- `membership_status`: "active", "expired", "pending", "rejected", or "none"

#### Step 5: Middleware Protection
**File:** [src/middleware.ts](src/middleware.ts)

```typescript
export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Admin routes require admin role
        if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
          return token?.role === "admin";
        }

        // Player routes require authentication
        if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/player")) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/dashboard/:path*",
    "/api/player/:path*",
    "/api/membership/submit",
  ],
};
```

**Protected Routes:**
- `/admin/*` - Requires `role === "admin"`
- `/api/admin/*` - Requires `role === "admin"`
- `/dashboard/*` - Requires authentication
- `/api/player/*` - Requires authentication
- `/api/membership/submit` - Requires authentication

---

## 6. Password Hashing Algorithm

**Library:** `bcryptjs`

**Implementation:**
```typescript
const hashPassword = (password: string) => bcrypt.hashSync(password, 12);
const verifyPassword = (password: string, hash: string) => bcrypt.compareSync(password, hash);
```

- **Salt rounds:** 12 (industry standard)
- **Not reversible:** One-way hashing only

---

## 7. Auth Context for Client-Side Usage

**File:** [src/context/AuthContext.tsx](src/context/AuthContext.tsx)

```typescript
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const isLoading = status === "loading" && session === undefined;

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/");
  }, [router]);

  const updateSession = useCallback(async () => {
    await updateRef.current();
  }, []);

  const user: User | null = useMemo(() => {
    const u = session?.user;
    const userId = u?.user_id;
    const branch_id = u?.branch_id ?? null;
    const role = u?.role ?? null;
    if (!userId || !role) return null;
    return {
      id: userId,
      name: u?.name ?? "",
      email: u?.email ?? "",
      phone: "",
      branch_id: (branch_id ?? "samarth") as any,
      role: role as any,
      experience: "",
      isProfileComplete: !!u?.isProfileComplete,
      membership_status: (u as any)?.membership_status ?? "none",
    };
  }, [session?.user]);

  return (
    <AuthContext.Provider value={{ user, logout, updateSession, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

**Usage Example:**
```typescript
const { user, logout, isLoading } = useAuth();
// user?.role === "admin" to check if admin
// logout() to sign out
```

---

## 8. Type Definitions

**File:** [src/types/next-auth.d.ts](src/types/next-auth.d.ts)

```typescript
declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      user_id?: string;
      branch_id?: "samarth" | "aims" | null;
      role?: "player" | "admin";
      isProfileComplete?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user_id?: string;
    branch_id?: "samarth" | "aims" | null;
    role?: "player" | "admin";
    isProfileComplete?: boolean;
  }
}
```

---

## 9. Registration System

**File:** [src/app/api/auth/register/route.ts](src/app/api/auth/register/route.ts)

```typescript
const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().regex(/^[0-9+\-\s()]{10,20}$/, "Invalid phone number format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  branch_id: z.enum(["samarth", "aims"]),
});
```

**Validation Rules:**
- **Name:** 2-100 characters
- **Email:** Valid email format, case-insensitive
- **Phone:** 10-20 digits with optional formatting
- **Password:** Minimum 8 characters
- **Branch:** Must be "samarth" or "aims"
- **Rate Limit:** 5 signups per hour per IP

**On Registration:**
- New players start with `membership_status: "none"`
- `isProfileComplete` is set to `true` after first registration
- Password is hashed using bcryptjs before storage
- Email and phone uniqueness is validated

---

## 10. API Routes Summary

| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth core endpoints | No |
| `/api/auth/register` | POST | Player registration | No (rate limited) |
| `/api/auth/check-membership` | POST | Verify membership status | No |
| `/api/admin/*` | Any | Admin-only endpoints | Yes (admin role) |
| `/api/player/*` | Any | Player endpoints | Yes |

---

## 11. Key Security Features

1. ✅ **JWT-based sessions** - Stateless authentication
2. ✅ **HttpOnly cookies** - Prevents XSS attacks
3. ✅ **Secure flag in production** - HTTPS only in prod
4. ✅ **SameSite strict** - CSRF protection
5. ✅ **Bcrypt hashing** - 12-round salt
6. ✅ **Account lockout** - 5 attempts → 15-minute lock
7. ✅ **Email verification** - Google OAuth only
8. ✅ **Middleware protection** - Route-level access control
9. ✅ **Rate limiting** - 5 signups per hour per IP
10. ✅ **Role-based access** - Admin vs Player separation
11. ✅ **Env variable overrides** - For Netlify deployments

---

## 12. Environment Variables

**Required for Full Setup:**
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Optional: Override defaults
ADMIN_EMAIL=admin@samarth.com
ADMIN_PASSWORD=admin123

# For Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# For Netlify
URL=https://yoursite.netlify.app
```

---

## 13. Default Seeded Data

**Location:** [src/server/db/inMemoryDb.ts](src/server/db/inMemoryDb.ts) `buildSeedData()` function

When the app first runs without a persisted database:
- Creates admin user with email `admin@samarth.com`
- Password hashed from `ADMIN_PASSWORD` env or "admin123"
- Creates two branches: "samarth" and "aims"
- Initializes payment settings and plans

---

## 14. File Summary

| File | Purpose |
|------|---------|
| [src/server/auth/options.ts](src/server/auth/options.ts) | NextAuth configuration & providers |
| [src/middleware.ts](src/middleware.ts) | Route protection & authorization |
| [src/context/AuthContext.tsx](src/context/AuthContext.tsx) | Client-side auth context |
| [src/app/(auth)/signin/page.tsx](src/app/(auth)/signin/page.tsx) | Admin & player login UI |
| [src/server/db/inMemoryDb.ts](src/server/db/inMemoryDb.ts) | User management & validation |
| [src/types/next-auth.d.ts](src/types/next-auth.d.ts) | TypeScript type definitions |
| [src/app/api/auth/register/route.ts](src/app/api/auth/register/route.ts) | Player registration endpoint |
| [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts) | NextAuth API handler |
| [data/db.json](data/db.json) | Persistent database storage |

---

## Testing the System

### Login as Admin:
1. Go to `http://localhost:3000/signin`
2. Click "Admin Login" tab
3. Enter:
   - **Email:** `admin@samarth.com`
   - **Password:** `admin123`
4. Should redirect to `/admin`

### Login as Player:
1. Go to `http://localhost:3000/signin`
2. Click "Player Login" tab
3. Enter:
   - **Email:** `player@samarth.com`
   - **Password:** `player123`
4. Should redirect to `/dashboard`

### Test Account Lockout:
1. Try logging in with wrong password 5 times
2. Account locks for 15 minutes
3. Wait or modify `lockout_until` in database

---
