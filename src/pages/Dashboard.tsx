import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

interface Props {
  logout: () => void;
}

interface Device {
  hwid: string;
  ip_address: string;
  last_seen: string;
}

interface User {
  id: number;
  username: string;
  active: boolean;
  max_devices: number;
  devices?: Device[];
  expires_at: string;
}

interface Activity {
  action: string;
  username: string;
  details: string;
  timestamp: string;
}

export default function Dashboard({ logout }: Props) {

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);

  // PHASE 5 STATE
  const [queueUrl, setQueueUrl] = useState("");
  const [injectLoading, setInjectLoading] = useState(false);

  const loadData = async () => {

    try {

      const statsRes = await api.get("/admin/stats");

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      const usersRes = await api.get("/admin/users");

      if (usersRes.data.success) {

        const list = usersRes.data.data;

        setUsers(list.slice(0, 5));

        let allDevices: Device[] = [];

        list.forEach((u: User) => {

          if (u.devices) {
            u.devices.forEach(d => allDevices.push(d));
          }

        });

        allDevices.sort(
          (a, b) =>
            new Date(b.last_seen).getTime() -
            new Date(a.last_seen).getTime()
        );

        setDevices(allDevices.slice(0, 5));

      }

      const actRes = await api.get("/admin/activity");

      if (actRes.data.success) {
        setActivity(actRes.data.data.slice(0, 5));
      }

    } catch (err) {
      console.error("Dashboard load error:", err);
    }

  };

  // PHASE 5 FUNCTION
  const injectToken = async () => {

    if (!queueUrl.trim()) {
      alert("Paste a Queue-It URL");
      return;
    }

    try {

      setInjectLoading(true);

      const res = await api.post("/admin/inject_token", {
        url: queueUrl
      });

      if (res.data.success) {

        alert("Token injected successfully");

        setQueueUrl("");

      } else {

        alert(res.data.error || "Injection failed");

      }

    } catch (err) {

      console.error("Injection error:", err);
      alert("Injection failed");

    } finally {

      setInjectLoading(false);

    }

  };

  useEffect(() => {

    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);

  }, []);

  if (!stats) return null;

  return (

    <DashboardLayout logout={logout}>

      <div className="space-y-8">

        {/* STAT CARDS */}

        <div className="grid grid-cols-4 gap-6">

          <div className="bg-card border border-red-500/20 rounded-xl p-6 shadow-lg shadow-red-500/10 hover:scale-[1.03] hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-500/20 p-2 rounded-lg text-lg">👥</div>
              <div className="text-sm text-gray-400">Total Users</div>
            </div>
            <div className="text-3xl font-bold">{stats.total_users}</div>
          </div>

          <div className="bg-card border border-green-500/20 rounded-xl p-6 shadow-lg shadow-green-500/10 hover:scale-[1.03] hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-500/20 p-2 rounded-lg text-lg">🛡</div>
              <div className="text-sm text-gray-400">Licensed Users</div>
            </div>
            <div className="text-3xl font-bold">{stats.active_users}</div>
          </div>

          <div className="bg-card border border-yellow-500/20 rounded-xl p-6 shadow-lg shadow-yellow-500/10 hover:scale-[1.03] hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-500/20 p-2 rounded-lg text-lg">💻</div>
              <div className="text-sm text-gray-400">Active Devices</div>
            </div>
            <div className="text-3xl font-bold">{stats.total_devices}</div>
          </div>

          <div className="bg-card border border-purple-500/20 rounded-xl p-6 shadow-lg shadow-purple-500/10 hover:scale-[1.03] hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-500/20 p-2 rounded-lg text-lg">🔑</div>
              <div className="text-sm text-gray-400">Active Sessions</div>
            </div>
            <div className="text-3xl font-bold">{stats.total_devices}</div>
          </div>

        </div>

        {/* SECOND ROW */}

        <div className="grid grid-cols-3 gap-6">

          {/* RECENT USERS */}

          <div className="col-span-2 bg-card border border-border rounded-xl p-6 shadow-lg">

            <h2 className="font-semibold mb-4">Recent Users</h2>

            <table className="w-full text-sm">

              <thead className="text-gray-400">
                <tr>
                  <th className="text-left">User</th>
                  <th>Status</th>
                  <th>Devices</th>
                  <th>Joined</th>
                </tr>
              </thead>

              <tbody>

                {users.map(user => (

                  <tr key={user.id} className="border-t border-border">

                    <td className="py-3">{user.username}</td>

                    <td className="text-center">

                      <span className={`px-2 py-1 rounded text-xs ${
                        user.active
                          ? "bg-green-900 text-green-400"
                          : "bg-red-900 text-red-400"
                      }`}>

                        {user.active ? "Active" : "Disabled"}

                      </span>

                    </td>

                    <td className="text-center">
                      {user.devices?.length || 0}/{user.max_devices}
                    </td>

                    <td className="text-center">
                      {new Date(user.expires_at).toLocaleDateString()}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* QUICK ACTIONS */}

          <div className="bg-card border border-border rounded-xl p-6 shadow-lg space-y-4">

            <h2 className="font-semibold">Quick Actions</h2>

            <button
              onClick={() => location.href = "/users"}
              className="w-full border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition rounded-lg p-3"
            >
              Manage Users
            </button>

            <button
              onClick={() => location.href = "/logs"}
              className="w-full border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition rounded-lg p-3"
            >
              Token Logs
            </button>

            {/* PHASE 5 EMERGENCY TOKEN INJECTION */}

            <div className="border-t border-border pt-4 space-y-3">

              <div className="text-sm text-gray-400">
                Emergency Token Injection
              </div>

              <input
                type="text"
                placeholder="Paste Queue-It URL"
                value={queueUrl}
                onChange={(e) => setQueueUrl(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm"
              />

              <button
                onClick={injectToken}
                disabled={injectLoading}
                className="w-full bg-red-600 hover:bg-red-500 transition rounded-lg p-2 text-sm font-semibold"
              >
                {injectLoading ? "Injecting..." : "Inject Token"}
              </button>

            </div>

          </div>

        </div>

        {/* THIRD ROW */}

        <div className="grid grid-cols-2 gap-6">

          {/* ACTIVITY FEED */}

          <div className="bg-card border border-border rounded-xl p-6 shadow-lg">

            <h2 className="font-semibold mb-4">Activity Feed</h2>

            <div className="space-y-3">

              {activity.map((a, i) => (

                <div
                  key={i}
                  className="flex justify-between bg-gray-800 rounded p-3 hover:bg-gray-700 transition"
                >

                  <div>

                    <div className="text-sm font-medium">
                      {a.action}
                    </div>

                    <div className="text-xs text-gray-400">
                      {a.username}
                    </div>

                  </div>

                  <div className="text-xs text-gray-400">
                    {new Date(a.timestamp).toLocaleString()}
                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* RECENT DEVICES */}

          <div className="bg-card border border-border rounded-xl p-6 shadow-lg">

            <h2 className="font-semibold mb-4">Recent Devices</h2>

            <div className="space-y-3">

              {devices.map((d, i) => (

                <div
                  key={i}
                  className="bg-gray-800 rounded p-3 text-sm hover:bg-gray-700 transition"
                >

                  <div className="font-mono">{d.hwid}</div>

                  <div className="text-xs text-gray-400">{d.ip_address}</div>

                  <div className="text-xs text-gray-500">
                    {new Date(d.last_seen).toLocaleString()}
                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>

  );

}