import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Product } from "@/services/graphql";

interface PriceHistogramProps {
  products: Product[];
}

export function PriceHistogram({ products }: PriceHistogramProps) {
  // Create price ranges
  const ranges = [
    { min: 0, max: 500, label: "$0-500" },
    { min: 500, max: 1000, label: "$500-1K" },
    { min: 1000, max: 2000, label: "$1K-2K" },
    { min: 2000, max: 5000, label: "$2K-5K" },
    { min: 5000, max: 10000, label: "$5K-10K" },
    { min: 10000, max: Infinity, label: "$10K+" },
  ];

  const data = ranges.map((range) => {
    const count = products.filter((product) => {
      const price = product.price_range.minimum_price.final_price.value;
      return price >= range.min && price < range.max;
    }).length;

    return { name: range.label, count };
  });

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <div className="w-1 h-6 bg-warning rounded-full" />
          Distribución de Precios
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
