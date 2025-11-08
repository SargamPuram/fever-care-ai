import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, ZoomIn, ZoomOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import OutbreakMap, { mockOutbreaks } from "@/components/OutbreakMap";

export default function Heatmap() {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(5);

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
              onClick={() => setZoom(Math.max(4, zoom - 1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="flex items-center px-3 text-sm font-medium">Zoom: {zoom}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(Math.min(10, zoom + 1))}
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
              Interactive geographic visualization of fever cases across India
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OutbreakMap height="600px" zoom={zoom} />

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
