"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ArrowLeft, ArrowRight, Upload, X, Users, CheckCircle, Info, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { getPlanById } from "@/data/plans";

const BRANCHES = [
  { id: "samarth", name: "Samarth Cricket Academy", location: "Main Branch, Pune" },
  { id: "aims", name: "AIMS Academy", location: "Second Branch, Mumbai" },
];

function PaymentPageContent() {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("plan") ?? "";
  const branchFromUrl = searchParams.get("branch") as "samarth" | "aims" | null;
  const plan = getPlanById(planId);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    branch_id: (branchFromUrl === "samarth" || branchFromUrl === "aims" ? branchFromUrl : "samarth") as "samarth" | "aims",
    utr_number: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user?.name ?? prev.name,
        email: session.user?.email ?? prev.email,
        phone: (session.user as any).phone ?? prev.phone,
        branch_id: (session.user as any).branch_id ?? (branchFromUrl === "samarth" || branchFromUrl === "aims" ? branchFromUrl : prev.branch_id),
      }));
    }
  }, [session, branchFromUrl]);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [qrSaved, setQrSaved] = useState(false);

  const handleSaveQR = () => {
    const url = paymentSettings?.payment_qr_url || "/qr-code.svg";
    const link = document.createElement("a");
    link.href = url;
    link.download = "samarth-cricket-payment-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setQrSaved(true);
    setTimeout(() => setQrSaved(false), 3000);
  };

  const [paymentSettings, setPaymentSettings] = useState<{
    payment_qr_url: string;
    payment_upi_id: string;
    payment_instructions: string[];
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchSettings = async () => {
      try {
        const branchId = formData.branch_id || branchFromUrl || "samarth";
        const res = await fetch(
          `/api/public/settings?branch=${branchId}&t=${Date.now()}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!mounted) return;
        if (data?.ok) setPaymentSettings(data.settings);
      } catch {
        // ignore
      }
    };
    fetchSettings();
    return () => { mounted = false; };
  }, [formData.branch_id, branchFromUrl]);

  useEffect(() => {
    if (!plan) router.replace("/membership");
  }, [plan, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Screenshot must be under 5 MB.");
      return;
    }
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!screenshot) {
      setError("Please upload your payment screenshot.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/membership/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          plan_id: planId,
          plan_type: "monthly",
          screenshot_url: screenshot,
        }),
      });
      const data = (await res.json().catch(() => null)) as any;

      if (!res.ok || !data?.ok) {
        const messages: Record<string, string> = {
          EMAIL_INVALID: "Please enter a valid email address.",
          BRANCH_INVALID: "Please select a valid branch.",
          UTR_REQUIRED: "UTR number is required.",
          SCREENSHOT_REQUIRED: "Payment screenshot is required.",
          ALREADY_PENDING: "A pending payment already exists for this phone and branch. Please wait for admin approval.",
          PLAN_INVALID: "Invalid plan selected.",
        };
        setError(messages[data?.error] ?? "Submission failed. Please try again.");
        return;
      }

      router.push(
        `/membership/pending?name=${encodeURIComponent(formData.name)}&plan=${encodeURIComponent(plan?.label ?? "")}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!plan) return null;

  return (
    <main className="min-h-screen bg-academy-dark flex items-start justify-center p-6 pt-12">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2073&auto=format&fit=crop"
          alt="background"
          fill
          priority
          className="object-cover grayscale opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-academy-dark via-academy-dark to-academy-gold/10" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Back */}
        <Link href="/membership" className="inline-flex items-center gap-3 mb-10 group">
          <ArrowLeft size={14} /> Back to Plans
        </Link>

        {/* Step indicator */}
        <div className="text-center mb-8">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-academy-gold border border-academy-gold/30 bg-academy-gold/10 px-4 py-1.5 rounded-full">
            Step 2 of 2 — Complete Payment
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: QR + Instructions */}
          <div className="space-y-6">
            {/* Plan Summary */}
            <Card className="p-6 border-white/10 bg-academy-gray/50 backdrop-blur-xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Selected Plan</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black uppercase">{plan.label}</p>
                  <p className="text-[11px] text-academy-gold font-black uppercase tracking-widest">{plan.duration_label}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-white">₹{plan.price.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </Card>

            {/* QR Code */}
            <Card className="p-6 border-white/10 bg-academy-gray/50 backdrop-blur-xl text-center">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Scan & Pay via UPI</h3>
              <div className="flex justify-center mb-3">
                <div className="w-52 h-52 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl shadow-academy-gold/10 border-4 border-academy-gold/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={paymentSettings?.payment_qr_url || "/qr-code.svg"}
                    alt="UPI QR Code"
                    className="w-full h-full object-contain p-3"
                  />
                </div>
              </div>
              {/* Save QR Button */}
              <button
                type="button"
                onClick={handleSaveQR}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all mb-4",
                  qrSaved
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-academy-gold/10 hover:border-academy-gold/30 hover:text-academy-gold"
                )}
              >
                {qrSaved ? <CheckCircle size={12} /> : <Download size={12} />}
                {qrSaved ? "Saved to device!" : "Save QR to Gallery"}
              </button>
              <div className="space-y-2">
                <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                  Open any UPI app (GPay, PhonePe, Paytm) and scan the QR code to pay{" "}
                  <span className="text-white font-black">₹{plan.price.toLocaleString("en-IN")}</span>
                </p>
                {paymentSettings?.payment_upi_id && (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Or Pay to UPI ID</span>
                    <code className="px-3 py-1 bg-white/5 rounded-lg text-academy-gold font-black text-xs border border-white/5">
                      {paymentSettings.payment_upi_id}
                    </code>
                  </div>
                )}
              </div>
            </Card>

            {/* Payment Instructions */}
            <Card className="p-6 border-white/10 bg-white/[0.03]">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Instructions</h3>
              <ol className="space-y-3">
                {(paymentSettings?.payment_instructions || [
                  "Scan the QR code using any UPI app",
                  `Pay ₹${plan.price.toLocaleString("en-IN")} for the ${plan.label} plan`,
                  "Note the UTR / Transaction Reference Number",
                  "Take a screenshot of the payment confirmation",
                  "Fill the form and upload your screenshot",
                  "Sign in using your phone number OTP after admin approval",
                ]).map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-gray-400">
                    <span className="w-5 h-5 rounded-full bg-academy-red/20 text-academy-red text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          {/* RIGHT: Form */}
          <Card className="p-8 border-white/10 bg-academy-gray/50 backdrop-blur-xl">
            {!session && (
              <div className="mb-8 p-5 rounded-2xl bg-academy-red/10 border border-academy-red/30">
                <div className="flex items-start gap-3">
                  <Info size={18} className="text-academy-red mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-academy-red mb-1">Account Required</p>
                    <p className="text-xs text-gray-300 leading-relaxed mb-4">
                      Please sign up or sign in first so we can link your membership to your account.
                    </p>
                    <div className="flex gap-3">
                      <Link href="/signup" className="text-[10px] font-black uppercase tracking-widest text-black bg-white px-4 py-2 rounded-xl hover:bg-gray-200 transition-all">Sign Up</Link>
                      <Link href="/signin" className="text-[10px] font-black uppercase tracking-widest text-white border border-white/20 px-4 py-2 rounded-xl hover:bg-white/5 transition-all">Sign In</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h2 className="text-lg font-black uppercase tracking-tight mb-2">Your Details</h2>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-6">
              {session ? "Confirm your account details below" : "Enter your details to link your account"}
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  disabled={!!session}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+91 00000 00000"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  disabled={!!session}
                />
              </div>

              <Input
                label="Email Address (Optional)"
                type="email"
                placeholder="you@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                disabled={!!session}
              />

              {/* Branch Selection */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Branch</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BRANCHES.map((branch) => (
                    <label key={branch.id} className={cn("relative cursor-pointer group", !!session && formData.branch_id !== branch.id && "opacity-50 grayscale pointer-events-none")}>
                      <input
                        type="radio"
                        name="branch_id"
                        value={branch.id}
                        className="peer sr-only"
                        checked={formData.branch_id === branch.id}
                        onChange={() => setFormData((p) => ({ ...p, branch_id: branch.id as any }))}
                        disabled={!!session}
                      />
                      <div className="p-3 border border-white/10 rounded-xl bg-white/5 peer-checked:border-academy-gold peer-checked:bg-academy-gold/10 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <Users size={12} className="text-academy-gold" />
                          <span className="text-[10px] font-black uppercase tracking-tight">{branch.name}</span>
                        </div>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{branch.location}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* UTR Number */}
              <Input
                label="UTR / Transaction Reference Number"
                placeholder="Enter 12-digit UTR number"
                required
                value={formData.utr_number}
                onChange={(e) => setFormData((p) => ({ ...p, utr_number: e.target.value }))}
              />

              {/* Screenshot Upload */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
                  Payment Screenshot <span className="text-academy-red">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {screenshot ? (
                  <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-emerald-400 flex-1 truncate">{screenshotName}</span>
                    <button
                      type="button"
                      onClick={() => { setScreenshot(null); setScreenshotName(""); }}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center gap-3 p-6 border-2 border-dashed border-white/20 rounded-xl hover:border-academy-gold/50 hover:bg-academy-gold/5 transition-all group"
                  >
                    <Upload size={24} className="text-gray-500 group-hover:text-academy-gold transition-colors" />
                    <div className="text-center">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                        Upload Screenshot
                      </p>
                      <p className="text-[10px] text-gray-600 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </button>
                )}
              </div>

              {error && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center bg-red-500/10 py-3 rounded-xl" role="alert">
                  {error}
                </p>
              )}

              <Button
                variant="secondary"
                size="lg"
                className="w-full h-14 text-base uppercase tracking-widest font-black shadow-2xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Payment"} <ArrowRight className="ml-2" size={18} />
              </Button>

              <p className="text-[10px] text-gray-600 text-center font-bold uppercase tracking-widest">
                Account created after admin approval — sign in via Phone OTP or Google
              </p>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-academy-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-academy-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
