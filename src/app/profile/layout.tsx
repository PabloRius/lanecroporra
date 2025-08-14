import { getAuthenticatedAppForUser } from "@/lib/firebase/serverApp";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser } = await getAuthenticatedAppForUser();
  if (!currentUser) {
    redirect("/login");
  }
  return children;
}
