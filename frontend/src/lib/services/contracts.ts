import { createClient } from "@/lib/supabase/client";

export interface ContractRecord {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  freelancerName: string;
  totalAmount: number;
  amountDisplay: string;
  status: "In Progress" | "Under Review" | "Completed" | "Disputed";
  progress: number;
  deadline: string;
  startedAt?: string;
  milestones: Array<{
    id: string;
    title: string;
    amount: number;
    status: string;
    dueDate?: string;
  }>;
}

/**
 * Fetch active contracts for a freelancer or client
 */
export async function getUserContracts(userId?: string): Promise<ContractRecord[]> {
  const supabase = createClient();

  let query = supabase
    .from("contracts")
    .select(`
      *,
      project:projects!project_id(id, title),
      client:users!client_id(id, full_name),
      freelancer:users!freelancer_id(id, full_name),
      contract_milestones(*)
    `)
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.or(`client_id.eq.${userId},freelancer_id.eq.${userId}`);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("Error fetching contracts from Supabase:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((c: any) => {
    const statusMap: Record<string, "In Progress" | "Under Review" | "Completed" | "Disputed"> = {
      active: "In Progress",
      under_review: "Under Review",
      completed: "Completed",
      disputed: "Disputed",
    };

    return {
      id: c.id,
      projectId: c.project_id,
      projectTitle: c.project?.title || "Proyek Kontrak Aktif",
      clientName: c.client?.full_name || "Klien Terverifikasi",
      freelancerName: c.freelancer?.full_name || "Freelancer Doable!",
      totalAmount: c.total_amount || 0,
      amountDisplay: c.amount_display || `Rp ${(c.total_amount || 0).toLocaleString("id-ID")}`,
      status: statusMap[c.status] || "In Progress",
      progress: c.progress || 0,
      deadline: c.deadline ? new Date(c.deadline).toLocaleDateString("id-ID") : "10 hari",
      startedAt: c.started_at,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      milestones: (c.contract_milestones || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        amount: m.amount || 0,
        status: m.status || "locked",
        dueDate: m.due_date,
      })),
    };
  });
}
