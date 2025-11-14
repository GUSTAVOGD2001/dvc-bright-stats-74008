import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GRAPHQL_ENDPOINT = "https://tiendaddvc.mx/graphql";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Proxy request received");
    const { query, variables } = await req.json();
    console.log("Query:", query);
    console.log("Variables:", variables);

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GraphQL HTTP Error:", response.status, errorText);
      throw new Error(`GraphQL HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const result = await response.json();
    console.log("GraphQL response received:", result);
    
    if (result.errors) {
      console.error("GraphQL Errors:", result.errors);
      throw new Error(result.errors[0]?.message || "GraphQL query error");
    }

    return new Response(JSON.stringify(result.data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Proxy Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
