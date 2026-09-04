-- Migration 014: Escrow & Freelancer Earnings Synchronization
-- Fixes escrow release transaction inserts, auto-updates freelancer earnings on release, and allows wallet payouts

-- 1. Make contract_id nullable on escrow_transactions to support platform-wide payouts
ALTER TABLE public.escrow_transactions ALTER COLUMN contract_id DROP NOT NULL;

-- 2. Trigger function with SECURITY DEFINER to update freelancer_profiles.total_earnings
CREATE OR REPLACE FUNCTION public.handle_escrow_release_earnings()
RETURNS TRIGGER AS $$
DECLARE
    v_freelancer_id uuid;
BEGIN
    IF NEW.type = 'release' AND NEW.status = 'success' THEN
        -- Find freelancer_id from contract
        IF NEW.contract_id IS NOT NULL THEN
            SELECT freelancer_id INTO v_freelancer_id
            FROM public.contracts
            WHERE id = NEW.contract_id;
        ELSIF NEW.contract_milestone_id IS NOT NULL THEN
            SELECT c.freelancer_id INTO v_freelancer_id
            FROM public.contracts c
            JOIN public.contract_milestones cm ON cm.contract_id = c.id
            WHERE cm.id = NEW.contract_milestone_id;
        END IF;

        IF v_freelancer_id IS NOT NULL THEN
            UPDATE public.freelancer_profiles
            SET total_earnings = COALESCE(total_earnings, 0) + NEW.amount,
                updated_at = NOW()
            WHERE user_id = v_freelancer_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_escrow_release_earnings ON public.escrow_transactions;
CREATE TRIGGER tr_escrow_release_earnings
AFTER INSERT ON public.escrow_transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_escrow_release_earnings();

-- 3. Clean up and re-insert the release for completed Milestone 1 (Contract 5b4b29e8-0533-4a80-9f74-0e1180dc56f4)
DELETE FROM public.escrow_transactions 
WHERE contract_id = '5b4b29e8-0533-4a80-9f74-0e1180dc56f4';

INSERT INTO public.escrow_transactions (
    contract_id,
    contract_milestone_id,
    type,
    amount,
    status,
    notes,
    processed_at
) VALUES (
    '5b4b29e8-0533-4a80-9f74-0e1180dc56f4',
    '171a6671-f78d-4aa1-9c2a-42f3be16c1f7',
    'release',
    200000,
    'success',
    'Milestone 1 selesai & disetujui klien. Dana escrow Rp 200.000 dicairkan ke saldo dompet.',
    NOW()
);

-- Ensure freelancer_profiles.total_earnings is updated to 200000
UPDATE public.freelancer_profiles
SET total_earnings = 200000,
    updated_at = NOW()
WHERE user_id = '128ff045-6252-434d-a4b4-372fe8dd9737';
