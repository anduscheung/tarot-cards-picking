import { setToken } from "../utils/auth";
import { serviceInstance } from "./";

export type LoginResp = { token: string; user: { id: string; email: string } };

export async function login(email: string, password: string) {
  const { data } = await serviceInstance.post<LoginResp>("/api/auth/login", { email, password });
  setToken(data.token);
  return data;
}

export async function signup(email: string, password: string, display_name?: string) {
  const { data } = await serviceInstance.post<LoginResp>("/api/auth/signup", {
    email,
    password,
    display_name,
  });
  setToken(data.token);
  return data;
}
