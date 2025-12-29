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
import { UserDoc } from "@/models/User";
import { ArrowUpDown, Ban, Eye, Trash2 } from "lucide-react";
import { useState } from "react";

export const AdminUsersTable = ({
  searchTerm,
  allUsers,
}: {
  searchTerm: string;
  allUsers?: UserDoc[] | undefined | null;
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserDoc | "groupsLength";
    direction: "asc" | "desc";
  }>({
    key: "createdAt",
    direction: "desc",
  });
  if (!allUsers) return;
  const handleSort = (key: keyof UserDoc | "groupsLength") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  const sortedUsers = [...(allUsers || [])]
    .filter(
      (u) =>
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortConfig.key === "groupsLength") {
        const aValue = a.groups?.length || 0;
        const bValue = b.groups?.length || 0;
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }
      const aValue = String(a[sortConfig.key as keyof UserDoc] || "");
      const bValue = String(b[sortConfig.key as keyof UserDoc] || "");

      const comparison = aValue.localeCompare(bValue, "es", {
        sensitivity: "base",
        numeric: true,
      });
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
        <CardDescription>
          Administra todos los usuarios registrados ({sortedUsers.length})
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
                      onClick={() => handleSort("displayName")}
                      className="hover:bg-transparent p-0 flex items-center gap-1"
                    >
                      Usuario <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("email")}
                      className="hover:bg-transparent p-0 flex items-center gap-1"
                    >
                      Email <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("groupsLength")}
                      className="hover:bg-transparent p-0 flex items-center gap-1"
                    >
                      Grupos <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow key={user.uid} className="group">
                    <TableCell className="font-medium">
                      {user.displayName}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {user.groups.length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="capitalize"
                        variant={
                          user.status === "active" ? "default" : "destructive"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
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
                            Ver detalles
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                user.status === "banned"
                                  ? "text-green-500 hover:text-green-600"
                                  : "text-amber-500 hover:text-amber-600"
                              }`}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {user.status === "banned"
                              ? "Restaurar usuario"
                              : "Banear usuario"}
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
                            Eliminar permanentemente
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
