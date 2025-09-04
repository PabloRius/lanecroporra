"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { leaveGroup } from "@/lib/firestore/groups";
import { generateInvite } from "@/lib/firestore/invites";
import { GroupDoc } from "@/models/Group";
import { useAuth } from "@/providers/auth-provider";
import {
  Crown,
  Link,
  RefreshCw,
  Settings,
  Trash2,
  User,
  UserMinus,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { InviteCard } from "./invite-card";
import { ResolveUserId } from "./resolve-user-id";

export default function GroupManagementModal({
  isOpen,
  onClose,
  group,
  reloadGroupData,
}: {
  isOpen: boolean;
  onClose: () => void;
  group: GroupDoc;
  reloadGroupData: () => void;
}) {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "invite" | "settings" | "members" | "danger"
  >("invite");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToKick, setMemberToKick] = useState<string | null>(null);

  if (!currentUser) {
    redirect("/login");
  }

  // === Actions ===
  const handleGenerateNewInvite = async () => {
    await generateInvite(group.id, currentUser!.uid);
    reloadGroupData();
  };

  const handleConfirmKickMember = (memberId: string) => {
    leaveGroup(memberId, group.id);
    setMemberToKick(null);
  };

  const handleConfirmDeleteGroup = () => {
    console.log("Deleting group:", group.id);
    setDeleteDialogOpen(false);
    onClose();
  };

  // === Sidebar Tabs ===
  const tabs = [
    { id: "invite", label: "Invitaciones", icon: Link },
    { id: "settings", label: "Configuración", icon: Settings },
    { id: "members", label: "Miembros", icon: Users },
    { id: "danger", label: "Zona Peligrosa", icon: Trash2 },
  ];

  return (
    <>
      {/* Main Modal */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:w-[50vw] sm:max-w-none h-[50vh] p-0">
          <div className="flex flex-col lg:flex-row h-full max-h-[80vh] sm:w-[43vw] sm:max-w-none">
            {/* Sidebar */}
            <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-border bg-muted/20">
              <DialogHeader className="p-4 lg:p-6 border-b border-border lg:border-b-0">
                <DialogTitle className="text-lg lg:text-xl">
                  Gestión de Grupo
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {group.public.name}
                </DialogDescription>
              </DialogHeader>

              <div className="p-2 lg:p-4">
                <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "default" : "ghost"}
                        className={`justify-start whitespace-nowrap lg:w-full ${
                          activeTab === tab.id ? "" : "bg-transparent"
                        }`}
                        onClick={() =>
                          setActiveTab(
                            tab.id as
                              | "invite"
                              | "settings"
                              | "members"
                              | "danger"
                          )
                        }
                      >
                        <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 lg:p-6">
                {activeTab === "invite" && (
                  <div className="space-y-4">
                    <h4 className="font-medium mb-2">Invitaciones Activas</h4>
                    <Button
                      onClick={handleGenerateNewInvite}
                      variant="outline"
                      className="bg-transparent"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generar Nuevo Enlace
                    </Button>
                    <div className="space-y-2 max-w-min overflow-hidden">
                      <InviteCard tokenId={group.private!.inviteLink} />
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">
                      Configuración del Grupo
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="group-name">Nombre del Grupo</Label>
                        <Input
                          id="group-name"
                          defaultValue={group.public.name}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="group-description">Descripción</Label>
                        <Textarea
                          id="group-description"
                          defaultValue={group.public.description}
                          className="mt-2 resize-none max-h-[20vh] overflow-auto"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col justify-between">
                          <Label htmlFor="max-bets">Máximo de Apuestas</Label>
                          <Input
                            id="max-bets"
                            type="number"
                            defaultValue={group.private!.settings.maxBets}
                            className="mt-2"
                          />
                        </div>
                        <div className="flex flex-col justify-between">
                          <Label htmlFor="deadline">Fecha Límite</Label>
                          <Input
                            id="deadline"
                            type="date"
                            defaultValue={
                              group.public.deadline.toISOString().split("T")[0]
                            }
                            className="mt-2"
                          />
                        </div>
                      </div>
                      <Button className="w-full sm:w-auto">
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === "members" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">
                      Miembros del Grupo
                    </h3>
                    <div className="space-y-3">
                      {Object.keys(group.members!).map((memberId) => {
                        const isAdmin =
                          group.members![memberId].role === "admin";
                        return (
                          <div
                            key={memberId}
                            className="flex items-center justify-between p-3 border border-border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                {isAdmin ? (
                                  <Crown className="w-4 h-4 text-yellow-500" />
                                ) : (
                                  <User className="w-4 h-4 text-gray-500" />
                                )}
                              </div>
                              <ResolveUserId userId={memberId} />
                            </div>
                            {!isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMemberToKick(memberId)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                <UserMinus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "danger" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                      Zona Peligrosa
                    </h3>
                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                          <Trash2 className="w-5 h-5" />
                          Eliminar Grupo
                        </CardTitle>
                        <CardDescription>
                          Esta acción no se puede deshacer. Se eliminarán todos
                          los datos del grupo, incluyendo las listas de todos
                          los miembros.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="destructive"
                          onClick={() => setDeleteDialogOpen(true)}
                          className="w-full sm:w-auto"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar Grupo
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Kick Member Dialog */}
      <AlertDialog
        open={!!memberToKick}
        onOpenChange={(open) => !open && setMemberToKick(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Expulsar miembro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al miembro del grupo y perderá acceso a toda
              la información. Su lista también será eliminada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToKick(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                memberToKick && handleConfirmKickMember(memberToKick)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Expulsar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Group Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar grupo permanentemente?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los datos
              del grupo, incluyendo las listas de todos los miembros y el
              historial completo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteGroup}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
