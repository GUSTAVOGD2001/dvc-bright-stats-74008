import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, Power } from "lucide-react";
import { useState } from "react";
import { triggerManualUpdate, enableAutoUpdate, disableAutoUpdate } from "@/services/sheetsApi";
import { toast } from "sonner";

export function ControlButtons() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const handleManualUpdate = async () => {
    setIsUpdating(true);
    try {
      const result = await triggerManualUpdate();
      toast.success("Actualización Manual", {
        description: result.message || "Actualización iniciada correctamente",
      });
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo iniciar la actualización manual",
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
    <div className="flex flex-wrap gap-3 p-4 bg-card rounded-lg border border-border shadow-sm">
      <Button
        onClick={handleManualUpdate}
        disabled={isUpdating}
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
  );
}
