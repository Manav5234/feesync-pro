-- Add admin_emails-based SELECT policy on profiles so admins can query student profiles
CREATE POLICY "Admins can view all profiles via admin_emails"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.email() IN (SELECT email FROM admin_emails));
