export interface User {
  id: string;
  username: string;
  email: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}