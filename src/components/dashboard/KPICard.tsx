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
    default: "border-primary/30",
    success: "border-success/30",
    danger: "border-destructive/30",
    warning: "border-warning/30",
  };

  const iconVariantClasses = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <Card className={`p-6 bg-card border-2 shadow-sm transition-all hover:shadow-md ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-bold text-foreground">{value}</p>
          {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
        </div>
        <div className={`p-3 rounded-lg ${iconVariantClasses[variant]}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </Card>
  );
}
