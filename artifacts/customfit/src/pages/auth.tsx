import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import {
  useLoginPhone,
  ApiError,
  type ErrorResponse,
} from "@workspace/api-client-react";
import { AUTH_DISABLED, useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ArrowRight, Smartphone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [phone, setPhone] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (AUTH_DISABLED) {
      setLocation("/dashboard");
    }
  }, [setLocation]);

  const loginMutation = useLoginPhone({
    mutation: {
      onSuccess: (data) => {
        login(data.token);
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
        setLocation("/dashboard");
      },
      onError: (err) => {
        let description = "Please try again.";
        if (err instanceof ApiError) {
          const data = err.data as ErrorResponse | null;
          description = data?.error ?? err.message;
        } else if (err instanceof Error) {
          description = err.message;
        }
        toast({
          variant: "destructive",
          title: "Could not sign in",
          description,
        });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 5) return;
    loginMutation.mutate({ data: { phone } });
  };

  if (AUTH_DISABLED) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif mb-3">Welcome</h1>
            <p className="text-muted-foreground text-sm">
              Enter your phone number to sign in or create an account.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-border">
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
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
                disabled={loginMutation.isPending || !phone}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
