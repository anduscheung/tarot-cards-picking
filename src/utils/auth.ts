import { jwtDecode } from "jwt-decode";

const TOKEN = "token";

export type JwtPayload = {
  sub?: string; // id
  email?: string;
  exp?: number; // in second
};

export function setToken(token: string) {
  localStorage.setItem(TOKEN, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN) || null;
}

export function clearToken() {
  localStorage.removeItem(TOKEN);
}

export function decodeToken(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

export function isTokenValid(token: string | null): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp) return false; // require exp (means backend always issues tokens with exp, a token without exp is unexpected)
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}
