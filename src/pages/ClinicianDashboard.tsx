import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Users,
  AlertTriangle,
  TrendingUp,
  Search,
  Bell,
  Settings,
  MapPin,
  Thermometer,
  Clock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const patients = [
  {
    id: 1,
    name: "Sarah Johnson",
    age: 34,
    currentTemp: 100.8,
    status: "moderate",
    lastSync: "5 min ago",
    riskScore: 68,
  },
  {
    id: 2,
    name: "Michael Chen",
    age: 45,
    currentTemp: 102.4,
    status: "high",
    lastSync: "12 min ago",
    riskScore: 85,
  },
  {
    id: 3,
    name: "Emily Williams",
    age: 28,
    currentTemp: 99.2,
    status: "mild",
    lastSync: "1 hour ago",
    riskScore: 42,
  },
  {
    id: 4,
    name: "David Brown",
    age: 52,
    currentTemp: 98.6,
    status: "normal",
    lastSync: "3 hours ago",
    riskScore: 20,
  },
];

const ClinicianDashboard = () => {
  const navigate = useNavigate();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "high": return "destructive";
      case "moderate": return "default";
      case "mild": return "secondary";
      default: return "outline";
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 70) return "text-destructive";
    if (score > 50) return "text-accent";
    return "text-fever-mild";
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">FieveAI</span>
            </Link>
            <span className="text-muted-foreground">Clinician Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search patients..." className="pl-9 w-64" />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full animate-pulse-slow" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Metrics Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-2 border-border hover-lift animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-primary" />
              <TrendingUp className="h-5 w-5 text-fever-normal" />
            </div>
            <div className="text-3xl font-bold mb-1">247</div>
            <div className="text-sm text-muted-foreground">Total Patients</div>
          </Card>

          <Card className="p-6 border-2 border-accent/20 bg-accent/5 hover-lift animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-8 w-8 text-accent" />
              <Badge variant="destructive">12</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">12</div>
            <div className="text-sm text-muted-foreground">Active Alerts</div>
          </Card>

          <Card className="p-6 border-2 border-destructive/20 bg-destructive/5 hover-lift animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <Thermometer className="h-8 w-8 text-destructive" />
              <span className="text-sm font-medium">+3 today</span>
            </div>
            <div className="text-3xl font-bold mb-1">18</div>
            <div className="text-sm text-muted-foreground">High Risk Cases</div>
          </Card>

          <Card className="p-6 border-2 border-border hover-lift animate-scale-in cursor-pointer" style={{ animationDelay: '0.3s' }} onClick={() => navigate('/heatmap')}>
            <div className="flex items-center justify-between mb-4">
              <MapPin className="h-8 w-8 text-primary" />
              <Button variant="ghost" size="sm" className="text-xs">View Map</Button>
            </div>
            <div className="text-3xl font-bold mb-1">3</div>
            <div className="text-sm text-muted-foreground">Outbreak Zones</div>
          </Card>
        </div>

        {/* Patient List */}
        <Card className="border-2 border-border animate-slide-up">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Monitored Patients</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Filter</Button>
                <Button variant="outline" size="sm">Sort</Button>
                <Button size="sm" className="bg-gradient-primary">Export</Button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {patients.map((patient, index) => (
              <div
                key={patient.id}
                className="p-6 hover:bg-muted/50 transition-colors cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{patient.name}</h3>
                        <Badge variant={getStatusColor(patient.status)} className="capitalize">
                          {patient.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Age: {patient.age}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {patient.lastSync}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{patient.currentTemp}°F</div>
                      <div className="text-xs text-muted-foreground">Current Temp</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-1 ${getRiskColor(patient.riskScore)}`}>
                        {patient.riskScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">Risk Score</div>
                    </div>
                    <Link to={`/clinician/patient/${patient.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Outbreak Heatmap Preview */}
        <Card className="mt-8 p-6 border-2 border-border animate-slide-up">
          <h2 className="text-xl font-bold mb-4">Geographic Outbreak Distribution</h2>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-16 w-16 mx-auto mb-2 opacity-50" />
              <p>Interactive heatmap visualization</p>
              <p className="text-sm">Coming soon with real-time outbreak data</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ClinicianDashboard;
