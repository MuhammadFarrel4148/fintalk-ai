import { describe, it, expect } from "vitest";
import { Utensils, Landmark, MoreHorizontal } from "lucide-react";
import { getCategoryIcon, getCategoryColor } from "../categoryIcons";

describe("getCategoryIcon", () => {
  it("returns the mapped icon for an expense category", () => {
    expect(getCategoryIcon("Makanan & Minuman")).toBe(Utensils);
  });

  it("returns the mapped icon for an income category", () => {
    expect(getCategoryIcon("Gaji")).toBe(Landmark);
  });

  it("falls back to MoreHorizontal for an unknown category", () => {
    expect(getCategoryIcon("Kategori Aneh")).toBe(MoreHorizontal);
  });
});

describe("getCategoryColor", () => {
  it("returns the mapped color for an expense category", () => {
    expect(getCategoryColor("Makanan & Minuman")).toEqual({
      bg: "bg-red-100",
      text: "text-red-600",
    });
  });

  it("returns the same emerald color for every income category", () => {
    const incomeCategories = [
      "Gaji",
      "Bonus/THR",
      "Freelance",
      "Investasi",
      "Hadiah",
      "Refund/Reimbursement",
    ];

    for (const category of incomeCategories) {
      expect(getCategoryColor(category)).toEqual({
        bg: "bg-emerald-100",
        text: "text-emerald-600",
      });
    }
  });

  it("falls back to the neutral slate color for an unknown category", () => {
    expect(getCategoryColor("Kategori Aneh")).toEqual({
      bg: "bg-slate-100",
      text: "text-slate-500",
    });
  });
});
