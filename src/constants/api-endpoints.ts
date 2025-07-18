export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/Admin/Login/Login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    IS_AUTHORIZED: '/Admin/User/IsAuthorized',
    RESET_PASSWORD: '/Admin/User/ResetPassword',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
  },
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    UPDATE: '/products',
    DELETE: '/products',
  },
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    UPDATE: '/categories',
    DELETE: '/categories',
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE: '/orders',
    DELETE: '/orders',
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
} as const;