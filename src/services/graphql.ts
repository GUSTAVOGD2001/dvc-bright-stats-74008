import { supabase } from "@/integrations/supabase/client";

export interface Product {
  sku: string;
  name: string;
  is_salable: boolean;
  price_range: {
    minimum_price: {
      regular_price: { value: number };
      final_price: { value: number };
    };
  };
  weight?: number;
  manufacturer?: number;
  categories: { name: string }[];
}

export interface ProductsResponse {
  products: {
    total_count: number;
    items: Product[];
  };
}

export interface CategoryListResponse {
  categoryList: {
    id: string;
    name: string;
    level: number;
    url_path: string;
  }[];
}

export async function fetchGraphQL<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  try {
    const { data, error } = await supabase.functions.invoke('graphql-proxy', {
      body: { query, variables }
    });

    if (error) {
      console.error("GraphQL Proxy Error:", error);
      throw new Error(error.message || "Error calling GraphQL proxy");
    }

    return data;
  } catch (error) {
    console.error("GraphQL Fetch Error:", error);
    throw error;
  }
}

// New function to fetch all products using batch strategy
export async function fetchAllProducts(): Promise<ProductsResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('graphql-proxy', {
      body: { action: 'fetchAll' }
    });

    if (error) {
      console.error("GraphQL Proxy Error:", error);
      throw new Error(error.message || "Error calling GraphQL proxy");
    }

    return data;
  } catch (error) {
    console.error("GraphQL Fetch Error:", error);
    throw error;
  }
}

export const QUERY_GLOBAL_STATS = `
  query DashboardGlobalStats($pageSize: Int!, $currentPage: Int!) {
    products(filter: {}, pageSize: $pageSize, currentPage: $currentPage) {
      total_count
      items {
        sku
        is_salable
        price_range {
          minimum_price {
            final_price { value }
          }
        }
      }
    }
  }
`;

export const QUERY_CATEGORIES = `
  query GetCategoryFilters {
    categoryList(filters: {}) {
      id
      name
      level
      url_path
    }
  }
`;

export const QUERY_DASHBOARD_PRODUCTS = `
  query GetDashboardProducts($pageSize: Int!, $currentPage: Int!) {
    products(filter: {}, pageSize: $pageSize, currentPage: $currentPage) {
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
