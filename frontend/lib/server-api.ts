// Server-side only. Uses BACKEND_INTERNAL_URL (absolute) — works in Node.js fetch.
const BACKEND = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:4000";

export interface Place {
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
  type: "attraction" | "hotel" | "restaurant" | "museum";
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  partner?: { id: number; companyName: string; subscriptionActive: boolean } | null;
}

export interface Route {
  id: number;
  title: string;
  subtitle: string;
  path: string;
  description: string;
  tags: string[];
  image: string;
  images: { type: "image" | "video"; url: string }[];
}

export async function fetchPlaces(): Promise<Place[]> {
  try {
    const res = await fetch(`${BACKEND}/places`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (e) {
    console.error("[server-api] fetchPlaces error:", e);
    const { places } = await import("@/lib/data");
    return places as unknown as Place[];
  }
}

export async function fetchPlace(id: number): Promise<Place | null> {
  try {
    const res = await fetch(`${BACKEND}/places/${id}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (e) {
    console.error(`[server-api] fetchPlace(${id}) error:`, e);
    return null;
  }
}

export async function fetchRoutes(): Promise<Route[]> {
  try {
    const res = await fetch(`${BACKEND}/routes`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (e) {
    console.error("[server-api] fetchRoutes error:", e);
    const { routes } = await import("@/lib/data");
    return routes as unknown as Route[];
  }
}

export async function fetchRoute(id: number): Promise<Route | null> {
  try {
    const res = await fetch(`${BACKEND}/routes/${id}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (e) {
    console.error(`[server-api] fetchRoute(${id}) error:`, e);
    return null;
  }
}
