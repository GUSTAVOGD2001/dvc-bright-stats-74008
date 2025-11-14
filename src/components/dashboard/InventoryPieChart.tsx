import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface InventoryPieChartProps {
  inStock: number;
  outOfStock: number;
}

export function InventoryPieChart({ inStock, outOfStock }: InventoryPieChartProps) {
  const data = [
    { name: "En Existencia", value: inStock, color: "hsl(var(--success))" },
    { name: "Agotado", value: outOfStock, color: "hsl(var(--destructive))" },
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <div className="w-1 h-6 bg-primary rounded-full" />
          Estado de Inventario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Legend
              wrapperStyle={{
                color: "hsl(var(--foreground))",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
