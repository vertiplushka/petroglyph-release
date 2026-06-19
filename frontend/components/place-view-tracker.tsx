"use client";

import { useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "/v1";

export function PlaceViewTracker({ placeId }: { placeId: number }) {
  useEffect(() => {
    fetch(`${API}/analytics/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId, eventType: "view" }),
    }).catch(() => {});
  }, [placeId]);

  return null;
}
