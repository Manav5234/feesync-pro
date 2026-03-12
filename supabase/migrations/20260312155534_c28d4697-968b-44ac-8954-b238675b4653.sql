-- Add admin_emails-based SELECT policy on documents so admins can view uploaded files
CREATE POLICY "Admins can view all documents via admin_emails"
ON public.documents FOR SELECT
TO authenticated
USING (auth.email() IN (SELECT email FROM admin_emails));
