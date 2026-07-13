export function CategoryBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
      {name}
    </span>
  );
}
