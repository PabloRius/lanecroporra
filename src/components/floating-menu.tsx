"use client";

import { Button } from "@/components/ui/button";
import { getUserById } from "@/lib/firestore/users";
import { UserDoc } from "@/models/User";
import { useAuth } from "@/providers/auth-provider";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Menu, ShieldUser, User as UserIcon, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { Tooltip } from "./ui/tooltip";

export function FloatingMenu() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentUser, loading } = useAuth();
  const [user, setUser] = useState<UserDoc | undefined | null>(undefined);

  useEffect(() => {
    if (currentUser && !loading) {
      const fetchUser = async () => {
        const userData = await getUserById(currentUser.uid);
        if (!userData) {
          console.error("User not found");
          setUser(null);
          return;
        }
        setUser(userData);
      };
      fetchUser();
    }
  }, [currentUser, loading]);

  const isAdmin = user?.role === "admin";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-3 transition-all duration-300 ease-in-out ${
            isExpanded
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 translate-x-8 pointer-events-none"
          }`}
        >
          {/* Admin button */}
          {isAdmin && (
            <Tooltip>
              <TooltipContent>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Ir a panel Admin
                </span>
              </TooltipContent>
              <TooltipTrigger asChild>
                <Link href="/admin">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-2 hover:bg-accent hover:scale-110 transition-all duration-200 shadow-lg"
                  >
                    <ShieldUser className="h-5 w-5" />
                    <span className="sr-only">Admin</span>
                  </Button>
                </Link>
              </TooltipTrigger>
            </Tooltip>
          )}
          {/* Profile button */}
          <Tooltip>
            <TooltipContent>
              {currentUser ? (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Ver perfil
                </span>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Inicia sesión para ver tu perfil
                </span>
              )}
            </TooltipContent>
            <TooltipTrigger asChild>
              <Link href={currentUser ? "/profile" : "/login"}>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-2 hover:bg-accent hover:scale-110 transition-all duration-200 shadow-lg"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="sr-only">Perfil</span>
                </Button>
              </Link>
            </TooltipTrigger>
          </Tooltip>

          {/* Theme toggle button */}
          <ModeToggle />
        </div>

        {/* Main toggle button */}
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          size="icon"
          className="h-14 w-14 rounded-full bg-foreground text-background hover:bg-foreground/90 hover:scale-110 transition-all duration-200 shadow-xl"
        >
          <Menu
            className={`h-6 w-6 transition-all duration-300 ${
              isExpanded ? "rotate-90 scale-0" : "rotate-0 scale-100"
            }`}
          />
          <X
            className={`absolute h-6 w-6 transition-all duration-300 ${
              isExpanded ? "rotate-0 scale-100" : "-rotate-90 scale-0"
            }`}
          />
          <span className="sr-only">Menú</span>
        </Button>
      </div>
    </div>
  );
}
