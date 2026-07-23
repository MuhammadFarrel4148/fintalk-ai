import {
  Utensils,
  Car,
  Receipt,
  ShoppingBag,
  Film,
  HeartPulse,
  GraduationCap,
  Sparkles,
  Home,
  ShieldCheck,
  CreditCard,
  HandHeart,
  MoreHorizontal,
  Landmark,
  Award,
  Briefcase,
  TrendingUp,
  Gift,
  Undo2,
  type LucideIcon,
} from "lucide-react";

// Categories are a fixed enum (prd.md §6.3 / apps/api/prisma/seed.ts), not
// user-creatable in v1, so hardcoded name->icon/color maps are appropriate here.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Expense
  "Makanan & Minuman": Utensils,
  Transportasi: Car,
  "Tagihan & Utilitas": Receipt,
  Belanja: ShoppingBag,
  Hiburan: Film,
  Kesehatan: HeartPulse,
  Pendidikan: GraduationCap,
  "Perawatan Diri": Sparkles,
  "Tempat Tinggal": Home,
  Asuransi: ShieldCheck,
  "Cicilan/Utang": CreditCard,
  Donasi: HandHeart,
  "Lain-lain": MoreHorizontal,
  // Income
  Gaji: Landmark,
  "Bonus/THR": Award,
  Freelance: Briefcase,
  Investasi: TrendingUp,
  Hadiah: Gift,
  "Refund/Reimbursement": Undo2,
};

export function getCategoryIcon(categoryName: string): LucideIcon {
  return CATEGORY_ICONS[categoryName] ?? MoreHorizontal;
}

interface CategoryColor {
  bg: string;
  text: string;
}

const FALLBACK_COLOR: CategoryColor = { bg: "bg-slate-100", text: "text-slate-500" };

// All income categories share one color (emerald), consistent with the green
// used for income elsewhere (TotalPemasukanCard, income arrows in TransactionsTable).
const INCOME_COLOR: CategoryColor = { bg: "bg-emerald-100", text: "text-emerald-600" };

const CATEGORY_COLORS: Record<string, CategoryColor> = {
  // Expense
  "Makanan & Minuman": { bg: "bg-red-100", text: "text-red-600" },
  Transportasi: { bg: "bg-blue-100", text: "text-blue-600" },
  "Tagihan & Utilitas": { bg: "bg-amber-100", text: "text-amber-600" },
  Belanja: { bg: "bg-blue-100", text: "text-blue-600" },
  Hiburan: { bg: "bg-purple-100", text: "text-purple-600" },
  Kesehatan: { bg: "bg-pink-100", text: "text-pink-600" },
  Pendidikan: { bg: "bg-indigo-100", text: "text-indigo-600" },
  "Perawatan Diri": { bg: "bg-teal-100", text: "text-teal-600" },
  "Tempat Tinggal": { bg: "bg-orange-100", text: "text-orange-600" },
  Asuransi: { bg: "bg-cyan-100", text: "text-cyan-600" },
  "Cicilan/Utang": { bg: "bg-slate-200", text: "text-slate-700" },
  Donasi: { bg: "bg-rose-100", text: "text-rose-600" },
  "Lain-lain": FALLBACK_COLOR,
  // Income
  Gaji: INCOME_COLOR,
  "Bonus/THR": INCOME_COLOR,
  Freelance: INCOME_COLOR,
  Investasi: INCOME_COLOR,
  Hadiah: INCOME_COLOR,
  "Refund/Reimbursement": INCOME_COLOR,
};

export function getCategoryColor(categoryName: string): CategoryColor {
  return CATEGORY_COLORS[categoryName] ?? FALLBACK_COLOR;
}
