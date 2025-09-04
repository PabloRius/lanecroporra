"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/providers/sidebar-provider";
import { Menu, Users } from "lucide-react";

export default function DashboardPage() {
  const { setOpen } = useSidebar();
  return (
    <div className="flex-1 flex flex-col">
      <div className="lg:hidden p-4 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen()}
          className="w-full justify-start"
        >
          <Menu className="w-4 h-4 mr-2" />
          Seleccionar Grupo
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground max-w-sm">
          <Users className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Selecciona un grupo</h3>
          <p className="text-sm lg:text-base">
            Elige un grupo de la lista para ver su información y gestionar tus
            listas
          </p>
          <Button
            variant="outline"
            className="mt-4 lg:hidden bg-transparent"
            onClick={() => setOpen()}
          >
            <Menu className="w-4 h-4 mr-2" />
            Ver Grupos
          </Button>
        </div>
      </div>
    </div>
  );
}
