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
import { GroupDoc } from "@/models/Group";
import { ArrowUpDown, Eye, Trash2 } from "lucide-react";
import { useState } from "react";

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
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
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            <TooltipContent side="top">Detalles</TooltipContent>
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
  );
};
