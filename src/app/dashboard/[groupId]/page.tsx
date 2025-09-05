"use client";

import GroupManagementModal from "@/components/group-management-modal";
import { LeaderBoardCard } from "@/components/leaderboard-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getGroupById } from "@/lib/firestore/groups";
import { getUserById, resolveUserId } from "@/lib/firestore/users";
import { timeAgo } from "@/lib/time-ago";
import { getTimeLeft } from "@/lib/time-left";
import { BetDoc } from "@/models/Bet";
import { GroupDoc } from "@/models/Group";
import { UserDoc } from "@/models/User";
import { useAuth } from "@/providers/auth-provider";
import { useSidebar } from "@/providers/sidebar-provider";
import {
  AlertCircle,
  Calendar,
  EyeOff,
  Loader2,
  Menu,
  Settings,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { currentUser, loading } = useAuth();
  const [user, setUser] = useState<UserDoc | undefined | null>(undefined);

  const [group, setGroup] = useState<GroupDoc | undefined | null>(undefined);
  const [showGroupManagement, setShowGroupManagement] = useState(false);

  const [timeLeft, setTimeLeft] = useState<{
    months: number;
    days: number;
    expired: boolean;
  } | null>(null);

  const { setOpen } = useSidebar();

  const [showMemberListModal, setShowMemberListModal] = useState(false);
  const [selectedMemberList, setSelectedMemberList] = useState<{
    name: string;
    list: BetDoc[];
  } | null>(null);

  const fetchGroupData = useCallback(async () => {
    const { groupId } = await params;
    if (groupId && currentUser) {
      const fetchedGroup = await getGroupById(groupId, currentUser?.uid);
      setGroup(fetchedGroup);
    }
  }, [params, currentUser]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  useEffect(() => {
    if (group) {
      const updateCountdown = () => {
        setTimeLeft(getTimeLeft(group.public.deadline));
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 3600000);

      return () => clearInterval(interval);
    }
  }, [group]);

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

  const handleViewMemberList = async (playerUid: string) => {
    if (!group || !group.members) return;
    const memberName = await resolveUserId(playerUid);
    const memberList = group.members[playerUid].list.bets;
    if (!memberList || !memberName) return;
    setSelectedMemberList({ name: memberName, list: memberList });
    setShowMemberListModal(true);
  };

  if (loading || user === undefined || group === undefined) {
    return (
      <div className="flex flex-1 w-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (user === null) {
    redirect("/login");
  }

  if (!group || !group.private || !group.members) {
    redirect("/dashboard");
  }

  const isAdmin = group?.members
    ? group?.members[user.uid].role === "admin"
    : false;

  return (
    <div className="flex flex-1 h-{dvh} bg-background relative">
      {/* Right Panel - Group Details */}
      <div className="relative flex-1 flex flex-col min-w-0">
        <>
          <div className="lg:hidden p-4 border-b border-border bg-card flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setOpen()}>
              <Menu className="w-4 h-4" />
            </Button>
            <h2 className="font-semibold truncate flex-1">
              {group.public.name}
            </h2>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGroupManagement(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="lg:hidden  left-0 right-0 z-30 bg-card border-b border-border p-3">
            <div className="grid grid-cols-3 gap-2">
              <Card className="shadow-none border-muted">
                <CardContent className="p-2 text-center">
                  <div className="flex flex-col items-center">
                    <Users className="w-3 h-3 text-muted-foreground mb-1" />
                    <p className="text-xs font-medium">
                      {Object.keys(group.members!).length}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      miembros
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none border-muted">
                <CardContent className="p-2 text-center">
                  <div className="flex flex-col items-center">
                    <Calendar className="w-3 h-3 text-muted-foreground mb-1" />
                    {timeLeft && !timeLeft.expired ? (
                      <>
                        <p className="text-xs font-medium">
                          {timeLeft.months}m {timeLeft.days}d
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          restantes
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-medium text-red-500">
                          Expirado
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          fecha límite
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none border-muted">
                <CardContent className="p-2 text-center">
                  <div className="flex flex-col items-center">
                    <Trophy className="w-3 h-3 text-muted-foreground mb-1" />
                    <p className="text-xs font-medium">
                      {
                        Object.values(group.members || {}).filter(
                          (member) => Object.keys(member.list.bets).length > 0
                        ).length
                      }
                      /{Object.keys(group.members!).length}
                    </p>
                    <p className="text-[10px] text-muted-foreground">listas</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="hidden lg:block p-6 border-b border-border bg-card">
            <div className="flex items-start justify-between mb-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold truncate">
                    {group.public.name}
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  {group.public.description}
                </p>
              </div>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGroupManagement(true)}
                  className="bg-transparent"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Gestionar
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {Object.keys(group.members!).length} Miembro
                        {Object.keys(group.members!).length > 1 && "s"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        En el grupo
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      {timeLeft && !timeLeft.expired ? (
                        <>
                          <p className="text-sm font-medium">
                            {timeLeft.months} meses, {timeLeft.days} días
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tiempo restante
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-red-500">
                            Expirado
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Fecha límite
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {
                          Object.values(group.members || {}).filter(
                            (member) => Object.keys(member.list.bets).length > 0
                          ).length
                        }
                        /{Object.keys(group.members!).length} Listas
                      </p>
                      <p className="text-xs text-muted-foreground">Enviadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex-1 p-4 lg:p-6 overflow-y-auto lg:pt-6 ">
            <div className="grid gap-4 lg:gap-6">
              <Card>
                <CardHeader className="pb-3 lg:pb-6">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span>Mi Lista</span>
                    <Button size="sm" className="w-full sm:w-auto" asChild>
                      <Link
                        href={group.id + "/edit-list"}
                        className="flex items-center gap-1"
                      >
                        {group.public.status === "draft"
                          ? "Editar Lista"
                          : "Ver Lista"}
                        {/* Warning if any deceased before deadline */}
                        {group.members![user.uid].list.bets.some(
                          (p) => p.status === "deceased"
                        ) && <AlertCircle className="w-4 h-4 text-red-600" />}
                      </Link>
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Tu lista de famosos para este grupo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {group.members![user.uid] &&
                  Object.keys(group.members![user.uid].list).length > 0 ? (
                    <div className="space-y-3">
                      {group.members![user.uid].list.bets.map(
                        (person, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1 flex items-center justify-between">
                              <p className="font-medium text-sm lg:text-base truncate">
                                {person.name}
                              </p>
                              {person.status === "deceased" && (
                                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 lg:py-8 text-muted-foreground">
                      <Trophy className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm lg:text-base">
                        Aún no has creado tu lista
                      </p>
                      <p className="text-xs lg:text-sm">
                        Tienes hasta el 31 de diciembre
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Leaderboard Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg lg:text-xl">
                    Clasificación Actual
                  </CardTitle>
                  <CardDescription>
                    Puntuación de todos los miembros del grupo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 lg:space-y-4">
                    {group.members &&
                      Object.entries(group.members).map(
                        ([playerUid, playerData], index) => {
                          if (!currentUser) return null;
                          return (
                            <LeaderBoardCard
                              key={index}
                              index={index + 1}
                              currentUser={currentUser}
                              onClick={handleViewMemberList}
                              playerUid={playerUid}
                              playerData={playerData}
                            />
                          );
                        }
                      )}

                    {/* Total Points */}
                    {group.members && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            Σ
                          </div>
                          <span className="text-sm lg:text-base font-semibold truncate">
                            Total
                          </span>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="font-semibold text-sm lg:text-base">
                              {Object.values(group.members || {}).reduce(
                                (sum, member) =>
                                  sum + (member.list?.points || 0),
                                0
                              )}{" "}
                              pts
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg lg:text-xl">
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm max-h-80 overflow-y-auto">
                    {group.private?.activityLog
                      .slice()
                      .reverse()
                      .map((log, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-border gap-1 last:border-b-0"
                        >
                          <span>{log.message}</span>
                          <span className="text-muted-foreground text-xs sm:text-sm">
                            {timeAgo(log.timestamp.toDate())}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      </div>

      {/* Group Management Modal */}
      {isAdmin && group && (
        <GroupManagementModal
          isOpen={showGroupManagement}
          onClose={() => setShowGroupManagement(false)}
          group={group}
          reloadGroupData={fetchGroupData}
        />
      )}

      {/* Member List Modal */}
      <Dialog open={showMemberListModal} onOpenChange={setShowMemberListModal}>
        <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-lg lg:text-xl">
              Lista de {selectedMemberList?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedMemberList?.list.length === 0
                ? "Este miembro aún no ha enviado su lista"
                : `${selectedMemberList?.list.length} personas en la lista`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {selectedMemberList?.list.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <EyeOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No hay lista disponible</p>
                <p className="text-xs mt-1">
                  Este miembro aún no ha enviado su lista
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedMemberList?.list.map((person, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {person.name}
                      </p>
                      {/* <p className="text-xs text-muted-foreground">
                        {person.profession} • {person.age} años
                      </p> */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowMemberListModal(false)}
              className="w-full"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
