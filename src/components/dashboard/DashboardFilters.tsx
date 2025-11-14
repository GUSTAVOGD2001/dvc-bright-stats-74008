import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, RefreshCw, Search, ChevronsUpDown, Check, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  onClearFilters: () => void;
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
  onClearFilters,
  isRefreshing,
}: DashboardFiltersProps) {
  const [openCategoryPicker, setOpenCategoryPicker] = useState(false);
  
  // Format category path for display
  const formatCategoryPath = (path: string) => {
    const parts = path.split('/');
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' > ');
  };

  // Get display value for selected category
  const getSelectedCategoryDisplay = () => {
    if (selectedCategory === "all") return "Todas las categorías";
    return formatCategoryPath(selectedCategory);
  };

  // Build flat list of all categories for search
  const allCategories = [
    { value: "all", label: "Todas las categorías", isMain: false },
    ...categoryStructure.flatMap(catStruct => [
      { 
        value: catStruct.mainCategory, 
        label: `${catStruct.mainCategory.charAt(0).toUpperCase() + catStruct.mainCategory.slice(1)} (todas)`,
        isMain: true
      },
      ...catStruct.subcategories.map(subPath => ({
        value: subPath,
        label: formatCategoryPath(subPath),
        isMain: false
      }))
    ])
  ];

  return (
    <div className="space-y-4 bg-card p-4 rounded-lg border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">Filtros</span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onClearFilters}
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="text-primary hover:text-primary"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Search by name */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-foreground">Buscar por nombre o SKU</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category filter with search */}
        <div className="space-y-2">
          <Label className="text-foreground">Categoría</Label>
          <Popover open={openCategoryPicker} onOpenChange={setOpenCategoryPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCategoryPicker}
                className="w-full justify-between bg-background border-border text-left font-normal"
              >
                <span className="truncate">{getSelectedCategoryDisplay()}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 bg-popover border-border" align="start">
              <Command className="bg-popover">
                <CommandInput placeholder="Buscar categoría..." className="border-none" />
                <CommandList>
                  <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                  <CommandGroup>
                    {allCategories.map((category) => (
                      <CommandItem
                        key={category.value}
                        value={category.label}
                        onSelect={() => {
                          onCategoryChange(category.value);
                          setOpenCategoryPicker(false);
                        }}
                        className={cn(
                          "cursor-pointer",
                          !category.isMain && category.value !== "all" && "pl-6"
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCategory === category.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {category.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
    </div>
  );
}
