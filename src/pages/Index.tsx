import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingCart, AlertCircle, TrendingUp } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { InventoryPieChart } from "@/components/dashboard/InventoryPieChart";
import { CategoryBarChart } from "@/components/dashboard/CategoryBarChart";
import { PriceHistogram } from "@/components/dashboard/PriceHistogram";
import { ProductsTable } from "@/components/dashboard/ProductsTable";
import {
  fetchGraphQL,
  fetchAllProducts,
  QUERY_GLOBAL_STATS,
  QUERY_CATEGORIES,
  QUERY_DASHBOARD_PRODUCTS,
  ProductsResponse,
  CategoryListResponse,
} from "@/services/graphql";
import { toast } from "sonner";

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000);

  // Query for global stats (fetch all products in one go using batch strategy)
  const {
    data: allProductsData,
    refetch: refetchStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["allProducts"],
    queryFn: () => fetchAllProducts(),
    refetchInterval: AUTO_REFRESH_INTERVAL,
    retry: 3,
    retryDelay: 1000,
    staleTime: 4 * 60 * 1000, // Consider data fresh for 4 minutes
  });

  // Query for categories (still needed for filters)
  const { data: categoriesData, error: categoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchGraphQL<CategoryListResponse>(QUERY_CATEGORIES),
    retry: 3,
    retryDelay: 1000,
  });

  const handleRefresh = () => {
    refetchStats();
    toast.success("Dashboard actualizado", {
      description: "Los datos se han actualizado correctamente.",
    });
  };

  useEffect(() => {
    // Show toast when auto-refresh happens
    const interval = setInterval(() => {
      toast.info("Actualización automática", {
        description: "Los datos se están actualizando...",
      });
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Calculate KPIs from all products
  const allProducts = allProductsData?.products.items || [];
  const totalProducts = allProducts.length;
  const inStock = allProducts.filter((p) => p.is_salable).length;
  const outOfStock = allProducts.filter((p) => !p.is_salable).length;

  const catalogValue = allProducts
    .filter((p) => p.is_salable)
    .reduce((sum, p) => sum + p.price_range.minimum_price.final_price.value, 0);

  const categories = categoriesData?.categoryList || [];
  
  // Apply filters to products
  const filteredProducts = allProducts.filter((p) => {
    // Status filter
    if (selectedStatus === "available" && !p.is_salable) return false;
    if (selectedStatus === "out_of_stock" && p.is_salable) return false;
    
    // Category filter
    if (selectedCategory !== "all") {
      const hasCategory = p.categories.some((cat) => cat.name === selectedCategory);
      if (!hasCategory) return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!p.name.toLowerCase().includes(searchLower) && 
          !p.sku.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    // Price range filter
    const finalPrice = p.price_range.minimum_price.final_price.value;
    if (finalPrice < minPrice || finalPrice > maxPrice) return false;
    
    return true;
  });

  if (statsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-xl text-foreground">Cargando Dashboard...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="text-center space-y-4 max-w-2xl">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Error de Conexión</h2>
          <p className="text-muted-foreground">
            No se puede conectar al servidor GraphQL en tiendaddvc.mx
          </p>
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-left">
            <p className="font-mono text-sm text-destructive break-all">
              {statsError instanceof Error ? statsError.message : "Error desconocido"}
            </p>
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Posibles causas:</p>
            <ul className="list-disc list-inside text-left space-y-1">
              <li>El servidor GraphQL no está respondiendo</li>
              <li>Problemas de CORS en el servidor</li>
              <li>La URL del endpoint es incorrecta</li>
              <li>Problemas de conectividad de red</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-foreground tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-pulse">
            Dashboard Villa de Cortes
          </h1>
          <p className="text-muted-foreground text-lg">Business Intelligence en Tiempo Real</p>
        </div>

        {/* Filters */}
        <DashboardFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onRefresh={handleRefresh}
          isRefreshing={statsLoading}
        />

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Total de Productos" value={totalProducts.toLocaleString()} icon={Package} />
          <KPICard
            title="En Existencia"
            value={inStock.toLocaleString()}
            icon={ShoppingCart}
            variant="success"
          />
          <KPICard title="Agotados" value={outOfStock.toLocaleString()} icon={AlertCircle} variant="danger" />
          <KPICard
            title="Valor Potencial"
            value={`$${(catalogValue / 1000).toFixed(0)}K`}
            icon={TrendingUp}
            variant="warning"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InventoryPieChart inStock={inStock} outOfStock={outOfStock} />
          <CategoryBarChart products={filteredProducts} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-6">
          <PriceHistogram products={filteredProducts} />
        </div>

        {/* Products Table */}
        <ProductsTable products={filteredProducts} />
      </div>
    </div>
  );
};

export default Index;
