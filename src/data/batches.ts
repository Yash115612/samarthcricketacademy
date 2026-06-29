import { BranchId } from "@/types/dashboard";

export interface Batch {
  id: string;
  name: string;
  time: string;
  days: string;
  coach: string;
  branch_id: BranchId;
  students: number;
}

export const BATCHES: Batch[] = [
  { id: "morning", name: "Morning session", time: "06:00 AM - 09:00 AM", days: "Mon - Sat", coach: "Vikram Rathore", branch_id: "samarth", students: 45 },
  { id: "afternoon", name: "Afternoon session", time: "04:00 PM - 07:00 PM", days: "Mon - Sat", coach: "Sanjay Bangar", branch_id: "samarth", students: 32 },
  { id: "evening_aims", name: "Evening session", time: "07:00 PM - 09:00 PM", days: "Mon - Sat", coach: "Zaheer Khan", branch_id: "aims", students: 28 },
];
