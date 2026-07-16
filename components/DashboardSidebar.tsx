"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Send,
  Receipt,
  User,
  Settings,
  LogOut,
  Home,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

interface DashboardSidebarProps {
  onLogout: () => void;
}

export default function DashboardSidebar({ onLogout }: DashboardSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
    { href: "/dashboard/deposit", label: "Deposit", icon: ArrowDownLeft },
    { href: "/dashboard/transfer", label: "Send Money", icon: Send },
    { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen p-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-blue-600">FinTech</span>
        </Link>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <Link
          href="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>

        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
