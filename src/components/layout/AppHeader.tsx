"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/auth/UserMenu";
import { User } from "next-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Receipt,
  Clock,
  ImageIcon,
  Menu,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { isAdmin } from "@/lib/auth";
import { ModeToggle } from "@/components/common/ModeToggle";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

interface AppHeaderProps {
  user: User;
}

const allNavigation = [
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Timeline", href: "/timeline", icon: Clock },
  { name: "Gallery", href: "/gallery", icon: ImageIcon },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = allNavigation.filter(
    (item) => !item.adminOnly || userIsAdmin
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/icon.png" alt="TravelKon" width={28} height={28} />
          <span className="text-lg font-semibold">TravelKon</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
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
          <div className="hidden md:block">
            <UserMenu user={user} />
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full mt-4">
                <div className="flex items-center gap-3 pb-6 border-b mb-2 ml-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name || ""}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <nav className="flex flex-col gap-1 flex-1">
                  {navigation.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname?.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                          isActive
                            ? "bg-secondary text-secondary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await signOut({
                        callbackUrl: "/auth/signin",
                        redirect: true,
                      });
                    }}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Sign out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
