"use client";

import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { Button } from "./ui/button";

export function StartLink() {
  const { currentUser } = useAuth();
  return (
    <Link href={currentUser ? "/dashboard" : "/login"}>
      <Button
        size="lg"
        className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-0"
      >
        Empezar
      </Button>
    </Link>
  );
}
