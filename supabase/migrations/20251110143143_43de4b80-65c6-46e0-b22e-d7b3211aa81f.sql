-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('patient', 'clinician', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create security definer function to check roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add RLS policy for clinicians to view all patients
CREATE POLICY "Clinicians can view all patients"
ON public.patients
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'admin'));

-- Add RLS policy for clinicians to view all alerts
CREATE POLICY "Clinicians can view all alerts"
ON public.alerts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'clinician') OR public.has_role(auth.uid(), 'admin'));

-- Add DELETE policies for symptoms
CREATE POLICY "Users can delete their own symptoms"
ON public.symptoms
FOR DELETE
TO authenticated
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- Add DELETE policies for temperature_readings
CREATE POLICY "Users can delete their own temperature readings"
ON public.temperature_readings
FOR DELETE
TO authenticated
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- Add DELETE policies for chat_messages
CREATE POLICY "Users can delete their own chat messages"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- Add DELETE policies for devices
CREATE POLICY "Users can delete their own devices"
ON public.devices
FOR DELETE
TO authenticated
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- Add DELETE policies for alerts
CREATE POLICY "Users can delete their own alerts"
ON public.alerts
FOR DELETE
TO authenticated
USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));