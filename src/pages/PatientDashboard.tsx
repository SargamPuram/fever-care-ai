import { useState } from "react";
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
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

const temperatureData = [
  { time: "6AM", temp: 98.2 },
  { time: "9AM", temp: 98.6 },
  { time: "12PM", temp: 99.1 },
  { time: "3PM", temp: 99.8 },
  { time: "6PM", temp: 100.4 },
  { time: "9PM", temp: 99.6 },
  { time: "Now", temp: 98.9 },
];

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const currentTemp = 98.9;
  const feverStatus = currentTemp > 100.4 ? "high" : currentTemp > 99.5 ? "moderate" : currentTemp > 98.6 ? "mild" : "normal";

  const getFeverColor = () => {
    switch (feverStatus) {
      case "high": return "fever-high";
      case "moderate": return "fever-moderate";
      case "mild": return "fever-mild";
      default: return "fever-normal";
    }
  };

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
            <Bell className="h-6 w-6 animate-pulse-slow" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Welcome back, Sarah</h1>
          <p className="text-primary-foreground/80 text-sm">Last sync: 2 minutes ago</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 -mt-8">
        {activeTab === "home" && (
          <div className="space-y-4">
            {/* Fever Status Card */}
            <Card className="p-6 border-2 border-border animate-scale-in hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Current Status</h2>
                <Badge variant={feverStatus === "normal" ? "secondary" : "destructive"} className="animate-pulse-slow">
                  {feverStatus === "normal" ? "Healthy" : "Monitoring"}
                </Badge>
              </div>
              <div className="flex items-center gap-6">
                <div className={`relative ${getFeverColor()}`}>
                  <Thermometer className="h-24 w-24 animate-pulse-slow" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{currentTemp}°F</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Fever Level</span>
                        <span className="font-medium capitalize">{feverStatus}</span>
                      </div>
                      <Progress
                        value={(currentTemp - 97) * 20}
                        className="h-2"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feverStatus === "normal"
                        ? "Your temperature is within normal range. Keep monitoring."
                        : "Mild fever detected. Stay hydrated and rest. Next check-in in 2 hours."}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Temperature Trend */}
            <Card className="p-6 border-2 border-border animate-slide-up hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Temperature Trend
                </h2>
                <Button variant="ghost" size="sm">24h</Button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[97, 101]} stroke="hsl(var(--muted-foreground))" />
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
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 border-2 border-border hover-lift cursor-pointer animate-scale-in" onClick={() => setActiveTab("log")}>
                <FileText className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Log Symptoms</h3>
                <p className="text-xs text-muted-foreground">Record how you feel</p>
              </Card>
              <Card className="p-4 border-2 border-border hover-lift cursor-pointer animate-scale-in" onClick={() => setActiveTab("chat")}>
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Get health guidance</p>
              </Card>
            </div>

            {/* Alerts */}
            <Card className="p-4 border-2 border-accent/20 bg-accent/5 animate-slide-up">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-accent mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Next Check-in Due</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your next symptom check is scheduled in 2 hours. The AI assistant will send you a reminder.
                  </p>
                  <Button size="sm" variant="outline">Check Now</Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "log" && (
          <div className="animate-slide-up">
            <Card className="p-6 border-2 border-border">
              <h2 className="text-xl font-bold mb-4">Log Your Symptoms</h2>
              <p className="text-muted-foreground">This feature is coming soon...</p>
            </Card>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="animate-slide-up">
            <Card className="p-6 border-2 border-border">
              <h2 className="text-xl font-bold mb-4">AI Health Assistant</h2>
              <p className="text-muted-foreground">Chat interface is coming soon...</p>
            </Card>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="animate-slide-up">
            <Card className="p-6 border-2 border-border">
              <h2 className="text-xl font-bold mb-4">Your Alerts</h2>
              <p className="text-muted-foreground">No new alerts at this time.</p>
            </Card>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="animate-slide-up">
            <Card className="p-6 border-2 border-border">
              <h2 className="text-xl font-bold mb-4">Your Profile</h2>
              <p className="text-muted-foreground">Profile settings coming soon...</p>
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elevated">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-3">
            {[
              { id: "home", icon: Home, label: "Home" },
              { id: "log", icon: FileText, label: "Logs" },
              { id: "chat", icon: MessageSquare, label: "Chat" },
              { id: "alerts", icon: Bell, label: "Alerts" },
              { id: "profile", icon: User, label: "Profile" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default PatientDashboard;
