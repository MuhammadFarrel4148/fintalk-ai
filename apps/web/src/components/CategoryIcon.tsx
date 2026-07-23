import type { LucideIcon } from "lucide-react";
import { getCategoryIcon, getCategoryColor } from "@/lib/categoryIcons";

function Glyph({ Icon, size }: { Icon: LucideIcon; size: number }) {
  return <Icon size={size} />;
}

export function CategoryIcon({ categoryName, size = 20 }: { categoryName: string; size?: number }) {
  const { bg, text } = getCategoryColor(categoryName);

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bg} ${text}`}
    >
      <Glyph Icon={getCategoryIcon(categoryName)} size={size} />
    </div>
  );
}
