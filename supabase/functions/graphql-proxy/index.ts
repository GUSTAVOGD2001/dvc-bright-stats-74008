import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GRAPHQL_ENDPOINT = "https://tiendaddvc.mx/graphql";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

async function fetchGraphQL(query: string, variables: Record<string, any> = {}) {
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
    throw new Error(`GraphQL HTTP ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(result.errors[0]?.message || "GraphQL query error");
  }

  return result.data;
}

async function getAllProductsByCategory() {
  console.log("Step 1: Fetching all categories...");
  
  // Step 1: Get all categories
  const categoriesData = await fetchGraphQL(QUERY_CATEGORIES);
  const categories = categoriesData.categoryList || [];
  
  console.log(`Found ${categories.length} categories`);
  
  const allProducts: any[] = [];
  let totalFetched = 0;
  
  // Step 2: For each category, fetch all products with pagination
  for (const category of categories) {
    if (category.product_count === 0) {
      console.log(`Skipping category ${category.name} (no products)`);
      continue;
    }
    
    console.log(`Fetching products for category: ${category.name} (${category.product_count} products)`);
    
    let currentPage = 1;
    let hasMorePages = true;
    
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
        
        console.log(`  Page ${currentPage}/${products.page_info.total_pages}: fetched ${items.length} products (total: ${totalFetched})`);
        
        hasMorePages = currentPage < products.page_info.total_pages;
        currentPage++;
        
        // Small delay to avoid rate limiting
        if (hasMorePages) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error fetching page ${currentPage} for category ${category.name}:`, error);
        hasMorePages = false;
      }
    }
  }
  
  console.log(`✓ Successfully fetched ${allProducts.length} products from ${categories.length} categories`);
  
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
