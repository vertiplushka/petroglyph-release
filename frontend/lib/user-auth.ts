const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface UserProfile {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface Favorite {
  id: number;
  routeId: number | null;
  placeIds: number[] | null;
  title: string;
  createdAt: string;
}

export async function apiUserRegister(login: string, password: string, name?: string) {
  const res = await fetch(`${BACKEND}/auth/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Ошибка регистрации");
  return data as { access_token: string; user: UserProfile };
}

export async function apiUserLogin(login: string, password: string) {
  const res = await fetch(`${BACKEND}/auth/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Неверный логин или пароль");
  return data as { access_token: string; user: UserProfile };
}

export async function apiUserMe(token: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${BACKEND}/auth/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function apiFavorites(token: string): Promise<Favorite[]> {
  try {
    const res = await fetch(`${BACKEND}/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function apiAddFavorite(
  token: string,
  data: { title: string; routeId?: number; placeIds?: number[] }
): Promise<Favorite | null> {
  try {
    const res = await fetch(`${BACKEND}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function apiRemoveFavorite(token: string, id: number): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND}/favorites/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function getUserToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)user_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export function setUserToken(token: string) {
  document.cookie = `user_token=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

export function clearUserToken() {
  document.cookie = "user_token=; path=/; max-age=0";
}
