"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { Place } from "@/lib/server-api";

const GORNO_ALTAYSK: [number, number] = [51.96, 85.96];

function FitBounds({ ids, places }: { ids: number[]; places: Place[] }) {
  const map = useMap();
  useEffect(() => {
    if (ids.length === 0) return;
    const pts = places.filter((p) => ids.includes(p.id));
    if (pts.length === 1) {
      map.flyTo([pts[0].lat, pts[0].lng], 9, { duration: 1 });
    } else if (pts.length > 1) {
      const lats = [GORNO_ALTAYSK[0], ...pts.map((p) => p.lat)];
      const lngs = [GORNO_ALTAYSK[1], ...pts.map((p) => p.lng)];
      map.flyToBounds(
        [
          [Math.min(...lats) - 0.3, Math.min(...lngs) - 0.3],
          [Math.max(...lats) + 0.3, Math.max(...lngs) + 0.3],
        ],
        { duration: 1, padding: [40, 40] },
      );
    }
  }, [ids, map]);
  return null;
}

export default function AltaiMapInner({
  highlightedIds,
  places,
}: {
  highlightedIds: number[];
  places: Place[];
}) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const hasRoute = highlightedIds.length > 0;
  const lastId = highlightedIds[highlightedIds.length - 1];

  const routePoints = highlightedIds
    .map((id) => places.find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => [p!.lat, p!.lng] as [number, number]);

  // Полилиния идёт от Горно-Алтайска через все точки маршрута
  const fullRoutePoints: [number, number][] = hasRoute
    ? [GORNO_ALTAYSK, ...routePoints]
    : [];

  return (
    <MapContainer
      center={[51.8, 85.0]}
      zoom={6}
      style={{ height: "100%", width: "100%", borderRadius: "16px" }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <FitBounds ids={highlightedIds} places={places} />

      {/* Линия маршрута от Горно-Алтайска */}
      {fullRoutePoints.length > 1 && (
        <Polyline
          positions={fullRoutePoints}
          pathOptions={{
            color: "#233516",
            weight: 2,
            opacity: 0.9,
            dashArray: "6 4",
          }}
        />
      )}

      {/* СТАРТ — Горно-Алтайск */}
      {hasRoute && (
        <CircleMarker
          center={GORNO_ALTAYSK}
          radius={10}
          pathOptions={{
            fillColor: "#233516",
            color: "#fffcf3",
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Tooltip
            permanent
            direction="top"
            offset={[0, -13]}
            className="leaflet-tooltip-custom"
          >
            🚩 Горно-Алтайск
          </Tooltip>
        </CircleMarker>
      )}

      {/* Все метки мест */}
      {places.map((place) => {
        const isHighlighted = highlightedIds.includes(place.id);
        const isEnd = hasRoute && place.id === lastId;
        const isHovered = hoveredId === place.id;
        const showTooltip = isHighlighted || isHovered;

        if (isEnd) {
          return (
            <CircleMarker
              key={place.id}
              center={[place.lat, place.lng]}
              radius={10}
              pathOptions={{
                fillColor: "#e63946",
                color: "#fffcf3",
                fillOpacity: 1,
                weight: 3,
              }}
              eventHandlers={{
                mouseover: () => setHoveredId(place.id),
                mouseout: () => setHoveredId(null),
              }}
            >
              <Tooltip
                permanent
                direction="top"
                offset={[0, -13]}
                className="leaflet-tooltip-custom"
              >
                🏁 {place.name}
              </Tooltip>
            </CircleMarker>
          );
        }

        return (
          <CircleMarker
            key={place.id}
            center={[place.lat, place.lng]}
            radius={isHighlighted ? 8 : isHovered ? 6 : 4}
            pathOptions={{
              fillColor: isHighlighted
                ? "#233516"
                : isHovered
                  ? "#4a6b3a"
                  : "#7a9e6b",
              color: isHighlighted ? "#233516" : "#5a8040",
              fillOpacity: isHighlighted ? 0.95 : isHovered ? 0.75 : 0.35,
              weight: isHighlighted ? 2 : 1,
            }}
            eventHandlers={{
              mouseover: () => setHoveredId(place.id),
              mouseout: () => setHoveredId(null),
            }}
          >
            {showTooltip && (
              <Tooltip
                permanent={isHighlighted}
                direction="top"
                offset={[0, -10]}
                className="leaflet-tooltip-custom"
              >
                {place.name}
              </Tooltip>
            )}
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
