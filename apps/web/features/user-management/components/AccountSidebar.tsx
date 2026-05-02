"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@tasheen/ui";
import { 
  LayoutDashboard, 
  History, 
  BookUser, 
  CreditCard, 
  ShieldCheck, 
  UserX 
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/account", icon: LayoutDashboard },
  { label: "Order History", href: "/account/orders", icon: History },
  { label: "Address Book", href: "/account/addresses", icon: BookUser },
  { label: "Payment Methods", href: "/account/payment-methods", icon: CreditCard },
  { label: "Security & Settings", href: "/account/settings", icon: ShieldCheck },
  { label: "Account Deletion", href: "/account/delete", icon: UserX },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-72 flex flex-col bg-stone-50/30 border-r border-stone-100 min-h-[calc(100vh-10rem)]">
      <div className="p-8 border-b border-stone-100">
        <h2 className="font-serif text-lg tracking-widest uppercase text-charcoal">
          Tasheen Member
        </h2>
        <p className="text-[10px] tracking-widest uppercase text-stone-400 mt-1">
          Artisanal Excellence
        </p>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-8 py-4 text-[11px] tracking-widest uppercase transition-all duration-300",
                    isActive 
                      ? "bg-charcoal text-cream font-bold" 
                      : "text-stone-500 hover:bg-stone-50 hover:text-charcoal"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-gold" : "text-stone-400")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
