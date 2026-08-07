export const ROUTES = {
  HOME: "/",
  CATEGORY: "/category/:slug",
  SHOP: "/shop/:shopSlug",
  PRODUCT: "/product/:productSlug",
  SEARCH: "/search",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  DASHBOARD: "/dashboard",
  DASHBOARD_SHOP: "/dashboard/shop",
  DASHBOARD_PRODUCTS: "/dashboard/products",
  DASHBOARD_PRODUCT_NEW: "/dashboard/products/new",
  DASHBOARD_PRODUCT_EDIT: "/dashboard/products/:id/edit",
  DASHBOARD_GALLERY: "/dashboard/gallery",

  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_SELLERS: "/admin/sellers",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_BANNERS: "/admin/banners",
  ADMIN_SETTINGS: "/admin/settings",
};

export const categoryPath = (slug) => `/category/${slug}`;
export const shopPath = (slug) => `/shop/${slug}`;
export const productPath = (slug) => `/product/${slug}`;
export const editProductPath = (id) => `/dashboard/products/${id}/edit`;
