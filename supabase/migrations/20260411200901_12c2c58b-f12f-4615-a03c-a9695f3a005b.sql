CREATE TABLE public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  is_pinned BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  target_audience TEXT DEFAULT 'all',
  target_course TEXT,
  target_year TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view announcements"
ON public.announcements FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can insert announcements"
ON public.announcements FOR INSERT
WITH CHECK (auth.email() IN (SELECT email FROM public.admin_emails));

CREATE POLICY "Admins can update announcements"
ON public.announcements FOR UPDATE
USING (auth.email() IN (SELECT email FROM public.admin_emails));

CREATE POLICY "Admins can delete announcements"
ON public.announcements FOR DELETE
USING (auth.email() IN (SELECT email FROM public.admin_emails));