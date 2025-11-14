import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, RefreshCw } from "lucide-react";

interface DashboardFiltersProps {
  categories: { id: string; name: string }[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function DashboardFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  onRefresh,
  isRefreshing,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center bg-card/30 backdrop-blur-sm p-4 rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-foreground">Filtros</span>
      </div>

      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[200px] bg-background border-primary/30">
          <SelectValue placeholder="Todas las categorías" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">Todas las categorías</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[200px] bg-background border-primary/30">
          <SelectValue placeholder="Estado de existencia" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">Todos los productos</SelectItem>
          <SelectItem value="available">En Existencia</SelectItem>
          <SelectItem value="out_of_stock">Agotado</SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={onRefresh}
        disabled={isRefreshing}
        variant="outline"
        size="sm"
        className="ml-auto border-primary/30 hover:bg-primary/10"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
        Actualizar
      </Button>
    </div>
  );
}
