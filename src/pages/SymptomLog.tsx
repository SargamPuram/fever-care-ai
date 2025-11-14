import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client"; // COMMENTED OUT - Backend will implement
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Plus, Calendar, FileText, Activity } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { NewEpisodeForm } from "@/components/ui/NewEpisodeForm";
import { DailyLogForm } from "@/components/ui/DailyLogForm";

const symptomTypes = [
  "Headache",
  "Body Ache",
  "Chills",
  "Fatigue",
  "Nausea",
  "Cough",
  "Sore Throat",
  "Loss of Appetite",
];

const symptomSchema = z.object({
  temperature: z
    .number()
    .min(95, "Temperature must be at least 95°F")
    .max(108, "Temperature must be at most 108°F")
    .optional(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
  symptoms: z
    .array(
      z.object({
        symptom_type: z.string(),
        severity: z.number().min(1).max(5),
      })
    )
    .min(1, "Please select at least one symptom"),
});

type ViewMode = "quick" | "episode" | "daily";

export default function SymptomLog() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState<string>("demo_patient_123"); // Mock patient ID
  const [viewMode, setViewMode] = useState<ViewMode>("quick");
  const [selectedSymptoms, setSelectedSymptoms] = useState<
    Record<string, number>
  >({});
  const [notes, setNotes] = useState("");
  const [temperature, setTemperature] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ============================================
    // TODO: Replace with actual Supabase auth check
    // ============================================

    const fetchPatient = async () => {
      // Mock auth check
      console.log("📝 Checking user authentication...");

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock patient data
      const mockPatient = {
        id: "demo_patient_123",
        user_id: "demo_user_123",
        full_name: "Demo Patient",
      };

      console.log("✅ Patient loaded:", mockPatient);
      setPatientId(mockPatient.id);

      // ============================================
      // Example Supabase call (to be implemented):
      //
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) {
      //   navigate("/login");
      //   return;
      // }
      //
      // const { data: patient } = await supabase
      //   .from("patients")
      //   .select("id")
      //   .eq("user_id", user.id)
      //   .single();
      //
      // if (patient) {
      //   setPatientId(patient.id);
      // }
      // ============================================
    };

    fetchPatient();
  }, [navigate]);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) => {
      const updated = { ...prev };
      if (updated[symptom]) {
        delete updated[symptom];
      } else {
        updated[symptom] = 3;
      }
      return updated;
    });
  };

  const handleSeverityChange = (symptom: string, value: number[]) => {
    setSelectedSymptoms((prev) => ({
      ...prev,
      [symptom]: value[0],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;

    setLoading(true);

    try {
      const symptomsArray = Object.entries(selectedSymptoms).map(
        ([symptom_type, severity]) => ({
          symptom_type,
          severity,
        })
      );

      const tempValue = temperature ? parseFloat(temperature) : undefined;

      const result = symptomSchema.safeParse({
        temperature: tempValue,
        notes: notes || undefined,
        symptoms: symptomsArray,
      });

      if (!result.success) {
        toast.error(result.error.issues[0].message);
        setLoading(false);
        return;
      }

      // ============================================
      // TODO: Replace with actual Supabase API calls
      // ============================================

      // Mock submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockSubmission = {
        patient_id: patientId,
        symptoms: result.data.symptoms,
        temperature: result.data.temperature,
        notes: result.data.notes,
        recorded_at: new Date().toISOString(),
      };

      console.log("📝 Quick Symptoms to Submit:", mockSubmission);

      // ============================================
      // Example Supabase calls (to be implemented):
      //
      // const symptomsToInsert = result.data.symptoms.map(symptom => ({
      //   patient_id: patientId,
      //   symptom_type: symptom.symptom_type,
      //   severity: symptom.severity,
      //   notes: result.data.notes || null,
      // }));
      //
      // const { error: symptomsError } = await supabase
      //   .from("symptoms")
      //   .insert(symptomsToInsert);
      //
      // if (symptomsError) throw symptomsError;
      //
      // if (result.data.temperature) {
      //   const { error: tempError } = await supabase
      //     .from("temperature_readings")
      //     .insert([{
      //       patient_id: patientId,
      //       temperature: result.data.temperature,
      //     }]);
      //
      //   if (tempError) throw tempError;
      // }
      // ============================================

      toast.success("Symptoms logged successfully");
      setSelectedSymptoms({});
      setNotes("");
      setTemperature("");
    } catch (error: any) {
      console.error("❌ Error:", error);
      toast.error("Failed to log symptoms");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light to-background">
      <div className="container max-w-4xl mx-auto p-4 space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/patient")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Demo Mode Banner */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">
                  Frontend Demo Mode
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  All forms are using mock data. Database integration will be
                  completed by backend team. Open browser console (F12) to see
                  submitted data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Tracking Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setViewMode("quick")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  viewMode === "quick"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <Plus className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="font-semibold">Quick Log</div>
                    <div className="text-xs text-gray-500">
                      Simple symptom tracking
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setViewMode("episode")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  viewMode === "episode"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="font-semibold">Start Episode</div>
                    <div className="text-xs text-gray-500">
                      Detailed medical history
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setViewMode("daily")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  viewMode === "daily"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="font-semibold">Daily Log</div>
                    <div className="text-xs text-gray-500">
                      Day-by-day tracking
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Symptom Log Form (Original) */}
        {viewMode === "quick" && (
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Symptom Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°F)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder="98.6"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Select Symptoms</Label>
                  {symptomTypes.map((symptom) => (
                    <div
                      key={symptom}
                      className="space-y-2 p-4 bg-muted/50 rounded-lg animate-slide-up"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={symptom}
                          checked={!!selectedSymptoms[symptom]}
                          onCheckedChange={() => handleSymptomToggle(symptom)}
                        />
                        <Label htmlFor={symptom} className="cursor-pointer">
                          {symptom}
                        </Label>
                      </div>
                      {selectedSymptoms[symptom] && (
                        <div className="pl-6 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Severity</span>
                            <span className="font-semibold">
                              {selectedSymptoms[symptom]}/5
                            </span>
                          </div>
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[selectedSymptoms[symptom]]}
                            onValueChange={(value) =>
                              handleSeverityChange(symptom, value)
                            }
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Describe how you're feeling..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4" />
                  {loading ? "Saving..." : "Save Symptoms"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* New Episode Form */}
        {viewMode === "episode" && (
          <NewEpisodeForm
            patientId={patientId}
            onSuccess={(episode) => {
              console.log("✅ Episode created:", episode);
              toast.success("Episode started successfully!");
              // Auto-switch to daily log
              setTimeout(() => setViewMode("daily"), 2000);
            }}
          />
        )}

        {/* Daily Log Form */}
        {viewMode === "daily" && (
          <DailyLogForm
            patientId={patientId}
            episodeId="demo_episode_123"
            dayNumber={1}
            onSuccess={(log) => {
              console.log("✅ Daily log saved:", log);
              toast.success("Daily symptoms logged successfully!");
            }}
          />
        )}
      </div>
    </div>
  );
}
