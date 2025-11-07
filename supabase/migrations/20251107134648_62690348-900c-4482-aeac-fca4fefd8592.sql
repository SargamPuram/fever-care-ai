-- Create patients table
CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  age integer,
  gender text,
  phone text,
  location jsonb,
  risk_score integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create temperature_readings table
CREATE TABLE public.temperature_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  temperature numeric(4,1) NOT NULL,
  device_id text,
  recorded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create symptoms table
CREATE TABLE public.symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  symptom_type text NOT NULL,
  severity integer CHECK (severity >= 1 AND severity <= 5),
  notes text,
  recorded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  language text DEFAULT 'en',
  created_at timestamp with time zone DEFAULT now()
);

-- Create devices table for IoT
CREATE TABLE public.devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  device_name text NOT NULL,
  device_type text NOT NULL,
  bluetooth_id text,
  is_connected boolean DEFAULT false,
  last_sync timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temperature_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
CREATE POLICY "Users can view their own patient record"
  ON public.patients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patient record"
  ON public.patients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patient record"
  ON public.patients FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for temperature_readings
CREATE POLICY "Users can view their own temperature readings"
  ON public.temperature_readings FOR SELECT
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own temperature readings"
  ON public.temperature_readings FOR INSERT
  WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- RLS Policies for symptoms
CREATE POLICY "Users can view their own symptoms"
  ON public.symptoms FOR SELECT
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own symptoms"
  ON public.symptoms FOR INSERT
  WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- RLS Policies for alerts
CREATE POLICY "Users can view their own alerts"
  ON public.alerts FOR SELECT
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own alerts"
  ON public.alerts FOR UPDATE
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own chat messages"
  ON public.chat_messages FOR SELECT
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- RLS Policies for devices
CREATE POLICY "Users can view their own devices"
  ON public.devices FOR SELECT
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own devices"
  ON public.devices FOR INSERT
  WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own devices"
  ON public.devices FOR UPDATE
  USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- Create indexes
CREATE INDEX idx_temperature_readings_patient ON public.temperature_readings(patient_id);
CREATE INDEX idx_symptoms_patient ON public.symptoms(patient_id);
CREATE INDEX idx_alerts_patient ON public.alerts(patient_id);
CREATE INDEX idx_chat_messages_patient ON public.chat_messages(patient_id);
CREATE INDEX idx_devices_patient ON public.devices(patient_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for patients updated_at
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();