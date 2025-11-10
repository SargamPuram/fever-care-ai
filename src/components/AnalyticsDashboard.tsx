import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Users, AlertTriangle, Activity } from "lucide-react";

interface AnalyticsDashboardProps {
  patients: any[];
}

export const AnalyticsDashboard = ({ patients }: AnalyticsDashboardProps) => {
  // Risk distribution data
  const riskDistribution = [
    {
      name: "High Risk",
      value: patients.filter((p) => p.risk_score > 70).length,
      color: "hsl(var(--destructive))",
    },
    {
      name: "Medium Risk",
      value: patients.filter((p) => p.risk_score >= 40 && p.risk_score <= 70).length,
      color: "hsl(var(--accent))",
    },
    {
      name: "Low Risk",
      value: patients.filter((p) => p.risk_score < 40).length,
      color: "hsl(var(--fever-mild))",
    },
  ];

  // Status breakdown
  const statusData = [
    { status: "Critical", count: patients.filter((p) => p.status === "critical").length },
    { status: "High", count: patients.filter((p) => p.status === "high").length },
    { status: "Moderate", count: patients.filter((p) => p.status === "moderate").length },
    { status: "Mild", count: patients.filter((p) => p.status === "mild").length },
    { status: "Active", count: patients.filter((p) => p.status === "active").length },
  ];

  // Trend data (mock - would be real historical data)
  const trendData = [
    { date: "Mon", patients: 12, highRisk: 3 },
    { date: "Tue", patients: 15, highRisk: 4 },
    { date: "Wed", patients: 18, highRisk: 5 },
    { date: "Thu", patients: 16, highRisk: 4 },
    { date: "Fri", patients: 20, highRisk: 6 },
    { date: "Sat", patients: 17, highRisk: 5 },
    { date: "Sun", patients: patients.length, highRisk: patients.filter((p) => p.risk_score > 70).length },
  ];

  // Age distribution (mock data)
  const ageDistribution = [
    { age: "0-18", count: Math.floor(patients.length * 0.15) },
    { age: "19-35", count: Math.floor(patients.length * 0.30) },
    { age: "36-50", count: Math.floor(patients.length * 0.35) },
    { age: "51-65", count: Math.floor(patients.length * 0.15) },
    { age: "65+", count: Math.floor(patients.length * 0.05) },
  ];

  return (
    <Card className="p-6 border-2 border-border animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Advanced Analytics
        </h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent" />
                Risk Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Status Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Patient Trends
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="patients"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  name="Total Patients"
                  dot={{ fill: "hsl(var(--primary))", r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="highRisk"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={3}
                  name="High Risk"
                  dot={{ fill: "hsl(var(--destructive))", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Age Distribution
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={ageDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="age" type="category" stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
