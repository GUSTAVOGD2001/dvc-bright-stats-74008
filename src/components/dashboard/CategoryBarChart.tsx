import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Product } from "@/services/graphql";

interface CategoryBarChartProps {
  products: Product[];
}

export function CategoryBarChart({ products }: CategoryBarChartProps) {
  // Process products to get top 15 categories
  const categoryCounts = products.reduce((acc, product) => {
    product.categories.forEach((cat) => {
      acc[cat.name] = (acc[cat.name] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <div className="w-1 h-6 bg-secondary rounded-full" />
          Top 15 Categorías
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
            <YAxis
              dataKey="name"
              type="category"
              stroke="hsl(var(--muted-foreground))"
              width={90}
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
