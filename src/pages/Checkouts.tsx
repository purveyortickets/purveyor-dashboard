import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import toast from "react-hot-toast";

interface Props {
  logout: () => void;
}

interface Checkout {
  username: string;
  license_key: string;
  event_name: string;
  checkout_url: string;
  payment_method: string;
  timestamp: string;
}

const paymentBadge = (method: string) => {
  const styles: Record<string, string> = {
    "iPay88": "bg-blue-500/20 text-blue-400",
    "GCash": "bg-blue-400/20 text-blue-300",
    "Maya": "bg-green-500/20 text-green-400",
    "MayaCC": "bg-green-600/20 text-green-300",
    "QRPH": "bg-purple-500/20 text-purple-400",
    "GrabPay": "bg-emerald-500/20 text-emerald-400",
    "Unknown": "bg-gray-500/20 text-gray-400",
  };

  const style = styles[method] || styles["Unknown"];

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${style}`}>
      {method || "—"}
    </span>
  );
};

export default function Checkouts({ logout }: Props) {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [search, setSearch] = useState("");

  const fetchCheckouts = async () => {
    try {
      const res = await api.get("/admin/checkouts");
      if (res.data.success) {
        setCheckouts(res.data.data);
      }
    } catch {
      toast.error("Failed to load checkouts");
    }
  };

  useEffect(() => {
    fetchCheckouts();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCheckouts, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = checkouts.filter(
    (c) =>
      c.username.toLowerCase().includes(search.toLowerCase()) ||
      c.event_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.payment_method || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout logout={logout}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Checkouts</h2>
              <p className="text-sm text-gray-400 mt-1">
                Users who reached the checkout / payment page
              </p>
            </div>

            <div className="flex gap-3 items-center">
              <span className="text-sm text-gray-400">
                {filtered.length} records
              </span>

              <input
                placeholder="Search user, event, or payment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition w-64"
              />

              <button
                onClick={fetchCheckouts}
                className="bg-green-600/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-600/30 transition"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
            <table className="w-full">
              <thead className="text-gray-400 border-b border-border">
                <tr>
                  <th className="py-3 text-left">User</th>
                  <th className="text-left">Event</th>
                  <th className="text-left">Payment</th>
                  <th className="text-left">Time</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-gray-500 text-center"
                    >
                      No checkouts recorded yet
                    </td>
                  </tr>
                ) : (
                  filtered.map((checkout, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border hover:bg-gray-800/40 transition"
                    >
                      <td className="py-4 text-left">
                        <div className="font-medium">
                          {checkout.username}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {checkout.license_key.substring(0, 8)}...
                        </div>
                      </td>

                      <td className="text-left">
                        <div className="text-sm">
                          {checkout.event_name || "—"}
                        </div>
                      </td>

                      <td className="text-left">
                        {paymentBadge(checkout.payment_method)}
                      </td>

                      <td className="text-left text-sm text-gray-300">
                        {new Date(
                          checkout.timestamp
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}