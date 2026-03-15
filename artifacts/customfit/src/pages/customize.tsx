import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { RequireAuth } from "@/hooks/use-auth";
import { OrderInputFabricType, OrderInputPocketStyle, OrderInputOccasion } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { calculatePrice } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";

const FABRICS = [
  { id: OrderInputFabricType.cotton, label: "Pure Cotton", desc: "Breathable, classic, year-round.", basePrice: 89 },
  { id: OrderInputFabricType["stretch-cotton"], label: "Stretch Cotton", desc: "Added mobility and comfort.", basePrice: 99 },
  { id: OrderInputFabricType.linen, label: "Linen Blend", desc: "Lightweight, perfect for warm days.", basePrice: 109 },
];

const COLORS = [
  { id: "black", label: "Midnight Black", hex: "#111111" },
  { id: "navy", label: "Classic Navy", hex: "#1c2841" },
  { id: "charcoal", label: "Charcoal Grey", hex: "#36454F" },
  { id: "beige", label: "Desert Beige", hex: "#E8E4C9" },
  { id: "olive", label: "Olive Green", hex: "#4B5320" },
];

const POCKETS = [
  { id: OrderInputPocketStyle.classic, label: "Classic Slant", price: 0 },
  { id: OrderInputPocketStyle.cargo, label: "Cargo Utility", price: 15 },
  { id: OrderInputPocketStyle["no-pocket"], label: "No Pockets", price: -5 },
];

const OCCASIONS = [
  { id: OrderInputOccasion.casual, label: "Casual Everyday", price: 0 },
  { id: OrderInputOccasion.formal, label: "Formal Evening", price: 10 },
];

function CustomizeContent() {
  const [, setLocation] = useLocation();
  
  // Load state or initialize defaults
  const savedMeasurements = JSON.parse(localStorage.getItem('customfit_measurements') || '{}');
  const savedConfig = JSON.parse(localStorage.getItem('customfit_customization') || '{}');

  useEffect(() => {
    if (!savedMeasurements.id) {
      setLocation("/measure");
    }
  }, [savedMeasurements, setLocation]);

  const [fabric, setFabric] = useState<OrderInputFabricType>(savedConfig.fabricType || OrderInputFabricType.cotton);
  const [color, setColor] = useState<string>(savedConfig.color || "black");
  const [pocket, setPocket] = useState<OrderInputPocketStyle>(savedConfig.pocketStyle || OrderInputPocketStyle.classic);
  const [occasion, setOccasion] = useState<OrderInputOccasion>(savedConfig.occasion || OrderInputOccasion.casual);

  const currentPrice = calculatePrice({
    fabricType: fabric,
    pocketStyle: pocket,
    occasion: occasion
  }, savedMeasurements);

  const handleContinue = () => {
    localStorage.setItem('customfit_customization', JSON.stringify({
      fabricType: fabric,
      color,
      pocketStyle: pocket,
      occasion,
      estimatedPrice: currentPrice
    }));
    setLocation("/summary");
  };

  return (
    <Layout>
      <div className="flex-1 bg-background relative">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-12 text-sm font-medium">
            <span className="w-8 h-8 rounded-full bg-secondary text-primary flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </span>
            <span className="text-muted-foreground">Measurements</span>
            <div className="w-8 h-px bg-border" />
            <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">2</span>
            <span className="text-primary">Customization</span>
            <div className="w-8 h-px bg-border" />
            <span className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">3</span>
            <span className="text-muted-foreground">Review</span>
          </div>

          <div className="mb-12 flex justify-between items-end">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif mb-4">Design Details</h1>
              <p className="text-lg text-muted-foreground">Select materials and styling options.</p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-sm text-muted-foreground block">Estimated Total</span>
              <span className="text-3xl font-serif">{formatPrice(currentPrice)}</span>
            </div>
          </div>

          <div className="space-y-16">
            {/* Fabric */}
            <section>
              <h3 className="text-xl font-medium mb-6">1. Choose Fabric</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {FABRICS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFabric(f.id as OrderInputFabricType)}
                    className={`
                      text-left p-6 rounded-2xl border-2 transition-all
                      ${fabric === f.id ? 'border-primary bg-primary text-primary-foreground shadow-lg' : 'border-border bg-white hover:border-primary/30 hover:shadow-md'}
                    `}
                  >
                    <div className="font-serif text-xl mb-2">{f.label}</div>
                    <div className={`text-sm mb-4 ${fabric === f.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{f.desc}</div>
                    <div className="font-medium text-sm">Base: {formatPrice(f.basePrice)}</div>
                  </button>
                ))}
              </div>
            </section>

            {/* Color */}
            <section>
              <h3 className="text-xl font-medium mb-6 flex items-center justify-between">
                <span>2. Select Color</span>
                <span className="text-muted-foreground font-normal text-sm">{COLORS.find(c => c.id === color)?.label}</span>
              </h3>
              <div className="flex flex-wrap gap-4">
                {COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c.id)}
                    className={`
                      w-16 h-16 rounded-full transition-transform
                      ${color === c.id ? 'ring-4 ring-offset-4 ring-primary scale-110' : 'hover:scale-110 ring-1 ring-border shadow-sm'}
                    `}
                    style={{ backgroundColor: c.hex }}
                    aria-label={c.label}
                  />
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Pocket Style */}
              <section>
                <h3 className="text-xl font-medium mb-6">3. Pocket Style</h3>
                <div className="space-y-3">
                  {POCKETS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPocket(p.id as OrderInputPocketStyle)}
                      className={`
                        w-full flex items-center justify-between p-4 rounded-xl border transition-all
                        ${pocket === p.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-white hover:border-primary/30'}
                      `}
                    >
                      <span className="font-medium">{p.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {p.price > 0 ? `+${formatPrice(p.price)}` : p.price < 0 ? `${formatPrice(p.price)}` : 'Included'}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Occasion */}
              <section>
                <h3 className="text-xl font-medium mb-6">4. Occasion Treatment</h3>
                <div className="space-y-3">
                  {OCCASIONS.map(o => (
                    <button
                      key={o.id}
                      onClick={() => setOccasion(o.id as OrderInputOccasion)}
                      className={`
                        w-full flex items-center justify-between p-4 rounded-xl border transition-all
                        ${occasion === o.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-white hover:border-primary/30'}
                      `}
                    >
                      <span className="font-medium">{o.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {o.price > 0 ? `+${formatPrice(o.price)}` : 'Included'}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex flex-col sm:hidden items-center justify-center p-6 bg-secondary rounded-2xl">
               <span className="text-sm text-muted-foreground mb-1">Estimated Total</span>
               <span className="text-3xl font-serif">{formatPrice(currentPrice)}</span>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-border">
              <button 
                onClick={() => setLocation("/measure")}
                className="inline-flex items-center px-6 py-3 rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>
              
              <button
                onClick={handleContinue}
                className="inline-flex items-center px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Review Order <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function CustomizePage() {
  return (
    <RequireAuth>
      <CustomizeContent />
    </RequireAuth>
  );
}
