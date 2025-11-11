-- Create medications table for prescriptions
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  instructions TEXT,
  prescribed_by UUID REFERENCES auth.users(id),
  prescribed_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medication_logs table for tracking when patients take medications
CREATE TABLE public.medication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medications
CREATE POLICY "Users can view their own medications"
ON public.medications
FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can insert medications"
ON public.medications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update medications"
ON public.medications
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete medications"
ON public.medications
FOR DELETE
USING (true);

-- RLS Policies for medication_logs
CREATE POLICY "Users can view their own medication logs"
ON public.medication_logs
FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own medication logs"
ON public.medication_logs
FOR INSERT
WITH CHECK (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own medication logs"
ON public.medication_logs
FOR DELETE
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);

-- Add trigger for medications updated_at
CREATE TRIGGER update_medications_updated_at
BEFORE UPDATE ON public.medications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_medications_patient_id ON public.medications(patient_id);
CREATE INDEX idx_medications_is_active ON public.medications(is_active);
CREATE INDEX idx_medication_logs_medication_id ON public.medication_logs(medication_id);
CREATE INDEX idx_medication_logs_patient_id ON public.medication_logs(patient_id);