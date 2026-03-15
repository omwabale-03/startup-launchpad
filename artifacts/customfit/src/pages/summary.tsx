import { useEffect } from "react";
import { Layout } from "@/components/layout";
import { RequireAuth, getAuthHeaders } from "@/hooks/use-auth";
import { useCreateOrder } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Loader2, Scissors } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";

function SummaryContent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const measurements = JSON.parse(localStorage.getItem('customfit_measurements') || '{}');
  const config = JSON.parse(localStorage.getItem('customfit_customization') || '{}');

  useEffect(() => {
    if (!measurements.id || !config.fabricType) {
      setLocation("/dashboard");
    }
  }, [measurements, config, setLocation]);

  const orderMutation = useCreateOrder({
    request: getAuthHeaders(),
    mutation: {
      onSuccess: () => {
        // Clear local storage drafts
        localStorage.removeItem('customfit_measurements');
        localStorage.removeItem('customfit_customization');
        
        toast({
          title: "Order Placed Successfully",
          description: "We're starting production on your custom pants!",
        });
        setLocation("/dashboard");
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Failed to place order",
          description: err.data?.error || "Please try again.",
        });
      }
    }
  });

  const handleConfirm = () => {
    orderMutation.mutate({
      data: {
        fabricType: config.fabricType,
        color: config.color,
        pocketStyle: config.pocketStyle,
        occasion: config.occasion,
        measurementId: measurements.id,
      }
    });
  };

  if (!measurements.id || !config.fabricType) return null;

  return (
    <Layout>
      <div className="flex-1 bg-background">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-12 text-sm font-medium justify-center">
            <span className="w-8 h-8 rounded-full bg-secondary text-primary flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <div className="w-8 h-px bg-border" />
            <span className="w-8 h-8 rounded-full bg-secondary text-primary flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <div className="w-8 h-px bg-border" />
            <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">3</span>
            <span className="text-primary">Review</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-border shadow-2xl shadow-black/5 rounded-3xl overflow-hidden"
          >
            <div className="p-8 md:p-12 text-center border-b border-border bg-secondary/20">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Scissors className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-serif mb-2">Order Summary</h1>
              <p className="text-muted-foreground">Please review your custom details before finalizing.</p>
            </div>

            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                {/* Design Specs */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Design Specifications</h3>
                  <ul className="space-y-4 text-sm">
                    <li className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Fabric</span>
                      <span className="font-medium capitalize">{config.fabricType.replace('-', ' ')}</span>
                    </li>
                    <li className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Color</span>
                      <span className="font-medium capitalize">{config.color}</span>
                    </li>
                    <li className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Pockets</span>
                      <span className="font-medium capitalize">{config.pocketStyle.replace('-', ' ')}</span>
                    </li>
                    <li className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Occasion</span>
                      <span className="font-medium capitalize">{config.occasion}</span>
                    </li>
                  </ul>
                </div>

                {/* Measurements */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Your Measurements</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                    <div className="bg-background rounded-lg p-3 border border-border/50">
                      <span className="text-muted-foreground text-xs block mb-1">Waist</span>
                      <span className="font-medium">{measurements.waist}"</span>
                    </div>
                    <div className="bg-background rounded-lg p-3 border border-border/50">
                      <span className="text-muted-foreground text-xs block mb-1">Hip</span>
                      <span className="font-medium">{measurements.hip}"</span>
                    </div>
                    <div className="bg-background rounded-lg p-3 border border-border/50">
                      <span className="text-muted-foreground text-xs block mb-1">Length</span>
                      <span className="font-medium">{measurements.pantLength}"</span>
                    </div>
                    <div className="bg-background rounded-lg p-3 border border-border/50">
                      <span className="text-muted-foreground text-xs block mb-1">Thigh</span>
                      <span className="font-medium">{measurements.thigh}"</span>
                    </div>
                    <div className="col-span-2 bg-background rounded-lg p-3 border border-border/50">
                      <span className="text-muted-foreground text-xs block mb-1">Fit Preference</span>
                      <span className="font-medium capitalize">{measurements.fitPreference} Fit</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-primary text-primary-foreground rounded-2xl p-6 flex items-center justify-between mb-8 shadow-inner">
                <div>
                  <span className="block text-primary-foreground/70 text-sm mb-1">Estimated Total</span>
                  <span className="text-xs text-primary-foreground/50">Shipping calculated later</span>
                </div>
                <div className="text-4xl font-serif">
                  {formatPrice(config.estimatedPrice)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setLocation("/customize")}
                  className="px-6 py-4 rounded-xl border border-border font-medium hover:bg-secondary transition-colors text-center"
                  disabled={orderMutation.isPending}
                >
                  <ArrowLeft className="w-4 h-4 mx-auto sm:mx-0" />
                  <span className="sr-only">Back</span>
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={orderMutation.isPending}
                  className="flex-1 py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {orderMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm & Place Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

export default function SummaryPage() {
  return (
    <RequireAuth>
      <SummaryContent />
    </RequireAuth>
  );
}
