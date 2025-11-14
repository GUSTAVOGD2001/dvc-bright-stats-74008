import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Clock, Power } from "lucide-react";
import { useState } from "react";
import { triggerManualUpdate, enableAutoUpdate, disableAutoUpdate, getUpdateStatus } from "@/services/sheetsApi";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export function ControlButtons() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // Poll for update status every 5 seconds when an update is running
  const { data: updateStatus } = useQuery({
    queryKey: ['updateStatus'],
    queryFn: getUpdateStatus,
    refetchInterval: isPolling ? 5000 : false,
    enabled: isPolling,
  });

  const handleManualUpdate = async () => {
    setIsUpdating(true);
    try {
      const result = await triggerManualUpdate();
      toast.success("Actualización Manual", {
        description: result.message || "Actualización iniciada correctamente",
      });
      // Start polling for progress
      setIsPolling(true);
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo iniciar la actualización manual",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Stop polling when update is complete
  if (updateStatus?.status === 'idle' && isPolling) {
    setIsPolling(false);
    if (updateStatus.report) {
      toast.success("Actualización Completada", {
        description: updateStatus.report,
      });
    }
  }

  const handleEnableAuto = async () => {
    setIsEnabling(true);
    try {
      const result = await enableAutoUpdate();
      toast.success("Actualización Automática", {
        description: result.message || "Actualizaciones automáticas (Cada Hora) ENCENDIDAS",
      });
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo activar la actualización automática",
      });
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDisableAuto = async () => {
    setIsDisabling(true);
    try {
      const result = await disableAutoUpdate();
      toast.success("Actualización Automática", {
        description: result.message || "Actualizaciones automáticas APAGADAS",
      });
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo desactivar la actualización automática",
      });
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 p-4 bg-card rounded-lg border border-border shadow-sm">
        <Button
          onClick={handleManualUpdate}
          disabled={isUpdating || isPolling}
          variant="default"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
          {isUpdating ? 'Actualizando...' : 'Actualizar Existencias'}
        </Button>

        <Button
          onClick={handleEnableAuto}
          disabled={isEnabling}
          variant="default"
          className="flex items-center gap-2 bg-success hover:bg-success/90"
        >
          <Clock className="h-4 w-4" />
          {isEnabling ? 'Activando...' : 'Encender Automático (1/hr)'}
        </Button>

        <Button
          onClick={handleDisableAuto}
          disabled={isDisabling}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <Power className="h-4 w-4" />
          {isDisabling ? 'Desactivando...' : 'Apagar Automático'}
        </Button>
      </div>

      {/* Progress Tracker */}
      {isPolling && updateStatus && (
        <Card className="bg-card/50 border-primary/20">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso de actualización</span>
              <span className="font-semibold text-primary">{updateStatus.progress}%</span>
            </div>
            <Progress value={updateStatus.progress} className="h-2" />
            <p className="text-sm text-foreground">{updateStatus.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
