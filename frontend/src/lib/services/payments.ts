import { addNotification } from "./notifications";

export interface PaymentTransaction {
  id: string;
  projectId: string;
  projectTitle: string;
  milestoneTitle?: string;
  amount: number;
  amountDisplay: string;
  method: "bca_va" | "mandiri_va" | "bri_va" | "qris" | "credit_card" | "wallet";
  methodName: string;
  status: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  paidAt?: string;
  vaNumber?: string;
  qrCodeUrl?: string;
  payerName: string;
}

const PAYMENTS_STORAGE_KEY = "doable_escrow_payments";

export const PAYMENT_METHODS = [
  {
    id: "bca_va" as const,
    name: "BCA Virtual Account",
    category: "Virtual Account",
    icon: "🏦",
    desc: "Verifikasi instan 24/7 otomatis",
    generateVa: () => `8808${Math.floor(1000000000 + Math.random() * 9000000000)}`,
  },
  {
    id: "mandiri_va" as const,
    name: "Mandiri Virtual Account",
    category: "Virtual Account",
    icon: "🏛️",
    desc: "Transfer via Livin' by Mandiri atau ATM",
    generateVa: () => `8908${Math.floor(1000000000 + Math.random() * 9000000000)}`,
  },
  {
    id: "bri_va" as const,
    name: "BRI Virtual Account (BRIVA)",
    category: "Virtual Account",
    icon: "🏦",
    desc: "Transfer via BRImo atau ATM",
    generateVa: () => `8008${Math.floor(1000000000 + Math.random() * 9000000000)}`,
  },
  {
    id: "qris" as const,
    name: "QRIS Instant (GoPay, OVO, ShopeePay, DANA)",
    category: "E-Wallet & QRIS",
    icon: "📱",
    desc: "Scan langsung dari semua aplikasi perbankan & e-wallet",
  },
  {
    id: "credit_card" as const,
    name: "Kartu Kredit / Debit Online",
    category: "Card Payment",
    icon: "💳",
    desc: "Visa, Mastercard, JCB dengan proteksi 3D-Secure",
  },
  {
    id: "wallet" as const,
    name: "Doable! Escrow Balance",
    category: "Saldo Platform",
    icon: "⚡",
    desc: "Potong langsung dari saldo akun Doable!",
  },
];

export function getSavedPayments(): PaymentTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Failed to read payments:", e);
    return [];
  }
}

export function createEscrowPayment(params: {
  projectId: string;
  projectTitle: string;
  milestoneTitle?: string;
  amount: number;
  method: PaymentTransaction["method"];
  payerName?: string;
}): PaymentTransaction {
  const methodObj = PAYMENT_METHODS.find((m) => m.id === params.method) || PAYMENT_METHODS[0];
  const vaNumber = "generateVa" in methodObj && typeof methodObj.generateVa === "function" ? methodObj.generateVa() : undefined;

  const trx: PaymentTransaction = {
    id: `TRX-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    projectId: params.projectId,
    projectTitle: params.projectTitle,
    milestoneTitle: params.milestoneTitle,
    amount: params.amount,
    amountDisplay: `Rp ${params.amount.toLocaleString("id-ID")}`,
    method: params.method,
    methodName: methodObj.name,
    status: "pending",
    createdAt: new Date().toISOString(),
    vaNumber,
    payerName: params.payerName || "Klien Doable!",
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getSavedPayments();
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify([trx, ...existing]));
    } catch (e) {
      console.warn("Failed to save payment:", e);
    }
  }

  return trx;
}

export function confirmPaymentSuccess(trxId: string): PaymentTransaction | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = getSavedPayments();
    let updatedTrx: PaymentTransaction | null = null;

    const updated = existing.map((t) => {
      if (t.id === trxId) {
        updatedTrx = {
          ...t,
          status: "paid",
          paidAt: new Date().toISOString(),
        };
        return updatedTrx;
      }
      return t;
    });

    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(updated));

    // Send app notification
    if (updatedTrx) {
      const tx = updatedTrx as PaymentTransaction;
      addNotification({
        title: "Deposit Rekber Berhasil Disimpan 🛡️",
        message: `Dana ${tx.amountDisplay} untuk proyek '${tx.projectTitle}' telah aman tersimpan di rekening bersama Doable!.`,
        type: "payment",
        linkUrl: `/client/projects/${tx.projectId}`,
        roleTarget: "customer",
      });
    }

    window.dispatchEvent(new CustomEvent("payment-completed", { detail: updatedTrx }));
    return updatedTrx;
  } catch (e) {
    console.warn("Failed to confirm payment:", e);
    return null;
  }
}
