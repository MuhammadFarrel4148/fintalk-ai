import type { CategoryBreakdownItem } from "../hooks/useCategoryBreakdown";

// Fixed categorical order, validated for CVD-safe adjacent contrast (see dataviz skill).
// Never cycled/regenerated — a category beyond this count folds into "Lainnya" below
// instead of getting a synthesized 8th+ hue.
export const CATEGORY_CHART_COLORS = [
  "#2a78d6", // blue
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
  "#e87ba4", // magenta
];

const OTHER_COLOR = "#94a3b8"; // slate-400, matches this app's existing muted-text convention

export interface CategoryChartItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  transactionCount: number;
  percentage: number;
  color: string;
}

// Splits the sorted breakdown into direct-colored slots plus a single aggregated
// "Lainnya" bucket for anything beyond CATEGORY_CHART_COLORS.length, per the rule
// that a 9th+ series should never get a generated hue.
export function buildCategoryChartItems(categories: CategoryBreakdownItem[]): CategoryChartItem[] {
  const maxDirect = CATEGORY_CHART_COLORS.length;
  const direct = categories.slice(0, maxDirect).map((c, i) => ({
    ...c,
    color: CATEGORY_CHART_COLORS[i],
  }));

  const rest = categories.slice(maxDirect);
  if (rest.length === 0) return direct;

  const other: CategoryChartItem = {
    categoryId: "other",
    categoryName: "Lainnya",
    amount: rest.reduce((sum, c) => sum + c.amount, 0),
    transactionCount: rest.reduce((sum, c) => sum + c.transactionCount, 0),
    percentage: rest.reduce((sum, c) => sum + c.percentage, 0),
    color: OTHER_COLOR,
  };

  return [...direct, other];
}
