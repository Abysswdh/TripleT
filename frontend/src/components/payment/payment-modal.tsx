"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  CreditCard,
  Building2,
  QrCode,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  Receipt,
  ExternalLink,
} from "lucide-react";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import {
  PAYMENT_METHODS,
  createEscrowPayment,
  confirmPaymentSuccess,
  type PaymentTransaction,
} from "@/lib/services/payments";
import { useCurrency } from "@/context/currency-context";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  milestoneTitle?: string;
  amount: number;
  onSuccess?: (trx: PaymentTransaction) => void;
}

type PaymentStep = "select_method" | "pay_instruction" | "success";

export function PaymentModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  milestoneTitle,
  amount,
  onSuccess,
}: PaymentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<PaymentStep>("select_method");
  const [selectedMethodId, setSelectedMethodId] = useState<PaymentTransaction["method"]>("bca_va");
  const [activeTransaction, setActiveTransaction] = useState<PaymentTransaction | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const { formatMoney } = useCurrency();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep("select_method");
      setSelectedMethodId("bca_va");
      setActiveTransaction(null);
      setCopied(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleCreateOrder = () => {
    const trx = createEscrowPayment({
      projectId,
      projectTitle,
      milestoneTitle,
      amount,
      method: selectedMethodId,
    });
    setActiveTransaction(trx);
    setStep("pay_instruction");
  };

  const handleSimulateSuccess = () => {
    if (!activeTransaction) return;
    setIsProcessing(true);

    setTimeout(() => {
      const confirmed = confirmPaymentSuccess(activeTransaction.id);
      if (confirmed) {
        setActiveTransaction(confirmed);
        setStep("success");
        if (onSuccess) {
          onSuccess(confirmed);
        }
      }
      setIsProcessing(false);
    }, 1000);
  };

  const handleCopyVa = () => {
    if (activeTransaction?.vaNumber) {
      navigator.clipboard.writeText(activeTransaction.vaNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl transition-all duration-300 max-h-[92vh] flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                <span>REKENING BERSAMA (ESCROW)</span>
                <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.2 text-[10px]">100% AMAN</span>
              </div>
              <h2 className="text-base font-bold text-foreground mt-0.5">Pembayaran Deposit Proyek</h2>
            </div>
          </div>

          <ModalCloseButton onClick={onClose} aria-label="Tutup Pembayaran" />
        </div>

        {/* Invoice Summary Card */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-5 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] text-muted-foreground block">Proyek</span>
              <p className="text-xs font-bold text-foreground truncate">{projectTitle}</p>
              {milestoneTitle && (
                <span className="text-[11px] text-primary font-semibold block">{milestoneTitle}</span>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-muted-foreground block">Total Tagihan</span>
              <p className="text-base font-extrabold text-primary">Rp {amount.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>

        {/* STEP 1: Select Payment Method */}
        {step === "select_method" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Pilih Metode Pembayaran
            </label>

            <div className="grid gap-2.5">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = selectedMethodId === pm.id;
                return (
                  <button
                    key={pm.id}
                    onClick={() => setSelectedMethodId(pm.id)}
                    className={`w-full flex items-center justify-between rounded-2xl p-3.5 text-left border transition-all ${
                      isSelected
                        ? "border-2 border-primary bg-primary/10 text-foreground ring-2 ring-primary/20 shadow-xs"
                        : "border-border/70 bg-card hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border/80 text-lg shadow-xs">
                        {pm.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{pm.name}</p>
                        <p className="text-[11px] text-muted-foreground">{pm.desc}</p>
                      </div>
                    </div>

                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground/40"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/60">
              <button
                onClick={onClose}
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Batal
              </button>
              <button
                onClick={handleCreateOrder}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                <span>Lanjutkan Pembayaran</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Instructions & Sandbox Simulation */}
        {step === "pay_instruction" && activeTransaction && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
            {/* Virtual Account Flow */}
            {activeTransaction.vaNumber && (
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-3 text-center">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  Nomor Virtual Account {activeTransaction.methodName}
                </span>

                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl font-mono font-extrabold text-foreground tracking-wider">
                    {activeTransaction.vaNumber}
                  </span>
                  <button
                    onClick={handleCopyVa}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
                    title="Salin Nomor VA"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {copied && <p className="text-[11px] font-bold text-emerald-600 animate-in fade-in">Nomor VA berhasil disalin!</p>}

                <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>Bayar dalam waktu <strong>23:59:59</strong></span>
                </div>
              </div>
            )}

            {/* QRIS Flow */}
            {activeTransaction.method === "qris" && (
              <div className="rounded-2xl border border-border/80 bg-card p-5 text-center space-y-3">
                <div className="inline-block p-4 rounded-2xl bg-white border border-slate-200 shadow-sm mx-auto">
                  {/* High Quality SVG Simulated QRIS Code */}
                  <svg className="h-44 w-44 mx-auto" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="0" y="0" width="30" height="30" fill="#000" rx="3" />
                    <rect x="5" y="5" width="20" height="20" fill="#fff" rx="1" />
                    <rect x="10" y="10" width="10" height="10" fill="#000" />

                    <rect x="70" y="0" width="30" height="30" fill="#000" rx="3" />
                    <rect x="75" y="5" width="20" height="20" fill="#fff" rx="1" />
                    <rect x="80" y="10" width="10" height="10" fill="#000" />

                    <rect x="0" y="70" width="30" height="30" fill="#000" rx="3" />
                    <rect x="5" y="75" width="20" height="20" fill="#fff" rx="1" />
                    <rect x="10" y="80" width="10" height="10" fill="#000" />

                    <circle cx="50" cy="50" r="12" fill="#254BE3" />
                    <circle cx="50" cy="50" r="6" fill="#fff" />

                    {/* QR Pixel Matrix */}
                    <rect x="36" y="10" width="6" height="6" fill="#000" />
                    <rect x="46" y="15" width="6" height="6" fill="#000" />
                    <rect x="56" y="10" width="6" height="6" fill="#000" />
                    <rect x="10" y="38" width="6" height="6" fill="#000" />
                    <rect x="25" y="44" width="6" height="6" fill="#000" />
                    <rect x="72" y="38" width="6" height="6" fill="#000" />
                    <rect x="85" y="44" width="6" height="6" fill="#000" />
                    <rect x="36" y="72" width="6" height="6" fill="#000" />
                    <rect x="48" y="82" width="6" height="6" fill="#000" />
                    <rect x="62" y="76" width="6" height="6" fill="#000" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-foreground">
                  Scan QRIS menggunakan BCA Mobile, Livin, GoPay, OVO, ShopeePay, atau DANA
                </p>
              </div>
            )}

            {/* Credit Card Flow */}
            {activeTransaction.method === "credit_card" && (
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground uppercase tracking-wide">Nomor Kartu</label>
                  <input
                    type="text"
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wide">Masa Berlaku</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wide">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Simulator Action Card */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold">
                <Sparkles className="h-4 w-4" />
                <span>Simulasi Sandbox Transaksi</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Anda berada di mode simulasi Doable!. Klik tombol di bawah untuk menyimulasikan notifikasi pembayaran sukses dari payment gateway tanpa memotong saldo bank asli.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-border/60">
              <button
                onClick={() => setStep("select_method")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Ganti Metode</span>
              </button>

              <button
                disabled={isProcessing}
                onClick={handleSimulateSuccess}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:brightness-105 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isProcessing ? "Memproses Verifikasi..." : "Simulasikan Pembayaran Sukses"}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment Success Receipt */}
        {step === "success" && activeTransaction && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-foreground">Pembayaran Berhasil Diverifikasi!</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Dana sebesar <strong>{activeTransaction.amountDisplay}</strong> telah berhasil disimpan di Rekening Bersama Doable!.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nomor Referensi</span>
                <span className="font-mono font-bold text-foreground">{activeTransaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metode Pembayaran</span>
                <span className="font-semibold text-foreground">{activeTransaction.methodName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status Rekber</span>
                <span className="font-bold text-emerald-600">Locked in Escrow (Aman)</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center border-t border-border/60">
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                <span>Selesai & Lanjut ke Proyek</span>
                <Check className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
