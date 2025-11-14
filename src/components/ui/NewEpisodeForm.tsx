"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";

const episodeSchema = z.object({
  priorAntibiotics: z.boolean(),
  antibioticName: z.string().optional(),
  hasDiabetes: z.boolean(),
  immunocompromised: z.boolean(),
  isPregnant: z.boolean(),
  recentTravel: z.boolean(),
  travelLocation: z.string().optional(),
  mosquitoExposure: z.boolean(),
  sickContacts: z.boolean(),
  waterSource: z.enum(["filtered", "tap", "well", "outside"]),
});

interface NewEpisodeFormProps {
  patientId?: string;
  onSuccess?: (episode: any) => void;
}

export function NewEpisodeForm({ patientId, onSuccess }: NewEpisodeFormProps) {
  const [formData, setFormData] = useState({
    priorAntibiotics: false,
    antibioticName: "",
    hasDiabetes: false,
    immunocompromised: false,
    isPregnant: false,
    recentTravel: false,
    travelLocation: "",
    mosquitoExposure: false,
    sickContacts: false,
    waterSource: "filtered" as const,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      const result = episodeSchema.safeParse(formData);

      if (!result.success) {
        toast.error(result.error.issues[0].message);
        setLoading(false);
        return;
      }

      // ============================================
      // TODO: Replace with actual Supabase API call
      // ============================================

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock response data
      const mockEpisode = {
        id: `episode_${Date.now()}`,
        patient_id: patientId || "mock_patient_123",
        status: "active",
        started_at: new Date().toISOString(),
        medical_history: {
          priorAntibiotics: result.data.priorAntibiotics,
          antibioticName: result.data.antibioticName,
          hasDiabetes: result.data.hasDiabetes,
          immunocompromised: result.data.immunocompromised,
          isPregnant: result.data.isPregnant,
        },
        exposure_history: {
          recentTravel: result.data.recentTravel,
          travelLocation: result.data.travelLocation,
          mosquitoExposure: result.data.mosquitoExposure,
          sickContacts: result.data.sickContacts,
          waterSource: result.data.waterSource,
        },
      };

      console.log("📝 Episode Data to Submit:", mockEpisode);

      // ============================================
      // Example Supabase call (to be implemented):
      //
      // const { data, error } = await supabase
      //   .from('fever_episodes')
      //   .insert({
      //     patient_id: patientId,
      //     status: 'active',
      //     ...formData
      //   })
      //   .select()
      //   .single()
      //
      // if (error) throw error
      // ============================================

      setSuccess(true);
      toast.success("Fever episode started successfully");

      if (onSuccess) onSuccess(mockEpisode);

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          priorAntibiotics: false,
          antibioticName: "",
          hasDiabetes: false,
          immunocompromised: false,
          isPregnant: false,
          recentTravel: false,
          travelLocation: "",
          mosquitoExposure: false,
          sickContacts: false,
          waterSource: "filtered",
        });
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("❌ Error:", err);
      toast.error("Failed to start episode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-border animate-scale-in">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Start Fever Tracking Episode
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Fill out your medical and exposure history to begin tracking
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Medical History Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold">Medical History</h3>
              <span className="text-xs text-muted-foreground">
                Required for risk assessment
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="antibiotics"
                  checked={formData.priorAntibiotics}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      priorAntibiotics: checked as boolean,
                    })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="antibiotics"
                    className="cursor-pointer font-medium"
                  >
                    Taken antibiotics in last 7 days?
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Important for dengue diagnosis accuracy
                  </p>
                </div>
              </div>

              {formData.priorAntibiotics && (
                <div className="ml-11 animate-slide-up">
                  <Label htmlFor="antibioticName">Which antibiotic?</Label>
                  <Input
                    id="antibioticName"
                    value={formData.antibioticName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antibioticName: e.target.value,
                      })
                    }
                    placeholder="e.g., Amoxicillin, Ciprofloxacin"
                    className="mt-2"
                  />
                </div>
              )}

              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="diabetes"
                  checked={formData.hasDiabetes}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      hasDiabetes: checked as boolean,
                    })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="diabetes"
                    className="cursor-pointer font-medium"
                  >
                    Do you have diabetes?
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher risk factor for complications
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="immunocompromised"
                  checked={formData.immunocompromised}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      immunocompromised: checked as boolean,
                    })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="immunocompromised"
                    className="cursor-pointer font-medium"
                  >
                    On steroids or immunosuppressive drugs?
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    For transplant, cancer, or autoimmune conditions
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="pregnant"
                  checked={formData.isPregnant}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPregnant: checked as boolean })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="pregnant"
                    className="cursor-pointer font-medium"
                  >
                    Pregnant?
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requires special monitoring and care
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Exposure History Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold">Exposure History</h3>
              <span className="text-xs text-muted-foreground">
                Last 14 days
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="travel"
                  checked={formData.recentTravel}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      recentTravel: checked as boolean,
                    })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="travel"
                    className="cursor-pointer font-medium"
                  >
                    Traveled outside city in last 14 days?
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dengue incubation period is 4-10 days
                  </p>
                </div>
              </div>

              {formData.recentTravel && (
                <div className="ml-11 animate-slide-up">
                  <Label htmlFor="travelLocation">Where did you travel?</Label>
                  <Input
                    id="travelLocation"
                    value={formData.travelLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        travelLocation: e.target.value,
                      })
                    }
                    placeholder="e.g., Mumbai, Kerala, Southeast Asia"
                    className="mt-2"
                  />
                </div>
              )}

              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="mosquito"
                  checked={formData.mosquitoExposure}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      mosquitoExposure: checked as boolean,
                    })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="mosquito"
                    className="cursor-pointer font-medium"
                  >
                    Mosquito bites or dengue cases in neighborhood?
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aedes mosquitoes are most active during daytime
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="contacts"
                  checked={formData.sickContacts}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      sickContacts: checked as boolean,
                    })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="contacts"
                    className="cursor-pointer font-medium"
                  >
                    Contact with anyone having fever?
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dengue outbreaks often affect communities
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="waterSource">Drinking water source?</Label>
                <Select
                  value={formData.waterSource}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, waterSource: value })
                  }
                >
                  <SelectTrigger id="waterSource">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="filtered">
                      Filtered/Boiled water
                    </SelectItem>
                    <SelectItem value="tap">Direct tap water</SelectItem>
                    <SelectItem value="well">Well water</SelectItem>
                    <SelectItem value="outside">Outside food/water</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Helps rule out typhoid and other waterborne infections
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-fever-normal/10 border border-fever-normal/30 rounded-lg animate-slide-up">
              <CheckCircle2 className="h-5 w-5 text-fever-normal flex-shrink-0" />
              <div>
                <p className="font-semibold text-fever-normal">
                  Episode started successfully!
                </p>
                <p className="text-sm text-muted-foreground">
                  Check console for submitted data
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Episode...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Start Tracking →
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
