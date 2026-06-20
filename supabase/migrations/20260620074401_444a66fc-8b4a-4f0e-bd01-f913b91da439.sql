
-- 1. admin_emails: restrict SELECT to admins
DROP POLICY IF EXISTS "Anyone can check admin emails" ON public.admin_emails;
CREATE POLICY "Admins can read admin emails"
  ON public.admin_emails FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. notifications: admins only for INSERT
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. storage: scope document uploads to the user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
