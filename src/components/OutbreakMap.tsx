import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface OutbreakData {
  location: string;
  cases: number;
  severity: "low" | "medium" | "high";
  coordinates: { lat: number; lng: number };
}

interface OutbreakMapProps {
  height?: string;
  zoom?: number;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#3b82f6";
    default:
      return "#6b7280";
  }
};

const getRadius = (cases: number) => {
  return Math.max(10, Math.min(40, cases / 5));
};

export default function OutbreakMap({ height = "500px", zoom = 5 }: OutbreakMapProps) {
  const [outbreaks, setOutbreaks] = useState<OutbreakData[]>([]);

  useEffect(() => {
    const fetchOutbreakData = async () => {
      const { data: patients, error } = await supabase
        .from("patients")
        .select("location, status")
        .not("location", "is", null);

      if (error || !patients) {
        console.error("Error fetching patient data:", error);
        return;
      }

      // Group patients by location and calculate severity
      const locationMap = new Map<string, { count: number; highRisk: number; lat: number; lng: number }>();
      
      patients.forEach((patient: any) => {
        if (patient.location?.city) {
          const city = patient.location.city;
          const coords = patient.location.coordinates || { lat: 0, lng: 0 };
          
          if (!locationMap.has(city)) {
            locationMap.set(city, { count: 0, highRisk: 0, lat: coords.lat, lng: coords.lng });
          }
          
          const data = locationMap.get(city)!;
          data.count++;
          if (patient.status === "critical" || patient.status === "high") {
            data.highRisk++;
          }
        }
      });

      // Convert to outbreak data
      const outbreakData: OutbreakData[] = Array.from(locationMap.entries()).map(([city, data]) => {
        const riskPercentage = (data.highRisk / data.count) * 100;
        let severity: "low" | "medium" | "high" = "low";
        
        if (riskPercentage > 50 || data.count > 50) severity = "high";
        else if (riskPercentage > 25 || data.count > 20) severity = "medium";

        return {
          location: city,
          cases: data.count,
          severity,
          coordinates: { lat: data.lat, lng: data.lng }
        };
      });

      setOutbreaks(outbreakData);
    };

    fetchOutbreakData();

    // Set up real-time subscription
    const channel = supabase
      .channel('outbreak-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'patients'
      }, () => {
        fetchOutbreakData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ height, width: "100%" }} className="rounded-lg overflow-hidden border-2 border-border">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {outbreaks.map((outbreak, index) => (
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
                <Badge
                  variant={outbreak.severity === "high" ? "destructive" : "secondary"}
                  className="uppercase"
                >
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
