import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Plus, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // ✅ ADD THIS
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
  tempTime: z.enum(["morning", "afternoon", "evening", "night"]).optional(), // ✅ ADD THIS
});

type ViewMode = "quick" | "episode" | "daily";

export default function SymptomLog() {
  const navigate = useNavigate();
  const [activeEpisode, setActiveEpisode] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("quick");
  const [selectedSymptoms, setSelectedSymptoms] = useState<
    Record<string, number>
  >({});
  const [notes, setNotes] = useState("");
  const [temperature, setTemperature] = useState("");
  const [tempTime, setTempTime] = useState<string>("morning"); // ✅ ADD THIS
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      navigate("/signin-patient");
      return;
    }

    fetchPatientData();
  }, [navigate]);

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:7777/patient/episode/active",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success && response.data.hasActiveEpisode) {
        setActiveEpisode(response.data.episode);
      }
    } catch (error: any) {
      console.error("Error fetching patient data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/signin-patient");
      }
    }
  };

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
        tempTime: tempTime as any, // ✅ ADD THIS
      });

      if (!result.success) {
        toast.error(result.error.issues[0].message);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:7777/patient/symptoms/quick",
        {
          symptoms: result.data.symptoms,
          temperature: result.data.temperature,
          tempTime: result.data.tempTime, // ✅ ADD THIS
          notes: result.data.notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Symptoms logged successfully");
        setSelectedSymptoms({});
        setNotes("");
        setTemperature("");
        setTempTime("morning"); // ✅ RESET THIS
        fetchPatientData();
      }
    } catch (error: any) {
      console.error("Error:", error);
      if (error.response?.status === 404) {
        toast.error("Please start a fever episode first");
        setViewMode("episode");
      } else {
        toast.error(error.response?.data?.message || "Failed to log symptoms");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light to-background">
      <div className="container max-w-4xl mx-auto p-4 space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/patient-dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

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
                disabled={!activeEpisode}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="font-semibold">Daily Log</div>
                    <div className="text-xs text-gray-500">
                      {activeEpisode
                        ? `Day ${activeEpisode.dayOfIllness}`
                        : "Need active episode"}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Symptom Log Form */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  {/* ✅ ADD THIS: Time of Day Selector */}
                  <div className="space-y-2">
                    <Label>Time of Day</Label>
                    <RadioGroup value={tempTime} onValueChange={setTempTime}>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="morning" id="quick-morning" />
                          <Label
                            htmlFor="quick-morning"
                            className="cursor-pointer"
                          >
                            Morning
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="afternoon"
                            id="quick-afternoon"
                          />
                          <Label
                            htmlFor="quick-afternoon"
                            className="cursor-pointer"
                          >
                            Afternoon
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="evening" id="quick-evening" />
                          <Label
                            htmlFor="quick-evening"
                            className="cursor-pointer"
                          >
                            Evening
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="night" id="quick-night" />
                          <Label
                            htmlFor="quick-night"
                            className="cursor-pointer"
                          >
                            Night
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
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
            onSuccess={(episode) => {
              toast.success("Episode started successfully!");
              setActiveEpisode(episode);
              setTimeout(() => setViewMode("daily"), 2000);
            }}
          />
        )}

        {/* Daily Log Form */}
        {viewMode === "daily" && activeEpisode && (
          <DailyLogForm
            episodeId={activeEpisode._id}
            dayNumber={activeEpisode.dayOfIllness}
            onSuccess={() => {
              toast.success("Daily symptoms logged successfully!");
              fetchPatientData();
            }}
          />
        )}

        {viewMode === "daily" && !activeEpisode && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No active episode. Please start an episode first.
              </p>
              <Button onClick={() => setViewMode("episode")} className="mt-4">
                Start Episode
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
