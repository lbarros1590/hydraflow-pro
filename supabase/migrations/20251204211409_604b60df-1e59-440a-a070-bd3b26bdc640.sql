-- Drop and recreate policies that incorrectly access auth.users table
-- Using auth.jwt() ->> 'email' instead

-- Fix projects SELECT policy
DROP POLICY IF EXISTS "Users can view own or shared projects" ON public.projects;
CREATE POLICY "Users can view own or shared projects" 
ON public.projects 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (EXISTS (
    SELECT 1 FROM project_shares ps
    WHERE ps.project_id = projects.id 
    AND (
      ps.shared_with_user_id = auth.uid() OR 
      ps.shared_with_email = (auth.jwt() ->> 'email')
    )
  ))
);

-- Fix project_files SELECT policy
DROP POLICY IF EXISTS "Users can view own project files" ON public.project_files;
CREATE POLICY "Users can view own project files" 
ON public.project_files 
FOR SELECT 
USING (
  (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_files.project_id AND p.user_id = auth.uid())) OR
  (EXISTS (
    SELECT 1 FROM project_shares ps
    WHERE ps.project_id = project_files.project_id 
    AND (
      ps.shared_with_user_id = auth.uid() OR 
      ps.shared_with_email = (auth.jwt() ->> 'email')
    )
  ))
);

-- Fix project_files INSERT policy
DROP POLICY IF EXISTS "Users can insert own project files" ON public.project_files;
CREATE POLICY "Users can insert own project files" 
ON public.project_files 
FOR INSERT 
WITH CHECK (
  (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_files.project_id AND p.user_id = auth.uid())) OR
  (EXISTS (
    SELECT 1 FROM project_shares ps
    WHERE ps.project_id = project_files.project_id 
    AND ps.permission = 'edit'
    AND (
      ps.shared_with_user_id = auth.uid() OR 
      ps.shared_with_email = (auth.jwt() ->> 'email')
    )
  ))
);

-- Fix project_reviews SELECT policy
DROP POLICY IF EXISTS "Users can view project reviews" ON public.project_reviews;
CREATE POLICY "Users can view project reviews" 
ON public.project_reviews 
FOR SELECT 
USING (
  (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_reviews.project_id AND p.user_id = auth.uid())) OR
  (EXISTS (
    SELECT 1 FROM project_shares ps
    WHERE ps.project_id = project_reviews.project_id 
    AND (
      ps.shared_with_user_id = auth.uid() OR 
      ps.shared_with_email = (auth.jwt() ->> 'email')
    )
  ))
);

-- Fix project_reviews INSERT policy
DROP POLICY IF EXISTS "Users can insert project reviews" ON public.project_reviews;
CREATE POLICY "Users can insert project reviews" 
ON public.project_reviews 
FOR INSERT 
WITH CHECK (
  reviewer_id = auth.uid() AND
  (
    (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_reviews.project_id AND p.user_id = auth.uid())) OR
    (EXISTS (
      SELECT 1 FROM project_shares ps
      WHERE ps.project_id = project_reviews.project_id 
      AND ps.permission IN ('comment', 'edit')
      AND (
        ps.shared_with_user_id = auth.uid() OR 
        ps.shared_with_email = (auth.jwt() ->> 'email')
      )
    ))
  )
);

-- Fix project_shares SELECT policy
DROP POLICY IF EXISTS "Users can view shares for their projects" ON public.project_shares;
CREATE POLICY "Users can view shares for their projects" 
ON public.project_shares 
FOR SELECT 
USING (
  owner_id = auth.uid() OR 
  shared_with_user_id = auth.uid() OR 
  shared_with_email = (auth.jwt() ->> 'email')
);