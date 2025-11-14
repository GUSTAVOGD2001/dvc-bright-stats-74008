import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/services/graphql";

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price);
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <div className="w-1 h-6 bg-accent rounded-full" />
          Explorador de Productos ({products.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-foreground font-semibold">SKU</TableHead>
                <TableHead className="text-foreground font-semibold">Nombre</TableHead>
                <TableHead className="text-foreground font-semibold">Estado</TableHead>
                <TableHead className="text-foreground font-semibold text-right">Precio Regular</TableHead>
                <TableHead className="text-foreground font-semibold text-right">Precio Final</TableHead>
                <TableHead className="text-foreground font-semibold text-right">Peso (kg)</TableHead>
                <TableHead className="text-foreground font-semibold">Categorías</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.slice(0, 20).map((product) => (
                <TableRow key={product.sku} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                  <TableCell className="font-medium text-foreground max-w-xs truncate">{product.name}</TableCell>
                  <TableCell>
                    {product.is_salable ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        En Existencia
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                        Agotado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatPrice(product.price_range.minimum_price.regular_price.value)}
                  </TableCell>
                  <TableCell className="text-right text-foreground font-semibold">
                    {formatPrice(product.price_range.minimum_price.final_price.value)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {product.weight?.toFixed(2) || "N/A"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                    {product.categories.map((cat) => cat.name).join(", ")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
