import { notFound } from "next/navigation";
import { fetchPlaces } from "@/lib/server-api";
import RouteDetailView from "@/components/route-detail-view";

interface Props {
  searchParams: Promise<{ ids?: string }>;
}

export default async function RouteDetailPage({ searchParams }: Props) {
  const { ids } = await searchParams;

  if (!ids) notFound();

  const rawIds = ids
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));

  if (rawIds.length === 0) notFound();

  const allPlaces = await fetchPlaces();

  const orderedPlaces = rawIds
    .map((id) => allPlaces.find((p) => p.id === id))
    .filter(Boolean) as typeof allPlaces;

  if (orderedPlaces.length === 0) notFound();

  return <RouteDetailView places={orderedPlaces} />;
}
