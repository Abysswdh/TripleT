-- ==============================================================================
-- Migration 021: Enable Sandbox / Simulation Contracts & Milestone Execution
-- Allows freelancers to start simulation contracts on dummy projects (is_dummy = true)
-- ==============================================================================

-- 1. Update contracts INSERT policy
DROP POLICY IF EXISTS "Clients can create contracts" ON public.contracts;
CREATE POLICY "Clients can create contracts"
  ON public.contracts FOR INSERT TO authenticated
  WITH CHECK (
    (auth.uid() = client_id) 
    OR (EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = contracts.project_id 
        AND projects.owner_id = auth.uid()
    ))
    OR (EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = contracts.project_id 
        AND projects.is_dummy = true 
        AND contracts.freelancer_id = auth.uid()
    ))
  );

-- 2. Ensure freelancers can view and update their own simulation contracts
DROP POLICY IF EXISTS "Contract participants can view" ON public.contracts;
CREATE POLICY "Contract participants can view"
  ON public.contracts FOR SELECT TO authenticated
  USING (
    (auth.uid() = client_id) 
    OR (auth.uid() = freelancer_id)
    OR (status = 'completed')
  );

DROP POLICY IF EXISTS "Contract participants can update" ON public.contracts;
CREATE POLICY "Contract participants can update"
  ON public.contracts FOR UPDATE TO authenticated
  USING (
    (auth.uid() = client_id) 
    OR (auth.uid() = freelancer_id)
  );

-- 3. Ensure contract_milestones can be inserted and updated by freelancer on dummy contracts
DROP POLICY IF EXISTS "Contract participants can insert milestones" ON public.contract_milestones;
CREATE POLICY "Contract participants can insert milestones"
  ON public.contract_milestones FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = contract_milestones.contract_id
        AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Contract participants can update milestones" ON public.contract_milestones;
CREATE POLICY "Contract participants can update milestones"
  ON public.contract_milestones FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts
      WHERE contracts.id = contract_milestones.contract_id
        AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid())
    )
  );

-- 4. Ensure portfolio_projects can be inserted/managed by the user
DROP POLICY IF EXISTS "Users can manage own portfolio" ON public.portfolio_projects;
CREATE POLICY "Users can manage own portfolio"
  ON public.portfolio_projects FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Ensure milestones on dummy projects can be updated by participating freelancers
DROP POLICY IF EXISTS "Participants can update milestones" ON public.milestones;
CREATE POLICY "Participants can update milestones"
  ON public.milestones FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = milestones.project_id
        AND (
          projects.owner_id = auth.uid() 
          OR projects.freelancer_id = auth.uid()
          OR projects.is_dummy = true
        )
    )
  );

-- 6. Ensure dummy projects can have freelancer_id / status updated
DROP POLICY IF EXISTS "Owners can update own projects" ON public.projects;
CREATE POLICY "Owners can update own projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (
    (auth.uid() = owner_id) 
    OR (is_dummy = true)
  );
