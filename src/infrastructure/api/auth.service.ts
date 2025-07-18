import { apiConfig } from '../config/api';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expires: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiConfig.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    const loginResponse: LoginResponse = {
      token: response.data.token,
      expires: response.data.expires,
      user: {
        id: '1',
        username: credentials.username,
        email: credentials.username + '@example.com',
      }
    };
    
    return loginResponse;
  }

  static async logout(): Promise<void> {
    await apiConfig.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  static async refreshToken(): Promise<LoginResponse> {
    const response = await apiConfig.post(API_ENDPOINTS.AUTH.REFRESH);
    return response.data;
  }
}