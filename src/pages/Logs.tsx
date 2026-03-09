import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import toast from "react-hot-toast";

interface Props {
  logout: () => void;
}

interface Log {
  event_name: string;
  timestamp: string;
}

export default function Logs({ logout }: Props) {
  const [logs, setLogs] = useState<Log[]>([]);

  const fetchLogs = async () => {
    try {
      const res = await api.get("/admin/logs");
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch {
      toast.error("Failed to load logs");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <DashboardLayout logout={logout}>
      <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-semibold mb-6">
          QueueIt Token Logs
        </h2>

        <table className="w-full text-left">
          <thead className="text-gray-400 border-b border-border">
            <tr>
              <th className="py-3">Event</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr
                key={index}
                className="border-b border-border hover:bg-gray-800/40 transition"
              >
                <td className="py-3">{log.event_name}</td>
                <td>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}