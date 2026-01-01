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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { closeGroupLists } from "@/lib/firestore/groups";
import { GroupDoc } from "@/models/Group";
import { AlertCircle, ArrowUpDown, Eye, Lock, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SortKey = "name" | "creatorId" | "members" | "status" | "deadline";

export const AdminGroupsTable = ({
  searchTerm,
  allGroups,
}: {
  searchTerm: string;
  allGroups: GroupDoc[] | undefined | null;
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  }>({
    key: "name",
    direction: "asc",
  });

  const [groupToClose, setGroupToClose] = useState<GroupDoc | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!allGroups) return null;

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedGroups = [...(allGroups || [])]
    .filter((u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const { key, direction } = sortConfig;
      let comparison = 0;

      switch (key) {
        case "members":
          const aMem = Object.keys(a.members || {}).length;
          const bMem = Object.keys(b.members || {}).length;
          comparison = aMem - bMem;
          break;
        case "deadline":
          comparison = a.deadline.getTime() - b.deadline.getTime();
          break;
        default:
          const aVal = String(a[key as keyof typeof a] || "");
          const bVal = String(b[key as keyof typeof b] || "");
          comparison = aVal.localeCompare(bVal, "es", {
            sensitivity: "base",
            numeric: true,
          });
      }

      return direction === "asc" ? comparison : -comparison;
    });

  const handleCloseGroupStatus = async () => {
    if (!groupToClose) return;
    setIsUpdating(true);
    try {
      const result = await closeGroupLists(groupToClose.id);
      if (result === true) toast.success("Listas cerradas, buena suerte!");
    } catch (error) {
      console.error("Error closing group:", error);
      toast.error("Error cerrando las listas");
    } finally {
      setIsUpdating(false);
      setGroupToClose(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Grupos</CardTitle>
          <CardDescription>
            Visualiza y administra todos los grupos del sistema (
            {allGroups.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider delayDuration={300}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("name")}
                        className="hover:bg-transparent p-0 flex items-center gap-1 font-bold"
                      >
                        Nombre <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("creatorId")}
                        className="hover:bg-transparent p-0 flex items-center gap-1 font-bold"
                      >
                        ID Creador <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("members")}
                        className="hover:bg-transparent p-0 flex items-center gap-1 font-bold"
                      >
                        Miembros <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("deadline")}
                        className="hover:bg-transparent p-0 flex items-center gap-1 font-bold"
                      >
                        Fecha Límite <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedGroups.map((group) => {
                    const isAlreadyActive = group.status === "activo";
                    return (
                      <TableRow
                        key={group.id}
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium text-primary">
                          {group.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs font-mono text-muted-foreground">
                          {group.creatorId.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {group.members
                              ? Object.keys(group.members).length
                              : 0}{" "}
                            usuarios
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm italic">
                          {formatDate(group.deadline)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="capitalize"
                            variant={
                              group.status === "activo" ? "default" : "outline"
                            }
                          >
                            {group.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-amber-600 hover:text-amber-700 disabled:opacity-30"
                                  disabled={isAlreadyActive}
                                  onClick={() => setGroupToClose(group)}
                                >
                                  <Lock className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {isAlreadyActive
                                  ? "Lista ya cerrada"
                                  : "Cerrar edición de lista"}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                Detalles
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-red-600">
                                Eliminar
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
      <AlertDialog
        open={!!groupToClose}
        onOpenChange={(open) => !open && setGroupToClose(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              ¿Confirmar cierre de &quot;{groupToClose?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2 text-foreground">
              {groupToClose && groupToClose.deadline.getTime() > Date.now() ? (
                <span className="font-bold text-red-600 dark:text-red-400">
                  ¡ATENCIÓN!: La fecha límite aún no ha pasado (
                  {formatDate(groupToClose.deadline)}). Si cierras el grupo
                  ahora, los usuarios ya NO podrán editar sus listas antes de
                  tiempo.
                </span>
              ) : (
                "La fecha límite ya ha pasado o es hoy. Al activar el grupo, las listas quedarán bloqueadas para empezar el juego."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCloseGroupStatus();
              }}
              className="bg-amber-600 hover:bg-amber-700"
              disabled={isUpdating}
            >
              {isUpdating ? "Procesando..." : "Sí, cerrar listas"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
