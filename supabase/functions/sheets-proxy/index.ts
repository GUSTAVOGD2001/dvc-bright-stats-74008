import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbzD6oI3cVGyF1yAMNRaxjljYtqZ5AxSF_VI0xZbpPPaL-KZoEHtNiZ33OBVfyBduKZi/exec";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('📥 Sheets Proxy - Request received:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('📦 Request body:', JSON.stringify(body));
    
    const { method, action } = body;

    let response;

    if (method === 'GET' || !action) {
      console.log('🔍 GET request - Fetching all products from Google Sheets');
      // GET request to fetch all products
      response = await fetch(SHEETS_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      console.log('📤 POST request - Action:', action);
      // POST request with action
      response = await fetch(SHEETS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
    }

    console.log('📊 Google Sheets response status:', response.status);
    const data = await response.json();
    console.log('✅ Response data received, products count:', data.data?.length || 0);

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Sheets Proxy Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        message: 'Error al conectar con Google Sheets'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
