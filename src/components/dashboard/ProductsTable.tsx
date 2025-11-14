import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SheetProduct } from "@/services/sheetsApi";
import { ExternalLink, ImageIcon } from "lucide-react";

interface ProductsTableProps {
  products: SheetProduct[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price);
  };

  return (
    <Card className="bg-card border-2 border-border shadow-sm">
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
                <TableHead className="text-foreground font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.slice(0, 20).map((product) => (
                <TableRow key={product.sku} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                  <TableCell className="font-medium text-foreground max-w-xs truncate">{product.nombre}</TableCell>
                  <TableCell>
                    {product.existencia === "En Existencia" ? (
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
                    {formatPrice(product.precio_regular)}
                  </TableCell>
                  <TableCell className="text-right text-foreground font-semibold">
                    {formatPrice(product.precio_final)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {product.peso?.toFixed(2) || "N/A"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                    {product.categoria_nombre}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {product.url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(product.url, '_blank')}
                          className="text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver en tienda
                        </Button>
                      )}
                      {product.url_imagen && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(product.url_imagen, '_blank')}
                          className="text-xs"
                        >
                          <ImageIcon className="h-3 w-3 mr-1" />
                          Ver imagen
                        </Button>
                      )}
                    </div>
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
