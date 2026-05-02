"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  Key, 
  Mail, 
  Smartphone, 
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@tasheen/ui";
import { useCurrentIdentity } from "../hooks/useCurrentIdentity";
import { Modal } from "@/components/ui/Modal";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { ChangeEmailForm } from "./ChangeEmailForm";

export function SecuritySettings() {
  const { data: identity, isLoading } = useCurrentIdentity();
  const [activeModal, setActiveModal] = useState<"password" | "email" | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSuccess = () => {
    setActiveModal(null);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 5000);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-700">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-gold">
          <ShieldCheck className="h-6 w-6" />
          <h1 className="text-[10px] font-bold tracking-[0.3em] uppercase">Security Portal</h1>
        </div>
        <h2 className="font-serif text-4xl text-charcoal leading-tight">
          Security Settings
        </h2>
        <p className="text-stone-400 max-w-2xl text-sm leading-relaxed">
          Manage your credentials, authentication methods, and review active sessions to ensure the uncompromising security of your Tasheen account.
        </p>
      </header>

      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 flex items-center gap-3 text-emerald-800 text-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          Your security credentials have been updated successfully.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Authentication Card */}
        <section className="bg-white border border-stone-100 p-8 lg:p-12 space-y-10 shadow-sm">
          <div className="space-y-2">
            <h3 className="font-serif text-2xl text-charcoal">Authentication</h3>
            <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">Primary Access Methods</p>
          </div>

          <div className="divide-y divide-stone-100">
            {/* Password Item */}
            <div className="py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
              <div className="flex items-start gap-5">
                <div className="mt-1 p-3 bg-stone-50 text-stone-400 rounded-full group-hover:bg-charcoal group-hover:text-gold transition-colors duration-500">
                  <Key className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-charcoal uppercase tracking-wider">Password</p>
                  <p className="text-sm text-stone-400">Regularly updating your password is recommended for optimal security.</p>
                  <p className="text-[10px] text-stone-300 font-medium italic mt-1">Last updated: Oct 2023</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveModal("password")}
                className="self-start sm:self-center border border-stone-200 hover:border-gold hover:text-gold"
              >
                Update Password
              </Button>
            </div>

            {/* Email Item */}
            <div className="py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
              <div className="flex items-start gap-5">
                <div className="mt-1 p-3 bg-stone-50 text-stone-400 rounded-full group-hover:bg-charcoal group-hover:text-gold transition-colors duration-500">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-charcoal uppercase tracking-wider">Email Address</p>
                    {identity?.emailVerified && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-charcoal font-medium">{identity?.email}</p>
                  <p className="text-sm text-stone-400">Used for notifications and account recovery.</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveModal("email")}
                className="self-start sm:self-center border border-stone-200 hover:border-gold hover:text-gold"
              >
                Change Email
              </Button>
            </div>
          </div>
        </section>

        {/* Account Integrity Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recovery Card */}
          <div className="bg-stone-50/50 border border-stone-100 p-8 space-y-6">
             <div className="flex items-center gap-3 text-charcoal">
                <ShieldAlert className="h-5 w-5" />
                <h4 className="font-serif text-xl">Account Integrity</h4>
             </div>
             <p className="text-sm text-stone-500 leading-relaxed">
               Ensure your account remains accessible by verifying your primary contact methods and review recent security alerts.
             </p>
             <button className="text-[10px] font-bold uppercase tracking-widest text-gold hover:text-charcoal transition-colors flex items-center gap-2 group">
               Review Security Log <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>

          {/* Deletion Card */}
          <div className="bg-stone-50/50 border border-stone-100 p-8 space-y-6">
             <div className="flex items-center gap-3 text-burgundy">
                <AlertTriangle className="h-5 w-5" />
                <h4 className="font-serif text-xl">Privacy & Data</h4>
             </div>
             <p className="text-sm text-stone-500 leading-relaxed">
               Manage your data preferences or permanently close your account and remove all personal information.
             </p>
             <button className="text-[10px] font-bold uppercase tracking-widest text-burgundy/60 hover:text-burgundy transition-colors flex items-center gap-2 group">
               Account Deletion <ExternalLink className="h-3 w-3" />
             </button>
          </div>
        </div>
      </div>

      {/* Modals will be integrated here */}
      <Modal 
        isOpen={activeModal === "password"} 
        onClose={() => setActiveModal(null)}
        title="Update Security"
      >
        <ChangePasswordForm onSuccess={handleSuccess} />
      </Modal>

      <Modal 
        isOpen={activeModal === "email"} 
        onClose={() => setActiveModal(null)}
        title="Update Email Address"
      >
        <ChangeEmailForm onSuccess={handleSuccess} />
      </Modal>
    </div>
  );
}
