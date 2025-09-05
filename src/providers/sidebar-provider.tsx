"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getGroupById } from "@/lib/firestore/groups";
import { getUserById, removeGroupFromUser } from "@/lib/firestore/users";
import { GroupDoc } from "@/models/Group";
import { UserDoc } from "@/models/User";
import { useAuth } from "@/providers/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import { Loader2, Plus, UserPlus, Users, X } from "lucide-react";
import { redirect, useParams, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface SidebarContextValue {
  toggle: () => void;
  setOpen: () => void;
  setClose: () => void;
  reloadGroups: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  toggle: () => {},
  setOpen: () => {},
  setClose: () => {},
  reloadGroups: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const { currentUser, loading } = useAuth();
  const [userDoc, setUserDoc] = useState<UserDoc | undefined | null>(undefined);

  const [groups, setGroups] = useState<GroupDoc[]>([]);

  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const params = useParams();
  const router = useRouter();
  const currentGroupId = params.groupId as string;

  const fetchData = useCallback(async () => {
    if (!currentUser) {
      setUserDoc(null);
      setGroups([]);
      return;
    }
    const fetchedUserDoc = await getUserById(currentUser.uid);
    if (!fetchedUserDoc) {
      setUserDoc(null);
      setGroups([]);
      return;
    }
    setUserDoc(fetchedUserDoc);
    const fetchedGroups = await Promise.all(
      fetchedUserDoc.groups.map(async (groupId: string) => {
        const fetchedGroup = await getGroupById(groupId, currentUser.uid);
        console.log(fetchedGroup);
        if (!fetchedGroup || !fetchedGroup?.members || !fetchedGroup.private) {
          await removeGroupFromUser(currentUser.uid, groupId);
          return null;
        } else {
          return fetchedGroup;
        }
      })
    );
    setGroups(fetchedGroups.filter((g): g is GroupDoc => g !== null));
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || userDoc === undefined) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!currentUser || !userDoc) {
    redirect("/login");
  }

  const handleGroupSelect = (groupId: string) => {
    router.push(`/dashboard/${groupId}`);
    setClose();
  };

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  const setOpen = () => {
    setIsOpen(true);
  };

  const setClose = () => {
    setIsOpen(false);
  };

  return (
    <SidebarContext.Provider
      value={{ toggle, setOpen, setClose, reloadGroups: fetchData }}
    >
      <div className="flex h-screen bg-background relative">
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setClose()}
          />
        )}

        {/* Left Sidebar - Groups List */}
        <div
          className={`
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        fixed lg:relative z-50 lg:z-auto
        w-full sm:w-80 lg:w-80 h-full
        border-r border-border bg-card
      `}
        >
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">Mis Grupos</h1>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setClose()}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => redirect("/dashboard/create-group")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear
              </Button>

              <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Unirse
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Unirse a Grupo</DialogTitle>
                    <DialogDescription>
                      Introduce el código del grupo para unirte.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="code">Código del Grupo</Label>
                      <Input id="code" placeholder="Ej: AMG2024" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setShowJoinDialog(false)}>
                      Unirse
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="overflow-y-auto">
            {groups.map((group) => {
              if (!group.private || !group.members) return null;

              const isActive = currentGroupId === group.id;

              return (
                <div
                  key={group.id}
                  className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                    isActive ? "bg-muted" : ""
                  }`}
                  onClick={() => handleGroupSelect(group.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm truncate flex-1">
                      {group.public.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {group.public.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {Object.keys(group.members).length}
                    </div>
                    <Badge
                      variant={
                        group.public.status === "draft"
                          ? "secondary"
                          : group.public.status === "activo"
                          ? "default"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {group.public.status === "draft"
                        ? "Draft"
                        : group.public.status === "activo"
                        ? "Activo"
                        : "Finalizado"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
