import { useState } from "react";
import { Layout } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import { useSendOtp, useVerifyOtp } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ArrowRight, Smartphone, ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const sendOtpMutation = useSendOtp({
    mutation: {
      onSuccess: (data) => {
        setStep("otp");
        if (data.devOtp) {
          setDevOtp(data.devOtp);
          toast({
            title: "Development Mode",
            description: `Your OTP is ${data.devOtp}. Check console or screen.`,
          });
        }
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Error sending OTP",
          description: err.data?.error || "Please try again.",
        });
      }
    }
  });

  const verifyOtpMutation = useVerifyOtp({
    mutation: {
      onSuccess: (data) => {
        login(data.token);
        toast({
          title: "Welcome back!",
          description: "Successfully authenticated.",
        });
        setLocation("/dashboard");
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Invalid OTP",
          description: err.data?.error || "Please check the code and try again.",
        });
      }
    }
  });

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 5) return;
    sendOtpMutation.mutate({ data: { phone } });
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) return;
    verifyOtpMutation.mutate({ data: { phone, otp } });
  };

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif mb-3">Welcome</h1>
            <p className="text-muted-foreground text-sm">Sign in or create an account to manage your measurements and orders.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-border">
            <AnimatePresence mode="wait">
              {step === "phone" ? (
                <motion.form 
                  key="phone"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handlePhoneSubmit}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={sendOtpMutation.isPending || !phone}
                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendOtpMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
                    {!sendOtpMutation.isPending && <ArrowRight className="w-4 h-4" />}
                  </button>
                </motion.form>
              ) : (
                <motion.form 
                  key="otp"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleOtpSubmit}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Verification Code</label>
                      <button 
                        type="button" 
                        onClick={() => setStep("phone")}
                        className="text-xs text-muted-foreground hover:text-primary underline"
                      >
                        Change number
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all tracking-widest text-lg"
                        required
                        autoFocus
                      />
                    </div>
                    {devOtp && (
                      <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                        Dev mode: OTP is {devOtp}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={verifyOtpMutation.isPending || !otp}
                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyOtpMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Sign In"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}
