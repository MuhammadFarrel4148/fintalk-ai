import { WalletMinimal } from "lucide-react";

export default function TopAppBar() {
  return (
    <header className="sticky top-0 flex w-full items-center bg-slate-50 px-4 py-4 md:px-8">
      <div className="flex items-center gap-2 text-2xl font-semibold text-blue-600">
        <WalletMinimal size={28} />
        FinTalk.ai
      </div>
    </header>
  );
}
