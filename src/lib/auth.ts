import Cookies from 'js-cookie';

const AUTH_TOKEN_KEY = 'auth_token';

export const authUtils = {
  setToken: (token: string, expires?: Date) => {
    Cookies.set(AUTH_TOKEN_KEY, token, {
      expires: expires || 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  },

  getToken: (): string | undefined => {
    return Cookies.get(AUTH_TOKEN_KEY);
  },

  removeToken: () => {
    Cookies.remove(AUTH_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!Cookies.get(AUTH_TOKEN_KEY);
  },
};