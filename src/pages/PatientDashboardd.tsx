import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Thermometer,
  MessageSquare,
  Bell,
  User,
  Home,
  FileText,
  TrendingUp,
  AlertTriangle,
  Loader2,
  LogOut,
  X,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { PatientMedications } from "@/components/PatientMedications";
import axios from "axios";
import { toast } from "sonner";

// TypeScript Interfaces
interface User {
  name: string;
  email: string;
}

interface Episode {
  _id: string;
  startedAt: string;
  status: string;
}

interface SymptomLog {
  _id: string;
  dayOfIllness: number;
  temperature: number;
  tempTime: string;
  createdAt: string;
}

interface Prediction {
  primaryDiagnosis: string;
  confidenceScore: number;
  urgency: string;
}

interface Medication {
  _id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  isActive: boolean;
}

interface Alert {
  _id: string;
  message: string;
  severity: string;
  createdAt: string;
}

interface DashboardData {
  user: User;
  hasActiveEpisode: boolean;
  episode?: Episode;
  symptomLogs: SymptomLog[];
  latestPrediction?: Prediction;
  medications: Medication[];
  alerts: Alert[];
}

interface DashboardResponse {
  success: boolean;
  user: User;
  hasActiveEpisode: boolean;
  episode?: Episode;
  symptomLogs?: SymptomLog[];
  latestPrediction?: Prediction;
  medications?: Medication[];
  alerts?: Alert[];
}

interface TemperatureChartData {
  time: string;
  temp: number;
  day: number;
}

interface DayDetailData {
  time: string;
  temp: number;
  tempTime: string;
  createdAt: string;
}

const PatientDashboardd = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [currentTemp, setCurrentTemp] = useState(98.6);
  const [feverStatus, setFeverStatus] = useState<
    "normal" | "mild" | "moderate" | "high"
  >("normal");

  // ✅ NEW: State for drill-down view
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      navigate("/signin-patient");
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("No authentication token found");
        navigate("/signin-patient");
        return;
      }

      const response = await axios.get(
        "http://localhost:7777/patient/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const data: DashboardData = {
          user: response.data.user,
          hasActiveEpisode: response.data.hasActiveEpisode,
          episode: response.data.episode,
          symptomLogs: response.data.symptomLogs || [],
          latestPrediction: response.data.latestPrediction,
          medications: response.data.medications || [],
          alerts: response.data.alerts || [],
        };

        setDashboardData(data);

        if (data.symptomLogs && data.symptomLogs.length > 0) {
          const latest = data.symptomLogs[data.symptomLogs.length - 1];
          setCurrentTemp(latest.temperature);
          calculateFeverStatus(latest.temperature);
        }
      }
    } catch (error: any) {
      console.error("Dashboard error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        navigate("/signin-patient");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to load dashboard"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateFeverStatus = (temp: number) => {
    if (temp > 100.4) {
      setFeverStatus("high");
    } else if (temp > 99.5) {
      setFeverStatus("moderate");
    } else if (temp > 98.6) {
      setFeverStatus("mild");
    } else {
      setFeverStatus("normal");
    }
  };

  const getFeverColor = (): string => {
    switch (feverStatus) {
      case "high":
        return "text-red-600";
      case "moderate":
        return "text-orange-500";
      case "mild":
        return "text-yellow-500";
      default:
        return "text-green-500";
    }
  };

  const handleStartEpisode = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login first");
        navigate("/signin-patient");
        return;
      }

      const response = await axios.post(
        "http://localhost:7777/patient/episode/start",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Fever episode started!");
        fetchDashboardData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start episode");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    toast.success("Logged out successfully");
    navigate("/signin-patient");
  };

  // ✅ LEVEL 1: Overview Chart (One point per day - average/latest)
  const temperatureData: TemperatureChartData[] = useMemo(() => {
    if (!dashboardData?.symptomLogs || dashboardData.symptomLogs.length === 0) {
      return [];
    }

    // Group by day and calculate average temperature
    const dayMap = new Map<number, { temps: number[]; logs: SymptomLog[] }>();

    dashboardData.symptomLogs.forEach((log) => {
      if (!dayMap.has(log.dayOfIllness)) {
        dayMap.set(log.dayOfIllness, { temps: [], logs: [] });
      }
      dayMap.get(log.dayOfIllness)!.temps.push(log.temperature);
      dayMap.get(log.dayOfIllness)!.logs.push(log);
    });

    // Convert to array with average temperature
    return Array.from(dayMap.entries())
      .sort(([dayA], [dayB]) => dayA - dayB)
      .map(([day, data]) => {
        const avgTemp =
          data.temps.reduce((sum, t) => sum + t, 0) / data.temps.length;
        return {
          time: `Day ${day}`,
          temp: parseFloat(avgTemp.toFixed(1)),
          day: day,
        };
      });
  }, [dashboardData?.symptomLogs]);

  // ✅ LEVEL 2: Detailed Chart (All readings for selected day)
  const dayDetailData: DayDetailData[] = useMemo(() => {
    if (!dashboardData?.symptomLogs || selectedDay === null) {
      return [];
    }

    const timeOrder = { morning: 1, afternoon: 2, evening: 3, night: 4 };

    return dashboardData.symptomLogs
      .filter((log) => log.dayOfIllness === selectedDay)
      .sort((a, b) => {
        const timeA = timeOrder[a.tempTime as keyof typeof timeOrder] || 0;
        const timeB = timeOrder[b.tempTime as keyof typeof timeOrder] || 0;
        return timeA - timeB;
      })
      .map((log, index) => {
        const timeLabel = log.tempTime
          ? log.tempTime.charAt(0).toUpperCase() + log.tempTime.slice(1)
          : `Reading ${index + 1}`;

        return {
          time: timeLabel,
          temp: log.temperature,
          tempTime: log.tempTime || "unknown",
          createdAt: log.createdAt,
        };
      });
  }, [dashboardData?.symptomLogs, selectedDay]);

  // Get current day number
  const currentDayOfIllness = useMemo(() => {
    if (!dashboardData?.symptomLogs || dashboardData.symptomLogs.length === 0) {
      return 0;
    }
    return Math.max(
      ...dashboardData.symptomLogs.map((log) => log.dayOfIllness)
    );
  }, [dashboardData?.symptomLogs]);

  // ✅ Handle chart click
  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedDay = data.activePayload[0].payload.day;
      setSelectedDay(clickedDay);
      setShowDayDetail(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground p-6 rounded-b-3xl shadow-elevated">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6" />
              <span className="text-xl font-bold">FieveAI</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => setActiveTab("alerts")}
                />
                {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-xs flex items-center justify-center">
                    {dashboardData.alerts.length}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-1">
            Welcome back,{" "}
            {localStorage.getItem("userName") ||
              dashboardData?.user?.name ||
              "Patient"}
          </h1>
          <p className="text-primary-foreground/80 text-sm">
            {dashboardData?.hasActiveEpisode
              ? "Active fever episode"
              : "Healthy status"}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 -mt-8">
        {activeTab === "home" && (
          <div className="space-y-4">
            {!dashboardData?.hasActiveEpisode && (
              <Card className="p-6 border-2 border-border animate-scale-in">
                <div className="text-center space-y-4">
                  <Thermometer className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      No Active Fever Episode
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start tracking your fever to get AI-powered diagnosis and
                      monitoring
                    </p>
                    <Button
                      onClick={handleStartEpisode}
                      className="bg-gradient-primary"
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      Start Fever Tracking
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {dashboardData?.hasActiveEpisode && (
              <>
                <Card className="p-6 border-2 border-border animate-scale-in hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Current Status</h2>
                    <Badge
                      variant={
                        feverStatus === "normal" ? "secondary" : "destructive"
                      }
                      className="animate-pulse-slow"
                    >
                      {feverStatus === "normal" ? "Healthy" : "Monitoring"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className={`relative ${getFeverColor()}`}>
                      <div className="text-center">
                        <Thermometer className="h-20 w-20 mx-auto mb-2" />
                        <span className="text-3xl font-bold">
                          {currentTemp}°F
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Fever Level</span>
                            <span className="font-medium capitalize">
                              {feverStatus}
                            </span>
                          </div>
                          <Progress
                            value={(currentTemp - 97) * 20}
                            className="h-2"
                          />
                        </div>
                        {dashboardData.latestPrediction && (
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                AI Diagnosis:
                              </span>
                              <Badge className="capitalize">
                                {
                                  dashboardData.latestPrediction
                                    .primaryDiagnosis
                                }
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Confidence:{" "}
                              {dashboardData.latestPrediction.confidenceScore}%
                              | Urgency:{" "}
                              {dashboardData.latestPrediction.urgency}
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {feverStatus === "normal"
                            ? "Your temperature is within normal range."
                            : "Fever detected. Stay hydrated and rest."}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* ✅ LEVEL 1: Overview Temperature Trend */}
                {temperatureData.length > 0 && (
                  <Card className="p-6 border-2 border-border animate-slide-up hover-lift">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Temperature Trend
                      </h2>
                      <Badge variant="outline">Day {currentDayOfIllness}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click on any day to see detailed readings
                    </p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart
                        data={temperatureData}
                        onClick={handleChartClick}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="time"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          domain={[97, 105]}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="temp"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{
                            fill: "hsl(var(--primary))",
                            r: 6,
                            cursor: "pointer",
                          }}
                          activeDot={{ r: 8, cursor: "pointer" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                {/* ✅ LEVEL 2: Day Detail Modal/Card */}
                {showDayDetail && selectedDay !== null && (
                  <Card className="p-6 border-2 border-primary animate-scale-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Day {selectedDay} - Detailed Readings
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowDayDetail(false);
                          setSelectedDay(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {dayDetailData.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={dayDetailData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="hsl(var(--border))"
                            />
                            <XAxis
                              dataKey="time"
                              stroke="hsl(var(--muted-foreground))"
                            />
                            <YAxis
                              domain={[97, 105]}
                              stroke="hsl(var(--muted-foreground))"
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="temp"
                              stroke="hsl(var(--chart-2))"
                              strokeWidth={3}
                              dot={{ fill: "hsl(var(--chart-2))", r: 5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>

                        {/* Reading Details Table */}
                        <div className="mt-4 space-y-2">
                          <h4 className="font-semibold text-sm">
                            All Readings:
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {dayDetailData.map((reading, index) => (
                              <div
                                key={index}
                                className="p-3 bg-muted rounded-lg flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-medium">
                                    {reading.time}
                                  </span>
                                  <span className="text-xs text-muted-foreground block">
                                    {new Date(
                                      reading.createdAt
                                    ).toLocaleTimeString()}
                                  </span>
                                </div>
                                <span className="text-lg font-bold">
                                  {reading.temp}°F
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground text-center">
                        No readings found for Day {selectedDay}
                      </p>
                    )}
                  </Card>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className="p-4 border-2 border-border hover-lift cursor-pointer animate-scale-in"
                    onClick={() => navigate("/symptom-log")}
                  >
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">Log Symptoms</h3>
                    <p className="text-xs text-muted-foreground">
                      Record today's symptoms
                    </p>
                  </Card>
                  <Card
                    className="p-4 border-2 border-border hover-lift cursor-pointer animate-scale-in"
                    onClick={() => navigate("/chatbot")}
                  >
                    <MessageSquare className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">AI Assistant</h3>
                    <p className="text-xs text-muted-foreground">
                      Get health guidance
                    </p>
                  </Card>
                </div>

                {dashboardData.medications.length > 0 && (
                  <PatientMedications medications={dashboardData.medications} />
                )}

                {dashboardData.alerts.length > 0 && (
                  <Card className="p-4 border-2 border-accent/20 bg-accent/5 animate-slide-up">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-accent mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {dashboardData.alerts[0].message}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Severity: {dashboardData.alerts[0].severity}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("alerts")}
                        >
                          View All Alerts
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="animate-slide-up space-y-4">
            <Card className="p-6 border-2 border-border">
              <h2 className="text-xl font-bold mb-4">Your Alerts</h2>
              {dashboardData?.alerts && dashboardData.alerts.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.alerts.map((alert) => (
                    <div key={alert._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant={
                            alert.severity === "critical"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No alerts at this time.</p>
              )}
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elevated">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-3">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "home"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </button>
            <button
              onClick={() => navigate("/symptom-log")}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs font-medium">Logs</span>
            </button>
            <button
              onClick={() => navigate("/chatbot")}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs font-medium">Chat</span>
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors relative ${
                activeTab === "alerts"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bell className="h-5 w-5" />
              {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
                <span className="absolute top-1 right-3 h-2 w-2 bg-destructive rounded-full" />
              )}
              <span className="text-xs font-medium">Alerts</span>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <User className="h-5 w-5" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default PatientDashboardd;
