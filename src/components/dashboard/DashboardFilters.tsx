import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, RefreshCw, Search } from "lucide-react";

interface CategoryStructure {
  mainCategory: string;
  subcategories: string[];
}

interface DashboardFiltersProps {
  categoryStructure: CategoryStructure[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  minPrice: number;
  maxPrice: number;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function DashboardFilters({
  categoryStructure,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onRefresh,
  isRefreshing,
}: DashboardFiltersProps) {
  // Format category path for display
  const formatCategoryPath = (path: string) => {
    const parts = path.split('/');
    return parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1);
  };

  return (
    <div className="space-y-4 bg-card p-4 rounded-lg border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-foreground">Filtros</span>
      </div>

      {/* Search by name */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-foreground">Buscar por nombre</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category filter with hierarchy */}
        <div className="space-y-2">
          <Label className="text-foreground">Categoría</Label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-[400px]">
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categoryStructure.map((catStruct) => (
                <SelectGroup key={catStruct.mainCategory}>
                  <SelectLabel className="capitalize font-semibold text-primary">
                    {catStruct.mainCategory}
                  </SelectLabel>
                  <SelectItem value={catStruct.mainCategory}>
                    Todas en {catStruct.mainCategory}
                  </SelectItem>
                  {catStruct.subcategories.map((subPath) => (
                    <SelectItem key={subPath} value={subPath} className="pl-6">
                      {formatCategoryPath(subPath)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status filter */}
        <div className="space-y-2">
          <Label className="text-foreground">Estado</Label>
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Estado de existencia" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">Todos los productos</SelectItem>
              <SelectItem value="available">En Existencia</SelectItem>
              <SelectItem value="out_of_stock">Agotado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Min price filter */}
        <div className="space-y-2">
          <Label htmlFor="minPrice" className="text-foreground">Precio mínimo ($)</Label>
          <Input
            id="minPrice"
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => onMinPriceChange(Number(e.target.value))}
            className="bg-background border-border"
          />
        </div>

        {/* Max price filter */}
        <div className="space-y-2">
          <Label htmlFor="maxPrice" className="text-foreground">Precio máximo ($)</Label>
          <Input
            id="maxPrice"
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(Number(e.target.value))}
            className="bg-background border-border"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="flex items-center gap-2 border-primary/30 hover:bg-primary/10"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Actualizando..." : "Actualizar Dashboard"}
        </Button>
      </div>
    </div>
  );
}
