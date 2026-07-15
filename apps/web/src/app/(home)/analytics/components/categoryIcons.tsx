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
  type LucideIcon,
} from "lucide-react";

// Expense categories are a fixed enum (prd.md §6.3 / apps/api/prisma/seed.ts EXPENSE_CATEGORIES),
// not user-creatable in v1, so a hardcoded name->icon map is appropriate here.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
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
};

export function getCategoryIcon(categoryName: string): LucideIcon {
  return CATEGORY_ICONS[categoryName] ?? MoreHorizontal;
}
