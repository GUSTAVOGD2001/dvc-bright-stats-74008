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

  // Query for global stats
  const {
    data: statsData,
    refetch: refetchStats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ["globalStats"],
    queryFn: () => fetchGraphQL<any>(QUERY_GLOBAL_STATS),
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  // Query for categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchGraphQL<CategoryListResponse>(QUERY_CATEGORIES),
  });

  // Query for products
  const {
    data: productsData,
    refetch: refetchProducts,
    isRefetching: productsRefetching,
  } = useQuery({
    queryKey: ["products", selectedCategory, selectedStatus],
    queryFn: () => {
      const variables: any = {
        pageSize: 100,
        currentPage: 1,
      };

      if (selectedCategory !== "all") {
        variables.catId = selectedCategory;
      }

      if (selectedStatus === "available") {
        variables.isSalable = true;
      } else if (selectedStatus === "out_of_stock") {
        variables.isSalable = false;
      }

      return fetchGraphQL<ProductsResponse>(QUERY_DASHBOARD_PRODUCTS, variables);
    },
    refetchInterval: AUTO_REFRESH_INTERVAL,
  });

  const handleRefresh = () => {
    refetchStats();
    refetchProducts();
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

  // Calculate KPIs
  const totalProducts = statsData?.total_productos?.total_count || 0;
  const inStock = statsData?.en_existencia?.total_count || 0;
  const outOfStock = statsData?.agotados?.total_count || 0;

  const catalogValue =
    productsData?.products.items
      .filter((p) => p.is_salable)
      .reduce((sum, p) => sum + p.price_range.minimum_price.final_price.value, 0) || 0;

  const categories = categoriesData?.categoryList || [];
  const products = productsData?.products.items || [];

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
          onRefresh={handleRefresh}
          isRefreshing={productsRefetching}
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
          <CategoryBarChart products={products} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-6">
          <PriceHistogram products={products} />
        </div>

        {/* Products Table */}
        <ProductsTable products={products} />
      </div>
    </div>
  );
};

export default Index;
