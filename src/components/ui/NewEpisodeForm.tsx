import { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface NewEpisodeFormProps {
  onSuccess: (episode: any) => void;
}

export function NewEpisodeForm({ onSuccess }: NewEpisodeFormProps) {
  const [loading, setLoading] = useState(false);
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
    waterSource: "filtered" as
      | "filtered"
      | "tap"
      | "well"
      | "outside"
      | "unknown",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:7777/patient/episode/start-with-history",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Episode started successfully!");
        onSuccess(response.data.episode);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Failed to start episode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Start New Fever Episode
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prior Antibiotics */}
          <div className="space-y-4">
            <Label>Have you taken antibiotics recently?</Label>
            <RadioGroup
              value={formData.priorAntibiotics.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, priorAntibiotics: value === "true" })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="antibiotics-yes" />
                <Label htmlFor="antibiotics-yes" className="cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="antibiotics-no" />
                <Label htmlFor="antibiotics-no" className="cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>

            {formData.priorAntibiotics && (
              <div className="pl-6 animate-slide-up">
                <Label htmlFor="antibiotic-name">Antibiotic Name</Label>
                <Input
                  id="antibiotic-name"
                  placeholder="e.g., Amoxicillin"
                  value={formData.antibioticName}
                  onChange={(e) =>
                    setFormData({ ...formData, antibioticName: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          {/* Medical Conditions */}
          <div className="space-y-4">
            <Label>Do you have any of these conditions?</Label>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="diabetes"
                  checked={formData.hasDiabetes}
                  onChange={(e) =>
                    setFormData({ ...formData, hasDiabetes: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="diabetes" className="cursor-pointer">
                  Diabetes
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="immunocompromised"
                  checked={formData.immunocompromised}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      immunocompromised: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="immunocompromised" className="cursor-pointer">
                  Immunocompromised
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pregnant"
                  checked={formData.isPregnant}
                  onChange={(e) =>
                    setFormData({ ...formData, isPregnant: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="pregnant" className="cursor-pointer">
                  Pregnant
                </Label>
              </div>
            </div>
          </div>

          {/* Travel History */}
          <div className="space-y-4">
            <Label>Have you traveled recently (last 2 weeks)?</Label>
            <RadioGroup
              value={formData.recentTravel.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, recentTravel: value === "true" })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="travel-yes" />
                <Label htmlFor="travel-yes" className="cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="travel-no" />
                <Label htmlFor="travel-no" className="cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>

            {formData.recentTravel && (
              <div className="pl-6 animate-slide-up">
                <Label htmlFor="travel-location">Travel Location</Label>
                <Input
                  id="travel-location"
                  placeholder="e.g., Mumbai, Delhi"
                  value={formData.travelLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, travelLocation: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          {/* Exposure */}
          <div className="space-y-4">
            <Label>Exposure History</Label>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mosquito"
                  checked={formData.mosquitoExposure}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mosquitoExposure: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="mosquito" className="cursor-pointer">
                  Mosquito Exposure 🦟
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sick-contacts"
                  checked={formData.sickContacts}
                  onChange={(e) =>
                    setFormData({ ...formData, sickContacts: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="sick-contacts" className="cursor-pointer">
                  Contact with sick people
                </Label>
              </div>
            </div>
          </div>

          {/* Water Source */}
          <div className="space-y-4">
            <Label>Primary Water Source</Label>
            <RadioGroup
              value={formData.waterSource}
              onValueChange={(value: any) =>
                setFormData({ ...formData, waterSource: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="filtered" id="water-filtered" />
                <Label htmlFor="water-filtered" className="cursor-pointer">
                  Filtered/Bottled Water
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tap" id="water-tap" />
                <Label htmlFor="water-tap" className="cursor-pointer">
                  Tap Water
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="well" id="water-well" />
                <Label htmlFor="water-well" className="cursor-pointer">
                  Well Water
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="outside" id="water-outside" />
                <Label htmlFor="water-outside" className="cursor-pointer">
                  Outside Water
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unknown" id="water-unknown" />
                <Label htmlFor="water-unknown" className="cursor-pointer">
                  Unknown
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Episode...
              </>
            ) : (
              "Start Episode"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
