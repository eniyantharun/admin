import { STRINGS } from "@/constants/strings";
import Cookies from "js-cookie";

export function setAdminToken(data:any) {
  const { token, expires } = data;
  Cookies.set(STRINGS.AUTH.COOKIE_TOKEN_KEY, token, {
    expires: new Date(expires), 
    secure: true,
    sameSite: "Strict",
  });
}

export function getAdminToken(): string | undefined {
  return Cookies.get(STRINGS.AUTH.COOKIE_TOKEN_KEY);
}

export function clearAdminToken(): void {
  Cookies.remove(STRINGS.AUTH.COOKIE_TOKEN_KEY);
}