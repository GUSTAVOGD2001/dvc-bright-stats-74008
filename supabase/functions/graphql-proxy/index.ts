import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GRAPHQL_ENDPOINT = "https://tiendaddvc.mx/graphql";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REQUEST_DELAY = 300; // ms between requests
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // ms

// Query to get all categories
const QUERY_CATEGORIES = `
  query GetCategories {
    categoryList(filters: {}) {
      id
      name
      product_count
    }
  }
`;

// Query to get products by category with pagination
const QUERY_PRODUCTS_BY_CATEGORY = `
  query GetProductsByCategory($catId: String!, $pageSize: Int!, $currentPage: Int!) {
    products(
      filter: { category_id: { eq: $catId } }
      pageSize: $pageSize
      currentPage: $currentPage
    ) {
      total_count
      page_info {
        current_page
        total_pages
      }
      items {
        sku
        name
        is_salable
        url_key
        url_suffix
        small_image { url }
        image { url }
        price_range {
          minimum_price {
            regular_price { value currency }
            final_price { value currency }
          }
        }
        categories {
          name
          url_path
          level
        }
        ... on PhysicalProductInterface {
          weight
        }
      }
    }
  }
`;

// Query to get all products (for categories with few products)
const QUERY_ALL_PRODUCTS = `
  query GetAllProducts($pageSize: Int!, $currentPage: Int!) {
    products(
      filter: {}
      pageSize: $pageSize
      currentPage: $currentPage
    ) {
      total_count
      page_info {
        current_page
        total_pages
      }
      items {
        sku
        name
        is_salable
        url_key
        url_suffix
        small_image { url }
        image { url }
        price_range {
          minimum_price {
            regular_price { value currency }
            final_price { value currency }
          }
        }
        categories {
          name
          url_path
          level
        }
        ... on PhysicalProductInterface {
          weight
        }
      }
    }
  }
`;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchGraphQLWithRetry(query: string, variables: Record<string, any> = {}, retries = MAX_RETRIES): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "LovableDashboard/1.0",
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // If it's a 503 or 429, retry with backoff
        if ((response.status === 503 || response.status === 429) && attempt < retries) {
          const backoffTime = INITIAL_BACKOFF * Math.pow(2, attempt);
          console.log(`Attempt ${attempt + 1} failed with ${response.status}. Retrying in ${backoffTime}ms...`);
          await sleep(backoffTime);
          continue;
        }
        
        throw new Error(`GraphQL HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || "GraphQL query error");
      }

      return result.data;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      const backoffTime = INITIAL_BACKOFF * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed. Retrying in ${backoffTime}ms...`);
      await sleep(backoffTime);
    }
  }
}

async function fetchGraphQL(query: string, variables: Record<string, any> = {}) {
  return fetchGraphQLWithRetry(query, variables);
}

async function getAllProductsByCategory() {
  console.log("=== Starting batch fetch of all products ===");
  
  // Step 1: Get all categories
  const categoriesData = await fetchGraphQL(QUERY_CATEGORIES);
  const categories = categoriesData.categoryList || [];
  
  console.log(`✓ Found ${categories.length} total categories`);
  
  // Log category details
  const categoriesWithProducts = categories.filter((c: any) => c.product_count > 0);
  console.log(`✓ Categories with products: ${categoriesWithProducts.length}`);
  console.log(`Total products expected: ${categoriesWithProducts.reduce((sum: number, c: any) => sum + c.product_count, 0)}`);
  
  const allProducts: any[] = [];
  let totalFetched = 0;
  let successfulCategories = 0;
  let failedCategories: string[] = [];
  
  // Step 2: For each category, fetch all products with pagination
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    
    if (category.product_count === 0) {
      console.log(`[${i + 1}/${categories.length}] Skipping "${category.name}" (no products)`);
      continue;
    }
    
    console.log(`[${i + 1}/${categories.length}] Fetching "${category.name}" (${category.product_count} products)...`);
    
    let currentPage = 1;
    let hasMorePages = true;
    let categorySuccess = true;
    
    while (hasMorePages) {
      try {
        const productsData = await fetchGraphQL(QUERY_PRODUCTS_BY_CATEGORY, {
          catId: category.id,
          pageSize: 100,
          currentPage: currentPage,
        });
        
        const products = productsData.products;
        const items = products.items || [];
        
        allProducts.push(...items);
        totalFetched += items.length;
        
        console.log(`  ✓ Page ${currentPage}/${products.page_info.total_pages}: +${items.length} products (total: ${totalFetched})`);
        
        hasMorePages = currentPage < products.page_info.total_pages;
        currentPage++;
        
        // Delay between requests to avoid rate limiting
        if (hasMorePages) {
          await sleep(REQUEST_DELAY);
        }
      } catch (error) {
        console.error(`  ✗ Error on page ${currentPage} for "${category.name}":`, error instanceof Error ? error.message : String(error));
        categorySuccess = false;
        hasMorePages = false;
        failedCategories.push(`${category.name} (page ${currentPage})`);
      }
    }
    
    if (categorySuccess) {
      successfulCategories++;
    }
    
    // Delay between categories
    if (i < categories.length - 1) {
      await sleep(REQUEST_DELAY);
    }
  }
  
  console.log("\n=== FETCH SUMMARY ===");
  console.log(`✓ Total categories processed: ${categories.length}`);
  console.log(`✓ Successful categories: ${successfulCategories}`);
  console.log(`✓ Total products fetched: ${allProducts.length}`);
  
  if (failedCategories.length > 0) {
    console.log(`✗ Failed categories (${failedCategories.length}):`);
    failedCategories.forEach(cat => console.log(`  - ${cat}`));
  }
  
  return allProducts;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, variables } = await req.json();
    
    // If action is "fetchAll", use the batch strategy
    if (action === "fetchAll") {
      console.log("Starting batch fetch of all products...");
      const products = await getAllProductsByCategory();
      
      return new Response(JSON.stringify({ 
        products: {
          total_count: products.length,
          items: products
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Otherwise, use the standard proxy behavior
    console.log("Standard proxy request");
    const result = await fetchGraphQL(query, variables);
    
    return new Response(JSON.stringify(result), {
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
