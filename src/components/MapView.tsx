"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

interface MapBusiness {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  coords: [number, number];
  color: string;
}

interface Props {
  businesses: MapBusiness[];
  center: [number, number];
}

export default function MapView({ businesses, center }: Props) {
  // Fix Leaflet default icon issue in Next.js
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "",
      iconUrl: "",
      shadowUrl: "",
    });
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom={true}
      className="w-full h-[600px] rounded-2xl border border-sand-200 shadow-sm z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {businesses.map((biz) => (
        <CircleMarker
          key={biz.slug}
          center={biz.coords}
          radius={8}
          pathOptions={{
            color: biz.color,
            fillColor: biz.color,
            fillOpacity: 0.8,
            weight: 2,
          }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-semibold text-navy-900 text-sm mb-1">{biz.name}</p>
              <p className="text-xs text-navy-400 mb-2 line-clamp-2">{biz.tagline}</p>
              <Link
                href={`/${biz.category}/${biz.slug}`}
                className="text-xs font-medium text-coral-500 hover:text-coral-600"
              >
                View listing →
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
