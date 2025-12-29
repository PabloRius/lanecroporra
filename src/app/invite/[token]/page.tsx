"use client";

import { ResolveUserId } from "@/components/resolve-user-id";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { joinGroup } from "@/lib/firestore/groups";
import { resolveInviteGroup } from "@/lib/firestore/invites";
import { GroupDoc } from "@/models/Group";
import { useAuth } from "@/providers/auth-provider";
import {
  AlertCircle,
  Calendar,
  CircleChevronDown,
  Loader2,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const initPage = async () => {
      const { token } = await params;
      setToken(token);
    };
    initPage();
  }, [params]);

  const { currentUser, loading: userLoading } = useAuth();

  const [groupData, setGroupData] = useState<GroupDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    type: "auth" | "other";
    message: string;
  } | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (userLoading || !token) return;
    const loadGroupData = async () => {
      try {
        if (!currentUser) {
          setError({
            type: "auth",
            message: "Debes iniciar sesión para unirte a un grupo",
          });
          setGroupData(null);
          return;
        }
        const data = await resolveInviteGroup(token, currentUser?.uid);
        setGroupData(data);
      } catch (err) {
        console.error(err);
        setError({
          type: "other",
          message:
            err instanceof Error ? err.message : "Error loading group data",
        });
      } finally {
        setLoading(false);
      }
    };

    loadGroupData();
  }, [token, currentUser, userLoading]);

  const handleJoinGroup = async () => {
    if (!token) return;
    setJoining(true);
    if (!groupData || !currentUser) {
      setError({ type: "other", message: "No group data or user found" });
      setJoining(false);
      return;
    }
    await joinGroup(currentUser?.uid, token);
    setJoining(false);
    redirect("/dashboard");
  };

  const calculateTimeLeft = (deadline: Date) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate.getTime() - now.getTime();

    if (timeDiff <= 0) {
      return { months: 0, days: 0, expired: true };
    }

    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;

    return { months, days: remainingDays, expired: false };
  };

  if (loading || userLoading) {
    return (
      <div className="flex flex-1 w-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sesión no iniciada</h2>
              <p className="text-muted-foreground mb-4">
                Inicia sesión para aceptar esta invitación
              </p>
              <Button
                onClick={() => redirect(`/login?returnUrl=/invite/${token}`)}
                className="w-full"
              >
                Iniciar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CircleChevronDown className="w-12 h-12 text-blue-500 mx-auto mb-4" />

              <h2 className="text-xl font-semibold mb-2">Enlace Inválido</h2>
              <p className="text-muted-foreground mb-4">
                El enlace ha caducado o es inválido
              </p>
              <Button onClick={() => redirect("/dashboard")} className="w-full">
                Volver al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isMember: boolean =
    !!currentUser &&
    !!groupData?.members &&
    !!groupData.members[currentUser.uid];

  const timeLeft = calculateTimeLeft(groupData.deadline);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl lg:text-3xl mb-2">
            Invitación a Grupo
          </CardTitle>
          <CardDescription className="text-base">
            Has sido invitado a unirte a este grupo de La Necroporra
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Group Info */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-xl lg:text-2xl font-bold">
                {groupData.name}
              </h3>
            </div>
            <p className="text-muted-foreground">{groupData.description}</p>
            <div className="text-sm text-muted-foreground">
              <p>Creado por </p>
              <span className="font-medium">
                <ResolveUserId userId={groupData.creatorId} />
              </span>
            </div>
          </div>

          {/* Group Stats */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-muted/20">
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                {!timeLeft.expired ? (
                  <>
                    <p className="font-semibold">
                      {timeLeft.months}m {timeLeft.days}d
                    </p>
                    <p className="text-sm text-muted-foreground">Restantes</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-red-500">Expirado</p>
                    <p className="text-sm text-muted-foreground">
                      Fecha límite
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleJoinGroup}
              disabled={joining || timeLeft.expired || isMember}
              className="flex-1"
            >
              {joining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uniéndose...
                </>
              ) : (
                "Unirse al Grupo"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => redirect("/dashboard")}
              className="flex-1 bg-transparent"
            >
              Cancelar
            </Button>
          </div>

          {isMember && (
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-400">
                Ya eres miembro de este grupo
              </p>
            </div>
          )}
          {timeLeft.expired && (
            <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">
                Este grupo ha expirado y ya no acepta nuevos miembros
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
