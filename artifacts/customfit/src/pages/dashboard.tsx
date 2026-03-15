import { Layout } from "@/components/layout";
import { RequireAuth, useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { useGetOrders } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, PackageOpen, ChevronRight, Clock, Ruler } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";

function DashboardContent() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useGetOrders({
    request: getAuthHeaders()
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 py-16">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif mb-2">Your Wardrobe</h1>
            <p className="text-muted-foreground">Welcome back, {user?.phone}. Manage your custom orders here.</p>
          </div>
          <Link 
            href="/measure" 
            className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all hover:shadow-lg shadow-black/10 group"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Pants
          </Link>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="bg-white border border-dashed border-border rounded-3xl p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6 text-muted-foreground">
              <PackageOpen className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif mb-3">No orders yet</h3>
            <p className="text-muted-foreground max-w-md mb-8">
              Your custom wardrobe is empty. Start by taking your measurements and designing your first pair of perfect trousers.
            </p>
            <Link 
              href="/measure" 
              className="px-8 py-3 rounded-full border-2 border-primary font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Start Designing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={order.id}
                className="bg-white border border-border rounded-2xl p-6 hover:shadow-xl transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="inline-block px-3 py-1 bg-secondary text-xs font-medium rounded-full mb-3 uppercase tracking-wider">
                      {order.status}
                    </span>
                    <h3 className="text-xl font-serif capitalize">{order.color} {order.fabricType.replace('-', ' ')}</h3>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-lg font-medium">
                    {formatPrice(order.estimatedPrice)}
                  </div>
                </div>

                <div className="bg-background rounded-xl p-4 mb-6 grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Occasion</span>
                    <span className="capitalize">{order.occasion}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Pockets</span>
                    <span className="capitalize">{order.pocketStyle.replace('-', ' ')}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-border mt-1">
                    <span className="text-muted-foreground text-xs block mb-1 flex items-center gap-1">
                      <Ruler className="w-3 h-3" /> Fit Profile
                    </span>
                    <span className="capitalize">{order.measurement?.fitPreference || 'Standard'} Fit</span>
                  </div>
                </div>

                <button className="mt-auto w-full py-3 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-2 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  View Details <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function Dashboard() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
