const API = process.env.NEXT_PUBLIC_API_URL ?? "/v1";

function getToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
  return match ? match[1] : "";
}

function setToken(token: string) {
  document.cookie = `admin_token=${token}; path=/; max-age=86400; SameSite=Lax`;
}

function clearToken() {
  document.cookie = "admin_token=; path=/; max-age=0";
}

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? "Request failed");
  }
  return res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await handleResponse<{ access_token: string }>(res);
  setToken(data.access_token);
}

export function logout() {
  clearToken();
}

// ── Media ─────────────────────────────────────────────────────────────────────

export interface MediaItem {
  type: "image" | "video";
  url: string;
}

export async function uploadMedia(file: File): Promise<MediaItem> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: fd,
  });
  return handleResponse(res);
}

// ── Places ────────────────────────────────────────────────────────────────────

export interface Place {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  rating: number;
  tags: string[];
  image: string;
  images: MediaItem[];
  lat: number;
  lng: number;
  type: "attraction" | "hotel" | "restaurant" | "museum";
  partnerId?: number | null;
  partner?: { id: number; companyName: string } | null;
}

export async function getPlaces(): Promise<Place[]> {
  const res = await fetch(`${API}/places`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getPlace(id: number): Promise<Place> {
  const res = await fetch(`${API}/places/${id}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createPlace(data: Place): Promise<Place> {
  const res = await fetch(`${API}/places`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updatePlace(id: number, data: Partial<Omit<Place, "id">>): Promise<Place> {
  const res = await fetch(`${API}/places/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deletePlace(id: number): Promise<void> {
  const res = await fetch(`${API}/places/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await handleResponse(res);
}

export async function getPublicPlace(id: number): Promise<Place> {
  const res = await fetch(`${API}/places/${id}`, { cache: "no-store" });
  return handleResponse(res);
}

// ── Routes ────────────────────────────────────────────────────────────────────

export interface Route {
  id: number;
  title: string;
  subtitle: string;
  path: string;
  description: string;
  tags: string[];
  image: string;
  images: MediaItem[];
}

export async function getRoutes(): Promise<Route[]> {
  const res = await fetch(`${API}/routes`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getRouteAdmin(id: number): Promise<Route> {
  const res = await fetch(`${API}/routes/${id}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createRoute(data: Route): Promise<Route> {
  const res = await fetch(`${API}/routes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateRoute(id: number, data: Partial<Omit<Route, "id">>): Promise<Route> {
  const res = await fetch(`${API}/routes/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteRoute(id: number): Promise<void> {
  const res = await fetch(`${API}/routes/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await handleResponse(res);
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: number;
  author: string;
  date: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  placeId: number | null;
  routeId: number | null;
  createdAt: string;
}

export async function getReviews(params?: {
  status?: ReviewStatus;
  placeId?: number;
  routeId?: number;
}): Promise<Review[]> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.placeId != null) q.set("placeId", String(params.placeId));
  if (params?.routeId != null) q.set("routeId", String(params.routeId));
  const res = await fetch(`${API}/reviews?${q}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function approveReview(id: number): Promise<Review> {
  const res = await fetch(`${API}/reviews/${id}/approve`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function rejectReview(id: number): Promise<Review> {
  const res = await fetch(`${API}/reviews/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function deleteReview(id: number): Promise<void> {
  const res = await fetch(`${API}/reviews/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await handleResponse(res);
}

// ── AI Settings ───────────────────────────────────────────────────────────────

export interface AISettings {
  baseUrl: string;
  model: string;
  apiKeyMasked: string;
  hasKey: boolean;
}

export async function getAISettings(): Promise<AISettings> {
  const res = await fetch(`${API}/settings`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function updateAISettings(data: {
  baseUrl?: string;
  model?: string;
  apiKey?: string;
}): Promise<AISettings> {
  const res = await fetch(`${API}/settings`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ── Partners ──────────────────────────────────────────────────────────────────

export interface Partner {
  id: number;
  companyName: string;
  legalAddress: string;
  inn: string;
  kpp: string;
  ogrn: string;
  contactPerson: string;
  phone: string;
  email: string;
  subscriptionActive: boolean;
  subscriptionEndsAt: string | null;
  createdAt: string;
  places?: { id: number; name: string }[];
}

export async function getPartners(): Promise<Partner[]> {
  const res = await fetch(`${API}/partners`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getPartner(id: number): Promise<Partner> {
  const res = await fetch(`${API}/partners/${id}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createPartner(data: Omit<Partner, "id" | "createdAt" | "places"> & { password: string }): Promise<Partner> {
  const res = await fetch(`${API}/partners`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updatePartner(id: number, data: Partial<Omit<Partner, "id" | "createdAt" | "places">> & { password?: string }): Promise<Partner> {
  const res = await fetch(`${API}/partners/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deletePartner(id: number): Promise<void> {
  const res = await fetch(`${API}/partners/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await handleResponse(res);
}

// Public: submit a review (no auth required)
export async function submitReview(data: {
  author: string;
  rating: number;
  text: string;
  placeId?: number;
  routeId?: number;
}): Promise<Review> {
  const res = await fetch(`${API}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Public: fetch approved reviews for a place or route
export async function getPublicReviews(params: {
  placeId?: number;
  routeId?: number;
}): Promise<Review[]> {
  const q = new URLSearchParams({ status: "approved" });
  if (params.placeId != null) q.set("placeId", String(params.placeId));
  if (params.routeId != null) q.set("routeId", String(params.routeId));
  const res = await fetch(`${API}/reviews?${q}`, { cache: "no-store" });
  return handleResponse(res);
}
