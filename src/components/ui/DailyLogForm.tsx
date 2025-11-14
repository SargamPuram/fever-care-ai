'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  Calendar, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  CheckCircle2,
  Loader2 
} from 'lucide-react'
import { z } from 'zod'

const dailyLogSchema = z.object({
  temperature: z.number()
    .min(95, 'Temperature must be at least 95°F')
    .max(108, 'Temperature must be at most 108°F'),
  tempTime: z.enum(['morning', 'afternoon', 'evening', 'night']),
  pulseRate: z.number().min(40).max(180).optional(),
  symptoms: z.object({
    headache: z.boolean(),
    bodyPain: z.boolean(),
    rash: z.boolean(),
    rashLocation: z.string().optional(),
    bleeding: z.boolean(),
    bleedingSite: z.string().optional(),
    abdominalPain: z.boolean(),
    vomiting: z.boolean(),
    vomitingCount: z.number().optional(),
    breathlessness: z.boolean(),
    confusion: z.boolean()
  }),
  foodIntake: z.enum(['normal', 'reduced', 'poor']),
  urineOutput: z.enum(['normal', 'reduced', 'dark'])
})

interface DailyLogFormProps {
  patientId?: string
  episodeId?: string
  dayNumber?: number
  onSuccess?: (log: any) => void
}

export function DailyLogForm({ 
  patientId, 
  episodeId,
  dayNumber = 1, 
  onSuccess 
}: DailyLogFormProps) {
  const [formData, setFormData] = useState({
    temperature: '',
    tempTime: 'afternoon' as const,
    pulseRate: '',
    symptoms: {
      headache: false,
      bodyPain: false,
      rash: false,
      rashLocation: '',
      bleeding: false,
      bleedingSite: '',
      abdominalPain: false,
      vomiting: false,
      vomitingCount: '',
      breathlessness: false,
      confusion: false
    },
    foodIntake: 'normal' as const,
    urineOutput: 'normal' as const
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validation
      const result = dailyLogSchema.safeParse({
        temperature: parseFloat(formData.temperature),
        tempTime: formData.tempTime,
        pulseRate: formData.pulseRate ? parseInt(formData.pulseRate) : undefined,
        symptoms: {
          ...formData.symptoms,
          vomitingCount: formData.symptoms.vomitingCount ? parseInt(formData.symptoms.vomitingCount) : undefined
        },
        foodIntake: formData.foodIntake,
        urineOutput: formData.urineOutput
      })

      if (!result.success) {
        toast.error(result.error.issues[0].message)
        setLoading(false)
        return
      }

      // ============================================
      // TODO: Replace with actual Supabase API call
      // ============================================
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockLog = {
        id: `log_${Date.now()}`,
        episode_id: episodeId || 'mock_episode_123',
        patient_id: patientId || 'mock_patient_123',
        day_of_illness: dayNumber,
        ...result.data,
        recorded_at: new Date().toISOString()
      }

      console.log(`📝 Day ${dayNumber} Data to Submit:`, mockLog)

      // ============================================
      // Example Supabase call (to be implemented):
      // 
      // const { data, error } = await supabase
      //   .from('symptom_logs')
      //   .insert(mockLog)
      //   .select()
      //   .single()
      //
      // if (error) throw error
      // ============================================

      setSuccess(true)
      toast.success(`Day ${dayNumber} symptoms logged successfully`)
      
      if (onSuccess) onSuccess(mockLog)
      
      setTimeout(() => setSuccess(false), 2000)

    } catch (err: any) {
      console.error('❌ Error:', err)
      toast.error('Failed to save symptoms')
    } finally {
      setLoading(false)
    }
  }

  const updateSymptom = (key: keyof typeof formData.symptoms, value: any) => {
    setFormData({
      ...formData,
      symptoms: { ...formData.symptoms, [key]: value }
    })
  }

  const hasDangerSigns = formData.symptoms.bleeding || 
                         formData.symptoms.breathlessness || 
                         formData.symptoms.confusion || 
                         formData.symptoms.abdominalPain

  return (
    <Card className="border-2 border-border animate-scale-in">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Day {dayNumber} Symptom Log
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Record your daily fever symptoms and vital signs
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Day {dayNumber}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Vital Signs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Vital Signs
              </h3>
              <span className="text-xs text-muted-foreground">Required</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature" className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Temperature (°F) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="95"
                  max="108"
                  value={formData.temperature}
                  onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                  placeholder="103.5"
                  required
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Normal: 97-99°F | Fever: &gt;100.4°F
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempTime">Time of reading</Label>
                <Select 
                  value={formData.tempTime} 
                  onValueChange={(value: any) => setFormData({...formData, tempTime: value})}
                >
                  <SelectTrigger id="tempTime">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                    <SelectItem value="evening">Evening (5 PM - 9 PM)</SelectItem>
                    <SelectItem value="night">Night (9 PM - 6 AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pulseRate">Pulse Rate (optional)</Label>
              <Input
                id="pulseRate"
                type="number"
                min="40"
                max="180"
                value={formData.pulseRate}
                onChange={(e) => setFormData({...formData, pulseRate: e.target.value})}
                placeholder="80"
              />
              <p className="text-xs text-muted-foreground">Normal: 60-100 bpm</p>
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold">Symptoms Today</h3>
              <span className="text-xs text-muted-foreground">Check all that apply</span>
            </div>
            
            <div className="space-y-3">
              {/* Common Symptoms */}
              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="headache"
                  checked={formData.symptoms.headache}
                  onCheckedChange={(checked) => updateSymptom('headache', checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="headache" className="cursor-pointer font-medium">
                    Severe headache (especially behind eyes)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Retro-orbital pain is common in dengue
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="bodyPain"
                  checked={formData.symptoms.bodyPain}
                  onCheckedChange={(checked) => updateSymptom('bodyPain', checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="bodyPain" className="cursor-pointer font-medium">
                    Body/Joint pain
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Muscle and bone pain ("breakbone fever")
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="rash"
                  checked={formData.symptoms.rash}
                  onCheckedChange={(checked) => updateSymptom('rash', checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="rash" className="cursor-pointer font-medium">
                    Skin rash
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Usually appears on day 3-5
                  </p>
                </div>
              </div>

              {formData.symptoms.rash && (
                <div className="ml-11 animate-slide-up">
                  <Label htmlFor="rashLocation">Where is the rash?</Label>
                  <Input
                    id="rashLocation"
                    value={formData.symptoms.rashLocation}
                    onChange={(e) => updateSymptom('rashLocation', e.target.value)}
                    placeholder="e.g., trunk, limbs, face"
                    className="mt-2"
                  />
                </div>
              )}

              {/* Warning Signs */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-accent" />
                  <h4 className="font-semibold text-accent">Warning Signs</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Seek immediate medical attention if you have any of these:
                </p>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <Checkbox
                  id="bleeding"
                  checked={formData.symptoms.bleeding}
                  onCheckedChange={(checked) => updateSymptom('bleeding', checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="bleeding" className="cursor-pointer font-semibold text-destructive">
                    Bleeding (gums, nose, stool, vomit)
                  </Label>
                  <p className="text-xs text-destructive/70 mt-1">
                    Sign of severe dengue - seek immediate care
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                <Checkbox
                  id="abdominalPain"
                  checked={formData.symptoms.abdominalPain}
                  onCheckedChange={(checked) => updateSymptom('abdominalPain', checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="abdominalPain" className="cursor-pointer font-semibold text-accent">
                    Severe abdominal/stomach pain
                  </Label>
                  <p className="text-xs text-accent/70 mt-1">
                    Can indicate plasma leakage
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="vomiting"
                  checked={formData.symptoms.vomiting}
                  onCheckedChange={(checked) => updateSymptom('vomiting', checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="vomiting" className="cursor-pointer font-medium">
                    Vomiting
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Persistent vomiting is a warning sign
                  </p>
                </div>
              </div>

              {formData.symptoms.vomiting && (
                <div className="ml-11 animate-slide-up">
                  <Label htmlFor="vomitingCount">How many times today?</Label>
                  <Input
                    id="vomitingCount"
                    type="number"
                    min="0"
                    value={formData.symptoms.vomitingCount}
                    onChange={(e) => updateSymptom('vomitingCount', e.target.value)}
                    placeholder="Number of times"
                    className="mt-2"
                  />
                </div>
              )}

              <div className="flex items-start space-x-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <Checkbox
                  id="breathlessness"
                  checked={formData.symptoms.breathlessness}
                  onCheckedChange={(checked) => updateSymptom('breathlessness', checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="breathlessness" className="cursor-pointer font-semibold text-destructive">
                    Difficulty breathing
                  </Label>
                  <p className="text-xs text-destructive/70 mt-1">
                    Emergency sign - call ambulance immediately
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <Checkbox
                  id="confusion"
                  checked={formData.symptoms.confusion}
                  onCheckedChange={(checked) => updateSymptom('confusion', checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="confusion" className="cursor-pointer font-semibold text-destructive">
                    Confusion or altered consciousness
                  </Label>
                  <p className="text-xs text-destructive/70 mt-1">
                    Emergency sign - seek immediate care
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Observations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold">Daily Observations</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foodIntake">Food Intake</Label>
                <Select 
                  value={formData.foodIntake} 
                  onValueChange={(value: any) => setFormData({...formData, foodIntake: value})}
                >
                  <SelectTrigger id="foodIntake">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="reduced">Reduced</SelectItem>
                    <SelectItem value="poor">Poor/None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urineOutput">Urine Output</Label>
                <Select 
                  value={formData.urineOutput} 
                  onValueChange={(value: any) => setFormData({...formData, urineOutput: value})}
                >
                  <SelectTrigger id="urineOutput">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal (light yellow)</SelectItem>
                    <SelectItem value="reduced">Reduced frequency</SelectItem>
                    <SelectItem value="dark">Dark colored</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Danger Sign Alert */}
          {hasDangerSigns && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg animate-slide-up">
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-destructive">Warning Signs Detected!</p>
                <p className="text-sm text-destructive/80 mt-1">
                  You have reported danger signs. Please seek immediate medical attention or call emergency services (108).
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-fever-normal/10 border border-fever-normal/30 rounded-lg animate-slide-up">
              <CheckCircle2 className="h-5 w-5 text-fever-normal flex-shrink-0" />
              <div>
                <p className="font-semibold text-fever-normal">Day {dayNumber} symptoms saved!</p>
                <p className="text-sm text-muted-foreground">Check console for submitted data</p>
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
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save Day {dayNumber} Log
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
