-- Create test accounts with specific credentials
-- First, we need to insert into auth.users (this will trigger the handle_new_user function)
-- Note: Passwords will need to be set via Supabase Auth API, not directly in SQL

-- For now, let's add a note that these accounts need to be created manually
-- But we can prepare their roles

-- Add a function to check if a user is a member (not admin or treasurer)
CREATE OR REPLACE FUNCTION public.is_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.has_role(_user_id, 'member')
$$;

-- Update profiles table to allow members to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid());

-- Allow members to view their own contributions
-- (This is already handled by existing policy)

-- Update announcements to allow insert by admins
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Admins can insert announcements"
ON public.announcements
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update announcements"
ON public.announcements
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete announcements"
ON public.announcements
FOR DELETE
USING (is_admin(auth.uid()));

-- Update events policies similarly
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can insert events"
ON public.events
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update events"
ON public.events
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete events"
ON public.events
FOR DELETE
USING (is_admin(auth.uid()));

-- Add policy for admins to delete members
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (is_admin(auth.uid()));