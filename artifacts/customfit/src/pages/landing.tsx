import { Layout } from "@/components/layout";
import { AUTH_DISABLED } from "@/hooks/use-auth";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Ruler, CheckCircle, Package } from "lucide-react";

export default function LandingPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              New Fall Collection Available
            </div>
            <h1 className="text-5xl md:text-7xl font-serif leading-[1.1] mb-6 text-balance">
              Tailored to <br/>
              <span className="italic text-muted-foreground">Perfection.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-balance max-w-lg">
              Experience the luxury of custom-made trousers. Premium fabrics, expert craftsmanship, and a fit that's uniquely yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/measure" 
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 group"
              >
                Start Customizing
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={AUTH_DISABLED ? "/dashboard" : "/auth"}
                className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-border bg-white text-foreground font-medium hover:bg-secondary transition-colors"
              >
                Sign In to Account
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-black/5 z-10" />
            <img 
              src={`${import.meta.env.BASE_URL}images/hero-pants.png`} 
              alt="Man wearing perfectly tailored beige trousers" 
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to your perfect pair of pants.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Ruler,
                title: "1. Measure",
                desc: "Follow our simple guide to input your unique body measurements."
              },
              {
                icon: CheckCircle,
                title: "2. Customize",
                desc: "Select your preferred fabric, color, and stylish details."
              },
              {
                icon: Package,
                title: "3. Receive",
                desc: "Your custom trousers arrive at your door in 2-3 weeks."
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center p-8 rounded-3xl bg-background border border-border/50 hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6 text-primary">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fabric Teaser */}
      <section className="py-24 bg-primary text-primary-foreground overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative rounded-2xl overflow-hidden aspect-square md:aspect-[3/4]">
            <img 
              src={`${import.meta.env.BASE_URL}images/fabric-texture.png`} 
              alt="Premium fabric texture" 
              className="w-full h-full object-cover opacity-80 mix-blend-luminosity"
            />
          </div>
          <div className="order-1 md:order-2 max-w-lg">
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Premium Materials, Ethical Sourcing</h2>
            <p className="text-primary-foreground/70 mb-8 text-lg">
              We source only the finest cotton, linen, and blends from sustainable mills. Every thread is chosen for comfort, durability, and a flawless drape.
            </p>
            <ul className="space-y-4 mb-10">
              {['100% Organic Italian Cotton', 'Breathable Summer Linens', '4-Way Stretch Performance Blends'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link 
              href="/measure" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-all hover:-translate-y-1"
            >
              Build Your Pair
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
