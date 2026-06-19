"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from "react-leaflet";
import type { Place } from "@/lib/server-api";

const GORNO_ALTAYSK: [number, number] = [51.96, 85.96];

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const lats = points.map((p) => p[0]);
    const lngs = points.map((p) => p[1]);
    map.fitBounds(
      [
        [Math.min(...lats) - 0.2, Math.min(...lngs) - 0.2],
        [Math.max(...lats) + 0.2, Math.max(...lngs) + 0.2],
      ],
      { padding: [40, 40] },
    );
  }, [points, map]);
  return null;
}

export default function RouteDetailMapInner({
  places,
  routePolyline,
}: {
  places: Place[];
  routePolyline: [number, number][] | null;
}) {
  const lastId = places[places.length - 1]?.id;

  const placesPoints: [number, number][] = places.map((p) => [p.lat, p.lng]);
  const allPoints: [number, number][] = [GORNO_ALTAYSK, ...placesPoints];

  // Fallback: straight lines if OSRM not yet loaded
  const polylinePoints = routePolyline ?? allPoints;

  return (
    <MapContainer
      center={GORNO_ALTAYSK}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
      zoomControl
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <FitBounds points={allPoints} />

      {/* Маршрут по дорогам */}
      {polylinePoints.length > 1 && (
        <Polyline
          positions={polylinePoints}
          pathOptions={{ color: "#233516", weight: 3, opacity: 0.85 }}
        />
      )}

      {/* СТАРТ — Горно-Алтайск */}
      <CircleMarker
        center={GORNO_ALTAYSK}
        radius={11}
        pathOptions={{ fillColor: "#233516", color: "#fffcf3", fillOpacity: 1, weight: 3 }}
      >
        <Tooltip permanent direction="top" offset={[0, -14]} className="leaflet-tooltip-custom">
          🚩 Горно-Алтайск
        </Tooltip>
      </CircleMarker>

      {/* Промежуточные и финальная точки */}
      {places.map((place, idx) => {
        const isEnd = place.id === lastId;
        return (
          <CircleMarker
            key={place.id}
            center={[place.lat, place.lng]}
            radius={isEnd ? 11 : 8}
            pathOptions={
              isEnd
                ? { fillColor: "#e63946", color: "#fffcf3", fillOpacity: 1, weight: 3 }
                : { fillColor: "#233516", color: "#fff", fillOpacity: 0.95, weight: 2 }
            }
          >
            <Tooltip permanent direction="top" offset={[0, isEnd ? -14 : -11]} className="leaflet-tooltip-custom">
              {isEnd ? `🏁 ${place.name}` : `${idx + 1}. ${place.name}`}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
