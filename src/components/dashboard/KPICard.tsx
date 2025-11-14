import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "success" | "danger" | "warning";
}

export function KPICard({ title, value, icon: Icon, trend, variant = "default" }: KPICardProps) {
  const variantClasses = {
    default: "border-primary/30 shadow-glow-primary",
    success: "border-success/30 shadow-glow-success",
    danger: "border-destructive/30 shadow-glow-danger",
    warning: "border-warning/30",
  };

  return (
    <Card className={`p-6 bg-card/50 backdrop-blur-sm border-2 transition-all hover:scale-105 ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-bold text-foreground">{value}</p>
          {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${variant}/10`}>
          <Icon className={`h-8 w-8 text-${variant}`} />
        </div>
      </div>
    </Card>
  );
}
