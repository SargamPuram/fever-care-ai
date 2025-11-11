import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pill, Plus, Trash2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface Medication {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  instructions: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  prescribed_date: string;
}

interface MedicationManagementProps {
  patientId: string;
}

export const MedicationManagement = ({ patientId }: MedicationManagementProps) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  const [formData, setFormData] = useState({
    medication_name: "",
    dosage: "",
    frequency: "",
    instructions: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
  });

  useEffect(() => {
    fetchMedications();
  }, [patientId]);

  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("patient_id", patientId)
        .order("prescribed_date", { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error: any) {
      toast.error("Failed to load medications");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const medicationData = {
        ...formData,
        patient_id: patientId,
        prescribed_by: user.id,
        end_date: formData.end_date || null,
      };

      if (editingMed) {
        const { error } = await supabase
          .from("medications")
          .update(medicationData)
          .eq("id", editingMed.id);
        
        if (error) throw error;
        toast.success("Medication updated successfully");
      } else {
        const { error } = await supabase
          .from("medications")
          .insert([medicationData]);
        
        if (error) throw error;
        toast.success("Medication prescribed successfully");
      }

      setDialogOpen(false);
      setEditingMed(null);
      resetForm();
      fetchMedications();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (medId: string) => {
    if (!confirm("Are you sure you want to delete this medication?")) return;

    try {
      const { error } = await supabase
        .from("medications")
        .delete()
        .eq("id", medId);

      if (error) throw error;
      toast.success("Medication deleted");
      fetchMedications();
    } catch (error: any) {
      toast.error("Failed to delete medication");
    }
  };

  const handleToggleActive = async (med: Medication) => {
    try {
      const { error } = await supabase
        .from("medications")
        .update({ is_active: !med.is_active })
        .eq("id", med.id);

      if (error) throw error;
      toast.success(med.is_active ? "Medication deactivated" : "Medication activated");
      fetchMedications();
    } catch (error: any) {
      toast.error("Failed to update medication");
    }
  };

  const resetForm = () => {
    setFormData({
      medication_name: "",
      dosage: "",
      frequency: "",
      instructions: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: "",
    });
  };

  const openEditDialog = (med: Medication) => {
    setEditingMed(med);
    setFormData({
      medication_name: med.medication_name,
      dosage: med.dosage,
      frequency: med.frequency,
      instructions: med.instructions || "",
      start_date: med.start_date,
      end_date: med.end_date || "",
    });
    setDialogOpen(true);
  };

  if (loading) {
    return <div>Loading medications...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Medication Management
            </CardTitle>
            <CardDescription>Prescribe and manage patient medications</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingMed(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Prescribe Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMed ? "Edit Medication" : "Prescribe New Medication"}
                </DialogTitle>
                <DialogDescription>
                  Fill in the medication details below
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medication_name">Medication Name *</Label>
                    <Input
                      id="medication_name"
                      required
                      value={formData.medication_name}
                      onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                      placeholder="e.g., Paracetamol"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage *</Label>
                    <Input
                      id="dosage"
                      required
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="e.g., 500mg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Input
                    id="frequency"
                    required
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    placeholder="e.g., Twice daily, Every 6 hours"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date (Optional)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="e.g., Take with food, Avoid alcohol"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingMed ? "Update" : "Prescribe"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {medications.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No medications prescribed yet</p>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => (
              <Card key={med.id} className={!med.is_active ? "opacity-60" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{med.medication_name}</h4>
                        <Badge variant={med.is_active ? "default" : "secondary"}>
                          {med.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1 text-muted-foreground">
                        <p><span className="font-medium">Dosage:</span> {med.dosage}</p>
                        <p><span className="font-medium">Frequency:</span> {med.frequency}</p>
                        {med.instructions && (
                          <p><span className="font-medium">Instructions:</span> {med.instructions}</p>
                        )}
                        <p>
                          <span className="font-medium">Duration:</span>{" "}
                          {format(new Date(med.start_date), "MMM dd, yyyy")}
                          {med.end_date && ` - ${format(new Date(med.end_date), "MMM dd, yyyy")}`}
                        </p>
                        <p className="text-xs">
                          Prescribed: {format(new Date(med.prescribed_date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(med)}
                      >
                        {med.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(med)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(med.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};