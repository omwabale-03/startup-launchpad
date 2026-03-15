import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { RequireAuth, getAuthHeaders } from "@/hooks/use-auth";
import { useSaveMeasurements, MeasurementInputFitPreference } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Ruler, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FIT_OPTIONS = [
  { id: MeasurementInputFitPreference.slim, label: "Slim Fit", desc: "Tapered closer to the leg for a modern, sharp silhouette." },
  { id: MeasurementInputFitPreference.regular, label: "Regular Fit", desc: "Straight cut through the leg, classic and comfortable." },
  { id: MeasurementInputFitPreference.relaxed, label: "Relaxed Fit", desc: "More room through the seat and thigh for maximum ease." },
];

function MeasureContent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Try to load existing measurements from localStorage
  const saved = JSON.parse(localStorage.getItem('customfit_measurements') || '{}');

  const [waist, setWaist] = useState<string>(saved.waist?.toString() || "");
  const [hip, setHip] = useState<string>(saved.hip?.toString() || "");
  const [pantLength, setPantLength] = useState<string>(saved.pantLength?.toString() || "");
  const [thigh, setThigh] = useState<string>(saved.thigh?.toString() || "");
  const [fit, setFit] = useState<MeasurementInputFitPreference>(
    saved.fitPreference || MeasurementInputFitPreference.regular
  );

  const saveMutation = useSaveMeasurements({
    request: getAuthHeaders(),
    mutation: {
      onSuccess: (data) => {
        // Save ID and data for next steps
        localStorage.setItem('customfit_measurements', JSON.stringify(data));
        setLocation("/customize");
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Error saving measurements",
          description: err.data?.error || "Please try again.",
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      waist: Number(waist),
      hip: Number(hip),
      pantLength: Number(pantLength),
      thigh: Number(thigh),
      fitPreference: fit,
    };
    saveMutation.mutate({ data: payload });
  };

  const isComplete = waist && hip && pantLength && thigh && fit;

  return (
    <Layout>
      <div className="flex-1 bg-background relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
          <div className="flex items-center gap-4 mb-12 text-sm font-medium">
            <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">1</span>
            <span className="text-primary">Measurements</span>
            <div className="w-8 h-px bg-border" />
            <span className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">2</span>
            <span className="text-muted-foreground">Customization</span>
            <div className="w-8 h-px bg-border" />
            <span className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">3</span>
            <span className="text-muted-foreground">Review</span>
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-serif mb-4">Your Measurements</h1>
            <p className="text-lg text-muted-foreground max-w-2xl text-balance">
              Provide your measurements in inches. Grab a measuring tape and follow our simple guides for the perfect fit.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Form Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex justify-between">
                    <span>Waist (inches)</span>
                  </label>
                  <input
                    type="number" step="0.1" min="20" max="60"
                    value={waist} onChange={e => setWaist(e.target.value)}
                    className="w-full px-5 py-4 text-lg rounded-xl bg-white border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
                    placeholder="e.g. 32" required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hip (inches)</label>
                  <input
                    type="number" step="0.1" min="20" max="70"
                    value={hip} onChange={e => setHip(e.target.value)}
                    className="w-full px-5 py-4 text-lg rounded-xl bg-white border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
                    placeholder="e.g. 38" required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Outseam / Length (inches)</label>
                  <input
                    type="number" step="0.1" min="20" max="50"
                    value={pantLength} onChange={e => setPantLength(e.target.value)}
                    className="w-full px-5 py-4 text-lg rounded-xl bg-white border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
                    placeholder="e.g. 40" required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Thigh (inches)</label>
                  <input
                    type="number" step="0.1" min="10" max="40"
                    value={thigh} onChange={e => setThigh(e.target.value)}
                    className="w-full px-5 py-4 text-lg rounded-xl bg-white border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
                    placeholder="e.g. 22" required
                  />
                </div>
              </div>

              {/* Fit Preference */}
              <div>
                <label className="text-sm font-medium block mb-4">Desired Fit Profile</label>
                <div className="space-y-4">
                  {FIT_OPTIONS.map(option => (
                    <label 
                      key={option.id}
                      className={`
                        relative flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all
                        ${fit === option.id 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-border bg-white hover:border-primary/40 hover:bg-secondary/50'
                        }
                      `}
                    >
                      <input 
                        type="radio" name="fit" value={option.id} 
                        checked={fit === option.id}
                        onChange={() => setFit(option.id)}
                        className="sr-only"
                      />
                      <span className="font-serif text-xl mb-1">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.desc}</span>
                      
                      {fit === option.id && (
                        <motion.div layoutId="fit-check" className="absolute top-5 right-5 w-4 h-4 rounded-full bg-primary" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-border">
              <button 
                type="button" 
                onClick={() => setLocation("/dashboard")}
                className="inline-flex items-center px-6 py-3 rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
              </button>
              
              <button
                type="submit"
                disabled={!isComplete || saveMutation.isPending}
                className="inline-flex items-center px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Save & Continue"}
                {!saveMutation.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default function MeasurePage() {
  return (
    <RequireAuth>
      <MeasureContent />
    </RequireAuth>
  );
}
