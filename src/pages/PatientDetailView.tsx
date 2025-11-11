import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  ArrowLeft,
  Thermometer,
  Heart,
  Droplet,
  Brain,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { MedicationManagement } from "@/components/MedicationManagement";
import { PDFReportGenerator } from "@/components/PDFReportGenerator";

const temperatureHistory = [
  { date: "Jan 15", temp: 98.6 },
  { date: "Jan 16", temp: 99.2 },
  { date: "Jan 17", temp: 100.1 },
  { date: "Jan 18", temp: 101.3 },
  { date: "Jan 19", temp: 102.4 },
  { date: "Jan 20", temp: 101.8 },
  { date: "Today", temp: 100.8 },
];

const PatientDetailView = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setPatient(data);
    } catch (error) {
      console.error("Error fetching patient:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!patient) {
    return <div className="min-h-screen flex items-center justify-center">Patient not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Link to="/clinician">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Patient Details</span>
          </div>
          <div className="ml-auto">
            <PDFReportGenerator patientId={patient.id} patientName={patient.full_name} />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Patient Info */}
          <div className="space-y-6">
            <Card className="p-6 border-2 border-border animate-scale-in">
              <div className="text-center mb-6">
                <div className="h-24 w-24 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-3xl font-bold mx-auto mb-4">
                  SJ
                </div>
                <h2 className="text-2xl font-bold mb-1">{patient.full_name}</h2>
                <p className="text-muted-foreground">Patient ID: {patient.id.slice(0, 8)}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Age</span>
                  <span className="font-medium">{patient.age || "N/A"} years</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium">{patient.gender || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{patient.phone || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{patient.status}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-border animate-scale-in">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-destructive" />
                Vital Signs
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Heart Rate</span>
                    <span className="text-sm font-medium">78 bpm</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Blood Pressure</span>
                    <span className="text-sm font-medium">120/80</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Oxygen Saturation</span>
                    <span className="text-sm font-medium">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-accent/20 bg-accent/5 animate-scale-in">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent" />
                Risk Assessment
              </h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-accent mb-2">68%</div>
                <Badge variant="default">Moderate Risk</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Elevated temperature persisting for 3 days. Recommend continued monitoring and
                follow-up in 6 hours.
              </p>
            </Card>
          </div>

          {/* Right Column - Timeline & Data */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6 border-2 border-border animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Thermometer className="h-6 w-6 text-primary" />
                  Temperature Trend
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">7 days</Button>
                  <Button variant="default" size="sm">14 days</Button>
                  <Button variant="outline" size="sm">30 days</Button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={temperatureHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[97, 103]} stroke="hsl(var(--muted-foreground))" />
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
                    dot={{ fill: "hsl(var(--primary))", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 border-2 border-border animate-slide-up">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Droplet className="h-6 w-6 text-primary" />
                Symptom Timeline
              </h3>
              <div className="space-y-4">
                {[
                  { time: "2 hours ago", symptom: "Headache (Moderate)", icon: Brain },
                  { time: "5 hours ago", symptom: "Body aches reported", icon: Activity },
                  { time: "8 hours ago", symptom: "Fever spike: 102.4°F", icon: Thermometer },
                  { time: "Yesterday", symptom: "Fatigue and chills", icon: Heart },
                ].map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <entry.icon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{entry.symptom}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {entry.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <MedicationManagement patientId={patient.id} />

            <Card className="p-6 border-2 border-border animate-slide-up">
              <h3 className="text-xl font-bold mb-4">Clinician Notes</h3>
              <Textarea
                placeholder="Add notes about patient condition, treatment plan, or follow-up actions..."
                className="min-h-32 mb-4"
              />
              <div className="flex justify-between">
                <Button variant="outline">Save Draft</Button>
                <Button className="bg-gradient-primary">Add Note</Button>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full" size="lg">
                Schedule Follow-up
              </Button>
              <Button className="w-full bg-gradient-primary" size="lg">
                Send Alert to Patient
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDetailView;
