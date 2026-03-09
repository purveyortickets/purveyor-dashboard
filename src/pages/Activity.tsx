import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import toast from "react-hot-toast";

interface Props {
  logout: () => void;
}

interface Log {
  action: string;
  username: string;
  details: string;
  timestamp: string;
}

export default function Activity({ logout }: Props) {
  const [logs, setLogs] = useState<Log[]>([]);

  const fetchLogs = async () => {
    try {
      const res = await api.get("/admin/activity");
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
          Admin Activity Logs
        </h2>

        <table className="w-full text-left">
          <thead className="text-gray-400 border-b border-border">
            <tr>
              <th className="py-3">Action</th>
              <th>User</th>
              <th>Details</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr
                key={index}
                className="border-b border-border hover:bg-gray-800/40 transition"
              >
                <td className="py-3 font-semibold">
                  {log.action}
                </td>
                <td>{log.username}</td>
                <td>{log.details}</td>
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