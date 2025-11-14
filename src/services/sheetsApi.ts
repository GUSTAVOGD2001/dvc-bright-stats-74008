import { supabase } from "@/integrations/supabase/client";

export interface SheetProduct {
  sku: string;
  nombre: string;
  existencia: boolean;
  precio_regular: number;
  precio_final: number;
  peso: number;
  categoria_nombre: string;
}

export interface SheetsResponse {
  success: boolean;
  data: SheetProduct[];
  message?: string;
}

export async function fetchAllProducts(): Promise<SheetProduct[]> {
  try {
    const { data, error } = await supabase.functions.invoke('sheets-proxy', {
      body: { method: 'GET' }
    });

    if (error) {
      console.error('Sheets Proxy Error:', error);
      throw new Error(error.message || 'Error al conectar con Google Sheets');
    }

    if (!data.success) {
      throw new Error(data.message || 'Error fetching products');
    }

    return data.data;
  } catch (error) {
    console.error('Sheets API Error:', error);
    throw error;
  }
}

export async function triggerManualUpdate(): Promise<{ message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('sheets-proxy', {
      body: { 
        method: 'POST',
        action: 'run_manual_update' 
      }
    });

    if (error) {
      console.error('Manual Update Error:', error);
      throw new Error(error.message || 'Error al iniciar actualización manual');
    }

    return data;
  } catch (error) {
    console.error('Manual Update Error:', error);
    throw error;
  }
}

export async function enableAutoUpdate(): Promise<{ message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('sheets-proxy', {
      body: { 
        method: 'POST',
        action: 'enable_auto_update' 
      }
    });

    if (error) {
      console.error('Enable Auto Update Error:', error);
      throw new Error(error.message || 'Error al activar actualización automática');
    }

    return data;
  } catch (error) {
    console.error('Enable Auto Update Error:', error);
    throw error;
  }
}

export async function disableAutoUpdate(): Promise<{ message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('sheets-proxy', {
      body: { 
        method: 'POST',
        action: 'disable_auto_update' 
      }
    });

    if (error) {
      console.error('Disable Auto Update Error:', error);
      throw new Error(error.message || 'Error al desactivar actualización automática');
    }

    return data;
  } catch (error) {
    console.error('Disable Auto Update Error:', error);
    throw error;
  }
}
