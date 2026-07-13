import { ChevronLeft, ChevronRight } from "lucide-react";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function PaginationFooter({
  pagination,
  onPrev,
  onNext,
}: {
  pagination: Pagination;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { page, limit, total, totalPages } = pagination;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
      <span className="text-sm text-slate-500">
        {total === 0
          ? "Menampilkan 0 dari 0 transaksi"
          : `Menampilkan ${start}-${end} dari ${total} transaksi`}
      </span>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
          aria-label="Sebelumnya"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
          aria-label="Berikutnya"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
