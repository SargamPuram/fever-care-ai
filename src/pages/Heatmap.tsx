import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, ZoomIn, ZoomOut } from "lucide-react";
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

export default function Heatmap() {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(1);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-alert-critical";
      case "medium":
        return "bg-alert-warning";
      case "low":
        return "bg-alert-info";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light to-background">
      <div className="container max-w-6xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/clinician")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Fever Outbreak Heatmap
            </CardTitle>
            <CardDescription>
              Geographic visualization of fever cases across regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="relative bg-muted/30 rounded-lg overflow-hidden"
              style={{ height: "500px", transform: `scale(${zoom})`, transformOrigin: "center" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-medical-light/20 to-transparent">
                {mockOutbreaks.map((outbreak, index) => (
                  <div
                    key={index}
                    className="absolute animate-pulse-slow cursor-pointer group"
                    style={{
                      left: `${(outbreak.coordinates.lng - 68) * 10}%`,
                      top: `${(35 - outbreak.coordinates.lat) * 20}%`,
                    }}
                  >
                    <div
                      className={`w-12 h-12 rounded-full ${getSeverityColor(
                        outbreak.severity
                      )} opacity-60 flex items-center justify-center text-white font-bold`}
                    >
                      {outbreak.cases}
                    </div>
                    <div className="absolute hidden group-hover:block bg-background border border-border rounded-lg p-3 shadow-lg -translate-x-1/2 -translate-y-full mb-2 left-1/2 whitespace-nowrap z-10">
                      <p className="font-semibold">{outbreak.location}</p>
                      <p className="text-sm text-muted-foreground">Cases: {outbreak.cases}</p>
                      <Badge variant={outbreak.severity === "high" ? "destructive" : "secondary"}>
                        {outbreak.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {mockOutbreaks.map((outbreak, index) => (
                <Card key={index} className="hover-lift animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{outbreak.location}</p>
                        <p className="text-2xl font-bold text-primary">{outbreak.cases}</p>
                        <p className="text-sm text-muted-foreground">Active cases</p>
                      </div>
                      <Badge
                        variant={outbreak.severity === "high" ? "destructive" : "secondary"}
                        className="uppercase"
                      >
                        {outbreak.severity}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
