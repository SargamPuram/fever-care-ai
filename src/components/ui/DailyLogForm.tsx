import { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DailyLogFormProps {
  episodeId: string;
  dayNumber: number;
  onSuccess: () => void;
}

export function DailyLogForm({
  episodeId,
  dayNumber,
  onSuccess,
}: DailyLogFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    temperature: "",
    tempTime: "morning" as "morning" | "afternoon" | "evening" | "night",
    pulseRate: "",
    symptoms: {
      headache: false,
      bodyPain: false,
      rash: false,
      rashLocation: "",
      bleeding: false,
      bleedingSite: "",
      abdominalPain: false,
      vomiting: false,
      vomitingCount: "",
      breathlessness: false,
      confusion: false,
      nausea: false,
    },
    foodIntake: "normal" as "normal" | "reduced" | "poor" | "nil",
    urineOutput: "normal" as "normal" | "reduced" | "dark" | "bloody",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.temperature) {
      toast.error("Please enter temperature");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:7777/patient/symptoms/daily",
        {
          episodeId,
          dayOfIllness: dayNumber,
          temperature: parseFloat(formData.temperature),
          tempTime: formData.tempTime,
          pulseRate: formData.pulseRate ? parseInt(formData.pulseRate) : null,
          symptoms: {
            ...formData.symptoms,
            vomitingCount: formData.symptoms.vomitingCount
              ? parseInt(formData.symptoms.vomitingCount)
              : null,
          },
          foodIntake: formData.foodIntake,
          urineOutput: formData.urineOutput,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Daily symptoms logged successfully!");
        onSuccess();
        // Reset form
        setFormData({
          temperature: "",
          tempTime: "morning",
          pulseRate: "",
          symptoms: {
            headache: false,
            bodyPain: false,
            rash: false,
            rashLocation: "",
            bleeding: false,
            bleedingSite: "",
            abdominalPain: false,
            vomiting: false,
            vomitingCount: "",
            breathlessness: false,
            confusion: false,
            nausea: false,
          },
          foodIntake: "normal",
          urineOutput: "normal",
        });
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Failed to log symptoms");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Daily Symptom Log - Day {dayNumber}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vitals */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Vitals</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">
                  Temperature (°F) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({ ...formData, temperature: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Time of Measurement</Label>
                <RadioGroup
                  value={formData.tempTime}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, tempTime: value })
                  }
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="morning" id="time-morning" />
                    <Label htmlFor="time-morning" className="cursor-pointer">
                      Morning
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="afternoon" id="time-afternoon" />
                    <Label htmlFor="time-afternoon" className="cursor-pointer">
                      Afternoon
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="evening" id="time-evening" />
                    <Label htmlFor="time-evening" className="cursor-pointer">
                      Evening
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="night" id="time-night" />
                    <Label htmlFor="time-night" className="cursor-pointer">
                      Night
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pulse">Pulse Rate (bpm)</Label>
                <Input
                  id="pulse"
                  type="number"
                  placeholder="72"
                  value={formData.pulseRate}
                  onChange={(e) =>
                    setFormData({ ...formData, pulseRate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Symptoms</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="headache"
                  checked={formData.symptoms.headache}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      symptoms: {
                        ...formData.symptoms,
                        headache: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="headache" className="cursor-pointer">
                  Headache
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="bodyPain"
                  checked={formData.symptoms.bodyPain}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      symptoms: {
                        ...formData.symptoms,
                        bodyPain: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="bodyPain" className="cursor-pointer">
                  Body Pain
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="nausea"
                  checked={formData.symptoms.nausea}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      symptoms: {
                        ...formData.symptoms,
                        nausea: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="nausea" className="cursor-pointer">
                  Nausea
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="abdominalPain"
                  checked={formData.symptoms.abdominalPain}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      symptoms: {
                        ...formData.symptoms,
                        abdominalPain: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="abdominalPain" className="cursor-pointer">
                  Abdominal Pain
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="breathlessness"
                  checked={formData.symptoms.breathlessness}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      symptoms: {
                        ...formData.symptoms,
                        breathlessness: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="breathlessness" className="cursor-pointer">
                  Breathlessness
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confusion"
                  checked={formData.symptoms.confusion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      symptoms: {
                        ...formData.symptoms,
                        confusion: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="confusion" className="cursor-pointer">
                  Confusion
                </Label>
              </div>
            </div>

            {/* Rash */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rash"
                  checked={formData.symptoms.rash}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      symptoms: {
                        ...formData.symptoms,
                        rash: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="rash" className="cursor-pointer">
                  Rash
                </Label>
              </div>
              {formData.symptoms.rash && (
                <div className="pl-6 animate-slide-up">
                  <Label htmlFor="rash-location">Rash Location</Label>
                  <Input
                    id="rash-location"
                    placeholder="e.g., Arms, Chest"
                    value={formData.symptoms.rashLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        symptoms: {
                          ...formData.symptoms,
                          rashLocation: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              )}
            </div>

            {/* Bleeding */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="bleeding"
                  checked={formData.symptoms.bleeding}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      symptoms: {
                        ...formData.symptoms,
                        bleeding: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label
                  htmlFor="bleeding"
                  className="cursor-pointer text-red-600"
                >
                  Bleeding ⚠️
                </Label>
              </div>
              {formData.symptoms.bleeding && (
                <div className="pl-6 animate-slide-up">
                  <Label htmlFor="bleeding-site">Bleeding Site</Label>
                  <Input
                    id="bleeding-site"
                    placeholder="e.g., Nose, Gums"
                    value={formData.symptoms.bleedingSite}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        symptoms: {
                          ...formData.symptoms,
                          bleedingSite: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              )}
            </div>

            {/* Vomiting */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="vomiting"
                  checked={formData.symptoms.vomiting}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      symptoms: {
                        ...formData.symptoms,
                        vomiting: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="vomiting" className="cursor-pointer">
                  Vomiting
                </Label>
              </div>
              {formData.symptoms.vomiting && (
                <div className="pl-6 animate-slide-up">
                  <Label htmlFor="vomiting-count">Number of Episodes</Label>
                  <Input
                    id="vomiting-count"
                    type="number"
                    placeholder="e.g., 3"
                    value={formData.symptoms.vomitingCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        symptoms: {
                          ...formData.symptoms,
                          vomitingCount: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Observations</h3>

            <div className="space-y-4">
              <div>
                <Label>Food Intake</Label>
                <RadioGroup
                  value={formData.foodIntake}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, foodIntake: value })
                  }
                  className="flex flex-wrap gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="food-normal" />
                    <Label htmlFor="food-normal" className="cursor-pointer">
                      Normal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reduced" id="food-reduced" />
                    <Label htmlFor="food-reduced" className="cursor-pointer">
                      Reduced
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poor" id="food-poor" />
                    <Label htmlFor="food-poor" className="cursor-pointer">
                      Poor
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nil" id="food-nil" />
                    <Label htmlFor="food-nil" className="cursor-pointer">
                      Nil
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Urine Output</Label>
                <RadioGroup
                  value={formData.urineOutput}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, urineOutput: value })
                  }
                  className="flex flex-wrap gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="urine-normal" />
                    <Label htmlFor="urine-normal" className="cursor-pointer">
                      Normal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reduced" id="urine-reduced" />
                    <Label htmlFor="urine-reduced" className="cursor-pointer">
                      Reduced
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="urine-dark" />
                    <Label htmlFor="urine-dark" className="cursor-pointer">
                      Dark
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bloody" id="urine-bloody" />
                    <Label
                      htmlFor="urine-bloody"
                      className="cursor-pointer text-red-600"
                    >
                      Bloody ⚠️
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Daily Log"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
