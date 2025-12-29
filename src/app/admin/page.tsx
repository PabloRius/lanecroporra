"use client";

import { AdminGroupsTable } from "@/components/admin/tables/groups-table";
import { AdminUsersTable } from "@/components/admin/tables/users-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAllGroups } from "@/lib/firestore/groups";
import { getAllUsers, getUserById } from "@/lib/firestore/users";
import { GroupDoc } from "@/models/Group";
import { UserDoc } from "@/models/User";
import { useAuth } from "@/providers/auth-provider";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Layers,
  List,
  Lock,
  Play,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

const mockLists = [
  {
    id: 1,
    user: "Juan Pérez",
    group: "Amigos del Barrio 2024",
    celebrities: 12,
    submitted: "2024-01-20",
    status: "active",
  },
  {
    id: 2,
    user: "María García",
    group: "Oficina Central",
    celebrities: 15,
    submitted: "2024-01-22",
    status: "active",
  },
  {
    id: 3,
    user: "Ana Martínez",
    group: "Universidad Nostálgicos",
    celebrities: 10,
    submitted: "2024-01-25",
    status: "closed",
  },
];

function AdminContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeceaseDialog, setShowDeceaseDialog] = useState(false);
  const [showCloseAllDialog, setShowCloseAllDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("groups");

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

  // All data
  const [allUsers, setAllUsers] = useState<UserDoc[] | undefined | null>(
    undefined
  );
  const [allGroups, setAllGroups] = useState<GroupDoc[] | undefined | null>(
    undefined
  );

  // Fetch all data
  useEffect(() => {
    if (!user || !isAdmin) return;
    const fetchAllUsers = async () => {
      try {
        const result = await getAllUsers();
        setAllUsers(result);
      } catch (error) {
        console.error(error);
        setAllUsers(null);
      }
    };
    const fetchAllGroups = async () => {
      try {
        const result = await getAllGroups();
        setAllGroups(result);
      } catch (error) {
        console.error(error);
        setAllGroups(null);
      }
    };
    fetchAllUsers();
    fetchAllGroups();
  }, [user, isAdmin]);

  if (loading || user === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Verificando credenciales...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="max-w-md w-full border-red-200 dark:border-red-900">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-950">
                <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">
              Acceso Denegado
            </CardTitle>
            <CardDescription className="text-center">
              No tienes los permisos necesarios para acceder al Panel de
              Administración.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            Esta sección es exclusiva para administradores de la Necroporra. Si
            crees que esto es un error, contacta con soporte.
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <Layers className="h-4 w-4" />
                Volver al Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleRunDeceaseCheck = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowDeceaseDialog(false);
      alert("Algoritmo de detección ejecutado. 3 actualizaciones encontradas.");
    }, 2000);
  };

  const handleCloseAllLists = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowCloseAllDialog(false);
      alert("Todas las listas han sido cerradas correctamente.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-red-500" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  Panel de Administración
                </h1>
                <p className="text-sm text-muted-foreground">
                  Control total del sistema
                </p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto bg-transparent"
              >
                Volver al Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="grid gap-6">
          {/* Global Actions Section */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Acciones Globales
              </CardTitle>
              <CardDescription>
                Funciones administrativas que afectan a todo el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex flex-col items-start p-4 hover:bg-red-50 dark:hover:bg-red-950/20 bg-transparent"
                  onClick={() => setShowDeceaseDialog(true)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="h-5 w-5 text-red-500" />
                    <span className="font-semibold">
                      Ejecutar Algoritmo de Detección
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Revisa todas las listas y detecta fallecimientos de famosos
                  </p>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex flex-col items-start p-4 hover:bg-amber-50 dark:hover:bg-amber-950/20 bg-transparent"
                  onClick={() => setShowCloseAllDialog(true)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold">
                      Cerrar Todas las Listas
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Finaliza el período de edición para todas las listas activas
                  </p>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios, grupos o listas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs Section */}
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Grupos</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Usuarios</span>
              </TabsTrigger>
              <TabsTrigger value="lists" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Listas</span>
              </TabsTrigger>
            </TabsList>

            {/* Groups Tab */}
            <TabsContent value="groups" className="mt-6">
              <AdminGroupsTable allGroups={allGroups} />
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="mt-6">
              <AdminUsersTable searchTerm={searchTerm} allUsers={allUsers} />
            </TabsContent>

            {/* Lists Tab */}
            <TabsContent value="lists" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Listas</CardTitle>
                  <CardDescription>
                    Revisa y administra todas las listas enviadas por los
                    usuarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px]">
                            Usuario
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Grupo
                          </TableHead>
                          <TableHead>Famosos</TableHead>
                          <TableHead className="hidden lg:table-cell">
                            Fecha Envío
                          </TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockLists.map((list) => (
                          <TableRow key={list.id}>
                            <TableCell className="font-medium">
                              {list.user}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {list.group}
                            </TableCell>
                            <TableCell>{list.celebrities}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {list.submitted}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  list.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {list.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Tooltip>
                                  <TooltipContent>
                                    <span>Inspeccionar</span>
                                  </TooltipContent>
                                  <TooltipTrigger>
                                    <Button variant="ghost" size="sm">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                </Tooltip>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Decease Check Dialog */}
      <Dialog open={showDeceaseDialog} onOpenChange={setShowDeceaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-red-500" />
              Ejecutar Algoritmo de Detección
            </DialogTitle>
            <DialogDescription>
              Esta acción revisará todas las listas activas y detectará
              fallecimientos de famosos en el sistema. El proceso puede tardar
              varios minutos.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Revisar bases de datos de noticias</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Validar fechas de fallecimiento</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Actualizar puntuaciones de usuarios</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Enviar notificaciones</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeceaseDialog(false)}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRunDeceaseCheck}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Ejecutar Ahora
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close All Lists Dialog */}
      <Dialog open={showCloseAllDialog} onOpenChange={setShowCloseAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-500" />
              Cerrar Todas las Listas
            </DialogTitle>
            <DialogDescription>
              Esta acción cerrará todas las listas activas inmediatamente. Los
              usuarios no podrán modificar sus listas después de esto.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-semibold mb-1">
                    Esta acción no se puede deshacer
                  </p>
                  <p>
                    {
                      'Todas las listas en estado "activo" pasarán a estado "cerrado".'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCloseAllDialog(false)}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCloseAllLists}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cerrando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Cerrar Todas
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminContent />
    </Suspense>
  );
}
