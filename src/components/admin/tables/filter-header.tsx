import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, X } from "lucide-react";

type Current = string[];
type Setter = (val: string[]) => void;

export const FilterHeader = ({
  label,
  options,
  current,
  setter,
  toggleFilter,
}: {
  label: string;
  options: string[];
  current: string[];
  setter: Setter;
  toggleFilter: (current: Current, opt: string, setter: Setter) => void;
}) => (
  <div className="flex items-center gap-1">
    <span>{label}</span>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${
            current.length > 0 ? "text-primary bg-primary/10" : ""
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Filtrar {label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt: string) => (
          <DropdownMenuCheckboxItem
            key={opt}
            checked={current.includes(opt)}
            onCheckedChange={() => toggleFilter(current, opt, setter)}
            className="capitalize"
          >
            {opt}
          </DropdownMenuCheckboxItem>
        ))}
        {current.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2 text-red-500"
              onClick={() => setter([])}
            >
              <X className="mr-2 h-3 w-3" /> Limpiar
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
