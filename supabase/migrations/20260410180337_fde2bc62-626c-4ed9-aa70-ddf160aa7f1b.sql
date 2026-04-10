
CREATE TABLE public.grievances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  roll_no TEXT,
  name TEXT,
  course TEXT,
  year TEXT,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  admin_response TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
);

ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own grievances" ON public.grievances
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students insert own grievances" ON public.grievances
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins view all grievances" ON public.grievances
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt()->>'email')
  );

CREATE POLICY "Admins update grievances" ON public.grievances
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admin_emails WHERE email = auth.jwt()->>'email')
  );
