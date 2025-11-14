const GRAPHQL_ENDPOINT = "https://tiendaddvc.mx/graphql";

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
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "User-Agent": "LovableDashboard/1.0",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(result.errors[0]?.message || "GraphQL query error");
  }

  return result.data;
}

export const QUERY_GLOBAL_STATS = `
  query DashboardGlobalStats {
    total_productos: products(filter: {}) { total_count }
    en_existencia: products(filter: { is_salable: { eq: true } }) { total_count }
    agotados: products(filter: { is_salable: { eq: false } }) { total_count }
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
  query GetDashboardProducts(
    $pageSize: Int!,
    $currentPage: Int!,
    $catId: String,
    $isSalable: Boolean
  ) {
    products(
      filter: {
        category_id: { eq: $catId }
        is_salable: { eq: $isSalable }
      }
      pageSize: $pageSize
      currentPage: $currentPage
    ) {
      total_count
      items {
        sku
        name
        is_salable
        price_range {
          minimum_price {
            regular_price { value }
            final_price { value }
          }
        }
        ... on PhysicalProductInterface {
          weight
          manufacturer
        }
        categories { name }
      }
    }
  }
`;
