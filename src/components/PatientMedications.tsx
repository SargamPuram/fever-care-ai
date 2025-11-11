import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pill, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Medication {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  instructions: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

interface MedicationLog {
  id: string;
  medication_id: string;
  taken_at: string;
  notes: string | null;
}

export const PatientMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [logNotes, setLogNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchMedicationsAndLogs();
  }, []);

  const fetchMedicationsAndLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: patientData } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!patientData) return;

      const [medsResult, logsResult] = await Promise.all([
        supabase
          .from("medications")
          .select("*")
          .eq("patient_id", patientData.id)
          .eq("is_active", true)
          .order("prescribed_date", { ascending: false }),
        supabase
          .from("medication_logs")
          .select("*")
          .eq("patient_id", patientData.id)
          .order("taken_at", { ascending: false })
      ]);

      if (medsResult.error) throw medsResult.error;
      if (logsResult.error) throw logsResult.error;

      setMedications(medsResult.data || []);
      setLogs(logsResult.data || []);
    } catch (error: any) {
      toast.error("Failed to load medications");
    } finally {
      setLoading(false);
    }
  };

  const handleLogMedication = async () => {
    if (!selectedMed) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: patientData } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!patientData) throw new Error("Patient profile not found");

      const { error } = await supabase
        .from("medication_logs")
        .insert([
          {
            medication_id: selectedMed.id,
            patient_id: patientData.id,
            notes: logNotes || null,
          },
        ]);

      if (error) throw error;

      toast.success("Medication logged successfully");
      setDialogOpen(false);
      setLogNotes("");
      setSelectedMed(null);
      fetchMedicationsAndLogs();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getTodaysLogs = (medicationId: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    return logs.filter(
      (log) =>
        log.medication_id === medicationId &&
        format(new Date(log.taken_at), "yyyy-MM-dd") === today
    );
  };

  if (loading) {
    return <div>Loading medications...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          My Medications
        </CardTitle>
        <CardDescription>Track your prescribed medications</CardDescription>
      </CardHeader>
      <CardContent>
        {medications.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No active medications at this time
          </p>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => {
              const todaysLogs = getTodaysLogs(med.id);
              const hasTakenToday = todaysLogs.length > 0;

              return (
                <Card key={med.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{med.medication_name}</h4>
                          {hasTakenToday && (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Taken Today
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p>
                            <span className="font-medium">Dosage:</span> {med.dosage}
                          </p>
                          <p>
                            <span className="font-medium">Frequency:</span> {med.frequency}
                          </p>
                          {med.instructions && (
                            <p>
                              <span className="font-medium">Instructions:</span>{" "}
                              {med.instructions}
                            </p>
                          )}
                          {todaysLogs.length > 0 && (
                            <p className="text-xs pt-1">
                              Last taken: {format(new Date(todaysLogs[0].taken_at), "h:mm a")}
                            </p>
                          )}
                        </div>
                      </div>
                      <Dialog
                        open={dialogOpen && selectedMed?.id === med.id}
                        onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (!open) {
                            setSelectedMed(null);
                            setLogNotes("");
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedMed(med)}
                            variant={hasTakenToday ? "outline" : "default"}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Log Dose
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Log Medication</DialogTitle>
                            <DialogDescription>
                              Recording that you took {med.medication_name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Notes (Optional)
                              </label>
                              <Textarea
                                value={logNotes}
                                onChange={(e) => setLogNotes(e.target.value)}
                                placeholder="Any side effects or notes..."
                                rows={3}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setDialogOpen(false);
                                  setSelectedMed(null);
                                  setLogNotes("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleLogMedication}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};