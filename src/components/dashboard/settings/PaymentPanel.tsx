"use client";

import { Banknote, Building2, CreditCard, Truck, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsConfig } from "@/types";

interface PaymentPanelProps {
  config: SettingsConfig;
  setConfig: (config: SettingsConfig) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}

export function PaymentPanel({ config, setConfig, onSave, saving, saved }: PaymentPanelProps) {
  const methods = config.paymentMethods || [];

  const toggleMethod = (method: 'bank_transfer' | 'pay_on_delivery') => {
    const current = [...methods];
    const idx = current.indexOf(method);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(method);
    }
    setConfig({ ...config, paymentMethods: current });
  };

  const hasBankTransfer = methods.includes('bank_transfer');
  const hasPayOnDelivery = methods.includes('pay_on_delivery');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-950">Payments</h2>
        <p className="text-xs text-slate-500 mt-1">Choose how your customers can pay for orders</p>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Accepted Payment Methods
        </label>

        <div
          onClick={() => toggleMethod('bank_transfer')}
          className={cn(
            "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
            hasBankTransfer
              ? "border-primary bg-primary/5"
              : "border-slate-200 hover:border-slate-300"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            hasBankTransfer ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
          )}>
            <Building2 size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">Bank Transfer</p>
            <p className="text-xs text-slate-500">Customers transfer directly to your bank account</p>
          </div>
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
            hasBankTransfer ? "border-primary bg-primary" : "border-slate-300"
          )}>
            {hasBankTransfer && <Check size={12} className="text-white" />}
          </div>
        </div>

        <div
          onClick={() => toggleMethod('pay_on_delivery')}
          className={cn(
            "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
            hasPayOnDelivery
              ? "border-primary bg-primary/5"
              : "border-slate-200 hover:border-slate-300"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            hasPayOnDelivery ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
          )}>
            <Truck size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">Pay on Delivery</p>
            <p className="text-xs text-slate-500">Customers pay cash when the order is delivered</p>
          </div>
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
            hasPayOnDelivery ? "border-primary bg-primary" : "border-slate-300"
          )}>
            {hasPayOnDelivery && <Check size={12} className="text-white" />}
          </div>
        </div>
      </div>

      {/* Bank Details - only shown when bank transfer is enabled */}
      {hasBankTransfer && (
        <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Banknote size={16} className="text-primary" />
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Bank Account Details
            </label>
          </div>
          <p className="text-xs text-slate-500 -mt-2">
            This info is shown to customers at checkout so they can transfer payment to you.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Bank Name</label>
              <input
                type="text"
                value={config.bankName}
                onChange={(e) => setConfig({ ...config, bankName: e.target.value })}
                placeholder="e.g. GTBank, Access Bank, First Bank"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Account Number</label>
              <input
                type="text"
                value={config.bankAccountNumber}
                onChange={(e) => setConfig({ ...config, bankAccountNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="0123456789"
                maxLength={10}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 mb-1 block">Account Name</label>
              <input
                type="text"
                value={config.bankAccountName}
                onChange={(e) => setConfig({ ...config, bankAccountName: e.target.value })}
                placeholder="e.g. John Doe Enterprises"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {(!config.bankName || !config.bankAccountNumber || !config.bankAccountName) && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              Please fill in all bank details so customers can pay you.
            </p>
          )}
        </div>
      )}

      {methods.length === 0 && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          You need at least one payment method enabled for your store to accept orders.
        </p>
      )}

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={saving || methods.length === 0}
        className={cn(
          "w-full h-11 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
          saved
            ? "bg-emerald-500 text-white"
            : "bg-slate-950 text-white hover:bg-slate-800 active:scale-[0.98]",
          (saving || methods.length === 0) && "opacity-50 cursor-not-allowed"
        )}
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
        {saving ? "Saving..." : saved ? "Saved!" : "Save Payment Settings"}
      </button>
    </div>
  );
}
