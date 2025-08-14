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
  Plus,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";

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
    description: "Antiguos compañeros de universidad",
  },
];

export default function Dashboard() {
  const [selectedGroup, setSelectedGroup] = useState<
    (typeof mockGroups)[0] | null
  >(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Groups List */}
      <div className="w-80 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold mb-4">Mis Grupos</h1>
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
              onClick={() => setSelectedGroup(group)}
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
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            {/* Group Header */}
            <div className="p-6 border-b border-border bg-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{selectedGroup.name}</h2>
                    {selectedGroup.isCreator && (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {selectedGroup.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="w-4 h-4" />
                  {selectedGroup.code}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <p className="text-sm font-medium">31 Dic 2024</p>
                        <p className="text-xs text-muted-foreground">
                          Fecha límite
                        </p>
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
                          {selectedGroup.totalBets} Listas
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

            {/* Group Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid gap-6">
                {/* My List Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Mi Lista
                      <Button size="sm">
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
                    <div className="text-center py-8 text-muted-foreground">
                      <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aún no has creado tu lista</p>
                      <p className="text-sm">Tienes hasta el 31 de diciembre</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Leaderboard Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Clasificación Actual</CardTitle>
                    <CardDescription>
                      Puntuación de todos los miembros del grupo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
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
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                              {player.position}
                            </div>
                            <span
                              className={
                                player.name === "Tú" ? "font-semibold" : ""
                              }
                            >
                              {player.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{player.points} pts</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span>Carlos M. actualizó su lista</span>
                        <span className="text-muted-foreground">
                          Hace 2 horas
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span>Ana L. se unió al grupo</span>
                        <span className="text-muted-foreground">Ayer</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span>Grupo creado</span>
                        <span className="text-muted-foreground">
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                Selecciona un grupo
              </h3>
              <p>
                Elige un grupo de la lista para ver su información y gestionar
                tus listas
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
