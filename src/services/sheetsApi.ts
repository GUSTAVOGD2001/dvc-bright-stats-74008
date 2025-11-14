const SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbzD6oI3cVGyF1yAMNRaxjljYtqZ5AxSF_VI0xZbpPPaL-KZoEHtNiZ33OBVfyBduKZi/exec";

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
    const response = await fetch(SHEETS_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SheetsResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error fetching products');
    }

    return result.data;
  } catch (error) {
    console.error('Sheets API Error:', error);
    throw error;
  }
}

export async function triggerManualUpdate(): Promise<{ message: string }> {
  try {
    const response = await fetch(SHEETS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'run_manual_update' }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Manual Update Error:', error);
    throw error;
  }
}

export async function enableAutoUpdate(): Promise<{ message: string }> {
  try {
    const response = await fetch(SHEETS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'enable_auto_update' }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Enable Auto Update Error:', error);
    throw error;
  }
}

export async function disableAutoUpdate(): Promise<{ message: string }> {
  try {
    const response = await fetch(SHEETS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'disable_auto_update' }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Disable Auto Update Error:', error);
    throw error;
  }
}
