import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";

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
  temperature: z.number().min(95, "Temperature must be at least 95°F").max(108, "Temperature must be at most 108°F").optional(),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  symptoms: z.array(z.object({
    symptom_type: z.string(),
    severity: z.number().min(1).max(5)
  })).min(1, "Please select at least one symptom")
});

export default function SymptomLog() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [temperature, setTemperature] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (patient) {
        setPatientId(patient.id);
      }
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
      const symptomsArray = Object.entries(selectedSymptoms).map(([symptom_type, severity]) => ({
        symptom_type,
        severity
      }));

      const tempValue = temperature ? parseFloat(temperature) : undefined;

      const result = symptomSchema.safeParse({
        temperature: tempValue,
        notes: notes || undefined,
        symptoms: symptomsArray
      });

      if (!result.success) {
        toast.error(result.error.issues[0].message);
        setLoading(false);
        return;
      }

      const symptomsToInsert = result.data.symptoms.map(symptom => ({
        patient_id: patientId,
        symptom_type: symptom.symptom_type,
        severity: symptom.severity,
        notes: result.data.notes || null,
      }));

      const { error: symptomsError } = await supabase
        .from("symptoms")
        .insert(symptomsToInsert);

      if (symptomsError) throw symptomsError;

      if (result.data.temperature) {
        const { error: tempError } = await supabase
          .from("temperature_readings")
          .insert([
            {
              patient_id: patientId,
              temperature: result.data.temperature,
            },
          ]);

        if (tempError) throw tempError;
      }

      toast.success("Symptoms logged successfully");
      setSelectedSymptoms({});
      setNotes("");
      setTemperature("");
    } catch (error: any) {
      toast.error("Failed to log symptoms");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light to-background">
      <div className="container max-w-2xl mx-auto p-4 space-y-4">
        <Button variant="ghost" onClick={() => navigate("/patient")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Log Symptoms
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
                  <div key={symptom} className="space-y-2 p-4 bg-muted/50 rounded-lg animate-slide-up">
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
                          <span className="font-semibold">{selectedSymptoms[symptom]}/5</span>
                        </div>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[selectedSymptoms[symptom]]}
                          onValueChange={(value) => handleSeverityChange(symptom, value)}
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

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <Plus className="h-4 w-4" />
                {loading ? "Saving..." : "Save Symptoms"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
