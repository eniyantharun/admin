export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'PPI Admin Portal',
  COMPANY: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Promotional Product Inc',
  VERSION: '1.0.0',
  API_TIMEOUT: 10000,
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/Admin/Login/Login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    IS_AUTHORIZED: '/Admin/User/IsAuthorized',
    RESET_PASSWORD: '/Admin/User/ResetPassword',
  },
  CUSTOMERS: {
    BASE: '/Admin/CustomerEditor',
    LIST: '/Admin/CustomerEditor/GetCustomersList',
    CREATE: '/Admin/CustomerEditor/CreateCustomer',
    UPDATE: '/Admin/CustomerEditor/UpdateCustomer',
    DELETE: '/Admin/CustomerEditor/DeleteCustomer',
    SEND_RESET_PASSWORD: '/Admin/CustomerEditor/SendResetPasswordEmail',
    SEND_NEW_ACCOUNT: '/Admin/CustomerEditor/SendNewAccountEmail',
  },
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    UPDATE: '/products',
    DELETE: '/products',
    CATEGORIES: '/products/categories',
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE: '/orders',
    DELETE: '/orders',
    STATUS_UPDATE: '/orders/status',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ORDERS: '/dashboard/recent-orders',
    TOP_PRODUCTS: '/dashboard/top-products',
  },
} as const;

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.PENDING]: 'Pending',
  [ORDER_STATUSES.PROCESSING]: 'Processing',
  [ORDER_STATUSES.SHIPPED]: 'Shipped',
  [ORDER_STATUSES.DELIVERED]: 'Delivered',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled',
} as const;

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUSES.PENDING]: 'warning',
  [ORDER_STATUSES.PROCESSING]: 'primary',
  [ORDER_STATUSES.SHIPPED]: 'secondary',
  [ORDER_STATUSES.DELIVERED]: 'success',
  [ORDER_STATUSES.CANCELLED]: 'danger',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CUSTOMERS: '/customers',
  PRODUCTS: '/products',
  ORDERS: '/orders',
  CATEGORIES: '/categories',
  BRANDS: '/brands',
  SUPPLIERS: '/suppliers',
  QUOTES: '/quotes',
  KEYWORDS: '/keywords',
  THEMES: '/themes',
  SEARCHES: '/searches',
  SITEMAPS: '/sitemaps',
  BLOG: '/blog',
  FAQ: '/faq',
} as const;

export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
  },
  {
    id: 'products',
    label: 'Products',
    href: ROUTES.PRODUCTS,
    icon: 'Package',
  },
  {
    id: 'categories',
    label: 'Categories',
    href: ROUTES.CATEGORIES,
    icon: 'FolderOpen',
  },
  {
    id: 'orders',
    label: 'Orders',
    href: ROUTES.ORDERS,
    icon: 'ShoppingCart',
  },
  {
    id: 'customers',
    label: 'Customers',
    href: ROUTES.CUSTOMERS,
    icon: 'User',
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    href: ROUTES.SUPPLIERS,
    icon: 'Users',
  },
  {
    id: 'quotes',
    label: 'Quotes',
    href: ROUTES.QUOTES,
    icon: 'FileText',
  },
  {
    id: 'brands',
    label: 'Brands',
    href: ROUTES.BRANDS,
    icon: 'Award',
  },
  {
    id: 'keywords',
    label: 'Keywords',
    href: ROUTES.KEYWORDS,
    icon: 'Hash',
  },
  {
    id: 'themes',
    label: 'Themes',
    href: ROUTES.THEMES,
    icon: 'Palette',
  },
  {
    id: 'searches',
    label: 'Searches',
    href: ROUTES.SEARCHES,
    icon: 'Search',
  },
] as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  SIDEBAR_STATE: 'sidebar_state',
} as const;

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  LOGOUT: 'Successfully logged out!',
  SAVE: 'Changes saved successfully!',
  DELETE: 'Item deleted successfully!',
  CREATE: 'Item created successfully!',
  UPDATE: 'Item updated successfully!',
} as const;

export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
  },
  PHONE: {
    PATTERN: /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
    MESSAGE: 'Please enter a valid phone number',
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MESSAGE: 'Password must be at least 8 characters long',
  },
  REQUIRED: 'This field is required',
} as const;