"use client";

import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Crown,
  Hash,
  Menu,
  Plus,
  Trophy,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

// Mock data for groups
const mockGroups = [
  {
    id: 1,
    name: "Amigos del Barrio 2024",
    code: "AMG2024",
    isCreator: true,
    members: 8,
    deadline: "2024-12-31",
    status: "active",
    totalBets: 12,
    listsSent: 6,
    description: "Grupo de amigos del barrio para la necroporra 2024",
  },
  {
    id: 2,
    name: "Oficina Central",
    code: "OFC2024",
    isCreator: false,
    members: 15,
    deadline: "2024-12-31",
    status: "active",
    totalBets: 23,
    listsSent: 12,
    description: "Compañeros de trabajo - oficina central",
  },
  {
    id: 3,
    name: "Universidad Nostálgicos",
    code: "UNI2024",
    isCreator: false,
    members: 6,
    deadline: "2024-12-31",
    status: "completed",
    totalBets: 8,
    listsSent: 6,
    description: "Antiguos compañeros de universidad",
  },
];

const calculateTimeLeft = (deadline: string) => {
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

export default function Dashboard() {
  const [selectedGroup, setSelectedGroup] = useState<
    (typeof mockGroups)[0] | null
  >(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    months: number;
    days: number;
    expired: boolean;
  } | null>(null);

  useEffect(() => {
    if (selectedGroup) {
      const updateCountdown = () => {
        setTimeLeft(calculateTimeLeft(selectedGroup.deadline));
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 3600000); // Update every hour

      return () => clearInterval(interval);
    }
  }, [selectedGroup]);

  const handleGroupSelect = (group: (typeof mockGroups)[0]) => {
    setSelectedGroup(group);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="flex h-screen bg-background relative">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Groups List */}
      <div
        className={`
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
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
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Grupo</DialogTitle>
                  <DialogDescription>
                    Crea un nuevo grupo para la necroporra y invita a tus
                    amigos.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre del Grupo</Label>
                    <Input id="name" placeholder="Ej: Amigos 2024" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe tu grupo..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deadline">Fecha límite para listas</Label>
                    <Input id="deadline" type="date" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowCreateDialog(false)}>
                    Crear Grupo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
          {mockGroups.map((group) => (
            <div
              key={group.id}
              className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedGroup?.id === group.id ? "bg-muted" : ""
              }`}
              onClick={() => handleGroupSelect(group)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm truncate flex-1">
                  {group.name}
                </h3>
                {group.isCreator && (
                  <Crown className="w-4 h-4 text-yellow-500 ml-2" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {group.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {group.members}
                </div>
                <Badge
                  variant={group.status === "active" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {group.status === "active" ? "Activo" : "Finalizado"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Group Details */}
      <div className="relative flex-1 flex flex-col min-w-0">
        {selectedGroup ? (
          <>
            <div className="lg:hidden p-4 border-b border-border bg-card flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              <h2 className="font-semibold truncate">{selectedGroup.name}</h2>
            </div>

            <div className="lg:hidden  left-0 right-0 z-30 bg-card border-b border-border p-3">
              <div className="grid grid-cols-3 gap-2">
                <Card className="shadow-none border-muted">
                  <CardContent className="p-2 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="w-3 h-3 text-muted-foreground mb-1" />
                      <p className="text-xs font-medium">
                        {selectedGroup.members}
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
                        {selectedGroup.listsSent}/{selectedGroup.members}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        listas
                      </p>
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
                      {selectedGroup.name}
                    </h2>
                    {selectedGroup.isCreator && (
                      <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {selectedGroup.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground ml-4 flex-shrink-0">
                  <Hash className="w-4 h-4" />
                  <span>{selectedGroup.code}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {selectedGroup.members} Miembros
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
                          {selectedGroup.listsSent}/{selectedGroup.members}{" "}
                          Listas
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enviadas
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex-1 p-4 lg:p-6 overflow-y-auto lg:pt-6 ">
              <div className="grid gap-4 lg:gap-6">
                {/* My List Section */}
                <Card>
                  <CardHeader className="pb-3 lg:pb-6">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span>Mi Lista</span>
                      <Button size="sm" className="w-full sm:w-auto">
                        {selectedGroup.status === "active"
                          ? "Editar Lista"
                          : "Ver Lista"}
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Tu lista de famosos para este grupo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6 lg:py-8 text-muted-foreground">
                      <Trophy className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm lg:text-base">
                        Aún no has creado tu lista
                      </p>
                      <p className="text-xs lg:text-sm">
                        Tienes hasta el 31 de diciembre
                      </p>
                    </div>
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
                      {[
                        { name: "Carlos M.", points: 15, position: 1 },
                        { name: "Ana L.", points: 12, position: 2 },
                        { name: "Miguel R.", points: 8, position: 3 },
                        { name: "Tú", points: 0, position: 8 },
                      ].map((player, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                              {player.position}
                            </div>
                            <span
                              className={`text-sm lg:text-base ${
                                player.name === "Tú" ? "font-semibold" : ""
                              }`}
                            >
                              {player.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm lg:text-base">
                              {player.points} pts
                            </p>
                          </div>
                        </div>
                      ))}
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
                    <div className="space-y-3 text-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-border gap-1">
                        <span>Carlos M. actualizó su lista</span>
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          Hace 2 horas
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-border gap-1">
                        <span>Ana L. se unió al grupo</span>
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          Ayer
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1">
                        <span>Grupo creado</span>
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          Hace 3 días
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col">
            <div className="lg:hidden p-4 border-b border-border bg-card">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                className="w-full justify-start"
              >
                <Menu className="w-4 h-4 mr-2" />
                Seleccionar Grupo
              </Button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center text-muted-foreground max-w-sm">
                <Users className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  Selecciona un grupo
                </h3>
                <p className="text-sm lg:text-base">
                  Elige un grupo de la lista para ver su información y gestionar
                  tus listas
                </p>
                <Button
                  variant="outline"
                  className="mt-4 lg:hidden bg-transparent"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="w-4 h-4 mr-2" />
                  Ver Grupos
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
