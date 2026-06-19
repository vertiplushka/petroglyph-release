const API = process.env.NEXT_PUBLIC_API_URL ?? "/v1";

function getToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)partner_token=([^;]+)/);
  return match ? match[1] : "";
}

export function setPartnerToken(token: string) {
  document.cookie = `partner_token=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearPartnerToken() {
  document.cookie = "partner_token=; path=/; max-age=0";
}

export function getPartnerToken(): string {
  return getToken();
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

export interface PartnerInfo {
  id: number;
  companyName: string;
  email: string;
  contactPerson: string;
}

export async function partnerLogin(email: string, password: string): Promise<PartnerInfo> {
  const res = await fetch(`${API}/auth/partner-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse<{ access_token: string; partner: PartnerInfo }>(res);
  setPartnerToken(data.access_token);
  return data.partner;
}

export interface PartnerSession {
  partnerId: number;
  email: string;
  companyName: string;
}

export function decodePartnerToken(): PartnerSession | null {
  const token = getToken();
  if (!token) return null;
  try {
    // Proper UTF-8 decode (handles Cyrillic and other multibyte chars)
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    if (payload.role !== "partner" || !payload.partnerId) return null;
    return {
      partnerId: payload.partnerId,
      email: payload.email ?? "",
      companyName: payload.companyName ?? "",
    };
  } catch {
    return null;
  }
}

export async function subscribePartner(plan: "monthly" | "annual"): Promise<void> {
  const res = await fetch(`${API}/partner-places/subscribe`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ plan }),
  });
  await handleResponse(res);
}

export interface PlaceStats {
  id: number;
  name: string;
  image: string;
  category: string;
  type: string;
  views: number;
  aiShows: number;
}

export interface AnalyticsData {
  aiShows: number[];
  views: number[];
  labels: string[];
  totalBookings: number;
  totalRequests: number;
  places: { id: number; name: string }[];
  perPlace: PlaceStats[];
  subscription: { active: boolean; endsAt: string | null };
}

export async function getPartnerAnalytics(
  partnerId: number,
  period: "today" | "week" | "month" = "today",
  placeId?: number
): Promise<AnalyticsData> {
  const params = new URLSearchParams({ period });
  if (placeId) params.set("placeId", String(placeId));
  const res = await fetch(`${API}/analytics/partner/${partnerId}?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export interface PartnerPlaceFull {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  rating: number;
  tags: string[];
  image: string;
  images: { type: "image" | "video"; url: string }[];
  lat: number;
  lng: number;
  type: string;
}

export async function getPartnerPlace(placeId: number): Promise<PartnerPlaceFull> {
  const res = await fetch(`${API}/partner-places/${placeId}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function updatePartnerPlace(
  placeId: number,
  data: Partial<Omit<PartnerPlaceFull, "id">>
): Promise<PartnerPlaceFull> {
  const res = await fetch(`${API}/partner-places/${placeId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function uploadPartnerMedia(file: File): Promise<{ type: "image" | "video"; url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: fd,
  });
  return handleResponse(res);
}
