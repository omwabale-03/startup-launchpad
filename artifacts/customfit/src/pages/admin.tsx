import { useState } from "react";
import { Layout } from "@/components/layout";
import { RequireAuth, useAuth, getAuthHeaders } from "@/hooks/use-auth";
import { useAdminGetOrders, useAdminGetUsers, useAdminGetMeasurements } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";
import { Loader2, Users, Package, Ruler, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function AdminContent() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"orders" | "users" | "measurements">("orders");
  const [search, setSearch] = useState("");

  const reqConfig = { request: getAuthHeaders() };
  
  const { data: orders, isLoading: loadingOrders } = useAdminGetOrders(reqConfig);
  const { data: users, isLoading: loadingUsers } = useAdminGetUsers(reqConfig);
  const { data: measurements, isLoading: loadingMeasurements } = useAdminGetMeasurements(reqConfig);

  if (!user?.isAdmin) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-serif text-destructive mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You do not have administrative privileges.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 bg-background py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-serif mb-2">Admin Control Panel</h1>
              <p className="text-muted-foreground">Manage orders, users, and measurements across the platform.</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border border-border bg-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-64"
              />
            </div>
          </header>

          <div className="flex gap-2 mb-8 border-b border-border">
            <button 
              onClick={() => setTab("orders")}
              className={`pb-4 px-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${tab === "orders" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <Package className="w-4 h-4" /> Orders
            </button>
            <button 
              onClick={() => setTab("users")}
              className={`pb-4 px-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${tab === "users" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <Users className="w-4 h-4" /> Users
            </button>
            <button 
              onClick={() => setTab("measurements")}
              className={`pb-4 px-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${tab === "measurements" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <Ruler className="w-4 h-4" /> Measurements
            </button>
          </div>

          <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
            <AnimatePresence mode="wait">
              {tab === "orders" && (
                <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {loadingOrders ? (
                    <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
                          <tr>
                            <th className="px-6 py-4 font-medium">Order ID</th>
                            <th className="px-6 py-4 font-medium">Customer (Phone)</th>
                            <th className="px-6 py-4 font-medium">Specs</th>
                            <th className="px-6 py-4 font-medium">Price</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {orders?.filter(o => !search || o.user?.phone.includes(search) || o.id.toString().includes(search)).map((order) => (
                            <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                              <td className="px-6 py-4 font-medium">#{order.id.toString().padStart(4, '0')}</td>
                              <td className="px-6 py-4">{order.user?.phone || 'Unknown'}</td>
                              <td className="px-6 py-4 capitalize text-muted-foreground">
                                {order.fabricType}, {order.color}
                              </td>
                              <td className="px-6 py-4">{formatPrice(order.estimatedPrice)}</td>
                              <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-foreground capitalize">
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {(!orders || orders.length === 0) && (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No orders found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {tab === "users" && (
                <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {loadingUsers ? (
                    <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
                          <tr>
                            <th className="px-6 py-4 font-medium">ID</th>
                            <th className="px-6 py-4 font-medium">Phone</th>
                            <th className="px-6 py-4 font-medium">Joined</th>
                            <th className="px-6 py-4 font-medium">Role</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {users?.filter(u => !search || u.phone.includes(search)).map((u) => (
                            <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                              <td className="px-6 py-4 font-medium">#{u.id}</td>
                              <td className="px-6 py-4">{u.phone}</td>
                              <td className="px-6 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="px-6 py-4">
                                {u.isAdmin ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Admin</span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-foreground">Customer</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {tab === "measurements" && (
                <motion.div key="measurements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {loadingMeasurements ? (
                    <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
                          <tr>
                            <th className="px-6 py-4 font-medium">User</th>
                            <th className="px-6 py-4 font-medium">Waist</th>
                            <th className="px-6 py-4 font-medium">Hip</th>
                            <th className="px-6 py-4 font-medium">Length</th>
                            <th className="px-6 py-4 font-medium">Thigh</th>
                            <th className="px-6 py-4 font-medium">Fit</th>
                            <th className="px-6 py-4 font-medium">Last Updated</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {measurements?.filter(m => !search || m.user?.phone.includes(search)).map((m) => (
                            <tr key={m.id} className="hover:bg-secondary/20 transition-colors">
                              <td className="px-6 py-4 font-medium">{m.user?.phone || `ID: ${m.userId}`}</td>
                              <td className="px-6 py-4">{m.waist}"</td>
                              <td className="px-6 py-4">{m.hip}"</td>
                              <td className="px-6 py-4">{m.pantLength}"</td>
                              <td className="px-6 py-4">{m.thigh}"</td>
                              <td className="px-6 py-4 capitalize">{m.fitPreference}</td>
                              <td className="px-6 py-4 text-muted-foreground">{new Date(m.updatedAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth>
      <AdminContent />
    </RequireAuth>
  );
}
