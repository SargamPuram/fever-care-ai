import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { Badge } from "@/components/ui/badge";

interface OutbreakData {
  location: string;
  cases: number;
  severity: "low" | "medium" | "high";
  coordinates: { lat: number; lng: number };
}

const mockOutbreaks: OutbreakData[] = [
  { location: "Delhi NCR", cases: 245, severity: "high", coordinates: { lat: 28.7041, lng: 77.1025 } },
  { location: "Mumbai", cases: 189, severity: "medium", coordinates: { lat: 19.076, lng: 72.8777 } },
  { location: "Bangalore", cases: 156, severity: "medium", coordinates: { lat: 12.9716, lng: 77.5946 } },
  { location: "Chennai", cases: 98, severity: "low", coordinates: { lat: 13.0827, lng: 80.2707 } },
  { location: "Kolkata", cases: 123, severity: "medium", coordinates: { lat: 22.5726, lng: 88.3639 } },
];

function MapUpdater({ zoom }: { zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setZoom(zoom);
  }, [zoom, map]);
  
  return null;
}

interface OutbreakMapProps {
  height?: string;
  zoom?: number;
}

export default function OutbreakMap({ height = "500px", zoom = 5 }: OutbreakMapProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "#ef4444"; // red
      case "medium":
        return "#f59e0b"; // amber
      case "low":
        return "#3b82f6"; // blue
      default:
        return "#6b7280"; // gray
    }
  };

  const getRadius = (cases: number) => {
    return Math.max(10, Math.min(40, cases / 5));
  };

  return (
    <div style={{ height, width: "100%" }} className="rounded-lg overflow-hidden border-2 border-border">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <MapUpdater zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mockOutbreaks.map((outbreak, index) => (
          <CircleMarker
            key={index}
            center={[outbreak.coordinates.lat, outbreak.coordinates.lng]}
            radius={getRadius(outbreak.cases)}
            pathOptions={{
              fillColor: getSeverityColor(outbreak.severity),
              color: getSeverityColor(outbreak.severity),
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.6,
            }}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-base mb-1">{outbreak.location}</p>
                <p className="text-sm text-muted-foreground mb-2">Cases: {outbreak.cases}</p>
                <Badge variant={outbreak.severity === "high" ? "destructive" : "secondary"} className="uppercase">
                  {outbreak.severity}
                </Badge>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export { mockOutbreaks };
