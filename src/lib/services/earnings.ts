import { createClient } from "@/lib/supabase/client";

export interface EscrowTransactionItem {
  id: string;
  contractId: string;
  type: "hold" | "release" | "payout" | "refund";
  amount: number;
  amountDisplay: string;
  status: "pending" | "success" | "failed";
  projectTitle: string;
  notes?: string;
  date: string;
}

export interface EarningsSummary {
  availableBalance: number;
  availableBalanceDisplay: string;
  inEscrowBalance: number;
  inEscrowBalanceDisplay: string;
  totalWithdrawn: number;
  totalWithdrawnDisplay: string;
  transactions: EscrowTransactionItem[];
}

/**
 * Get earnings summary and transactions for a freelancer
 */
export async function getFreelancerEarnings(userId?: string): Promise<EarningsSummary> {
  const supabase = createClient();
  let targetUserId = userId;

  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    targetUserId = user?.id;
  }

  if (!targetUserId) {
    return {
      availableBalance: 0,
      availableBalanceDisplay: "Rp 0",
      inEscrowBalance: 0,
      inEscrowBalanceDisplay: "Rp 0",
      totalWithdrawn: 0,
      totalWithdrawnDisplay: "Rp 0",
      transactions: [],
    };
  }

  // Fetch contracts of this freelancer with milestones and escrow transactions
  const { data: contracts } = await supabase
    .from("contracts")
    .select(`
      id,
      total_amount,
      status,
      project:projects!project_id(title),
      contract_milestones(*),
      escrow_transactions(*)
    `)
    .eq("freelancer_id", targetUserId);

  let inEscrow = 0;
  let available = 0;
  let totalWithdrawn = 0;
  const txList: EscrowTransactionItem[] = [];

  if (contracts && contracts.length > 0) {
    for (const c of contracts) {
      const proj = c.project as unknown as { title?: string } | undefined;
      const projTitle = proj?.title || "Project Milestone";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txs = (c.escrow_transactions as any[]) || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cms = (c.contract_milestones as any[]) || [];

      // Calculate remaining inEscrow from active milestones not yet completed
      if (c.status === "active") {
        for (const cm of cms) {
          if (cm.status === "locked" || cm.status === "in_progress" || cm.status === "submitted") {
            inEscrow += Number(cm.amount) || 0;
          }
        }
      }

      for (const tx of txs) {
        const isRelease = tx.type === "release";
        const isPayout = tx.type === "payout";
        const isHold = tx.type === "hold";

        if (isRelease && tx.status === "success") {
          available += Number(tx.amount) || 0;
        } else if (isHold && tx.status === "pending") {
          // Explicit hold transaction if present
          if (cms.length === 0) {
            inEscrow += Number(tx.amount) || 0;
          }
        } else if (isPayout && tx.status === "success") {
          totalWithdrawn += Number(tx.amount) || 0;
        }

        txList.push({
          id: tx.id,
          contractId: tx.contract_id,
          type: tx.type,
          amount: tx.amount,
          amountDisplay: `${isPayout ? "-" : "+"}Rp ${Number(tx.amount || 0).toLocaleString("id-ID")}`,
          status: tx.status,
          projectTitle: projTitle,
          notes: tx.notes,
          date: new Date(tx.processed_at || tx.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        });
      }
    }
  }

  // Net available balance is released earnings minus withdrawals
  available = Math.max(0, available - totalWithdrawn);

  // Check if freelancer profile has recorded total_earnings in database
  const { data: flProfile } = await supabase
    .from("freelancer_profiles")
    .select("total_earnings")
    .eq("user_id", targetUserId)
    .maybeSingle();

  const profileEarnings = Number(flProfile?.total_earnings) || 0;
  if (profileEarnings > available) {
    available = profileEarnings - totalWithdrawn;
  }

  return {
    availableBalance: available,
    availableBalanceDisplay: `Rp ${available.toLocaleString("id-ID")}`,
    inEscrowBalance: inEscrow,
    inEscrowBalanceDisplay: `Rp ${inEscrow.toLocaleString("id-ID")}`,
    totalWithdrawn: totalWithdrawn,
    totalWithdrawnDisplay: `Rp ${totalWithdrawn.toLocaleString("id-ID")}`,
    transactions: txList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  };
}

/**
 * Request withdrawal to bank account
 */
export async function requestPayout(params: {
  amount: number;
  bankName: string;
  accountNumber: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Find user's contract if available (nullable in migration 014)
  const { data: latestContract } = await supabase
    .from("contracts")
    .select("id")
    .eq("freelancer_id", user?.id || "")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Record payout in escrow_transactions
  const { error } = await supabase.from("escrow_transactions").insert({
    contract_id: latestContract?.id || null,
    type: "payout",
    amount: params.amount,
    status: "success",
    notes: `Pencairan dana ke ${params.bankName} (${params.accountNumber}) a.n ${user?.user_metadata?.full_name || "User"}`,
    processed_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error requesting payout:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
