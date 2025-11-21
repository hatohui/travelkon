"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/auth/UserMenu";
import { User } from "next-auth";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Calendar, Receipt, Globe } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { ModeToggle } from "@/components/common/ModeToggle";
import Image from "next/image";

interface AppHeaderProps {
  user: User;
}

const allNavigation = [
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  {
    name: "Admin",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
    adminOnly: true,
  },
];

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const userIsAdmin = isAdmin(user.email);

  const navigation = allNavigation.filter(
    (item) => !item.adminOnly || userIsAdmin
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Image src="/icon.png" alt="TravelKon" width={28} height={28} />
          <span className="text-lg font-semibold">TravelKon</span>
        </div>

        <nav className="flex items-center gap-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
