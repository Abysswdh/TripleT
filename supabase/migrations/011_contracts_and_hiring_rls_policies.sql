-- ============================================================================
-- 011_contracts_and_hiring_rls_policies.sql
-- Fix missing RLS policies for contracts, contract_milestones, escrow, and proposals
-- ============================================================================

-- 1. CONTRACTS: Allow clients and project owners to insert contracts
DROP POLICY IF EXISTS "Clients can create contracts" ON public.contracts;
DROP POLICY IF EXISTS "Contract participants can insert" ON public.contracts;
CREATE POLICY "Clients can create contracts"
  ON public.contracts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = client_id
    OR EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = contracts.project_id 
        AND projects.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Contract participants can delete" ON public.contracts;
CREATE POLICY "Contract participants can delete"
  ON public.contracts FOR DELETE TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

-- 2. CONTRACT MILESTONES: Allow contract participants to insert & update milestones
DROP POLICY IF EXISTS "Contract participants can insert milestones" ON public.contract_milestones;
CREATE POLICY "Contract participants can insert milestones"
  ON public.contract_milestones FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contracts 
      WHERE contracts.id = contract_milestones.contract_id 
        AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.contracts ON contracts.project_id = projects.id
      WHERE contracts.id = contract_milestones.contract_id
        AND projects.owner_id = auth.uid()
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

-- 3. PROPOSALS: Allow project owners (clients) to update proposal status (accept/reject)
DROP POLICY IF EXISTS "Freelancers can update own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Participants can update proposals" ON public.proposals;
CREATE POLICY "Participants can update proposals"
  ON public.proposals FOR UPDATE TO authenticated
  USING (
    auth.uid() = freelancer_id
    OR EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = proposals.project_id 
        AND projects.owner_id = auth.uid()
    )
  );

-- 4. ESCROW TRANSACTIONS: Allow contract participants to insert & update escrow records
DROP POLICY IF EXISTS "Escrow participants can insert" ON public.escrow_transactions;
CREATE POLICY "Escrow participants can insert"
  ON public.escrow_transactions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contracts 
      WHERE contracts.id = escrow_transactions.contract_id 
        AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Escrow participants can update" ON public.escrow_transactions;
CREATE POLICY "Escrow participants can update"
  ON public.escrow_transactions FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts 
      WHERE contracts.id = escrow_transactions.contract_id 
        AND (contracts.client_id = auth.uid() OR contracts.freelancer_id = auth.uid())
    )
  );
