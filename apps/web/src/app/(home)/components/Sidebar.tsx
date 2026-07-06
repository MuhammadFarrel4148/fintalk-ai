"use client";

import {
  WalletMinimal,
  LayoutDashboard,
  Banknote,
  ChartLine,
  Bot,
  Settings,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";

function MenuItems({ listItems, pathname }: MenuItemsProps) {
  return (
    <>
      {listItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg border-r-4 px-4 py-3 transition-colors duration-200 ${isActive ? "border-blue-600 bg-blue-50 font-semibold text-blue-600" : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            {item.icon}
            {item.name}
          </Link>
        );
      })}
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  const menuItemsTop = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Transactions", href: "/transactions", icon: <Banknote size={20} /> },
    { name: "Analytics", href: "/analytics", icon: <ChartLine size={20} /> },
    { name: "AI Advisor", href: "/ai-advisor", icon: <Bot size={20} /> },
  ];

  const menuItemsBottom = [
    { name: "Settings", href: "/settings", icon: <Settings size={20} /> },
    { name: "Logout", href: "/logout", icon: <LogOut size={20} /> },
  ];

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 shadow-sm">
      <div className="mb-10 flex items-center gap-2 px-2 text-2xl font-semibold text-blue-600">
        <WalletMinimal size={28} />
        FinTalk.ai
      </div>

      <nav className="flex-1 space-y-1">
        <MenuItems listItems={menuItemsTop} pathname={pathname} />
      </nav>

      <div className="space-y-1 border-t border-slate-200 pt-4">
        <MenuItems listItems={menuItemsBottom} pathname={pathname} />
      </div>
    </aside>
  );
}

interface MenuItemsProps {
  listItems: Array<{ name: string; href: string; icon: React.ReactNode }>;
  pathname: string | null;
}
