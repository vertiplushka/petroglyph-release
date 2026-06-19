"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export default function PlaceMapInner({ lat, lng, name }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={10}
      style={{ height: "100%", width: "100%", borderRadius: "24px" }}
      zoomControl={true}
      attributionControl={false}
      scrollWheelZoom={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

      {/* Outer ring */}
      <CircleMarker
        center={[lat, lng]}
        radius={16}
        pathOptions={{ fillColor: "#233516", color: "#233516", fillOpacity: 0.12, weight: 1.5 }}
      />
      {/* Inner dot */}
      <CircleMarker
        center={[lat, lng]}
        radius={7}
        pathOptions={{ fillColor: "#233516", color: "#fffcf3", fillOpacity: 1, weight: 2.5 }}
      >
        <Tooltip permanent direction="top" offset={[0, -14]} className="place-tooltip">
          <span style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 400, color: "#FFFFFF" }}>
            {name}
          </span>
        </Tooltip>
      </CircleMarker>
    </MapContainer>
  );
}
