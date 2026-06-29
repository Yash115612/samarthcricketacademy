export const MEMBERSHIP_PLANS = [
  {
    id: "monthly" as const,
    label: "2 Months Plan",
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
    popular: true,
  },
  {
    id: "pt" as const,
    label: "Personal Training",
    price: 0, // Custom price
    duration_days: 30,
    duration_label: "Contact Base",
    features: [
      "One-to-one coaching (coach + player only)",
      "Personalized training sessions",
      "No group practice",
      "Premium styling & badge",
      "Dedicated coach support",
    ],
    popular: false,
    contactOnly: true,
  },
] as const;

export type PlanId = (typeof MEMBERSHIP_PLANS)[number]["id"];

export const getPlanById = (id: string) =>
  MEMBERSHIP_PLANS.find((p) => p.id === id) ?? null;
